module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    testRegex: '.e2e-spec.ts$',
    setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
}