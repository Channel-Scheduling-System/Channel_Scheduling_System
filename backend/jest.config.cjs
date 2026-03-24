const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tests/tsconfig.json',
            },
        ],
    },
    moduleNameMapper: {
        '^#/(.*)\\.js$': '<rootDir>/src/$1.ts',
        '^#/(.*)$': '<rootDir>/src/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};

module.exports = config;
