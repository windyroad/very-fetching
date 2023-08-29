import {type Link, isLink} from '@windyroad/link-header';

export type Fragment = {
	path: string;
	value: any;
	variables: Record<string, string>;
};

export type FragmentLink = Link & {
	fragment: Fragment;
};

/**
 * Determines whether the given input is a Link object.
 * @param input - The input to check.
 * @returns True if the input is a Link object, false otherwise.
 */
export function isFragmentLink(input: any): input is FragmentLink {
	return isLink(input) && 'fragment' in input;
}
