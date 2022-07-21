/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2020
 * @comment 
 */
"use strict";

import { DataMngr } from "./DataMngr.js";

class InputMngr{

	instance = null;

	constructor(){

		InputMngr.instance = this;
		this.Keys = {}
		this.callbacks = {}

		const this_ = this;
		$(window).keyup((event) => {
			const code = event.originalEvent.code
			const keyCode = event.keyCode;
			DataMngr.instance.write("Pressed: " + code + " [" + keyCode + "]")

			if (keyCode in this_.callbacks){
				this_.callbacks[keyCode].forEach((el) => {
					el[1](el[0]);
				});

				// event.stopImmediatePropagation();
				// event.stopPropagation();
				// event.cancelBubble = true;
			}

			this_.Keys[keyCode] = false;

			return false;
		});

		$(window).keydown( (event) => {
			this_.Keys[event.keyCode] = true;
		});
	}

	isKeyDown(keycode){
		if (!(keycode in this.Keys)){
			return false;
		}
		
		return this.Keys[keycode];
	}

	addCallback(id, keycode, callback){
		if (!(keycode in this.callbacks)){
			this.callbacks[keycode] = []
		}

		this.callbacks[keycode].push([id, callback]);
	}

	removeCallback(id){
		let index;
		let removed = false;
		Object.keys(this.callbacks).forEach((key) => {
			index = -1;
			this.callbacks[key].forEach((el, iel) => {

				if (el[0] === id){
					index = iel;
					return false;
				}
			});
			if (index >= 0) {
				removed = true;
				this.callbacks[key].splice(index, 1);
			}
		});
		return removed;
	}
}

export { InputMngr };
