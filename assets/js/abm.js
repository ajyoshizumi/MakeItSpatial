// -----------------------------------------------------------------------------
// CORE MODEL
// -----------------------------------------------------------------------------

// Define key model variables.
var grid;
var ncol;
var nrow;
var a = 8;
var time = 0;
var play;

// Define key chart variables.
var tArray = [];
var dArray = [];
var lArray = [];
var mArray = [];
var hArray = [];

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
  createChart([0],[0],[0],[0],[0]);
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
      grid[i][j].countDevNeighbors();
    }
  }
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      var threshold = Math.random();
      if (!grid[i][j].developed) {
        if (grid[i][j].agentLow) {
          if (threshold < 0.001 + grid[i][j].devNeighbors/32) {
            grid[i][j].develop();
          }
        } else if (grid[i][j].agentMed) {
          if (threshold < 0.001 + grid[i][j].devNeighbors/16) {
            grid[i][j].develop();
          }
        } else if (grid[i][j].agentHig) {
          if (threshold < 0.001 + grid[i][j].devNeighbors/8) {
            grid[i][j].develop();
          }
        }
      }
    }
  }
  timeStep()
}

// Define function to count the total number of developed cells.

function countTotals(type, level) {
  var devTotal = 0;
  var agentLowTotal = 0;
  var agentMedTotal = 0;
  var agentHigTotal = 0;
  for (var i = 0; i < ncol; i++) {
    for (var j = 0; j < nrow; j++) {
      devTotal += Number(grid[i][j].developed)
      agentLowTotal += Number(grid[i][j].agentLow);
      agentMedTotal += Number(grid[i][j].agentMed);
      agentHigTotal += Number(grid[i][j].agentHig);
    }
  }
  if (type == "development") {
    return devTotal;
  } else if (type == "agent" && level == "low") {
    return agentLowTotal;
  } else if (type == "agent" && level == "medium") {
    return agentMedTotal;
  } else if (type == "agent" && level == "high") {
    return agentHigTotal;
  } else {
    return error("Invalid Entry");
  }
}

// Define function to store the total counts in each time period.
function updateChart() {
  // Store cell counts for given attributes in a given time period.
  var devTotal = countTotals("development");
  var lowTotal = countTotals("agent", "low");
  var medTotal = countTotals("agent", "medium");
  var higTotal = countTotals("agent", "high");
  // Store cell counts and time within an array.
  tArray[time] = time;
  dArray[time] = devTotal;
  lArray[time] = lowTotal;
  mArray[time] = medTotal;
  hArray[time] = higTotal;
  // Update chart.
  createChart(tArray,dArray,lArray,mArray,hArray);
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
  tArray = [];
  dArray = [];
  lArray = [];
  mArray = [];
  hArray = [];
  createChart([0],[0],[0],[0],[0]);
  clearTimeout(play);
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
  // Clear play variable to avoid simulataneous double activation.
  clearTimeout(play);
  play = setTimeout(function() {
    // Update chart.
    updateChart()
    // Count level of development.
    var devTotal = countTotals("development");
    // Next model step.
    modelStep();
    // Loop until development is complete.
    if(devTotal < nrow * ncol) {
      playModel();
    }
  }, 200)
}

// -----------------------------------------------------------------------------
// PLOTS
// -----------------------------------------------------------------------------

// Define function to draw chart when new data is added.
function createChart(timeArray,devArray,lowArray,medArray,higArray) {
  // Create development trace.
  var traceDev = {
    x: timeArray,
    y: devArray,
    mode: "lines+markers",
    name: "Development",
    marker: {
      color: "rgb(140,140,140)",
      size: 4,
      line: {
        color: "rgb(140,140,140)",
        width: 2
      }
    }
  }
  // Create low agent trace.
  var traceLow = {
    x: timeArray,
    y: lowArray,
    mode: "lines+markers",
    name: "Agent Low",
    marker: {
      color: "rgb(55,94,151)",
      size: 4,
      line: {
        color: "rgb(55,94,151)",
        width: 2
      }
    }
  }
  // Create medium agent trace.
  var traceMed = {
    x: timeArray,
    y: medArray,
    mode: "lines+markers",
    name: "Agent Medium",
    marker: {
      color: "rgb(255,187,0)",
      size: 4,
      line: {
        color: "rgb(255,187,0)",
        width: 2
      }
    }
  }
  // Create high agent trace.
  var traceHig = {
    x: timeArray,
    y: higArray,
    mode: "lines+markers",
    name: "Agent High",
    marker: {
      color: "rgb(251,101,66)",
      size: 4,
      line: {
        color: "rgb(251,101,66)",
        width: 2
      }
    }
  }
  // Define layout parameters.
  var layout = {
    width: 900,
    height: 500,
    xaxis: {
      range: [0,timeArray.length],
      title: "Time"
    },
    yaxis: {
      range: [0,2500],
      title: "Count"
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      color: "#FFFFFF"
    }
  }
  // Create variable to hold our chart parameters.
  var data = [traceDev, traceLow, traceMed, traceHig]
  // Plot chart.
  Plotly.newPlot("chart", data, layout)
}

// -----------------------------------------------------------------------------
// MISCELLANEOUS
// -----------------------------------------------------------------------------

// Define function to return a random integer between 0 and a specified value.
function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Define function to create a 2D array.
function make2dArray(cols, rows) {
  var arr = new Array(cols);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows)
  }
  return arr;
}
