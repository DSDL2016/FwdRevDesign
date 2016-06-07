/**
 * Algorithm.simplify() returns a simplified boolean expression
 * based on the passed expression in sum-of-product form
 *
 * @param {Array} ["101", "001", ...] in sum-of-product form
 * @return {Array} ["x01", "x0x"] in simplified form
 */

var Algorithm = Algorithm || {};
Algorithm.QMAlgorithm = Algorithm.QMAlgorithm || {};

// [0, 1, *, z] are reserved characters. Escape characters like [\, ', "] are also not used. 
Algorithm.QMAlgorithm.ASCII_STRING ="ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwy{|}~!#$%&(),-./23456789:;<=>?@";

Algorithm.simplify = function(terms) {
  var bitLength = terms[0].length;
  var output = Algorithm.QMAlgorithm.simplify(Algorithm.QMAlgorithm.generateInputs(bitLength), Algorithm.QMAlgorithm.parseInput(terms));
  return Algorithm.QMAlgorithm.parseOutput(output, bitLength);
};

/**
  * "110" => "ABC*"
  */
Algorithm.QMAlgorithm.term2expression = function(term) {
  var str = "";
  for (let i = 0; i < term.length; i++)
    str += Algorithm.QMAlgorithm.ASCII_STRING[i] + ((term[i] == 0) ? "*" : "");
  return str;
};

/**
  * ["001", "111"] => "A*B*C+ABC"
  */
Algorithm.QMAlgorithm.parseInput = function(terms) {
  var arr = [];
  for (let i = 0; i < terms.length; i++)
    arr.push(Algorithm.QMAlgorithm.term2expression(terms[i]));

  var expression = "";
  for (let i = 0; i < arr.length; i++) 
    expression += arr[i] + ((i == arr.length - 1) ? "" : "+");
  return expression;
};

/**
  * ("A*B", 3) => "01x"
  */
Algorithm.QMAlgorithm.expression2term = function(exp, bitLength) {
  var ans = Array(bitLength).fill("x");
  for (let i = 0; i < exp.length; i++) {
    if (exp[i] == "*")
      continue;
    var isNegative = (i + 1 < exp.length && exp[i + 1] == "*");
    ans[Algorithm.QMAlgorithm.ASCII_STRING.indexOf(exp[i])] = isNegative ? "0" : "1";
  }

  var str = "";
  for (let each of ans)
    str += each;
  return str;
};

/**
  * "B + A*C" => ["x1x", "0x1"]
  */
Algorithm.QMAlgorithm.parseOutput = function(expressionStr, bitLength) {
  var expression = expressionStr.split(" + ");
  var arr = [];
  for (let i = 0; i < expression.length; i++)
    arr.push(Algorithm.QMAlgorithm.expression2term(expression[i], bitLength));
  return arr;
};

/**
  * return ["A", "B", "C".....(# of bitLength)]
  */
Algorithm.QMAlgorithm.generateInputs = function(bitLength) {
  var inputs = [];
  for (let i = 0; i < bitLength; i++)
    inputs.push(Algorithm.QMAlgorithm.ASCII_STRING[i])
  return inputs;
};
