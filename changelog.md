## 2.9.0 [Sep 2026]
- **[change]** - accept Set word inputs, including `ReadonlySet<string>` in TypeScript, with the same validation and encoding as arrays
- **[change]** - include TypeScript declarations for `efrt` and `efrt/unpack`, with ESM/CommonJS consumer tests and Are the Types Wrong checks in CI
- **[change]** - support digits in keys with versioned label escaping, including suffix packing and fragment dictionaries
- **[change]** - support more unicode and emoji
- **[change]** - add dictionary support for repeated spans
- **[change]** - support prefix/suffix direction change

## 2.8.0 [Sep 2026]
- **[change]** - Safer handling of prototype-related names.
- **[change]** - Category delimiter validation and documented value coercion.
- **[fix]** - Working CommonJS unpack export.
- **[change]** - reduce development dependencies.
- **[change]** - Packed-input validation, iterative decoding, and a documented key-length limit.
- **[update]** - dependencies

## 2.7.0 [Apr 2022]
- **[fix]** - underscore character support

## 2.6.0 [Apr 2022]
- **[change]** - give commonjs build a .cjs extension

## 2.4.0 [Jan 2022]
- **[fix]** - empty-array runtime error on unpack
- **[change]** - point package 'main' at ./src/index.js for tree-shaking
- **[change]** - remove babel dependency
- **[change]** - use .js for cjs builds

## 2.3.1 [June 2021]
- **[change]** - use .cjs for commonjs file

## 2.3.0 [June 2021]
- **[change]** - support es modules exports
- **[change]** - remove mapfile
- **[update]** - deps

## 2.0.0

- **[breaking]** - pack now returns a flat string, instead of an object. This avoids all the quoting/encoding and stuff the JSON was doing. Breaking-change.

### 1.1.1

- **[fix]** - reserved-word issue in firefox for 'watch'

### 1.1.0

- **[change]** - adds support for object inputs, instead of just arrays
