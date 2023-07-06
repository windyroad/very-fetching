import { defineConfig, configDefaults } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url))  

let testTimeout = 5_000; // 5 s
if (process.env.VSCODE_INSPECTOR_OPTIONS) {
  // we are debugging, so very big timeout
  testTimeout = 600_000; // 10 min
}

process.env.VITEST_JUNIT_SUITE_NAME = process.env.npm_package_name

export default defineConfig({
  test: {
    testTimeout,
    ...(process.env.VSCODE_INSPECTOR_OPTIONS ? { maxConcurrency: 1 } : {}),
    exclude: [...configDefaults.exclude, '**/*.sit.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
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
})