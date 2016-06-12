var Algorithm = Algorithm || {};
Algorithm.Fsm2schematic = Algorithm.Fsm2schematic || {};
var Fsm2schematic = Algorithm.Fsm2schematic;

/**
 * Algorithm.forward() returns schematic based on the passed final state machine
 *
 * @param {Object} fsm = {
 *     "10": [{next: "10", out: "0"}, {next: "10", out: "0"}],
 *     "00": [{next: "00", out: "0"}, {next: "01", out: "0"}],
 *     "01": [{next: "00", out: "1"}, {next: "10", out: "1"}]
 *  }
 * @param {ff-type} "ds"
 *     (d:D-ff, j:JK-ff, t:T-ff, s:SR-ff)
 *
 * @return {Object} schematic = {
 *   input = {"out":[[{"name":"not input"}, {"name":"and 01"}, {"name":"and 10"}]]}
 *   not input = {"out":[[]]}
 *   or 0 = {"out":[[{"name":"ff 0"}]]}
 *   ...
 * }
 */
Algorithm.forward = function(fsm, ffType) {
  return Fsm2schematic.convert(fsm, ffType);
};

Fsm2schematic.convert = function(fsm, ffType) {
  var bitLength = Fsm2schematic.getBitLength(fsm);
  var stateTruthTables = Fsm2schematic.fsm2stateTruthTable(fsm, bitLength);
  var outputTruthTable = Fsm2schematic.fsm2outputTruthTable(fsm);

  Fsm2schematic.init(bitLength);
  Fsm2schematic.addStateTruthTables(stateTruthTables);
  Fsm2schematic.addOutputTruthTable(outputTruthTable);

  Fsm2schematic.customizeFF(ffType);

  // For debugging, you can return getGateObjects()
  return Fsm2schematic.getGates();
};

Fsm2schematic.getBitLength = function(fsm) {
  var totalStates = Object.keys(fsm).length;
  var bitLength = (totalStates - 1).toString(2).length;
  return bitLength;
};

Fsm2schematic.getNewGate = function() {
  return {out: [[]]};
};

// Add a new {gate} and connect its output port to {output}
Fsm2schematic.addGate = function(gate, output, index = 0) {
  if (typeof Fsm2schematic[gate] == "undefined")
      Fsm2schematic[gate] = Fsm2schematic.getNewGate(output);

  if (typeof output == "undefined")
    return;
  // check if output gate exists;
  Fsm2schematic.addGate(output);

  if (index > 1) throw "Number of output ports > 2 is not supported";

  // check if its second output port exists
  if (typeof Fsm2schematic[gate].out[index] == "undefined")
    Fsm2schematic[gate].out.push([]);

  Fsm2schematic[gate].out[index].push({name: output});
};

Fsm2schematic.init = function(bitLength) {
  Fsm2schematic.addGate("or output", "output");
  Fsm2schematic.addGate("input", "not input");
  for (let i = 0; i < bitLength; i++)
    Fsm2schematic.addGate("or " + i, "dff " + i);
};

Fsm2schematic.renameGate = function(oldName, newName) {
  if (! (oldName in Fsm2schematic))
    throw "renameGate error: oldName not found";
  Fsm2schematic[newName] = Fsm2schematic[oldName];
  delete Fsm2schematic[oldName];
}; 

// add "101" into schematic
Fsm2schematic.addTerm = function(term, outputIndex, termIndex) {
  if (outputIndex == "output") {
    var andGateName = "and output";
    Fsm2schematic.addGate(andGateName, "or output");
  } else {
    var andGateName = "and " + outputIndex + termIndex;
    Fsm2schematic.addGate(andGateName, "or " + outputIndex);
  }

  for (let i = 0; i < term.length - 1; i++) {
    if (term[i] == "x")
      continue;

    if (term[i] == "1")
      Fsm2schematic.addGate("dff " + i, andGateName);
    else
      Fsm2schematic.addGate("dff " + i, andGateName, 1);
  }

  // handle input
  if (term[term.length - 1] != "x")
    Fsm2schematic.addGate((term[term.length - 1] == "1" ? "input": "not input"), andGateName);
};

// add ["101", "011", "1xx"] into schematic
Fsm2schematic.addTerms = function(truthTable, outputIndex) {
  for (let i = 0; i < truthTable.length; i++)
    Fsm2schematic.addTerm(truthTable[i], outputIndex, i);
};

// add states [["10x","011"],["001"]] into schematic
Fsm2schematic.addStateTruthTables = function(truthTables) {
  for (let i = 0; i < truthTables.length; i++)
    Fsm2schematic.addTerms(truthTables[i], i);
};

// add output ["01x"] into schematic
Fsm2schematic.addOutputTruthTable = function(truthTable) {
  Fsm2schematic.addTerms(truthTable, "output");
};

// Customize default D flip-flop to parameter ffType
// TODO: T flip-flop, D flip-flop
Fsm2schematic.customizeFF = function(ffType) {
  for (let i = 0; i < ffType.length; i++) {
    if (ffType[i] == "t")
      throw "T flip-flop is not implemented !"
    if (ffType[i] == "d")
      Fsm2schematic.renameGate("dff " + i, "d " + i);
    if (ffType[i] == "j" || ffType[i] == "s") {
      var ffName = ffType[i] == "j" ? "jk ": "sr ";
      Fsm2schematic.renameGate("dff " + i, ffName + i);
      Fsm2schematic.addGate("or " + i, "not " + i);
      Fsm2schematic.addGate("not " + i, ffName + i);
    }
  }
};

// return gates object only, no functions 
Fsm2schematic.getGateObjects = function() {
  var gates = {};
  for (let obj in Fsm2schematic) {
    if (typeof Fsm2schematic[obj] == "function")
      continue;
    gates[obj] = Fsm2schematic[obj];
  }
  return gates;
};

/** 
 *  return gates in format {
 *    type: 'input',
 *    out: [[{id: 2, port: 0}]], 
 *    ...
 *  }
 */
Fsm2schematic.getGates = function() {
  var gates = Fsm2schematic.getGateObjects();
  gates = Fsm2schematic.removeRedundantGates(gates);
  var keys = Object.keys(gates);
  var pinNumCounter = new Array(keys.length).fill(0);
  var arr = [];
  for (let i in gates) {
    gates[i]["type"] = i.split(" ")[0];
    arr.push(Fsm2schematic.parseGate(gates[i], keys, pinNumCounter));
  }
  return arr;
};

// parse a whole gate outputs
// TODO: This func. doesn't consider input order, but the order of ff matters.
Fsm2schematic.parseGate = function(gate, keys, pinNumCounter) {
  for (let j = 0; j < gate.out.length; j++)
    gate.out[j] = Fsm2schematic.parsePins(gate.out[j], keys, pinNumCounter);
  return gate;
};

// parse each output pin
Fsm2schematic.parsePins = function(pins, keys, pinNumCounter) {
  for (let i = 0; i < pins.length; i++) {
    var index = keys.indexOf(pins[i].name);
    delete pins[i].name;
    pins[i]["id"] = index;
    pins[i]["port"] = pinNumCounter[index]++;
  }
  return pins;
};

/**
  * For a specfic index in the state string
  * fsm {"10": [{next: "00", out: "0"}, {next: "10", out: "0"}],  ....}
  * => ["101","011"]
  */
Fsm2schematic.index2truthTable = function(index, fsm) {
  var arr = [];
  for (let state in fsm) {
    for (let input = 0; input <= 1; input++) {
      if (fsm[state][input].next[index] == "1")
        arr.push(state + input);
    }
  }
  return arr;
};

/** For state
  * fsm {"10": [{next: "00", out: "0"}, {next: "10", out: "0"}],  ....}
  * => [["101","011"],["001"]]
  */
Fsm2schematic.fsm2stateTruthTable = function(fsm, bitLength) {
  var arr = [];
  for (let i = 0; i < bitLength; i++)
    arr.push(Algorithm.simplify(Fsm2schematic.index2truthTable(i, fsm)));
  return arr;
};

/** For output Y
  * fsm {"10": [{next: "00", out: "0"}, {next: "10", out: "0"}],  ....}
  * => ["001","011"]
  */
Fsm2schematic.fsm2outputTruthTable = function(fsm) {
  var arr = [];
  for (let state in fsm) {
    for (let input = 0; input <= 1; input++) {
      if (fsm[state][input].out == "1")
        arr.push(state + input);
    }
  }
  return Algorithm.simplify(arr);
};

/**
 * Remove redundant gates: 
 * 1. no output gates
 * 2. redundant pins in gates
 */
Fsm2schematic.removeRedundantGates = function(gates) {
  var beforeGateNumbers = -1;
  var afterGateNumbers = -2;
  while (afterGateNumbers != beforeGateNumbers) {
    beforeGateNumbers = Object.keys(gates).length;
    gates = Fsm2schematic.removeNoOutputGates(gates);
    gates = Fsm2schematic.removeUselessOutput(gates);
    afterGateNumbers = Object.keys(gates).length;
  }
  return gates;
};

Fsm2schematic.removeNoOutputGates = function(gates) {
  for (let gate in gates)
    if (gate != "output" && Fsm2schematic.outputIsEmpty(gates[gate].out))
      delete gates[gate];
  return gates;
}

Fsm2schematic.outputIsEmpty = function(outputs) {
  for (let output of outputs)
    if (typeof output !== 'undefined' && output.length > 0)
      return false;

  return true;
}

Fsm2schematic.removeUselessOutput = function(gates) {
  for (let gate in gates)
    Fsm2schematic.removeUselessPin(gates, gates[gate].out);
  return gates;
};

Fsm2schematic.removeUselessPin = function(gates, outpins) {
  var gateNames = Object.keys(gates);
  for (let i = 0; i < outpins.length; i++)
    for (let j = 0; j < outpins[i].length; j++)
      if (! (outpins[i][j].name in gates))
        outpins[i] = outpins[i].splice(gateNames.indexOf(outpins[i][j]), 1);
};
