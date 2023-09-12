import {decorateFetchResponse} from '@windyroad/decorate-fetch-response';
import {
	FragmentResponse,
	isJsonContent,
	getUrlFragment,
} from '@windyroad/fetch-fragment';
import {
	type FetchFunction,
	type AwaitedFetchReturns,
} from '@windyroad/wrap-fetch';
import {LinkHeader, type Link} from '@windyroad/link-header';
import uriTemplate from 'uri-templates';
import {JsonPointer} from 'json-ptr';
import {findMatchingFragments} from './find-matching-fragments.js';
import {getBody, type ResponseBodyState} from './get-body.js';
import {isFragmentOf} from './is-fragment-of.js';
import {type LinkedResponse} from './linked-response.js';
import {resolveLinkUrls} from './resolve-link-urls.js';
import {type FragmentLink, type Fragment} from './fragment.js';
import {resolveUrl} from './resolve-url.js';

/**
 * Decorates a `fetch`-like function with link parsing and resolution functionality.
 * @template Arguments - The parameters type of the `fetch`-like function to decorate.
 * @template ResponseType - The awaited response type of the `fetch`-like function to decorate.
 * @param fetchImpl - The `fetch`-like function to decorate.
 * @returns - A decorated `fetch`-like function that returns a `LinkedResponse`.
 */
export function decorateFetchResponseWithLinks<
	Arguments extends any[] = Parameters<typeof fetch>,
	ResponseType extends Response = Response,
>(
	fetchImpl?: FetchFunction<Arguments, ResponseType>,
): (...arguments_: Arguments) => Promise<LinkedResponse<ResponseType>> {
	return decorateFetchResponse(decorateResponseWithLinks, fetchImpl);
}

/**
 * Converts a `Link` object and a `URL` to a `FragmentLink` object by filling in the URI template with the variables from the `Fragment`.
 * @param {object} options - The options object.
 * @param {Link} options.link - The `Link` object to convert.
 * @param {URL} options.templatedHash - The templated Hash of the link
 * @param {Fragment} options.match - The `Fragment` object containing the variables to use for filling in the URI template.
 * @returns {Link} - The resulting `FragmentLink` object.
 */
function matchToLink({
	link,
	templatedHash,
	match,
}: {
	link: Link;
	templatedHash: string;
	match: Fragment;
}): FragmentLink {
	return {
		...link,
		uri: link.uri.replace(templatedHash, match.path),
		...(link.anchor && {
			anchor: interpolateAnchor(link.anchor, match),
		}),
		fragment: match,
	};
}

/**
 * Interpolates the given anchor with the variables from the given match object.
 * @param {string} anchor - The anchor to interpolate.
 * @param {Fragment} match - The match object containing the variables to interpolate.
 * @returns {string} - The interpolated anchor.
 */
function interpolateAnchor(anchor: string, match: Fragment): string {
	const segments = JsonPointer.decode(anchor);
	const interpolatedSegments = segments.map((segment) => {
		if (
			typeof segment === 'string' &&
			segment.startsWith('{') &&
			segment.endsWith('}')
		) {
			const variableName = segment.slice(1, -1);
			if (Object.prototype.hasOwnProperty.call(match.variables, variableName)) {
				return match.variables[variableName];
			}
		}

		return segment;
	});
	return JsonPointer.create(interpolatedSegments).uriFragmentIdentifier;
}

/**
 * Fills URI templates in an array of links with parameters.
 * @param options - The options object.
 * @param options.parameters - The parameters to fill the URI templates with.
 * @param options.links - The array of links to fill.
 */
function fillLinks({
	parameters,
	links,
}: {
	parameters: Record<string, string | Record<string, string>> | undefined;
	links: Link[];
}) {
	if (parameters) {
		for (const link of links) {
			link.uri = uriTemplate(link.uri).fillFromObject(parameters);
		}
	}
}

/**
 * Filters the links in a LinkHeader based on a filter object or string.
 * @param options - The options object.
 * @param options.filter - The filter to apply to the links.
 * @param options.links - The links to filter.
 * @returns An array of filtered links.
 */
function filterLinks({
	filter,
	links,
}: {
	filter: string | Partial<Link> | undefined;
	links: Link[];
}) {
	return filter
		? links.filter((link) => {
				if (typeof filter === 'string') {
					return link.rel === filter;
				}

				for (const key in filter) {
					if (filter[key] !== link[key]) {
						return false;
					}
				}

				return true;
		  })
		: links;
}

/**
 * Decorates a fetch response object with link headers.
 * @template ResponseType - The type of the fetch response object to decorate.
 * @param {ResponseType} response - The fetch response object to decorate.
 * @returns {Promise<LinkedResponse<ResponseType>>} A decorated fetch response object with link headers.
 */
async function decorateResponseWithLinks<
	ResponseType extends Response = Response,
>(response: ResponseType): Promise<LinkedResponse<ResponseType>> {
	const linkHeader = new LinkHeader(response?.headers?.get('link') ?? '');
	linkHeader.parse(response?.headers?.get('link-template') ?? '');
	// Can't resolvedLinks, because response.url might be relative or undefined
	// const resolvedLinks = resolveLinkUrls({
	// 	links: linkHeader.refs,
	// 	baseUrl: response.url,
	// });
	let responseBodyState: ResponseBodyState<ResponseType> = {
		originalResponse: response,
	};

	let links: Array<Link | FragmentLink>;

	if (isJsonContent(response)) {
		const linksAreHashed = linkHeader.refs.map<
			| {
					link: Link;
					hash: string;
					isTemplatedHash: boolean;
			  }
			| {
					link: Link;
					isTemplatedHash: false;
			  }
		>(
			(
				link: Link,
			):
				| {
						link: Link;
						hash: string;
						isTemplatedHash: boolean;
				  }
				| {
						link: Link;
						isTemplatedHash: false;
				  } => {
				const url = link.uri;
				const hash = getUrlFragment(url);
				if (
					hash &&
					isFragmentOf({
						urlToCheck: url,
						urlToCompare: response.url,
					})
				) {
					/**
					 * See if the hash is a template and if so, generate the range of
					 * matching hashes and add them to the links array
					 */
					const hashTemplate = uriTemplate(hash);
					return {
						link,
						hash,
						isTemplatedHash: hashTemplate.varNames.length > 0,
					};
				}

				return {link, isTemplatedHash: false};
			},
		);

		// If the links are templated hashes, then we'll need to iterated
		// over the matching parts of the body, but we still want the body
		// to be readable, so we'll clone the response, read the body from
		// the original and return the clone
		if (linksAreHashed.some((urlAndLink) => urlAndLink.isTemplatedHash)) {
			responseBodyState = await getBody(responseBodyState);
		}

		links = linksAreHashed.flatMap<FragmentLink | Link>(
			(
				urlAndLink:
					| {
							link: Link;
							hash: string;
							isTemplatedHash: boolean;
					  }
					| {
							link: Link;
							isTemplatedHash: false;
					  },
			): FragmentLink | FragmentLink[] | Link => {
				const {link, isTemplatedHash} = urlAndLink;
				if (isTemplatedHash) {
					const {jsonBody} = responseBodyState;
					const matches = findMatchingFragments(jsonBody, urlAndLink.hash);
					const templatedLinks = matches.map(
						(match: Fragment): FragmentLink => {
							return matchToLink({link, templatedHash: urlAndLink.hash, match});
						},
					);
					return templatedLinks;
				}

				return link;
			},
		);
	} else {
		// Not json content
		links = linkHeader.refs;
	}

	if (response instanceof FragmentResponse && response.parent) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const parent = await decorateResponseWithLinks(response.parent);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return Object.assign(
			responseBodyState.clonedResponse ?? responseBodyState.originalResponse,
			{
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				...(parent && {parent}),
				links(
					filter?: Partial<Link> | string,
					parameters?: Record<string, string | Record<string, string>>,
				): Link[] {
					const filtered = filterLinks({filter, links});
					fillLinks({parameters, links: filtered});
					return filtered;
				},
			},
		);
	}

	return Object.assign(
		responseBodyState.clonedResponse ?? responseBodyState.originalResponse,
		{
			links(
				filter?: Partial<Link> | string,
				parameters?: Record<string, string | Record<string, string>>,
			): Link[] {
				const filtered = filterLinks({filter, links}).map((link) => {
					return {
						...link,
						uri: resolveUrl({url: link.uri, baseUrl: response.url}),
					};
				});
				fillLinks({parameters, links: filtered});
				return filtered;
			},
		},
	);
}
