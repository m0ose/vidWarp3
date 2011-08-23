function bindKeysAndMouse()
{
	document.onkeypress = function( ev)
	{

		var ch = String.fromCharCode( ev.charCode );
		ch = ch.toLowerCase();
		//console.log(ch + ' pressed');

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

	}
}