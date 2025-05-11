import globals from "globals";
import tseslint from "typescript-eslint";
import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
    {
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2024,
            },
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
        linterOptions: {
            reportUnusedDisableDirectives: "warn",
        },
    },

    ...tseslint.configs.recommendedTypeChecked,

    pluginPrettierRecommended,

    {
        rules: {},
    },

    {
        ignores: ["node_modules/", "dist/", "coverage/", "*.md", "examples/**/*.html", "pnpm-lock.yaml", ".husky/"],
    },
);
