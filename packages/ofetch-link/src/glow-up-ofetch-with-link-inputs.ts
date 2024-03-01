import {wrapFetch, type FetchFunction} from '@windyroad/wrap-fetch';
import {
	type DropFirst,
	type FragmentLink,
	isFragmentLink,
	isHeadersEmpty,
} from '@windyroad/fetch-link';
import {type Link, isLink} from '@windyroad/link-header';
import {
	type ofetch,
	FetchRequest,
	FetchOptions,
	type FetchResponse,
} from 'ofetch';
import {
	FragmentOfetchResponse,
	type MappedType,
	type ResponseType,
} from './fragment-ofetch-response.js';

/**
 * Adapts the fetch API to work with RFC8288 Link objects.
 * @template Arguments - The argument types of the original fetch function.
 * @template FetchResponseType - The awaited response type of the original fetch function to adapt.
 * @param {Function} fetchImpl - The original fetch function to adapt.
 * @returns {Function} An adapted fetch function that supports passing in a Link object.
 */
export function glowUpOfetchWithLinkInputs<
	T = unknown,
	R extends ResponseType = 'json',
	Arguments extends Parameters<(typeof ofetch)['raw']> = Parameters<
		(typeof ofetch)['raw']
	>,
	FetchResponseType extends FetchResponse<MappedType<R, T>> = FetchResponse<
		MappedType<R, T>
	>,
>(
	fetchImpl?: FetchFunction<Arguments, FetchResponseType>,
): (
	...arguments_: [Arguments[0] | Link | FragmentLink, ...DropFirst<Arguments>]
) => Promise<FetchResponseType | FragmentOfetchResponse<T, R>> {
	/**
	 * Currently the code just adapts the input from a link to a url.
	 * For performance reasons, if the link is a fragment, it should
	 * just return a FragmentResponse.
	 * This means we need to use wrapFetch instead of adaptFetchInputs
	 * because wrapFetch will allow us to avoid calling fetchImpl
	 */
	return wrapFetch<
		Arguments,
		FetchResponseType,
		[Arguments[0] | Link | FragmentLink, ...DropFirst<Arguments>],
		FetchResponseType | FragmentOfetchResponse<T, R>
	>(
		async (
			fetchImplInner: FetchFunction<Arguments, FetchResponseType>,
			...arguments_: [
				Arguments[0] | Link | FragmentLink,
				...DropFirst<Arguments>,
			]
		) => {
			const [target, init, ...other] = arguments_;
			if (isLink(target)) {
				if (isFragmentLink(target)) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					return new FragmentOfetchResponse<T, R>(target.fragment.value, {
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
					if (typeof link.hreflang === 'string') {
						headers.append('Accept-Language', link.hreflang);
					} else {
						headers.append('Accept-Language', link.hreflang.join(', '));
					}
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
				return fetchImplInner(...(fetchParameters as Arguments));
			}

			return fetchImplInner(...(arguments_ as unknown as Arguments));
		},
		fetchImpl,
	);
}
