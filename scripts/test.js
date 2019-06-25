require('shelljs/global')
const tape = '"node_modules/.bin/tape"'
const tapSpec = '"node_modules/.bin/tap-spec" --color'

//the quotations here are strangely-important
exec(tape + ' "./test/**/*.test.js" | ' + tapSpec)
