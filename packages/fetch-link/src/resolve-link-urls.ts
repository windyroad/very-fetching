import {type Link} from './link.js';

/**
 * Resolves the URLs of an array of links relative to a base URL.
 * @param links - The array of links to resolve.
 * @param baseUrl - The base URL to resolve the links against.
 * @returns An array of objects containing the resolved URL and the original link.
 */
export function resolveLinkUrls(
	links: Link[],
	baseUrl: string,
): Array<{url: URL; link: Link}> {
	return links.map((link) => {
		console.log({
			uri: link.uri,
			baseUrl: baseUrl.length === 0 ? undefined : baseUrl,
		});
		const resolved = new URL(
			link.uri,
			baseUrl.length === 0 ? undefined : baseUrl,
		);
		link.uri = resolved.toString();
		return {url: resolved, link};
	});
}
