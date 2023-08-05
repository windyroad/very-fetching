import {wrapFetch, type AwaitedFetchReturns} from '@windyroad/wrap-fetch';

/**
 * Decorates the response of a fetch request with additional properties.
 * @template Arguments The type of the input arguments for the `fetch` implementation.
 * @template FetchImpl The type of the `fetch` implementation.
 * @template DecoratorReturns The return type of the decorator function.
 * @param decorator - The decorator function to apply to the response.
 * @param fetchImpl - The `fetch` implementation to use. Defaults to the global `fetch` function.
 * @returns - A decorated version of the `fetch` implementation.
 */
export function decorateFetchResponse<
	Arguments extends any[] = Parameters<typeof fetch>,
	FetchImpl extends (...arguments_: Arguments) => Promise<any> = (
		...arguments_: Arguments
	) => ReturnType<typeof fetch>,
	DecoratorReturns = AwaitedFetchReturns<FetchImpl>,
>(
	decorator: (
		response: AwaitedFetchReturns<FetchImpl>,
	) => Promise<DecoratorReturns> | DecoratorReturns,
	fetchImpl?: FetchImpl,
): (...arguments_: Arguments) => Promise<DecoratorReturns> {
	return decorateFetchResponseUsingInputs<
		Arguments,
		FetchImpl,
		DecoratorReturns
	>(async (response, ...arguments_) => {
		const result = await decorator(response);
		return result;
	}, fetchImpl);
}

/**
 * Decorates the response of a fetch request with additional properties.
 * @template Arguments The type of the input arguments for the `fetch` implementation.
 * @template FetchImpl The type of the `fetch` implementation.
 * @template DecoratorReturns The return type of the decorator function.
 * @param decorator - The decorator function to apply to the response.
 * @param fetchImpl - The `fetch` implementation to use. Defaults to the global `fetch` function.
 * @returns - A decorated version of the `fetch` implementation.
 */
export function decorateFetchResponseUsingInputs<
	Arguments extends any[] = Parameters<typeof fetch>,
	FetchImpl extends (...arguments_: Arguments) => Promise<any> = (
		...arguments_: Arguments
	) => ReturnType<typeof fetch>,
	DecoratorReturns = AwaitedFetchReturns<FetchImpl>,
>(
	decorator: (
		response: AwaitedFetchReturns<FetchImpl>,
		...arguments_: Arguments
	) => Promise<DecoratorReturns> | DecoratorReturns,
	fetchImpl?: FetchImpl,
): (...arguments_: Arguments) => Promise<DecoratorReturns> {
	return wrapFetch<Arguments, FetchImpl, Arguments, DecoratorReturns>(
		async (fetchImpl, ...arguments_) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const response = await fetchImpl(...arguments_);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const modified = await decorator(response, ...arguments_);
			return modified;
		},
		fetchImpl,
	);
}
