import efrt = require('efrt')
import unpack = require('efrt/unpack')

const options: efrt.PackOptions = { direction: 'suffix', dictionary: true }
const packed: string = efrt.pack(['a1', 'b2'], options)
const decoded: efrt.Unpacked = unpack(packed)
const main: efrt.Unpacked = efrt.unpack(packed)
const version: string = efrt.version
unpack()

// @ts-expect-error The CommonJS unpack export is the function itself
unpack.default(packed)
// @ts-expect-error Standalone unpack has no pack property
unpack.pack(['a'])
// @ts-expect-error Unpack expects packed text
unpack(123)
// @ts-expect-error Invalid direction
efrt.pack(['a'], { direction: 'invalid' })

void [decoded, main, version]
