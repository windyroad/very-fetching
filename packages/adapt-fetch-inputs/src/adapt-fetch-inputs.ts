import {
	wrapFetch,
	type AwaitedFetchReturns,
	type FetchFunction,
} from '@windyroad/wrap-fetch';

/**
 * Adapts a `fetch` function with the given adapter function.
 * @template Arguments The type of the input arguments for the `fetch` implementation.
 * @template ResponseType The awaited type of the `fetch` implementation response.
 * @template WrapInputs The type of the input arguments for the adapter function.
 * @param adapter - The adapter function that modifies the `url` and `options` inputs of the `fetch` function.
 * @param fetchImpl - The `fetch` implementation to adapt. Defaults to the global `fetch` function.
 * @returns The adapted `fetch` function.
 */
export function adaptFetchInputs<
	Arguments extends any[] = Parameters<typeof fetch>,
	ResponseType extends Response = Response,
	WrapInputs extends any[] = Arguments,
>(
	adapter: (...arguments_: WrapInputs) => Arguments | Promise<Arguments>,
	fetchImpl?: FetchFunction<Arguments, ResponseType>,
): (...arguments_: WrapInputs) => Promise<ResponseType> {
	const wrapper = async (
		fetchImplInner: FetchFunction<Arguments, ResponseType>,
		...arguments_: WrapInputs
	): Promise<ResponseType> => {
		const modifiedInputs = await adapter(...arguments_);
		const response = await fetchImplInner(...modifiedInputs);
		return response;
	};

	return wrapFetch<Arguments, ResponseType, WrapInputs, ResponseType>(
		wrapper,
		fetchImpl,
	);
}
