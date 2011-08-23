var glShim;
var gl = null;
function glTemplate()
{
	//this.gl=null;
	//this.shaderProgam = null;



	this.vertices=[[-0.9, 1.0, 0.0], [0.9, 1.0, 0.0] , [-1.00, -1.0, 0.0],
	               [0.88, 1.0, 0.0], [0.97, -0.97, 0.0] , [-1.03, -1.0, 0.0]];//a square


	this.textureCoords = [[0.1	,0], [0.9,0], [0.1,1],
	                      [0.9 ,0], [0.9,1], [0.1,1] ];
	this.alphas = [1,1,1,1,1,1];

	this.triangleVertexPositionBuffer=null;
	this.textureCoordBuffer=null;
	this.alphasBuffer=null;

	this.textureImage = null;//could be private var
	this.texture=null;
	this.textureImageName="IMG_9187.JPG";

	this.preserveAspectRatio=true;
	this.aspectRatio = 1.0;

	this.textureMatrix = mat4.create();
	mat4.identity( this.textureMatrix );

	this.canvas=null;
	this.drawState = 0.0;


	this.webGLStart = function(){
		this.canvas = document.getElementById("canvas3d");
		if(!this.canvas)
		{
			console.log('couldnt find canvas');
		}
		window.onresize = this.resizeHandler;

		this.initGL(this.canvas);
		this.initShaders();
		this.initBuffers();
		this.initTextures();

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);

		this.display();


	}

	//
	//  called every so oftern
	//

	this.idle = function()
	{
		this.setMatrixUniforms();
		this.postRedisplay();
	}

	//
	// tell webgl to redisplay everything
	//
	this.postRedisplay = function()
	{
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
		gl.drawArrays(gl.TRIANGLES, 0, this.triangleVertexPositionBuffer.numItems);   
	}

	//
	// init some global veriables for openGL
	//
	this.initGL = function(canvas)
	{
		try {
			gl = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
			__BGL.canvas.width = document.body.clientWidth;
			__BGL.canvas.height = document.body.clientHeight;
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
		}
		catch (e) {
			console.log("trouble initialising canvas");
			console.log(e);
		}
		if (!gl) {
			console.log("Could not initialise WebGL, sorry :-(");
		}
		else
		{
			gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
			gl.clearDepth(1.0);                                     // Clear everything
			gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
			gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
		}
	}

	this.initTextures = function()
	{
		gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "uSampler"), 0);  
		this.texture = gl.createTexture();
		this.textureImage = new Image();
		this.textureImage.parentPointer = this;
		this.textureImage.onload = function() {
			//handleTextureLoaded(this.textureImage, this.texture, 0);
			console.log("texture image loaded");
			handleTextureLoaded(this, this.parentPointer.texture, 0);
			this.parentPointer.postRedisplay();
		}
		this.textureImage.src = this.textureImageName;
	}
	function handleTextureLoaded(image, texture, index) {
		// console.log("handleTextureLoaded, image = " + image);
		gl.activeTexture(gl.TEXTURE0 + index);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		//gl.generateMipmap(gl.TEXTURE_2D);

		//setMatrixUniforms();
	}
	this.initBuffers = function() {

		//init uniforms 
		//this.shaderProgram.textureMatrix = gl.getUniform( this.shaderProgram, "textureMatrix");
		this.shaderProgram.vTextureMatrix = gl.getUniformLocation( this.shaderProgram, "textureMatrix");
		if( ! this.shaderProgram.vTextureMatrix)
			console.log("f*ckin thing didnt find a uniform");
		this.shaderProgram.drawStateLoc = gl.getUniformLocation( this.shaderProgram, "drawState");
		gl.uniform1f( this.shaderProgram.drawStateLoc, this.drawState);



		//create buffers
		this.triangleVertexPositionBuffer = gl.createBuffer();

		//vertices
		gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleVertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( this.concatBuffer(this.vertices) ), gl.STATIC_DRAW);
		this.triangleVertexPositionBuffer.itemSize = this.vertices[0].length;
		this.triangleVertexPositionBuffer.numItems = this.vertices.length;
		gl.vertexAttribPointer( this.shaderProgram.vertexPositionAttribute, this.triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		//
		//alphas
		this.alphasBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.alphasBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( this.alphas ), gl.STATIC_DRAW);
		this.alphasBuffer.itemSize = 1;
		this.alphasBuffer.numItems = this.alphas.length;
		gl.vertexAttribPointer( this.shaderProgram.alphaAttribute, this.alphasBuffer.itemSize, gl.FLOAT, false, 0, 0);


		//
		//texture
		this.shaderProgram.vertexTextureAttribute = gl.getAttribLocation( this.shaderProgram, "texturePos");
		gl.enableVertexAttribArray( this.shaderProgram.vertexTextureAttribute);

		this.textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( this.concatBuffer(this.textureCoords) ), gl.STATIC_DRAW);
		this.textureCoordBuffer.itemSize = this.textureCoords[0].length;
		this.textureCoordBuffer.numItems = this.textureCoords.length;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
		gl.vertexAttribPointer(this.shaderProgram.textureCoordBuffer, this.textureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);


	}


	//	called when canvas is resized or initially sized
	//
	this.resizeHandler = function(e)
	{
		//console.log("resizing");

		__BGL.canvas.width = document.body.clientWidth;
		__BGL.canvas.height = document.body.clientHeight;
		gl.viewportWidth = __BGL.canvas.width;
		gl.viewportHeight = __BGL.canvas.height;

		//preserve aspect ratio of texture image
		if(__BGL.preserveAspectRatio){
			mat4.identity( __BGL.textureMatrix );
			var viewPortAspectR =  gl.viewportWidth / gl.viewportHeight;
			__BGL.aspectRatio = __BGL.textureImage.width / __BGL.textureImage.height;

			console.log("tx" + __BGL.aspectRatio + " vp " + viewPortAspectR);
		}




		__BGL.display();

	}
	this.display = function(){
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		this.setUniforms();
		this.postRedisplay();
	}

	window.onkeypress = function( ev)
	{


	}



//	init shader
//	http://lerningwebgl.com
	this.getShader = function( shaderId) {
		var shaderScript = document.getElementById(shaderId);
		if (!shaderScript) {
			console.log(shaderId);
			//console.log('get shader: invalid shaderId');
			return null;
		}

		var str = "";
		var k = shaderScript.firstChild;
		while (k) {
			if (k.nodeType == 3) {
				str += k.textContent;
			}
			k = k.nextSibling;
		}

		var shader;
		if (shaderScript.type == "x-shader/x-fragment") {
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		} else if (shaderScript.type == "x-shader/x-vertex") {
			shader = gl.createShader(gl.VERTEX_SHADER);
		} else {
			return null;
		}

		gl.shaderSource(shader, str);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	}

//	load shaders from main file and bind the buffers to the shaders.

	this.initShaders = function() {
		var fragmentShader = this.getShader( 'shader-fs');
		var vertexShader = this.getShader( "shader-vs");
		if(! fragmentShader ){
			console.log('fragment shader not loaded');
		}
		if(! vertexShader ){
			console.log('vertex shader not loaded');
		}

		this.shaderProgram = gl.createProgram();
		gl.attachShader(this.shaderProgram, vertexShader);
		gl.attachShader(this.shaderProgram, fragmentShader);
		gl.linkProgram(this.shaderProgram);

		if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
			console.log("Could not initialise shaders");
		}
		console.log( gl.LINK_STATUS);

		gl.useProgram(this.shaderProgram);

		this.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
		this.shaderProgram.alphaAttribute = gl.getAttribLocation(this.shaderProgram, "alpha");
		gl.enableVertexAttribArray(this.shaderProgram.alphaAttribute);
	}


//	send uniforms to the GPU

	this.setUniforms = function() {
		gl.uniformMatrix4fv( this.shaderProgram.vTextureMatrix, false, this.textureMatrix);
		gl.uniform1f( this.shaderProgram.drawStateLoc, this.drawState);

	}

	this.pick = function(x,y)
	{
		//
		this.drawState = 1;//picking state
		this.setUniforms();
		//switch buffers
		//draw to other buffer or something
		var pickedTexCoords = this.readPick(x,y);
		//decode read pixels
		//reset buffers
		//resetUniforms
		this.drawState=0;
		this.setUniforms();
		//	
	}
	this.readPick = function(x,y)
	{
		var buf = new Uint8Array( 4);
		var px = x;
		var py = this.canvas.height - y;
		gl.readPixels( px, py, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
		var r = buf[0];
		var g = buf[1];
		var b = buf[2];
		var a = buf[3];

		var xr = (r/256.0);
		var yr = (b/256.0);
		console.log(" x ", x, " y ", y);
		return {x:xr, y:yr};
	}

//	convert array of vectors to a long array of numbers

	this.concatBuffer = function( vecArray )
	{
		var result = [];

		for( i in vecArray){
			for( var j = 0 ; j < vecArray[i].length; j++)
			{
				result.push(vecArray[i][j])
			}
		}
		return result;

	}

	return this;

	//this.webGLStart();
}




