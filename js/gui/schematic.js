var GUI = GUI || {};
GUI.schematic = GUI.schematic || {};

GUI.schematic.init = function(gateListView, paperView){
    this._initGateListView(gateListView);
    this._initPaper(paperView);
};

GUI.schematic._initGateListView = function(gateListView){
    for(let gateName in Gate){
        let gate = Gate[gateName];
        let li = $('<li></li>');
        li.append($('<img/>').attr('src', gate.img));
        li.append($('<span>' + gate.name + '</span>'));
        gateListView.append(li);
    }
};
