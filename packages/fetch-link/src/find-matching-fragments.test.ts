import {test, describe} from 'vitest';
import {findMatchingFragments} from './find-matching-fragments.js';

describe('findMatchingFragments', () => {
	test('returns an empty array when there are no matches', (t) => {
		const object = {foo: {bar: 1}};
		const template = '#/baz/qux';
		const matches = findMatchingFragments(object, template);
		t.expect(matches).toHaveLength(0);
	});

	test('returns an array of matching fragments', (t) => {
		const object = {
			foo: [{bar: 1}, {bar: 2}, {baz: 3}],
		};
		const template = '#/foo/{index}/bar';
		const matches = findMatchingFragments(object, template);
		t.expect(matches).toHaveLength(2);
		t.expect(matches[0].path).toEqual('#/foo/0/bar');
		t.expect(matches[0].value).toEqual(1);
		t.expect(matches[0].variables).toEqual({index: '0'});
		t.expect(matches[1].path).toEqual('#/foo/1/bar');
		t.expect(matches[1].value).toEqual(2);
		t.expect(matches[1].variables).toEqual({index: '1'});
	});

	test('matches nested properties', (t) => {
		const object = {
			foo: {
				bar: {
					baz: 1,
					qux: 2,
				},
			},
		};
		const template = '#/foo/{index}/{anotherIndex}';
		const matches = findMatchingFragments(object, template);
		t.expect(matches.length).toEqual(2);
		t.expect(matches[0].path).toEqual('#/foo/bar/baz');
		t.expect(matches[0].value).toEqual(1);
		t.expect(matches[0].variables).toEqual({index: 'bar', anotherIndex: 'baz'});
		t.expect(matches[1].path).toEqual('#/foo/bar/qux');
		t.expect(matches[1].value).toEqual(2);
		t.expect(matches[1].variables).toEqual({index: 'bar', anotherIndex: 'qux'});
	});

	test('matches properties with special characters', (t) => {
		const object = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'foo/bar': 1,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'foo/baz': 2,
		};
		const template = '#/{key}';
		const matches = findMatchingFragments(object, template);
		t.expect(matches.length).toEqual(2);
		t.expect(matches[0].path).toEqual('#/foo~1bar');
		t.expect(matches[0].value).toEqual(1);
		t.expect(matches[0].variables).toEqual({key: 'foo/bar'});
		t.expect(matches[1].path).toEqual('#/foo~1baz');
		t.expect(matches[1].value).toEqual(2);
		t.expect(matches[1].variables).toEqual({key: 'foo/baz'});
	});

	test('matches properties with escaped special characters', (t) => {
		const object = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'foo~bar': 1,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'foo~baz': 2,
		};
		const template = '#/{key}';
		const matches = findMatchingFragments(object, template);
		t.expect(matches.length).toEqual(2);
		t.expect(matches[0].path).toEqual('#/foo~0bar');
		t.expect(matches[0].value).toEqual(1);
		t.expect(matches[0].variables).toEqual({key: 'foo~bar'});
		t.expect(matches[1].path).toEqual('#/foo~0baz');
		t.expect(matches[1].value).toEqual(2);
		t.expect(matches[1].variables).toEqual({key: 'foo~baz'});
	});

	test('matches properties with numeric keys', (t) => {
		const object = {
			foo: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				0: 1,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				1: 2,
			},
		};
		const template = '#/foo/{index}';
		const matches = findMatchingFragments(object, template);
		t.expect(matches.length).toEqual(2);
		t.expect(matches[0].path).toEqual('#/foo/0');
		t.expect(matches[0].value).toEqual(1);
		t.expect(matches[0].variables).toEqual({index: '0'});
		t.expect(matches[1].path).toEqual('#/foo/1');
		t.expect(matches[1].value).toEqual(2);
		t.expect(matches[1].variables).toEqual({index: '1'});
	});

	test('matches array indices', (t) => {
		const object = {
			foo: [1, 2],
		};
		const template = '#/foo/{index}';
		const matches = findMatchingFragments(object, template);
		t.expect(matches.length).toEqual(2);
		t.expect(matches[0].path).toEqual('#/foo/0');
		t.expect(matches[0].value).toEqual(1);
		t.expect(matches[0].variables).toEqual({index: '0'});
		t.expect(matches[1].path).toEqual('#/foo/1');
		t.expect(matches[1].value).toEqual(2);
		t.expect(matches[1].variables).toEqual({index: '1'});
	});

	test('matches properties with boolean keys', (t) => {
		const object = {
			foo: {
				true: 1,
				false: 2,
			},
		};
		const template = '#/foo/{index}';
		const matches = findMatchingFragments(object, template);
		t.expect(matches.length).toEqual(2);
		t.expect(matches[0].path).toEqual('#/foo/true');
		t.expect(matches[0].value).toEqual(1);
		t.expect(matches[0].variables).toEqual({index: 'true'});
		t.expect(matches[1].path).toEqual('#/foo/false');
		t.expect(matches[1].value).toEqual(2);
		t.expect(matches[1].variables).toEqual({index: 'false'});
	});

	test('matches properties with null keys', (t) => {
		const object = {
			foo: {
				null: 1,
			},
		};
		const template = '#/foo/{index}';
		const matches = findMatchingFragments(object, template);
		t.expect(matches.length).toEqual(1);
		t.expect(matches[0].path).toEqual('#/foo/null');
		t.expect(matches[0].value).toEqual(1);
		t.expect(matches[0].variables).toEqual({index: 'null'});
	});

	test('matches properties with undefined keys', (t) => {
		const object = {
			foo: {
				undefined: 1,
			},
		};
		const template = '#/foo/{index}';
		const matches = findMatchingFragments(object, template);
		t.expect(matches.length).toEqual(1);
		t.expect(matches[0].path).toEqual('#/foo/undefined');
		t.expect(matches[0].value).toEqual(1);
		t.expect(matches[0].variables).toEqual({index: 'undefined'});
	});
});
