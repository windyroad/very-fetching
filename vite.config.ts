import {fileURLToPath} from 'node:url';
import path from 'node:path';
import process from 'node:process';
import {defineConfig, configDefaults} from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let testTimeout = 5000; // 5 s
if (process.env.VSCODE_INSPECTOR_OPTIONS) {
	// We are debugging, so very big timeout
	testTimeout = 600_000; // 10 min
}

process.env.VITEST_JUNIT_SUITE_NAME = process.env.npm_package_name;

export default defineConfig({
	test: {
		testTimeout,
		...(process.env.VSCODE_INSPECTOR_OPTIONS ? {maxConcurrency: 1} : {}),
		exclude: [
			...configDefaults.exclude,
			'**/*.sit.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
		],
		coverage: {
			reporter: ['text', 'json', 'html', 'cobertura'],
		},
	},
	resolve: {
		alias: [
			{
				find: /^@windyroad\/(.*)$/,
				replacement: `${__dirname}/packages/$1/src`,
			},
		],
	},
});
