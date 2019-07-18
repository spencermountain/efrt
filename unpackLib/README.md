the **unpack** half of the [efrt library](npmjs.com/package/efrt).

See that repo for full documentation.

```bash
npm install efrt-unpack
```
```html
<script src="https://unpkg.com/efrt@latest/builds/efrt-unpack.min.js"></script>
<script>
  const compressedTrie = 'true¦denmark,o0scandanavia;h0ntar0;io'
  const p = unpack(compressedTrie)
  console.log(p.hasOwnProperty('ohio'))
  // true
</script>
```

MIT
