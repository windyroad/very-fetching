export type AwaitedFetchReturns<
	T extends (...arguments_: any) => Promise<any> = typeof fetch,
> = T extends (...arguments_: any) => Promise<infer R> ? R : any;

export type FetchReturns<T extends (...arguments_: any[]) => Promise<any>> =
	T extends (...arguments_: any[]) => Promise<infer R>
		? Promise<R>
		: Promise<any>;

export type FetchFunction<
	Arguments extends any[] = Parameters<typeof fetch>,
	ResponseType extends Response = Response,
> = (...arguments_: Arguments) => Promise<ResponseType>;

export type FetchFunctionOptions<
	Arguments extends any[] = Parameters<typeof fetch>,
	ResponseType extends Response = Response,
> =
	| {
			fetchImpl: FetchFunction<Arguments, ResponseType>;
	  }
	| {
			fetchConstructor: () => FetchFunction<Arguments, ResponseType>;
	  };

export type WrapFetchOptions<
	Arguments extends any[] = Parameters<typeof fetch>,
	ResponseType extends Response = Response,
> =
	| FetchFunction<Arguments, ResponseType>
	| FetchFunctionOptions<Arguments, ResponseType>;
/**
 * Wraps a `fetch` implementation with a wrapper function.
 * @template Arguments The type of the input arguments for the `fetch` implementation.
 * @template ResponseType The awaited type of the `fetch` implementation response.
 * @template WrapInputs The type of the input arguments for the wrapper function.
 * @template WrapReturns The return type of the wrapper function.
 * @param wrapper - The wrapper function to apply to the `fetch` implementation.
 * @param fetchImplOrOptions - The `fetch` implementation to wrap or an object with either the `fetch` implementation to wrap or a function that returns a fetch implementation. Defaults to the global `fetch` function.
 * @returns - A wrapped version of the `fetch` implementation.
 */
export function wrapFetch<
	Arguments extends any[] = Parameters<typeof fetch>,
	ResponseType extends Response = Response,
	WrapInputs extends any[] = Arguments,
	WrapReturns = ResponseType,
>(
	wrapper: (
		fetchImplInner: FetchFunction<Arguments, ResponseType>,
		...arguments_: WrapInputs
	) => Promise<WrapReturns>,
	fetchImplOrOptions?: WrapFetchOptions<Arguments, ResponseType>,
): (...arguments_: WrapInputs) => Promise<WrapReturns> {
	/**
	 * A wrapped version of the global `fetch` function that calls the `wrapper` function with the `fetch` function and its arguments.
	 * @param arguments_ The arguments to pass to the `fetch` function.
	 * @returns A promise that resolves to the response.
	 */
	return async (...arguments_: WrapInputs): Promise<WrapReturns> => {
		let usableFetch: FetchFunction<Arguments, ResponseType>;
		if (
			fetchImplOrOptions === undefined ||
			typeof fetchImplOrOptions === 'function'
		) {
			usableFetch = (fetchImplOrOptions ?? globalThis.fetch) as FetchFunction<
				Arguments,
				ResponseType
			>;
		} else if ('fetchImpl' in fetchImplOrOptions) {
			usableFetch = fetchImplOrOptions.fetchImpl;
		} else {
			usableFetch = fetchImplOrOptions.fetchConstructor();
		}

		const result = await wrapper(usableFetch, ...arguments_);
		return result;
	};
}
