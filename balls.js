var __mydot = new dotzz();

function bee(hx,hy,r,c)
{
	this.dx = 1;//velocity and direction
	this.dy = 1;

	this.hx = hx;//home coordinates
	this.hy = hy;

	this.r = r;//radius

	this.c = c;//color

	this.x = Number(hx);// current coordinates
	this.y = Number(hy);

	return this
}

function dotzz()
{
	var c=document.getElementById('c');
	if( !c){
		c = document.createElement('canvas');
	}
	c.width = Wid = 512; 
	c.height = Hei = 512;
	this.canvas = c;
	var X=c.getContext('2d');


	var k = 0.01 ; //elastic rebound constant
	var friction = 0.05;
	var repulseForce = 10;
	var mouseX = 0;
	var mouseY = 0;
	var mouseDecay = 0;




	var hive = [ 
new bee(149, 194, 80, '#1100FF' ),  new bee(547, 191, 80, '#1100FF' ),  new bee(165, 209, 50, '#000003' ),  new bee(537, 217, 50, '#000003' ),  new bee(184, 186, 20, '#FFFFFF' ),  new bee(559, 188, 20, '#FFFFFF' ),  new bee(72, 377, 14, '#FF0000' ),  new bee(155, 382, 14, '#FF0000' ),  new bee(119, 454, 14, '#FF0000' ),  new bee(135, 321, 14, '#FF0000' ),  new bee(614, 371, 14, '#FF0000' ),  new bee(713, 317, 14, '#FF0000' ),  new bee(595, 324, 14, '#FF0000' ),  new bee(676, 396, 14, '#FF0000' ),  new bee(111, 380, 9, '#FF0000' ),  new bee(661, 302, 9, '#FF0000' ),  new bee(631, 439, 9, '#FF0000' ),  new bee(355, 375, 60, '#FF0000' ),  new bee(293, 402, 45, '#FF8800' ),  new bee(411, 405, 45, '#FF8800' ),  new bee(355, 385, 60, '#FF0000' )
];
	this.intervalID = null;
	this.init = function()
	{
		this.intervalID = setInterval ( "__mydot.loop()" , 30);

	}
	this.stop = function()
	{
		clearInterval( this.intervalID);
	}



	this.loop = function()
	{


		//fill background
		X.fillStyle = "rgba(255, 255, 255, 1.0)";// put black rectangle down
		X.fillRect( 0,0, Wid, Hei);
		for( n in hive)
		{
			b = hive[n];
			//
			//apply forces to the Bee
			displacement = Math.sqrt(  Math.pow(  b.x - b.hx , 2 ) + Math.pow(  b.y - b.hy , 2) )
			dispX = b.x - b.hx;
			dispY = b.y - b.hy;
			b.dx += -1*k * dispX;//elastic return
			b.dy += -1*k * dispY;
			b.dx = b.dx * (1-friction);//friction
			b.dy = b.dy * (1-friction);

			//
			// repulsive mouse force
			if( mouseDecay > 0)
			{

				mdx =  b.x - mouseX;
				mdy = b.y - mouseY;
				md = Math.sqrt( mdx * mdx + mdy * mdy); //displacement from mouse

				force =  1 / ( Math.pow( md/mouseDecay , 2) );
				b.dx += ( mdx / md ) * force;
				b.dy += ( mdy / md ) * force;

				mouseDecay-- ;
			}

			//
			//move
			b.x += b.dx;
			b.y += b.dy;

			//draw
			X.beginPath();
			X.strokeStyle = b.c;
			X.arc(b.x,b.y, b.r + displacement / 10 , 0 , 6.3, true);
			X.fillStyle = b.c;
			X.fill();
			X.stroke();
		}

	}

	this.perturb = function( e)
	{
		mouseDecay = 200 
		mouseX = e.clientX;
		mouseY = e.clientY;
	}
	this.perturbXY = function(x1,y1)
	{
		if(!Number(x1) || !Number(y1))
			return;
		if( x1 < 0 ||  y1 < 0)
			return;
		
		mouseDecay = 200; 
		mouseX = x1;
		mouseY = y1;
	}

	//init();
	return this;
}

