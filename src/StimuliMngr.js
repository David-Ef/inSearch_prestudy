/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2020
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
		this.stim_order = order; // Presentation order

		print(this.stim_order);

		this._index = -1;
		this._ready = false;

		this._root = "./res/";

		this.scene_names = ["bedroom", "kitchen", "living room", "office"]

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

					_this.scene_list = [];
					_this.item_list = [];

					// Flatten lists
					const stim_list = [];
					data.stim_list.map( (el, id) => {
						const scene_type = el[0];
						const items = el[1];

						_this.scene_list.push(scene_type + "_0");
						_this.scene_list.push(scene_type + "_1");

						for (const [k, v] of Object.entries(items)) {
							_this.item_list.push([k, v]);
						}
					});

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
		return this._root + "/scenes/" + this.scene_list[this.stim_order[this._index][0]] + ".jpg";
	}
	get currentSceneObjectPath(){
		const item_index = this.stim_order[this._index][1];
		const item_raw_name = this.item_list[this.stim_order[this._index][1]][0];
		const item_scene_belong = this.scene_names[Math.floor( item_index / 30)].replace(" ", "");

		return this._root + "/objects/" + item_scene_belong + "/" + item_raw_name + ".webm";
	}
	get currentSceneObjectName(){
		return this.item_list[this.stim_order[this._index][1]][1];
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
		return this.scene_list[this.stim_order[this._index][0]];
	}
	get currentSceneType(){
		return this.scene_list[this.stim_order[this._index][0]].split("_")[0];
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
