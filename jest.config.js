module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleDirectories: [
    "node_modules",
    "<rootDir>/node_modules/expo/node_modules",
  ],
};
