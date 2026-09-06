/**
 * NextAuth requires a secret in production. Prefer AUTH_SECRET / NEXTAUTH_SECRET
 * from the environment (Vercel). Fall back so /admin is not bricked when unset.
 */
const FALLBACK_AUTH_SECRET =
  "alexia-nails-and-more/HTMvgwxUGnGiqT4rgFTe//aMiWhADSaOZ76OSKvdam0B4LeNmff1L2p4oQXJlP4d";

export function getAuthSecret(): string {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    FALLBACK_AUTH_SECRET
  );
}
