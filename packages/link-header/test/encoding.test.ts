import {describe, test, expect} from 'vitest';
import {parseLinkHeader} from '../src/index.js';

describe('Encodings', function () {
	test('utf8', function () {
		const link = parseLinkHeader(
			'</risk-mitigation>; rel="start"; title*=UTF-8\'en\'%E2%91%A0%E2%93%AB%E2%85%93%E3%8F%A8%E2%99%B3%F0%9D%84%9E%CE%BB',
		);
		const references = [
			{
				uri: '/risk-mitigation',
				rel: 'start',
				// eslint-disable-next-line @typescript-eslint/naming-convention
				'title*': {
					language: 'en',
					value: '①⓫⅓㏨♳𝄞λ',
				},
			},
		];
		// Console.log( inspect( link ) )
		expect(link.refs).toEqual(references);
	});

	test('GB2312', function () {
		const link = parseLinkHeader(
			'</risk-mitigation>; rel="start"; title*=GB2312\'cn\'%C6%F3%20%D2%B5%20%B2%C3%20%D4%B1%20%B7%E7%20%CF%D5%20%B9%E6%20%B1%DC%30%34%3A%33%37%3A%32%31',
		);
		const references = [
			{
				uri: '/risk-mitigation',
				rel: 'start',
				// eslint-disable-next-line @typescript-eslint/naming-convention
				'title*': {
					language: 'cn',
					encoding: 'gb2312',
					value:
						'%C6%F3%20%D2%B5%20%B2%C3%20%D4%B1%20%B7%E7%20%CF%D5%20%B9%E6%20%B1%DC%30%34%3A%33%37%3A%32%31',
				},
			},
		];
		// Console.log( inspect( link ) )
		expect(link.refs).toEqual(references);
	});

	test('language optional', function () {
		const link = parseLinkHeader(
			'</risk-mitigation>; rel="start"; title*=UTF-8\'\'%E2%91%A0%E2%93%AB%E2%85%93%E3%8F%A8%E2%99%B3%F0%9D%84%9E%CE%BB',
		);
		const references = [
			{
				uri: '/risk-mitigation',
				rel: 'start',
				// eslint-disable-next-line @typescript-eslint/naming-convention
				'title*': {
					language: '',
					value: '①⓫⅓㏨♳𝄞λ',
				},
			},
		];
		// Console.log( inspect( link ) )
		expect(link.refs).toEqual(references);
	});
});
