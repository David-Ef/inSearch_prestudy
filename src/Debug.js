/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2021
 * @comment 
 */
"use strict";

// Replace with a div and update of spans with Jquery?

// General debug
class DebugInfo {

	instance = null;

	constructor(){

		DebugInfo.instance = this;
		this._enabled = false;
	}

	get enabled(){
		return this._enabled;
	}

	set enabled(value){
			this._enabled = value;
	}
}

export { DebugInfo };
