/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
import {wrapFetch, type AwaitedFetchReturns} from '@windyroad/wrap-fetch';

/**
 * Adapts a `fetch` function with the given adapter function.
 * @template Arguments The type of the input arguments for the `fetch` implementation.
 * @template FetchImpl The type of the `fetch` implementation.
 * @template WrapInputs The type of the input arguments for the adapter function.
 * @param adapter - The adapter function that modifies the `url` and `options` inputs of the `fetch` function.
 * @param fetchImpl - The `fetch` implementation to adapt. Defaults to the global `fetch` function.
 * @returns The adapted `fetch` function.
 */
export function adaptFetchInputs<
	Arguments extends any[] = Parameters<typeof fetch>,
	FetchImpl extends (...arguments_: Arguments) => Promise<any> = (
		...arguments_: Arguments
	) => ReturnType<typeof fetch>,
	WrapInputs extends any[] = Arguments,
>(
	adapter: (...arguments_: WrapInputs) => Arguments | Promise<Arguments>,
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

	return wrapFetch<
		Arguments,
		FetchImpl,
		WrapInputs,
		AwaitedFetchReturns<FetchImpl>
	>(wrapper, fetchImpl);
}
