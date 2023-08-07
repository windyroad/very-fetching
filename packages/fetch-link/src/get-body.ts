import {type AwaitedFetchReturns} from '@windyroad/wrap-fetch';

export type InitialResponseBodyState<
	ResponseType extends Pick<Response, 'json' | 'clone'>,
> = {
	clonedResponse?: undefined;
	originalResponse: ResponseType;
	jsonBody?: undefined;
};

export type ClonedResponseBodyState<
	ResponseType extends Pick<Response, 'json' | 'clone'>,
> = {
	clonedResponse: ResponseType;
	originalResponse: ResponseType;
	jsonBody: Record<string, unknown>;
};

export type ResponseBodyState<
	ResponseType extends Pick<Response, 'json' | 'clone'>,
> =
	| ClonedResponseBodyState<ResponseType>
	| InitialResponseBodyState<ResponseType>;

/**
 * Gets the response body from a fetch response. If the response has not been cloned,
 * it will be cloned and the JSON body will be parsed.
 * The original response will have it's body consumed. The clone will not not have it's body consumed.
 * @template ResponseType - The awaited response type of the fetch implementation.
 * @param responseBodyState - The response body state.
 * @param responseBodyState.originalResponse - The original fetch response.
 * @param responseBodyState.clonedResponse - The cloned fetch response.
 * @param responseBodyState.jsonBody - The parsed JSON response body.
 * @returns The response body state with the parsed JSON response body.
 */
export async function getBody<
	ResponseType extends Pick<Response, 'json' | 'clone'> = Response,
>(
	responseBodyState: ResponseBodyState<ResponseType>,
): Promise<ClonedResponseBodyState<ResponseType>> {
	if (responseBodyState.jsonBody === undefined) {
		const clonedResponse =
			responseBodyState.originalResponse.clone() as unknown as ResponseType;
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
