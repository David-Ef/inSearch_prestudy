/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2020-2021
 * @comment 
 */
"use strict";

import { Modal, ModalData } from "./Modal.js";

function _wait(duration, interrupt=null, callback=null, interval=.01) { 
		duration *= 1000;
		interval *= 1000;
		
		return new Promise( resolve => {
			const this_ = this;
			let start_time = new Date().getTime();

			const inter = setInterval(function(){
				const elapsed_time = new Date().getTime() - start_time;

				const isInterrupt = !!interrupt && interrupt();
				const isElapsed = elapsed_time > duration

				if (isInterrupt || isElapsed){
					clearInterval(inter);

					const resp = isInterrupt ? "interrupted" : "elapsed";
					if (!!callback){
						resp = callback;
					}
					resolve(resp);
				}
			}, interval);
	  });
	}

class Trial{
	constructor(name = "nameless",
		break_every = 0,
		break_duration = 60,
		break_until = false,
		break_modal = null) {
		this.flow = [];

		this.name = name
		this._break_every = break_every;
		this._break_duration = break_duration;
		this._break_until = break_until;
		this._break_modal = break_modal;
	}

	lambda(func, name = "lambda") {
		if (typeof(func) !== "function"){
			console.error("Value of parameter (func) passed to Trial.lambda must be a function")
			return null;
		}

		this.flow.push({func: func, name: name});

		return this;
	}

	break_every(n) {
		if (typeof(n) !== "number"){
			console.error("Value of parameter (n) passed to Trial.break_every must be a number")
			return null;
		}

		this._break_every = n;

		return this;
	}
	break_duration(duration) {
		if (typeof(duration) !== "number"){
			console.error("Value of parameter (duration) passed to Trial.break_duration must be a number")
			return null;
		}

		this._break_duration = duration;

		return this;
	}
	break_until(func) {
		if (typeof(func) !== "function"){
			console.error("Value of parameter (func) passed to Trial.break_until must be a function")
			return null;
		}

		this._break_until = func;

		return this;
	}
	break_modal(modal) {
		// if (func !== null && typeof(func) !== "function"){
		// 	console.error("Value of parameter (func) passed to Trial.break_modal must be a function")
		// 	return null;
		// }

		this._break_modal = modal;

		return this;
	}

	toggleWithDelay(mngr, duration) {
		// First parameter must implement properties (function) hide and show
		if (typeof(mngr) === "object"
			&& mngr.hasOwnProperty("show")
			&& mngr.hasOwnProperty("hide")) {
			console.error("Value of parameter (mngr) passed to Trial.toggleWithDelay must be an object implementing hide and show functions")
			return null;
		}
		if (typeof(duration) !== "number"){
			console.error("Value of parameter (duration) passed to Trial.toggleWithDelay must be a number")
			return null;
		}

		this.lambda(() => {mngr.show()}, "show "+ mngr.constructor.name) // Show
			.wait(duration)// Display for duration
			.lambda(() => {mngr.hide()}, "hide "+ mngr.constructor.name) // Hide

		return this;
	}

	toggleWithInterrupt(mngr, func) {
		// First parameter must implement properties (function) hide and show
		if (typeof(mngr) === "object"
			&& mngr.hasOwnProperty("show")
			&& mngr.hasOwnProperty("hide")) {
			console.error("Value of parameter (mngr) passed to Trial.toggleWithInterrupt must be an object implementing hide and show functions")
			return null;
		}
		if (typeof(func) !== "function"){
			console.error("Value of parameter (func) passed to Trial.toggleWithInterrupt must be a a function")
			return null;
		}

		this.lambda(() => {mngr.show()}, "show "+ mngr.constructor.name) // Show
			.waitUntil(func) // Display until func evaluates to True
			.lambda(() => {mngr.hide()}, "hide "+ mngr.constructor.name) // Hide

		return this;
	}

	toggleWithDelayAndInterrupt(mngr, duration, func) {
		// First parameter must implement properties (function) hide and show
		if (typeof(mngr) === "object"
			&& mngr.hasOwnProperty("show")
			&& mngr.hasOwnProperty("hide")) {
			console.error("Value of parameter (mngr) passed to Trial.toggleWithDelayAndInterrupt must be an object implementing hide and show functions")
			return null;
		}
		if (typeof(duration) !== "number"){
			console.error("Value of parameter (duration) passed to Trial.toggleWithDelayAndInterrupt must be a number")
			return null;
		}
		if (typeof(func) !== "function"){
			console.error("Value of parameter (func) passed to Trial.toggleWithDelayAndInterrupt must be a function")
			return null;
		}

		this.lambda(() => {mngr.show()}, "show "+ mngr.constructor.name) // Show
			.waitWithInterrupt(duration, func) // Display for duration or until func evaluates to True
			.lambda(() => {mngr.hide()}, "hide "+ mngr.constructor.name) // Hide

		return this;
	}

	wait(duration, name){
		if (typeof(duration) !== "number"){
			console.error("Value of parameter (duration) passed to Trial.wait must be a number")
			return null;
		}
		
		this.lambda( async () => { return await _wait(duration); }, "wait "+duration+" sec");
		// Need a lambda here?

		return this;
	}

	waitUntil(interrupt){
		if (typeof(interrupt) !== "function"){
			console.error("Value of parameter (interrupt) passed to Trial.waitUntil must be a function")
			return null;
		}

		this.lambda( async () => { return await _wait(Infinity, interrupt); }, "wait till conditional is true");
		
		return this;
	}

	waitWithInterrupt(duration, interrupt) {
		if (typeof(duration) !== "number"){
			console.error("Value of parameter (duration) passed to Trial.waitWithInterrupt must be a number")
			return null;
		}
		if (typeof(interrupt) !== "function"){
			console.error("Value of parameter (interrupt) passed to Trial.waitWithInterrupt must be a function")
			return null;
		}

		this.lambda( async () => { return await _wait(duration, interrupt); }, "wait "+duration+" sec or till conditional is true");
		// Need a lambda here? What is Callback?

		return this;
	}

	waitForAnswer(modalData){
		if (!(modalData instanceof ModalData) && !(modalData instanceof Modal)) {
			console.error(`Value of parameter (modalData) passed to Trial.waitForAnswer must be an instance of ModalData (received ${modalData.constructor.name})`)
			return null;
		}

		let modal;
		if(modalData instanceof ModalData){
			modal = new Modal(modalData);
		} else {
			modal = modalData;
		}

		this.lambda(() => {modal.build().show();}, "Show modal with choice")
			.waitUntil(() => {return !modal.isUp;});

		return this;
	}

	showModalandWait(duration, modalData){
		if (typeof(duration) !== "number"){
			console.error("Value of parameter (duration) passed to Trial.showModalandWait must be a number")
			return null;
		}
		if (!(modalData instanceof ModalData)) {
			console.error("Value of parameter (modalData) passed to Trial.showModalandWait must be an instance of ModalData")
			return null;
		}

		const modal = new Modal(modalData);

		this.lambda(() => {modal.build().show();}, "Show modal without choice")
			.lambda( async () => { return await this._wait(duration); }, "Show modal and wait "+duration+" sec")
			.lambda(() => {modal.close();}, "Hide modal without choice");

		return this;
	}

	get isReady(){
		return this.flow.length > 0;
	}

	toString() {
		// return string showing the trial's flow
		let out = "Trial["+ this.name +"] flow:";
		out += " breaks[every="+ this._break_every
			+ ", duration=" + this._break_duration
			+ ", resume on keypress="+ !!this._break_until
			+ ", custom modal="+ !!this._break_modal +"]\n";

		for(let i = 0; i < this.flow.length; i++){
			const func = this.flow[i].func;
			const name = this.flow[i].name;

			out += "  ["+ i +"] " + name.toString() + "\n";
		}
		return out;
	}

}

// Build like Trial, by appending to a flow var
class Experiment{
	constructor(name = "nameless", shortname = "expe") {
		this.name = name;
		this.shortname = shortname;

		this._trials = [];
		this._finish_notice = () => { alert("Experimentation finished") };

		this.currentTrialIndex = -1;
	}

	get currentStimuliMngr(){
		return this._trials[this.currentTrialIndex].stim;
	}

	get currentCondMngr(){
		return this._trials[this.currentTrialIndex].cond;
	}

	get length(){
		return this._trials.length;
	}

	trial(trial, stimMngr, condMngr, insert=null) {
		// if ( typeof(stimMngr) === "object" && !(stimMngr instanceof StimuliMngr) ) {
		// 	console.error("Value of parameter (stimMngr) passed to Experiment.trial must be an instance of StimuliMngr")
		// 	return null;
		// }
		// if ( typeof(condMngr) === "object" && !(condMngr instanceof ConditionMngr) ) {
		// 	console.error("Value of parameter (condMngr) passed to Experiment.trial must be an instance of ConditionMngr")
		// 	return null;
		// }
		if (! (trial instanceof Trial) ){
			console.error("Value of parameter (trial) passed to Experiment.trial must be an instance of Trial")
			return null;
		}

		if (insert === null) {
			insert = this.length;
		}

		if (typeof(insert) !== "number"){
			console.error("Value of parameter (insert) passed to Experiment.trial must be a number")
			return null;
		}

		this._trials.splice(insert, 0, {trial: trial, stim: stimMngr, cond: condMngr})

		return this;
	}

	finish(func) {
		if (typeof(func) !== "function"){
			console.error("Value of parameter (func) passed to Experiment.finish must be a function")
			return null;
		}

		this._finish_notice = func;

		return this;
	}

	start() {
		if(this._trials === null){
			alert("Cannot start experiment because no trial was registered");
			return null;
		}

		this._start();

		return this;
	}

	async _start() {
		if (this.length <= 0){
			console.error("Error in Experiment._start: experiment is empty")
			return false;
		}

		print("Starting experiment: \"" + this.name + "\"");

		for (let itrial = 0; itrial < this.length; itrial++){
			const trial_data = this._trials[itrial];

			const trialMngr = trial_data.trial;
			const stimMngr = trial_data.stim;
			const condMngr = trial_data.cond;

			this.currentTrialIndex = itrial;

			print("Playing trial plan: "+ trialMngr.name +"\n");

			if (!!stimMngr){

				if (!!condMngr && (stimMngr.length !== condMngr.length)){
					console.warn("Warning in Experiment._start: stimMngr and condMngr do not have the same number of elements. This may be an error.")
				}

				let cond = null;
				// let stim;
				while(stimMngr.next()){

					if (!!condMngr){
						cond = condMngr.getElement(stimMngr.currentIndex) || cond;
					}

					if ( stimMngr.currentIndex > 0
					  && stimMngr.currentIndex % trialMngr._break_every == 0){
				
						if (trialMngr._break_modal instanceof ModalData){
							const modal = new Modal(trialMngr._break_modal);

							modal.build().show();
							await _wait(Infinity, () => {return !modal.isUp;} );
						} else if (trialMngr._break_modal === true){
							// Timed wait

							const modal = new Modal(new ModalData("Break",
								`Please rest for ${trialMngr._break_duration} seconds.<br /><br />You will be able to press the "Continue" button after the wait.`,
								["Continue"], null,
								// The next parameter is supposed to be the modal's "width", but since it is called by the modal's "dialog" function, this works out (suprisingly)
          						(modal) => { // after_build_callback
          							print($("button.ui-widget").get(1))
          							$($("button.ui-widget").get(1)).hide();

          							setTimeout(() => {
          								$($("button.ui-widget").get(1)).show();
          							}, trialMngr._break_duration * 1000);
          						}
							));

							modal.build().show();
							await _wait(Infinity, () => {return !modal.isUp;} );

						} else {
							await _wait(trialMngr._break_duration,
											 trialMngr._break_until);
							console.warn("No break modal set. No visuals for the break will be displayed. Break may be interrupted by the user.");
						}
					}

					print("trial["+ trialMngr.name +", "+ stimMngr.currentIndex +"]: "
						+ "stim: " + stimMngr.currentStimIndex + ", "
						+ JSON.stringify(cond) +"\n");

					for(let iEl = 0; iEl < trialMngr.flow.length; iEl++){
						print("trial["+ trialMngr.name + "]: "
							+ iEl +" - " + trialMngr.flow[iEl].name +"\n");

						const res = await trialMngr.flow[iEl].func();
						if (res != undefined){
							print("  promise wait: ", res);	
						}
					}
				}
				stimMngr.reset();
			}
			else{
				for(let iEl = 0; iEl < trialMngr.flow.length; iEl++){
					const res = await trialMngr.flow[iEl].func();
					if (res != undefined){
						print("  promise wait: ", res);	
					}
				}
			}
		}

		this.currentTrialIndex = -1;
		this._finish_notice(this.shortname);

		return true;
	}

	// CheckFunction that checks if everything is ok and the experiment can run?
	//	Outputs warning/errors

	toString(detailed = false) {
		// return string of the experiment's flow

		let out = "Expe["+ this.name +"]\n";

		for (let itrial = 0; itrial < this.length; itrial++){
			const trial_data = this._trials[itrial];

			const trialMngr = trial_data.trial;
			const stimMngr = trial_data.stim;
			const condMngr = trial_data.cond;

			out += "  Trials["+ trialMngr.name +"]\n";

			if (detailed && !!stimMngr){
				let cond = null;
				let stim;
				while(stim = stimMngr.next()){
					
					if (!!condMngr){
						cond = condMngr.getElement(stimMngr.currentIndex) || cond;
						cond = JSON.stringify(cond);	
					}

					if ( stimMngr.currentIndex > 0 && stimMngr.currentIndex % trialMngr._break_every == 0){
						out += "    break: " + trialMngr._break_duration + " sec\n";
					}

					out += "    trial["+ (stimMngr.currentIndex) +"]\n";
					out += "      stim: " + stim + "\n";
					out += "      cond: " + cond + "\n";

					if (detailed === 2){
						const indent = "      ";
						const trial_out = indent+trialMngr
							.toString()
							.split("\n")
							.slice(0,-1)
							.join("\n"+indent)+"\n";
						out += trial_out;
					}
				}
				stimMngr.reset();
			}
			else{
				for(let iEl = 0; iEl < trialMngr.flow.length; iEl++){
					out += "    " + trialMngr.flow[iEl].name + "\n";
				}
			}
		}
		
		return out;
	}
}

export {Trial, Experiment};
