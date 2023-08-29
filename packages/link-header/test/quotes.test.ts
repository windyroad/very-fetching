import {describe, test, expect} from 'vitest';
import {parseLinkHeader, LinkHeader} from '../src/index.js';

describe('Attributes', function () {
	test('attribute with semicolon', function () {
		const link = parseLinkHeader(
			'<http://example.com/quotes/semicolons>; rel="previous"; title="previous; chapter"',
		);
		const references = [
			{
				uri: 'http://example.com/quotes/semicolons',
				rel: 'previous',
				title: 'previous; chapter',
			},
		];
		// Console.log( inspect( link ) )
		expect(link.refs).toEqual(references);
	});

	test('attribute with comma', function () {
		const link = parseLinkHeader(
			'<http://example.com/quotes/semicolons>; rel="previous"; title="previous, chapter"',
		);
		const references = [
			{
				uri: 'http://example.com/quotes/semicolons',
				rel: 'previous',
				title: 'previous, chapter',
			},
		];
		// Console.log( inspect( link ) )
		expect(link.refs).toEqual(references);
	});

	test('multiple links with mixed comma & semicolon', function () {
		const link = parseLinkHeader(
			'<example.com>; rel="example,comma", <example-01.com>; rel="alternate;semicolon"',
		);
		const references = [
			{uri: 'example.com', rel: 'example,comma'},
			{uri: 'example-01.com', rel: 'alternate;semicolon'},
		];
		// Console.log( inspect( link ) )
		expect(link.refs).toEqual(references);
	});

	test('multiple links with mixed comma & semicolon', function () {
		const link = parseLinkHeader(
			'<example.com>; rel="example;semicolon", <example-01.com>; rel="alternate,comma"',
		);
		const references = [
			{uri: 'example.com', rel: 'example;semicolon'},
			{uri: 'example-01.com', rel: 'alternate,comma'},
		];
		// Console.log( inspect( link ) )
		expect(link.refs).toEqual(references);
	});

	test('multiple rel types with semicolon', function () {
		const link = parseLinkHeader('<example.com>; rel="example; start"');
		const references = [
			{uri: 'example.com', rel: 'example;'},
			{uri: 'example.com', rel: 'start'},
		];
		// Console.log( inspect( link ) )
		expect(link.refs).toEqual(references);
	});

	test('format attr value with nothing special', function () {
		const link = new LinkHeader().set({uri: 'example.com', rel: 'next'});
		const expected = '<example.com>; rel=next';
		expect(link.toString()).toEqual(expected);
	});

	test('format attr value with semicolon', function () {
		const link = new LinkHeader().set({
			uri: 'example.com',
			rel: 'example; the semicolon',
		});
		const expected = '<example.com>; rel="example; the semicolon"';
		expect(link.toString()).toEqual(expected);
	});

	test('format attr value with comma', function () {
		const link = new LinkHeader().set({
			uri: 'example.com',
			rel: 'example, the comma',
		});
		const expected = '<example.com>; rel="example, the comma"';
		expect(link.toString()).toEqual(expected);
	});

	test('format attr value with single quote', function () {
		const link = new LinkHeader().set({
			uri: 'example.com',
			rel: "example' the single quote",
		});
		const expected = '<example.com>; rel="example\' the single quote"';
		expect(link.toString()).toEqual(expected);
	});

	test('format attr value with double quote', function () {
		const link = new LinkHeader().set({
			uri: 'example.com',
			rel: 'example',
			title: 'example" the double quote',
		});
		const expected =
			'<example.com>; rel=example; title="example%22 the double quote"';
		expect(link.toString()).toEqual(expected);
	});

	test('format attr value with multi-byte char', function () {
		const link = new LinkHeader().set({
			uri: 'example.com',
			rel: 'example',
			title: 'example with ⅓',
		});
		const expected =
			'<example.com>; rel=example; title="example with %E2%85%93"';
		expect(link.toString()).toEqual(expected);
	});

	test('format an extended attr value', function () {
		const expected =
			"</risk-mitigation>; rel=start; title*=UTF-8'en'%E2%91%A0%E2%93%AB%E2%85%93%E3%8F%A8%E2%99%B3%F0%9D%84%9E%CE%BB";
		const link = new LinkHeader().set({
			uri: '/risk-mitigation',
			rel: 'start',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'title*': {
				language: 'en',
				value: '①⓫⅓㏨♳𝄞λ',
			},
		});
		expect(link.toString()).toEqual(expected);
	});
});
