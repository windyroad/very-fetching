import {
	type FetchFunction,
	type AwaitedFetchReturns,
	type WrapFetchOptions,
} from '@windyroad/wrap-fetch';
import {
	addFragmentSupportToFetch,
	type FetchFragmentFunction,
	type FragmentResponse,
} from '@windyroad/fetch-fragment';
import {type Link} from '@windyroad/link-header';
import {
	type DropFirst,
	type LinkedResponse,
	type FragmentLink,
	glowUpFetchWithLinkInputs,
} from '@windyroad/fetch-link';
import {
	type ofetch,
	FetchRequest,
	FetchOptions,
	type FetchResponse,
} from 'ofetch';
import {type ResponseLinks} from '@windyroad/fetch-link/src/linked-response.js';
import {decorateOfetchResponseWithLinks} from './decorate-ofetch-response-with-links.js';
import {glowUpOfetchWithLinkInputs} from './glow-up-ofetch-with-link-inputs.js';
import {
	type FragmentOfetchResponse,
	type MappedType,
	type ResponseType,
} from './fragment-ofetch-response.js';

type OfetchArguments = Parameters<(typeof ofetch)['raw']>;

/**
 * Adapts the fetch API to work with RFC8288 Link objects.
 * @template Arguments - The argument types of the original fetch function.
 * @template FetchResponseType - The awaited type of the original fetch function response.
 * @param fetchImplOrOptions - The `fetch` implementation to wrap or an object with either the `fetch` implementation to wrap or a function that returns a fetch implementation. Defaults to the global `fetch` function.
 * @returns {Function} An adapted fetch function that supports passing in a Link object.
 */
export function glowUpOfetchWithLinks<
	T = unknown,
	R extends ResponseType = 'json',
	Arguments extends OfetchArguments = OfetchArguments,
	FetchResponseType extends FetchResponse<MappedType<R, T>> = FetchResponse<
		MappedType<R, T>
	>,
>(
	fetchImplOrOptions?: WrapFetchOptions<Arguments, FetchResponseType>,
): <T2 = unknown, R2 extends ResponseType = 'json'>(
	...arguments_: [Arguments[0] | Link | FragmentLink, ...DropFirst<Arguments>]
) => Promise<
	LinkedResponse<
		FetchResponse<MappedType<R2, T2>> | FragmentOfetchResponse<T2, R2>
	>
> {
	const fetchWithFragmentSupport =
		addFragmentSupportToFetch(fetchImplOrOptions);
	const glowedUp = glowUpFetchWithLinkInputs(fetchWithFragmentSupport);
	const fetchWithResponseLinks = decorateOfetchResponseWithLinks<
		Parameters<typeof glowedUp>,
		AwaitedFetchReturns<typeof glowedUp>
	>(glowedUp);
	return fetchWithResponseLinks as <
		T2 = unknown,
		R2 extends ResponseType = 'json',
	>(
		...arguments_: [Arguments[0] | Link | FragmentLink, ...DropFirst<Arguments>]
	) => Promise<
		LinkedResponse<
			FetchResponse<MappedType<R2, T2>> | FragmentOfetchResponse<T2, R2>
		>
	>;
}
