module.exports = {
  testMatch: [
    "**/public/js/tests/e2e/**/*.js",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
  ],
  transform: {
    "^.+\\\.js$": "babel-jest",
  },
  testEnvironment: "node",
};
