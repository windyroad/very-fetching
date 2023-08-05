import {type AwaitedFetchReturns} from '@windyroad/wrap-fetch';
import {
	addFragmentSupportToFetch,
	type FragmentResponse,
} from '@windyroad/fetch-fragment';
import {type Link} from './link';
import {decorateFetchResponseWithLinks} from './decorate-fetch-response-with-links';
import {glowUpFetchWithLinkInputs} from './glow-up-fetch-with-link-inputs';
import {type DropFirst} from './drop-first';
import {type LinkedResponse} from './linked-response';

/**
 * Adapts the fetch API to work with RFC8288 Link objects.
 * @template Arguments - The argument types of the original fetch function.
 * @template FetchImpl - The type of the original fetch function to adapt.
 * @param {Function} fetchImpl - The original fetch function to adapt.
 * @returns {Function} An adapted fetch function that supports passing in a Link object.
 */
export function glowUpFetchWithLinks<
	Arguments extends Parameters<typeof fetch> = Parameters<typeof fetch>,
	FetchImpl extends (
		...arguments_: Arguments
	) => Promise<
		Pick<
			Response,
			'headers' | 'json' | 'clone' | 'url' | 'status' | 'statusText' | 'body'
		>
	> = typeof fetch,
>(
	fetchImpl?: FetchImpl,
): (
	...arguments_: Arguments | [Link, ...DropFirst<Arguments>]
) => ReturnType<
	(
		...arguments_: Arguments
	) => Promise<
		LinkedResponse<AwaitedFetchReturns<FetchImpl> | FragmentResponse>
	>
> {
	const fetchWithFragmentSupport = addFragmentSupportToFetch<
		Arguments,
		FetchImpl
	>(fetchImpl);
	const glowedUp = glowUpFetchWithLinkInputs<
		Arguments,
		typeof fetchWithFragmentSupport
	>(fetchWithFragmentSupport);
	const fetchWithResponseLinks = decorateFetchResponseWithLinks(glowedUp);
	return fetchWithResponseLinks;
}
