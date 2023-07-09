/**
 * Wraps a `fetch` implementation with a wrapper function.
 * @template WrapInputs The type of the input arguments for the wrapper function.
 * @template WrapReturns The return type of the wrapper function.
 * @template FetchInputs The type of the input arguments for the `fetch` implementation.
 * @template FetchReturns The return type of the `fetch` implementation.
 * @param fetchImpl The `fetch` implementation to wrap.
 * @param wrapper The wrapper function to apply to the `fetch` implementation.
 * @returns A wrapped version of the `fetch` implementation.
 */
export function wrapFetch<
	WrapInputs extends any[] = Parameters<typeof fetch>,
	WrapReturns = Awaited<ReturnType<typeof fetch>>,
	FetchInputs extends any[] = Parameters<typeof fetch>,
	FetchReturns = Awaited<ReturnType<typeof fetch>>,
>(
	fetchImpl: (...args: FetchInputs) => Promise<FetchReturns>,
	wrapper: (
		fetchImpl: (...args: FetchInputs) => Promise<FetchReturns>,
		...args: WrapInputs
	) => Promise<WrapReturns>,
): (...args: WrapInputs) => Promise<WrapReturns> {
	/**
	 * A wrapped version of the global `fetch` function that calls the `wrapper` function with the `fetch` function and its arguments.
	 * @param args The arguments to pass to the `fetch` function.
	 * @returns A promise that resolves to the response.
	 */
	return async (...args: WrapInputs): Promise<WrapReturns> => {
		const result = await wrapper(fetchImpl, ...args);
		return result;
	};
}
