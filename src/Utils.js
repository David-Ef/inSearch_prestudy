/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2020
 * @comment 
 */
"use strict";

function uuidv4() {
  return 'xyxx-xxxy-xxyx-yxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function shuffle_arr(arr){
	if (!Array.isArray(arr)){
		console.error(`Parameter "arr" is not an array (is ${typeof(arr)}`);
		return null;
	}
	// Fisher–Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let x = arr[i];
        arr[i] = arr[j];
        arr[j] = x;
    }
}

function loadJSON(path, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true);
    xobj.onreadystatechange = function () {

        if (xobj.readyState == 4) {
            if (xobj.status == "200") {
                callback(xobj.responseText);
            } else {
                callback(null);
            }
        }
    };
    xobj.send(null);  
}

export { uuidv4, shuffle_arr, loadJSON };
