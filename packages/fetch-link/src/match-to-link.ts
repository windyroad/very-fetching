import {type Link} from '@windyroad/link-header';
import {type FragmentLink, type Fragment} from './fragment.js';
import {interpolateAnchor} from './interpolate-anchor.js';

/**
 * Converts a `Link` object and a `URL` to a `FragmentLink` object by filling in the URI template with the variables from the `Fragment`.
 * @param {object} options - The options object.
 * @param {Link} options.link - The `Link` object to convert.
 * @param {URL} options.templatedHash - The templated Hash of the link
 * @param {Fragment} options.match - The `Fragment` object containing the variables to use for filling in the URI template.
 * @returns {Link} - The resulting `FragmentLink` object.
 */
export function matchToLink({
	link,
	templatedHash,
	match,
}: {
	link: Link;
	templatedHash: string;
	match: Fragment;
}): FragmentLink {
	return {
		...link,
		uri: link.uri.replace(templatedHash, match.path),
		...(link.anchor && {
			anchor: interpolateAnchor(link.anchor, match),
		}),
		fragment: match,
	};
}
