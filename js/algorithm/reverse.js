var Algorithm = Algorithm || {};
Algorithm.schematic2Fsm = Algorithm.schematic2Fsm || {};
var schematic2Fsm = Algorithm.schematic2Fsm;

Algorithm.reverse = function(schematic) {
  return schematic2Fsm.rev(schematic);
};

schematic2Fsm.topoSort = function(index, schematic, used, order){
	used[index] = true;
	for(var i = 0; i < schematic[index].out.length; i++){
		var outs = schematic[index].out[i];
		for(var j = 0; j < outs.length; j++){
			var nextIdx = outs[j].id;
			if(!used[nextIdx]){
				schematic2Fsm.topoSort(nextIdx, schematic, used, order);
			}
		}
	}
	order.push(index);
}
schematic2Fsm.evaluate = function(schematic, order){
	for(var i = 0; i < schematic.length; i++){
        var now = schematic[order[i]];
		var input = 0;
		for(var j = 0; j < now.inputValue.length; j++){
			input = input * 2 + now.inputValue[j];
		}
		var output = [];
		if(Gate[now.type].type === 'seq') {
			output = Gate[now.type].truthTable[now.subtype][input];
		}
		else {
			output = Gate[now.type].truthTable[input];
		}
		for(var j = 0; j < now.out.length; j++){
			var outs = now.out[j];
			for(var k = 0; k < outs.length; k++){
				var nextIdx = outs[k].id;
				var nextPort = outs[k].port;
				schematic[nextIdx].inputValue[nextPort] = output[j];
			}
		}
	}
}
schematic2Fsm.bin = function(value, digit){
	var result = Array(digit).fill(0);
	var i = 0;
	while(value > 0){
		result[i] = value % 2;
		i++;
		value = Math.floor(value / 2);
	}
	return result;
}
schematic2Fsm.binString = function(value, digit){
	var result = '';
	var i = 0;
	while(value > 0){
		result += String(value % 2);
		i++;
		value = Math.floor(value / 2);
	}
    while(result.length < digit) {
        result = '0'+result;
    }
	return result;
}
schematic2Fsm.setValues = function(values, gates, schematic){
	var valueArr = schematic2Fsm.bin(values, gates.length);
	for(var i = 0; i < gates.length; i++){
		schematic[gates[i]].inputValue[0] = valueArr[i];
	}
}
schematic2Fsm.getValues = function(gates, schematic){
	var result = '';
	for(var i = 0; i < gates.length; i++){
		result += String(schematic[gates[i]].inputValue[0]);
	}
	return result;
}
schematic2Fsm.rev = function(schematic){
	var inputs = [];
	var outputs = [];
	var states = [];
	var nextStates = [];
	
    var size = schematic.length;
	for(var i = 0; i < size; i++){
        var gateInfo = Gate[schematic[i].type] || {};
		if(gateInfo.type === 'seq'){
			schematic.push({
				type: schematic[i].type,
				subtype: 'second',
				out: schematic[i].out,
				inputValue: Array(gateInfo.nState)
			});
			var secondId = schematic.length - 1;
			schematic[i].subtype = 'first';
			schematic[i].out = [];
			schematic[i].inputValue = Array(gateInfo.nIn + gateInfo.nState);
			for(var j = 0; j < gateInfo.nState; j++){
				schematic.push({
					type: 'input',
					out: [
						[{id: i, port: gateInfo.nIn + j},
						{id: secondId, port: j}]
					],
                    inputValue: Array(1)
				});
				states.push(schematic.length - 1);
				schematic.push({
					type: 'output',
                    out: [],
                    inputValue: Array(1)
				});
				nextStates.push(schematic.length - 1);
				schematic[i].out.push([{id: schematic.length - 1, port: 0}]);
			}
		}
		else {
			if(schematic[i].type === 'input'){
				inputs.push(i);
			}
			else if(schematic[i].type === 'output'){
				outputs.push(i);
			}
			schematic[i].inputValue = Array(gateInfo.nIn);
		}
	}
	
	/* topological sort */
	var order = [];
	var used = Array(schematic.length).fill(false);
	for(var i = 0; i < schematic.length; i++){
		if(!used[i]) schematic2Fsm.topoSort(i, schematic, used, order);
	}
	order.reverse();
	
	/* enumerate */
	var fsm = {};
	var nState = Math.pow(2, states.length);
	var nTrans = Math.pow(2, inputs.length);
	for(var state = 0; state < nState; state++){
		schematic2Fsm.setValues(state, states, schematic);
		var stateString = schematic2Fsm.binString(state, states.length);
		var transMap = [];
		for(var trans = 0; trans < nTrans; trans++){
			schematic2Fsm.setValues(trans, inputs, schematic);
			schematic2Fsm.evaluate(schematic, order, Gate);
			transMap.push({
				next: schematic2Fsm.getValues(nextStates, schematic),
				out: schematic2Fsm.getValues(outputs, schematic)
			});
		}
		fsm[stateString] = transMap;
	}
	return fsm;
}
