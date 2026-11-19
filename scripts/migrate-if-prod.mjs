// Runs `prisma migrate deploy` during a Vercel build, but only on production.
// Preview deployments skip it: they build unmerged code, and a migration run
// from a preview would change the production schema before the PR is merged.
import { execSync } from "node:child_process";

const env = process.env.VERCEL_ENV;

if (env === "production") {
  console.log("Applying migrations to production…");
  execSync("npx prisma migrate deploy --config prisma7.config.ts", {
    stdio: "inherit",
  });
} else {
  console.log(`Skipping migrations (VERCEL_ENV=${env ?? "local"})`);
}
