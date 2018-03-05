function Calculator() {
  this.controls = document.getElementById("controls");
  this.numbers = document.getElementById("numbers");
  this.operator = document.getElementById("operators");
  this.currentDiv = document.getElementById("current");
  this.historyDiv = document.getElementById("history");
  this.numbersHistory = [0];
  this.numHistoryIndex = 0;
  this.opHistory = [];
  this.opHistoryIndex = 0;

  this.resultsArray = [];
  this.resultsArrayIndex = 0;

  this.result = 0;
  this._operator = new Operator(0,0);
  this.decimalCount = 0;

  // state checks
  this.saveNum = false;
  this.opBtnPressed = false;
  this.opReady = false;
  this.opCanUse = true;
  this.clearScreen = false;

}

Calculator.prototype = {

  /**
   * @param  {} str
   * @description replaces text in current Div with str
   */
  AddToCurrentView: function (str, decimalCount, allowMultiZeroes) {
    
    if((str === '.' && decimalCount > 1) || !allowMultiZeroes) return; 

    this.currentDiv.textContent += str;
    this.UpdateNumbersHistory(this.currentDiv.textContent);
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
      // var decimalCount = 0;
      var allowMultiZeroes = false;

      return function (ev) {

        calc.opCanUse = true;
        calc.clearScreen = false;
        // save the operand history if it can
        if(calc.saveNum) {
          calc.historyIndex++;
          calc.saveNum = false;
          calc.currentDiv.textContent = "";
          calc.decimalCount = 0;
          calc.UpdateNumberHistoryCounter();
          
        }
        
        var text = ev.target.textContent;
        if(text === '.') {
          calc.decimalCount++;
          allowMultiZeroes = true;
        }

        if(text === "0" && !allowMultiZeroes)
          calc.AddToCurrentView(text, calc.decimalCount, allowMultiZeroes);
        else if(calc.currentDiv.textContent === "0" && text.match(/\d/g))
          calc.currentDiv.textContent = "";
        
        calc.AddToCurrentView(text, calc.decimalCount, true);

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
    
    // check if first result has been calculated
    if(this.resultsArray[0] === undefined) {
      operandA = parseFloat(this.numbersHistory[this.numHistoryIndex-1]);
      operandB = parseFloat(this.numbersHistory[this.numHistoryIndex]);
      
    }else { 
      operandA = parseFloat(this.resultsArray[this.resultsArrayIndex - 1]);
      operandB = parseFloat(this.numbersHistory[this.numHistoryIndex]);
    }
    
    var op = this._operator.operators[lastOperator];
    var result = this._operator.Operate(operandA, operandB, this._operator[op]);
    this.resultsArray[this.resultsArrayIndex++] = result;
    this.currentDiv.textContent = result;
    
    this.opReady = false;
    return result;
  },

  UpdateOperatorHistory : function (str) {
    if(this.opReady)
      this.UpdateOperatorHistoryIndex();
    
      this.opHistory[this.opHistoryIndex] = str;
  },

  UpdateOperatorHistoryIndex: function() {
    this.opHistoryIndex++;
  },

  OperatorListener: function () {
    function ObjRef(calc) {
      var localOperatorArray = [];
      
      return function (ev) {
        if(!calc.opCanUse) return;

        var target = ev.target,
            text = target.textContent,
            currentText = current.textContent;

        // check that basic operators are clicked
        var opMatch = text.match(/[+*/-]/g);
        // check that digits exist in the current div
        var digitMatch = currentText.match(/\d/);
        
        if(opMatch !== null && opMatch.length === 1) {
          calc.opBtnPressed = true;
          localOperatorArray.push(text);
          if(localOperatorArray.length > 2) localOperatorArray.shift();

          calc.UpdateOperatorHistory(text);
          calc.UpdateHistoryView();

          calc.saveNum = true;

          if(calc.opReady)
          {
            calc.CalculateResults(localOperatorArray[0]);
          }
          
        } else if(text === "+/-") {
          calc.FlipSign();
        } else if (text === "sqrt") {
          calc.CalculateSqrt();
        } else if( text === "=") {
          
          // return if not enough operands to perform
          if(calc.opHistory.length >= calc.numbersHistory.length) return;

          var result = calc.CalculateResults(localOperatorArray[1] || localOperatorArray[0]);
          calc.Reset();
          calc.resultsArray[0] = result;
          calc.resultsArrayIndex++;
          calc.currentDiv.textContent = "";
          calc.AddToCurrentView(result.toString(), calc.decimalCount, true);
        }
      }
    }

    this.operator.addEventListener("click", ObjRef(this));

    
  },
  CalculateSqrt: function () {
    // if(this.resultsArray[this.resultsArrayIndex] == undefined){
    var operand = Number(this.currentDiv.textContent);

    var op = this._operator.operators["sqrt"];
    var result = this._operator.Operate(operand, null, this._operator[op]);

    this.Reset();

    // this.resultsArray[this.resultsArrayIndex++] = result;
    this.resultsArray[0] = result;
    this.currentDiv.textContent = result;
    this.currentDiv.textContent = "";
    this.AddToCurrentView(result.toString(), this.decimalCount, true);
    // }
  },

  
  /**
   * @param  {} params
   * @description Flips the sign of the operand on screen
   */
  FlipSign: function (params) {
    if (this.opHistory.length == this.numbersHistory.length) return;

    var history = this.numbersHistory;
    var i = this.numHistoryIndex;
    var isMin = (history[i].toString().slice(0, 1) === "-");

    if (isMin) {
      history[i] = Number(history[i].toString().slice(1));

      this.currentDiv.textContent = history[i];
    } else {
      history[i] = Number("-" + history[i]);

      this.currentDiv.textContent = history[i];

    }
  },

  ControlsListener: function () {
    
    function ObjRef(calc) {
      
      return function (ev) {
        
        var text = ev.target.textContent;

        if(text === "C") {
          calc.Reset();
        } else if(text === "CE") {
          calc.ClearScreen();
        }

      }
    }

    this.controls.addEventListener("click", ObjRef(this));
  },

  ClearScreen: function() {
    this.currentDiv.textContent = "";
    this.opCanUse = false;
    this.decimalCount = 0;
    this.clearScreen = true;
  },

  Reset: function name() {
    this.numbersHistory = [0];
    this.numHistoryIndex = 0;
    this.opHistory = [];
    this.opHistoryIndex = 0;
  
    this.resultsArray = [];
    this.resultsArrayIndex = 0;
  
    this.result = 0;
    this._operator = new Operator(0,0);
    this.decimalCount = 0;
  
    this.saveNum = false;
    this.opBtnPressed = false;

    this.currentDiv.textContent = "0";
    this.historyDiv.textContent = "0";
    this.opCanUse = true;
    this.opReady = false;
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
  calculator.ControlsListener();

}
