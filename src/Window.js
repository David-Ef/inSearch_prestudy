/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2020
 * @comment 
 */
"use strict";


class WindowFunc{

	constructor(){
		this.fullscreen = this.isFullscreen;
		this.viewFullScreenEl = document.getElementById("view-fullscreen");

		// this.setFullScreenCallback();
		// this.setFullScreenChangeCallback();
	}

	setFullScreenCallback(){
		let fullScreenState = false;
		const _this = this;

		this.viewFullScreenEl.addEventListener("click", function() {
			const docElm = document.documentElement;

			_this.toggleFullscreen();
		})
	}

	toggleFullscreen(){
		if (this.fullscreen()){
			this.exitFullscreen();
		} else {
			this.enterFullscreen();
		}
	}

	setFullScreenChangeCallback(){
		const _this = this;

        document.addEventListener("fullscreenchange", function () {
            _this.toggleFullscreen();
        }, false);
        
        document.addEventListener("msfullscreenchange", function () {
            _this.toggleFullscreen();
        }, false);
        
        document.addEventListener("mozfullscreenchange", function () {
            _this.toggleFullscreen();
        }, false);
        
        document.addEventListener("webkitfullscreenchange", function () {
            _this.toggleFullscreen();
        }, false);
	}

	isFullscreen(){
		return window.innerWidth == screen.width &&
			   window.innerHeight == screen.height;

		if (document.fullscreen !== null){
			return !!document.fullscreen;
		}
		else if (document.mozFullScreen !== null){
			return !!document.mozFullScreen;
		}
		else if (document.webkitIsFullScreen !== null){
			return !!document.webkitIsFullScreen;
		}
		else if (document.msFullscreenElement !== null){
			return !!document.msFullscreenElement;
		}
	}

	enterFullscreen(){
		const docElm = document.documentElement;

		if (docElm.requestFullscreen) {
			docElm.requestFullscreen();
		}
		else if (docElm.msRequestFullscreen) {
			docElm.msRequestFullscreen();
		}
		else if (docElm.mozRequestFullScreen) {
			docElm.mozRequestFullScreen();
		}
		else if (docElm.webkitRequestFullScreen) {
			docElm.webkitRequestFullScreen();
		}

		if (this.viewFullScreenEl){
			$(this.viewFullScreenEl).remove();
		}
	}

	exitFullscreen(){
		if (document.exitFullscreen) {
		    document.exitFullscreen();
		}
		else if (document.mozCancelFullScreen) {
		    document.mozCancelFullScreen();
		}
		else if (document.webkitCancelFullScreen) {
		    document.webkitCancelFullScreen();
		}
		else if (document.msExitFullscreen) {
		    document.msExitFullscreen();
		}
	}
}

export { WindowFunc };
