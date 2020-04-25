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
var a = 8;
var time = 0;

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
      grid[i][j] = new Cell(i, j, a);
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

// Create function to move time forward.
function timeStep() {
  time++;
}

// Define function that passes one step through the model.
function modelStep() {
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      var threshold = Math.random();
      if (!grid[i][j].developed) {
        grid[i][j].countDevNeighbors();
        if (grid[i][j].agentLow) {
          if (threshold < 0.045 * grid[i][j].devNeighbors) {
            grid[i][j].develop();
          }
        } else if (grid[i][j].agentMed) {
          if (threshold < 0.085 * grid[i][j].devNeighbors) {
            grid[i][j].develop();
          }
        } else if (grid[i][j].agentHig) {
          if (threshold < 0.125 * grid[i][j].devNeighbors) {
            grid[i][j].develop();
          }
        }
      }
    }
  }
  timeStep()
}

// -----------------------------------------------------------------------------
// CELLS
// -----------------------------------------------------------------------------

// Define function that creates a single cell.
function Cell(i, j, a) {
  this.i = i;
  this.j = j;
  this.x = i*a;
  this.y = j*a;
  this.a = a;

  this.developed = false;
  this.agentLow = false;
  this.agentMed = false;
  this.agentHig = false;
  this.devNeighbors = 0;
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
      stroke(55,94,151);
      fill(55,94,151);
      ellipse(this.x + this.a * 0.5, this.y + this.a * 0.5, this.a * 0.5);
    } else if (this.agentMed) {
      stroke(255,187,0);
      fill(255,187,0);
      ellipse(this.x + this.a * 0.5, this.y + this.a * 0.5, this.a * 0.5);
    } else if (this.agentHig) {
      stroke(251,101,66);
      fill(251,101,66);
      ellipse(this.x + this.a * 0.5, this.y + this.a * 0.5, this.a * 0.5);
    }
  }
}

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
  this.agentLow = false;
  this.agentMed = false;
  this.agentHig = false;
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

// Create function to count developed cell neighbors.
Cell.prototype.countDevNeighbors = function() {
  var total = 0;
  for (var xoff = -1; xoff <= 1; xoff++) {
    var i = this.i + xoff;
    if (i < 0 || i >= ncol) continue;

    for (var yoff = -1; yoff <= 1; yoff++) {
      var j = this.j + yoff;
      if (j < 0 || j >= nrow) continue;

        var neighbor = grid[i][j];
        if (neighbor.developed) {
          total++;
        }
    }
  }
    this.devNeighbors = total;
}


// -----------------------------------------------------------------------------
// MISCELLANEOUS
// -----------------------------------------------------------------------------

function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// -----------------------------------------------------------------------------
// INTERACTIVE ELEMENTS
// -----------------------------------------------------------------------------

// Provide variable to allow for cluster modification.
var sliderDevSen = document.getElementById("clusterDevSen");
var sliderDevLev = document.getElementById("clusterDevLev");
var sliderAgnt = document.getElementById("clusterAgnt");

// Create function to randomize development.
function randomDevelopment() {
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      grid[i][j].undevelop();
    }
  }
  var level = sliderDevLev.value/10;
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      if (Math.random() <= level) {
        grid[i][j].develop();
      } else {
        continue
      }
    }
  }
}

// Create function to cluster development.
function clusterDevelopment() {
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      grid[i][j].undevelop();
    }
  }
  var sensitivity = sliderDevSen.value;
  var level = sliderDevLev.value/10;
  p5.prototype.noiseSeed(Math.round(Math.random()*100));
  for (var i = 0; i < ncol; i++){
    for (var j = 0; j < nrow; j++){
      var val = p5.prototype.noise(i/sensitivity, j/sensitivity, 1.0);
      if (val <= level) {
        grid[i][j].develop();
      } else {
        continue
      }
    }
  }
}

// Create function to randomly assign agents.
function randomAgents() {
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      grid[i][j].agentLow = false;
      grid[i][j].agentMed = false;
      grid[i][j].agentHig = false;
    }
  }
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      if (!grid[i][j].developed) {
        grid[i][j].assignAgent(randomInt(3));
      } else {
        continue;
      }
    }
  }
}

// Create function to randomly assign agents in clusters.
function clusterAgents() {
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      grid[i][j].agentLow = false;
      grid[i][j].agentMed = false;
      grid[i][j].agentHig = false;
    }
  }
  var sensitivity = sliderAgnt.value;
  p5.prototype.noiseSeed(Math.round(Math.random()*100));
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      if (!grid[i][j].developed) {
        var val = p5.prototype.noise(i/sensitivity, j/sensitivity, 1.0);
        if (val <= 0.33) {
          grid[i][j].assignAgent(0);
        } else if (val <= 0.66) {
          grid[i][j].assignAgent(1);
        } else if (val <= 1.00) {
          grid[i][j].assignAgent(2);
        }
      } else {
        continue;
      }
    }
  }
}

// Define function to clear the simulation.
function clearSim() {
  time = 0;
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      grid[i][j].developed = false;
      grid[i][j].agentLow = false;
      grid[i][j].agentMed = false;
      grid[i][j].agentHig = false;
    }
  }
}

// Define function to play the model.
function playModel() {
  modelStep()
}
