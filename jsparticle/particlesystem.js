function WinLoad(){




var canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/////-----Global variables-----/////
var particles = [];

var maxParticles = 20000; // experiment! 20,000 provides a nice galaxy

var emissionRate = 4; // how many particles are emitted each frame

var particleSize = 1;

var objectSize = 2;

var dragcoeff = 0.04;

var gravity = 150;
/////--------------------------/////




/*
function mousepos() {
    window.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        event = event || window.event; // IE-ism
        // event.clientX and event.clientY contain the mouse position
        mousePosition.x = event.clientX;
        mousePosition.y = event.clientY;
    }
}*/


/////-----Vector properties-------////
function Vector(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Vector.prototype.add = function(vector) {
  this.x += vector.x;
  this.y += vector.y;
}
 
// Gets the length of the vector
Vector.prototype.getMagnitude = function () {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
 
// Gets the angle accounting for the quadrant we're in
Vector.prototype.getAngle = function () {
  return Math.atan2(this.y,this.x);
};
 
// Allows us to get a new vector from angle and magnitude
Vector.fromAngle = function (angle, magnitude) {
  return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};
/////-----end of Vector properties-------////




/////-----Particle properties-------////
function Particle(point, velocity, acceleration, color) {
  this.position = point || new Vector(0, 0);
  this.velocity = velocity || new Vector(0, 0);
  this.acceleration = acceleration || new Vector(0, 0);
  this.color = color || "#090";
}

Particle.prototype.move = function () {
  // Add our current acceleration to our current velocity
  this.acceleration.x -= this.velocity.x * dragcoeff; //air resistance
  this.acceleration.y -= this.velocity.y * dragcoeff;  //air resistance

  this.velocity.add(this.acceleration);
 
  // Add our current velocity to our position
  this.position.add(this.velocity);
};

Particle.prototype.submitToFields = function (fields) {
  // our starting acceleration this frame
  var totalAccelerationX = 0;
  var totalAccelerationY = 0;
 
  // for each passed field
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
 
    // find the distance between the particle and the field
    var vectorX = field.position.x - this.position.x;
    var vectorY = field.position.y - this.position.y;

    var length = Math.sqrt(Math.pow(vectorX+vectorY,2));
 
    // calculate the force via MAGIC and HIGH SCHOOL SCIENCE!
    var force = field.mass / (5+vectorX*vectorX+vectorY*vectorY);

    // add to the total acceleration the force adjusted by distance
    totalAccelerationX += vectorX * force;
    totalAccelerationY += vectorY * force;
  }
 
  // update our particle's acceleration
  this.acceleration = new Vector(totalAccelerationX, totalAccelerationY);
};
/////-----end of Particle properties-------////


/////-----Emitter properties-------////
function Emitter(point, velocity, spread) {
  this.position = point; // Vector
  this.velocity = velocity; // Vector
  this.spread = spread || Math.PI / 32; // possible angles = velocity +/- spread
  this.drawColor = "#999"; // So we can tell them apart from Fields later
}


function randomRGB()
{
  return String('rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')');
}


Emitter.prototype.emitParticle = function() {
  // Use an angle randomized over the spread so we have more of a "spray"
  var angle = this.velocity.getAngle() + this.spread - (Math.random() * this.spread * 2);
 
  // The magnitude of the emitter's velocity
  var magnitude = this.velocity.getMagnitude();
 
  // The emitter's position
  var position = new Vector(this.position.x, this.position.y);
 
  // New velocity based off of the calculated angle and magnitude
  var velocity = Vector.fromAngle(angle, magnitude);

  var thecolor = randomRGB();
  
  //thecolor = 'rgb(0,255,0)'

  // return our new Particle!
  return new Particle(position,velocity, 0, thecolor);
};

// Add one emitter located at `{ x : 100, y : 230}` from the origin (top left)
// that emits at a velocity of `2` shooting out from the right (angle `0`)
var emitters = [];//[new Emitter(new Vector(canvas.width/2, 300), Vector.fromAngle(270*(Math.PI/180), 2), 4)];
/////-----end of Emitter properties-------////


//Using the emitter to create new particles until limit
function addNewParticles() {
  // if we're at our max, stop emitting.
  if (particles.length > maxParticles) return;
  
  for (var i=0; i<maxParticles; i++)
  {

    //var thecolor = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
    
    var particlecolor = '#0000FF';
    var theposition = new Vector((Math.random()*canvas.width), (Math.random()*canvas.height));

    var theParticle = new Particle(theposition, 0, 0, particlecolor);

    particles.push(theParticle);
  }

  // for each emitter
  /*for (var i = 0; i < emitters.length; i++) {
 
    // for [emissionRate], emit a particle
    for (var j = 0; j < emissionRate; j++) {
      particles.push(emitters[i].emitParticle());
    }
 
  }*/
}

//Calculates where new particles are supposed to be and updates 'particle' array
function plotParticles(boundsX, boundsY) {
  // a new array to hold particles within our bounds
  var currentParticles = [];
 
  for (var i = 0; i < particles.length; i++) {
    var particle = particles[i];
    var pos = particle.position;
 
    // If we're out of bounds, drop this particle and move on to the next
    //if (pos.x < 0 || pos.x > boundsX || pos.y < 0 || pos.y > boundsY) continue;
 	

 	  particle.submitToFields(fields);
    // Move our particles
    particle.move();
 
    // Add this particle to the list of current particles
    currentParticles.push(particle);
  }
 
  // Update our global particles, clearing room for old particles to be collected
  particles = currentParticles;
}


//draw each particle at it´s position
function drawParticles() {
  // For each particle
  for (var i = 0; i < particles.length; i++) {
    var position = particles[i].position;
    ctx.fillStyle = particles[i].color;
 
    // Draw a square at our position [particleSize] wide and tall
    ctx.fillRect(position.x, position.y, particleSize, particleSize);
  }
}

/////-----Field properties-------////
function Field(point, mass) {
  this.position = point;
  this.setMass(mass);
}
Field.prototype.setMass = function(mass) {
  this.mass = mass || 100;
  this.drawColor = mass < 0 ? "#f00" : "#0f0";
}

var fields = [new Field(new Vector(0, 0), gravity)];
/////-----end of Field properties-------////


function drawCircle(object) {
  ctx.fillStyle = object.drawColor;
  ctx.beginPath();
  ctx.arc(object.position.x, object.position.y, objectSize, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

//clear the canvas
function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//update particle system
function update() {

	plotParticles(canvas.width, canvas.height);
}

//draw particles
function draw() {
	drawParticles();
	fields.forEach(drawCircle);
 	emitters.forEach(drawCircle);
}


 canvas.addEventListener('mousemove', function(e) {
    fields[0].position = new Vector(e.clientX, e.clientY);

  }, false);

//rendering loop
function loop() {
  clear();
  update();
  draw();
  queue();
}

//request to do animation then run the function loop again. ~60 times per sec
function queue() {
  window.requestAnimationFrame(loop);
}

//runs the rendering loop
addNewParticles();
loop();

 }
 window.onload=WinLoad;