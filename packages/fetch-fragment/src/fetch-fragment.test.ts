import {test, beforeAll, afterAll, afterEach, describe} from 'vitest';
import {setupServer} from 'msw/node';
import {rest} from 'msw';
import {isNode} from 'is-where';
import {fetchFragment} from './fetch-fragment.js';

describe.runIf(isNode())('fetchFragment', () => {
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
});
