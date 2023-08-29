import type {Link} from './link.js';

/**
 * Splits the link reference into multiple, one per rel
 * @param reference the reference to expand
 * @returns the collection of references
 */
export function expandRelations(reference: Link): Link[] {
	const relationships = reference.rel.split(' ');
	return relationships.map(function (relationship: string) {
		const value = {...reference};
		value.rel = relationship;
		return value;
	});
}
