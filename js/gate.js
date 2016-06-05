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
    not: {
        nIn: 1,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/not.png', // background image
        type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        name: 'NOT Gate',
        truthTable: [ [[1, 0]] ] // not.truthTable[0][a] == not a
    },
    nand: {
        nIn: 2,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/nand.png', // background image
        type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        name: 'NAND Gate',
        truthTable: [ [[1, 1], [1, 0]] ] // nand.truthTable[0][a][b] == not(a and b)
    },
    nor: {
        nIn: 2,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/nor.png', // background image
        type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        name: 'NOR Gate',
        truthTable: [ [[1, 0], [0, 0]] ] // nor.truthTable[0][a][b] == not(a or b)
    },
    xor: {
        nIn: 2,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/xor.png', // background image
        type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        name: 'XOR Gate',
        truthTable: [ [[0, 1], [1, 0]] ] // xor.truthTable[0][a][b] == ((not a) and b) or (a and (not b))
    },
    rs: {
        nIn: 2,
        nOut: 2,
        img: 'imgs/RS.png',
        type: 'seq',
        name: 'RS Latch',
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
        img: './imgs/JK.png',
        type: 'seq',
        truthTable: [ // [Q+=0, /Q+=1][R][S][Q]
            [ // Q (output pin 0)
                [ // J == 0
                    [0, 1], // K == 0 -> Q+ = Q
                    [0, 0]  // K == 1
                ], 
                [ // J = 1
                    [1, 1], // K == 0
                    [1, 0]  // K == 1
                ]
            ],            
            [ // -Q (output pin 1)
                [ // J == 0
                    [1, 0], // K == 0
                    [1, 1]  // K == 1
                ], 
                [ // J = 1
                    [0, 0], // K == 0
                    [0, 1]  // K == 1
                ]
            ]
        ]
    },
    d: {
        nIn: 1,
        nOut: 1,
        name: 'D Flip-Flop',
        img: './imgs/D.png'
    }
};
