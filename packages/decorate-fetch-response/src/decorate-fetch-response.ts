export type ExtendedResponse<P, T extends Response = Response> = P & T;

export type EnhancedFetch<T extends Response = Response> = (
	input: URL | RequestInfo,
	init?: RequestInit,
) => Promise<T>;

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
