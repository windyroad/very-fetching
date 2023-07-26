import {
	type FetchInputs,
	type AwaitedFetchReturns,
} from '@windyroad/wrap-fetch';
import {addFragmentSupportToFetch} from '@windyroad/fetch-fragment';
import {type Link} from './link';
import {decorateFetchResponseWithLinks} from './decorate-fetch-response-with-links';
import {type LinkedResponse} from './linked-response';
import {glowUpFetchWithLinkInputs} from './glow-up-fetch-with-link-inputs';
import {type DropFirst} from './drop-first';

/**
 * Adapts the fetch API to work with RFC8288 Link objects.
 * @template FetchReturns - The return type of the original fetch function.
 * @param {Function} fetchImpl - The original fetch function to adapt.
 * @returns {Function} An adapted fetch function that supports passing in a Link object.
 */
export function glowUpFetchWithLinks<
	FetchImpl extends (
		...arguments_: Parameters<typeof fetch>
	) => Promise<any> = typeof fetch,
>(
	fetchImpl?: FetchImpl,
): (
	...arguments_:
		| FetchInputs<FetchImpl>
		| [Link, ...DropFirst<FetchInputs<FetchImpl>>]
) => Promise<LinkedResponse<AwaitedFetchReturns<FetchImpl>>> {
	const fetchWithFragmentSupport = addFragmentSupportToFetch(fetchImpl);
	const fetchWithResponseLinks = decorateFetchResponseWithLinks<FetchImpl>(
		fetchWithFragmentSupport as FetchImpl,
	);
	return glowUpFetchWithLinkInputs<FetchImpl>(
		fetchWithResponseLinks as FetchImpl,
	);
}
