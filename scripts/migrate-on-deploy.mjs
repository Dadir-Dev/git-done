// Runs `prisma migrate deploy` during a Vercel build.
// Production migrates production. Preview migrates its own branch, never
// production, so unmerged code cannot change the production schema.
import { execSync } from "node:child_process";
import { shouldMigrate } from "./migrate-decision.mjs";

const vercelEnv = process.env.VERCEL_ENV;
const neonBranch = process.env.NEON_BRANCH;

if (shouldMigrate(vercelEnv, neonBranch)) {
  console.log(
    `Applying migrations to ${neonBranch ?? "the production database"}…`,
  );
  execSync("npx prisma migrate deploy --config prisma7.config.ts", {
    stdio: "inherit",
  });
} else if (vercelEnv === "preview") {
  console.warn(
    `Skipping migrations: a preview build only migrates the "preview" branch (NEON_BRANCH=${neonBranch ?? "unset"}).`,
  );
} else {
  console.log(`Skipping migrations (VERCEL_ENV=${vercelEnv ?? "local"})`);
}
