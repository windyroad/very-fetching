import {describe, test, expect} from 'vitest';
import {parseLinkHeader, LinkHeader} from '../src/index.js';

describe('API', function () {
	test('get("rel", "next")', function () {
		const link = parseLinkHeader(
			'<https://acme-staging.api.letsencrypt.org/acme/new-authz>;rel="next", <https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf>;rel="terms-of-service"',
		);
		// Console.log( inspect( link.get( 'rel', 'next' ) ) )
		expect(link.get('rel', 'next')[0]).toEqual({
			uri: 'https://acme-staging.api.letsencrypt.org/acme/new-authz',
			rel: 'next',
		});
	});

	test('rel("next")', function () {
		const link = parseLinkHeader(
			'<https://acme-staging.api.letsencrypt.org/acme/new-authz>;rel="next", <https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf>;rel="terms-of-service"',
		);
		// Console.log( inspect( link.ret( 'next' ) ) )
		expect(link.rel('next')[0]).toEqual({
			uri: 'https://acme-staging.api.letsencrypt.org/acme/new-authz',
			rel: 'next',
		});
	});

	test('has("rel", "next")', function () {
		const link = parseLinkHeader(
			'<https://acme-staging.api.letsencrypt.org/acme/new-authz>;rel="next", <https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf>;rel="terms-of-service"',
		);
		// Console.log( inspect( link.has( 'rel', 'next' ) ) )
		expect(link.has('rel', 'next')).toEqual(true);
	});

	test('has("rel", "prev")', function () {
		const link = parseLinkHeader(
			'<https://acme-staging.api.letsencrypt.org/acme/new-authz>;rel="next", <https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf>;rel="terms-of-service"',
		);
		// Console.log( inspect( link.has( 'rel', 'prev' ) ) )
		expect(link.has('rel', 'prev')).toEqual(false);
	});

	test('toString()', function () {
		const link = parseLinkHeader(
			'<https://acme-staging.api.letsencrypt.org/acme/new-authz>;rel="next", <https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf>;rel="terms-of-service"',
		);
		const expected =
			'<https://acme-staging.api.letsencrypt.org/acme/new-authz>; rel=next, <https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf>; rel=terms-of-service';
		expect(link.toString()).toEqual(expected);
	});

	test('set()', function () {
		const link = parseLinkHeader(
			'<https://acme-staging.api.letsencrypt.org/acme/new-authz>;rel="next", <https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf>;rel="terms-of-service"',
		);
		link.set({
			uri: 'https://github.com/ietf-wg-acme/acme/',
			rel: 'example',
		});
		// Console.log( inspect( link ) )
		expect(link.refs.length).toEqual(3);
		expect(link.get('rel', 'example')[0]).toEqual({
			uri: 'https://github.com/ietf-wg-acme/acme/',
			rel: 'example',
		});
	});

	test('set()', function () {
		const link = parseLinkHeader(
			'<https://acme-staging.api.letsencrypt.org/acme/new-authz>;rel="next", <https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf>;rel="terms-of-service"',
		);
		link.set({
			uri: 'https://not-the-same.com/',
			rel: 'next',
		});
		// Console.log( inspect( link ) )
		expect(link.refs.length).toEqual(3);
		expect(link.get('rel', 'next').length).toEqual(2);
		expect(link.get('rel', 'next')[1]).toEqual({
			uri: 'https://not-the-same.com/',
			rel: 'next',
		});
	});

	test('set()', function () {
		const link = parseLinkHeader(
			'<https://acme-staging.api.letsencrypt.org/acme/new-authz>;rel="next", <https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf>;rel="terms-of-service"',
		);
		link.set({
			uri: 'https://not-the-same.com/',
			rel: 'next',
		});
		// Console.log( inspect( link ) )
		expect(link.refs.length).toEqual(3);
		expect(link.get('rel', 'next')[0]).toEqual({
			uri: 'https://acme-staging.api.letsencrypt.org/acme/new-authz',
			rel: 'next',
		});
	});

	test('setUnique()', function () {
		const link = new LinkHeader();
		link.setUnique({uri: 'https://example.com/a', rel: 'preconnect'});
		expect(link.refs).toEqual([
			{uri: 'https://example.com/a', rel: 'preconnect'},
		]);
		link.setUnique({uri: 'https://example.com/b', rel: 'preconnect'});
		expect(link.refs).toEqual([
			{uri: 'https://example.com/a', rel: 'preconnect'},
			{uri: 'https://example.com/b', rel: 'preconnect'},
		]);
		link.setUnique({uri: 'https://example.com/a', rel: 'preconnect'});
		expect(link.refs).toEqual([
			{uri: 'https://example.com/a', rel: 'preconnect'},
			{uri: 'https://example.com/b', rel: 'preconnect'},
		]);
	});

	test('parse() multiple', function () {
		const links = new LinkHeader();

		links.parse('<example.com>; rel="example"; title="Example Website"');
		expect(links).toEqual({
			refs: [{uri: 'example.com', rel: 'example', title: 'Example Website'}],
		});

		links.parse(
			'<example-01.com>; rel="alternate"; title="Alternate Example Domain"',
		);
		expect(links).toEqual({
			refs: [
				{uri: 'example.com', rel: 'example', title: 'Example Website'},
				{
					uri: 'example-01.com',
					rel: 'alternate',
					title: 'Alternate Example Domain',
				},
			],
		});

		links.parse(
			'<example-02.com>; rel="alternate"; title="Second Alternate Example Domain"',
		);
		expect(links).toEqual({
			refs: [
				{uri: 'example.com', rel: 'example', title: 'Example Website'},
				{
					uri: 'example-01.com',
					rel: 'alternate',
					title: 'Alternate Example Domain',
				},
				{
					uri: 'example-02.com',
					rel: 'alternate',
					title: 'Second Alternate Example Domain',
				},
			],
		});
	});
});
