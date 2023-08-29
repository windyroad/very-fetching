import {describe, test, expect} from 'vitest';
import {parseLinkHeader} from '../src/index.js';

describe('RFC 8288', function () {
	describe('3.5 Link Header Field Examples', function () {
		// Indicates that "chapter2" is previous to this resource in a logical navigation path.
		test('Example 1: Previous Chapter', function () {
			const link =
				parseLinkHeader(`<http://example.com/TheBook/chapter2>; rel="previous";
         title="previous chapter"`);

			const references = [
				{
					uri: 'http://example.com/TheBook/chapter2',
					rel: 'previous',
					title: 'previous chapter',
				},
			];

			// Console.log( inspect( link ) )
			expect(link.refs).toEqual(references);
		});

		// Indicates that the root resource ("/") is related to this resource
		// with the extension relation type "http://example.net/foo".
		test('Example 2: Root resource', function () {
			const link = parseLinkHeader(`</>; rel="http://example.net/foo"`);
			const references = [{uri: '/', rel: 'http://example.net/foo'}];
			// Console.log( inspect( link ) )
			expect(link.refs).toEqual(references);
		});

		test('Example 3: Anchors', function () {
			const link = parseLinkHeader(`</terms>; rel="copyright"; anchor="#foo"`);
			const references = [
				{
					anchor: '#foo',
					rel: 'copyright',
					uri: '/terms',
				},
			];
			// Console.log( inspect( link ) )
			expect(link.refs).toEqual(references);
		});

		// Here, both links have titles encoded in UTF-8, use the German
		// language ("de"), and the second link contains the Unicode code point
		// U+00E4 ("LATIN SMALL LETTER A WITH DIAERESIS").
		test('Example 4: UTF-8', function () {
			// eslint-disable-next-line no-secrets/no-secrets
			const link = parseLinkHeader(`</TheBook/chapter2>;
         rel="previous"; title*=UTF-8'de'letztes%20Kapitel,
         </TheBook/chapter4>;
         rel="next"; title*=UTF-8'de'n%c3%a4chstes%20Kapitel`);

			const references = [
				{
					uri: '/TheBook/chapter2',
					rel: 'previous',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'title*': {language: 'de', value: 'letztes Kapitel'},
				},
				{
					uri: '/TheBook/chapter4',
					rel: 'next',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'title*': {language: 'de', value: 'nächstes Kapitel'},
				},
			];

			// Console.log( inspect( link ) )
			expect(link.refs).toEqual(references);
		});

		// Here, the link to "http://example.org/" has the registered relation
		// type "start" and the extension relation type
		// "http://example.net/relation/other".
		test('Example 5: Multiple relations', function () {
			const link = parseLinkHeader(`<http://example.org/>;
         rel="start http://example.net/relation/other"`);

			const references = [
				{
					uri: 'http://example.org/',
					rel: 'start',
				},
				{
					uri: 'http://example.org/',
					rel: 'http://example.net/relation/other',
				},
			];

			// Console.log( inspect( link ) )
			expect(link.refs).toEqual(references);
		});

		test('Example 6: Equivalence', function () {
			const link = parseLinkHeader(`<https://example.org/>; rel="start",
         <https://example.org/index>; rel="index"`);

			const link2 = parseLinkHeader(`<https://example.org/>; rel="start"`);
			link2.parse(`<https://example.org/index>; rel="index"`);

			// Console.log( inspect( link ) )
			// console.log( inspect( link2 ) )
			expect(link.refs).toEqual(link2.refs);

			const references = [
				{
					uri: 'https://example.org/',
					rel: 'start',
				},
				{
					uri: 'https://example.org/index',
					rel: 'index',
				},
			];

			expect(link.refs).toEqual(references);
		});
	});
});
