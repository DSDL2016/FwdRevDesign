const Gate = {
    or: {
        nIn: 2,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/or.png', // background image
        type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        name: 'OR Gate',
        truthTable: [ [[0, 1], [1, 1]] ] // or.truthTable[0][a][b] == a or b
    },
    and: {
        nIn: 2,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/and.png', // background image
        type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        name: 'AND Gate',
        truthTable: [ [[0, 0], [0, 1]] ] // and.truthTable[0][a][b] == a and b
    },
    sr: {
        nIn: 2,
        nOut: 2,
        img: 'imgs/SR.png',
        type: 'seq',
        name: 'SR Latch',
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
    },
    jk: {
        nIn: 2,
        nOut: 2,
        name: 'JK Flip-Flop',
        img: './imgs/JK.png'
    },
    d: {
        nIn: 1,
        nOut: 1,
        name: 'D Flip-Flop',
        img: './imgs/D.png'
    }
};
