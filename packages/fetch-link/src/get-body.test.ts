import {test, vi} from 'vitest';
import fc from 'fast-check';
import {getBody, type ResponseBodyState} from './get-body.js';

test('getBody clonedResponse boyd can be consumed', async ({expect}) => {
	const originalResponse = new Response(
		JSON.stringify({data: 'Hello, world!'}),
	);

	const responseBodyState: ResponseBodyState<Response> = {
		originalResponse,
		clonedResponse: undefined,
		jsonBody: undefined,
	};

	const result = await getBody(responseBodyState);
	expect(result.jsonBody).toEqual({data: 'Hello, world!'});
	expect(result.originalResponse.bodyUsed).toBeTruthy();
	expect(result.clonedResponse).not.toBeUndefined();
	expect(result.clonedResponse?.bodyUsed).toBeFalsy();

	expect(await result.clonedResponse?.json()).toEqual({data: 'Hello, world!'});
});

test('getBody is idempotent', async ({expect}) => {
	const originalResponse = new Response(
		JSON.stringify({data: 'Hello, world!'}),
	);

	const responseBodyState: ResponseBodyState<Response> = {
		originalResponse,
		clonedResponse: undefined,
		jsonBody: undefined,
	};

	let result = await getBody(responseBodyState);
	expect(result.jsonBody).toEqual({data: 'Hello, world!'});
	expect(result.originalResponse.bodyUsed).toBeTruthy();
	expect(result.clonedResponse).not.toBeUndefined();
	expect(result.clonedResponse?.bodyUsed).toBeFalsy();
	result = await getBody(result);
	expect(result.jsonBody).toEqual({data: 'Hello, world!'});
	expect(result.originalResponse.bodyUsed).toBeTruthy();
	expect(result.clonedResponse).not.toBeUndefined();
	expect(result.clonedResponse?.bodyUsed).toBeFalsy();
	// And we can still get the body
	expect(await result.clonedResponse?.json()).toEqual({data: 'Hello, world!'});
});
