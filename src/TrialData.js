/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2020
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

        // For all playlists
        for (let ipl = 0; ipl < _this.data.length; ipl++){
          let playlist = _this._data[ipl];

          // Randomise scene orders
          //  Cut into parts of 20 trials
          const parts = [];
          for (let iscene = 0; iscene < 8; iscene++){
            parts[iscene] = playlist.slice(iscene*20, (iscene+1)*20)
          }
          //  Shuffle array of range(8)
          const idx_arr = [...Array(8).keys()]
          shuffle_arr(idx_arr);
          //  Put parts in place according to shuffle array
          _this.data[ipl] = [];
          for (let iscene = 0; iscene < 8; iscene++){
            _this.data[ipl] = _this.data[ipl].concat(
              parts[idx_arr[iscene]].map((el) => {
                return [idx_arr[iscene], el];
              })
            );
          }
        }

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
