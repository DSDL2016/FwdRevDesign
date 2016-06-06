var GUI = GUI || {};
GUI.schematic = GUI.schematic || {};

GUI.schematic.init = function(paperView){
    this._initPaper(paperView);
};

GUI.schematic._initPaper = function(paperView){
    this.selected = undefined;
    
    this.graph = new joint.dia.Graph();
    
    this.paper = new joint.dia.Paper({
        el: paperView,
        width: 2048,
        height: 2048,
        gridSize: 1,
        model: this.graph,
        defaultLink: new joint.shapes.gate.Link({}),
        interactive: function(cellView) {
            if (cellView.model instanceof joint.dia.Link) {
                // Disable the default vertex add functionality on pointerdown.
                return { vertexAdd: false };
            }
            return true;
        }
    });
    
    // disable contexmenu
    this.paper.$el.on('contextmenu', function(evt) { 
        evt.preventDefault();  
        var cellView = GUI.schematic.paper.findView(evt.target);
        if (cellView) {
            console.log(cellView.model.id);  // So now you have access to both the cell view and its model.
            // ... display custom context menu, ...
            console.log(cellView);
        }
    });

    // register click to highlight (select)
    this.paper.on('cell:pointerclick', function(cellView, evt) {
        if( cellView.model.attributes.type == 'gate.Gate'){
            let gate = GUI.schematic.graph.getCell(cellView.model.id);
            if( cellView.model.id !== GUI.schematic.selected ){
                if( GUI.schematic.selected ){
                    GUI.schematic.graph.getCell(GUI.schematic.selected).removeAttr('image/filter');
                    GUI.schematic.selected = undefined;                
                }
                gate.attr('image/filter', { name: 'dropShadow', args: {dx: 4, dy: 4, blur: 5, color: '#26b14f'} });
                GUI.schematic.selected = cellView.model.id;
            }
            else {
                gate.removeAttr('image/filter');
                GUI.schematic.selected = undefined;                
            }
        }
        console.log("click!!", evt, cellView);
    });

    $(document).keypress(function(evt){
        if( evt.key === 'Delete'){
            if( GUI.schematic.selected ){
                GUI.schematic.graph.getCell(GUI.schematic.selected).remove();
                GUI.schematic.selected = undefined;
            }
        }
    });
};

GUI.schematic.insertGate = function(x, y, gateName){
    let inPorts = [], outPorts = [];
    for( let i = 0; i < Gate[gateName].nIn; ++i ){
        inPorts.push("i" + i);
    }
    for( let i = 0; i < Gate[gateName].nOut; ++i ){
        outPorts.push("o" + i);
    }
    var cell = new joint.shapes.gate.Gate({
        position: { x: x, y: y },
        inPorts: inPorts,
        outPorts: outPorts,
        attrs: {
            image: { 'xlink:href': Gate[gateName].img }
        },
        gate: gateName
    });
    this.graph.addCell(cell);
    return cell.id;
};


GUI.schematic.insertLink = function(from, to){
    from.port = 'o' + from.port;
    to.port = 'i' + to.port;
    let link = new joint.shapes.gate.Link({ source: from, target: to});
    GUI.schematic.graph.addCell(link);
};

GUI.schematic.getSchematic = function(){
    let raw = GUI.schematic.graph.toJSON();
    let idMapping = {};
    let schematic = [];
    for(let cell of raw.cells){
        if(cell.type == 'gate.Gate'){
            idMapping[cell.id] = schematic.length;
            let gate = {
                type: cell.gate,
                out: []
            };
            for(let i = 0; i < Gate[cell.gate].nOut; ++i){
                gate.out[i] = [];
            }
            schematic.push(gate);
        }
            
    }
    for(let cell of raw.cells){
        if(cell.type == 'gate.Link'){
            let sourceId = idMapping[cell.source.id];
            let sourcePort = Number(cell.source.port.replace('o', ''));
            let targetId = idMapping[cell.target.id];
            let targetPort = Number(cell.target.port.replace('i', ''));
            if( sourceId === undefined || targetId === undefined ){
                return {error: "There is a link whose target gate id or source gate id is undefined."};
            }
            if( sourcePort === NaN || targetPort === NaN ){
                return {error: "There is a link whose target port number or source port number is NaN."};
            }
            schematic[sourceId].out[sourcePort].push({id: targetId, port: targetPort});
        }
    }
    return schematic;
};

GUI.schematic.drawSchematic = function(schematic){
    let inputId;
    for( let id in schematic ){
        if( schematic[id].type == 'input'){
            inputId = id;
        }
    }
    let idMapping = {};
    idMapping[inputId] = GUI.schematic.insertGate( 10, 10, 'input');
    
    let column = [];
    for( let next of schematic[inputId].out[0] ){
        column.push(next.id);
    }

    const dX = 40;
    const dY = 105;
    const y0 = 10;
    const x0 = 200;
    let x = x0;
    let visited = new Set();
   
    while( column.length > 0 ){        
        let nextColumn = [];
        let y = y0;
        for( let gateId of column ){
            for( let out of schematic[gateId].out ){
                for( let next in out ){
                    if( !visited.has(next.id) ){
                        nextColumn.push(next.id);
                        visited.add(next.id);
                    }
                }
            }
            let id = GUI.schematic.insertGate( x, y, schematic[gateId].type);
            idMapping[gateId] = id;
            y += dY;
        }
        x += dX;
        column = nextColumn;
    }
    
    for( let gateId in schematic ){
        let sourceId = idMapping[gateId];
        for( let outInd in schematic[gateId].out ){
            for( let next of schematic[gateId].out[outInd] ){
                let targetId = idMapping[next.id];
                GUI.schematic.insertLink(
                    { id: sourceId, port: outInd },
                    { id: targetId, port: next.port }
                );
            }
        }
    }
};
