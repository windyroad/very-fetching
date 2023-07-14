/* eslint-disable camelcase */
const config = {
	config: {
		// MD013/line-length - Line length
		MD013: {
			// Number of characters
			line_length: 120,
			// Number of characters for headings
			heading_line_length: 120,
			// Number of characters for code blocks
			code_block_line_length: 120,
			// Include code blocks
			code_blocks: true,
			// Include tables
			tables: true,
			// Include headings
			headings: true,
			// Include headings
			headers: true,
			// Strict length checking
			strict: false,
			// Stern length checking
			stern: false,
		},
		MD033: {
			// Allowed elements
			allowed_elements: ['acronym', 'p', 'img'],
		},
		MD025: false,
	},
	// Define glob expressions to ignore
	ignores: ['**/node_modules/**/*'],
};

module.exports = config;
