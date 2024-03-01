import {test, describe, vi} from 'vitest';
import {MockResponse} from '@windyroad/fetch-fragment';
import {type ofetch} from 'ofetch';
import {decorateOfetchResponseWithLinks} from './decorate-ofetch-response-with-links.js';

/* Interface $Fetch {
    <T = any, R extends ResponseType = "json">(request: FetchRequest, options?: FetchOptions<R>): Promise<MappedType<R, T>>;
    raw<T = any, R extends ResponseType = "json">(request: FetchRequest, options?: FetchOptions<R>): Promise<FetchResponse<MappedType<R, T>>>;
    native: Fetch;
    create(defaults: FetchOptions): $Fetch;
}
*/

describe('decorateOfetchResponseWithLinks', () => {
	test('decorateOfetchResponseWithLinks adds links method to response', async ({
		expect,
	}) => {
		const mockOfetch = async (
			...arguments_: Parameters<(typeof ofetch)['raw']>
		) => new Response();

		const decoratedFetch = decorateOfetchResponseWithLinks(mockOfetch);
		const response = await decoratedFetch('https://example.com');
		expect(response.links()).toEqual([]);
	});

	test('decorateOfetchResponseWithLinks handles multiple link headers', async ({
		expect,
	}) => {
		const fetchImpl = async (
			...arguments_: Parameters<(typeof ofetch)['raw']>
		) =>
			new Response(null, {
				headers: {
					link: '<https://example.com>; rel="resource"',
					'link-template':
						'<https://example.com/{id}>; rel="resource-template"',
				},
			});
		const decoratedFetch = decorateOfetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('https://example.com');
		expect(response.links()).toEqual([
			{uri: 'https://example.com', rel: 'resource'},
			{uri: 'https://example.com/{id}', rel: 'resource-template'},
		]);
	});

	test('decorateOfetchResponseWithLinks handles undefined link header', async ({
		expect,
	}) => {
		const fetchImpl = async (
			...arguments_: Parameters<(typeof ofetch)['raw']>
		) => new Response(null, {headers: {}});
		const decoratedFetch = decorateOfetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('https://example.com');
		expect(response.links()).toEqual([]);
	});

	test('decorateOfetchResponseWithLinks passes through fetch errors', async ({
		expect,
	}) => {
		const fetchImpl = async (
			...arguments_: Parameters<(typeof ofetch)['raw']>
		) => {
			throw new Error('fetch error');
		};

		const decoratedFetch = decorateOfetchResponseWithLinks(fetchImpl);
		await expect(decoratedFetch('https://example.com')).rejects.toThrow(
			'fetch error',
		);
	});

	test('decorateOfetchResponseWithLinks passes through single fetch arguments', async ({
		expect,
	}) => {
		const mockFetch = vi.fn(
			async (...arguments_: Parameters<(typeof ofetch)['raw']>) =>
				new Response(),
		);

		const decoratedFetch = decorateOfetchResponseWithLinks(mockFetch);
		await decoratedFetch('https://example.com');
		expect(mockFetch).toBeCalledWith('https://example.com');
	});

	test('decorateOfetchResponseWithLinks passes through multiple fetch arguments', async ({
		expect,
	}) => {
		const mockFetch = vi.fn(
			async (...arguments_: Parameters<(typeof ofetch)['raw']>) =>
				new Response(),
		);

		const decoratedFetch = decorateOfetchResponseWithLinks(mockFetch);
		await decoratedFetch('https://example.com', {
			method: 'POST',
		});
		expect(mockFetch).toBeCalledWith('https://example.com', {
			method: 'POST',
		});
	});

	test('links method filters links by rel', async ({expect}) => {
		const fetchImpl = async (input: RequestInfo, init?: RequestInit) => {
			return new Response(null, {
				headers: {
					link: '<https://example.com/related>; rel="related", <https://example.com/other>; rel="other"',
				},
			});
		};

		const fetchWithLinks = decorateOfetchResponseWithLinks(fetchImpl);
		const response = await fetchWithLinks('https://example.com');
		expect(response.links('related')).toEqual([
			{uri: 'https://example.com/related', rel: 'related'},
		]);
		expect(response.links('other')).toEqual([
			{uri: 'https://example.com/other', rel: 'other'},
		]);
		expect(response.links('unrelated')).toEqual([]);
	});

	test('links method filters links by multiple properties', async ({
		expect,
	}) => {
		const fetchImpl = async (input: RequestInfo, init?: RequestInit) => {
			return new Response(null, {
				headers: {
					link: '<https://example.com/related>; rel="related"; type="text/html", <https://example.com/other>; rel="related"; type="text/plain"',
				},
			});
		};

		const fetchWithLinks = decorateOfetchResponseWithLinks(fetchImpl);
		const response = await fetchWithLinks('https://example.com');
		expect(response.links({rel: 'related', type: 'text/html'})).toEqual([
			{uri: 'https://example.com/related', rel: 'related', type: 'text/html'},
		]);
		expect(response.links({rel: 'related', type: 'text/plain'})).toEqual([
			{uri: 'https://example.com/other', rel: 'related', type: 'text/plain'},
		]);
	});

	test('decorateOfetchResponseWithLinks expands link templates with parameters', async ({
		expect,
	}) => {
		const fetchImpl = async (
			...arguments_: Parameters<(typeof ofetch)['raw']>
		) =>
			new Response(null, {
				headers: {
					'link-template':
						'<https://example.com/{id}>; rel="resource-template"',
				},
			});

		const decoratedFetch = decorateOfetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('https://example.com');

		expect(response.links(undefined, {id: '123'})).toEqual([
			{uri: 'https://example.com/123', rel: 'resource-template'},
		]);
	});

	test('decorateOfetchResponseWithLinks does not expand link templates without parameters', async ({
		expect,
	}) => {
		const fetchImpl = async (
			...arguments_: Parameters<(typeof ofetch)['raw']>
		) =>
			new Response(null, {
				headers: {
					'link-template':
						'<https://example.com/{foo}>; rel="resource-template"',
				},
			});

		const decoratedFetch = decorateOfetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('https://example.com');

		expect(response.links('resource-template', {foo: 'bar'})).toEqual([
			{uri: 'https://example.com/bar', rel: 'resource-template'},
		]);
	});

	test('should add links with variables for a template hash', async ({
		expect,
	}) => {
		const json = {
			foo: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
			],
		};
		const fetchImpl = vi.fn().mockResolvedValue(
			new MockResponse(JSON.stringify(json), {
				headers: new Headers({
					link: '<#/foo/{index}>; rel="item"',
					'Content-Type': 'application/json',
				}),
				url: 'http://example.com',
			}),
		);
		const decoratedFetch = decorateOfetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('http://example.com');
		const links = response.links();
		expect(links).toEqual([
			{
				uri: 'http://example.com/#/foo/0',
				rel: 'item',
				fragment: {
					path: '#/foo/0',
					value: json.foo[0],
					variables: {index: '0'},
				},
			},
			{
				uri: 'http://example.com/#/foo/1',
				rel: 'item',
				fragment: {
					path: '#/foo/1',
					value: json.foo[1],
					variables: {index: '1'},
				},
			},
		]);
	});

	test('should add links with variables for a template hash without response.url', async ({
		expect,
	}) => {
		const json = {
			foo: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
			],
		};
		const fetchImpl = vi.fn().mockResolvedValue(
			new MockResponse(JSON.stringify(json), {
				headers: new Headers({
					link: '<#/foo/{index}>; rel="item"',
					'Content-Type': 'application/json',
				}),
				url: undefined as unknown as string,
			}),
		);
		const decoratedFetch = decorateOfetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('http://example.com');
		const links = response.links();
		expect(links).toEqual([
			{
				uri: '#/foo/0',
				rel: 'item',
				fragment: {
					path: '#/foo/0',
					value: json.foo[0],
					variables: {index: '0'},
				},
			},
			{
				uri: '#/foo/1',
				rel: 'item',
				fragment: {
					path: '#/foo/1',
					value: json.foo[1],
					variables: {index: '1'},
				},
			},
		]);
	});

	test('should add links with variables for a nested template hash', async ({
		expect,
	}) => {
		const json = {
			foo: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
			],
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'bar/baz': [
				{id: 4, name: 'Jane'},
				{id: 6, name: 'Bruce'},
			],
		};
		const fetchImpl = vi.fn().mockResolvedValue(
			new MockResponse(JSON.stringify(json), {
				headers: new Headers({
					link: '<#/{key}/{index}>; rel="item"',
					'Content-Type': 'application/json',
				}),
				url: 'http://example.com',
			}),
		);
		const decoratedFetch = decorateOfetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('http://example.com');
		const links = response.links();
		expect(links).toEqual([
			{
				uri: 'http://example.com/#/foo/0',
				rel: 'item',
				fragment: {
					path: '#/foo/0',
					value: json.foo[0],
					variables: {index: '0', key: 'foo'},
				},
			},
			{
				uri: 'http://example.com/#/foo/1',
				rel: 'item',
				fragment: {
					path: '#/foo/1',
					value: json.foo[1],
					variables: {index: '1', key: 'foo'},
				},
			},
			{
				uri: 'http://example.com/#/bar~1baz/0',
				rel: 'item',
				fragment: {
					path: '#/bar~1baz/0',
					value: json['bar/baz'][0],
					variables: {index: '0', key: 'bar/baz'},
				},
			},
			{
				uri: 'http://example.com/#/bar~1baz/1',
				rel: 'item',
				fragment: {
					path: '#/bar~1baz/1',
					value: json['bar/baz'][1],
					variables: {index: '1', key: 'bar/baz'},
				},
			},
		]);
	});

	test('should not add links with variables for a template hash of not json', async ({
		expect,
	}) => {
		const json = {
			foo: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
			],
		};
		const fetchImpl = vi.fn().mockResolvedValue(
			new MockResponse(JSON.stringify(json), {
				headers: new Headers({
					link: '<#/foo/{index}>; rel="item"',
				}),
				url: 'http://example.com',
			}),
		);
		const decoratedFetch = decorateOfetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('http://example.com');
		const links = response.links();
		expect(links).toEqual([
			{uri: 'http://example.com/#/foo/{index}', rel: 'item'},
		]);
	});

	test('should add links with anchors for a template hash with anchor', async ({
		expect,
	}) => {
		const json = {
			foo: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
			],
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'bar/baz': [
				{id: 4, name: 'Jane'},
				{id: 6, name: 'Bruce'},
			],
		};
		const fetchImpl = vi.fn().mockResolvedValue(
			new MockResponse(JSON.stringify(json), {
				headers: new Headers({
					link: '<#/{key}/{index}>; rel="item", <#/{key}/{index}/name>; rel="name" anchor="#/{key}/{index}"',
					'Content-Type': 'application/json',
				}),
				url: 'http://example.com',
			}),
		);
		const decoratedFetch = decorateOfetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('http://example.com');
		const links = response.links();
		expect(links).toEqual([
			{
				uri: 'http://example.com/#/foo/0',
				rel: 'item',
				fragment: {
					path: '#/foo/0',
					value: json.foo[0],
					variables: {index: '0', key: 'foo'},
				},
			},
			{
				uri: 'http://example.com/#/foo/1',
				rel: 'item',
				fragment: {
					path: '#/foo/1',
					value: json.foo[1],
					variables: {index: '1', key: 'foo'},
				},
			},
			{
				uri: 'http://example.com/#/bar~1baz/0',
				rel: 'item',
				fragment: {
					path: '#/bar~1baz/0',
					value: json['bar/baz'][0],
					variables: {index: '0', key: 'bar/baz'},
				},
			},
			{
				uri: 'http://example.com/#/bar~1baz/1',
				rel: 'item',
				fragment: {
					path: '#/bar~1baz/1',
					value: json['bar/baz'][1],
					variables: {index: '1', key: 'bar/baz'},
				},
			},
			{
				uri: 'http://example.com/#/foo/0/name',
				rel: 'name',
				anchor: '#/foo/0',
				fragment: {
					path: '#/foo/0/name',
					value: json.foo[0].name,
					variables: {index: '0', key: 'foo'},
				},
			},
			{
				uri: 'http://example.com/#/foo/1/name',
				rel: 'name',
				anchor: '#/foo/1',
				fragment: {
					path: '#/foo/1/name',
					value: json.foo[1].name,
					variables: {index: '1', key: 'foo'},
				},
			},
			{
				uri: 'http://example.com/#/bar~1baz/0/name',
				rel: 'name',
				anchor: '#/bar~1baz/0',
				fragment: {
					path: '#/bar~1baz/0/name',
					value: json['bar/baz'][0].name,
					variables: {index: '0', key: 'bar/baz'},
				},
			},
			{
				uri: 'http://example.com/#/bar~1baz/1/name',
				rel: 'name',
				anchor: '#/bar~1baz/1',
				fragment: {
					path: '#/bar~1baz/1/name',
					value: json['bar/baz'][1].name,
					variables: {index: '1', key: 'bar/baz'},
				},
			},
		]);
	});

	test('should not add links for a non-matching hash', async ({expect}) => {
		const json = {
			foo: [
				{id: 1, name: 'Alice'},
				{id: 2, name: 'Bob'},
			],
		};
		const fetchImpl = vi.fn().mockResolvedValue(
			new MockResponse(JSON.stringify(json), {
				headers: new Headers({
					link: '<#/bar/{id}>; rel="item"',
					'Content-Type': 'application/json',
				}),
				url: 'http://example.com',
			}),
		);
		const decoratedFetch = decorateOfetchResponseWithLinks(fetchImpl);
		const response = await decoratedFetch('http://example.com');
		const links = response.links();
		expect(links).toEqual([]);
	});
});
