const Gate = {
    input: {
        type: 'cmb',
        nIn: 1,
        nOut: 1,
        img: '',
        name: 'Input',
        truthTable: [
            [0],
            [1]
        ]
    },
    or: {
		type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        nIn: 2,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/or.png', // background image
        name: 'OR Gate',
        truthTable: [[0], [1], [1], [1]] // or.truthTable[0][a][b] == a or b
    },
    and: {
		type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        nIn: 2,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/and.png', // background image
        name: 'AND Gate',
        truthTable: [[0], [0], [0], [1]] // and.truthTable[0][a][b] == a and b
    },
    not: {
		type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        nIn: 1,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/not.png', // background image
        name: 'NOT Gate',
        truthTable: [[1], [0]] // not.truthTable[0][a] == not a
    },
    nand: {
		type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        nIn: 2,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/nand.png', // background image
        name: 'NAND Gate',
        truthTable: [[1], [1], [1], [0]] // nand.truthTable[0][a][b] == not(a and b)
    },
    nor: {
		type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        nIn: 2,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/nor.png', // background image
        name: 'NOR Gate',
        truthTable: [[1], [0], [0], [0]] // nor.truthTable[0][a][b] == not(a or b)
    },
    xor: {
		type: 'cmb',        // 'cmb' => combinational, 'seq' => sequential
        nIn: 2,  // number of input pin
        nOut: 1, // number of output pin
        img: 'imgs/xor.png', // background image
        name: 'XOR Gate',
        truthTable: [[0], [1], [1], [0]] // xor.truthTable[0][a][b] == ((not a) and b) or (a and (not b))
    },
    rs: {
		type: 'seq',
		nIn: 2,
		nOut: 2,
		nState: 1,
		img: 'imgs/RS.png',
		name: 'RS Latch',
		truthTable: {
			first: [ // RSQ -> [Q^t+1]
				[0], // 000
				[1], // 001
				[1], // 010
				[1], // 011
				[0], // 100
				[0], // 101
				[undefined], //110
				[undefined]  //111
			],
			second: [ // Q -> [Q, -Q]
				[0, 1],//0
				[1, 0] //1
			]
		}
	},
    jk: {
	    type: 'seq',
        nIn: 2,
        nOut: 2,
		nState: 1,
        name: 'JK Flip-Flop',
        img: './imgs/JK.png',
        truthTable: {
			first: [ // JKQ-Q -> [Q^t+1]
				[0], // 000
				[1], // 001
				[1], // 010
				[1], // 011
				[0], // 100
				[0], // 101
				[1], // 110
				[0]  // 111
			],
			second: [ // Q -> [Q, -Q]
				[0, 1],//0
				[1, 0] //1
			]
		}
    },
    d: {
	    type: 'seq',
        nIn: 1,
        nOut: 2,
		nState: 1,
        name: 'D Flip-Flop',
        img: './imgs/D.png',
        truthTable: {
			first: [ // DQ -> [Q^t+1]
				[0], // 00
				[0], // 01
				[1], // 10
				[1] // 11
			],
			second: [ // Q -> [Q, -Q]
				[0, 1],//0
				[1, 0] //1
			]
		}
    },
    t: {
	    type: 'seq',
        nIn: 1,
        nOut: 2,
		nState: 1,
        name: 'T Flip-Flop',
        img: './imgs/T.png',
        truthTable: {
			first: [ // TQ -> [Q^t+1]
				[0], // 00
				[1], // 01
				[1], // 10
				[0] // 11
			],
			second: [ // Q -> [Q, -Q]
				[0, 1],//0
				[1, 0] //1
			]
		}
    },
	output: {
        type: 'cmb',
        nIn: 1,
        nOut: 0,
		img: '',
        truthTable: [[],[]]
    }
};
