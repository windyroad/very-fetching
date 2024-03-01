import {decorateFetchResponse} from '@windyroad/decorate-fetch-response';
import {
	type FetchFunction,
	type AwaitedFetchReturns,
} from '@windyroad/wrap-fetch';
import {type LinkedResponse} from './linked-response.js';
import {resolveLinkUrls} from './resolve-link-urls.js';
import {decorateResponseWithLinks} from './decorate-response-with-links.js';

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
