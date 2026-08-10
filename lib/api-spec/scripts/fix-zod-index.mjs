// Rewrites lib/api-zod/src/index.ts after orval codegen.
// Orval appends duplicate export lines and the generated zod const
// `SubscribeToPlanBody` (api.ts) collides with the generated TS type of the
// same name (types/), which breaks `export *`. This keeps the barrel stable.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.resolve(here, "..", "..", "api-zod", "src", "index.ts");

writeFileSync(
  indexPath,
  `// AUTO-MAINTAINED by lib/api-spec/scripts/fix-zod-index.mjs (runs after codegen).
export * from "./generated/api";
export * from "./generated/types";
// Explicit re-export to disambiguate: the zod schema (const) in api.ts and the
// TS type in types/ share the name SubscribeToPlanBody.
export { SubscribeToPlanBody } from "./generated/api";
export type { SubscribeToPlanBody as SubscribeToPlanBodyType } from "./generated/types";
`,
);
console.log("fixed", indexPath);
