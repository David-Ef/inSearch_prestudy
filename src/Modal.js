/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2021
 * @comment 
 */
"use strict";

import { DataMngr } from "./DataMngr.js";

class ModalData{
	constructor(title=null,
				content=null,
				choices=[window.localise.get("btn.yes"), window.localise.get("btn.no")],
				on_close_callback=null,
				width=null,
				after_build_callback=null
				){

		this._title = title;
		this._content = content;
		this._after_build_callback = after_build_callback;
		this._choices = choices || [];
		this._on_close_callback = on_close_callback;
		this.to_close = false;

		this.width = width || 500;

		this.parent = null;
	}

	get title(){
		if ( typeof(this._title) === "function" ){
			this._title = this._title(this.parent);
		}
		
		return this._title;
	}

	get content(){
		if ( typeof(this._content) === "function" ){
			this._content = this._content(this.parent);
		}

		return this._content;
	}

	get choices(){
		if ( typeof(this._choices) === "function" ){
			this._choices = this._choices(this.parent);
		}
		
		return this._choices;
	}

	get on_close_callback(){
		return this._on_close_callback;
	}
}

class Modal {

	constructor(modalData){
		if ( !(modalData instanceof ModalData) ) {
			console.error("Value of parameter (modalData) passed to Modal.ctor is not an instance of ModalData")
			return null;
		}

		this.data = modalData;
		this.data.parent = this;

		this.HTMLcontent = null;
		this.buttons = null;

		this.modal_window = null
		this.answer = null;
	}

	build(){
		let css_styling = "";
		if (this.data.title === null){
			css_styling = "style=\"text-align: center; vertical-align: middle; line-height: 90px;\"";
		}

		this.HTMLcontent = "<div id=\"dialog-confirm\" " +
			css_styling + " title=\"" +
			this.data.title + "\"><p> " +
			this.data.content + "</p></div>";

		this.buttons = {};
		this.data.choices.map((val) => {
			this.buttons[val] = () => {
				this.answer = val;
				this.close();
			};
		});

		return this;
	}

	show(position={ my: "center", at: "center", of: window }){

		$("#modal-container").append(this.HTMLcontent);

		this.modal_window = $("#dialog-confirm")

		this.modal_window.dialog({
			dialogClass: "no-close",
			height: "auto",
			width: this.data.width,
			modal: true,
			draggable: false,
			resizable: false,
            closeOnEscape: false,
			buttons: this.buttons,
			position: position
		});

		if (typeof(this.data._after_build_callback) === "function"){
			this.data._after_build_callback(this);
		}

		if (this.data.title === null){
			$(".ui-dialog-titlebar").remove()	
		}

		if (this.data.content === null){
			$(".ui-dialog-content").css("max-height", "0px")	
		}

		if (this.data.to_close){
			this.close();
		}

		return this;
	}

	hide(){
		if (this.isUp){
			this.modal_window.hide();
		}

		return this;
	}

	close(){

		if (typeof(this.data.on_close_callback) === "function"){
			this.data.on_close_callback(this.answer);
		}

		// this.modal_window.dialog("close")
		this.modal_window.remove();
		
		DataMngr.instance.write("Answer: " + this.answer, true);
		Modal.last_answer = this.answer;
	}

	get isUp(){
		return !!this.modal_window && this.modal_window.is(":visible");
	}

	get lastAnswer(){
		return Modal.last_answer;
	}
}

Modal.last_answer = null;

export { ModalData, Modal };