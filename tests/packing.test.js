import test from 'tape'
import fns from '../src/pack/fns.js'
import efrt from './_lib.js'

test('common prefixes include empty, identical, and unicode strings', function (t) {
  for (const [left, right, expected] of [
    ['', 'apple', ''], ['apple', '', ''], ['apple', 'apple', 'apple'],
    ['apple', 'apply', 'appl'], ['apple', 'pear', ''], ['a', 'apple', 'a'],
    ['café', 'cafés', 'café'], ['👍a', '👍b', '👍']
  ]) {
    t.equal(fns.commonPrefix(left, right), expected, left + '/' + right)
  }
  t.end()
})

test('deduplicate sorted strings in place including long duplicate runs', function (t) {
  for (const [input, expected] of [
    [[], []], [['a'], ['a']], [['a', 'a', 'a'], ['a']],
    [['b', 'a', 'b', 'a', 'a', 'c', 'b'], ['a', 'b', 'c']],
    [Array(10000).fill('a'), ['a']]
  ]) {
    fns.unique(input)
    t.deepEqual(input, expected)
  }
  t.end()
})

test('packing optimization retains the existing byte format', function (t) {
  for (const [input, expected] of [
    [['the', 'them', 'there', 'thesis', 'this'], 'true¦th0;e0is;!m,re,sis'],
    [['cat', 'cats', 'bat', 'bats'], 'true¦b0c0;at0;!s'],
    [{ apple: 'fruit', pear: ['fruit', 'green'] }, 'fruit¦apple,pear|green¦pear']
  ]) {
    t.equal(efrt.pack(input), expected, 'packed fixture')
  }
  t.end()
})
