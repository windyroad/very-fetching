import {describe, test, expect} from 'vitest';
import {parseLinkHeader} from '../src/index.js';

describe('Folded header', function () {
	test('unfolds header', function () {
		const link = parseLinkHeader(
			'<https://acme-staging.api.letsencrypt.org/acme/new-authz>;rel="next",\r\n <https://letsencrypt.org/documents/LE-SA-v1.1.1-August-1-2016.pdf>;rel="ter\r\n ms-of-service"',
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
		// Console.log( inspect( link ) )
		expect(link.refs).toEqual(references);
	});

	test('unfolds hard-folded header', function () {
		const link = parseLinkHeader(
			'<https://acme-staging.api.let\r\n sencrypt.org/acme/new-authz>;\r\n rel="next", <https://letsencr\r\n ypt.org/documents/LE-SA-v1.1.\r\n 1-August-1-2016.pdf>;rel="ter\r\n ms-of-service"',
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
		// Console.log( inspect( link ) )
		expect(link.refs).toEqual(references);
	});
});
