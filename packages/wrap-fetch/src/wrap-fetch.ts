// Export type FetchType<T extends ((...args: any) => Promise<any>) | undefined> =
// 	T extends undefined ? typeof fetch : T;

export type FetchInputs<T extends (...args: any) => Promise<any>> =
	Parameters<T>;

export type FetchReturns<T extends (...args: any) => Promise<any>> = Awaited<
	ReturnType<T>
>;

/**
 * Wraps a `fetch` implementation with a wrapper function.
 * @template WrapInputs The type of the input arguments for the wrapper function.
 * @template WrapReturns The return type of the wrapper function.
 * @template FetchImpl The type of the `fetch` implementation.
 * @param wrapper The wrapper function to apply to the `fetch` implementation.
 * @param fetchImpl The `fetch` implementation to wrap. Defaults to the global `fetch` function.
 * @returns A wrapped version of the `fetch` implementation.
 */
export function wrapFetch<
	FetchImpl extends (...args: any) => Promise<any> = typeof fetch,
	WrapInputs extends any[] = Parameters<FetchImpl>,
	WrapReturns = Awaited<ReturnType<FetchImpl>>,
>(
	wrapper: (
		fetchImplInner: FetchImpl,
		...args: WrapInputs
	) => Promise<WrapReturns>,
	fetchImpl?: FetchImpl,
): (...args: WrapInputs) => Promise<WrapReturns> {
	/**
	 * A wrapped version of the global `fetch` function that calls the `wrapper` function with the `fetch` function and its arguments.
	 * @param args The arguments to pass to the `fetch` function.
	 * @returns A promise that resolves to the response.
	 */
	return async (...args: WrapInputs): Promise<WrapReturns> => {
		const usableFetch = (fetchImpl ?? globalThis.fetch) as FetchImpl;
		const result = await wrapper(usableFetch, ...args);
		return result;
	};
}
