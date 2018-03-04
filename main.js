function Calculator() {
  this.controls = document.getElementById("controls");
  this.numbers = document.getElementById("numbers");
  this.operator = document.getElementById("operators");
  this.currentDiv = document.getElementById("current");
  this.historyDiv = document.getElementById("history");
  this.numbersHistory = [];
  this.numHistoryIndex = 0;
  this.opHistory = [];
  this.opHistoryIndex = 0;

  this.resultsArray = [];
  this.resultsArrayIndex = 0;

  this.result = 0;
  this._operator = new Operator(0,0);
  this.lastAnswer = 0;

  // check for when buttons have been clicked
  this.saveNum = false;
  this.opBtnPressed = false;

}

Calculator.prototype = {

  /**
   * @param  {} str
   * @description {replaces text in current Div with str}
   */
  AddToCurrentView: function (str) {

    this.currentDiv.textContent += str;
    this.UpdateNumbersHistory(this.currentDiv.textContent);
    console.log(this.numbersHistory[this.numHistoryIndex]);
  },

  UpdateHistoryView: function () {
    var numArray = this.numbersHistory,
        opArray = this.opHistory;
    var length = Math.max(numArray.length, opArray.length);
    this.historyDiv.textContent = "";
    for (let i = 0; i < length; i++) {
      this.historyDiv.textContent += `${numArray[i]} ${opArray[i] || ""} `;
    }
  },

  UpdateNumbersHistory : function (str) {
    this.numbersHistory[this.numHistoryIndex] = str;
  },

  UpdateNumberHistoryCounter : function() {
    this.numHistoryIndex++;
  },

  NumbersListener: function () {
    function ObjRef(calc) {

      return function (ev) {

        // save the operand history if it can
        if(calc.saveNum) { // TODD in operator
          calc.historyIndex++;
          calc.saveNum = false;
          calc.currentDiv.textContent = "";
          calc.UpdateNumberHistoryCounter();
          
        }
        var text = ev.target.textContent;
        calc.AddToCurrentView(text);

        // if operator has been pressed then reset it
        if(calc.opBtnPressed) {
          calc.opBtnPressed = false;
          calc.opReady = true;
        }
      }
    }

    this.numbers.addEventListener("click", ObjRef(this))
  },

  CalculateResults : function (lastOperator) {
    var operandA,
        operandB;
    if(!this.resultsArray[0]) {
      operandA = parseFloat(this.numbersHistory[this.numHistoryIndex-1]);
      operandB = parseFloat(this.numbersHistory[this.numHistoryIndex]);
    } else {
      operandA = parseFloat(this.resultsArray[this.resultsArrayIndex - 1]);
      operandB = parseFloat(this.numbersHistory[this.numHistoryIndex]);
    }
    console.log(`operandA: ${operandA}, operandB: ${operandB}`);
    var op = this._operator.operators[lastOperator];
    console.log(`Operator used: ${op}`);
    var result = this._operator.Operate(operandA, operandB, this._operator[op]);
    console.log(result + " The result");
    this.resultsArray[this.resultsArrayIndex++] = result;
    
    this.opReady = false;
  },

  UpdateOperatorHistory : function (str) {
    if(this.opReady)
      this.UpdateOperatorHistoryIndex();
    
      this.opHistory[this.opHistoryIndex] = str;
    

  },

  UpdateOperatorHistoryIndex: function() {
    this.opHistoryIndex++;
    console.log("the operator index is now " + this.opHistoryIndex);
    
  },

  OperatorListener: function () {
    function ObjRef(calc) {
      var localOperatorArray = [];
      var localOpIndex = 0;
      return function (ev) {
        var target = ev.target,
            text = target.textContent,
            // current = calc.currentDiv,
            currentText = current.textContent;

        // check that basic operators are clicked
        var opMatch = text.match(/[+*/-]/g);
        // check that digits exist in the current div
        var digitMatch = currentText.match(/\d/);
        
        if(opMatch !== null && opMatch.length === 1) {
          calc.opBtnPressed = true;
          localOperatorArray[localOpIndex++ % 2] = text;
          calc.UpdateOperatorHistory(text);
          calc.UpdateHistoryView();

          calc.saveNum = true;

          if(calc.opReady)
          {
            calc.CalculateResults(localOperatorArray[0]);
          }
          
        }
      }
    }

    this.operator.addEventListener("click", ObjRef(this))
    
  }



}

function Operator(operandA, operandB) {
  this.result = 0;
  this.operandA = operandA;
  this.operandB = operandB;
  this.operators = {
    "+": "Add",
    "-": "Subtract",
    "*": "Multiply",
    "/": "Divide",
    sqrt: "SquareRoot"
  }
}

Operator.prototype = {
  Operate: function (a, b, operator) {
    this.operandA = a;
    this.operandB = b;
    this.result = operator(a, b);
    return this.result;
  },

  Add: function (a, b) {
    return a + b;
  },

  Subtract: function (a, b) {
    return a - b;
  },

  Multiply: function (a, b) {
    return a * b;
  },

  Divide: function (a, b) {
    return a / b;
  },

  SquareRoot: function (a) {
    return Math.sqrt(a);
  },

}





window.onload = function Main() {
  var calculator = new Calculator();
  calculator.NumbersListener();
  calculator.OperatorListener();

}