/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2021
 * @comment 
 */
"use strict";

class Localise{

	constructor(lang){

		this.path = "./res/lang/str_";
		this.src = this.path + lang + ".json";

		this.dict = null;
		this.scene_labels = null;
		this.scene_labels_dict = null;

		this.token = "${}";
		this.regex = /\${}/

		this._ready = false;

		const this_ = this;
		$.getJSON(this.src)
		.then(function(data){

			this_.dict = data

			// Process localised scene names
			this_.scene_labels = [];
			this_.scene_labels_dict = {};
			const room_keys = ["bathrm", "bedrm", "conf.rm", "kitchen", "lect.hall", "livi.rm", "off.spc", "resto"];
			room_keys.forEach((key) => {
				const val = this_.get(key);
				this_.scene_labels_dict[key] = val;
				this_.scene_labels.push(val);
			});
			
			this_.scene_labels = this_.scene_labels.sort();

			this_._ready = true;
		})
		.fail(function(message) {
			console.error(message);
			alert("Error reading localisation data:\n"+
				  new URL(this_.src, document.baseURI).href);
		});
	}

	get(key, return_null_on_missing=false){
		if ( !(key in this.dict) ){
			if (return_null_on_missing) return null;

			return "MISSING_KEY: " + key;
		}

		let str = this.dict[key];

		return this._apply(str, [...arguments].slice(1), key);
	}

	_apply(str, args, key){
		// Find and replace token in string
		let i = 0;
		let alerted = false
		while (this.regex.test(str)){

			if (i >= args.length){
				const err_msg = `[Localise] String "${key}" requires more arguments than was provided to the function.`;
				console.error(err_msg);
				if (!alerted){
					alert(err_msg);
					alerted = true;
				}
				str = str.replace(this.regex, "MISSING_ARG_" + i);
			} else {
				str = str.replace(this.regex, args[i]);
			}

			i++;
		}

		return str;
	}

	get isReady(){
		return this._ready;
	}
}

export { Localise };
