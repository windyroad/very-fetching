import {JsonPointer} from 'json-ptr';
import {type Fragment} from './fragment.js';

/**
 * Interpolates the given anchor with the variables from the given match object.
 * @param {string} anchor - The anchor to interpolate.
 * @param {Fragment} match - The match object containing the variables to interpolate.
 * @returns {string} - The interpolated anchor.
 */
export function interpolateAnchor(anchor: string, match: Fragment): string {
	const segments = JsonPointer.decode(anchor);
	const interpolatedSegments = segments.map((segment) => {
		if (
			typeof segment === 'string' &&
			segment.startsWith('{') &&
			segment.endsWith('}')
		) {
			const variableName = segment.slice(1, -1);
			if (Object.prototype.hasOwnProperty.call(match.variables, variableName)) {
				return match.variables[variableName];
			}
		}

		return segment;
	});
	return JsonPointer.create(interpolatedSegments).uriFragmentIdentifier;
}
