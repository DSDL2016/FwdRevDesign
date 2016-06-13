joint.shapes.fsm = {};

joint.shapes.fsm.State = joint.shapes.basic.Circle.extend({
    defaults: joint.util.deepSupplement({
        type: 'fsm.State',
        attrs: {
            circle: { 'stroke-width': 3 },
            text: { 'font-weight': '800' }
        }
    }, joint.shapes.basic.Circle.prototype.defaults)
});

joint.shapes.fsm.StartState = joint.shapes.basic.Circle.extend({

    defaults: joint.util.deepSupplement({

        type: 'fsm.StartState',
        size: { width: 40, height: 40 },
        attrs: {
            circle: {
                fill: '#000000'
            },
            text: {
                text: 'start',
                fill: '#FFFFFF',
                'font-weight': '800'
            }
            
        }

    }, joint.shapes.basic.Circle.prototype.defaults)
});

joint.shapes.fsm.EndState = joint.dia.Element.extend({

    markup: '<g class="rotatable"><g class="scalable"><circle class="outer"/><circle class="inner"/></g></g>',

    defaults: joint.util.deepSupplement({

        type: 'fsm.EndState',
        size: { width: 40, height: 40 },
        attrs: {
            '.outer': {
                transform: 'translate(10, 10)',
                r: 10,
                fill: '#ffffff',
                stroke: '#000000'
            },

            '.inner': {
                transform: 'translate(10, 10)',
                r: 6,
                fill: '#000000'
            }
        }

    }, joint.dia.Element.prototype.defaults)
});

joint.shapes.fsm.Arrow = joint.dia.Link.extend({

    defaults: joint.util.deepSupplement({
        type: 'fsm.Arrow',
        attrs: { '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }},
        smooth: true
    }, joint.dia.Link.prototype.defaults)
});

