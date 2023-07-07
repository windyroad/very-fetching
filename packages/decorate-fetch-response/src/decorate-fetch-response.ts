export type ExtendedResponse<P, T extends Response = Response> = P & T;

export type EnhancedFetch<T extends Response = Response> = (
	input: URL | RequestInfo,
	init?: RequestInit,
) => Promise<T>;

/**
 * A function that decorates the response of a fetch request with additional properties.
 * @template P The type of the additional properties to add to the response.
 * @template T The type of the original response.
 * @param {EnhancedFetch<T>} fetchImpl The fetch implementation to use.
 * @param {(response: Response) => ExtendedResponse<P> | Promise<ExtendedResponse<P>>} decorator The decorator function to apply to the response.
 * @returns {EnhancedFetch<ExtendedResponse<P>>} A decorated version of the fetch implementation.
 */
export function decorateFetchResponse<P, T extends Response = Response>(
	fetchImpl: EnhancedFetch<T>,
	decorator: (
		response: Response,
	) => ExtendedResponse<P> | Promise<ExtendedResponse<P>>,
): EnhancedFetch<ExtendedResponse<P>> {
	return async (input: URL | RequestInfo, init?: RequestInit) => {
		const response = await fetchImpl(input, init);
		return decorator(response);
	};
}

export default decorateFetchResponse;
