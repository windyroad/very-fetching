/**
 * Shallow compares two objects to check if their properties match.
 * @param object1 First object to compare.
 * @param object2 Second object to compare.
 * @returns Do the objects have matching properties.
 */
export function shallowCompareObjects(
	object1: Record<any, any>,
	object2: Record<any, any>,
) {
	return (
		Object.keys(object1).length === Object.keys(object2).length &&
		Object.keys(object1).every(
			(key) => key in object2 && object1[key] === object2[key],
		)
	);
}
