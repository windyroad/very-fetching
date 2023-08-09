import {
	decorateFetchResponse,
	decorateFetchResponseUsingInputs,
} from '@windyroad/decorate-fetch-response';
import LinkHeader from 'http-link-header';
import {
	type FetchFunction,
	type AwaitedFetchReturns,
} from '@windyroad/wrap-fetch';
import {JsonPointer} from 'json-ptr';
import {isJsonContent} from './is-json-content.js';
import {FragmentResponse} from './fragment-response.js';
import {type FetchFragmentFunction} from './fetch-fragment-function.js';

/**
 * Fetches a fragment from a JSON response based on a URL fragment identifier.
 * If the response is not JSON or the fragment is not found, returns a 404 or 415 response.
 * @template Arguments The type of the input arguments for the `fetch` implementation.
 * @template ResponseType The awaited type of the `fetch` implementation response.
 * @param {FetchFunction<Arguments, ResponseType>} [fetchImpl] - The `fetch` implementation to use. Defaults to the global `fetch` function.
 * @returns {FetchFragmentFunction<Arguments,ResponseType>} - A function that fetches a fragment from a JSON response.
 */
export function addFragmentSupportToFetch<
	Arguments extends Parameters<typeof fetch> = Parameters<typeof fetch>,
	ResponseType extends Response = Response,
>(
	fetchImpl?: FetchFunction<Arguments, ResponseType>,
): FetchFragmentFunction<Arguments, ResponseType> {
	return decorateFetchResponseUsingInputs<
		Arguments,
		ResponseType,
		ResponseType | FragmentResponse<ResponseType>
	>(async (response, ...arguments_: Arguments) => {
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
	}, fetchImpl);
}

/**
 * Retrieves a JSON fragment from a response and returns a new response with only the fragment.
 * @template ResponseType The type of the `fetch` response.
 * @param {URL} input - The URL of the response.
 * @param {Promise<Response>} response - The response to extract the fragment from.
 * @returns {Promise<ResponseType | FragmentResponse<ResponseType>>} - A new response with only the fragment.
 */
async function getFragment<ResponseType extends Response = Response>(
	input: URL,
	response: ResponseType,
): Promise<ResponseType | FragmentResponse<ResponseType>> {
	const {hash} = input;
	if (isJsonContent(response)) {
		if (response.body) {
			try {
				const parent = response.clone() as ResponseType;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const json = await response.json();
				const pointer = JsonPointer.create(hash);
				const fragment = pointer.get(json);
				if (fragment === undefined) {
					return new FragmentResponse(
						undefined,
						{
							status: 404,
							headers: response.headers,
							url: input.href,
						},
						parent,
					);
				}

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
				return new FragmentResponse(
					fragment,
					{
						status: response.status,
						statusText: response.statusText,
						headers,
						url: input.href,
					},
					parent,
				);
			} catch (error: unknown) {
				if (
					error instanceof ReferenceError &&
					error.message === 'Invalid JSON Pointer syntax.'
				) {
					return new FragmentResponse(
						error.message,
						{
							status: 400,
							headers: response.headers,
							url: input.href,
						},
						response,
					);
				}

				throw error;
			}
			// Else fall through to 404
		}

		return new FragmentResponse(
			undefined,
			{
				status: 404,
				headers: response.headers,
				url: input.href,
			},
			response,
		);
	}

	return new FragmentResponse(
		undefined,
		{
			status: 415,
			headers: response.headers,
			url: input.href,
		},
		response,
	);
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
				link.anchor = `#${link.anchor.slice(hash.length)}`;
				if (link.anchor.length === 1) {
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
