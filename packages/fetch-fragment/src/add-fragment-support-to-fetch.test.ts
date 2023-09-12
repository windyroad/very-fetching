import {describe, test, vi, beforeEach} from 'vitest';
import {MockResponse} from './mock-response.js';
import {addFragmentSupportToFetch} from './add-fragment-support-to-fetch.js';
import {FragmentResponse} from './fragment-response.js';

describe('fetchFragment', () => {
	let mockResponseBody: any = {};
	const mockResponseHeaders = new Headers();
	let mockResponseOptions = {
		status: 200,
		statusText: 'OK',
		headers: mockResponseHeaders,
		url: 'https://example.com',
	};
	const mockFetchImpl = vi.fn(
		async (...arguments_: Parameters<typeof fetch>): Promise<Response> =>
			new MockResponse(
				mockResponseBody ? JSON.stringify(mockResponseBody) : undefined,
				mockResponseOptions,
			),
	);

	beforeEach(() => {
		vi.clearAllMocks();
		mockResponseHeaders.set('Content-Type', 'application/json');
		mockResponseOptions = {
			status: 200,
			statusText: 'OK',
			headers: mockResponseHeaders,
			url: 'https://example.com',
		};
	});

	test('returns the original response if the URL does not have a hash', async ({
		expect,
	}) => {
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com');
		expect(response.url).toEqual('https://example.com');
		expect(await response.json()).toEqual({});
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});

	test('returns a 404 response if the fragment is not found in a JSON response', async ({
		expect,
	}) => {
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com#/foo');
		expect(response.status).toBe(404);
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});

	test('returns a 400 response if the hash is an invalid pointer', async ({
		expect,
	}) => {
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com#foo');
		expect(response.status).toBe(400);
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});

	test('returns a 415 response if the response is not JSON', async ({
		expect,
	}) => {
		mockResponseHeaders.delete('Content-Type');

		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com#/foo');
		expect(response.status).toBe(415);
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});

	test('returns a fragment from a JSON response', async ({expect}) => {
		mockResponseBody = {foo: [1, 2, 4, 'a', 'b', 'c', {bar: 'baz'}]};
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com#/foo');
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('application/json');
		expect(response.headers.get('Content-Length')).toBe(
			String(JSON.stringify(mockResponseBody.foo).length),
		);
		expect(await response.json()).toEqual(mockResponseBody.foo);
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
		expect(response).toBeInstanceOf(FragmentResponse);
		const fragmentResponse = response as FragmentResponse<Response>;
		expect(fragmentResponse.parent).toBeInstanceOf(MockResponse);
		expect(await fragmentResponse.parent?.json()).toEqual(mockResponseBody);
	});

	test('returns a relative fragment from a JSON response', async ({expect}) => {
		mockResponseOptions = {
			status: 200,
			statusText: 'OK',
			headers: mockResponseHeaders,
			url: undefined as unknown as string,
		};
		mockResponseBody = {foo: [1, 2, 4, 'a', 'b', 'c', {bar: 'baz'}]};
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('#/foo');
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('application/json');
		// Expect(response.headers.get('Content-Length')).toBe(
		// 	String(JSON.stringify(mockResponseBody.foo).length),
		// );
		expect(await response.json()).toEqual(mockResponseBody.foo);
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
		expect(response).toBeInstanceOf(FragmentResponse);
		const fragmentResponse = response as FragmentResponse<Response>;
		expect(fragmentResponse.parent).toBeInstanceOf(MockResponse);
		expect(await fragmentResponse.parent?.json()).toEqual(mockResponseBody);
	});

	test('filters Link headers that do not match the fragment hash', async ({
		expect,
	}) => {
		mockResponseBody = {foo: 'bar'};
		mockResponseHeaders.set('Link', '<https://example.com>; rel="self"');
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com#/foo');
		expect(response.headers.get('Link')).toBeNull();
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});

	test('updates Link-Template headers with the fragment hash', async ({
		expect,
	}) => {
		mockResponseBody = {foo: 'bar'};
		mockResponseHeaders.set(
			'Link-Template',
			'<https://example.com/{id}>; rel="self"',
		);
		mockResponseHeaders.append(
			'Link',
			'<https://example.com/{id}>; rel="parent" anchor="#/foo"',
		);
		mockResponseHeaders.append(
			'Link',
			'<https://example.com/{id}>; rel="parent" anchor="#/foo/bar"',
		);
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com#/foo');
		expect(response.headers.get('Link')).toBe(
			'<https://example.com/{id}>; rel=parent, <https://example.com/{id}>; rel=parent; anchor="#/bar"',
		);
		expect(response.headers.get('Link-Template')).toBeNull();
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});
});
