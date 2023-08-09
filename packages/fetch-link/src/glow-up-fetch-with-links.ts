import {
	type FetchFunction,
	type AwaitedFetchReturns,
} from '@windyroad/wrap-fetch';
import {
	addFragmentSupportToFetch,
	type FetchFragmentFunction,
	type FragmentResponse,
} from '@windyroad/fetch-fragment';
import {type Link} from './link.js';
import {decorateFetchResponseWithLinks} from './decorate-fetch-response-with-links.js';
import {glowUpFetchWithLinkInputs} from './glow-up-fetch-with-link-inputs.js';
import {type DropFirst} from './drop-first.js';
import {type LinkedResponse} from './linked-response.js';

/**
 * Adapts the fetch API to work with RFC8288 Link objects.
 * @template Arguments - The argument types of the original fetch function.
 * @template ResponseType - The awaited type of the original fetch function response.
 * @param {Function} fetchImpl - The original fetch function to adapt.
 * @returns {Function} An adapted fetch function that supports passing in a Link object.
 */
export function glowUpFetchWithLinks<
	Arguments extends Parameters<typeof fetch> = Parameters<typeof fetch>,
	ResponseType extends Response = Response,
>(
	fetchImpl?: FetchFunction<Arguments, ResponseType>,
): (
	...arguments_: Arguments | [Link, ...DropFirst<Arguments>]
) => Promise<LinkedResponse<ResponseType | FragmentResponse<ResponseType>>> {
	const fetchWithFragmentSupport: FetchFragmentFunction<
		Arguments,
		ResponseType
	> = addFragmentSupportToFetch<Arguments, ResponseType>(fetchImpl);
	const glowedUp = glowUpFetchWithLinkInputs<
		Arguments,
		ResponseType | FragmentResponse<ResponseType>
	>(fetchWithFragmentSupport);
	const fetchWithResponseLinks = decorateFetchResponseWithLinks<
		Parameters<typeof glowedUp>,
		AwaitedFetchReturns<typeof glowedUp>
	>(glowedUp);
	return fetchWithResponseLinks as FetchFunction<
		Arguments | [Link, ...DropFirst<Arguments>],
		LinkedResponse<ResponseType | FragmentResponse<ResponseType>>
	>;
}
