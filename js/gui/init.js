
$(document).ready(function(){
    if (window.confirm('If you like our work, please give us a star :D')) {
        window.location = 'https://github.com/DSDL2016/FwdRevDesign';
    }
    GUI.schematic.init($('#schematicPaper'));
    GUI.fsm.init($('#fsmPaper'));      
    GUI.view.init();
});
