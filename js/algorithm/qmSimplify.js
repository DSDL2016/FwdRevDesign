// [0, 1, *, z] are reserved characters. Escape characters like [\, ', "] are also not used. 
const ASCII_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwy{|}~!#$%&(),-./23456789:;<=>?@";

/**
  * "110" => "ABC*"
  */
function term2expression(term) {
  var str = "";
  for (let i = 0; i < term.length; i++)
    str += ASCII_STRING[i] + ((term[i] == 0) ? "*" : "");
  return str;
}

/**
  * ["001", "111"] => "A*B*C+ABC"
  */
function parseInput(terms) {
  var arr = [];
  for (let i = 0; i < terms.length; i++)
    arr.push(term2expression(terms[i]));

  var expression = "";
  for (let i = 0; i < arr.length; i++) 
    expression += arr[i] + ((i == arr.length - 1) ? "" : "+");
  return expression;
}

/**
  * ("A*B", 3) => "01x"
  */
function expression2term(exp, totalBit) {
  var ans = Array(totalBit).fill("x");
  for (let i = 0; i < exp.length; i++) {
    if (exp[i] == "*")
      continue;
    var isNegative = (i + 1 < exp.length && exp[i + 1] == "*");
    ans[ASCII_STRING.indexOf(exp[i])] = isNegative ? "0" : "1";
  }

  var str = "";
  for (let each in ans)
    str += ans[each];
  return str;
}

/**
  * "B + A*C" => ["x1x", "0x1"]
  */
function parseOutput(expressionStr, totalBit) {
  var expression = expressionStr.split(" + ");
  var arr = [];
  for (let i = 0; i < expression.length; i++)
    arr.push(expression2term(expression[i], totalBit));
  return arr;
}

/**
  * return ["A", "B", "C".....(# of totalBit)]
  */
function generateInputs(totalBit) {
  var inputs = [];
  for (let i = 0; i < totalBit; i++)
    inputs.push(ASCII_STRING[i])
  return inputs;
}

/**
  * ["001", "011"] => ["0x1"]
  */
function qmSimplify(terms) {
  var totalBit = terms[0].length;
  var output = qm.simplify(generateInputs(totalBit), parseInput(terms));
  return parseOutput(output, totalBit);
}
