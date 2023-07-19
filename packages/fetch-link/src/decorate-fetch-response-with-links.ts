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
				const links = filter
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
				if (parameters) {
					for (const link of links) {
						link.uri = uriTemplate(link.uri).fillFromObject(parameters);
					}
				}

				return links;
			},
		});
	}, fetchImpl);
}
