/**
 * A function that wraps the global `fetch` function with a custom wrapper function.
 * @param fetchImpl The global `fetch` function to wrap.
 * @param wrapper A function that takes the `fetch` function and its arguments and returns a promise that resolves to the response.
 * @returns A wrapped version of the `fetch` function.
 */
export function wrapFetch<
	Inputs extends any[] = Parameters<typeof fetch>,
	Returns = ReturnType<typeof fetch>,
>(
	fetchImpl: typeof fetch,
	wrapper: (fetchImpl: typeof fetch, ...args: Inputs) => Returns,
) {
	/**
	 * A wrapped version of the global `fetch` function that calls the `wrapper` function with the `fetch` function and its arguments.
	 * @param args The arguments to pass to the `fetch` function.
	 * @returns A promise that resolves to the response.
	 */
	return async (...args: Inputs) => {
		return wrapper(fetchImpl, ...args);
	};
}
