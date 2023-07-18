import {
	wrapFetch,
	type FetchInputs,
	type AwaitedFetchReturns,
} from '@windyroad/wrap-fetch';

/**
 * Decorates the response of a fetch request with additional properties.
 * @template FetchImpl The type of the `fetch` implementation.
 * @template DecoratorReturns The return type of the decorator function.
 * @param decorator The decorator function to apply to the response.
 * @param fetchImpl The `fetch` implementation to use.
 * @returns A decorated version of the `fetch` implementation.
 */
export function decorateFetchResponse<
	FetchImpl extends (...args: any[]) => Promise<any> = typeof fetch,
	DecoratorReturns = AwaitedFetchReturns<FetchImpl>,
>(
	decorator: (
		response: AwaitedFetchReturns<FetchImpl>,
	) => Promise<DecoratorReturns> | DecoratorReturns,
	fetchImpl?: FetchImpl,
): (...args: FetchInputs<FetchImpl>) => Promise<DecoratorReturns> {
	return wrapFetch<FetchImpl, FetchInputs<FetchImpl>, DecoratorReturns>(
		async (fetchImpl, ...args) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const response = await fetchImpl(...args);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const modified = await decorator(response);
			return modified;
		},
		fetchImpl,
	);
}
