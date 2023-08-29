import {JsonPointer, type PathSegment, type PathSegments} from 'json-ptr';
import {type Fragment} from './fragment.js';

/**
 * Finds all fragments in the given object that match the given template.
 * @param object - The object to search for matching fragments.
 * @param template - The template to use for matching fragments.
 * @returns An array of matching fragments, where each fragment is an object with a `path` property and a `value` property.
 */
export function findMatchingFragments(
	object: any,
	template: string,
): Fragment[] {
	const parts: PathSegments = JsonPointer.decode(template);
	const matches: Fragment[] = [];

	/**
	 * Recursively searches for matching fragments in the given sub-object.
	 * @param subObject - The sub-object to search for matching fragments.
	 * @param subParts - The remaining parts of the template to match.
	 * @param path - The path to the current sub-object.
	 * @param variables - The current variable values.
	 */
	function recurse(
		subObject: any,
		subParts: PathSegments,
		path: PathSegments,
		variables: Record<string, any>,
	): void {
		if (subParts.length === 0) {
			// We've reached the end of the template; add the current object to the matches
			matches.push({
				path: JsonPointer.create(path).uriFragmentIdentifier,
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				value: subObject,
				variables,
			});
			return;
		}

		const part: PathSegment = subParts[0];
		if (
			typeof part === 'string' &&
			part.startsWith('{') &&
			part.endsWith('}')
		) {
			const variableName = part.slice(1, -1);
			// This part is a wildcard; recurse into all properties
			for (const key in subObject) {
				if (Object.prototype.hasOwnProperty.call(subObject, key)) {
					recurse(subObject[key], subParts.slice(1), [...path, key], {
						...variables,
						[variableName]: key,
					});
				}
			}
		} else if (Object.prototype.hasOwnProperty.call(subObject, part)) {
			recurse(subObject[part], subParts.slice(1), [...path, part], variables);
		}
	}

	recurse(object, parts, [], {});

	return matches;
}
