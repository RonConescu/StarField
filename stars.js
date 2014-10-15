/*
	The idea:
	create randomized stars, a sun, and a quick, fast way to change
	our perceived sense of time of day.  Intended to be a toy (as
	opposed to a game), but I'm not sure where I'm going with it yet.
	Goal includes being as lightweight as possible -- if it feels
	convincing-ish, and fun, it's more than good enough.  I'm not
	trying for accuracy -- unless accuracy happens to get me stuff
	that feels realistic while still being fast and easy to use.
	
	Distances, including star diameters, are in light-years.  This
	lets me square them and still get reasonable numbers, while
	still working with conveniently large numbers for the Sun
	and Moon (fractional light-years).
	
	References (collected as I used them):
	http://en.wikipedia.org/wiki/List_of_largest_known_stars
	http://en.wikipedia.org/wiki/Azimuth
	http://www.w3schools.com/cssref/css_colors_legal.asp
	http://en.wikipedia.org/wiki/Absolute_magnitude - ignored, but interesting
*/

var MINUTES_PER_YEAR = 60 * 24 * 365;
var SECONDS_PER_YEAR = 60 * MINUTES_PER_YEAR;
var MILES_PER_LIGHT_YEAR = 186000 * 5280 * SECONDS_PER_YEAR;
var LIGHT_YEAR = 1;
var LIGHT_YEARS = 1;

var STAR_MAX_DISTANCE = 1000000 * LIGHT_YEARS;
var SUN_DISTANCE = 8 / MINUTES_PER_YEAR;
var MOON_DISTANCE = 2 / SECONDS_PER_YEAR;
var SUN_DIAMETER = 860000 / MILES_PER_LIGHT_YEAR;
var STAR_MAX_DIAMETER = 1700 * SUN_DIAMETER;
var SUN_HUE = 60;	// from photoshop
var SUN_PIXEL_DIAMETER = 150;	// all perceived sizes and distances will be scaled to this
var SUN_ACTUAL_BRIGHTNESS = 0.5;	// random guess.  The astronomy is confusing, so far.
var SUN_PERCEIVED_BRIGHTNESS = 0.8;		// just so I can test comparison
var LIGHT_YEARS_PER_PIXEL = SUN_DIAMETER / SUN_PIXEL_DIAMETER;

var ARBITRARY_DEFAULT_VIEW_WIDTH = 1600;
var ARBITRARY_DEFAULT_VIEW_HEIGHT = 900;
var ARBITRARY_AZIMUTH_DEGREES_IN_DEFAULT_VIEW_WIDTH = 140;
var DEGREES_PER_PIXEL = ARBITRARY_AZIMUTH_DEGREES_IN_DEFAULT_VIEW_WIDTH / ARBITRARY_DEFAULT_VIEW_WIDTH;

var NUM_STARS = 200;

function Star ()
{
	this.distance = Math.random () * STAR_MAX_DISTANCE;
	this.diameter = Math.random () * STAR_MAX_DIAMETER;
	
	this.color = Math.round (Math.random () * 360);		// 0-360
	this.actualBrightness = Math.random ();
	this.perceivedBrightness = starPerceivedBrightness (this.actualBrightness);
	
	// angle from straight overhead to straight down, beneath the horizon, as seen from wherever we're standing
	this.altitude = Math.random () * 180 - 90;
	
	// angle to left or right, including possibly behind us
	this.azimuth = Math.random () * 360 - 180;
	
	// All that tells us how many pixels up to draw it from the horizon, and how many pixels wide it is in our viewport.
	this.diameterInPixels = starDiameterInPixels (this.diameter, this.distance);
	this.altitudeInPixels = starAltitudeInPixels (this.altitude, this.distance);
	this.xOffsetInPixels = starHorizOffsetInPixels (this.azimuth);
	
	if (this.diameterInPixels < 1) this.diameterInPixels = 1;
	var cssRadius = this.diameterInPixels / 2;
	if (cssRadius < 1) cssRadius = 1;

	// ...and how bright it is, and what color.
	var cssHue = this.color;
	var cssBrightness = Math.round (this.perceivedBrightness * 100);		// 0-100, followed by "%"
		
	var styleString = 
		(	""
			+ " background-color: hsl(%d,100%,%d%); "
			+ " border-radius: %dpx; "
			+ " left: %dpx; "
			+ " top: %dpx; "
			+ " width: %dpx; "
			+ " height: %dpx; "
			+ " position: absolute; "
		)
		.replace ("%d", cssHue)
		.replace ("%d", cssBrightness)
		.replace ("%d", cssRadius)
		.replace ("%d", gBody.width () + this.xOffsetInPixels)
		.replace ("%d", this.altitudeInPixels) 		// WRONG, but I'm just getting going
		.replace ("%d", this.diameterInPixels)
		.replace ("%d", this.diameterInPixels)
		;
		
	this.html =
	 	"<div class='star' style='%s'></div>"
		.replace ("%s", styleString);
}

function starDiameterInPixels (starDiameter, starDistance)
{
	var diameter =	SUN_PIXEL_DIAMETER *
					starDiameter / SUN_DIAMETER *
					SUN_DISTANCE / starDistance;
	
	diameter = Math.round (diameter);
	return diameter;
}

function starAltitudeInPixels (angleOfAltitudeInDegrees, distanceInLightYears)
{
	var angle = angleOfAltitudeInDegrees * Math.PI / 180;
	var sine = Math.sin (angle);
	var altitudeFromHorizonInLightYears = sine * distanceInLightYears;
	var altitudeInPixels = altitudeFromHorizonInLightYears / LIGHT_YEARS_PER_PIXEL;
	altitudeInPixels = Math.round (altitudeInPixels);
	return altitudeInPixels;
}

function starPerceivedBrightness (actualBrightness)
{
	return actualBrightness / SUN_ACTUAL_BRIGHTNESS * SUN_PERCEIVED_BRIGHTNESS;
}

function starHorizOffsetInPixels (azimuthInDegrees)
{
	var angle = azimuthInDegrees * Math.PI / 180;
	var pixelOffset = angle / DEGREES_PER_PIXEL;
	pixelOffset = Math.round (pixelOffset);
	return pixelOffset;
}

$(document).ready (function ()
{
	gBody = $(document.body);
	createStars ();
});

var gStars = [];
var gBody = null;

function createStars ()
{
	var allHtml = "";
	
	for (var i = 0; i < NUM_STARS; i++)
	{
		var star = new Star ();
		gStars.push (star);
		allHtml += star.html;
	}
	
	gBody.append (allHtml);
}