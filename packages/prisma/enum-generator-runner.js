#!/usr/bin/env node
// Use the locally installed ts-node to execute the TypeScript generator.
// This avoids relying on the `ts-node` binary being on PATH when Prisma
// spawns the generator and prevents ENOENT errors.
require('ts-node').register({ transpileOnly: true });
require('./enum-generator.ts');
