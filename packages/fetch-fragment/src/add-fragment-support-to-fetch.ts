import {
	decorateFetchResponse,
	decorateFetchResponseUsingInputs,
} from '@windyroad/decorate-fetch-response';
import LinkHeader from 'http-link-header';
import {
	type FetchReturns,
	type AwaitedFetchReturns,
	type FetchInputs,
} from '@windyroad/wrap-fetch';
import pointer from 'json-pointer';
import {isJsonContent} from './is-json-content';

/**
 * Fetches a fragment from a JSON response based on a URL fragment identifier.
 * If the response is not JSON or the fragment is not found, returns a 404 or 415 response.
 * @template FetchImpl The type of the `fetch` implementation to use.
 * @param fetchImpl The `fetch` implementation to use.
 * @returns A function that fetches a fragment from a JSON response.
 */
export function addFragmentSupportToFetch<
	FetchImpl extends (
		...arguments_: Parameters<typeof fetch>
	) => Promise<
		Pick<Response, 'json' | 'body' | 'status' | 'statusText' | 'headers'>
	> = typeof fetch,
>(
	fetchImpl?: FetchImpl,
): (
	...arguments_: FetchInputs<FetchImpl>
) => Promise<Response | AwaitedFetchReturns<FetchImpl>> {
	return decorateFetchResponseUsingInputs(
		async (response, ...arguments_: FetchInputs<FetchImpl>) => {
			let input = arguments_[0];
			if (typeof input === 'string') {
				input = new URL(input);
			}

			if (!(input instanceof URL)) {
				input = new URL(input.url);
			}

			if (input.hash) {
				return getFragment(input, response);
			}

			return response;
		},
		fetchImpl,
	);
}

/**
 * Retrieves a JSON fragment from a response and returns a new response with only the fragment.
 * @template FetchImpl - The type of the fetch implementation to use.
 * @param {URL} input - The URL of the response.
 * @param {Promise<Pick<Response, 'json' | 'body' | 'status' | 'statusText' | 'headers'>>} response - The response to extract the fragment from.
 * @returns {Promise<Response>} A new response with only the fragment.
 */
async function getFragment<
	FetchImpl extends (
		...arguments_: Parameters<typeof fetch>
	) => Promise<
		Pick<Response, 'json' | 'body' | 'status' | 'statusText' | 'headers'>
	> = typeof fetch,
>(input: URL, response: AwaitedFetchReturns<FetchImpl>) {
	const hash = input.hash.slice(1);
	if (isJsonContent(response)) {
		if (response.body) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const fragment = pointer.get(
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					await response.json(),
					hash,
				);

				const fragmentString = JSON.stringify(fragment);
				const headers = new Headers(response.headers);
				headers.set('Content-Length', String(fragmentString.length));
				/**
				 * The original content type might be "<something>+json",
				 * where the "<something>" has a specific structure the
				 * client is expecting. By changing the content type to
				 * 'application/json', we are removing that expectation
				 */
				headers.set('Content-Type', 'application/json');
				// Update Link headers
				adjustLinkHeaders({headers, headerName: 'Link', hash});

				// Update Link-Template headers
				adjustLinkHeaders({headers, headerName: 'Link-Template', hash});

				return new Response(fragmentString, {
					status: response.status,
					statusText: response.statusText,
					headers,
				});
			} catch (error: unknown) {
				if (error instanceof Error) {
					return new Response(error.message, {
						status: error.message.startsWith('Invalid reference token')
							? 404
							: 400,
						headers: response.headers,
					});
				}

				throw error;
			}
			// Else fall through to 404
		} else {
			return new Response(null, {status: 404, headers: response.headers});
		}
	} else {
		return new Response(null, {status: 415, headers: response.headers});
	}
}

/**
 * Adjusts the `Link` headers in the given `Headers` object to reflect a new fragment.
 * Specifically, updates the `anchor` attribute of any `Link` headers with a `rel` attribute of `fragment`
 * to include the new fragment, and removes any `Link` headers that no longer apply to the new fragment.
 * @param {object} options - The options for adjusting the `Link` headers.
 * @param {Headers} options.headers - The `Headers` object containing the `Link` headers to adjust.
 * @param {string} options.headerName - The name of the `Link` header to adjust.
 * @param {string} options.hash - The new fragment to use in the `anchor` attribute of the `Link` headers.
 */
function adjustLinkHeaders({
	headers,
	headerName,
	hash,
}: {
	headers: Headers;
	headerName: string;
	hash: string;
}) {
	const linkHeaders = headers.get(headerName);

	if (linkHeaders) {
		headers.delete(headerName);
		const links = LinkHeader.parse(linkHeaders);

		links.refs = links.refs.filter((link) => {
			if (link.anchor?.startsWith(hash)) {
				link.anchor = link.anchor.slice(hash.length);
				if (link.anchor.length === 0) {
					delete link.anchor;
				}

				return true;
			}

			return false;
		});
		if (links.refs.length > 0) {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			headers.set(headerName, links.toString());
		}
	}
}
