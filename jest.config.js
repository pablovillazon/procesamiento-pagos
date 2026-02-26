"use strict";
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    testRegex: '.spec.ts$',
    setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
//# sourceMappingURL=jest.config.js.map