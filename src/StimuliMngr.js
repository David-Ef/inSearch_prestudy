/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2023
 * @comment 
 */
"use strict";

class StimuliMngr{
	constructor(src, order = Array()){
		/**
		* Prepare a list of visual stimuli to serve to the protocol
		*	Behaves as an iterator
		*
		* @param {String} src - Link to a JSON file containing a list of links to stimuli
		* @param {Array} order - An array containing an ordered list of stimulus indices. Stimulus Indeces can repeat or be missing according to the presentation needs
		*/
		this.src = src;
		this.stim_list = Array(); // list of URIs
		this.stim_order = order; // Presentation order - may be empty at first

		this._index = -1;
		this._ready = false;

		this._root = "./res/";

		this.scene_names = ["bedroom", "kitchen", "living room", "office"];
		this.scene_list = [];
		this.scene_names.map((name) => {
			this.scene_list.push( name.replace(" ", "") + "_0" );
			this.scene_list.push( name.replace(" ", "") + "_1" );
		});

		if (typeof(src) === "object"){
			this.stim_list = src;

			if (!this.stim_order || this.stim_order.length === 0){
				this.stim_order = [...Array(this.stimLength).keys()];
			} else {
				this.stim_order = order;
			}

			this._ready = true;

		} else {
			// Needs to be asynchronous to dynamically load different playlists
			const _this = this;
			$.getJSON(this.src)
				.then(function(data){
					if (!data.hasOwnProperty("stim_list")
						&& !Array.isArray(data.stim_list)) {
						
						alert("File "+src+" must contain an array called \"stim_list\"");
						return;
					}

					_this.item_list = [];

					for (var key in data.stim_list) {
						_this.item_list.push([key, data.stim_list[key]]);
					}

					_this._ready = true;
				})
				.fail(function(message) {
					console.error(message);
					alert("Error reading stimuli list:\n"+
						  new URL(src, document.baseURI).href);
				});
		}
	}

	get isReady(){
		return this._ready;
	}
	get stimLength(){
		return this.item_list.length;
	}
	get length(){
		return this.stim_order.length;
	}

	get hasNext(){
		return (this._index+1) < this.length;
	}
	get currentScenePath(){
		return this._root + "scenes/" + this.scene_list[this.stim_order[this._index][1]] + ".jpg";
	}
	get currentSceneObjectPath(){
		const item_index = this.stim_order[this._index][0];
		const item_raw_name = this.item_list[item_index][0];

		return this._root + "objects/targets/" + item_raw_name + ".webm";
	}
	get currentSceneObjectName(){
		return this.item_list[this.stim_order[this._index][0]][1];
	}
	get currentSceneIndex(){
		return this.stim_order[this._index];
	}
	get currentIndex(){
		return this._index;// > 0 ? this._index-1:0;
	}
	get currentStimIndex(){
		return this.stim_order[this._index];
	}

	get currentSceneName(){
		return this.scene_list[this.stim_order[this._index][1]];
	}
	get currentSceneType(){
		return this.scene_list[this.stim_order[this._index][1]].split("_")[0];
	}

	next(){
		if (this.hasNext){
			++this._index;
			return this.currentScenePath, this.currentSceneObjectPath;
			}
		else
			return null;
	}

	reset(){
		this._index = -1;
	}
}

export { StimuliMngr };
