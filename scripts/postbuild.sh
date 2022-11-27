#!/bin/bash -ex

# (cd packages/otel && rm -rf build && mkdir -p build && pnpm pack --pack-destination build)
# (cd .next/standalone && rm -rf otel && mkdir -p otel && cd otel && echo '{}' > package.json && echo 'packages: []' > pnpm-workspace.yaml && pnpm add --workspace-root ../../../packages/otel/build/*.tgz)
(cd .next/standalone/node_modules && mkdir -p @bemuse && cd @bemuse && rm -rf otel && ln -s ../../otel/node_modules/@bemuse/otel otel)