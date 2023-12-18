/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/prefer-for-of */

import {expandRelations} from './expand-relations.js';
import {hasWhitespace} from './has-whitespace.js';
import type {Link, PartialLink} from './link.js';
import {shallowCompareObjects} from './shallow-compare-objects.js';
import {skipWhitespace} from './skip-whitespace.js';
import {trim} from './trim.js';
import {isSingleOccurrenceAttribute} from './is-single-occurrence-attribute.js';
import {parseExtendedValue} from './parse-extended-value.js';
import {formatAttribute} from './format-attribute.js';

export class LinkHeader {
	refs: Link[];

	/**
	 * Link
	 * @param value the link header to parse to initialise object.
	 */
	constructor(value?: string) {
		/** @type {Array} URI references */
		this.refs = [];

		if (value) {
			this.parse(value);
		}
	}

	/**
	 * Get refs with given relation type
	 * @param value the relation type
	 * @returns matching the link references
	 */
	rel(value: string) {
		const type = value.toLowerCase();
		return this.refs.filter((link) => link.rel?.toLowerCase() === type);
	}

	/**
	 * Get refs where given attribute has a given value
	 * @param attribute the attribute
	 * @param value the value
	 * @returns the matching link references
	 */
	get(attribute: string, value: string) {
		attribute = attribute.toLowerCase();

		const links: Link[] = [];

		for (let index = 0; index < this.refs.length; index++) {
			if (this.refs[index][attribute] === value) {
				links.push(this.refs[index]);
			}
		}

		return links;
	}

	/**
	 * Sets a reference.
	 * @param link the link to add
	 * @returns the updated set of links
	 */
	set(link: Link) {
		this.refs.push(link);
		return this;
	}

	/**
	 * Sets a reference if a reference with similar properties isn’t already set.
	 * @param link the link to add
	 * @returns the updated set of links
	 */
	setUnique(link: Link) {
		if (
			!this.refs.some((reference) => shallowCompareObjects(reference, link))
		) {
			this.refs.push(link);
		}

		return this;
	}

	/**
	 * Checks for refs where given attribute has a given value
	 * @param attribute the attribute
	 * @param value the value
	 * @returns true if there are matching link references
	 */
	has(attribute: string, value: string) {
		attribute = attribute.toLowerCase();

		for (let index = 0; index < this.refs.length; index++) {
			if (this.refs[index][attribute] === value) {
				return true;
			}
		}

		return false;
	}

	parse(value: string) {
		// Trim & unfold folded lines
		// eslint-disable-next-line no-control-regex
		value = trim(value).replaceAll(/\r?\n[ \u0009]+/g, '');

		enum State {
			Idle,
			Uri,
			Attribute,
		}

		let state = State.Idle;
		const {length} = value;
		let offset = 0;
		let reference: PartialLink | null = null;
		while (offset < length) {
			switch (state) {
				case State.Idle: {
					if (hasWhitespace(value[offset])) {
						offset++;
						continue;
					} else if (value[offset] === '<') {
						addLinkIfSet(this, reference);

						const uriEnd = value.indexOf('>', offset);
						if (uriEnd === -1)
							throw new Error(
								`Expected end of URI delimiter at offset ${offset}`,
							);
						reference = {uri: value.slice(offset + 1, uriEnd)};
						// This.refs.push( ref )
						offset = uriEnd;
						state = State.Uri;
					} else {
						throw new Error(
							`Unexpected character "${value[offset]}" at offset ${offset}`,
						);
					}

					offset++;

					break;
				}

				case State.Uri: {
					if (hasWhitespace(value[offset])) {
						offset++;
						continue;
					} else if (value[offset] === ';') {
						state = State.Attribute;
						offset++;
					} else if (value[offset] === ',') {
						state = State.Idle;
						offset++;
					} else {
						throw new Error(
							`Unexpected character "${value[offset]}" at offset ${offset}`,
						);
					}

					break;
				}

				case State.Attribute: {
					if (value[offset] === ';' || hasWhitespace(value[offset])) {
						offset++;
						continue;
					}

					let attributeEnd = value.indexOf('=', offset);
					if (attributeEnd === -1) attributeEnd = value.indexOf(';', offset);
					if (attributeEnd === -1) attributeEnd = value.length;
					const attribute = trim(
						value.slice(offset, attributeEnd),
					).toLowerCase();
					let attributeValue = '';
					offset = attributeEnd + 1;
					offset = skipWhitespace(value, offset);
					if (value[offset] === '"') {
						offset++;
						while (offset < length) {
							if (value[offset] === '"') {
								offset++;
								break;
							}

							if (value[offset] === '\\') {
								offset++;
							}

							attributeValue += value[offset];
							offset++;
						}
					} else {
						let end = offset + 1;
						while (!/[;,"]/.test(value[end]) && end < length) {
							end++;
						}

						attributeValue = value.slice(offset, end);
						offset = end;
					}

					if (
						reference?.[attribute] &&
						isSingleOccurrenceAttribute(attribute)
					) {
						// Ignore multiples of attributes which may only appear once
					} else if (reference && attribute.endsWith('*')) {
						reference[attribute] = parseExtendedValue(attributeValue);
					} else if (reference) {
						attributeValue =
							attribute === 'type'
								? attributeValue.toLowerCase()
								: attributeValue;
						const current = reference[attribute];
						if (current === null || current === undefined) {
							reference[attribute] = attributeValue;
						} else if (Array.isArray(current)) {
							current.push(attributeValue);
						} else {
							reference[attribute] = [current, attributeValue];
						}
					} else {
						throw new Error('Unexpected null ref');
					}

					switch (value[offset]) {
						case ',': {
							state = State.Idle;
							break;
						}

						case ';': {
							state = State.Attribute;
							break;
						}

						default: {
							break;
						}
					}

					offset++;

					break;
				}

				default: {
					throw new Error(`Unknown parser state`);
				}
			}
		}

		addLinkIfSet(this, reference);

		reference = null;

		return this;
	}

	toString() {
		const references: string[] = [];

		for (const reference of this.refs) {
			let link = '<' + reference.uri + '>';
			for (const [key, value] of Object.entries(reference)) {
				if (key === 'uri' || value === undefined) {
					continue;
				}

				link += '; ' + formatAttribute(key, value);
			}

			references.push(link);
		}

		return references.join(', ');
	}
}

/**
 * Adds the link to the link header if it is set
 * @param linkHeader the link header to add it to
 * @param link the link to add
 */
function addLinkIfSet(linkHeader: LinkHeader, link: PartialLink | null) {
	if (link === null) {
		return;
	}

	const {uri, rel} = link;
	if (rel === null || rel === undefined) {
		throw new Error('Unexpected null rel');
	}

	const links = expandRelations({...link, uri, rel});
	for (const link of links) {
		linkHeader.set(link);
	}
}
