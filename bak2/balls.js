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
	c.width = Wid = 900; 
	c.height = Hei = 500;
	this.canvas = c;
	var X=c.getContext('2d');


	var k = 0.01 ; //elastic rebound constant
	var friction = 0.01;
	var repulseForce = 10;
	var mouseX = 0;
	var mouseY = 0;
	var mouseDecay = 0;




	var hive = [ new bee(258, 168, 8, '#000000' ),  new bee(51, 174, 8, '#000000' ),  new bee(264, 349, 8, '#000000' ),  new bee(59, 351, 8, '#000000' ),  new bee(176, 429, 8, '#000000' ),  new bee(150, 60, 8, '#000000' ),  new bee(335, 47, 8, '#000000' ),  new bee(346, 420, 8, '#000000' ),  new bee(541, 41, 8, '#000000' ),  new bee(508, 203, 8, '#000000' ),  new bee(469, 432, 8, '#787878' ),  new bee(568, 431, 8, '#787878' ),  new bee(687, 431, 8, '#787878' ),  new bee(714, 435, 8, '#FF2B2B' ),  new bee(811, 312, 8, '#FF2B2B' ),  new bee(882, 213, 8, '#FF2B2B' ),  new bee(675, 208, 8, '#FF2B2B' ),  new bee(888, 433, 8, '#FF2B2B' ),  new bee(754, 271, 14, '#FF2B2B' ),  new bee(898, 195, 14, '#FF2B2B' ),  new bee(851, 367, 6, '#FF2B2B' ),  new bee(752, 374, 6, '#FF2B2B' ),  new bee(848, 351, 18, '#FF2B2B' ),  new bee(693, 217, 18, '#FF2B2B' ),  new bee(343, 284, 18, '#000000' ),  new bee(339, 204, 18, '#000000' ),  new bee(449, 46, 18, '#000000' ),  new bee(120, 407, 18, '#000000' ),  new bee(149, 243, 18, '#000000' ),  new bee(215, 105, 18, '#000000' ),  new bee(82, 103, 5, '#000000' ),  new bee(235, 320, 19, '#000000' ),  new bee(340, 349, 19, '#000000' ),  new bee(326, 66, 19, '#000000' ),  new bee(247, 195, 6, '#000000' ),  new bee(62, 312, 6, '#000000' ),  new bee(91, 202, 6, '#000000' ),  new bee(227, 395, 6, '#000000' ),  new bee(334, 119, 6, '#000000' ),  new bee(413, 203, 6, '#000000' ),  new bee(401, 51, 6, '#000000' ),  new bee(534, 63, 6, '#000000' ),  new bee(462, 210, 6, '#000000' ),  new bee(338, 157, 11, '#000000' ),  new bee(70, 120, 11, '#000000' ),  new bee(526, 430, 11, '#999999' ),  new bee(629, 429, 11, '#999999' ),  new bee(585, 429, 11, '#BBBBBB' ),  new bee(661, 430, 11, '#BBBBBB' ),  new bee(847, 264, 11, '#FF0000' ),  new bee(774, 352, 11, '#FF0000' ),  new bee(722, 412, 11, '#FF0000' ) ] ;

	function init()
	{
		setInterval ( "__mydot.loop()" , 50);

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
			b.dx = b.dx * (1-friction*b.r);//friction
			b.dy = b.dy * (1-friction*b.r);

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
			X.strokeStyle = b.c;
			X.beginPath();
			X.arc(b.x,b.y, b.r + displacement / 10 , 0 , 6.3, true);
			X.fillStyle = b.c;
			X.fill();
			X.stroke();
		}
	}

	function perturb( e)
	{
		mouseDecay = 200 
		mouseX = e.clientX;
		mouseY = e.clientY;
		/* for( n in hive)
    {
	b = hive[n]; 

	dispX = b.x - e.clientX ;
	dispY = b.y - e.clientY ;
	displacement = Math.sqrt(  Math.pow(  b.x - e.clientX , 2 ) + Math.pow(  b.y - e.clientY , 2) );

	force = (600 / ((displacement * displacement)/100));

	b.dx += (dispX / displacement) * force;
	b.dy += (dispY / displacement) * force;
    }
    e.clientX;
		 */
	}

	init();
	return this;
}

