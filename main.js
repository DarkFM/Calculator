function Calculator(){
  this.controls = document.getElementById("controls");
  this.numbers = document.getElementById("numbers");
  this.operator = document.getElementById("operators");
  this.currentDiv = document.getElementById("current");
  this.historyDiv = document.getElementById("history");
  this.history = "";
  this.op = null;
  // this.lastResult = 0;
  this.opBtnClicked = false;
  this.numBtnClicked = false;
  this.readyToSolve = false;
  this.resultOnScreen = false;
}

Calculator.prototype = {
  Init: function() {
    this.op = new Operator(0, 0);
    this.history = "";
    this.AddOperatorListener();
    this.AddNumbersListener();
  },

  AddOperatorListener : function() {

    function objRef(calc) {
      var operator = "";
      var tempHistory = "";
      var historySaved = false;
      var lastOperator = ["", ""];
      var index = 0;

      return function (ev) {
        var target = ev.target;
        var text = target.textContent;
        var current = calc.currentDiv;
        var currentText = current.textContent;
        // check that basic operators are clicked
        var opMatch = text.match(/[+*/-]/g);
        // check that digits exist in the current div
        var digitMatch = currentText.match(/\d/); 
        
        calc.opBtnClicked = true;

        if(opMatch !== null && opMatch.length === 1) {
          //save current operator
          operator = text;
          // store the last used index in the first array element
          lastOperator[index++ % 2] = operator;

          // grab contents of current div if digit exists
          if(digitMatch && !historySaved) {
            if(calc.resultOnScreen) {
              calc.history += " " + operator;
            } 
            else
              calc.history += currentText + " " + operator + " ";
            console.log(calc.history)
            console.log("Result on screen is " + calc.resultOnScreen)
            historySaved = true;
          } else if(digitMatch && historySaved) {
            if(calc.numBtnClicked && calc.readyToSolve)
            {
              calc.history += calc.operandB + " ";
              calc.numBtnClicked = false;
            } else
                calc.history = calc.history.slice(0, -2) + operator + " ";
            // console.log(calc.history)
          }


        }

        if(calc.readyToSolve) {
          var operator = calc.op.operators[lastOperator[0]];
          // if result was calculated before and this has not been set
          // use value on screen as replacement
          if(!calc.operandB) {
            calc.operandB = parseFloat(currentText);
            operator = calc.op.operators[text];
          }
          console.log(operator)
          var result = calc.op.Operate(
                calc.operandA,
                calc.operandB,
                calc.op[operator]
              );
              
          console.log("operandA: " + calc.operandA + "\noperandB: " + calc.operandB + "\nresult: " + result + "\n\n\n");
          calc.currentDiv.textContent = result;

          // reset state
          calc.operandB = null;
          calc.operandA = result;
          calc.readyToSolve = false;
          historySaved = false;
          calc.resultOnScreen = true;
          

          

        }
        calc.historyDiv.textContent = calc.history;
      }

    }

    this.operator.addEventListener("click", objRef(this))
  },


  AddNumbersListener: function () {
    
    function objRef(calc) {
      
      var tempOperand = "";
      var clearScreen = true;

      return function (ev) {
        var target = ev.target;
        var number = target.textContent;
        var current = calc.currentDiv;
        var currentText = current.textContent;

        calc.numBtnClicked = true;

        // clear zero if input entered
        if(currentText === "0") current.textContent = "";
        
        // console.log(calc.opBtnClicked)
        if(!calc.opBtnClicked) {
          tempOperand += number;
          if(calc.readyToSolve)
            calc.operandB = parseFloat(tempOperand)
          else 
            calc.operandA = parseFloat(tempOperand);
        } else if(calc.opBtnClicked) {

          if(clearScreen) {
            current.textContent = "";
            tempOperand = "";
          } else if(calc.resultOnScreen) {
            // calc.resultOnScreen = false;
            tempOperand = "";
            current.textContent = '';
          }
          clearScreen = false;
          tempOperand += number;
          calc.operandB = parseFloat(tempOperand);
          calc.readyToSolve = true;
        }

        current.textContent = tempOperand;
        
      }
    }

    this.numbers.addEventListener("click", objRef(this))
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
  Operate: function(a, b, operator) {
    this.operandA = a;
    this.operandB = b;
    this.result = operator(a, b);
    return this.result;
  },

  Add: function(a,b) {
    return a + b;
  },

  Subtract: function(a, b) {
    return a - b;
  },

  Multiply: function(a, b){
    return a * b;
  },

  Divide: function(a, b) {
    return a / b;
  },

  SquareRoot: function(a) {
    return Math.sqrt(a);
  },
  
}





window.onload = function Main() {
  var calculator = new Calculator();
  calculator.Init();
  // var 

}