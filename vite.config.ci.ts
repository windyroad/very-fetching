import {defineConfig, mergeConfig} from 'vitest/config';
import commonConfig from './vite.config.js';

export default mergeConfig(
	commonConfig,
	defineConfig({
		test: {
			reporters: ['basic', 'junit', 'json'],
			outputFile: {
				junit: `test-results/TEST-result.xml`,
				json: `test-results/TEST-result.json`,
			},
		},
	}),
);
