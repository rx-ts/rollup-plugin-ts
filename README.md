<p align="center">
 <img alt="Logo" src="https://raw.githubusercontent.com/wessberg/rollup-plugin-ts/master/assets/rollup-plugin-ts-logo.png" height="150" />
</p>

> A Typescript Rollup plugin that bundles declarations and respects Babel and Browserslist configurations.

[![Travis](https://img.shields.io/travis/com/rx-ts/rollup-plugin-ts.svg)](https://travis-ci.com/rx-ts/rollup-plugin-ts)
[![Codecov](https://img.shields.io/codecov/c/github/rx-ts/rollup-plugin-ts.svg)](https://codecov.io/gh/rx-ts/rollup-plugin-ts)
[![Codacy Grade](https://img.shields.io/codacy/grade/0466995fd8314f2ba6ab613faf410e4e)](https://www.codacy.com/app/rx-ts/rollup-plugin-ts)
[![npm](https://img.shields.io/npm/v/rollup-plugin-ts.svg)](https://www.npmjs.com/package/rollup-plugin-ts)
[![GitHub release](https://img.shields.io/github/release/rx-ts/rollup-plugin-ts)](https://github.com/rx-ts/rollup-plugin-ts/releases)

[![David Peer](https://img.shields.io/david/peer/rx-ts/rollup-plugin-ts.svg)](https://david-dm.org/rx-ts/rollup-plugin-ts?type=peer)
[![David](https://img.shields.io/david/rx-ts/rollup-plugin-ts.svg)](https://david-dm.org/rx-ts/rollup-plugin-ts)
[![David Dev](https://img.shields.io/david/dev/rx-ts/rollup-plugin-ts.svg)](https://david-dm.org/rx-ts/rollup-plugin-ts?type=dev)

[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![codechecks.io](https://raw.githubusercontent.com/codechecks/docs/master/images/badges/badge-default.svg?sanitize=true)](https://codechecks.io)

## TOC <!-- omit in TOC -->

- [Description](#description)
  - [Features](#features)
- [Install](#install)
- [Usage](#usage)
  - [Using it with just Typescript](#using-it-with-just-typescript)
    - [Typescript and tslib helpers](#typescript-and-tslib-helpers)
  - [Combining Typescript with a Browserslist](#combining-typescript-with-a-browserslist)
    - [Using the plugin with Typescript, but without Browserslist](#using-the-plugin-with-typescript-but-without-browserslist)
  - [Combining Typescript with Babel](#combining-typescript-with-babel)
    - [Special handling for minification presets/plugins](#special-handling-for-minification-presetsplugins)
    - [`@babel/runtime` and external helper](#babelruntime-and-external-helper)
    - [`@babel/runtime` and polyfills](#babelruntime-and-polyfills)
  - [Using `CustomTransformers`](#using-customtransformers)
- [Declaration files](#declaration-files)
- [Examples](#examples)
  - [Pure Typescript example](#pure-typescript-example)
  - [Typescript with Browserslist example](#typescript-with-browserslist-example)
  - [Typescript, Babel, and Browserslist example](#typescript-babel-and-browserslist-example)
  - [Pure Typescript with CustomTransformers](#pure-typescript-with-customtransformers)
  - [Advanced example of using Typescript, Babel, and Browserslist together](#advanced-example-of-using-typescript-babel-and-browserslist-together)
- [Ignored/overridden options](#ignoredoverridden-options)
  - [Ignored/overridden Typescript options](#ignoredoverridden-typescript-options)
  - [Ignored/overridden Babel options](#ignoredoverridden-babel-options)
  - [Default Babel Presets/Plugins](#default-babel-presetsplugins)
- [FAQ](#faq)
  - [Does this plugin work with Code Splitting?](#does-this-plugin-work-with-code-splitting)
  - [Why wouldn't you use just Typescript?](#why-wouldnt-you-use-just-typescript)
  - [Okay, then why wouldn't you use just babel?](#okay-then-why-wouldnt-you-use-just-babel)
  - [When combined with Babel, what does Typescript do, and what does Babel do?](#when-combined-with-babel-what-does-typescript-do-and-what-does-babel-do)
- [Changelog](#changelog)
- [License](#license)

## Description

This is a _fork_ of [@wessberg/rollup-plugin-ts](https://github.com/wessberg/rollup-plugin-ts) which is a Rollup plugin that enables integration between Typescript, Babel, Browserslist, and Rollup.
It is first and foremost a Typescript plugin that enables full interoperability with Rollup. With it comes very powerful bundling and tree-shaking of generated Typescript declaration files that works seamlessly with code splitting.

### Features

In comparison with the [official plugin](https://github.com/rollup/rollup-plugin-typescript), this one has several significant improvements:

- Compiler diagnostics are correctly emitted and brought into the Rollup build lifecycle
- [Emit-less types](https://github.com/rollup/rollup-plugin-typescript/issues/28) are correctly handled
- Generation and bundling of Definition files (`.d.ts`) are supported and fully supports code splitting
- A [Browserslist](https://github.com/browserslist/browserslist) can be provided instead of a target version of ECMAScript such that your code is transpiled in relation to the baseline of browsers defined in your Browserslist instead.
- Babel can be used as the transpiler, rather than Typescript, such that Typescript handles diagnostics, declarations, and stripping away types, and Babel is used for syntax transformation.

## Install

```sh
# npm
npm i -D rollup-plugin-ts

# yarn
yarn add -D rollup-plugin-ts
```

## Usage

Using the plugin is as simple as it can be. Here's an example within a Rollup config:

```js
import ts from 'rollup-plugin-ts'
export default {
  // ...
  plugins: [
    ts({
      /* Plugin options */
    }),
  ],
}
```

Without any options, the plugin will _"just work"_:

- The `tsconfig.json` file closest to the current working directory will be resolved, if any. Otherwise, the default Typescript options will be used.
- The `.browserslistrc` file or `browserslist` property within the `package.json` file closest to the current working directory will be resolved and used to decide the Typescript ECMAScript version target, if any. Otherwise, the declared `target` within the resolved `tsconfig.json` file will be used, if any such file exists, and if not, the default Typescript target will be used.

### Using it with just Typescript

This plugin works very well with just Typescript.
The `tsconfig.json` file closest to your project will be resolved and used in combination with Rollup.
If your config has a different name, or if you use different configs dynamically depending on the environment, you can provide the location for the `tsconfig` in the plugin options:

```js
ts({
  tsconfig: PRODUCTION ? 'tsconfig.prod.json' : 'tsconfig.json',
})
```

You an also pass in [CompilerOptions](https://www.typescriptlang.org/docs/handbook/compiler-options.html) directly, rather than provide the path to a `tsconfig`:

```js
ts({
  tsconfig: {
    target: ScriptTarget.ES2018,
    allowSyntheticDefaultImports: true,
    allowJs: true,
  },
})
```

You can also pass in a function that receives whatever `CompilerOptions` that could be resolved relative to the current working directory, but then allow you to override the options:

```js
ts({
  tsconfig: resolvedConfig => ({ ...resolvedConfig, allowJs: false }),
})
```

The above example is based on the assumption that a file can be resolved with the name `tsconfig.json`, and if not, the Typescript's default `CompilerOptions` will be used.
But if you want to provide the name of the `tsconfig` to override, you can also pass in an object following the following form:

```js
ts({
  tsconfig: {
    fileName: 'my-awesome-tsconfig.json',
    hook: resolvedConfig => ({ ...resolvedConfig, allowJs: false }),
  },
})
```

If there is a `.browserslistrc` file or the nearest `package.json` contains a Browserslist configuration, a target ECMAScript version will be decided based on that one, rather than respecting the `target` property of the matched `tsconfig`.
If you do not want this behavior, you can [disable it as described here](#using-the-plugin-with-typescript-but-without-browserslists).

#### Typescript and tslib helpers

This plugin makes sure that the helper functions that may be emitted within the output generated by Typescript will not be duplicated across files and chunks. Instead, they will automatically be divided into chunks and imported across Rollup chunks.
You don't have to do anything!

### Combining Typescript with a Browserslist

If there is a `.browserslistrc` file or the nearest `package.json` contains a Browserslist configuration, this is the default behavior! Rather than use the `target` property of the nearest `tsconfig`, it will be decided based on the Browserslist.

You can explicitly pass in Browserslist options. Here's an example with a raw Browserslist query:

```js
ts({
  browserslist: ['last 1 version', '> 1%'],
})
```

You can also provide a configuration object instead of a raw query. Here's one with a baked-in query:

```js
ts({
  browserslist: {
    query: ['last 1 version', '> 1%'],
  },
})
```

...And here's one with a `path` property pointing to a file that contains a Browserslist:

```js
ts({
  browserslist: {
    path: '.mybrowserslistrc',
  },
})
```

#### Using the plugin with Typescript, but without Browserslist

If no Browserslist can be found, or if you simply don't want to use one, that's completely OK!
In such cases, the `target` property of the nearest `tsconfig` will be used (or use the Typescript default setting if no such file exists).

You can explicitly request that no Browserslist will be used by setting the `browserslist` property to `false` in the plugin options:

```js
ts({
  browserslist: false,
})
```

### Combining Typescript with Babel

This plugin makes it really easy to use Typescript for reporting diagnostics, generating declaration files, and stripping types, but then using Babel for all other syntax transformations.
One very strong use case for this is to use [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env). Another one is that you get the entire ecosystem of Babel plugins at your disposal.

To use Babel, simply set the `transpiler` plugin option to `"babel"`:

```js
ts({
  transpiler: 'babel',
})
```

That's it! The plugin will attempt to locate a `babel.config.js` file or a `.babelrc` file and use the options, plugins, and presets found there.
By default, some combination of presets and plugins will be applied depending on the config options you provide. See [this section](#default-babel-presetsplugins) for more details.

#### Special handling for minification presets/plugins

This plugin will apply syntax transformations from Babel presets and plugins on a file-by-file basis. However, if a a minification-related plugin or preset such as [babel-preset-minify](https://github.com/babel/minify/tree/master/packages/babel-preset-minify) is found within the Babel options,
these transformations will be applied per chunk. This enables the minification presets and plugins to perform better as it can now mangle in relation to the entire chunk and better remove unwanted characters such as whitespace.
All of this works automatically.

#### `@babel/runtime` and external helper

This plugin will automatically make sure to avoid duplication of emitted Babel helpers. Rollup will automatically split these into chunks and re-use them across the chunks that Rollup generates.
You don't have to do anything.

#### `@babel/runtime` and polyfills

Babel supports injecting polyfills where needed and in relation to the target environment. By default, this plugin **will not** add polyfills to your chunks since there are arguably better ways of applying polyfills such as lazy-loading depending on feature support or using something like [Polyfill.app](https://github.com/wessberg/polyfiller).
If you would like this behavior, simply add either `@babel/plugin-transform-runtime` to your Babel config with the `corejs` option set to true, or add `@babel/preset-env` to your Babel config with the `useBuiltIns` option set to `usage`.

### Using `CustomTransformers`

This plugin enables you to pass in [`CustomTransformers`](https://github.com/Microsoft/TypeScript/pull/13940) which allows you to transform the Typescript AST during code transpilation.
This enables you to very efficiently transform Typescript before code generation and additionally enables you to use this plugin with tools that leverage this, such as some modern web frameworks and libraries do.

## Declaration files

Typescript declaration files are normally distributed in a folder structure that resembles the structure of the source folder.
With `tsc`, you would get something like this:

<img alt="TSC emitted code" src="https://raw.githubusercontent.com/wessberg/rollup-plugin-ts/master/assets/tsc-output-example.png" height="250"   />

Rollup is a bundler, and with it, we can produce clean, small files that are easy to distribute.
With `rollup-plugin-ts`, declaration files will be bundled, tree-shaken and emitted alongside the chunks emitted by Rollup:

<img alt="Plugin emitted code" src="https://raw.githubusercontent.com/wessberg/rollup-plugin-ts/master/assets/plugin-output-example.png" height="250"   />

And, it even works in complex code splitting scenarios:

<img alt="Plugin emitted code with code splitting" src="https://raw.githubusercontent.com/wessberg/rollup-plugin-ts/master/assets/plugin-output-example-code-splitting.png" height="250"   />

## Examples

### Pure Typescript example

```js
ts({
  // If your tsconfig is already called 'tsconfig.json', this option can be left out
  tsconfig: 'tsconfig.json',
  // If there is no .browserslistrc within your project, and if your package.json doesn't include a Browserslist property, this option can be left out
  browserslist: false,
})
```

### Typescript with Browserslist example

[As described here](#combining-typescript-with-a-browserslist), by default, the plugin will attempt to locate a Browserslist automatically. This example
shows how you can provide one explicitly

```js
ts({
  browserslist: ['last 1 version', '> 1%'],
})

// or
ts({
  browserslist: { path: '.mybrowserslistrc' },
})
```

### Typescript, Babel, and Browserslist example

[As described here](#combining-typescript-with-babel), a `babel.config.js` or `.babelrc` file will automatically be found by the plugin if available. This example shows how you can provide one explicitly.
And, [as described here](#typescript-with-browserslist-example), the same goes for Browserslist.

```js
ts({
  transpiler: 'babel',
  browserslist: ['last 1 version', '> 1%'],
  babelConfig: {
    plugins: ['my-babel-plugin'],
  },
})
```

### Pure Typescript with CustomTransformers

```js
ts({
  transformers: {
    before: [myTransformer1, myTransformer2],
    after: [myTransformer3, myTransformer4],
    afterDeclarations: [myTransformer5, myTransformer6],
  },
})
```

### Advanced example of using Typescript, Babel, and Browserslist together

This example shows how you can use this plugin to accomplish quite advanced things:

```js
const IS_PRODUCTION = (process.env.NODE_ENV = 'production')
const BUNDLE_TARGET = process.env.NODE_ENV
const BROWSERSLIST_MODERN = ['since 2015', 'not dead', '> 5%']
const BROWSERSLIST_LEGACY = ['defaults']
const APP_ROOT = '/some/project/root/folder'
const awesomeFrameworkTransformers = getAwesomeFrameworkCustomTransformers()

ts({
  // Use Babel for Syntax transformations
  transpiler: 'babel',
  // Don't use process.cwd(), but instead another root directory
  cwd: APP_ROOT,
  // Load a different tsconfig file in production
  tsconfig: IS_PRODUCTION ? 'tsconfig.prod.json' : 'tsconfig.json',
  // Load a different browserslist if currently targeting a modern environment
  browserslist: {
    path:
      BUNDLE_TARGET === 'modern'
        ? '.browserlistrc-modern'
        : '.browserslistrc-legacy',
  },
  // Load a different babel config file in production
  babelConfig: IS_PRODUCTION ? 'babel.config.prod.js' : 'babel.config.js',

  // Exclude files within node_modules when not in production
  exclude: IS_PRODUCTION ? [] : ['node_modules/**/*.*'],

  // Apply CustomTransformers, for example to transform the Source Code with a framework that uses some
  transformers: awesomeFrameworkTransformers,
})
```

## Ignored/overridden options

Typescript and Babel are powerful tools in their own right. Combined with Rollup, they become even more powerful.
To provide a seamless experience, Rollup always take precedence when conflicts arise. As a natural consequence of this, some options provided to Typescript and Babel will be ignored or overridden.

### Ignored/overridden Typescript options

The following [CompilerOptions](https://www.typescriptlang.org/docs/handbook/compiler-options.html) from a `tsconfig` will be ignored:

| Property              | Reason                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `outDir`              | Rollup, not Typescript, will decide where to emit chunks.                                                                                                                                                                                                                                                                                                                                  |
| `outFile`             | This option produces flat output and only works with the module formats AMD and SystemJS. Rollup will be the decider of how to split code.                                                                                                                                                                                                                                                 |
| `sourceMap`           | Typescript will always be instructed to produce SourceMaps. Rollup then decides whether or not to include them (and if they should be inlined).                                                                                                                                                                                                                                            |
| `inlineSourceMap`     | Typescript will always be instructed to produce SourceMaps. Rollup then decides whether or not to include them (and if they should be inlined).                                                                                                                                                                                                                                            |
| `inlineSources`       | Since `inlineSourceMap` is ignored, this option won't take effect.                                                                                                                                                                                                                                                                                                                         |
| `importHelpers`       | Helpers will always be imported. This makes it possible for Rollup to code-split properly and share Typescript helpers across chunks.                                                                                                                                                                                                                                                      |
| `moduleResolution`    | Node-module resolution will always be used. This is required for `importHelpers` to work and in general, to make Typescript able to resolve external libraries. Note that you still need to add the [nodeResolve](https://github.com/rollup/rollup-plugin-node-resolve) plugin in order to include external libraries within your bundle unless `allowJs` is `true` within your `tsconfig` |
| `noEmit`              | Typescript should always be able to emit assets, but those will be delegated to Rollup.                                                                                                                                                                                                                                                                                                    |
| `noEmitOnError`       | See above.                                                                                                                                                                                                                                                                                                                                                                                 |
| `emitDeclarationOnly` | See above.                                                                                                                                                                                                                                                                                                                                                                                 |
| `noEmitHelpers`       | Typescript should always be able to emit helpers, since the `importHelpers` option is forced                                                                                                                                                                                                                                                                                               |
| `noResolve`           | Typescript should always be able to resolve things. Otherwise, compilation might break.                                                                                                                                                                                                                                                                                                    |
| `watch`               | Rollup, not Typescript, will watch files if run in watch mode. Efficient caching will still be used for optimum performance.                                                                                                                                                                                                                                                               |
| `preserveWatchOutput` | See above                                                                                                                                                                                                                                                                                                                                                                                  |

The following additional options will also be ignored:

| Property  | Reason                                                                                                                                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `include` | Rollup itself will decide which files to include in the transformation process based on your code. This plugin itself takes a `include` property which you should use instead if you want to explicitly allow specific files or globs. |
| `exclude` | See above.                                                                                                                                                                                                                             |

### Ignored/overridden Babel options

The following [Babel options](https://babeljs.io/docs/en/options) will be ignored:

| Property     | Reason                                                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sourceMaps` | Babel will always be instructed to produce SourceMaps. Rollup then decides whether or not to include them (and if they should be inlined).                                                                                             |
| `cwd`        | The `cwd` option provided to the plugin will always be used.                                                                                                                                                                           |
| `include`    | Rollup itself will decide which files to include in the transformation process based on your code. This plugin itself takes a `include` property which you should use instead if you want to explicitly allow specific files or globs. |
| `exclude`    | See above                                                                                                                                                                                                                              |
| `ignore`     | See above                                                                                                                                                                                                                              |
| `only`       | See above                                                                                                                                                                                                                              |
| `sourceType` | Will always use `module`. Rollup will then decide what to do based on the output format                                                                                                                                                |

### Default Babel Presets/Plugins

If you decide to use Babel as the transpiler with the `transpiler` plugin option set to `"babel"`, some best-practice default plugins and presets will be applied such that you don't have to configure anything on your own.
By default, the plugin will conditionally apply the `@babel/preset-env` preset if a Browserslist is provided or located, as well as plugins for handling [shipped proposals](https://babeljs.io/docs/en/babel-preset-env#shippedproposals). And, the `@babel/plugin-runtime` plugin will be used for extracting Babel helpers and reusing them across your chunks to avoid code duplication.

If you provide these presets or plugins yourself through the found or provided Babel config, _your_ config options will take precedence.

Here's table with a full overview of the specifics:

| Preset/Plugin                      | Condition                                                                                                                                                  | Reason                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `babel-preset-proposal-typescript` | Yet another Babel preset for TypeScript, only transforms proposals which TypeScript does not support now. It will "_Just Work"_ for all shipped proposals. |
| `@babel/preset-env`                | A Browserslist is provided or found automatically, and you don't provide this preset yourself within your Babel config                                     | This preset enables you to base your syntax transformations on the specific browsers/environment you want your application or library to target. It will "_Just Work"_                                                                                                                                                                                                                                   |
| `@babel/plugin-transform-runtime`  | You don't provide this plugin yourself within your Babel config                                                                                            | Depending on your configuration, async functions may be rewritten to use [Regenerator Runtime](https://github.com/facebook/regenerator/tree/master/packages/regenerator-runtime), and there may be one or more Babel helpers injected within your code. `@babel/plugin-runtime` allows this plugin to avoid duplicating these helpers, and instead make them shared across Chunks seamlessly via Rollup. |

## FAQ

#### Does this plugin work with Code Splitting?

Absolutely, even with Declaration files. Things will work seamlessly.

#### Why wouldn't you use just Typescript?

The Typescript compiler, while extremely powerful, has the restriction that it can only target a specific ECMAScript version.
In reality, browsers and other ECMAScript environments has varying support for newer language features.
Some browsers support even those features that haven't been publicized yet, while others support only parts of the latest language features.

In effect, a browser may support a lot of modern features such as classes and proper lexical scoping, but lack others.
With Typescript, it's _"all-or-nothing"_: If you want to support a Browser with partial support, you must target the latest publicized ECMAScript version that the browser fully supports.

Babel, on the other hand, is far more granular in its design and applies syntax transformations on a feature-by-feature basis.
Combined with something like `@babel/preset-env`, individual transformations can be applied for only those language features that are missing.
This means that you can use things like classes and lexical scoping in browsers that otherwise doesn't fully support all of the ES2015 specification.

#### Okay, then why wouldn't you use just babel?

Babel has recently received support for [parsing and transforming Typescript](https://babeljs.io/docs/en/babel-plugin-transform-typescript). It would be intriguing to just use Babel for everything. However, there are significant caveats:

The Babel compiler works on a file-by-file basis, meaning it is simple to use and reason about, whereas the Typescript compiler works with _Programs_, or in other words sets of related _SourceFiles_.
This gives Typescript the advantage over Babel that it has a greater understanding of your codebase in general and can understand your types across files.
In the context of this plugin, this enables Typescript to do things that you simply wouldn't be able to do with the Typescript plugin for Babel:

1. Emit Typescript diagnostics
2. Emit Typescript declaration (`.d.ts`) files and Typescript declaration map (`.d.ts.map`) files.
3. Remove type-only imports that wouldn't otherwise be transformed by Rollup and would lead to issues like [this one](https://github.com/rollup/rollup-plugin-typescript/issues/28)
4. Use `const enums` and all other files that will require type information.

#### When combined with Babel, what does Typescript do, and what does Babel do?

First, Typescript will be used for:

1. Reporting diagnostics.
2. Emitting Typescript declaration (`.d.ts`) files and Typescript declaration map (`.d.ts.map`) files.
3. Removing Typescript-specific features such as types, type-only imports, enums, and Typescript decorators.

Babel will then be used for all other syntax transformation from then on, depending on the combination of default, provided, and forced presets and plugins.

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT][] © [JounQin][]@[1stG.me][]

[1stg.me]: https://www.1stg.me
[jounqin]: https://GitHub.com/JounQin
[mit]: http://opensource.org/licenses/MIT
