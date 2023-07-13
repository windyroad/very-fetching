import fc from 'fast-check';
import {describe, test, vi} from 'vitest';
import {glowUpFetchWithLinks} from './glow-up-fetch-with-links.js';
import {type Link} from './link.js';

describe('fetchLink', () => {
	// Use case 1: Fetching a resource with a Link object that specifies a custom HTTP method and headers.
	test('fetchLink with custom HTTP method and headers', async ({expect}) => {
		const mockFetch = vi.fn(
			async (...args: Parameters<typeof fetch>) => new Response(),
		);

		const link: Link = {
			uri: 'https://example.com',
			rel: 'resource',
			method: 'POST',
		};

		const fetchWithLink = glowUpFetchWithLinks(mockFetch);
		await fetchWithLink(link);
		expect(mockFetch).toHaveBeenCalledWith('https://example.com', {
			method: 'POST',
		});
	});

	// Use case 2: Fetching a resource with a Link object that specifies a custom media type and language.
	test('fetchLink with custom media type and language', async ({expect}) => {
		const mockFetch = vi.fn(async (...args: Parameters<typeof fetch>) => {
			return new Response();
		});

		const link: Link = {
			uri: 'https://example.com',
			rel: 'resource',
			type: 'application/json',
			hreflang: 'en-US',
		};

		const fetchWithLink = glowUpFetchWithLinks(mockFetch);
		const additionalHeaders = new Headers();
		additionalHeaders.set('cache-control', 'no-cache');
		await fetchWithLink(link, {headers: additionalHeaders});

		const expectedHeaders = new Headers();
		expectedHeaders.set('cache-control', 'no-cache');
		expectedHeaders.set('accept', 'application/json');
		expectedHeaders.set('accept-language', 'en-US');
		expect(mockFetch).toHaveBeenCalledWith('https://example.com', {
			headers: expectedHeaders,
		});
	});

	// Use case 3: Fetching a resource with a standard fetch request.
	test('fetchLink with standard fetch request', async ({expect}) => {
		const mockFetch = vi.fn(
			async (...args: Parameters<typeof fetch>) => new Response(),
		);
		const fetchWithLink = glowUpFetchWithLinks(mockFetch);
		await fetchWithLink('https://example.com');
		expect(mockFetch).toHaveBeenCalledWith('https://example.com', undefined);
	});
});
