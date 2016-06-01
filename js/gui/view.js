GUI.view = GUI.view || {};

GUI.view.init = function(){
    $('#stateLinkLabelWindow').hide();
    $('#cancelSetLabel').click(function(){$('#stateLinkLabelWindow').hide();});
    this.currentView = 'schematicView';
    $('#toFSM').click(GUI.view.toggleView);
    $('#toSchematic').click(GUI.view.toggleView);
    $('#newState').click(GUI.view.newState);
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
};

GUI.view.showSetLinkWindow = function(id){
    $("#stateLinkLabelWindow").show();
    (function(id){
        $('#enterSetLabel').click(function(){
            GUI.fsm.setLinkLabel(id, $('#stateLinkLabel').val() );
            GUI.fsm.removeLinkVertex(id);
            $('#stateLinkLabelWindow').hide();
        });
    })(id);
};
