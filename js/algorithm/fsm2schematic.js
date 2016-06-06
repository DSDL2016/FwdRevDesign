var Fsm2schematic = Fsm2schematic || {};
/**
 * Fsm2schematic.convert() returns schematic based on the passed final state machine
 *
 * @param {Object} fsm = {
 *     "10": [{next: "10", out: "0"}, {next: "10", out: "0"}],
 *     "00": [{next: "00", out: "0"}, {next: "01", out: "0"}],
 *     "01": [{next: "00", out: "1"}, {next: "10", out: "1"}]
 *  }
 * @param {integer} totalBit: The total bit in fsm
 *
 * @return {Object} schematic = {
 *   input = {"out":[[{"name":"not input"}, {"name":"and 01"}, {"name":"and 10"}]]}
 *   not input = {"out":[[]]}
 *   or 0 = {"out":[[{"name":"dff 0"}]]}
 *   ...
 * }
 */
Fsm2schematic.convert = function(fsm, totalBit) {
  var stateTruthTables = Fsm2schematic.fsm2stateTruthTable(fsm, totalBit);
  var outputTruthTable = Fsm2schematic.fsm2outputTruthTable(fsm);

  Fsm2schematic.init(totalBit)
  Fsm2schematic.addStateTruthTables(stateTruthTables);
  Fsm2schematic.addOutputTruthTable(outputTruthTable);

  return Fsm2schematic.getGates();
};


Fsm2schematic.addGate = function(gate, output) {
  if (typeof output == "undefined")
    Fsm2schematic[gate] = {out: [[]]};
  else
    Fsm2schematic[gate] = {out: [[{name: output}]]};
};

Fsm2schematic.addOutputAt = function(gate, output) {
  Fsm2schematic[gate].out[0].push({name: output});
};

Fsm2schematic.init = function(totalBit) {
  Fsm2schematic.addGate("or output", "output");
  Fsm2schematic.addGate("output");
  Fsm2schematic.addGate("input", "not input");
  Fsm2schematic.addGate("not input");
  for (let i = 0; i < totalBit; i++) {
    Fsm2schematic.addGate("or " + i, "dff " + i);
    Fsm2schematic.addGate("dff " + i, "not " + i);
    Fsm2schematic.addGate("not " + i);
  }
}; 

// add "101" into schematic
Fsm2schematic.addTerm = function(term, outputIndex, termIndex) {
  if (outputIndex == "output") {
    var andGateName = "and output";
    Fsm2schematic.addGate(andGateName,"or output");
  } else {
    var andGateName = "and " + outputIndex + termIndex;
    Fsm2schematic.addGate(andGateName,"or " + outputIndex);
  }

  for (let i = 0; i < term.length - 1; i++) {
    if (term[i] == "x")
      continue;
    Fsm2schematic.addOutputAt((term[i] == "1" ? "dff " + i: "not " + i), andGateName);
  }

  // handle input
  if (term[term.length - 1] != "x")
    Fsm2schematic.addOutputAt((term[term.length - 1] == "1" ? "input": "not input"), andGateName);
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

// return gates object only rather than functions
Fsm2schematic.getGateObjects = function() {
  var gates = {};
  for (let obj in Fsm2schematic) {
    if (typeof Fsm2schematic[obj] == "function")
      continue;
    gates[obj] = Fsm2schematic[obj];
  }
  return gates;
};

/*
Fsm2schematic.removeEmptyGates = function(gates) {
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
*/

/** 
 *  return gates in format {
 *    type: 'input',
 *    out: [[{id: 2, port: 0}]], 
 *    ...
 *  }
 */
Fsm2schematic.getGates = function() {
  var gates = Fsm2schematic.getGateObjects();
  // gates = Fsm2schematic.removeEmptyGates(gates);
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
Fsm2schematic.fsm2stateTruthTable = function(fsm, totalBit) {
  var arr = [];
  for (let i = 0; i < totalBit; i++)
    arr.push(QMAlgorithm.simplify(Fsm2schematic.index2truthTable(i, fsm)));
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
  return QMAlgorithm.simplify(arr);
};
