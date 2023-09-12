import {describe, expect, test} from 'vitest';
import fc from 'fast-check';
import {resolveUrl} from './resolve-url.js';

describe('resolveUrl', () => {
	test('resolves absolute URLs', () => {
		expect(
			resolveUrl({url: 'https://example.com/path/to/resource', baseUrl: ''}),
		).toBe('https://example.com/path/to/resource');
		expect(
			resolveUrl({
				url: 'https://example.com/path/to/resource',
				baseUrl: 'https://example.com',
			}),
		).toBe('https://example.com/path/to/resource');
		expect(
			resolveUrl({
				url: 'https://example.com/path/to/resource',
				baseUrl: 'https://example.com/',
			}),
		).toBe('https://example.com/path/to/resource');
		expect(
			resolveUrl({
				url: 'https://example.com/path/to/resource',
				baseUrl: 'https://example.com/path/to/',
			}),
		).toBe('https://example.com/path/to/resource');
	});

	test('resolves relative URLs', () => {
		expect(resolveUrl({url: '/path/to/resource', baseUrl: ''})).toBe(
			'/path/to/resource',
		);
		expect(
			resolveUrl({url: '/path/to/resource', baseUrl: 'https://example.com'}),
		).toBe('https://example.com/path/to/resource');
		expect(
			resolveUrl({url: '/path/to/resource', baseUrl: 'https://example.com/'}),
		).toBe('https://example.com/path/to/resource');
		expect(
			resolveUrl({
				url: 'path/to/resource',
				baseUrl: 'https://example.com/path/to/',
			}),
		).toBe('https://example.com/path/to/path/to/resource');
	});

	test('resolves URLs with query parameters', () => {
		expect(resolveUrl({url: '/path/to/resource?foo=bar', baseUrl: ''})).toBe(
			'/path/to/resource?foo=bar',
		);
		expect(
			resolveUrl({
				url: '/path/to/resource?foo=bar',
				baseUrl: 'https://example.com',
			}),
		).toBe('https://example.com/path/to/resource?foo=bar');
		expect(
			resolveUrl({
				url: '/path/to/resource?foo=bar',
				baseUrl: 'https://example.com/',
			}),
		).toBe('https://example.com/path/to/resource?foo=bar');
		expect(
			resolveUrl({
				url: 'path/to/resource?foo=bar',
				baseUrl: 'https://example.com/path/to/',
			}),
		).toBe('https://example.com/path/to/path/to/resource?foo=bar');
	});

	test('resolves URLs with hash fragments', () => {
		expect(resolveUrl({url: '/path/to/resource#fragment', baseUrl: ''})).toBe(
			'/path/to/resource#fragment',
		);
		expect(
			resolveUrl({
				url: '/path/to/resource#fragment',
				baseUrl: 'https://example.com',
			}),
		).toBe('https://example.com/path/to/resource#fragment');
		expect(
			resolveUrl({
				url: '/path/to/resource#fragment',
				baseUrl: 'https://example.com/',
			}),
		).toBe('https://example.com/path/to/resource#fragment');
		expect(
			resolveUrl({
				url: 'path/to/resource#fragment',
				baseUrl: 'https://example.com/path/to/',
			}),
		).toBe('https://example.com/path/to/path/to/resource#fragment');
	});

	test('resolves URLs with URI templates', () => {
		expect(resolveUrl({url: '/path/{id}', baseUrl: ''})).toBe('/path/{id}');
		expect(
			resolveUrl({url: '/path/{id}', baseUrl: 'https://example.com'}),
		).toBe('https://example.com/path/{id}');
		expect(
			resolveUrl({url: '/path/{id}', baseUrl: 'https://example.com/'}),
		).toBe('https://example.com/path/{id}');
		expect(
			resolveUrl({url: 'path/{id}', baseUrl: 'https://example.com/path/to/'}),
		).toBe('https://example.com/path/to/path/{id}');
	});

	test('handles invalid URLs', () => {
		expect(() =>
			resolveUrl({
				url: 'https://example.com/path/to/resource',
				baseUrl: 'invalid-url',
			}),
		).toThrow(TypeError);
	});

	test('is idempotent', () => {
		const url = 'https://example.com/path/to/resource';
		const baseUrl = 'https://example.com/path/to/';
		const resolved1 = resolveUrl({url, baseUrl});
		const resolved2 = resolveUrl({url: resolved1, baseUrl});
		expect(resolved1).toBe(resolved2);
	});

	test('resolves URL fragments correctly', () => {
		fc.assert(
			fc.property(fc.webFragments(), fc.webUrl(), (url, baseUrl) => {
				const resolvedUrl = resolveUrl({url, baseUrl});
				const expectedUrl = new URL(url, baseUrl).href;
				expect(resolvedUrl).toBe(expectedUrl);
			}),
		);
	});

	//   Test('isFragmentOf returns true with fragments on a base', (t) => {
	//     fc.assert(
	//         fc.property(
	//             fc
	//                 .webFragments()
	//                 .map(
	//                     (fragment) =>
	//                         JsonPointer.create(`#/${fragment}`).uriFragmentIdentifier,
	//                 ),
	//             fc.webUrl().map((url) => new URL(url)),
	//             (fragment, base) => {
	//                 const fragmentUrl = new URL(fragment, base);
	//                 return isFragmentOf({
	//                     urlToCheck: fragmentUrl.href,
	//                     urlToCompare: base.href,
	//                 });
	//             },
	//         ),
	//         {verbose: true},
	//     );
	// });
});
