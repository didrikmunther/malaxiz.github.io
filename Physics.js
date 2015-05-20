// Physics.js

// Global variables
var fps = 30;
var gravity = [0, 0.2];
var debugTextSize = 10;

// Temporary variables
keys = [];
//var TextIndex = {ix,iy,iw,ih,icol,ivx,ivy};
var TextIndex = {
	ix: 0,
	iy: 1,
	ivx: 2,
	ivy: 3
};
var ObjectType = {
	PLAYER: 0,
	OBJECT: 1,
	WALL: 2,
	PICKUP: 3
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function TextObject(name, object, i, color) {
	this.name = name;
	this.object = object;
	this.i = i;
	this.font = debugTextSize + "px Arial";
	this.size = parseInt(this.font.substring(0, 2));
	this.color = color;
}
   TextObject.prototype.getText = function() {
   	switch(this.i){
   		case TextIndex.ix:
   			return this.object.getX();
   			break;
   		case TextIndex.iy:
   			return this.object.getY();
   			break;
   		case TextIndex.ivx:
   			return Math.floor(this.object.getXVel());
   			break;
   		case TextIndex.ivy:
   			return Math.floor(this.object.getYVel());
   			break;
   	}
   	return this.object;
}; TextObject.prototype.getName = function() {
	return this.name;
}; TextObject.prototype.getFont = function() {
	return this.font;
}; TextObject.prototype.getColor = function() {
	return this.color;
};

function PhysSquare(x, y, xWidth, yWidth, type, color, isStatic, isCollidable) {
	this.pos = [x, y];
	this.xWidth = xWidth;
	this.yWidth = yWidth;
	this.type = type;
	this.color = color;
	this.velVec = [0, 0];
	isStatic = typeof isStatic !== 'undefined' ? isStatic : false;
	this.isStatic = isStatic;
	isCollidable = typeof isCollidable !== 'undefined' ? isCollidable : true;
	this.isCollidable = isCollidable;
	this.rotation = 0;
	this.toBeDeleted = false;
	this.special = [];
}
   PhysSquare.prototype.getX = function() {
	return this.pos[0];
}; PhysSquare.prototype.getY = function() {
	return this.pos[1];
}; PhysSquare.prototype.getXWidth = function() {
	return this.xWidth;
}; PhysSquare.prototype.getYWidth = function() {
	return this.yWidth;
}; PhysSquare.prototype.getType = function() {
	return this.type;
}; PhysSquare.prototype.getColor = function() {
	return this.color;
}; PhysSquare.prototype.getXVel = function() {
	return this.velVec[0];
}; PhysSquare.prototype.getYVel = function() {
	return this.velVec[1];
}; PhysSquare.prototype.getRotation = function() {
	return this.rotation;
}; PhysSquare.prototype.getStatic = function() {
	return this.isStatic;
}; PhysSquare.prototype.deleteObj = function() {
	this.toBeDeleted = true;
}; PhysSquare.prototype.addX = function(x) {
	this.pos[0] += x;
}; PhysSquare.prototype.addY = function(y) {
	this.pos[1] += y;
}; PhysSquare.prototype.setX = function(x) {
	this.pos[0] = x;
}; PhysSquare.prototype.setY = function(y) {
	this.pos[1] = y;
}; PhysSquare.prototype.addVel = function(vel) {
	this.velVec[0] += vel[0];
	this.velVec[1] += vel[1];
}; PhysSquare.prototype.setXVel = function(x) {
	this.velVec[0] = x;
}; PhysSquare.prototype.setYVel = function(y) {
	this.velVec[1] = y;
}; PhysSquare.prototype.collisionEvent = function(object, object2) {
	switch(object2.type){
		case ObjectType.PLAYER:
			if(object.type == ObjectType.PICKUP) {
				for (i in object.special) eval(object2.special[i]);
				object.deleteObj();
				return 0;
			}
			return 1;
			break;
		case ObjectType.OBJECT:
			return 1;
			break;
		case ObjectType.WALL:
			return 1;
			break;
		case ObjectType.PICKUP:
			if(object.type == ObjectType.PLAYER) {
				//gravity[1] -= 0.01;
				for (i in object2.special) eval(object2.special[i]);
				object2.deleteObj();
				return 0;
			}
			return 1;
			break;
	}
}; PhysSquare.prototype.checkEntityCollision = function(object, object2) {
	if(object.getX() > object2.getX() + object2.getXWidth())
		return false;
	if(object.getX() + object.getXWidth() < object2.getX())
		return false;
	if(object.getY() > object2.getY() + object2.getYWidth())
		return false;
	if(object.getY() + object.getYWidth() < object2.getY())
		return false;

	//return [object.getX() - object2.getX(), object.getY() - object2.getY()];
	return true;
}; PhysSquare.prototype.checkCollision = function(x, y, objects) {

	for(var i = 0; i < objects.length; i++) {
		var object2 = objects[i];
		if (!object2.isCollidable || object2.toBeDeleted || object2 == this) continue;

		if(x > object2.getX() + object2.getXWidth())
			continue;
		else if(x + this.getXWidth() < object2.getX())
			continue;
		else if(y > object2.getY() + object2.getYWidth())
			continue;
		else if(y + this.getYWidth() < object2.getY())
			continue;
		else return this.collisionEvent(this, object2);

	}

	return false;

}; PhysSquare.prototype.move = function(objects) {

	if (this.isStatic) return;

	var MoveX = this.getXVel();
	var MoveY = this.getYVel();

	var StopX = this.getX();
	var StopY = this.getY();

	var NewX = 0;
	var NewY = 0;

	if(MoveX != 0) {
		if(MoveX >= 0) 	NewX =  1;
		else 			NewX = -1;
	}

	if(MoveY != 0) {
		if(MoveY >= 0) 	NewY =  1;
		else 			NewY = -1;
	}

	if(!this.isCollidable) {
		this.addX(MoveX);
		this.addY(MoveY);
		return;
	}

	while(true) {
		if(!this.checkCollision(StopX + NewX, StopY, objects)) {
			StopX += NewX;
			this.addX(NewX);
		} else {
			this.setXVel(0);
		}

		if(!this.checkCollision(StopX, StopY + NewY, objects)) {
			StopY += NewY;
			this.addY(NewY);
		} else {
			this.setYVel(0);
		}

		MoveX += -NewX;
		MoveY += -NewY;

		if(NewX > 0 && MoveX <= 0) NewX = 0;
		if(NewX < 0 && MoveX >= 0) NewX = 0;

		if(NewY > 0 && MoveY <= 0) NewY = 0;
		if(NewY < 0 && MoveY >= 0) NewY = 0;

		if(MoveX == 0) NewX = 0;
		if(MoveY == 0) NewY = 0;

		if(MoveX == 0 && MoveY == 0) 	break;
		if(NewX == 0 && NewY == 0) 		break;
	}
};

// GameEngine start

function GameEngine() {

	this.renderAll = function() {
		this.ctx.clearRect(0 , 0, this.c.width, this.c.height);

		for(var i = 0; i < this.objects.length; i++) {
			if(this.objects[i].toBeDeleted) continue;
			this.ctx.fillStyle = this.objects[i].getColor();
			//this.ctx.rotate(this.objects[i].getRotation());
			this.ctx.fillRect(this.objects[i].getX(), this.objects[i].getY(), this.objects[i].getXWidth(), this.objects[i].getYWidth());
		}

		for(var i = 0; i < this.textBuffer.length; i++) {
			var text = this.textBuffer[i];
			this.ctx.fillStyle = text.getColor();
			this.ctx.font = text.getFont();
			this.ctx.fillText(text.getName() + ": " + text.getText(), 1, text.size * (i + 1));
		}
	}

	this.updateAll = function() {
		var red = Math.floor((Math.random() * 255) + 1);
		var green = Math.floor((Math.random() * 255) + 1);
		var blue = Math.floor((Math.random() * 255) + 1);
		color = "rgb(" + red + "," + green + "," + blue + ")";
		while(true) {
			var tempSquare = new PhysSquare(Math.floor((Math.random() * 500) + 1), Math.floor((Math.random() * 100) + 1), Math.floor((Math.random() * 10) + 1), Math.floor((Math.random() * 10) + 1), ObjectType.PICKUP, color);		
			this.objects.push(tempSquare);
			if(tempSquare.checkCollision(tempSquare.getX(), tempSquare.getY(), this.objects)) {
				this.objects.pop();
			} else {
				break;
			}
		}	
		//tempSquare.special.push("gravity += [" Math.floor((Math.random() * 2) + 1) + ", " + Math.floor((Math.random() * 500) + 1) + "]"); 

		for(var i = 0; i < this.objects.length; i++) {
			var object = this.objects[i];

			if(object.toBeDeleted) {
				this.objects.splice(this.objects.indexOf(object), 1);
			}
			object.addVel(gravity);
			object.move(this.objects);
		}
	}

	this.keyEvent = function() {
		if(keys[39]) { // Right
			this.player.addVel([1, 0]);
		}
		if(keys[37]) { // Left
			this.player.addVel([-1, 0]);
		}
		if(keys[38]) { // Up
			this.player.addVel([0, -1]);
		}
		if(keys[40]) { // Down
			this.player.addVel([0, 1]);
		}
		if(keys[27]) {
			this.init();
		}
	}

	this.gameLoop = function() {
		this.keyEvent();
		this.updateAll();
		this.renderAll();
	}

	this.init = function() {
		
		document.body.addEventListener("keydown", function(e) {
			keys[e.keyCode] = true;
		});
		document.body.addEventListener("keyup", function(e) {
			keys[e.keyCode] = false;
		});

		this.c = document.getElementById("ctx")							// Get the canvas
		this.ctx = this.c.getContext("2d");								// Get the context of the canvas
		
		this.objects = [];

		// Walls
		this.objects.push(new PhysSquare(0, 0 - 1, this.c.width, 1, ObjectType.WALL, "#00FFFF", true));
		this.objects.push(new PhysSquare(0 - 1, 0, 1, this.c.height, ObjectType.WALL, "#00FFFF", true));
		this.objects.push(new PhysSquare(this.c.width, 0, 1, this.c.height, ObjectType.WALL, "#00FFFF", true));
		this.objects.push(new PhysSquare(0, 500, this.c.width, 1, ObjectType.WALL, "#00FFFF", true));

		this.player = new PhysSquare(100, 100, 10, 10, ObjectType.PLAYER, "#0F0F0F");
		this.objects.push(this.player);
		this.objects.push(new PhysSquare(300, 270, 100, 20, ObjectType.OBJECT, "#FF0000"));
		this.objects.push(new PhysSquare(300, 240, 100, 20, ObjectType.OBJECT, "#00FF00"));
		this.objects.push(new PhysSquare(300, 210, 100, 20, ObjectType.OBJECT, "#0000FF", true));

		this.objects.push(new PhysSquare(200, 240, 10, 10, ObjectType.PICKUP, "#FFFF00"));
		
		// this.getDegreesFromCenter = function() {

		// }
		this.objects.push(this.player);

		this.textBuffer = [];
		this.textBuffer.push(new TextObject("XPos", this.player, TextIndex.ix, "#000000"));
		this.textBuffer.push(new TextObject("YPos", this.player, TextIndex.iy, "#000000"));
		this.textBuffer.push(new TextObject("XVel", this.player, TextIndex.ivx, "#000000"));
		this.textBuffer.push(new TextObject("YVel", this.player, TextIndex.ivy, "#000000"));
	}

	this.init();
	var t = this;
	setInterval(function(){t.gameLoop();}, 1000/fps);
}

// GameEngine end



var gameEngine = new GameEngine();