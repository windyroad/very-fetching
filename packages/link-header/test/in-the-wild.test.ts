import {describe, test, expect} from 'vitest';
import {parseLinkHeader} from '../src/index.js';

describe('Link Headers In the Wild', function () {
	test('LetsEncrypt TOS link', function () {
		const link = parseLinkHeader(
			'<https://acme-staging.api.letsencrypt.org/acme/new-authz>;rel="next", <https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf>;rel="terms-of-service"',
		);
		const references = [
			{
				uri: 'https://acme-staging.api.letsencrypt.org/acme/new-authz',
				rel: 'next',
			},
			{
				uri: 'https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf',
				rel: 'terms-of-service',
			},
		];
		// Inspect.log( link )
		expect(link.refs).toEqual(references);
	});

	test('GitHub pagination links', function () {
		const link = parseLinkHeader(
			'<https://api.github.com/user/repos?page=3&per_page=100>; rel="next", <https://api.github.com/user/repos?page=50&per_page=100>; rel="last"',
		);
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
	});
});
