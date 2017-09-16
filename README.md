# How to build TypeScript mono-repo project

## Tools

* yarn: NPM client.
* Lerna: Multiple packages management tool.

## Directory Structure

Put each package under the `packages` directory.

```
.
├── README.md
├── lerna.json
├── package.json
├── packages
│   ├── x-cli
│   │   ├── lib
│   │   │   ├── main.d.ts
│   │   │   ├── main.js
│   │   │   └── main.js.map
│   │   ├── package.json
│   │   ├── src
│   │   │   └── main.ts
│   │   ├── tsconfig.build.json
│   │   └── tsconfig.json
│   └── x-core
│       ├── lib
│       │   ├── index.d.ts
│       │   ├── index.js
│       │   └── index.js.map
│       ├── package.json
│       ├── src
│       │   └── index.ts
│       ├── tsconfig.build.json
│       └── tsconfig.json
├── tsconfig.base.json
├── tsconfig.json
└── yarn.lock
```

## Workspaces

Using [yarn workspace feature](https://yarnpkg.com/en/docs/workspaces), configure the following files:

* /package.json

Append the `workspaces` key.

```json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

* lerna.json

Set `npmClient` `"yarn" and turn `useWorkspaces` on.

```json
{
  "lerna": "2.2.0",
  "packages": [
    "packages/*"
  ],
  "npmClient": "yarn",
  "useWorkspaces": true,
  "version": "1.0.0"
}
```

Exec `lerna bootstrap`. After successful running, all dependency packages are downloaded under the repository root `node_modules` directory.

### Dependencies between packages
In this example, the `x-cli` package dependes on another package, `x-core`. So to execute (or test) `x-cli`, `x-core` packages should be isntalled.
`lerna bootstrap` solve it. This command create sim-link of each packages into `node_modules`.

## Resolve Dependencies as TypeScript Modules
As mentioned above, Lerna resolves dependencies between packages. It's enough for "runtime".  However considering wrieting sourcecodes, it's not.

For example, the following code depends a module `x-core` located at other package.

```ts
/* packages/x-cli/src/main.ts */
import { awesomeFn } from "@quramy/x-core";

export function cli() {
  awesomeFn();
  return Promise.resolve(true);
}
```

TypeScript compiler emits a "Cannot find module" error untile building `x-core` package and creating `x-core/index.d.ts`. 
And it's silly to compile dependent packages(e.g. `x-core`) in the same repository after each editing them.

[TypeScript's path mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping) is the best solution.  Path mappings are declared such as:

```js
/* tsconfig.json */
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./packages",
    "paths": {
      "@quramy/*": ["./*/src"]
    }
  }
}
```

The above setting means `import { awesomeFn } from "@quramy/x-core"` is mapped to `import { awesomeFn } from "../../x-core/src"`. In other words, path mapping allows to treat developing packages' sources as published(compiled) modules.
