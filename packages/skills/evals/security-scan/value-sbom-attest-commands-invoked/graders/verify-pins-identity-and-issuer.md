---
type: regex
pattern: 'cosign verify-attestation\b(?=[\s\S]*--certificate-oidc-issuer[ =]\S*token\.actions\.githubusercontent\.com)[\s\S]*--certificate-identity[ =]\S*github\.com/acme/api/\.github/workflows/release\.ya?ml@refs/heads/main'
flags: i
weight: 1
target: last_message
---
