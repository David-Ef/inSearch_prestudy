/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2021
 * @comment 
 */
"use strict";

const shaders = {};

shaders["vs_map"] = `
	out vec2 vUv;

	void main() {

		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		// Normed pos on 2D canvas
		vUv.xy = position.xy / 2. + .5;
	}
`;

shaders["fs_map"] = `
	precision highp float;
	precision highp int;
	precision highp sampler2DArray;

	#define PI 3.1415926535897932384626433832795

	in vec2 vUv;

	uniform float brightness;
	uniform sampler2D TexEquirect;
	uniform bool showBorder;
	uniform vec3 camAngle;
	uniform vec2 angleSpan;

	out vec4 outColour;

	mat3 getRotMat(vec3 angle){

		mat3 rotMat;

		float cosA = cos(angle.x);
		float sinA = sin(angle.x);
		float cosE = cos(angle.y);
		float sinE = sin(angle.y);
		float cosR = cos(angle.z);
		float sinR = sin(angle.z);

		// mat[col][row] by default
		rotMat[0][0] = + cosA * cosE;
		rotMat[1][0] = + cosA * sinE * sinR - sinA * cosR;
		rotMat[2][0] = + cosA * sinE * cosR + sinA * sinR;

		rotMat[0][1] = + sinA * cosE ;
		rotMat[1][1] = + sinA * sinE * sinR + cosA * cosR;
		rotMat[2][1] = + sinA * sinE * cosR - cosA * sinR;

		rotMat[0][2] = - sinE;
		rotMat[1][2] = + cosE * sinR;
		rotMat[2][2] = + cosE * cosR;

		return rotMat;
	}

	void main() {

		// outColour = vec4(0, 0, 0, 1);
		// outColour.x = float(vUv.x > .5);
		// outColour.y = float(vUv.y > .5);
		// return;

		if (!showBorder){
			outColour = texture(TexEquirect, vUv);
			outColour *= brightness +.5;
			outColour.w = 1.;
			return;
		}

		mat3 rotMatrix = getRotMat(camAngle);
		float max_dist = 5. * PI/180.;

		vec2 equi_pts; // un-normalize latlong
		equi_pts[0] = (vUv.x + .25) * (2.*PI);
		equi_pts[1] = ((1. - vUv.y) - .5) * PI;

		vec3 Pvf; // equi2sphere
		Pvf[0] = cos(equi_pts[1]) * sin(equi_pts[0]);
		Pvf[1] = cos(equi_pts[1]) * cos(equi_pts[0]);
		Pvf[2] = sin(equi_pts[1]);

		// sphere to U in world space (origin: camera rotation)
		vec3 Pvi = Pvf * rotMatrix;

		// Unit world space to lat long
		vec2 VPpos;
		VPpos.x = atan(Pvi.y, Pvi.x);
		VPpos.y = acos(Pvi.x / length(Pvi.xz)) * -sign(Pvi.z);

		bool dist, distO, distI;
		// Outer VP border
		distO = (abs(VPpos.x) - angleSpan.x/2.) < max_dist
			&& (abs(VPpos.y) - angleSpan.y/2.) < max_dist;
		// Inner VP border
		distI = (abs(VPpos.x) - angleSpan.x/2.) < (max_dist/2.)
			&& (abs(VPpos.y) - angleSpan.y/2.) < (max_dist/2.);

		// VP border
		dist = distO && !distI;

		float inn = float(dist);

		// VP border
		outColour = inn * vec4(1, .2, 0, 1) + (1.-inn) * texture(TexEquirect, vUv);

		outColour *= brightness;
		outColour.w = 1.;
	}
`;

shaders["fs_VP"] = `
	#define PI 3.1415926535897932384626433832795

	in vec2 vUv;

	uniform float brightness;
	uniform sampler2D TexEquirect;
	uniform vec3 camAngle;
	uniform vec2 angleSpan;
	uniform vec2 dotPos;

	out vec4 outColour;

	mat3 getRotMat(vec3 angle){

		mat3 rotMat;

		float cosA = cos(angle.x);
		float sinA = sin(angle.x);
		float cosE = cos(angle.y);
		float sinE = sin(angle.y);
		float cosR = cos(angle.z);
		float sinR = sin(angle.z);

		// mat[col][row] by default
		rotMat[0][0] = + cosA * cosE;
		rotMat[1][0] = + sinA * cosE;
		rotMat[2][0] = - sinE;

		rotMat[0][1] = + cosA * sinE * sinR - sinA * cosR;
		rotMat[1][1] = + sinA * sinE * sinR + cosA * cosR;
		rotMat[2][1] = + cosE * sinR;

		rotMat[0][2] = + cosA * sinE * cosR + sinA * sinR;
		rotMat[1][2] = + sinA * sinE * cosR - cosA * sinR;
		rotMat[2][2] = + cosE * cosR;

		return(rotMat);
	}

	void main() {
		mat3 rotMatrix = getRotMat(camAngle);

		float focal = 1.5;
		vec2 Dimpixels = vec2(1, 1);
		vec2 pxSize = vec2(
			(2. * focal * tan(angleSpan.x/2.)) / Dimpixels.x,
			(2. * focal * tan(angleSpan.y/2.)) / Dimpixels.y
		);
		vec2 ptsVP = vUv * Dimpixels;

		vec3 Pvi = vec3(
			focal,
			pxSize.x * (ptsVP.x - Dimpixels.x / 2.),
			pxSize.y * (ptsVP.y - Dimpixels.y / 2.)
		);

		vec3 Pvf = (Pvi * rotMatrix);

		vec2 pts = vec2(0);
		pts.x = atan(Pvf.x, Pvf.y) / (2.*PI) -.25;
		pts.y = 1.-(asin(Pvf.z/length(Pvf)) / PI + .5);

		pts = pts + vec2(pts.x<0., pts.y<0.);

		// Display viewport
		outColour = texture2D(TexEquirect, pts.xy);

		outColour *= brightness;
		outColour.w = 1.;

		// TRIED TO DRAW POINTS IN THE VIEWPORT
		//	AND CORRECT FOR DEFORMATIONS
		// pts *= vec2(1, .5);
		// pts += vec2(0, .25);

		// pts.x /= abs(asin(pts.y-.5));
		// pts.x += asin(pts.y-.5) *2.;

		// float dotSize = .01;

		// if (length(pts - dotPos) < dotSize) {
		// 	// Display
		// 	outColour = vec4(1.,1.,0,1);
		// 	return;
		// }

		// vec2 ddotpos = dotPos;
		// ddotpos.x = 1.-ddotpos.x;

		// if (length(pts - ddotpos) < dotSize) {
		// 	// Display
		// 	outColour = vec4(1.,1.,0,1);
		// }
	}
`;

export { shaders };
