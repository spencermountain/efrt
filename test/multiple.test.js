'use strict'
const test = require('tape')
const efrt = require('./lib/efrt')

test('support array of values:', function(t) {
  const foods = {
    strawberry: 'fruit',
    blueberry: 'fruit',
    blackberry: 'fruit',
    tomato: ['fruit', 'vegetable'],
    cucumber: 'vegetable',
    pepper: ['vegetable', 'spicy'],
    salad: ['fruit', 'vegetable', 'sour']
  }

  const packd = efrt.pack(foods)
  const obj = efrt.unpack(packd)
  t.deepEqual(obj.tomato, ['fruit', 'vegetable'], 'tomato is both')
  t.deepEqual(obj.blackberry, 'fruit', 'strawberry is fruit')
  t.deepEqual(obj.pepper, ['vegetable', 'spicy'], 'pepper is spicy')
  t.deepEqual(obj.salad, ['fruit', 'vegetable', 'sour'], 'pepper is spicy')
  t.end()
})
