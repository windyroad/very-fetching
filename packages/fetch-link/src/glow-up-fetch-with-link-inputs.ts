import {adaptFetchInputs} from '@windyroad/adapt-fetch-inputs';
import {
	type FetchInputs,
	type AwaitedFetchReturns,
} from '@windyroad/wrap-fetch';
import {isLink, type Link} from './link';
import {type DropFirst} from './drop-first';

/**
 * Checks if a Headers object is empty.
 * @param headers The Headers object to check.
 * @returns True if the Headers object is empty, false otherwise.
 */
function isHeadersEmpty(headers: Headers): boolean {
	let isEmpty = true;
	// eslint-disable-next-line no-unreachable-loop
	for (const _header of headers) {
		isEmpty = false;
		break;
	}

	return isEmpty;
}

/**
 * Adapts the fetch API to work with RFC8288 Link objects.
 * @template FetchReturns - The return type of the original fetch function.
 * @param {Function} fetchImpl - The original fetch function to adapt.
 * @returns {Function} An adapted fetch function that supports passing in a Link object.
 */
export function glowUpFetchWithLinkInputs<
	FetchImpl extends (
		...arguments_: Parameters<typeof fetch>
	) => Promise<any> = typeof fetch,
>(
	fetchImpl?: FetchImpl,
): (
	...arguments_:
		| FetchInputs<FetchImpl>
		| [Link, ...DropFirst<FetchInputs<FetchImpl>>]
) => Promise<AwaitedFetchReturns<FetchImpl>> {
	const adapter = (
		...arguments_:
			| FetchInputs<FetchImpl>
			| [Link, ...DropFirst<FetchInputs<FetchImpl>>]
	): // Target: Link | FetchInputs<FetchImpl>[0],
	// init: FetchInputs<FetchImpl>[1],
	FetchInputs<FetchImpl> => {
		const [target, init] = arguments_;
		if (isLink(target)) {
			const link = target;

			const headers = new Headers(init?.headers ?? {});
			// Only set the 'Accept' header if link.type is defined.
			if (link.type) {
				headers.append('Accept', link.type);
			}

			if (link.hreflang) {
				headers.append('Accept-Language', link.hreflang);
			}

			const fetchParameters = [
				link.uri,
				{
					...init,
					...(link.method && {method: link.method}),
					...(!isHeadersEmpty(headers) && {headers}),
				},
			] as unknown as FetchInputs<FetchImpl>;
			return fetchParameters;
		}

		return arguments_ as FetchInputs<FetchImpl>;
	};

	return adaptFetchInputs<
		FetchImpl,
		FetchInputs<FetchImpl> | [Link, ...DropFirst<FetchInputs<FetchImpl>>]
	>(adapter, fetchImpl);
}
