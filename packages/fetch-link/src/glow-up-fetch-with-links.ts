import {adaptFetchInputs} from '@windyroad/adapt-fetch-inputs';
import {isLink, type Link} from './link.js';

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
export function glowUpFetchWithLinks<
	FetchReturns = Awaited<ReturnType<typeof fetch>>,
>(
	fetchImpl: (...args: Parameters<typeof fetch>) => Promise<FetchReturns>,
): (
	target: Link | Parameters<typeof fetch>[0],
	init?: Parameters<typeof fetch>[1],
) => Promise<FetchReturns> {
	const adapter = (
		target: Link | Parameters<typeof fetch>[0],
		init: Parameters<typeof fetch>[1],
	): Parameters<typeof fetch> => {
		if (isLink(target)) {
			const link = target;
			const requestInit: RequestInit = init ?? {};

			// In case link.method is undefined, we'll use 'GET' as a default.
			const method = link.method ?? 'GET';

			const headers = new Headers(requestInit.headers);
			// Only set the 'Accept' header if link.type is defined.
			if (link.type) {
				headers.append('Accept', link.type);
			}

			if (link.hreflang) {
				headers.append('Accept-Language', link.hreflang);
			}

			const fetchParameters: Parameters<typeof fetch> = [
				link.uri,
				{
					...requestInit,
					...(link.method && {method: link.method}),
					...(!isHeadersEmpty(headers) && {headers}),
				},
			];
			return fetchParameters;
		}

		return [target, init];
	};

	return adaptFetchInputs(fetchImpl, adapter);
}
