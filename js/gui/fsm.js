GUI.fsm = GUI.fsm || {};

GUI.fsm.init = function(paperView){
    this._initPaper(paperView);
};

GUI.fsm._initPaper = function(paperView){
    this.selected = "";
    
    this.graph = new joint.dia.Graph();
    
    this.paper = new joint.dia.Paper({
        el: paperView,
        width: 2048,
        height: 2048,
        gridSize: 1,
        model: this.graph,
        // interactive: function(cellView) {
        //     if (cellView.model instanceof joint.dia.Link) {
        //         // Disable the default vertex add functionality on pointerdown.
        //         return { vertexAdd: false };
        //     }
        //     return true;
        // }
    });

    // There is no start state
    // var startState = new joint.shapes.fsm.StartState({
    //     position: { x: 100, y: 100 }
    // });
    // this.graph.addCell(startState);
    
    // disable contexmenu
    this.paper.$el.on('contextmenu', function(evt) { 
        evt.preventDefault();  
        var cellView = GUI.fsm.paper.findView(evt.target);
    });

    // register click to highlight (select)
    this.paper.on('cell:pointerclick', function(cellView, evt) {
        if( cellView.model.attributes.type != 'fsm.Arrow'  ){
            let state = GUI.fsm.graph.getCell(cellView.model.id);
            if( GUI.fsm.selected ){
                if( GUI.fsm.selected !== cellView.model.id ){
                    let linkId = GUI.fsm.newLink(GUI.fsm.selected, cellView.model.id);
                    GUI.view.showSetLinkWindow(linkId);
                    GUI.fsm.graph.getCell(GUI.fsm.selected).removeAttr('circle/filter');
                    GUI.fsm.selected = undefined;
                }
                else {
                    state.removeAttr('circle/filter');
                    GUI.fsm.selected = undefined;                
                }
            }
            else{
                state.attr('circle/filter', { name: 'dropShadow', args: {dx: 4, dy: 4, blur: 5, color: '#26b14f'} });
                GUI.fsm.selected = cellView.model.id;
            }
        }
    });

    // double click to set link lebel
    this.paper.on('cell:pointerdblclick', function(cellView, evt){
        if( cellView.model.attributes.type == 'fsm.Arrow'){
            GUI.view.showSetLinkWindow(cellView.model.id);
        }
        else if(cellView.model.attributes.type == 'fsm.State'){
            GUI.view.showSetStateNameWindow(cellView.model.id);
        }
    });
    
    $(document).keypress(function(evt){
        if( evt.key === 'Delete'){
            if( GUI.fsm.selected ){
                let cell = GUI.fsm.graph.getCell(GUI.fsm.selected);
                if(cell.attributes.type != 'fsm.StartState' ){
                    cell.remove();
                    GUI.fsm.selected = undefined;
                }
            }
        }
    });
};


GUI.fsm.newState = function(x, y){
    var cell = new joint.shapes.fsm.State({
        position: { x: x, y: y }
    });
    this.graph.addCell(cell);
    return cell.id;
};


GUI.fsm.newLink = function(id1, id2, label){
    label =  label || "";
    var link = new joint.shapes.fsm.Arrow({
        source: { id: id1 },
        target: { id: id2 },
        labels: [{ position: 0.5, attrs: { text: { text: label, 'font-weight': 'bold' } } }]
    });
    GUI.fsm.graph.addCell(link);
    return link.id;
};

GUI.fsm.setLinkLabel = function(id, label){
    GUI.fsm.graph.getCell(id).label(0, { attrs: {text: {text: label} }});
};


GUI.fsm.setStateName = function(id, name){
    GUI.fsm.graph.getCell(id).attr({text: {text: name}});
};


GUI.fsm.removeLinkVertex = function(id){
    let link = GUI.fsm.graph.getCell(id);
    let linkView = link.findView(GUI.fsm.paper);
    if(link.attributes.vertices){
        let lastVertexId = link.attributes.vertices.length - 1;    
        linkView.removeVertex(lastVertexId);
    }
};

GUI.fsm.getFSM = function(){
    let raw = GUI.fsm.graph.toJSON();
    let idMapping = {};
    let idSet = new Set();
    let fsm = {};
    let counter = 0;
    const legalStateName = /^[01]+$/;
    for( let cell of raw.cells ){        
        if( cell.type == 'fsm.State' ){
            if( !cell.attrs.text ){
                return {error: "There is a state with no name."};
            }
            if( !legalStateName.exec(cell.attrs.text.text) ){
                return {error: "There is a state with illegal name."};
            }
            if( idSet.has(cell.attrs.text.text) ){
                return {error: "There are states with duplicated name."};
            }
            let id = String(cell.attrs.text.text);
            idSet.add(id);
            idMapping[cell.id] = id;
            fsm[id] = [];
        }
        else if( cell.type == 'fsm.Start' ){
            idMapping[cell.id] = 'start';
        }
    }
    
    for( let cell of raw.cells ){
        if( cell.type == 'fsm.Arrow' ){
            let source = cell.source;
            let sourceId = idMapping[cell.source.id];
            let nextId = idMapping[cell.target.id];
            if( sourceId === undefined || nextId === undefined ){
                return { error: "There is an edge whose target or source is undefined." };
            }            
            let input = Number(cell.labels[0].attrs.text.text[0]);
            let output = cell.labels[0].attrs.text.text[2];
            if( fsm[sourceId][input] !== undefined ){
                return { error: "There is a state having two out edge with same input." };
            }
            if( output !== '0' && output !== '1' ){
                return { error: "There is an edge whose output is not 0 or 1."};
            }
            fsm[sourceId][input] = { next: nextId, out: output };
        }        
    }
    return fsm;    
};


GUI.fsm.drawFSM = function(fsm, centerX, centerY, radius, startAngle){
    const defaultCenterX = 400;
    const defaultCenterY = 300;
    const defaultRadius = 200;
    const defaultStartAngle = 0;
    centerX = centerX || defaultCenterX;
    centerY = centerY || defaultCenterY;
    radius = radius || defaultRadius;
    startAngle = startAngle || defaultStartAngle;
    let nStates = Object.keys(fsm).length;
    let dTheta = 2 * Math.PI / nStates; // delta theta
    let idMapping = {};
    let theta = startAngle;
    // add states
    for(let state in fsm){
        let x = centerX + radius * Math.cos(theta);
        let y = centerY + radius * Math.sin(theta);
        let id = GUI.fsm.newState(x, y);
        idMapping[state] = id;
        theta += dTheta;
    }
    // add links
    for(let state in fsm){
        let sourceId = idMapping[state];
        for(let input = 0; input < 2; input++){
            if( fsm[state][input] ){
                let targetId = idMapping[fsm[state][input].next];
                let label = "" + input + '/' + fsm[state][input].out;
                GUI.fsm.newLink(sourceId, targetId, label);
            }
        }
    }
};
