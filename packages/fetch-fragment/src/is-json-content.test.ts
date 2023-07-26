import {test} from 'vitest';
import fc from 'fast-check';
import {isJsonContent} from './is-json-content.js';

test('isJsonContent returns true for application/json', ({expect}) => {
	const response = {headers: new Headers({'Content-Type': 'application/json'})};
	expect(isJsonContent(response)).toBe(true);
});

test('isJsonContent returns true for application/vnd.api+json', ({expect}) => {
	const response = {
		headers: new Headers({'Content-Type': 'application/vnd.api+json'}),
	};
	expect(isJsonContent(response)).toBe(true);
});

test('isJsonContent returns true for application/hal+json', ({expect}) => {
	const response = {
		headers: new Headers({'Content-Type': 'application/hal+json'}),
	};
	expect(isJsonContent(response)).toBe(true);
});

test('isJsonContent returns true for application/json-patch+json', ({
	expect,
}) => {
	const response = {
		headers: new Headers({'Content-Type': 'application/json-patch+json'}),
	};
	expect(isJsonContent(response)).toBe(true);
});

test('isJsonContent returns true for application/json; charset=utf-8', ({
	expect,
}) => {
	const response = {
		headers: new Headers({'Content-Type': 'application/json; charset=utf-8'}),
	};
	expect(isJsonContent(response)).toBe(true);
});

test('isJsonContent returns true for application/vnd.api+json; charset=utf-8', ({
	expect,
}) => {
	const response = {
		headers: new Headers({
			'Content-Type': 'application/vnd.api+json; charset=utf-8',
		}),
	};
	expect(isJsonContent(response)).toBe(true);
});

test('isJsonContent returns true for application/hal+json; charset=utf-8', ({
	expect,
}) => {
	const response = {
		headers: new Headers({
			'Content-Type': 'application/hal+json; charset=utf-8',
		}),
	};
	expect(isJsonContent(response)).toBe(true);
});

test('isJsonContent returns true for application/json-patch+json; charset=utf-8', ({
	expect,
}) => {
	const response = {
		headers: new Headers({
			'Content-Type': 'application/json-patch+json; charset=utf-8',
		}),
	};
	expect(isJsonContent(response)).toBe(true);
});

test('isJsonContent returns false for text/plain', ({expect}) => {
	const response = {headers: new Headers({'Content-Type': 'text/plain'})};
	expect(isJsonContent(response)).toBeFalsy();
});

test('isJsonContent returns false for undefined', ({expect}) => {
	const response = {headers: new Headers()};
	expect(isJsonContent(response)).toBeFalsy();
});

test('isJsonContent returns false for null', ({expect}) => {
	const response = {
		headers: new Headers({'Content-Type': null as unknown as string}),
	};
	expect(isJsonContent(response)).toBeFalsy();
});

test('isJsonContent returns false for empty string', ({expect}) => {
	const response = {headers: new Headers({'Content-Type': ''})};
	expect(isJsonContent(response)).toBeFalsy();
});

test('isJsonContent returns false for random string', ({expect}) => {
	fc.assert(
		fc.property(fc.string(), (string_) => {
			const response = {headers: new Headers({'Content-Type': string_})};
			return !isJsonContent(response);
		}),
	);
});
