# Changelog

## [0.3.1](https://github.com/rackrot/pi-tools/compare/pi-skill-index-v0.3.0...pi-skill-index-v0.3.1) (2026-11-28)


### Code Refactoring

* lift embedding retrieval and one-shot model call into pi-core ([302bfae](https://github.com/rackrot/pi-tools/commit/302bfae846df703046be377445bc6e4199ee30a8))

## [0.3.0](https://github.com/rackrot/pi-tools/compare/pi-skill-index-v0.2.2...pi-skill-index-v0.3.0) (2026-11-27)


### Features

* **core:** shared grouped config screen with scope strip and change markers ([49eef3a](https://github.com/rackrot/pi-tools/commit/49eef3a2727f84714c5d9168583517eac43f4ec6))

## [0.2.2](https://github.com/rackrot/pi-tools/compare/pi-skill-index-v0.2.1...pi-skill-index-v0.2.2) (2026-11-26)


### Bug Fixes

* **skill-index:** make the skill_search instruction mandatory ([d30ce54](https://github.com/rackrot/pi-tools/commit/d30ce54189f327b0bc64f0112cd47cea405592db))

## [0.2.1](https://github.com/rackrot/pi-tools/compare/pi-skill-index-v0.2.0...pi-skill-index-v0.2.1) (2026-11-26)


### Bug Fixes

* publish with pnpm so workspace: ranges resolve on npm ([f89c869](https://github.com/rackrot/pi-tools/commit/f89c869bf8c721b836bd8276e0ccdad3f9dc2413))

## [0.2.0](https://github.com/rackrot/pi-tools/compare/pi-skill-index-v0.1.0...pi-skill-index-v0.2.0) (2026-11-25)


### Features

* **core:** filterable pickers and left/right cycling in config UIs ([1960ee0](https://github.com/rackrot/pi-tools/commit/1960ee0a350cebe3ca850c488f5a210e0f7782cc))
* **skill-index:** SQLite FTS5 store with embeddings, reranking and optional System One filter ([71b516c](https://github.com/rackrot/pi-tools/commit/71b516c06af312d9ee5d8887be213e12cd70ac0b))


### Bug Fixes

* **skill-index:** surface failed search stages and stop silently passing decision-model errors ([65d891f](https://github.com/rackrot/pi-tools/commit/65d891f8c391c3cc9ef1c5e9bca852c9761f0b9f))

## [0.1.0](https://github.com/rackrot/pi-tools/compare/pi-skill-index-v0.0.1...pi-skill-index-v0.1.0) (2026-11-25)


### Features

* document npm install for first release of agents, model-aliases, skill-index and skills ([258816e](https://github.com/rackrot/pi-tools/commit/258816e1306b26d8ce8a1a47f83f99657c54b786))


### Continuous Integration

* add CI and release-please workflows ([78bb15b](https://github.com/rackrot/pi-tools/commit/78bb15bda28b200c8017f32ce219a016d8367366))


### Miscellaneous Chores

* init repo ([9370634](https://github.com/rackrot/pi-tools/commit/9370634a5c9a8cc514b14fe3ed40f6f8efa261c8))
* license all packages under MIT ([681a44a](https://github.com/rackrot/pi-tools/commit/681a44a9971beb471dbc7472925d0734cc52cd73))
