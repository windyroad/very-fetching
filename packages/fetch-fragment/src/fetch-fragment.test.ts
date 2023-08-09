import {test, beforeAll, afterAll, afterEach} from 'vitest';
// eslint-disable-next-line n/file-extension-in-import
import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {fetchFragment} from './fetch-fragment.js';

const server = setupServer(
	rest.get(
		'http://example.com/data.json',
		async (request, response, context) => {
			return response(context.json({foo: 'bar'}));
		},
	),
);

beforeAll(() => {
	server.listen();
});

afterEach(() => {
	server.resetHandlers();
});

afterAll(() => {
	server.close();
});

test('should fetch a JSON fragment', async ({expect}) => {
	const response = await fetchFragment('http://example.com/data.json#/foo');

	expect(await response.json()).toEqual('bar');
});
