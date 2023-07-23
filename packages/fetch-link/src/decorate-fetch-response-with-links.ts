import {decorateFetchResponse} from '@windyroad/decorate-fetch-response';
import LinkHeader from 'http-link-header';
import {
	type AwaitedFetchReturns,
	type FetchInputs,
} from '@windyroad/wrap-fetch';
import uriTemplate from 'uri-templates';
import {type Link} from './link.js';
import {type LinkedResponse} from './linked-response.js';

/**
 * Decorates a fetch implementation with a `links` method that returns an array of RFC8288 Link objects.
 * @template FetchInputs The input types of the fetch implementation.
 * @template FetchReturns The return type of the fetch implementation.
 * @param fetchImpl The fetch implementation to decorate.
 * @returns The decorated fetch implementation.
 */
export function decorateFetchResponseWithLinks<
	FetchImpl extends (
		...args: any[]
	) => Promise<Pick<Response, 'headers'>> = typeof fetch,
>(
	fetchImpl?: FetchImpl,
): (
	...args: FetchInputs<FetchImpl>
) => Promise<LinkedResponse<AwaitedFetchReturns<FetchImpl>>> {
	return decorateFetchResponse(async (response) => {
		const linkHeader = new LinkHeader();
		linkHeader.parse(response?.headers?.get('link') ?? '');
		linkHeader.parse(response?.headers?.get('link-template') ?? '');
		return Object.assign(response, {
			links(
				filter?: Partial<Link> | string,
				parameters?: Record<string, string | Record<string, string>>,
			): Link[] {
				const links = filterLinks({filter, linkHeader});
				fillLinks({parameters, links});

				return links;
			},
		});
	}, fetchImpl);
}

/**
 * Fills URI templates in an array of links with parameters.
 * @param {object} options - The options object.
 * @param {Record<string, string|Record<string, string>>} options.parameters - The parameters to fill the URI templates with.
 * @param {LinkHeader.Reference[]} options.links - The array of links to fill.
 */
function fillLinks({
	parameters,
	links,
}: {
	parameters: Record<string, string | Record<string, string>> | undefined;
	links: LinkHeader.Reference[];
}) {
	if (parameters) {
		for (const link of links) {
			link.uri = uriTemplate(link.uri).fillFromObject(parameters);
		}
	}
}

/**
 * Filters the links in a LinkHeader based on a filter object or string.
 * @param {object} options - The options object.
 * @param {string|Partial<Link>} options.filter - The filter to apply to the links.
 * @param {LinkHeader} options.linkHeader - The LinkHeader to filter.
 * @returns {Link[]} An array of filtered links.
 */
function filterLinks({
	filter,
	linkHeader,
}: {
	filter: string | Partial<Link> | undefined;
	linkHeader: LinkHeader;
}) {
	return filter
		? linkHeader.refs.filter((link) => {
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
		: linkHeader.refs;
}
