var Algorithm = Algorithm || {};
Algorithm.Fsm2schematic = Algorithm.Fsm2schematic || {};

Algorithm.forward = function(fsm) {
  return Algorithm.Fsm2schematic.convert(fsm);
};

/**
 * Algorithm.Fsm2schematic.convert() returns schematic based on the passed final state machine
 *
 * @param {Object} fsm = {
 *     "10": [{next: "10", out: "0"}, {next: "10", out: "0"}],
 *     "00": [{next: "00", out: "0"}, {next: "01", out: "0"}],
 *     "01": [{next: "00", out: "1"}, {next: "10", out: "1"}]
 *  }
 * @param {integer} bitLength: The total bit in fsm
 *
 * @return {Object} schematic = {
 *   input = {"out":[[{"name":"not input"}, {"name":"and 01"}, {"name":"and 10"}]]}
 *   not input = {"out":[[]]}
 *   or 0 = {"out":[[{"name":"dff 0"}]]}
 *   ...
 * }
 */
Algorithm.Fsm2schematic.convert = function(fsm) {
  var bitLength = Algorithm.Fsm2schematic.getBitLength(fsm);
  var stateTruthTables = Algorithm.Fsm2schematic.fsm2stateTruthTable(fsm, bitLength);
  var outputTruthTable = Algorithm.Fsm2schematic.fsm2outputTruthTable(fsm);

  Algorithm.Fsm2schematic.init(bitLength)
  Algorithm.Fsm2schematic.addStateTruthTables(stateTruthTables);
  Algorithm.Fsm2schematic.addOutputTruthTable(outputTruthTable);

  return Algorithm.Fsm2schematic.getGates();
};

Algorithm.Fsm2schematic.getBitLength = function(fsm) {
  var totalStates = Object.keys(fsm).length;
  var bitLength = (totalStates - 1).toString(2).length;
  return bitLength;
};

Algorithm.Fsm2schematic.addGate = function(gate, output) {
  if (typeof output == "undefined")
    Algorithm.Fsm2schematic[gate] = {out: [[]]};
  else
    Algorithm.Fsm2schematic[gate] = {out: [[{name: output}]]};
};

Algorithm.Fsm2schematic.addOutputAt = function(gate, output) {
  Algorithm.Fsm2schematic[gate].out[0].push({name: output});
};

Algorithm.Fsm2schematic.init = function(bitLength) {
  Algorithm.Fsm2schematic.addGate("or output", "output");
  Algorithm.Fsm2schematic.addGate("output");
  Algorithm.Fsm2schematic.addGate("input", "not input");
  Algorithm.Fsm2schematic.addGate("not input");
  for (let i = 0; i < bitLength; i++) {
    Algorithm.Fsm2schematic.addGate("or " + i, "dff " + i);
    Algorithm.Fsm2schematic.addGate("dff " + i, "not " + i);
    Algorithm.Fsm2schematic.addGate("not " + i);
  }
}; 

// add "101" into schematic
Algorithm.Fsm2schematic.addTerm = function(term, outputIndex, termIndex) {
  if (outputIndex == "output") {
    var andGateName = "and output";
    Algorithm.Fsm2schematic.addGate(andGateName,"or output");
  } else {
    var andGateName = "and " + outputIndex + termIndex;
    Algorithm.Fsm2schematic.addGate(andGateName,"or " + outputIndex);
  }

  for (let i = 0; i < term.length - 1; i++) {
    if (term[i] == "x")
      continue;
    Algorithm.Fsm2schematic.addOutputAt((term[i] == "1" ? "dff " + i: "not " + i), andGateName);
  }

  // handle input
  if (term[term.length - 1] != "x")
    Algorithm.Fsm2schematic.addOutputAt((term[term.length - 1] == "1" ? "input": "not input"), andGateName);
};

// add ["101", "011", "1xx"] into schematic
Algorithm.Fsm2schematic.addTerms = function(truthTable, outputIndex) {
  for (let i = 0; i < truthTable.length; i++)
    Algorithm.Fsm2schematic.addTerm(truthTable[i], outputIndex, i);
};

// add states [["10x","011"],["001"]] into schematic
Algorithm.Fsm2schematic.addStateTruthTables = function(truthTables) {
  for (let i = 0; i < truthTables.length; i++)
    Algorithm.Fsm2schematic.addTerms(truthTables[i], i);
};

// add output ["01x"] into schematic
Algorithm.Fsm2schematic.addOutputTruthTable = function(truthTable) {
  Algorithm.Fsm2schematic.addTerms(truthTable, "output");
};

// return gates object only rather than functions
Algorithm.Fsm2schematic.getGateObjects = function() {
  var gates = {};
  for (let obj in Algorithm.Fsm2schematic) {
    if (typeof Algorithm.Fsm2schematic[obj] == "function")
      continue;
    gates[obj] = Algorithm.Fsm2schematic[obj];
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
Algorithm.Fsm2schematic.getGates = function() {
  var gates = Algorithm.Fsm2schematic.getGateObjects();
  gates = Algorithm.Fsm2schematic.removeNoOutputGates(gates);
  gates = Algorithm.Fsm2schematic.removeUselessOutput(gates);
  var keys = Object.keys(gates);
  var pinNumCounter = new Array(keys.length).fill(0);
  var arr = [];
  for (let i in gates) {
    gates[i]["type"] = i.split(" ")[0];
    arr.push(Algorithm.Fsm2schematic.parseGate(gates[i], keys, pinNumCounter));
  }
  return arr;
};

// parse a whole gate outputs
Algorithm.Fsm2schematic.parseGate = function(gate, keys, pinNumCounter) {
  for (let j = 0; j < gate.out.length; j++)
    gate.out[j] = Algorithm.Fsm2schematic.parsePins(gate.out[j], keys, pinNumCounter);
  return gate;
};

// parse each output pin
Algorithm.Fsm2schematic.parsePins = function(pins, keys, pinNumCounter) {
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
Algorithm.Fsm2schematic.index2truthTable = function(index, fsm) {
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
Algorithm.Fsm2schematic.fsm2stateTruthTable = function(fsm, bitLength) {
  var arr = [];
  for (let i = 0; i < bitLength; i++)
    arr.push(Algorithm.simplify(Algorithm.Fsm2schematic.index2truthTable(i, fsm)));
  return arr;
};

/** For output Y
  * fsm {"10": [{next: "00", out: "0"}, {next: "10", out: "0"}],  ....}
  * => ["001","011"]
  */
Algorithm.Fsm2schematic.fsm2outputTruthTable = function(fsm) {
  var arr = [];
  for (let state in fsm) {
    for (let input = 0; input <= 1; input++) {
      if (fsm[state][input].out == "1")
        arr.push(state + input);
    }
  }
  return Algorithm.simplify(arr);
};

Algorithm.Fsm2schematic.removeUselessOutput = function(gates) {
  var gateNames = Object.keys(gates);
  for (let gate in gates)
    Algorithm.Fsm2schematic.removeUselessPin(gateNames, gates[gate].out);
  return gates;
};

// TODO: BUGS: not removing
Algorithm.Fsm2schematic.removeUselessPin = function(gateNames, outpins) {
  for (let i in outpins) {
    for (let j in outpins[i]) {
      if (typeof gateNames.indexOf(outpins[i][j].name) == -1)
        outpins[i] = outpins[i].splice(j, 1);
    }
  }
};

Algorithm.Fsm2schematic.removeNoOutputGates = function(gates) {
  for (let gate in gates)
    if (gate != "output" && Algorithm.Fsm2schematic.outputIsEmpty(gates[gate].out))
      delete gates[gate];
  return gates;
}

Algorithm.Fsm2schematic.outputIsEmpty = function(outputs) {
  for (let output of outputs)
    if (typeof output !== 'undefined' && output.length > 0)
      return false;

  return true;
}
