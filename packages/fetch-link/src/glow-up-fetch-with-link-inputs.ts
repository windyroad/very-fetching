import {type AwaitedFetchReturns, wrapFetch} from '@windyroad/wrap-fetch';
import {type FetchFragmentFunction} from '@windyroad/fetch-fragment';
import {FragmentResponse} from '@windyroad/fetch-fragment';
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
 * @template Arguments - The argument types of the original fetch function.
 * @template FetchImpl - The type of the original fetch function to adapt.
 * @param {Function} fetchImpl - The original fetch function to adapt.
 * @returns {Function} An adapted fetch function that supports passing in a Link object.
 */
export function glowUpFetchWithLinkInputs<
	Arguments extends Parameters<typeof fetch> = Parameters<typeof fetch>,
	FetchImpl extends (...arguments_: Arguments) => Promise<any> = (
		...arguments_: Arguments
	) => ReturnType<typeof fetch>,
>(
	fetchImpl?: FetchImpl,
): (
	...arguments_: Arguments | [Link, ...DropFirst<Arguments>]
) => Promise<FragmentResponse | AwaitedFetchReturns<FetchImpl>> {
	/**
	 * Currently the code just adapts the input from a link to a url.
	 * For performance reasons, if the link is a fragment, it should
	 * just return a FragmentResponse.
	 * This means we need to use wrapFetch instead of adaptFetchInputs
	 * because wrapFetch will allow us to avoid calling fetchImpl
	 */
	return wrapFetch<
		Arguments,
		FetchImpl,
		Arguments | [Link, ...DropFirst<Arguments>],
		Awaited<ReturnType<FetchFragmentFunction<Arguments, FetchImpl>>>
	>(
		async (
			fetchImplInner,
			...arguments_: Arguments | [Link, ...DropFirst<Arguments>]
		) => {
			const [target, init, ...other] = arguments_;
			if (isLink(target)) {
				if (target.fragment) {
					return new FragmentResponse(target.fragment.value, {
						status: 200,
						url: target.uri,
					});
				}

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
					...other,
				];
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return fetchImplInner(...(fetchParameters as Arguments));
			}

			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return fetchImplInner(...(arguments_ as unknown as Arguments));
		},
		fetchImpl,
	);
}
