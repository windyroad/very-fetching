import {
	wrapFetch,
	type AwaitedFetchReturns,
	type FetchFunction,
} from '@windyroad/wrap-fetch';

/**
 * Decorates the response of a fetch request with additional properties.
 * @template Arguments The type of the input arguments for the `fetch` implementation.
 * @template ResponseType The awaited type of the `fetch` implementation response.
 * @template DecoratorReturns The return type of the decorator function.
 * @param decorator - The decorator function to apply to the response.
 * @param fetchImpl - The `fetch` implementation to use. Defaults to the global `fetch` function.
 * @returns - A decorated version of the `fetch` implementation.
 */
export function decorateFetchResponse<
	Arguments extends any[] = Parameters<typeof fetch>,
	ResponseType extends Response = Response,
	DecoratorReturns = ResponseType,
>(
	decorator: (
		response: ResponseType,
	) => Promise<DecoratorReturns> | DecoratorReturns,
	fetchImpl?: FetchFunction<Arguments, ResponseType>,
): (...arguments_: Arguments) => Promise<DecoratorReturns> {
	return decorateFetchResponseUsingInputs<
		Arguments,
		ResponseType,
		DecoratorReturns
	>(async (response, ...arguments_) => {
		const result = await decorator(response);
		return result;
	}, fetchImpl);
}

/**
 * Decorates the response of a fetch request with additional properties.
 * @template Arguments The type of the input arguments for the `fetch` implementation.
 * @template ResponseType The awaited type of the `fetch` implementation response.
 * @template DecoratorReturns The return type of the decorator function.
 * @param decorator - The decorator function to apply to the response.
 * @param fetchImpl - The `fetch` implementation to use. Defaults to the global `fetch` function.
 * @returns - A decorated version of the `fetch` implementation.
 */
export function decorateFetchResponseUsingInputs<
	Arguments extends any[] = Parameters<typeof fetch>,
	ResponseType extends Response = Response,
	DecoratorReturns = ResponseType,
>(
	decorator: (
		response: ResponseType,
		...arguments_: Arguments
	) => Promise<DecoratorReturns> | DecoratorReturns,
	fetchImpl?: FetchFunction<Arguments, ResponseType>,
): (...arguments_: Arguments) => Promise<DecoratorReturns> {
	return wrapFetch<Arguments, ResponseType, Arguments, DecoratorReturns>(
		async (fetchImpl, ...arguments_) => {
			const response = await fetchImpl(...arguments_);

			const modified = await decorator(response, ...arguments_);
			return modified;
		},
		fetchImpl,
	);
}
