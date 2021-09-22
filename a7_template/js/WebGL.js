/**
 * WEBGL is a set of functions that draw the points on canvas.
 */

function WebGL (canvas, gl_context) {

	this.canvas = canvas;
	this.gl = gl_context;

	this.fieldOfViewRadians = 60 * Math.PI / 180;
	this.cameraPosition = new Vector3D(0.0, 0.0, -3.0);
	this.cameraTarget = new Vector3D(0.0, 0.0, 0.0);
	this.cameraUp = new Vector3D(0.0, 1.0, 0.0);

	this.lightDirection = [0.0, 100.0, -100.0];

	this.modelMatrix = MatrixMath.identity();
	this.viewMatrix = MatrixMath.identity();
	this.rotationMatrix = MatrixMath.identity();

	this.setup = function () {

		// Create and link all shaders and programs
		const shaderSet = [
			{
				type: this.gl.VERTEX_SHADER,
				id: "vertex-shader"
			},
			{
				type: this.gl.FRAGMENT_SHADER,
				id: "fragment-shader"
			}
		]
		this.shaderProgram = this.buildShaderProgram(shaderSet);

		// Look up attributes locations
		this.vertexPosition = this.gl.getAttribLocation(this.shaderProgram, "vertexPosition");
		this.normalPosition = this.gl.getAttribLocation(this.shaderProgram, "vertexNormal");

		this.projectionMLocation = this.gl.getUniformLocation(this.shaderProgram, "projectionMatrix");
		this.viewMLocation = this.gl.getUniformLocation(this.shaderProgram, "viewMatrix");
		this.modelMLocation = this.gl.getUniformLocation(this.shaderProgram, "modelMatrix");

		this.colorLocation = this.gl.getUniformLocation(this.shaderProgram, "color");
		this.lightDirectionLocation = this.gl.getUniformLocation(this.shaderProgram, "lightDirection");

		// Create vertex buffer
		this.vertexBuffer = this.gl.createBuffer();

		// Create normal buffer
		this.normalBuffer = this.gl.createBuffer();

		// Set up wireframe shaders
		const shaderSet_line = [
			{
				type: this.gl.VERTEX_SHADER,
				id: "vertex-shader-line"
			},
			{
				type: this.gl.FRAGMENT_SHADER,
				id: "fragment-shader-line"
			}
		]
		this.shaderProgram_line = this.buildShaderProgram(shaderSet_line);

		// Look up attributes locations
		this.vertexPosition_line = this.gl.getAttribLocation(this.shaderProgram_line, "vertexPosition");
		
		this.projectionMLocation_line = this.gl.getUniformLocation(this.shaderProgram_line, "projectionMatrix");
		this.viewMLocation_line = this.gl.getUniformLocation(this.shaderProgram_line, "viewMatrix");
		this.modelMLocation_line = this.gl.getUniformLocation(this.shaderProgram_line, "modelMatrix");
		
		this.colorLocation_line = this.gl.getUniformLocation(this.shaderProgram_line, "color");

		// Create vertex buffer
		this.vertexBuffer_line = this.gl.createBuffer();
	};

	this.buildShaderProgram = function (shaderInfo) {
		var program = this.gl.createProgram();
	  
		shaderInfo.forEach(elment=> {
			var shader = this.compileShader(elment.id, elment.type);
	  
			if (shader) {
				this.gl.attachShader(program, shader);
		  	}
		});
	  
		this.gl.linkProgram(program)
		
		var success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
		if (success) {
			console.log("Successfully link shader program!");
		}
		else {
			console.log("Error linking shader program:");
			console.log(this.gl.getProgramInfoLog(program));
		}
	  
		return program;
	};

	this.compileShader = function (id, type) {
		var code = document.getElementById(id).firstChild.nodeValue;

		var shader = this.gl.createShader(type);
	  
		this.gl.shaderSource(shader, code);
		this.gl.compileShader(shader);

		var success = this.gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) {
			console.log(`Successfully compile ${type === this.gl.VERTEX_SHADER ? "vertex" : "fragment"} shader!`);
		}
		else {
			console.log(`Error compiling ${type === this.gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
		  	console.log(this.gl.getShaderInfoLog(shader));
		}
		
		return shader;
	};
	
	// Setup before the drawing
	this.drawSetup = function () {
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

		// Set the background to be grey
		this.gl.clearColor(0.9, 0.9, 0.9, 1.0);
		// Clear the color buffer with specified clear color
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		this.gl.enable(this.gl.CULL_FACE);
		this.gl.cullFace(this.gl.BACK);
		this.gl.enable(this.gl.DEPTH_TEST);
	};

	// Setup the camera
	this.cameraSetup = function() {
		// Compute projection matrix
		var aspect = this.canvas.width / this.canvas.height;
		var zNear = 0.1;
		var zFar = 1000;
		var projectionMatrix = MatrixMath.perspective(this.fieldOfViewRadians, aspect, zNear, zFar);
		//console.log("projectionM: " + projectionMatrix);
		
		// Compute lookAt matrix
		this.viewMatrix = MatrixMath.lookAt(this.cameraPosition, this.cameraTarget, this.cameraUp);
		//console.log("viewMatrix: " + this.viewMatrix);

		this.gl.useProgram(this.shaderProgram);
		this.gl.uniformMatrix4fv(this.projectionMLocation, false, projectionMatrix);
		this.gl.uniformMatrix4fv(this.viewMLocation, false, this.viewMatrix);

		this.gl.useProgram(this.shaderProgram_line);
		this.gl.uniformMatrix4fv(this.projectionMLocation_line, false, projectionMatrix);
		this.gl.uniformMatrix4fv(this.viewMLocation_line, false, this.viewMatrix);
	};

	// Translate the model to origin
	this.modelSetup = function (m) {
		var centroid = m.getCentroid();
		this.modelMatrix = MatrixMath.translation(-centroid.value[0], -centroid.value[1], -centroid.value[2]);
		this.modelMatrix = MatrixMath.multiply(this.rotationMatrix, this.modelMatrix);

		this.gl.useProgram(this.shaderProgram);
		this.gl.uniformMatrix4fv(this.modelMLocation, false, this.modelMatrix);

		this.gl.useProgram(this.shaderProgram_line);
		this.gl.uniformMatrix4fv(this.modelMLocation_line, false, this.modelMatrix);
	};

	// Rotate the scene
	this.rotateScene = function (dx, dy) {
		var rotateX = MatrixMath.xRotation(dx);
		var rotateY = MatrixMath.yRotation(dy);

		this.modelMatrix = MatrixMath.multiply(rotateX, this.modelMatrix);
		this.modelMatrix = MatrixMath.multiply(rotateY, this.modelMatrix);
		
		this.rotationMatrix = MatrixMath.multiply(rotateX, this.rotationMatrix);
		this.rotationMatrix = MatrixMath.multiply(rotateY, this.rotationMatrix);

		this.gl.useProgram(this.shaderProgram);
		this.gl.uniformMatrix4fv(this.modelMLocation, false, this.modelMatrix);

		this.gl.useProgram(this.shaderProgram_line);
		this.gl.uniformMatrix4fv(this.modelMLocation_line, false, this.modelMatrix);
	};

	// Zoom in / Zoom out
	this.zoom = function (dz) {
		this.cameraPosition.value[2] += dz;

		this.viewMatrix = MatrixMath.lookAt(this.cameraPosition, this.cameraTarget, this.cameraUp);
		
		this.gl.useProgram(this.shaderProgram);
		this.gl.uniformMatrix4fv(this.viewMLocation, false, this.viewMatrix);

		this.gl.useProgram(this.shaderProgram_line);
		this.gl.uniformMatrix4fv(this.viewMLocation_line, false, this.viewMatrix);
	};

	// Draw current mesh
	this.drawMesh = function (m) {
		var faces = m.getFaces();
		var normals = m.getNormals();

		var posArray = [];
		var lineArray = [];
		var normalArray = [];

		for (var i = 0; i < faces.length; i++) {
			var he = faces[i].getEdge();

			var origin = he.getOrigin();
			var next = he.getNext().getOrigin();
			var prev = he.getPrev().getOrigin();

			var origin_pos = origin.getPos();
			var next_pos = next.getPos();
			var prev_pos = prev.getPos();

			var origin_idx = origin.getId();
			var next_idx = next.getId();
			var prev_idx = prev.getId();

			//console.log(origin_pos.value);
			//console.log(next_pos.value);
			//console.log(prev_pos.value);

			posArray.push(origin_pos.value[0]); posArray.push(origin_pos.value[1]); posArray.push(origin_pos.value[2]);
			posArray.push(next_pos.value[0]);   posArray.push(next_pos.value[1]);   posArray.push(next_pos.value[2]);
			posArray.push(prev_pos.value[0]);   posArray.push(prev_pos.value[1]);   posArray.push(prev_pos.value[2]);

			normalArray.push(normals[origin_idx].x()); normalArray.push(normals[origin_idx].y()); normalArray.push(normals[origin_idx].z());
			normalArray.push(normals[next_idx].x());   normalArray.push(normals[next_idx].y());   normalArray.push(normals[next_idx].z());
			normalArray.push(normals[prev_idx].x());   normalArray.push(normals[prev_idx].y());   normalArray.push(normals[prev_idx].z());

			lineArray.push(origin_pos.value[0]); lineArray.push(origin_pos.value[1]); lineArray.push(origin_pos.value[2]);
			lineArray.push(next_pos.value[0]);   lineArray.push(next_pos.value[1]);   lineArray.push(next_pos.value[2]);

			lineArray.push(next_pos.value[0]);   lineArray.push(next_pos.value[1]);   lineArray.push(next_pos.value[2]);
			lineArray.push(prev_pos.value[0]);   lineArray.push(prev_pos.value[1]);   lineArray.push(prev_pos.value[2]);
			
			lineArray.push(prev_pos.value[0]);   lineArray.push(prev_pos.value[1]);   lineArray.push(prev_pos.value[2]);
			lineArray.push(origin_pos.value[0]); lineArray.push(origin_pos.value[1]); lineArray.push(origin_pos.value[2]);
		}

		// Draw wireframe
		var lineVertexArray = new Float32Array(lineArray);
		//console.log(lineVertexArray);
		
		this.gl.useProgram(this.shaderProgram_line);
		this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer_line);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, lineVertexArray, this.gl.STATIC_DRAW);
		var lineVertexCount = lineVertexArray.length / 3;
				
		this.gl.enableVertexAttribArray(this.vertexPosition_line);
		this.gl.vertexAttribPointer(this.vertexPosition_line, 3, this.gl.FLOAT, false, 0, 0);
				
		this.gl.uniform3fv(this.colorLocation_line, [0.0, 0.0, 0.0]);	
		this.gl.drawArrays(this.gl.LINES, 0, lineVertexCount);
		
		this.gl.useProgram(this.shaderProgram);
		// Pass normal
		var vNormalArray = new Float32Array(normalArray);
		this.gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vNormalArray, this.gl.STATIC_DRAW);
		this.gl.enableVertexAttribArray(this.normalPosition);
		this.gl.vertexAttribPointer(this.normalPosition, 3, this.gl.FLOAT, false, 0, 0);

		// Draw face
		var vertexArray = new Float32Array(posArray);
		//console.log(vertexArray);

		this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexArray, this.gl.STATIC_DRAW);
		var vertexCount = vertexArray.length / 3;
		
		this.gl.enableVertexAttribArray(this.vertexPosition);
		this.gl.vertexAttribPointer(this.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
		
		this.gl.uniform3fv(this.colorLocation, [1.0, 1.0, 1.0]);
		this.gl.uniform3fv(this.lightDirectionLocation, this.lightDirection);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, vertexCount);
	};
};
