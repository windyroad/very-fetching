import {defineWorkspace} from 'vitest/config';

// DefineWorkspace provides a nice type hinting DX
export default defineWorkspace([
	'packages/*/vite.config.ts', // Allow testing of packages separately
	'apps/*/vite.config.ts', // Allow testing of apps separately
]);
