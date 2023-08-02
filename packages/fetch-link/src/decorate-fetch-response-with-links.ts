import {decorateFetchResponse} from '@windyroad/decorate-fetch-response';
import {isJsonContent} from '@windyroad/fetch-fragment';
import {
	type AwaitedFetchReturns,
	type FetchInputs,
} from '@windyroad/wrap-fetch';
import LinkHeader from 'http-link-header';
import uriTemplate from 'uri-templates';
import {JsonPointer, JsonStringPointer} from 'json-ptr';
import {
	getBody,
	InitialResponseBodyState,
	type ClonedResponseBodyState,
	type ResponseBodyState,
} from './get-body';
import {type Link} from './link';
import {type LinkedResponse} from './linked-response';
import {resolveLinkUrls} from './resolve-link-urls';
import {findMatchingFragments} from './find-matching-fragments';
import {isFragmentOf} from './is-fragment-of';

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
		let resolvedLinks = resolveLinkUrls({
			links: linkHeader.refs,
			baseUrl: response.url,
		});
		let responseBodyState: ResponseBodyState<FetchImpl> = {
			originalResponse: response,
		};
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

			resolvedLinks = resolvedLinksAreHashed.flatMap<{
				url: URL;
				link: Link;
			}>((urlAndLink) => {
				const {url, link, isTemplatedHash} = urlAndLink;
				if (isTemplatedHash) {
					const {jsonBody} = responseBodyState;
					const matches = findMatchingFragments(jsonBody, url.hash);
					return matches.map((match) => {
						const matchUrl = new URL(match.path, response.url);
						return {
							url: matchUrl,
							link: {
								...link,
								uri: matchUrl.href,
								...(link.anchor && {
									anchor: uriTemplate(link.anchor).fillFromObject(
										match.variables,
									),
								}),
							},
						};
					});
				}

				return {url, link};
			});
		}

		const links = resolvedLinks.map((urlAndLink) => urlAndLink.link);

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
