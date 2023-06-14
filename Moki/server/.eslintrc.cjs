module.exports = {
  "env": {
    "node": true,
    "es2021": true,
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended"
  ],
  "settings": {
    "import/resolver": {
      "typescript": {},
      }
  },
  "overrides": [],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": "./",
    "ecmaVersion": "latest",
    "sourceType": "module",
  },
  "plugins": [
    "@typescript-eslint",
    "import"
  ],
  "rules": {
    "import/no-unresolved": 2,
    "import/no-commonjs": 2,
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn", // or "error"
      { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],
  },
};
