/**
 * @author Erwan David <David@psych.uni-frankfurt.de>
 * @lab SGL, Goethe University, Frankfurt
 * @year 2021
 * @comment 
 */
"use strict";

import { DataMngr } from "./DataMngr.js";
import { Modal, ModalData } from "./Modal.js";

class BaseQuestItem{
    constructor(question=null,
                id=null,
                callback=null,
                tooltip=null
                ){

        // Param
        this._question = question;
        this._id = id;
        this._callback = callback;
        this._tooltip = tooltip || "";

        // Properties to create
        this._html = null;
        this._select = null;
    }

    _buildHTML(){
    
        this._html = `<p title="${this._tooltip}" id="Quest_${this._id}">${this._question}</p>`;
    }

    get answer(){
        return this._getValue();
    }

    _getValue(){
        throw new Error("[NotImplementedException] Method \"_getValue\" must be implemented by inheriting class.");
    }

    asModalData(title=""){
        throw new Error("[NotImplementedException] Method \"asModalData\" must be implemented by inheriting class.");
    }
}

class ModalWrapper extends ModalData{
    constructor(QuestObj,
                title,
                choices,
                after_build_callback=null,
                width=500
                ){

        // Called when modal is closed
        const callback = () => {
            const ans = QuestObj.answer;
            DataMngr.instance.write(`Quest.[${QuestObj._id}] answer: ${ans}`, true);

            if (typeof(QuestObj._callback) === "function"){
                QuestObj._callback(ans);
            }
        }

        // after_build_callback is called after the modal is displayed
        super(title, QuestObj._html, choices, callback, width, after_build_callback);
    }
}

// ======= Single value items =======
class SingleAnswer extends BaseQuestItem{
    constructor(question=null,
                callback=null,
                tooltip=null
                ){

        super(question, callback, tooltip);
    }

    asModalData(title="", after_build_callback){

        return ModalWrapper(this, title, choices, callback);
    }
}

class NumericalAnswer extends SingleAnswer{
    constructor(question=null,
                id=null,
                callback=null,
                tooltip=null
                ){

        super(question, id, callback, tooltip);
    }
}

// ======= Text items =======
class TextAnswer extends BaseQuestItem{
    constructor(question=null,
                id=null,
                callback=null,
                tooltip=null
                ){

        super(question, id, callback, tooltip);

    }
}

class LetterAnswer extends TextAnswer{
    constructor(question=null,
                id=null,
                callback=null,
                tooltip=null
                ){

        super(question, id, callback, tooltip);

    }
}

class WordAnswer extends TextAnswer{
    constructor(question=null,
                id=null,
                callback=null,
                tooltip=null
                ){

        super(question, id, callback, tooltip);

    }
}

class LineAnswer extends TextAnswer{
    constructor(question=null,
                id=null,
                callback=null,
                tooltip=null
                ){

        super(question, id, callback, tooltip);

        this._buildHTML();
    }

    _getValue(){
        return $(`input[id="${this._id}"]`).val();
    }

    _buildHTML(){
        super._buildHTML();

        this._html += `<input style="width: 400px;" type="text" id="${this._id}">`;
    }

    asModalData(title="", after_build_callback=null){

        const _after_build_callback = (modal) => {
            function setButtonEnabled(bool){
                $(`button:contains("Accept")`)
                  .prop("disabled", !bool)
                  .css("color", bool?"black":"gray");
            }

            setButtonEnabled(false);

            // Set enabled if at least one character is entered
            $(`input[id="${this._id}"]`).on("keyup", (el) => {
                setButtonEnabled(this._getValue().length > 0);
            });

            if (after_build_callback !== null) {
                after_build_callback(modal);
            }
        };

        return new ModalWrapper(this, title, ["Accept"], _after_build_callback);
    }
}

class ParagraphAnswer extends TextAnswer{
    constructor(question=null,
                id=null,
                callback=null,
                tooltip=null
                ){

        super(question, id, callback, tooltip);
    }
}

// \-> One word
//      \-> With autocompletion
// \-> Few words
//      \-> Max number of words
//      \-> Max number of letters
//      \-> With autocompletion
// \-> Free line
//      \-> Max number of words
//      \-> Max number of letters
// \-> Free text field
//      \-> Max number of words
//      \-> Max number of letters

// ======= Choice items =======
class ChoiceItem extends BaseQuestItem{
    constructor(question,
                choices,
                id=null,
                callback=null,
                tooltip=null
                ){

        super(question, id, callback, tooltip);

        this._choices = choices;

    }
}

class UniqueChoiceItem extends ChoiceItem{
    
}

class MultipleChoiceImage extends ChoiceItem{
    constructor(question="",
                imageTemplate=null,
                choices=[],
                id=null,
                tooltip=null,
                callback=null
                ){

        // Check that minMaxNAns is an array and contains 2 elements
        //  Rearrange elements in array if they are not ordered

        super(question, choices, id, callback, tooltip);

        this._imageTemplate = imageTemplate;
        this._start = choices[0];
        this._nImages = choices[1];

        this._buildHTML();
    }

    _getValue(){
        const selector = `input[name^="${this._id}"]`;
        const checked = [];

        $(selector).each((idx, el) => {
            if (el.checked){
                checked.push(idx);
            }
        });

        return checked;
    }

    _buildHTML(){
        super._buildHTML();

        const regex = /\${}/;
        const img_path = "./res/mrt/"

        for (let i = 0; i < this._nImages; i++){
            const img_name = this._imageTemplate.replace(regex, this._start + i);

            this._html += `<label class="checkb-MRT">`;

            this._html += `<div><img src="${img_path}${img_name}"></div>`;

            // First element is the target so it doesn't need a checkbox
            if (i>0){
                this._html += `<input type="checkbox" id="${this._id}_${i}" name="${this._id}_${i}" value="${i}">`;
            }

            this._html += "</label>";
        }
    }

    asModalData(title="", after_build_callback=null){

        const _after_build_callback = (modal) => {
            function setButtonEnabled(bool){
                $(`button:contains("Accept")`)
                  .prop("disabled", !bool)
                  .css("color", bool?"black":"gray");
            }

            setButtonEnabled(false);
            const selector = `input[name^="${this._id}"]`;

            $(selector).on("change", (el) => {

                let count = 0;

                $(selector).each((idx, el) => {
                    count += el.checked?1:0;
                });

                if (count < 2){
                    setButtonEnabled(false);
                } else if (count > 1){
                    setButtonEnabled(true);

                    if (count > 2){
                        el.target.checked = false;
                    }
                }

            });

            if (after_build_callback !== null) {
                after_build_callback(modal);
            }
        };

        return new ModalWrapper(this, title, ["Accept"], _after_build_callback, 1000);
    }
}

class UniqueChoice extends ChoiceItem{
    constructor(question="",
                choices=[],
                id=null,
                tooltip=null,
                type="radio",
                callback=null
                ){

        super(question, choices, id, callback, tooltip);

        if (["radio", "dropdown"].indexOf(type) === -1){
            throw new Error(`Parameter "type" of ${this.constructor.name} must be "radio" or "dropdown" (got "${type})".`);
        }

        this._type = type;

        this._buildHTML();
    }

    _getValue(){
        if (this._type === "radio"){
            return $(`input[name="${this._id}"]:checked`).get(0).value;
        } else {
            return $(`select[name="${this._id}"]`).get(0).value;
        }
    }

    _buildHTML(){
        super._buildHTML();

        // Select answer
        if (this._type === "radio"){
            this._choices.forEach((el, iel) => {
                this._html += `<label style="margin-left:10px;"><input type="radio" id="${this._id}" name="${this._id}" value="${el}">${el}</label>`;
            });
        } else{
            this._html += `<select id="Quest_${this._id}" name="${this._id}">`
            this._html += `<option  disabled selected>Select an option:</option>`
            this._choices.forEach((el) => {
                this._html += `<option>${el}</option>`;
            });
            this._html += `</select>`;
        }
    }

    // After modal build
        // Deactivate "Accept" button
        //  Checkbox - can't deselect so reactivate on any choice
        //  Dropdown - can't select neutral option so reactivate on any choice

    asModalData(title=""){

        function setButtonEnabled(bool){
        $(`button:contains("Accept")`)
          .prop("disabled", !bool)
          .css("color", bool?"black":"gray");
        }

        const after_build_callback = (modal) => {
            setButtonEnabled(false);

            if (this._type === "radio"){
                $(`input[name="${this._id}"]`).on("change", () => {
                    setButtonEnabled(true);
                    $(`input[name="${this._id}"]`).off("change");
                });
            } else {
                $(`select[name="${this._id}"]`).on("change", (el) => {
                    setButtonEnabled(true);
                    $(el).off("change");
                });
            }
        };

        return new ModalWrapper(this, title, ["Accept"], after_build_callback);
    }
}

// \-> Multiple choice
// \-> Exclusionary group choice
//      \-> Unique choice
//          \-> Binary choice
// \-> Image choice
//      \-> Mental Rotation test

// \-> Dropdown list
// \-> Checkboxes

// ======= Scale items =======
class Scale extends BaseQuestItem{
    constructor(question=null,
                id=null,
                callback=null,
                tooltip=null,
                extremas=[0,1000],
                labels=null,
                ){

        super(question, id, callback, tooltip);

        this._extremas = extremas;
        this._labels = labels;
    }

    _getValue(){
        return $(`input[id="${this._id}"]`).val();
    }

    asModalData(title="", after_build_callback=null){

        return new ModalWrapper(this, title, ["Accept"], after_build_callback);
    }
}

class DiscreteScale extends Scale{
    constructor(question=null,
                id=null,
                extremas=[0,20],
                labels="",
                callback=null,
                tooltip=null
                ){

        super(question, id, callback, tooltip, extremas, labels);

        this._buildHTML();
    }

    _buildHTML(){
        super._buildHTML();

        this._html += `<input id="${this._id}" type="range" min="${this._extremas[0]}" max="${this._extremas[1]}" value="${(this._extremas[0]+this._extremas[1])/2}" step="1" class="slider">`;

        this._html += `<br /><p style="text-align: right;" id="${this._id}" class="input_label"> ${(this._extremas[0]+this._extremas[1])/2} ${this._labels}</p>`;

    }

    asModalData(title=""){

        const after_build_callback = (modal) => {
            const sel = $(`.input_label#${this._id}`);

            $(`input#${this._id}`).on("input", (el) => {
                sel.text(`${el.target.value} ${this._labels}`);
            });
        };

        return new ModalWrapper(this, title, ["Accept"], after_build_callback);
    }
}

class ContinuousScale extends Scale{
    constructor(question=null,
                id=null,
                labels=null,
                callback=null,
                tooltip=null
                ){

        super(question, id, callback, tooltip, [0, 1000], labels);

        this._buildHTML();
    }

    _getValue(){
        // Return percentage
        return ($(`input[id="${this._id}"]`).val() / this._extremas[1]) * 100;
    }

    _buildHTML(){
        super._buildHTML();

        this._html += `<input id="${this._id}" type="range" min="${this._extremas[0]}" max="${this._extremas[1]}" value="${(this._extremas[0]+this._extremas[1])/2}" step="1" class="slider">`;

        if (this._labels !== null && this._labels.length == 2){
            this._html += `<table style="width:100%"><tr><td>${this._labels[0]}</td><td style="text-align: right;">${this._labels[1]}</td></tr></table>`;
        }
    }
}

class DiscreteRange extends DiscreteScale{
    constructor(question=null,
                id=null,
                callback=null,
                tooltip=null
                ){

        super(question, id, callback, tooltip);

    }
}

class ContinuousRange extends ContinuousScale{
    constructor(question=null,
                id=null,
                callback=null,
                tooltip=null
                ){

        super(question, id, callback, tooltip);

    }
}

export { UniqueChoice,
    DiscreteScale, ContinuousScale,
    LineAnswer,
    MultipleChoiceImage,};
