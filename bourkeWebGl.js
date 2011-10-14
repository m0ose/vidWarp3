/*
 * 
 *  Webgl Warper
 *  (c) cody smith 2011
 * 
 */

var glShim;
var gl = null;
function glTemplate()
{

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
		__pickingPixels = null;
	}


	//_____________________________________
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


	/*
	 * 
	 *  VIDEO STUFF
	 * 
	 */
	var videoElement=null;
	var texInterval = null;
	this.videoPlaying = false;
	this.attachVideo = function( pathName)
	{
		this.detachAll();
		if(!pathName){
			pathName = "images/BrotherCanYouSpareAJob.ogv";
		}

		if(videoElement){
			videoDone();
		}

		videoElement = window.document.createElement("video");
		videoElement.control="controls";
		videoElement.style="display:none;";
		videoElement.loop = true;
		//videoElement.oncanplaythrough = startVideo;
		videoElement.onended = videoDone;
		videoElement.id="_video";
		var vidsrc= document.createElement("source");
		vidsrc.src= pathName;
		videoElement.appendChild( vidsrc);

		videoElement.addEventListener('durationchange', updateProgress, true);
		videoElement.addEventListener('progress', updateProgress, true);

		//videoElement.addEventListener("canplaythrough", startVideo , true);
		videoElement.addEventListener("ended", videoDone,true); 
		videoElement.addEventListener("canplay", startVideo,true); 
		this.videoPlaying = true;
	}
	function updateProgress(e)
	{
		console.log(this.seekable);
	}
	function updateTexture()
	{
		gl.bindTexture(gl.TEXTURE_2D, __BGL.texture);

		//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoElement);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		__BGL.postRedisplay();
	}
	function startVideo()
	{	
		console.log(" video loaded");
		videoElement.play();
		__BGL.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, __BGL.texture);

		updateTexture();
		texInterval = setInterval(updateTexture, 15);
	}
	function videoDone()
	{
			videoElement.currentTime=0;
			videoElement.pause();
			console.log("video stopping");
			clearInterval( texInterval);
			this.videoPlaying = false;
	}

	//	-----__________----------_____________------------__________
	//
	// Attach Canvas Element

	var myCanvasElement = null;
	this.canvasOn = false;
	this.attachCanvas = function( canvasElement)
	{
		this.detachAll();
		myCanvasElement = canvasElement;
		console.log(" attach canvas called");
		__BGL.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, __BGL.texture);
		texInterval = setInterval(updateCanvasTexture, 15);
		this.canvasOn = true;
	}
	function updateCanvasTexture()
	{
		gl.bindTexture(gl.TEXTURE_2D, __BGL.texture);
		//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, myCanvasElement);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		__BGL.postRedisplay();
	}
	this.detachCanvas = function()
	{
		console.log( "detaching canvas");
		clearInterval( texInterval);
		this.canvasOn = false;
	}

	this.detachAll = function()
	{
		if( this.videoPlaying)
			videoDone();
		if( this.canvasOn)
			this.detachCanvas();
	}

//	________________________________________________________________________

//	PICKING

//	usage onmouseMove( callback function)
//	this will pass the callback function an object with two members x and y
//	{ x:bla, y:blah}
//	x and y are between 0 and 1 . They are texture coordinates
//	example
	/*
	 __BGL.onMouseMove( 
			function(e){
				__mydot.perturbXY( e.x * __mydot.canvas.width, e.y * __mydot.canvas.height );
			});
	 */
	this.mouseMoveCallback = null;
	this.mouseClickCallback = null;
	this.__pickingPixels=null;

	this.onMouseMove = function( callback)
	{
		this.mouseMoveCallback = callback;
		//document.onmousemove = function(e)
		this.canvas.onmousemove = function(e)
		{
			var pxy = __BGL.pick(e.pageX, e.pageY);
			__BGL.mouseMoveCallback(pxy);
		}
	}


	this.onMouseClick = function( callback)
	{
		this.mouseClickCallback = callback;
		//document.onclick = function(e)
		this.canvas.onclick = function(e)
		{
			var pxy = __BGL.pick(e.pageX, e.pageY);
			__BGL.mouseClickCallback(pxy);
		}
	}

	function resetPicking()
	{
		__BGL.drawState=0;
		__BGL.display();
	}
	this.logging = true;
	function log( message)
	{
		if(this.logging)
			console.log(message);
	}
	this.pick = function(x_in, y_in)
	{
		if(!this.__pickingPixels)
		{
			this.drawState=1
			this.display();
			this.__pickingPixels = new Uint8Array( this.canvas.width * this.canvas.height * 4);
			gl.readPixels( 0, 0, this.canvas.width, this.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, this.__pickingPixels);
			log("changed picking buffer");
			setTimeout(resetPicking,20);
		}

		var x = Math.floor(x_in);
		var y = this.canvas.height - Math.floor(y_in);

		log("page x,y",x,y)

		var rIndex = 4*( this.canvas.width * y + x);
		//log("r index : "+rIndex);
		//?might be a cleaner way to do this?
		var r = this.__pickingPixels[ rIndex ];
		var g = this.__pickingPixels[ rIndex + 1 ];
		var b = this.__pickingPixels[ rIndex + 2 ];
		var a = this.__pickingPixels[ rIndex + 3 ];

		//picking x,y
		var px = (r/256.0) ;
		var py = (b/256.0) ;

		log("decoded x ", px, " y ", py);
		return({x:px, y:py});
	}


	return this;
}//end of glTemplate


