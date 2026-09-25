import { pack, unpack, version } from 'efrt'
import type { PackOptions, Unpacked, UnpackedValue } from 'efrt'
import unpackOnly from 'efrt/unpack'

const options: PackOptions = { strict: true, direction: 'auto', dictionary: true }
const words = ['101domain.com', 'example.com'] as const
const packed: string = pack(words, options)
const decoded: Unpacked = unpack(packed)
const value: UnpackedValue = decoded['101domain.com']
const standalone: Unpacked = unpackOnly(packed)
const release: string = version
pack({ apple: ['fruit', true] as const, pear: 42, plum: false, empty: null })
pack('apple pear')
pack(new Set(['apple', 'pear']), options)
const wordSet: ReadonlySet<string> = new Set(['apple'])
pack(wordSet)
pack()
pack(null)
unpack()
unpack(null)
unpackOnly(null)

// @ts-expect-error Invalid direction
pack(words, { direction: 'backwards' })
// @ts-expect-error Dictionary must be boolean
pack(words, { dictionary: 'yes' })
// @ts-expect-error Strict must be boolean
pack(words, { strict: 'yes' })
// @ts-expect-error Word arrays contain strings
pack([123])
// @ts-expect-error Word Sets contain strings
pack(new Set([123]))
// @ts-expect-error Unpack expects packed text
unpack(123)
// @ts-expect-error Standalone unpack expects packed text
unpackOnly({})
// @ts-expect-error Decoding does not restore numeric categories
const numeric: number = decoded.pear
// @ts-expect-error The main ESM entry has no default export
import defaultExport from 'efrt'

void [value, standalone, release, numeric, defaultExport]
