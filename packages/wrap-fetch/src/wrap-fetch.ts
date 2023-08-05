export type AwaitedFetchReturns<
	T extends (...arguments_: any) => Promise<any> = typeof fetch,
> = T extends (...arguments_: any) => Promise<infer R> ? R : any;

export type FetchReturns<T extends (...arguments_: any[]) => Promise<any>> =
	T extends (...arguments_: any[]) => Promise<infer R>
		? Promise<R>
		: Promise<any>;

/**
 * Wraps a `fetch` implementation with a wrapper function.
 * @template Arguments The type of the input arguments for the `fetch` implementation.
 * @template FetchImpl The type of the `fetch` implementation.
 * @template WrapInputs The type of the input arguments for the wrapper function.
 * @template WrapReturns The return type of the wrapper function.
 * @param wrapper - The wrapper function to apply to the `fetch` implementation.
 * @param fetchImpl - The `fetch` implementation to wrap. Defaults to the global `fetch` function.
 * @returns - A wrapped version of the `fetch` implementation.
 */
export function wrapFetch<
	Arguments extends any[] = Parameters<typeof fetch>,
	FetchImpl extends (...arguments_: Arguments) => Promise<any> = (
		...arguments_: Arguments
	) => ReturnType<typeof fetch>,
	WrapInputs extends any[] = Parameters<FetchImpl>,
	WrapReturns = AwaitedFetchReturns<FetchImpl>,
>(
	wrapper: (
		fetchImplInner: FetchImpl,
		...arguments_: WrapInputs
	) => Promise<WrapReturns>,
	fetchImpl?: FetchImpl,
): (...arguments_: WrapInputs) => Promise<WrapReturns> {
	/**
	 * A wrapped version of the global `fetch` function that calls the `wrapper` function with the `fetch` function and its arguments.
	 * @param arguments_ The arguments to pass to the `fetch` function.
	 * @returns A promise that resolves to the response.
	 */
	return async (...arguments_: WrapInputs): Promise<WrapReturns> => {
		const usableFetch = (fetchImpl ?? globalThis.fetch) as FetchImpl;
		const result = await wrapper(usableFetch, ...arguments_);
		return result;
	};
}
