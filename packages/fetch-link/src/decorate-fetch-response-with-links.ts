import {decorateFetchResponse} from '@windyroad/decorate-fetch-response';
import {isJsonContent} from '@windyroad/fetch-fragment';
import {
	type AwaitedFetchReturns,
	type FetchInputs,
} from '@windyroad/wrap-fetch';
import LinkHeader from 'http-link-header';
import uriTemplate from 'uri-templates';
import {JsonPointer} from 'json-ptr';
import {findMatchingFragments} from './find-matching-fragments';
import {getBody, type ResponseBodyState} from './get-body';
import {isFragmentOf} from './is-fragment-of';
import {type Link, type Fragment} from './link';
import {type LinkedResponse} from './linked-response';
import {resolveLinkUrls} from './resolve-link-urls';

/**
 * Decorates a fetch implementation with a `links` method that returns an array of RFC8288 Link objects.
 * @template FetchInputs The input types of the fetch implementation.
 * @template FetchReturns The return type of the fetch implementation.
 * @param fetchImpl The fetch implementation to decorate.
 * @returns The decorated fetch implementation.
 */
export function decorateFetchResponseWithLinks<
	FetchImpl extends (
		...arguments_: any[]
	) => Promise<
		Pick<Response, 'headers' | 'json' | 'clone' | 'url'>
	> = typeof fetch,
>(
	fetchImpl?: FetchImpl,
): (
	...arguments_: FetchInputs<FetchImpl>
) => Promise<LinkedResponse<AwaitedFetchReturns<FetchImpl>>> {
	return decorateFetchResponse(async (response) => {
		const linkHeader = new LinkHeader();
		linkHeader.parse(response?.headers?.get('link') ?? '');
		linkHeader.parse(response?.headers?.get('link-template') ?? '');
		const resolvedLinks = resolveLinkUrls({
			links: linkHeader.refs,
			baseUrl: response.url,
		});
		let responseBodyState: ResponseBodyState<FetchImpl> = {
			originalResponse: response,
		};

		let links: Link[];

		if (isJsonContent(response)) {
			const responseUrl = new URL(response.url);
			const resolvedLinksAreHashed = resolvedLinks.map((urlAndLink) => {
				const {url, link} = urlAndLink;
				if (isFragmentOf(url, responseUrl)) {
					/**
					 * See if the hash is a template and if so, generate the range of
					 * matching hashes and add them to the links array
					 */
					const hashTemplate = uriTemplate(url.hash);
					return {url, link, isTemplatedHash: hashTemplate.varNames.length};
				}

				return {url, link, isTemplatedHash: false};
			});
			if (
				resolvedLinksAreHashed.some((urlAndLink) => urlAndLink.isTemplatedHash)
			) {
				responseBodyState = await getBody(responseBodyState);
			}

			links = resolvedLinksAreHashed.flatMap<Link>((urlAndLink) => {
				const {url, link, isTemplatedHash} = urlAndLink;
				if (isTemplatedHash) {
					const {jsonBody} = responseBodyState;
					const matches = findMatchingFragments(jsonBody, url.hash);
					const templatedLinks = matches.map((match) => {
						return matchToLink(link, url, match);
					});
					return templatedLinks;
				}

				return link;
			});
		} else {
			links = resolvedLinks.map((urlAndLink) => urlAndLink.link);
		}

		return Object.assign(
			responseBodyState.clonedResponse ?? responseBodyState.originalResponse,
			{
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
	}, fetchImpl);
}

/**
 * Converts a Link object and a URL to a FragmentLink object by filling in the URI template with the variables from the Fragment.
 * @param {Link} link - The Link object to convert.
 * @param {URL} url - The URL object to use for filling in the URI template.
 * @param {Fragment} match - The Fragment object containing the variables to use for filling in the URI template.
 * @returns {Link} The resulting FragmentLink object.
 */
function matchToLink(link: Link, url: URL, match: Fragment): Link {
	return {
		...link,
		uri: new URL(match.path, url).href,
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
