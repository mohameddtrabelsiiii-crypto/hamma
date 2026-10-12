# ANGELS.co Guardian public identity pin

First observed 2026-10-12T14:28:55.871Z after initial HTTP request (UTC).

- Key type: Ed25519 (JWK: OKP/Ed25519)
- Public key x: `ahm5DOlXc-da-qwzwJ86sogQnWIToojoO18rNdwMR10`
- SHA-256 fingerprint over JSON {crv,kty,x}: `cade0bff6d81b9edbaf475ed82878312f70e7a8fb4978e69cca49eed02c76ace`
- Verification script: `verify-proof.mjs`

This is a source-control pin for comparing the runtime against prior observations, not independent company custody or cross-provider recovery. Private signing material remains in one Cloudflare Durable Object; external escrow/owner key recovery is not yet implemented. If the runtime identity changes unexpectedly, fail closed and open an incident.
