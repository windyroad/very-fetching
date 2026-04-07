'use strict';

/* eslint-disable camelcase */
module.exports = {
	config: {
		MD013: {
			line_length: 120,
			heading_line_length: 120,
			code_block_line_length: 120,
			code_blocks: true,
			tables: true,
			headings: true,
			headers: true,
			strict: false,
			stern: false,
		},
		MD033: {
			allowed_elements: ['acronym', 'p', 'img'],
		},
		MD025: false,
		MD041: false,
		MD024: {
			allow_different_nesting: true,
		},
	},
	ignores: ['**/node_modules/**/*'],
};
