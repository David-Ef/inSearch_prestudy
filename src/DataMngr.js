/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2020
 * @comment 
 */
"use strict";

// class DataSample{
// 	constructor(ts, x, y, type){
// 		this.timestamp = ts;
// 		this.x = x;
// 		this.y = y;
// 		this.type = type;
// 	}
// }

class DataStore{
	constructor(preallocateN = 100) {
		this.preallocateN = preallocateN;
		this.icurr = 0;
		this._store = Array(preallocateN);
	}

	preallocate(N){
		// Could be replaced by an object if preallocation is not needed
		this._store = this._store.concat(Array(this.preallocateN));
	}

	append(data){
		// if (! (data instanceof DataSample) ){
		// 	console.error("data object passed is not of Class \"DataSample\".")
		// 	return;
		// }

		this._store[this.icurr++] = [Date.now().toString(), data];

		if (this.icurr >= this._store.length){
			this.preallocate(this.preallocateN);
		}
	}

	get length() {
		return this.icurr-1;
	}

	get data(){
		return this._store.slice(0, this.icurr);
	}
}

class DataMngr{

	instance = null;

	constructor(name="unnamed"){

		this.saved_data = {}
		this.name = null;
		DataMngr.instance = this;
	}

	start_record(idx, name) {
		if (this.isRecording){
			this.stop_record();
		}

		// const name_ext = name.split(/[\\/]/).pop(); // Get basename
		// const name_short = name_ext.split(/\./).shift(); // Remove file extension

		this.session_name = idx.toFixed()+"-"+name;

		while(this.session_name in this.saved_data){
			this.session_name += ".";
			console.warn("Key \"" + this.session_name + "\" already exists in \"saved_data\". Renaming to \"" + this.session_name + "\".")
		}

		this.saved_data[this.session_name] = new DataStore();

		this.write("data recording started");

		return this.session_name;
	}

	stop_record(){
		if (!this.session_name){
			console.warn("No DataMngr session to stop.")
			return false
		}
		
		this.write("data recording stopped");

		// Automatically slice data to remove preallocated values
		this.saved_data[this.session_name] = this.saved_data[this.session_name].data;
		this.session_name = null;

		return true;
	}

	write(entry){

		print("[DataMngr] " + entry);

		if (!this.isRecording){
			return;
		}

		this.saved_data[this.session_name].append(entry);
	}

	export(experiment_shortname){
		const blob = new Blob([this.get(true)], { type: "application/json;charset=utf-8" });
		saveAs(blob, experiment_shortname + "_" + Date.now().toString() + ".json");
	}

	get(stringify=false){
		if (stringify){
			return JSON.stringify(this.saved_data);
		}
		else {
			return this.saved_data;
		}
	}

	get isRecording(){
		return !!this.session_name;
	}
}

export { DataMngr };
