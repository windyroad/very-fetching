import {type Link} from '@windyroad/link-header';

/**
 * Filters the links in a LinkHeader based on a filter object or string.
 * @param options - The options object.
 * @param options.filter - The filter to apply to the links.
 * @param options.links - The links to filter.
 * @returns An array of filtered links.
 */
export function filterLinks({
	filter,
	links,
}: {
	filter: string | Partial<Link> | undefined;
	links: Link[];
}) {
	return filter
		? links.filter((link) => {
				if (typeof filter === 'string') {
					return link.rel === filter;
				}

				for (const key in filter) {
					if (filter[key] !== link[key]) {
						return false;
					}
				}

				return true;
			})
		: links;
}
