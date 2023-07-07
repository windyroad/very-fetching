const config = require('../../.xo-config.cjs')
module.exports = { 
    ...config,
    // rules: {
    //     // ...config.rules,
    //     "unicorn/prefer-module": "off",
    //     "@typescript-eslint/no-require-imports": "off",
    //     "import/no-extraneous-dependencies": [
    //         "error",
    //         {
    //             "devDependencies": [
    //                 "**/*.test.ts",
    //                 "**/test/**",
    //                 "**/build-tools/**",
    //                 "src/build/**"
    //             ],
    //             "optionalDependencies": false,
    //             "peerDependencies": true
    //         }
    //     ]
    // }
}