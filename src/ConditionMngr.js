/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2020
 * @comment 
 */
"use strict";

class ConditionMngr {
	constructor(name,
		modalities,
		mod_list) {
		this.name = "";
		this.modalities = modalities; // Set of modalities
		this.mod_list = mod_list; // List of condition modalities to vary elements of the experiment
	}

	getElement(index) {
		if (typeof(index) !== "number"){
			console.error("Value of parameter (index) passed to Condition.element is not a number")
			return null;
		}
		if (index >= this.mod_list.length){
			console.warn("");
			return null;
		}

		return this.modalities[this.mod_list[index]];
	}

	get length(){
		return this.mod_list.length;
	}
}

export { ConditionMngr };