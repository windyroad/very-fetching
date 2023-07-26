/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
import {
	wrapFetch,
	type FetchInputs,
	type AwaitedFetchReturns,
} from '@windyroad/wrap-fetch';

/**
 * Adapts a `fetch` function with the given adapter function.
 * @template FetchImpl The type of the original `fetch` function.
 * @template WrapInputs The input types of the wrapper function.
 * @param adapter A function that takes the original `url` and `options` inputs and returns the modified inputs as an array.
 * @param fetchImpl The original `fetch` function to adapt. Defaults to the global `fetch` function.
 * @returns The adapted `fetch` function.
 */
export function adaptFetchInputs<
	FetchImpl extends (...arguments_: any[]) => Promise<any> = typeof fetch,
	WrapInputs extends any[] = Parameters<FetchImpl>,
>(
	adapter: (
		...arguments_: WrapInputs
	) => FetchInputs<FetchImpl> | Promise<FetchInputs<FetchImpl>>,
	fetchImpl?: FetchImpl,
): (...arguments_: WrapInputs) => Promise<AwaitedFetchReturns<FetchImpl>> {
	const wrapper = async (
		fetchImplInner: FetchImpl,
		...arguments_: WrapInputs
	): Promise<AwaitedFetchReturns<FetchImpl>> => {
		const modifiedInputs = await adapter(...arguments_);
		const response = await fetchImplInner(...modifiedInputs);
		return response;
	};

	return wrapFetch<FetchImpl, WrapInputs, AwaitedFetchReturns<FetchImpl>>(
		wrapper,
		fetchImpl,
	);
}
