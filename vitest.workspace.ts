import {defineWorkspace} from 'vitest/config';

// DefineWorkspace provides a nice type hinting DX
export default defineWorkspace([
	'apps/*', // Allow testing of apps separately
	'packages/*', // Allow testing of packages separately
]);
