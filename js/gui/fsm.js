GUI.fsm = GUI.fsm || {};

GUI.fsm.init = function(paperView){
    this._initPaper(paperView);
};

GUI.fsm._initPaper = function(paperView){
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

    $(Document).keypress(function(evt){
        if( evt.key === 'Delete'){
            if( GUI.schematic.selected ){
                GUI.schematic.graph.getCell(GUI.schematic.selected).remove();
                GUI.schematic.selected = undefined;
            }
        }
    });
};


GUI.fsm.newState = function(x, y){
    var cell = new joint.shapes.fsm.State({
        position: { x: x, y: y }
    });
    this.graph.addCell(cell);

};
