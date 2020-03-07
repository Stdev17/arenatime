module.exports = {
    moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'json'],
    transform: {
        '^.+\\.(js|jsx)?$': 'babel-jest',
        '\\.ts$': ['ts-jest']
    },
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1'
    },
    testMatch: [
        //'<rootDir>/*.spec.(js|jsx|ts|tsx)',
        '<rootDir>/src/util/*.spec.(js|jsx|ts|tsx)',
        '<rootDir>/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))'
    ],
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    }
};
/*
    collectCoverageFrom: ['src/@@/*.{js,jsx,ts,tsx}', '!src/@@/*.d.ts'],
    setupFiles: ['react-app-polyfill/jsdom'],
    setupFilesAfterEnv: [],
    testMatch: [
        '<rootDir>/src/@@/__tests__/@@/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/util/*.{spec,test}.{js,jsx,ts,tsx}'
    ],
    testEnvironment: 'jest-environment-jsdom-fourteen',
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
        '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)':
            '<rootDir>/config/jest/fileTransform.js'
    },
    transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
        '^.+\\.module\\.(css|sass|scss)$'
    ],
    modulePaths: [],
    moduleNameMapper: {
        '^react-native$': 'react-native-web',
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy'
    },
    moduleFileExtensions: [
        'web.js',
        'js',
        'web.ts',
        'ts',
        'web.tsx',
        'tsx',
        'json',
        'web.jsx',
        'jsx',
        'node'
    ],
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname'
    ]
};
*/
