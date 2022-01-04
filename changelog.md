## 2.4.0 [Jan 2022]
- fix empty-array runtime error on unpack
- point package 'main' at ./src/index.js for tree-shaking
- remove babel dependency
- use .js for cjs builds

## 2.3.1 [June 2021]

- use .cjs for commonjs file

## 2.3.0 [June 2021]

- support es modules exports
- remove mapfile
- update deps

## 2.0.0

pack now returns a flat string, instead of an object. This avoids all the quoting/encoding and stuff the JSON was doing. Breaking-change.

### 1.1.1

fixes reserved-word issue in firefox for 'watch'

### 1.1.0

- adds support for object inputs, instead of just arrays
