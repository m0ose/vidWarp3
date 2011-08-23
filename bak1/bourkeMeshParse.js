/*
 * 
 * 
 *   Load and parse Paul Bourke's Warp-Mesh
 *     http://local.wasp.uwa.edu.au/~pbourke/dataformats/meshwarp/
 * 
 * 	cody smith . 2011
 *  m0ose at yahoo dot com
 * 
 * 
 * 
 */


function parseMap( st)
{
	this._verbose = false;
	this.inverted= true;

	this.type=0;
	this.width=0;
	this.height=0;
	this.xyVertices=null;
	this.uvVertices=null;
	this.alphas=[];
	this.uvTriangles = [];
	this.xyTriangles = [];
	this.alphaTriangles = [];

	this.parse = function(st)
	{
		var indexs = st.split( "\n");

		// eat empty lines or white space
		var firstRealLine = 0;
		for( var i=0; i < indexs.length && firstRealLine == 0; i++){
			var num = Number( indexs[i]);
			if(num && num > 0)
				firstRealLine = i;
		}
		console.log( firstRealLine);


		this.type =  Number(indexs[ firstRealLine]);

		//TODO: mesh is a seperate copy. that is wastefull( i think).
		var mesh = indexs.slice(firstRealLine + 2);//TAKE EVERYTHING AFTER THE FIRST TWO LINES
		var dimensionsString = indexs[firstRealLine + 1]; //PARSE DIMENSIONS FROM SECOND LINE
		this.dimensions = splitAtWhiteSpace( dimensionsString); 

		this.width = Number( this.dimensions[0]) ;
		this.height = Number( this.dimensions[1]) ;
		console.log(this.width + " " +  this.height);
		mesh2dArray = new Array( this.width );

		this.xyVertices = [];
		this.uvVertices = [];
		this.alphas = [];

		////
		////  parse the String into usable numbers	
		for( var x1 = 0; x1 < this.width; x1++)
		{
			mesh2dArray[x1] = new Array( this.height);
		}
		//
		//  Do the uv mapping with the triangles
		//
		//
		var index=0;
		for ( var n = 0 ; n < mesh.length; n++)
		{
			var tmp = mesh[n];//get a line
			var m = splitAtWhiteSpace(tmp);//split at white spaces

			if( m.length != 5){
				// THIS LINE DOES NOT LOOK RIGHT
				// SKIP IT. it's usually like an extra carrier return at the endof the page. 
				console.log ( "ERROR line length != 5 " + m + "   at line  " + n +" of bourke-mesh data file" );
			}
			else
			{
				//
				// get corrected x,y
				var xc = n % this.width;
				var yc = Math.floor( n/this.width);

				var cent =  splitAtWhiteSpace( mesh[n]);



				var x2 = Number(cent[0]) ;
				var y2 = Number(cent[1]) ;
				var u2 = Number(cent[2])  ;
				var v2 = Number(cent[3])   ;
				var alpha = Number(cent[4]);

				if( this.inverted ){
					y2 =   Number(cent[1]) 	
					v2 = 1 - Number(cent[3]) ;
				}

				var vert = {  x: x2, y: y2, u: u2 , v : v2 , i: alpha , index: Number(index) };

				//if( _verbose)
				//	_log += "\n x: " + vert.x + " y:"+ vert.y + " u:"+ vert.u +" v:"+ vert.v +" i:"+ vert.i +   " indx:"+ vert.index ; 

				mesh2dArray[xc][yc] = vert ;

				this.xyVertices.push( [x2,y2,0.0] );
				this.uvVertices.push( [u2,v2] );
				this.alphas.push(alpha);

				index++;
			}			
		}

		//
		// convert to triangles
		//  webgl accepts needs 3 points per triangle
		//
		if( this.xyVertices.length != this.height * this.width){
			console.log(' dimensions dont match number of vertices')
		}

		for( var x = 0; x < this.width - 1 ; x++)
		{
			for( var y = 0 ; y < this.height - 1; y++)
			{
				var nw = this.xyVertices[this.width * y + x];
				var se = this.xyVertices[(this.width * (y+1)) + (x+1) ];
				var sw = this.xyVertices[(this.width * (y+1)) + x ];
				var ne = this.xyVertices[this.width * y + (x+1)];
				
				var uvnw = this.uvVertices[this.width * y + x];
				var uvse = this.uvVertices[(this.width * (y+1)) + (x+1) ];
				var uvsw = this.uvVertices[(this.width * (y+1)) + x ];
				var uvne = this.uvVertices[this.width * y + (x + 1)];

				var anw = this.alphas[this.width * y + x];
				var ase = this.alphas[(this.width * (y+1)) + (x+1) ];
				var asw = this.alphas[(this.width * (y+1)) + x ];
				var ane = this.alphas[this.width * y + (x + 1)];

				//push triangles
				// NW .___. NE
				// 	  |\ T|      T = top triangle
				//    |B\ |	      B = bottom triangle
				// SW |__\| SE
				//
				try
				{
				//first: top triangle
					//xy
				this.xyTriangles.push( nw);
				this.xyTriangles.push( se);
				this.xyTriangles.push( sw);
				//uv
				this.uvTriangles.push( uvnw);
				this.uvTriangles.push( uvse);
				this.uvTriangles.push( uvsw);
				// bottom triangle
					//xy
				this.xyTriangles.push( nw);
				this.xyTriangles.push( ne);
				this.xyTriangles.push( se);
				//uv
				this.uvTriangles.push( uvnw);
				this.uvTriangles.push( uvne);
				this.uvTriangles.push( uvse);
				
				//alphas
				this.alphaTriangles.push( anw);
				this.alphaTriangles.push( ase);
				this.alphaTriangles.push( asw);
				this.alphaTriangles.push( anw);
				this.alphaTriangles.push( ane);
				this.alphaTriangles.push( ase);


				

				}
				catch(e)
				{
					var e2 = e;
					console.log(e);	
				}
			}
		}
	}

	if( st)
		this.parse(st);

	return this;
}
function splitAtWhiteSpace( s)
{
	return s.replace(/^\s+/,"").replace(/\s+$/,"").split(/\s+/);//split at white spaces
}