import {describe, test, vi} from 'vitest';
import {type Link} from '@windyroad/link-header';
import {type ofetch} from 'ofetch';
import {glowUpOfetchWithLinkInputs} from './glow-up-ofetch-with-link-inputs.js';

describe('ofetchLink', () => {
	// Use case 1: Fetching a resource with a Link object that specifies a custom HTTP method and headers.
	test('ofetchLink with custom HTTP method and headers', async ({expect}) => {
		const mockFetch = vi.fn(
			async (...arguments_: Parameters<(typeof ofetch)['raw']>) =>
				new Response(),
		);

		const link: Link = {
			uri: 'https://example.com',
			rel: 'resource',
			method: 'POST',
		};

		const fetchWithLink = glowUpOfetchWithLinkInputs(mockFetch);
		await fetchWithLink(link);
		expect(mockFetch).toHaveBeenCalledWith('https://example.com', {
			method: 'POST',
		});
	});

	// Use case 2: Fetching a resource with a Link object that specifies a custom media type and language.
	test('ofetchLink with custom media type and language', async ({expect}) => {
		const mockFetch = vi.fn(
			async (...arguments_: Parameters<(typeof ofetch)['raw']>) => {
				return new Response();
			},
		);

		const link: Link = {
			uri: 'https://example.com',
			rel: 'resource',
			type: 'application/json',
			hreflang: 'en-US',
		};

		const fetchWithLink = glowUpOfetchWithLinkInputs(mockFetch);
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
	test('ofetchLink with standard fetch request', async ({expect}) => {
		const mockFetch = vi.fn(
			async (...arguments_: Parameters<(typeof ofetch)['raw']>) =>
				new Response(),
		);
		const fetchWithLink = glowUpOfetchWithLinkInputs(mockFetch);
		await fetchWithLink('https://example.com');
		expect(mockFetch).toHaveBeenCalledWith('https://example.com');
	});
});
