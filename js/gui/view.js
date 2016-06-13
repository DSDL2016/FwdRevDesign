GUI.view = GUI.view || {};

GUI.view.init = function(){
    $('.popUpWrapper').hide();
    $('.cancel').click(function(){$('.popUpWrapper').hide();});
    $('#enterFsmSetting').click(function(){$('.popUpWrapper').hide();});
    this.currentView = 'schematicView';
    $('#toSchematic').click(GUI.view._toSchematic);
    $('#toFSM').click(GUI.view._toFSM);
    $('#newState').click(GUI.view.newState);
    $('#fsmSettings').click(function(){$('#fsmSettingsWindow').show();});
    this._initGateListView();
    this._bindSchematicDrop();
};

GUI.view._initGateListView = function(){
    GUI.view.dragging = {};
    
    for(let gateName in Gate){
        let gate = Gate[gateName];
        let li = $('<li></li>');
        let img = $('<img/>').attr('src', gate.img);
        
        img.mousedown(function(e){
            var offset = $(this).offset();
            GUI.view.dragging.offsetX = e.pageX - offset.left;
            GUI.view.dragging.offsetY = e.pageY - offset.top;
        });

        // dirty closure...
        (function(gateName){
            img.bind('drag', function(e){
                e.preventDefault();
                GUI.view.dragging.gateName = gateName;
            });

            li.click(function(){
                GUI.schematic.insertGate(30, 30, gateName);
            });
        })(gateName);

        li.append(img);
        li.append($('<span>' + gate.name + '</span>'));

        
        $('#gateList').append(li);
    }
};

GUI.view._bindSchematicDrop = function(){
    $('#schematicPaper').bind('dragover', function(evt){
        evt.preventDefault();
    });
    $('#schematicPaper').children().filter('svg').bind('drop', function(evt){
        evt.preventDefault();
        if( GUI.view.dragging.gateName ){
            let x = evt.originalEvent.layerX - GUI.view.dragging.offsetX;
            let y = evt.originalEvent.layerY - GUI.view.dragging.offsetY;
            GUI.schematic.insertGate(x, y, GUI.view.dragging.gateName);
            GUI.view.dragging.gateName = undefined;
        }
    });
};

GUI.view.toggleView = function(){

    // Hide current view
    $('#' + GUI.view.currentView).hide();

    // Toggle current view   
    if(GUI.view.currentView === 'schematicView'){
        GUI.view.currentView = 'fsmView';
        $('#subTitle').text('Forward Engineering');
    }
    else{
        GUI.view.currentView = 'schematicView';
        $('#subTitle').text('Reverse Engineering');
    }

    // Show current view
    $('#' + GUI.view.currentView).show();        
};

GUI.view.newState = function(){
    let x = $('#fsmPaper').scrollLeft() + $('.fsm').width() / 2 - 20;
    let y = $('#fsmPaper').scrollTop() + $('.fsm').height() / 2 - 20;
    let id = GUI.fsm.newState(x, y);
    GUI.view.showSetStateNameWindow(id);
};

GUI.view.showSetLinkWindow = function(id){
    $("#stateLinkLabelWindow").show();
    (function(id){
        $('#enterSetLabel').one('click',function(){
            GUI.fsm.setLinkLabel(id, $('#stateLinkLabel').val() );
            GUI.fsm.removeLinkVertex(id);
            $('#stateLinkLabelWindow').hide();
        });
    })(id);
};

GUI.view.showSetStateNameWindow = function(id){
    $("#stateNameWindow").show();
    (function(id){
        $('#enterSetStateName').one('click',function(){
            GUI.fsm.setStateName(id, $('#stateName').val() );
            $('#stateNameWindow').hide();
        });
    })(id);
};


GUI.view._toSchematic = function(){
    let fsm = GUI.fsm.getFSM();
    if( fsm.error ){
        window.alert(fsm.error);
        return;
    }
    if( Object.keys(fsm).length === 0 ){
        GUI.view.toggleView();
        return;
    }
    let ffType = $('input:radio:checked[name="ffType"]').val();
    let schematic = Algorithm.forward(fsm, ffType);
    if( schematic.error ){
        window.alert(schematic.error);
        return;
    }
    GUI.schematic.graph.clear();
    GUI.view.toggleView();
    GUI.schematic.drawSchematic(schematic);
};

GUI.view._toFSM = function(){
    let schematic = GUI.schematic.getSchematic();
    if( schematic.error ){
        window.alert(schematic.error);
        return;
    }
    let fsm = Algorithm.reverse(schematic);
    GUI.fsm.graph.clear();
    GUI.fsm.drawFSM(fsm);
    GUI.view.toggleView();
};
