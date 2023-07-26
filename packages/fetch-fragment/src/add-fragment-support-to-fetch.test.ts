import fc from 'fast-check';
import {describe, test, vi, beforeEach} from 'vitest';
import {addFragmentSupportToFetch} from './add-fragment-support-to-fetch.js';

describe('fetchFragment', () => {
	const mockResponse = {
		json: vi.fn(),
		body: 'mock body',
		status: 200,
		statusText: 'OK',
		headers: new Headers(),
	};

	const mockFetchImpl = vi
		.fn(async (...arguments_: Parameters<typeof fetch>) => new Response())
		.mockResolvedValue(mockResponse as unknown as Response);

	beforeEach(() => {
		vi.clearAllMocks();
		mockResponse.headers.set('Content-Type', 'application/json');
	});

	test('returns the original response if the URL does not have a hash', async ({
		expect,
	}) => {
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com');
		expect(response).toBe(mockResponse);
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});

	test('returns a 404 response if the fragment is not found in a JSON response', async ({
		expect,
	}) => {
		mockResponse.json.mockResolvedValueOnce({});
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com#/foo');
		expect(response.status).toBe(404);
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});

	test('returns a 400 response if the hash is an invalid pointer', async ({
		expect,
	}) => {
		mockResponse.json.mockResolvedValueOnce({});
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com#foo');
		expect(response.status).toBe(400);
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});

	test('returns a 415 response if the response is not JSON', async ({
		expect,
	}) => {
		mockResponse.headers.delete('Content-Type');

		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com#/foo');
		expect(response.status).toBe(415);
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});

	test('returns a fragment from a JSON response', async ({expect}) => {
		const mockFragment = {foo: [1, 2, 4, 'a', 'b', 'c', {bar: 'baz'}]};
		mockResponse.json.mockResolvedValueOnce(mockFragment);
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com#/foo');
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('application/json');
		expect(response.headers.get('Content-Length')).toBe(
			String(JSON.stringify(mockFragment.foo).length),
		);
		expect(await response.text()).toBe(JSON.stringify(mockFragment.foo));
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});

	test('filters Link headers that do not match the fragment hash', async ({
		expect,
	}) => {
		const mockFragment = {foo: 'bar'};
		mockResponse.json.mockResolvedValueOnce(mockFragment);
		mockResponse.headers.set('Link', '<https://example.com>; rel="self"');
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com#/foo');
		expect(response.headers.get('Link')).toBeNull();
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});

	test('updates Link-Template headers with the fragment hash', async ({
		expect,
	}) => {
		const mockFragment = {foo: 'bar'};
		mockResponse.json.mockResolvedValueOnce(mockFragment);
		mockResponse.headers.set(
			'Link-Template',
			'<https://example.com/{id}>; rel="self"',
		);
		mockResponse.headers.append(
			'Link',
			'<https://example.com/{id}>; rel="parent" anchor="/foo"',
		);
		mockResponse.headers.append(
			'Link',
			'<https://example.com/{id}>; rel="parent" anchor="/foo/bar"',
		);
		const fetchFragmentImpl = addFragmentSupportToFetch(mockFetchImpl);
		const response = await fetchFragmentImpl('https://example.com#/foo');
		expect(response.headers.get('Link')).toBe(
			'<https://example.com/{id}>; rel=parent, <https://example.com/{id}>; rel=parent; anchor="/bar"',
		);
		expect(response.headers.get('Link-Template')).toBeNull();
		expect(mockFetchImpl).toHaveBeenCalledTimes(1);
	});
});
