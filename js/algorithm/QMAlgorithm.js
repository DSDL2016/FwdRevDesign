/**
 * QMAlgorithm.simplify() returns a simplified boolean expression
 * based on the passed expression in sum-of-product form
 *
 * @param {Array} ["101", "001", ...] in sum-of-product form
 * @return {Array} ["x01", "x0x"] in simplified form
 */
var QMAlgorithm = QMAlgorithm || {};

// [0, 1, *, z] are reserved characters. Escape characters like [\, ', "] are also not used. 
QMAlgorithm.ASCII_STRING ="ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwy{|}~!#$%&(),-./23456789:;<=>?@";

QMAlgorithm.simplify = function (terms) {
  var totalBit = terms[0].length;
  var output = qm.simplify(QMAlgorithm.generateInputs(totalBit), QMAlgorithm.parseInput(terms));
  return QMAlgorithm.parseOutput(output, totalBit);
};

/**
  * "110" => "ABC*"
  */
QMAlgorithm.term2expression = function(term) {
  var str = "";
  for (let i = 0; i < term.length; i++)
    str += QMAlgorithm.ASCII_STRING[i] + ((term[i] == 0) ? "*" : "");
  return str;
};

/**
  * ["001", "111"] => "A*B*C+ABC"
  */
QMAlgorithm.parseInput = function(terms) {
  var arr = [];
  for (let i = 0; i < terms.length; i++)
    arr.push(QMAlgorithm.term2expression(terms[i]));

  var expression = "";
  for (let i = 0; i < arr.length; i++) 
    expression += arr[i] + ((i == arr.length - 1) ? "" : "+");
  return expression;
};

/**
  * ("A*B", 3) => "01x"
  */
QMAlgorithm.expression2term = function(exp, totalBit) {
  var ans = Array(totalBit).fill("x");
  for (let i = 0; i < exp.length; i++) {
    if (exp[i] == "*")
      continue;
    var isNegative = (i + 1 < exp.length && exp[i + 1] == "*");
    ans[QMAlgorithm.ASCII_STRING.indexOf(exp[i])] = isNegative ? "0" : "1";
  }

  var str = "";
  for (let each of ans)
    str += each;
  return str;
};

/**
  * "B + A*C" => ["x1x", "0x1"]
  */
QMAlgorithm.parseOutput = function(expressionStr, totalBit) {
  var expression = expressionStr.split(" + ");
  var arr = [];
  for (let i = 0; i < expression.length; i++)
    arr.push(QMAlgorithm.expression2term(expression[i], totalBit));
  return arr;
};

/**
  * return ["A", "B", "C".....(# of totalBit)]
  */
QMAlgorithm.generateInputs = function(totalBit) {
  var inputs = [];
  for (let i = 0; i < totalBit; i++)
    inputs.push(QMAlgorithm.ASCII_STRING[i])
  return inputs;
};
