import {type Link} from '@windyroad/link-header';
import uriTemplate from 'uri-templates';

/**
 * Fills URI templates in an array of links with parameters.
 * @param options - The options object.
 * @param options.parameters - The parameters to fill the URI templates with.
 * @param options.links - The array of links to fill.
 */
export function fillLinks({
	parameters,
	links,
}: {
	parameters: Record<string, string | Record<string, string>> | undefined;
	links: Link[];
}) {
	if (parameters) {
		for (const link of links) {
			link.uri = uriTemplate(link.uri).fillFromObject(parameters);
		}
	}
}
