# Storing API keys you issue: why SHA-256

For the keys side of the "Keys or OAuth" gate in SKILL.md. A key identifies the calling application, not a user, so design it so a leaked, lost or orphaned key stays a contained event.

## Store and look up

- Show the full key once at creation and store only a SHA-256 hash, with an indexed plaintext prefix as the lookup handle.
- Draw the key body from a CSPRNG with at least 120 bits of entropy. Count only the part of the body that is not stored in plaintext toward that floor: the hash is unsalted SHA-256, and the stored characters give an attacker a head start.
- Validate the format (and checksum, if the key has one) before any database call, compare hashes in constant time, check expiry and revocation, then check scopes.
- Fail secure. A missing server-side secret (for example a KMS key) must stop the service at startup and never fall back to a built-in default.

## Why SHA-256 and not a password hash

SHA-256 is right here because the key is high-entropy and machine-generated, so brute force fails at any hash speed and a slow hash only adds CPU to every request. Argon2id or bcrypt protect low-entropy human passwords, and bcrypt also truncates input at 72 bytes. The entropy floor is what makes this safe, so enforce it at generation. This rationale is reasoning from key entropy, not an OWASP statement.

## Review flags

- Plaintext or reversibly encrypted keys outside a KMS design.
- A missing secret that falls back to a default.
- A non-constant-time comparison on the auth path.
- A hash-only scheme where the key body was not generated with the entropy floor, such as a human-chosen or short key.
