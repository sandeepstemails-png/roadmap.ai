import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Nested node_modules and per-session worktree checkouts (e.g. under
    // .claude/worktrees/) aren't covered by the defaults above.
    "**/node_modules/**",
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
