import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
// tslint:disable:no-duplicate-string

test("Flattens declarations. #16", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
          		export * from "./foo";
        	`
		},
		{
			entry: false,
			fileName: "foo/index.ts",
			text: `\
				export const Foo = "foo";
				`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const Foo = "foo";
			export {Foo};
		`)
	);
});

test("Flattens declarations. #17", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
          		export * from "./foo.baz";
          		export * from "./bar.baz";
        	`
		},
		{
			entry: false,
			fileName: "foo.baz.ts",
			text: `\
				export const Foo = "foo";
				`
		},
		{
			entry: false,
			fileName: "bar.baz.ts",
			text: `\
				export const Bar = "bar";
				`
		}
	]);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const Foo = "foo";
			declare const Bar = "bar";
			export {Foo, Bar};
		`)
	);
});

test("Flattens declarations. #18", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		export * from "@/foo";
        	`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				export const Foo = "foo";
				`
			}
		],
		{
			transpileOnly: true,
			tsconfig: {
				paths: {
					"@/*": ["*"]
				}
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const Foo = "foo";
			export {Foo};
		`)
	);
});

test("Flattens declarations. #19", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		export {A, B} from "@/foo";
        	`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				export const A = "A";
				export const B = "B";
				`
			}
		],
		{
			transpileOnly: true,
			tsconfig: {
				paths: {
					"@/*": ["*"]
				}
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const A = "A";
			declare const B = "B";
			export {A, B};
		`)
	);
});

test("Flattens declarations. #20", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		import {Foo} from "@/foo";
          		export {Foo};
        	`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				export const Foo = "Foo";
				`
			}
		],
		{
			transpileOnly: true,
			tsconfig: {
				paths: {
					"@/*": ["*"]
				}
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const Foo = "Foo";
			export {Foo};
		`)
	);
});

test("Flattens declarations. #21", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		export const Bar: typeof import("@/foo").Foo = "foo";
        	`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				export const Foo: string = "bar";
				`
			}
		],
		{
			transpileOnly: true,
			tsconfig: {
				paths: {
					"@/*": ["*"]
				}
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const Foo: string;
			declare const Bar: typeof Foo;
			export {Bar};
		`)
	);
});

test("Flattens declarations. #22", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
          		export * from "@/foo";
        	`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `\
				export const Foo = "Foo";
				`
			}
		],
		{
			transpileOnly: true,
			tsconfig: {
				paths: {
					"@/*": ["src/*"]
				}
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const Foo = "Foo";
			export {Foo};
		`)
	);
});

test("Flattens declarations. #23", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
							import {Foo} from "./foo";
          		export const foo: Foo = 2;
        	`
		},
		{
			entry: false,
			fileName: "foo.ts",
			text: `\
				export type Foo = number;
				`
		}
	]);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare type Foo = number;
			declare const foo: Foo;
			export {foo};
		`)
	);
});

test("Flattens declarations. #24", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
							export {default} from "./foo";
        	`
		},
		{
			entry: false,
			fileName: "foo.ts",
			text: `\
				export default function foo () {}
				`
		}
	]);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare function foo (): void;
			export {foo as default};
		`)
	);
});

test("Flattens declarations. #25", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
        import * as bar from './bar';
        export type FooType = bar.BarType;
			`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
        export type BarType = 'a' | 'b' | 'c';
			`
		}
	]);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare namespace bar {
					type BarType = 'a' | 'b' | 'c';
			}
			declare type FooType = bar.BarType;
			export { FooType };
		`)
	);
});

test("A file with no exports generates a .d.ts file with an 'export {}' declaration to mark it as a module. #1", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
					console.log(true);
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		export {};
		`)
	);
});