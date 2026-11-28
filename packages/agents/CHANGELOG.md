# Changelog

## [0.5.0](https://github.com/rackrot/pi-tools/compare/pi-agents-v0.4.0...pi-agents-v0.5.0) (2026-11-28)


### Features

* **agents:** opt-in lock so configured model/thinking/maxTurns beat the caller's ([d21c576](https://github.com/rackrot/pi-tools/commit/d21c5763686cede50ffef5948ff6422024b8aadb))


### Bug Fixes

* **agents:** deny codemode in strict orchestration by default ([23696a0](https://github.com/rackrot/pi-tools/commit/23696a0b24e80f5d689e3761ea57ff0bd1a01d5f))
* **agents:** let the caller's model, thinking and max_turns override settings ([c37097d](https://github.com/rackrot/pi-tools/commit/c37097d146e9ebc40b04979e6cf63d954b1fa027))

## [0.4.0](https://github.com/rackrot/pi-tools/compare/pi-agents-v0.3.0...pi-agents-v0.4.0) (2026-11-27)


### Features

* **agents:** add nine workflows, a test-writer agent, and scope agent tools ([fe337f4](https://github.com/rackrot/pi-tools/commit/fe337f4e7a859bcab3fe265a1071abd97ddf53bb))
* **agents:** add plan-slice-implement, config-rollout and pr-merge-queue workflows ([0e3d4c9](https://github.com/rackrot/pi-tools/commit/0e3d4c912b5ce9d3c670ba3d3a4174fb5cb22b03))
* **agents:** ship SubagentWorkflow workflows and a subagent-workflows skill ([e9fe309](https://github.com/rackrot/pi-tools/commit/e9fe309c680063e00e410a3d2261f2d07dbab5da))
* **core:** shared grouped config screen with scope strip and change markers ([49eef3a](https://github.com/rackrot/pi-tools/commit/49eef3a2727f84714c5d9168583517eac43f4ec6))

## [0.3.0](https://github.com/rackrot/pi-tools/compare/pi-agents-v0.2.1...pi-agents-v0.3.0) (2026-11-26)


### Features

* **agents:** add orchestration levels that inject delegation rules and deny main-session tools ([036f1a5](https://github.com/rackrot/pi-tools/commit/036f1a513e11b1240fbd8912db85fb6990e0f8f9))


### Styles

* **agents:** format orchestration README section ([4cabc0e](https://github.com/rackrot/pi-tools/commit/4cabc0e64334138bacf59b85be9f5b2c3ec8e0b9))

## [0.2.1](https://github.com/rackrot/pi-tools/compare/pi-agents-v0.2.0...pi-agents-v0.2.1) (2026-11-26)


### Bug Fixes

* publish with pnpm so workspace: ranges resolve on npm ([f89c869](https://github.com/rackrot/pi-tools/commit/f89c869bf8c721b836bd8276e0ccdad3f9dc2413))

## [0.2.0](https://github.com/rackrot/pi-tools/compare/pi-agents-v0.1.0...pi-agents-v0.2.0) (2026-11-25)


### Features

* **agents:** add security-auditor, dependency-auditor, research-analyst; tighten reviewer ([fe91c89](https://github.com/rackrot/pi-tools/commit/fe91c89d92e113e2ac65f58f4c4ce19222296222))
* **core:** filterable pickers and left/right cycling in config UIs ([1960ee0](https://github.com/rackrot/pi-tools/commit/1960ee0a350cebe3ca850c488f5a210e0f7782cc))

## [0.1.0](https://github.com/rackrot/pi-tools/compare/pi-agents-v0.0.1...pi-agents-v0.1.0) (2026-11-25)


### Features

* document npm install for first release of agents, model-aliases, skill-index and skills ([258816e](https://github.com/rackrot/pi-tools/commit/258816e1306b26d8ce8a1a47f83f99657c54b786))


### Continuous Integration

* add CI and release-please workflows ([78bb15b](https://github.com/rackrot/pi-tools/commit/78bb15bda28b200c8017f32ce219a016d8367366))


### Miscellaneous Chores

* init repo ([9370634](https://github.com/rackrot/pi-tools/commit/9370634a5c9a8cc514b14fe3ed40f6f8efa261c8))
* license all packages under MIT ([681a44a](https://github.com/rackrot/pi-tools/commit/681a44a9971beb471dbc7472925d0734cc52cd73))
