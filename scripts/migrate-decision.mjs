/**
 * Whether this build may run `prisma migrate deploy`.
 *
 * Production migrates production. A preview build migrates only the branch it
 * owns (`preview`): if the preview environment points anywhere else — most
 * dangerously at production — a build of unmerged code must not change that
 * schema, so it skips. Anything that is not a Vercel deploy never migrates.
 *
 * @param {string | undefined} vercelEnv - Vercel's `VERCEL_ENV`
 * @param {string | undefined} neonBranch - the Neon branch this build points at
 * @returns {boolean}
 */
export function shouldMigrate(vercelEnv, neonBranch) {
  if (vercelEnv === "production") return true;
  if (vercelEnv !== "preview") return false;
  return neonBranch === "preview";
}
