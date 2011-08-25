var __mouseState = { dragging:false, px:0, py:0};
function bindKeysAndMouse()
{
	document.onmousedown = function(e)
	{
		__mouseState.dragging = true;
		__mouseState.px = e.pageX;
		__mouseState.py = e.pageY;
	}
	document.onmouseup = document.onmouseout = function(e)
	{
		if( __mouseState.dragging)
			__BGL.__pickingPixels = null;

		__mouseState.dragging = false;
	}
	document.onmousemove = function(e)
	{
		if( __mouseState.dragging){
			//console.log("dragging");
			var dx = __mouseState.px - e.pageX;
			var dy = __mouseState.py - e.pageY;
			var dxn = dx / document.body.clientWidth;
			var dyn = dy / document.body.clientHeight;
			
			var tmp = vec3.create();
			tmp[0] = dxn; tmp[1]=dyn; tmp[2]=0;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);

			//console.log(dxn, dyn);
			__mouseState.px = e.pageX;
			__mouseState.py = e.pageY;
						
			__BGL.setUniforms();
			__BGL.postRedisplay();
		}
	}
	document.onmousewheel = function(e)
	{
		var delta = 1.0 - e.wheelDelta/1000;

		var tmp = vec3.create();
		tmp[0] = 0.0; tmp[1]=0; tmp[2]=0;

		//console.log(delta);
		tmp[1] = tmp[0] = 0.5 ;
		mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);
		tmp[0] = tmp[1] = delta;
		mat4.scale( __BGL.textureMatrix, tmp, __BGL.textureMatrix);
		tmp[1] = tmp[0] = -0.5 ;
		mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);

		__BGL.setUniforms();
		__BGL.postRedisplay();
	}
	
	document.onkeypress = function( ev)
	{

		var ch = String.fromCharCode( ev.charCode );
		ch = ch.toLowerCase();
		//log(ch + ' pressed');

		var tmp = vec3.create();
		tmp[0] = 0.0; tmp[1]=0; tmp[2]=0;


		if( ch == 'a'){//left
			tmp[0] = 0.02;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);

		}
		if( ch == 's'){//down
			tmp[1] = -0.02;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);

		}
		if( ch == 'd'){//right
			tmp[0] = -0.02;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);
		}
		if( ch == 'w'){//up
			tmp[1] = 0.02;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);
		}
		if( ch == '-' || ch == '_'){//scale down
			tmp[1] = tmp[0] = 0.5 ;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);
			tmp[0] = tmp[1] = 1.03;
			mat4.scale( __BGL.textureMatrix, tmp, __BGL.textureMatrix);
			tmp[1] = tmp[0] = -0.5 ;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);

		}
		if( ch == '+' || ch == '='){//scale up
			tmp[1] = tmp[0] = 0.5 ;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);
			tmp[0] = tmp[1] = 0.97;
			mat4.scale( __BGL.textureMatrix, tmp, __BGL.textureMatrix);
			tmp[1] = tmp[0] = -0.5 ;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);

		}
		if( ch == 'k'){//rotate ccw
			tmp[1] = tmp[0] = 0.5 ;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);
			mat4.rotateZ( __BGL.textureMatrix,0.1, __BGL.textureMatrix);
			tmp[1] = tmp[0] = -0.5 ;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);
		}
		if( ch == 'l'){//rotate cw
			tmp[1] = tmp[0] = 0.5 ;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);
			mat4.rotateZ( __BGL.textureMatrix,-0.1, __BGL.textureMatrix);
			tmp[1] = tmp[0] = -0.5 ;
			mat4.translate(__BGL.textureMatrix, tmp, __BGL.textureMatrix);
		}
		__BGL.setUniforms();
		__BGL.postRedisplay();
		__BGL.__pickingPixels = null;
	}
	return this;
}