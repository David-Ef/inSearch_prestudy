/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2023
 * @comment 
 */
"use strict";

import { shuffle_arr } from "./Utils.js";

class TrialData{
  constructor(src){
    this.src = src;
    this._ready = false;
    this._data = null

    this.playlist = null;

    // Needs to be asynchronous to dynamically load different playlists
    const _this = this;
    $.getJSON(this.src)
      .then(function(data){

        _this._data = data;

        _this._ready = true;
      })
      .fail(function(message) {
        alert("Error reading playlist file:\n"+
            new URL(src, document.baseURI).href);
      });
  }

  get isReady(){
    return this._ready;
  }
  get data(){
    return this._data;
  }

  setPlaylist(idx){
    this.playlist = this._data[idx];
  }
}

export { TrialData };
