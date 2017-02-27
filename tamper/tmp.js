var createTamp = require('tamp');
var tamper = require('./tamper');
var FOR_EXAMPLE = require('./data');


// Initialize tamp
var tamp = createTamp();

// Add a packed attribute
tamp.addAttribute({
  attrName: FOR_EXAMPLE.attrName,
  possibilities: FOR_EXAMPLE.possibilities,
  maxChoices: 1
});

tamp.pack(FOR_EXAMPLE.data);
console.log('Tamper pack:');
var data = tamp.toJSON();
console.log(tamp);
console.log(data);

var t = tamper.Tamper();
var seeds = t.unpackData(tamp);
console.log(seeds);
