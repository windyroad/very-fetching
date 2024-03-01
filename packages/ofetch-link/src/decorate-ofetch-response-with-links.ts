import {decorateFetchResponse} from '@windyroad/decorate-fetch-response';
import {
	type FetchFunction,
	type AwaitedFetchReturns,
} from '@windyroad/wrap-fetch';
import {type Link} from '@windyroad/link-header';
import uriTemplate from 'uri-templates';
import {JsonPointer} from 'json-ptr';
import {
	type LinkedResponse,
	decorateResponseWithLinks,
} from '@windyroad/fetch-link';
import {type ofetch, FetchRequest, FetchOptions, FetchResponse} from 'ofetch';
import {
	type FragmentLink,
	type Fragment,
} from '../../fetch-link/src/fragment.js';

/**
 * Decorates a `fetch`-like function with link parsing and resolution functionality.
 * @template Arguments - The parameters type of the `fetch`-like function to decorate.
 * @template FetchResponseType - The awaited response type of the `fetch`-like function to decorate.
 * @param fetchImpl - The `fetch`-like function to decorate.
 * @returns - A decorated `fetch`-like function that returns a `LinkedResponse`.
 */
export function decorateOfetchResponseWithLinks<
	Arguments extends any[] = Parameters<(typeof ofetch)['raw']>,
	FetchResponseType extends Response = Awaited<
		ReturnType<(typeof ofetch)['raw']>
	>,
>(
	fetchImpl?: FetchFunction<Arguments, FetchResponseType>,
): (...arguments_: Arguments) => Promise<LinkedResponse<FetchResponseType>> {
	return decorateFetchResponse<
		Arguments,
		FetchResponseType,
		LinkedResponse<FetchResponseType>
	>(decorateResponseWithLinks, fetchImpl);
}
