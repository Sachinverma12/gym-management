/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/server"],
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/server/jest.setup.ts"],
  testMatch: ["**/server/**/*.test.ts", "**/server/**/*.test.tsx"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.js$": "ts-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(supertest|jsonwebtoken|bcrypt|express)/)",
  ],
};