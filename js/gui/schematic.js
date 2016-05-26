var GUI = GUI || {};
GUI.schematic = GUI.schematic || {};

GUI.schematic.init = function(gateListView, paperView){
    this._initPaper(paperView);
    this._initGateListView(gateListView);
};

GUI.schematic._initGateListView = function(gateListView){
    for(let gateName in Gate){
        let gate = Gate[gateName];
        let li = $('<li></li>');
        li.append($('<img/>').attr('src', gate.img));
        li.append($('<span>' + gate.name + '</span>'));

        // dirty closure...
        (function(gateName){
            li.click(function(){
                GUI.schematic.insertGate(30, 30, gateName);
            });
        })(gateName);
        
        gateListView.append(li);
    }
};

GUI.schematic._initPaper = function(paperView){
    this.graph = new joint.dia.Graph();
    
    this.paper = new joint.dia.Paper({
        el: paperView,
        width: 2048,
        height: 2048,
        gridSize: 1,
        model: this.graph,
        linkView: joint.dia.LinkView.extend({
            pointerclick: function(evt, x, y) {
                
            }
        }),
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
        var cellView = paper.findView(evt.target);
        if (cellView) {
            console.log(cellView.model.id);  // So now you have access to both the cell view and its model.
            // ... display custom context menu, ...
        }
    });

    this.paper.on('cell:pointerdblclick', function(cellView, evt) {
        console.log("cellview:", cellView);
        let cell = graph.getCell(cellView.model.attributes.id);
        if( cell.isLink() ){
            cell.label(0, {attrs: { text: { text: 'rested!!' } }} );
        }
        
    });

    this.paper.on('cell:pointerclick', function(cellView, evt) {
        if( cellView.model.attributes.type == 'fsa.State'){
            cellView.highlight();
        }
        console.log("click!!", evt, cellView);
    });

};

GUI.schematic.insertGate = function(x, y, gateName){
    var cell = new joint.shapes.gate.Gate({
        position: { x: x, y: y },
        inPorts: ['in'],
        outPorts: ['out'],
        attrs: {
            image: { 'xlink:href': Gate[gateName].img }
        }
    });
    this.graph.addCell(cell);

};
