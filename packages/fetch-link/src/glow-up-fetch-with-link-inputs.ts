import {wrapFetch, type FetchFunction} from '@windyroad/wrap-fetch';
import {FragmentResponse} from '@windyroad/fetch-fragment';
import {type Link, isLink} from '@windyroad/link-header';
import {type DropFirst} from './drop-first.js';
import {type FragmentLink, isFragmentLink} from './fragment.js';
import {isHeadersEmpty} from './is-headers-empty.js';

/**
 * Adapts the fetch API to work with RFC8288 Link objects.
 * @template Arguments - The argument types of the original fetch function.
 * @template ResponseType - The awaited response type of the original fetch function to adapt.
 * @param {Function} fetchImpl - The original fetch function to adapt.
 * @returns {Function} An adapted fetch function that supports passing in a Link object.
 */
export function glowUpFetchWithLinkInputs<
	Arguments extends any[] = Parameters<typeof fetch>,
	ResponseType extends Response = Awaited<ReturnType<typeof fetch>>,
>(
	fetchImpl?: FetchFunction<Arguments, ResponseType>,
): (
	...arguments_: [Arguments[0] | Link | FragmentLink, ...DropFirst<Arguments>]
) => Promise<ResponseType | FragmentResponse<ResponseType>> {
	/**
	 * Currently the code just adapts the input from a link to a url.
	 * For performance reasons, if the link is a fragment, it should
	 * just return a FragmentResponse.
	 * This means we need to use wrapFetch instead of adaptFetchInputs
	 * because wrapFetch will allow us to avoid calling fetchImpl
	 */
	return wrapFetch<
		Arguments,
		ResponseType,
		[Arguments[0] | Link | FragmentLink, ...DropFirst<Arguments>],
		ResponseType | FragmentResponse<ResponseType>
	>(
		async (
			fetchImplInner: FetchFunction<Arguments, ResponseType>,
			...arguments_: [
				Arguments[0] | Link | FragmentLink,
				...DropFirst<Arguments>,
			]
		) => {
			const [target, init, ...other] = arguments_;
			if (isLink(target)) {
				if (isFragmentLink(target)) {
					return new FragmentResponse(target.fragment.value, {
						status: 200,
						url: target.uri,
					});
				}

				const link = target;

				const headers =
					init && typeof init === 'object' && 'headers' in init
						? new Headers(init.headers as HeadersInit)
						: new Headers();
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
						...(init as any),
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
