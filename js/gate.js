const gates = {
    or: {
        nIn: 2,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/or.png', // background image
        type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        truthTable: [[ [0, 1], [1, 1]]] // or.truthTable[0][a][b] == a or b
    },
    rs: {
        nIn: 2,
        nOut: 2,
        img: 'imgs/rs.png',
        type: 'seq',
        truthTable: [
            [ // Q (output pin 0)
                [ // R == 0
                    [0, 1], // S == 0
                    [1, 1]  // S == 1
                ], 
                [ // R = 1
                    [0, 0],                // S == 0
                    [undefined, undefined] // S == 1
                ]
            ],            
            [ // -Q (output pin 1)
                [ // R == 0
                    [1, 0], // S == 0
                    [0, 0]  // S == 1
                ], 
                [ // R = 1
                    [1, 1],                // S == 0
                    [undefined, undefined] // S == 1
                ]
            ]
        ]
    }
};
