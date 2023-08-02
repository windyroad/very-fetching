import {type AwaitedFetchReturns} from '@windyroad/wrap-fetch';

export type InitialResponseBodyState<
	FetchImpl extends (
		...arguments_: any[]
	) => Promise<Pick<Response, 'json' | 'clone'>>,
> = {
	clonedResponse?: undefined;
	originalResponse: AwaitedFetchReturns<FetchImpl>;
	jsonBody?: undefined;
};

export type ClonedResponseBodyState<
	FetchImpl extends (
		...arguments_: any[]
	) => Promise<Pick<Response, 'json' | 'clone'>>,
> = {
	clonedResponse: AwaitedFetchReturns<FetchImpl>;
	originalResponse: AwaitedFetchReturns<FetchImpl>;
	jsonBody: Record<string, unknown>;
};

export type ResponseBodyState<
	FetchImpl extends (
		...arguments_: any[]
	) => Promise<Pick<Response, 'json' | 'clone'>>,
> = ClonedResponseBodyState<FetchImpl> | InitialResponseBodyState<FetchImpl>;

/**
 * Gets the response body from a fetch response. If the response has not been cloned,
 * it will be cloned and the JSON body will be parsed.
 * The original response will have it's body consumed. The clone will not not have it's body consumed.
 * @template FetchImpl - The type of the fetch implementation.
 * @param responseBodyState - The response body state.
 * @param responseBodyState.originalResponse - The original fetch response.
 * @param responseBodyState.clonedResponse - The cloned fetch response.
 * @param responseBodyState.jsonBody - The parsed JSON response body.
 * @returns The response body state with the parsed JSON response body.
 */
export async function getBody<
	FetchImpl extends (
		...arguments_: any[]
	) => Promise<Pick<Response, 'json' | 'clone'>> = typeof fetch,
>(
	responseBodyState: ResponseBodyState<FetchImpl>,
): Promise<ClonedResponseBodyState<FetchImpl>> {
	if (responseBodyState.jsonBody === undefined) {
		const clonedResponse =
			responseBodyState.originalResponse.clone() as AwaitedFetchReturns<FetchImpl>;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const jsonBody = await responseBodyState.originalResponse.json();
		return {
			clonedResponse,
			originalResponse: responseBodyState.originalResponse,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			jsonBody,
		};
	}

	return responseBodyState;
}
