/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2021
 * @comment: adapted from Three.js interactive cube examples
 */
"use strict";

import * as THREE from './ext/three.js/three.module.js';
import { WEBGL } from './ext/three.js/WebGL.js';

import { shaders } from "./Shaders.js";
import { DataMngr } from "./DataMngr.js";
import { DebugInfo } from "./Debug.js";

import { InputMngr } from "./InputMngr.js"

class SceneMngr{
	constructor(container, sceneDataFile = ""){

		if ( WEBGL.isWebGL2Available() === false ) {
			document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );
			return;
		}

		// this.isVisible = false;

		this.mouse = new THREE.Vector2();
		this.mouseWin = new THREE.Vector2();
		this.isImgLoaded = false;

		this.interactive = true;

		// =======================================================
		// Setting up WebGL's basics
		this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, -10, 10 );

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio( window.devicePixelRatio );

		this.container = document.getElementById( container );

		this.width = $(this.container).width();
		this.height = $(this.container).height();

		// document.body.appendChild( this.container );
		this.container.appendChild( this.renderer.domElement );

		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( this.width, this.height );


		this.canvas = $(`div#${container} > canvas`).get(0);
		this.CSSselect = $(`div#${container} > canvas`);
		this.mouseOffset = this.CSSselect.offset();

		// Setting up scene
		this.scene = new THREE.Scene();

		this.material = new THREE.ShaderMaterial( {
			uniforms: {
				brightness: { value: 1 },
				TexEquirect: { value: 0 },
				camAngle: { value: new THREE.Vector3(Math.PI, 0, Math.PI) },
				angleSpan: { value: new THREE.Vector2(Math.PI/2*1.25, Math.PI/2) },
			},
			vertexShader: shaders["vs_map"],
			fragmentShader: shaders["fs_VP"],
			glslVersion: THREE.GLSL3
		} );

		this.mesh = new THREE.Mesh(
			new THREE.PlaneGeometry( 2,2 ),
			this.material );
		this.scene.add( this.mesh );

		const dotGeometry = new THREE.BufferGeometry();
		dotGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [0,0,1.], 3 ) );
		// dotGeometry.computeBoundingSphere();
		const sprite = new THREE.TextureLoader().load( './res/disc.png' );
		const dotMaterial = new THREE.PointsMaterial(
			{ size: 25, map: sprite, color: 0xff00ff, alphaTest: 0.5, transparent: true} );
		this.dot = new THREE.Points(dotGeometry, dotMaterial);
		this.ToggleDot(false);
		this.scene.add(this.dot);

		this.onWindowResize = this.onWindowResize.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onCanvasClick = this.onCanvasClick.bind(this);
		this.UpdateCamAngle = this.UpdateCamAngle.bind(this);
		this.UpdateDotPosition = this.UpdateDotPosition.bind(this);
		this.render = this.render.bind(this);

		// Event listener callbacks
		window.addEventListener("resize", this.onWindowResize);
		this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
		this.renderer.domElement.addEventListener('click', this.onCanvasClick);
	}

	get isSceneSet(){
		return this.isImgLoaded;
	}

	setScene(path){
		this.isImgLoaded = false;

		const _this = this;
		new THREE.TextureLoader().load(path, (tex) => {
			_this.material.uniforms["TexEquirect"].value = tex;
			_this.isImgLoaded = true;
			_this.render();
		});
	}

	UpdateCamAngle(vec3){

		this.material.uniforms["camAngle"].value = vec3;
		this.render();
	}

	UpdateDotPosition(vec2){

		const arr = this.dot.geometry.attributes.position.array;
		arr[0] = vec2.x;
		arr[1] = vec2.y;

		this.dot.geometry.attributes.position.needsUpdate = true;
	}

	ToggleDot(isVisible){
		this.dot.visible = isVisible;
	}

	ToggleActive(isActive){

		this.material.uniforms["brightness"].value = isActive ? 1. : .6;
	}

	onMouseMove(event) {
		
		const rect = this.canvas.getBoundingClientRect();

		const canvasDimCorrected = new THREE.Vector2(this.canvas.width, this.canvas.height);
		canvasDimCorrected.divide(new THREE.Vector2(window.devicePixelRatio, window.devicePixelRatio));

		this.mouseWin.x = event.clientX;
		this.mouseWin.y = event.clientY;

		this.mouse.x = ( (event.clientX - rect.left) / canvasDimCorrected.x ) *2 -1;
		this.mouse.y = (1-( (event.clientY - rect.top)  / canvasDimCorrected.y )) *2 -1;

		// this.render();
	}

	onCanvasClick(event) {

		if (!this.interactive) return;

		this.ToggleDot(true);
		this.UpdateDotPosition(this.mouse);

		this.render();

		$("#DotValid").show()
					  .css("top", `${this.mouseWin.y-10}px`)
					  .css("left", `${this.mouseWin.x-10}px`);
					  
		this.ExtCanvasClickClbk(this);
	}

	onWindowResize() {

		this.width = $(this.container).width();
		this.height = $(this.container).height();

		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( this.width, this.height );

		this.render();
	}

	render() {

		this.renderer.setRenderTarget( null );
		this.renderer.render( this.scene, this.camera );
	}

	VPpoint2EquirectConvert(posInVP){
		// Imperfect projection, edge deformations (stretch) observed

		const angleSpan = this.material.uniforms["angleSpan"].value;
		const camAngle = this.material.uniforms["camAngle"].value;

		function getRotationMatrix(camAngle){

			const rotMat = new THREE.Matrix3();

			const cosA = Math.cos(camAngle.x);
			const sinA = Math.sin(camAngle.x);
			const cosE = Math.cos(camAngle.y);
			const sinE = Math.sin(camAngle.y);
			const cosR = Math.cos(camAngle.z);
			const sinR = Math.sin(camAngle.z);

			rotMat[0] = + cosA * cosE;
			rotMat[3] = + cosA * sinE * sinR - sinA * cosR;
			rotMat[6] = + cosA * sinE * cosR + sinA * sinR;

			rotMat[1] = + sinA * cosE;
			rotMat[4] = + sinA * sinE * sinR + cosA * cosR;
			rotMat[7] = + sinA * sinE * cosR - cosA * sinR;

			rotMat[2] = - sinE;
			rotMat[5] = + cosE * sinR;
			rotMat[8] = + cosE * cosR;

			rotMat.set(
				rotMat[0], rotMat[3], rotMat[6],
				rotMat[1], rotMat[4], rotMat[7],
				rotMat[2], rotMat[5], rotMat[8],
				);

			return rotMat;
		}

		const ptsVP = new THREE.Vector2();
		ptsVP.copy(posInVP);
		// [-1,1] -> [0,1]
		ptsVP.x = ptsVP.x/2 +.5;
		ptsVP.y = ptsVP.y/2 +.5;

		const focal = 1.5;
		const pxSize = new THREE.Vector2(
			(2. * focal * Math.tan(angleSpan.x/2.)),
			(2. * focal * Math.tan(angleSpan.y/2.))
		);

		const Pvi = new THREE.Vector3(
			focal,
			pxSize.x * (ptsVP.x - .5),
			pxSize.y * (ptsVP.y - .5)
		);

		// vec2 ptsVP = vUv * Dimpixels;
		Pvi.applyMatrix3( getRotationMatrix(camAngle) );

		Pvi.divideScalar(Pvi.length());

		const sphPos = new THREE.Vector2();
		sphPos.x = Math.atan2(Pvi.x, Pvi.y) / (2*Math.PI);
		sphPos.y = 1.-(Math.asin(Pvi.z) / Math.PI + .5);

		// Longitude data looks like
		//  0      pi/2    pi  1.5pi   2pi
		// .25    .5/-.5  -.25   0     .25
		// Transforming to a simple [0, 1] range
		if (sphPos.x < 0) {
			sphPos.x = .5 - sphPos.x /-2;
		} else {
			if (sphPos.x > .25){
				sphPos.x -= .25;

			} else {
				sphPos.x += .75;
			}
		}

		return sphPos;
	}
}

export { SceneMngr };
