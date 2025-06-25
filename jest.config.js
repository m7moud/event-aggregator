export default {
  verbose: true,
  testEnvironment: 'node',
  fakeTimers: {
    enableGlobally: true,
  },
  transform: {
    '^.+\\.js$': 'babel-jest', // Use babel-jest to transform JS files (can be adjusted if using TypeScript)
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Setup global mocks or initialization
};
