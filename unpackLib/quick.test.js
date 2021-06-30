import unpack from './efrt-unpack.min.js'
import test from 'tape'

test('unpack works:', function (t) {
  const str = 'true¦denmark,o0scandanavia;h0ntar0;io'
  const p = unpack(str)
  t.equal(p.hasOwnProperty('ohio'), true, 'has ohio')
  t.equal(p.hasOwnProperty('ontario'), true, 'has ontario')
  t.equal(p.hasOwnProperty('ontfario'), false, 'no ontfario')
  t.end()
})
