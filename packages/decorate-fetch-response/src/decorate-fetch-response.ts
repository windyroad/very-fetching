import {wrapFetch} from '@windyroad/wrap-fetch';

/**
 * Decorates the response of a fetch request with additional properties.
 * @template DecoratorReturns The return type of the decorator function.
 * @template FetchInputs The type of the input arguments for the `fetch` implementation.
 * @template FetchReturns The return type of the `fetch` implementation.
 * @param fetchImpl The `fetch` implementation to use.
 * @param decorator The decorator function to apply to the response.
 * @returns A decorated version of the `fetch` implementation.
 */
export function decorateFetchResponse<
	DecoratorReturns = Awaited<ReturnType<typeof fetch>>,
	FetchInputs extends any[] = Parameters<typeof fetch>,
	FetchReturns = Awaited<ReturnType<typeof fetch>>,
>(
	fetchImpl: (...args: FetchInputs) => Promise<FetchReturns>,
	decorator: (
		response: FetchReturns,
	) => Promise<DecoratorReturns> | DecoratorReturns,
): (...args: FetchInputs) => Promise<DecoratorReturns> {
	const wrapper = async (
		fetchImpl: (...args: FetchInputs) => Promise<FetchReturns>,
		...args: FetchInputs
	): Promise<DecoratorReturns> => {
		const response = await fetchImpl(...args);
		const modified = await decorator(response);
		return modified;
	};

	return wrapFetch<FetchInputs, DecoratorReturns, FetchInputs, FetchReturns>(
		fetchImpl,
		wrapper,
	);
}
