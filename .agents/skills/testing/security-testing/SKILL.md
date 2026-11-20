# Security Testing

## Purpose

Identify security weaknesses in trust boundaries, access control, inputs, secrets, configuration, dependencies, uploads, sharing, and model/data flows.

## Safe repository procedure

1. Read the current threat surface and relevant requirements. Current high-risk future boundaries are JWT validation, workspace ownership, source URL/file ingestion, public share tokens, connector credentials, and prompt-injected content.
2. Inspect code and configuration; never print `.env`, tokens, private keys, or service-role values. `git ls-files` can check tracked secret filenames without reading local secret contents.
3. For auth, test signature/algorithm/issuer/audience/expiry, missing identity, key rotation, and cross-owner access. For URL ingestion, plan SSRF controls (scheme, DNS/private address, redirects, size/time limits) before implementation. For uploads, test type/size/parse failures and malware boundary. For shares, test entropy, expiry, revocation, caching, and data scope.
4. Use existing checks (`uv run ruff check .`, frontend E2E security-header tests, GitHub Actions tracked-secret scan). No dependency vulnerability scanner is currently configured; do not claim dependency audit without one.
5. Do not attack public systems, production accounts, or third-party integrations. Test only an authorized isolated environment with bounded requests.

## Completion

Every significant finding includes evidence, severity, impact, and a remediation. Distinguish present vulnerabilities from controls that are merely missing before a feature is implemented. Redact sensitive output and state tools/areas not examined.
