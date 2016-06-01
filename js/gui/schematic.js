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
    for( let i = 0; i < Gate[gateName].nIn; ++i ){
        outPorts.push("o" + i);
    }
    var cell = new joint.shapes.gate.Gate({
        position: { x: x, y: y },
        inPorts: inPorts,
        outPorts: outPorts,
        attrs: {
            image: { 'xlink:href': Gate[gateName].img }
        }
    });
    this.graph.addCell(cell);

};
