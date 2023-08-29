import {describe, test, expect} from 'vitest';
import {parseLinkHeader, LinkHeader} from '../src/index.js';

describe('HTTP Link Header', function () {
	test('standalone link (without rel)', function () {
		expect(() => parseLinkHeader('<example.com>')).toThrow(
			'Unexpected null rel',
		);
	});

	test('link with rel', function () {
		const link = parseLinkHeader('<example.com>; rel=example');
		const references = [{uri: 'example.com', rel: 'example'}];
		// Inspect.log( link )
		expect(link.refs).toEqual(references);
	});

	test('link with quoted rel', function () {
		const link = parseLinkHeader('<example.com>; rel="example"');
		const references = [{uri: 'example.com', rel: 'example'}];
		// Inspect.log( link )
		expect(link.refs).toEqual(references);
	});

	test('multiple links', function () {
		const link = parseLinkHeader(
			'<example.com>; rel="example", <example-01.com>; rel="alternate"',
		);
		const references = [
			{uri: 'example.com', rel: 'example'},
			{uri: 'example-01.com', rel: 'alternate'},
		];
		// Inspect.log( link )
		expect(link.refs).toEqual(references);
	});

	test('link with mixed quotes', function () {
		const link = parseLinkHeader(
			'<example.com>; rel="example", <example-01.com>; rel=alternate',
		);
		const references = [
			{uri: 'example.com', rel: 'example'},
			{uri: 'example-01.com', rel: 'alternate'},
		];
		// Inspect.log( link )
		expect(link.refs).toEqual(references);
	});

	// The "rel" parameter MUST NOT appear more than once in a given
	// link-value; occurrences after the first MUST be ignored by parsers.
	test('multiple rel attributes on same link', function () {
		const link = parseLinkHeader('<example.com>; rel="example"; rel="invalid"');
		const references = [{uri: 'example.com', rel: 'example'}];
		// Inspect.log( link )
		expect(link.refs).toEqual(references);
	});

	test('link with backslash escape in attribute', function () {
		const link = parseLinkHeader(
			'<example.com>; rel="example"; title="Something of \\"importance\\"',
		);
		const references = [
			{uri: 'example.com', rel: 'example', title: 'Something of "importance"'},
		];
		// Inspect.log( link )
		expect(link.refs).toEqual(references);
	});

	test('link with leading WS before delimiter', function () {
		const link = parseLinkHeader(
			'<example.com>; rel= example; title = Something',
		);
		const references = [
			{uri: 'example.com', rel: 'example', title: 'Something'},
		];
		// Inspect.log( link )
		expect(link.refs).toEqual(references);
	});

	describe('toString()', function () {
		test('link with double quote in anchor', function () {
			const link = new LinkHeader();
			link.refs.push({
				uri: 'example.com',
				rel: 'example',
				anchor: '/#anch"00"',
			});
			const expected = '<example.com>; rel=example; anchor="/#anch\\"00\\""';
			const actual = link.toString();
			expect(actual).toEqual(expected);
		});

		// See https://tools.ietf.org/html/rfc8288#section-3
		test('rel should not be URL encoded', function () {
			const value =
				'<https://api.github.com/user/repos?page=3&per_page=100>; rel="next", <https://api.github.com/user/repos?page=50&per_page=100>; rel="last"';
			const expected =
				'<https://api.github.com/user/repos?page=3&per_page=100>; rel=next, <https://api.github.com/user/repos?page=50&per_page=100>; rel=last';
			const link = parseLinkHeader(value);
			const references = [
				{
					uri: 'https://api.github.com/user/repos?page=3&per_page=100',
					rel: 'next',
				},
				{
					uri: 'https://api.github.com/user/repos?page=50&per_page=100',
					rel: 'last',
				},
			];
			// Inspect.log( link )
			expect(link.refs).toEqual(references);
			expect(link.toString()).toEqual(expected);
		});

		test('type should not be URL encoded', function () {
			const value = '</foo>; rel=alternate; type="application/hal+json"';
			const link = parseLinkHeader(value);
			const references = [
				{uri: '/foo', rel: 'alternate', type: 'application/hal+json'},
			];
			// Inspect.log( link )
			expect(link.refs).toEqual(references);
			expect(link.toString()).toEqual(value);
		});
	});

	test('handle varying attribute cardinality', function () {
		const value =
			'</example>; rel=alternate; hreflang=en-US; hreflang=de; type="text/html"; media=screen; media="should be ignored"';
		const expected =
			'</example>; rel=alternate; hreflang=en-US; hreflang=de; type="text/html"; media=screen';
		const link = parseLinkHeader(value);
		const references = [
			{
				uri: '/example',
				rel: 'alternate',
				hreflang: ['en-US', 'de'],
				type: 'text/html',
				media: 'screen',
			},
		];
		// Inspect.log( link )
		expect(link.refs).toEqual(references);
		expect(link.toString()).toEqual(expected);
	});

	test('case sensitive relation types', function () {
		const value = '<https://some.url>; rel="http://some.rel/caseSensitive"';
		const expected = '<https://some.url>; rel="http://some.rel/caseSensitive"';
		const references = [
			{uri: 'https://some.url', rel: 'http://some.rel/caseSensitive'},
		];
		const link = parseLinkHeader(value);
		// Check that comparison is case-insensitive, as specified in RFC8288, Section 2.2.1
		expect(link.rel('http://some.rel/casesensitive')).toEqual(references);
		// Verify that re-serialization maintains input casing
		expect(link.toString()).toEqual(expected);
	});
});
