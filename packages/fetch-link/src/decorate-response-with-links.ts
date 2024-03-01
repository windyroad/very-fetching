import {
	FragmentResponse,
	isJsonContent,
	getUrlFragment,
} from '@windyroad/fetch-fragment';
import {LinkHeader, type Link} from '@windyroad/link-header';
import uriTemplate from 'uri-templates';
import {findMatchingFragments} from './find-matching-fragments.js';
import {getBody, type ResponseBodyState} from './get-body.js';
import {isFragmentOf} from './is-fragment-of.js';
import {type LinkedResponse} from './linked-response.js';
import {type FragmentLink, type Fragment} from './fragment.js';
import {resolveUrl} from './resolve-url.js';
import {matchToLink} from './match-to-link.js';
import {fillLinks} from './fill-links.js';
import {filterLinks} from './filter-links.js';

/**
 * Decorates a fetch response object with link headers.
 * @template ResponseType - The type of the fetch response object to decorate.
 * @param {ResponseType} response - The fetch response object to decorate.
 * @returns {Promise<LinkedResponse<ResponseType>>} A decorated fetch response object with link headers.
 */
export async function decorateResponseWithLinks<
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
