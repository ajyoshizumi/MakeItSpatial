// -----------------------------------------------------------------------------
// CORE MODEL
// -----------------------------------------------------------------------------

// Define function to create a 2D array.
function make2dArray(cols, rows) {
  var arr = new Array(cols);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows)
  }
  return arr;
}


// Define key variables.
var grid;
var ncol;
var nrow;
var a = 10

// Define setup in which an array is created with "400/a" columns and rows.
// Each cell is "a" pixels wide and long.
function setup() {
  var canvas = createCanvas(400, 400);
  // Move the canvas so it is inside the <div id="abm">.
  canvas.parent("abm");
  nrow = floor(height / a);
  ncol = floor(width / a);
  grid = make2dArray(ncol, nrow)
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      grid[i][j] = new Cell(i*a, j*a, a);
    }
  }
}

// Create funtion to draw the cells.
function draw() {
  background(40);
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      grid[i][j].show();
    }
  }
}

// -----------------------------------------------------------------------------
// CELLS
// -----------------------------------------------------------------------------

// Define function that creates a single cell.
function Cell(x, y, a) {
  this.x = x;
  this.y = y;
  this.a = a;

  this.developed = false;
  this.agentLow = false;
  this.agentMed = false;
  this.agentHig = false;
}

// Define function that creates a rectangle to actually represent the cell.
Cell.prototype.show = function() {
  stroke(0);
  noFill();
  rect(this.x, this.y, this.a, this.a);

  if (this.developed) {
    fill(140);
    rect(this.x, this.y, this.a, this.a);
  } else if (!this.developed) {
    fill(100,250,100);
    rect(this.x, this.y, this.a, this.a);
    if (this.agentLow) {
      stroke(0);
      fill(55,94,151);
      ellipse(this.x + this.a * 0.5, this.y + this.a * 0.5, this.a * 0.5);
    } else if (this.agentMed) {
      stroke(0);
      fill(255,187,0);
      ellipse(this.x + this.a * 0.5, this.y + this.a * 0.5, this.a * 0.5);
    } else if (this.agentHig) {
      stroke(0);
      fill(251,101,66);
      ellipse(this.x + this.a * 0.5, this.y + this.a * 0.5, this.a * 0.5);
    }
  }
}

// Define function to assign agent based on the distribution selected by the user.


// Define function that allows for action on mouse click.
Cell.prototype.contains = function(x, y) {
  return (x > this.x && x < this.x + this.a && y > this.y && y < this.y + this.a);
}

// Define function that checks for mouse click and triggers action.
function mousePressed() {
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      if (grid[i][j].contains(mouseX, mouseY) && grid[i][j].developed == false) {
        grid[i][j].develop();
      } else if (grid[i][j].contains(mouseX, mouseY) && grid[i][j].developed == true) {
        grid[i][j].undevelop()
      }
    }
  }
}

// Define function to develop cell.
Cell.prototype.develop = function() {
  this.developed = true;
}

// Define function to undevelop cell.
Cell.prototype.undevelop = function() {
  this.developed = false;
}

// Define function to activate low, medium, and high agents.
Cell.prototype.assignAgent = function(type) {
  if (type == "low" || type == 0) {
    this.agentLow = true;
    this.agentMed = false;
    this.agentHig = false;
  } else if (type == "medium" || type == 1) {
    this.agentLow = false;
    this.agentMed = true;
    this.agentHig = false;
  } else if (type == "high" || type == 2) {
    this.agentLow = false;
    this.agentMed = false;
    this.agentHig = true;
  }
}

// -----------------------------------------------------------------------------
// MISCELLANEOUS
// -----------------------------------------------------------------------------

function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
