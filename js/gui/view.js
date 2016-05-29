GUI.view = GUI.view || {};

GUI.view.init = function(){
    this.currentView = 'schematicView';
    $('#transform').click(GUI.view.toggleView);
};


GUI.view.toggleView = function(){

    // Hide current view
    $('#' + GUI.view.currentView).hide();

    // Toggle current view   
    if(GUI.view.currentView === 'schematicView'){
        GUI.view.currentView = 'fsmView';
    }
    else{
        GUI.view.currentView = 'schematicView';
    }

    // Show current view
    $('#' + GUI.view.currentView).show();        
};
