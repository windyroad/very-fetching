import {type Link} from '@windyroad/link-header';

/**
 * Resolves the URLs of an array of links relative to a base URL.
 * @param options - The options object.
 * @param options.links - The array of links to resolve.
 * @param options.baseUrl - The base URL to resolve the links against.
 * @returns An array of objects containing the resolved URL and the original link.
 */
export function resolveLinkUrls({
	links,
	baseUrl,
}: {
	links: Link[];
	baseUrl: string;
}): Array<{url: URL; link: Link}> {
	return links.map((link) => {
		const resolved = new URL(
			link.uri,
			baseUrl.length === 0 ? undefined : baseUrl,
		);
		// RFC8288 allows for URI templates, which are not supported by the URL class.
		const resolvedString = resolved
			.toString()
			.replace(/%7B/g, '{')
			.replace(/%7D/g, '}');
		link.uri = resolvedString;
		return {url: new URL(resolvedString), link};
	});
}
