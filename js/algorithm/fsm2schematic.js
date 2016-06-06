/**
  * For a specfic index in the state string
  * fsm {"10": [{next: "00", out: "0"}, {next: "10", out: "0"}],  ....}
  * => ["101","011"]
  */
function index2truthTable(index, fsm) {
  var arr = [];
  for (let state in fsm) {
    for (let input = 0; input <= 1; input++) {
      if (fsm[state][input].next[index] == "1")
        arr.push(state + input);
    }
  }
  return arr;
}

/** For state
  * fsm {"10": [{next: "00", out: "0"}, {next: "10", out: "0"}],  ....}
  * => [["101","011"],["001"]]
  */
function fsm2stateTruthTable(fsm, totalBit) {
  var arr = [];
  for (let i = 0; i < totalBit; i++)
    arr.push(qmSimplify(index2truthTable(i, fsm)));
  return arr;
}

/** For output Y
  * fsm {"10": [{next: "00", out: "0"}, {next: "10", out: "0"}],  ....}
  * => ["001","011"]
  */
function fsm2outputTruthTable(fsm) {
  var arr = [];
  for (let state in fsm) {
    for (let input = 0; input <= 1; input++) {
      if (fsm[state][input].out == "1")
        arr.push(state + input);
    }
  }
  return qmSimplify(arr);
}


var schematic = {
  "addGate": function(gate, output) {
    if (typeof output == "undefined")
      schematic[gate] = {out: [[]]};
    else
      schematic[gate] = {out: [[{name: output}]]};
  }, 

  "addOutputAt": function(gate, output) {
    schematic[gate].out[0].push({name: output});
  }, 

  "init": function(totalBit) {
    schematic.addGate("or output", "output");
    schematic.addGate("output");
    schematic.addGate("input", "not input");
    schematic.addGate("not input");
    for (let i = 0; i < totalBit; i++) {
      schematic.addGate("or " + i, "dff " + i);
      schematic.addGate("dff " + i, "not " + i);
      schematic.addGate("not " + i);
    }
  }, 

  // add "101" into schematic
  "addTerm": function(term, outputIndex, termIndex) {
    if (outputIndex == "output") {
      var andGateName = "and output";
      schematic.addGate(andGateName,"or output");
    } else {
      var andGateName = "and " + outputIndex + termIndex;
      schematic.addGate(andGateName,"or " + outputIndex);
    }

    for (let i = 0; i < term.length - 1; i++) {
        if (term[i] == "x")
          continue;
        schematic.addOutputAt((term[i] == "1" ? "dff " + i: "not " + i), andGateName);
    }

    // handle input
    if (term[term.length - 1] != "x")
      schematic.addOutputAt((term[term.length - 1] == "1" ? "input": "not input"), andGateName);
  }, 

  // add ["101", "011", "1xx"] into schematic
  "addTerms": function(truthTable, outputIndex) {
    for (let i = 0; i < truthTable.length; i++)
      schematic.addTerm(truthTable[i], outputIndex, i);
  }, 

  // add states [["10x","011"],["001"]] into schematic
  "addStateTruthTables": function(truthTables) {
    for (let i = 0; i < truthTables.length; i++)
      schematic.addTerms(truthTables[i], i);
  },

  // add output ["01x"] into schematic
  "addOutputTruthTable": function(truthTable) {
    schematic.addTerms(truthTable, "output");
  }, 

  // return an object containing gates only
  "getGates": function() {
    var arr = {};
    for (let each in schematic) {
      if (typeof schematic[each] == "function")
        continue;
      arr[each] = schematic[each];
    }
    return arr;
  }

};


/*
 * fsm = {
 *   "10": [{next: "10", out: "0"}, {next: "10", out: "0"}],
 *   "00": [{next: "00", out: "0"}, {next: "01", out: "0"}],
 *   "01": [{next: "00", out: "1"}, {next: "10", out: "1"}]
 * };
 * totalBit = 2;
 *
 * =>
 * input = {"out":[[{"name":"not input"},{"name":"and 01"},{"name":"and 10"}]]}
 * not input = {"out":[[]]}
 * or 0 = {"out":[[{"name":"dff 0"}]]}
 */ 
function fsm2schematic(fsm, totalBit) {
  var stateTruthTables = fsm2stateTruthTable(fsm, totalBit);
  var outputTruthTable = fsm2outputTruthTable(fsm);

  schematic.init(totalBit)
  schematic.addStateTruthTables(stateTruthTables);
  schematic.addOutputTruthTable(outputTruthTable);

  return schematic.getGates();
};

/* for testing
var fsm = {
  "10": [{next: "10", out: "0"}, {next: "10", out: "0"}],
  "00": [{next: "00", out: "0"}, {next: "01", out: "0"}],
  "01": [{next: "00", out: "1"}, {next: "10", out: "1"}]
};
var totalBit = 2;

var ans = fsm2schematic(fsm, totalBit);
for (let each in ans)
  document.write(each + " = " + JSON.stringify(ans[each]) + "<br>");
*/