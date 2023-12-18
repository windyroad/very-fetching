import {type Link} from '@windyroad/link-header';

/**
 * Resolves the URL relative to a base URL.
 * @param options - The options object.
 * @param options.url - The link to resolve.
 * @param options.baseUrl - The base URL to resolve the link against.
 * @returns The resolved URL
 */
export function resolveUrl({
	url,
	baseUrl,
}: {
	url: string;
	baseUrl: string;
}): string {
	if (baseUrl === undefined || baseUrl.length === 0) {
		// Can't resolve a relative URL without a base URL
		return url;
	}

	const resolved = new URL(url, baseUrl).href;
	// RFC8288 allows for URI templates, which are not supported by the URL class.
	const resolvedString = resolved
		.toString()
		.replaceAll('%7B', '{')
		.replaceAll('%7D', '}');
	return resolvedString;
}
