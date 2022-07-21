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

		this.isReady = false;

		// this.isVisible = false
		this.interactive = true;

		this.isImgLoaded = false;

		this.posCallback = null;

		this.tex_imloading = (new THREE.TextureLoader).load('res/imgloading.png');
		this.showImgLoadingTexture = true;

		// =======================================================
		// Setting up WebGL's basics
		this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

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
		// this.CSSselect = $(`div#${container} > canvas`);
		// this.mouseOffset = this.CSSselect.offset();
		this.mouse = new THREE.Vector2();
		// this.mouseBtnPressed = false;

		// Setting up scene
		this.scene = new THREE.Scene();

		this.material = new THREE.ShaderMaterial( {
			uniforms: {
				brightness: { value: 1 },
				TexEquirect: { value: 0 },
				showBorder: { value: true },
				camAngle: { value: new THREE.Vector3(Math.PI, 0, Math.PI) },
				angleSpan: { value: new THREE.Vector2(Math.PI/2*1.25, Math.PI/2) },
			},
			vertexShader: shaders["vs_map"],
			fragmentShader: shaders["fs_map"],
			glslVersion: THREE.GLSL3
		} );

		this.mesh = new THREE.Mesh(
			new THREE.PlaneGeometry( 2,2 ),
			this.material );
		this.scene.add( this.mesh );

		this.onWindowResize = this.onWindowResize.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		// this.onMouseRelease = this.onMouseRelease.bind(this);
		// this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onCanvasClick = this.onCanvasClick.bind(this);
		this.moveViewportBorder = this.moveViewportBorder.bind(this);
		this.render = this.render.bind(this);

		// Event listener callbacks
		window.addEventListener("resize", this.onWindowResize);
		this.renderer.domElement.addEventListener('mousedown', this.onCanvasClick);
		this.renderer.domElement.addEventListener('mouseup', this.onMouseRelease);
		this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
		this.renderer.domElement.addEventListener('mouseleave', this.onMouseLeave);

		this.isReady = true;
	}

	get isSceneSet(){
		return this.isImgLoaded;
	}

	setScene(path){

		this.isImgLoaded = false;

		if (this.showImgLoadingTexture){
			this.material.uniforms["TexEquirect"].value = this.tex_imloading;
			this.render();
		}

		const _this = this;
		new THREE.TextureLoader().load(path, (tex) => {
			_this.material.uniforms["TexEquirect"].value = tex;
			_this.isImgLoaded = true;
			_this.render();
		});
	}

	// hide(){
	// 	this.clearScene();
	// 	this.isVisible = false;
	// }

	// show(){
	// 	this.isVisible = true;
	// 	this.render();
	// }

	clearScene(){
		this.material.uniforms["draw"].value = false;
		this.render();
	}

	ToggleActive(isActive){

		this.material.uniforms["brightness"].value = isActive ? 1. : .6;
	}

	onMouseMove(event) {
		if (!this.interactive) return;
		
		const rect = this.canvas.getBoundingClientRect();

		const canvasDimCorrected = new THREE.Vector2(this.canvas.width, this.canvas.height);
		
		canvasDimCorrected.divide(new THREE.Vector2(window.devicePixelRatio, window.devicePixelRatio));

		this.mouse.x = 1-( (event.clientX - rect.left) / canvasDimCorrected.x );
		this.mouse.y = 1-( (event.clientY - rect.top)  / canvasDimCorrected.y );

		event.preventDefault();

		if (event.buttons){
			this.moveViewportBorder();
			this.render();
		}
	}

	// onMouseRelease(event) {
	// 	if (event.button === 0) {
	// 		this.mouseBtnPressed = false;
	// 	}
	// }

	// onMouseLeave(event) {
	// 	this.mouseBtnPressed = false;
	// }

	onCanvasClick(event) {
		if (!this.interactive) return;
		// this.mouseBtnPressed = true;

		this.moveViewportBorder();
		this.render();
	}

	moveViewportBorder(){

		this.material.uniforms["camAngle"].value = new THREE.Vector3(
			this.mouse.x * (2*Math.PI),
			(this.mouse.y-.5) * Math.PI,
			Math.PI
			);

		if (this.VP_scene !== null) {
			this.VP_scene.ToggleDot(false);
			this.VP_scene.UpdateCamAngle(this.material.uniforms["camAngle"].value);
			// Render is called in UpdateCamAngle
		}
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

	ComputeOrthodromicDistance(pos1, pos2, inDegrees){
		// Returns great-circle distance in radians by default
		// X is longitude, Y is latitude

		const dlon = pos1.x - pos2.x;
		const dlat = pos1.y - pos2.y;

		const dist = 2* Math.asin(Math.sqrt(
			Math.sin(dlat/2)**2 + Math.cos(pos1.y) * Math.cos(pos2.y) * Math.sin(dlon/2)**2
			));

		if (inDegrees){
			dist = dist * (180/Math.PI);
		}

		return dist;
	}
}

export { SceneMngr };
