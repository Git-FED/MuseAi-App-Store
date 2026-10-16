# Muse AI App Store

<img width="2560" height="1440" alt="muse_landscape_store_05" src="https://github.com/user-attachments/assets/c18cc6b8-43fc-4a7c-a739-c9c0b65c14c3" />

A static, owner-published storefront for small AI apps distributed through GitHub Releases. There is no application backend: the storefront is HTML/CSS/JavaScript, catalog data is JSON, and access is controlled by the private GitHub packages repository.

## Rules at a glance
- Only the owner publishes public listings and releases.
- Muse attribution, a checksum, a signature reference, and a review record are required for every release.
- Windows and Android are the supported client targets.
- Store payments are PayPal and Stripe only. Support links never grant store access.
- The scanner is a filter, not a guarantee. Users must inspect permissions and verify hashes.

## Run locally
Serve the repository root with any static server, for example `python3 -m http.server 4173 --directory storefront` and open `http://localhost:4173/`.

## Repository map
- `storefront/` — static web UI.
- `catalog/` — public listing index and listing records.
- `agent/` — machine-readable discovery and terms.
- `muse-ai-app-packages/` — private release artifacts.
- `muse-ai-store-operations/` — private owner records and queues.
- `tools/` — deterministic validators and release helpers.

This repository contains no real credentials, private keys, or payment-card data.
