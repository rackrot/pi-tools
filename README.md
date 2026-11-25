# pi-tools

Monorepo of [pi](https://pi.dev) extensions. Each directory in `packages/` is an independently installable pi package.

## Develop

    pnpm install
    pnpm check          # biome + tsc
    pi -e ./packages/hello/src/index.ts

## Add a package

Copy `packages/hello`, rename it, and edit the `pi` manifest in its `package.json`.
Host-provided pi libs go in `peerDependencies` (`"*"`), never `dependencies`.

## Install

    pi install ./packages/hello          # local
    pi install npm:@rackrot/pi-hello     # once published

## Releases

Conventional Commits; `pnpm changelog` runs git-cliff.
