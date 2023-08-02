import {test} from 'vitest';
import fc from 'fast-check';
import {resolveLinkUrls} from './resolve-link-urls';
import {type Link} from './link';

test('resolveLinkUrls resolves links relative to base URL', async ({
	expect,
}) => {
	const links = [
		{uri: '/path/to/resource', rel: 'resource'},
		{uri: '../other/resource', rel: 'other'},
	];
	const baseUrl = 'https://example.com/base/path/';
	const expectedUrls = [
		'https://example.com/path/to/resource',
		'https://example.com/base/other/resource',
	];

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(expectedUrls);
});

test('resolveLinkUrls returns empty array for empty input', async ({
	expect,
}) => {
	const links: Link[] = [];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map(
		(urlAndLink) => urlAndLink.url,
	);

	expect(actualUrls).toEqual([]);
});

test('resolveLinkUrls returns URLs with correct protocol', async ({expect}) => {
	const links = [{uri: '//example.com', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://example.com/']);
});

test('resolveLinkUrls returns URLs with query parameters', async ({expect}) => {
	const links = [{uri: '/path?query=value', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://example.com/path?query=value']);
});

test('resolveLinkUrls returns URLs with hash fragment', async ({expect}) => {
	const links = [{uri: '/path#fragment', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://example.com/path#fragment']);
});

test('resolveLinkUrls returns URLs with username and password', async ({
	expect,
}) => {
	const links = [{uri: '//user:password@example.com', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://user:password@example.com/']);
});

test('resolveLinkUrls returns URLs with port number', async ({expect}) => {
	const links = [{uri: '//example.com:8080', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://example.com:8080/']);
});

test('resolveLinkUrls returns URLs with path parameters', async ({expect}) => {
	const links = [{uri: '/path/%7B_param%7B', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://example.com/path/%7B_param%7B']);
});

test('resolveLinkUrls returns URLs with query parameters and path parameters', async ({
	expect,
}) => {
	const links = [{uri: '/path/%7B_param%7B?query=value', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual([
		'https://example.com/path/%7B_param%7B?query=value',
	]);
});

test('resolveLinkUrls returns URLs with query parameters and hash fragment', async ({
	expect,
}) => {
	const links = [{uri: '/path?query=value#fragment', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://example.com/path?query=value#fragment']);
});

test('resolveLinkUrls returns URLs with path parameters and hash fragment', async ({
	expect,
}) => {
	const links = [{uri: '/path/%7B_param%7B#fragment', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual([
		'https://example.com/path/%7B_param%7B#fragment',
	]);
});

test('resolveLinkUrls returns URLs with query parameters, path parameters, and hash fragment', async ({
	expect,
}) => {
	const links = [
		{uri: '/path/%7B_param%7B?query=value#fragment', rel: 'resource'},
	];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual([
		'https://example.com/path/%7B_param%7B?query=value#fragment',
	]);
});

test('resolveLinkUrls returns URLs with special characters', async ({
	expect,
}) => {
	const links = [{uri: "/path/!$&'()*+,;=:@", rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(["https://example.com/path/!$&'()*+,;=:@"]);
});

test('resolveLinkUrls returns URLs with percent-encoded characters', async ({
	expect,
}) => {
	const links = [
		{uri: '/path/%21%24%26%27%28%29%2A%2B%2C%3B%3D%3A%40', rel: 'resource'},
	];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual([
		'https://example.com/path/%21%24%26%27%28%29%2A%2B%2C%3B%3D%3A%40',
	]);
});

test('resolveLinkUrls returns URLs with invalid percent-encoded sequences', async ({
	expect,
}) => {
	const links = [{uri: '/path/%2G', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://example.com/path/%2G']);
});

test('resolveLinkUrls returns URLs with invalid percent-encoded sequences in query parameters', async ({
	expect,
}) => {
	const links = [{uri: '/path?query=%2G', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://example.com/path?query=%2G']);
});

test('resolveLinkUrls returns URLs with invalid percent-encoded sequences in path parameters', async ({
	expect,
}) => {
	const links = [{uri: '/path/%7B_param:%2G%7B', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://example.com/path/%7B_param:%2G%7B']);
});

test('resolveLinkUrls returns URLs with invalid percent-encoded sequences in hash fragment', async ({
	expect,
}) => {
	const links = [{uri: '/path#%2G', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://example.com/path#%2G']);
});

test('resolveLinkUrls returns URLs with invalid percent-encoded sequences in query parameters and hash fragment', async ({
	expect,
}) => {
	const links = [{uri: '/path?query=%2G#fragment', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://example.com/path?query=%2G#fragment']);
});

test('resolveLinkUrls returns URLs with invalid percent-encoded sequences in path parameters and hash fragment', async ({
	expect,
}) => {
	const links = [{uri: '/path/%7B_param:%2G%7B#fragment', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual([
		'https://example.com/path/%7B_param:%2G%7B#fragment',
	]);
});

test('resolveLinkUrls returns URLs with invalid percent-encoded sequences in query parameters and path parameters', async ({
	expect,
}) => {
	const links = [{uri: '/path/%7B_param:%2G%7B?query=value', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual([
		'https://example.com/path/%7B_param:%2G%7B?query=value',
	]);
});

test('resolveLinkUrls returns URLs with invalid percent-encoded sequences in query parameters, path parameters, and hash fragment', async ({
	expect,
}) => {
	const links = [
		// eslint-disable-next-line no-secrets/no-secrets
		{uri: '/path/%7B_param:%2G%7B?query=value#fragment', rel: 'resource'},
	];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual([
		// eslint-disable-next-line no-secrets/no-secrets
		'https://example.com/path/%7B_param:%2G%7B?query=value#fragment',
	]);
});

test('resolveLinkUrls returns URLs with invalid percent-encoded sequences in username and password', async ({
	expect,
}) => {
	const links = [{uri: '//user:%2G@example.com', rel: 'resource'}];
	const baseUrl = 'https://example.com/';

	const actualUrls = resolveLinkUrls({links, baseUrl}).map((url) =>
		url.url.toString(),
	);

	expect(actualUrls).toEqual(['https://user:%2G@example.com/']);
});
