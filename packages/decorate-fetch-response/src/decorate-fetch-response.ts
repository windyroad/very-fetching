import {
	wrapFetch,
	type FetchInputs,
	type FetchReturns,
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
	FetchImpl extends (...args: any) => Promise<any> = typeof fetch,
	DecoratorReturns = FetchReturns<FetchImpl>,
>(
	decorator: (
		response: FetchReturns<FetchImpl>,
	) => Promise<DecoratorReturns> | DecoratorReturns,
	fetchImpl?: FetchImpl,
): (...args: FetchInputs<FetchImpl>) => Promise<DecoratorReturns> {
	return wrapFetch<FetchInputs<FetchImpl>, DecoratorReturns, FetchImpl>(
		async (fetchImpl, ...args) => {
			const response = await fetchImpl(...args);

			const modified = await decorator(response as FetchReturns<FetchImpl>);
			return modified;
		},
		fetchImpl,
	);
}
