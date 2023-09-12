import {test} from 'vitest';
import fc from 'fast-check';
import {JsonPointer} from 'json-ptr';
import {isFragmentOf} from './is-fragment-of.js';

test('isFragmentOf with same URL', (t) => {
	const url = new URL('http://example.com/#/foo/1');
	t.expect(
		!isFragmentOf({
			urlToCheck: url.href,
			urlToCompare: url.href,
		}),
	);
});

test('isFragmentOf with suffix URL', (t) => {
	t.expect(
		isFragmentOf({
			urlToCheck: 'http://example.com/#/foo/1',
			urlToCompare: 'http://example.com/#/foo/1/bar',
		}),
	).toBeFalsy();
});

test('isFragmentOf with middle URL', (t) => {
	t.expect(
		isFragmentOf({
			urlToCheck: 'http://example.com/#/foo/1',
			urlToCompare: 'http://example.com/#/foo/1/bar/baz',
		}),
	).toBeFalsy();
});

test('isFragmentOf with same base URL', (t) => {
	t.expect(
		isFragmentOf({
			urlToCheck: 'http://example.com/#/foo/',
			urlToCompare: 'http://example.com/#/foo/',
		}),
	).toBeTruthy();
});

test('isFragmentOf with different base URL', (t) => {
	t.expect(
		isFragmentOf({
			urlToCheck: 'http://q9e.ac/#/Ln%2C%3DIfe',
			urlToCompare: 'http://q9e.ac/',
		}),
	).toBeTruthy();
});

test('isFragmentOf with different fragment URL', (t) => {
	t.expect(
		isFragmentOf({
			urlToCheck: 'http://example.com/#/foo/',
			urlToCompare: 'http://example.com/#/foo/1',
		}),
	).toBeFalsy();
});

test('isFragmentOf with different prefix URL', (t) => {
	t.expect(
		isFragmentOf({
			urlToCheck: 'http://example.com/#/foo/1',
			urlToCompare: 'http://example.com/#/bar/1',
		}),
	).toBeFalsy();
});

test('isFragmentOf with different domain URL', (t) => {
	t.expect(
		isFragmentOf({
			urlToCheck: 'http://example.com/#/foo/1',
			urlToCompare: 'http://example.com.au/#/foo/1',
		}),
	).toBeFalsy();
});

test('isFragmentOf with different path URL', (t) => {
	t.expect(
		isFragmentOf({
			urlToCheck: 'http://example.com/#/foo/1',
			urlToCompare: 'http://example.com/somepath/#/foo/2',
		}),
	).toBeFalsy();
});

test('isFragmentOf with empty fragment URL', (t) => {
	t.expect(
		isFragmentOf({
			urlToCheck: 'http://example.com/#/foo/1',
			urlToCompare: 'http://example.com/#/foo/',
		}),
	).toBeTruthy();
});

test('isFragmentOf with empty URL', (t) => {
	t.expect(
		isFragmentOf({
			urlToCheck: 'http://example.com#/foo/1',
			urlToCompare: 'http://example.com',
		}),
	).toBeTruthy();
});

test('isFragmentOf', (t) => {
	t.expect(
		isFragmentOf({
			urlToCheck: 'http://q9e.ac/#/Ln%2C%3DIfe',
			urlToCompare: 'http://q9e.ac/',
		}),
	).toBeTruthy();
});

test('isFragmentOf returns true with fragments on a base', (t) => {
	fc.assert(
		fc.property(
			fc
				.webFragments()
				.map(
					(fragment) =>
						JsonPointer.create(`#/${fragment}`).uriFragmentIdentifier,
				),
			fc.webUrl().map((url) => new URL(url)),
			(fragment, base) => {
				const fragmentUrl = new URL(fragment, base);
				return isFragmentOf({
					urlToCheck: fragmentUrl.href,
					urlToCompare: base.href,
				});
			},
		),
		{verbose: true},
	);
});

test('isFragmentOf returns true with fragments on a base with a fragments', (t) => {
	fc.assert(
		fc.property(
			fc
				.webFragments()
				.map(
					(fragment) =>
						JsonPointer.create(`#/foo/bar/${fragment}`).uriFragmentIdentifier,
				),
			fc.webUrl().map((url) => new URL(`${url}#/foo/bar/`)),
			(fragment, base) => {
				const fragmentUrl = new URL(fragment, base);
				return isFragmentOf({
					urlToCheck: fragmentUrl.href,
					urlToCompare: base.href,
				});
			},
		),
		{verbose: true},
	);
});
