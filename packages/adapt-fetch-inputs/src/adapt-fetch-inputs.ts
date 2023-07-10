import {wrapFetch} from '@windyroad/wrap-fetch';

/**
 * Adapts a `fetch` function with the given adapter function.
 * @template WrapInputs The input types of the wrapper function.
 * @template FetchInputs The input types of the original `fetch` function.
 * @template FetchReturns The return type of the original `fetch` function.
 * @param fetchImpl The original `fetch` function to adapt.
 * @param adapter A function that takes the original `url` and `options` inputs and returns the modified inputs as an array.
 * @returns The adapted `fetch` function.
 */
export function adaptFetchInputs<
	WrapInputs extends any[] = Parameters<typeof fetch>,
	FetchInputs extends any[] = Parameters<typeof fetch>,
	FetchReturns = Awaited<ReturnType<typeof fetch>>,
>(
	fetchImpl: (...args: FetchInputs) => Promise<FetchReturns>,
	adapter: (...args: WrapInputs) => FetchInputs | Promise<FetchInputs>,
): (...args: WrapInputs) => Promise<FetchReturns> {
	// Wrap the fetch implementation with the wrapper function
	return wrapFetch(
		fetchImpl,
		async (
			fetchImpl: (...args: FetchInputs) => Promise<FetchReturns>,
			...args: WrapInputs
		) => {
			// Apply the input function to the inputs
			const modifiedInputs = await adapter(...args);

			// Call the original fetch implementation with the modified inputs
			return fetchImpl(...modifiedInputs);
		},
	);
}
