class WordsState {
	constructor() {
		this.currentWordIndex = 0;
		this.currentLetterIndex = 0;
		this.currentWordLength = 0;
		this.correctWordsCount = 0;
		this.currentWordState = "";
		this.typedState = "";
		this.words = [];
	}

	UpdateTypedState(userKey) {
		this.typedState += userKey;
	}
	
	RemoveFromCurrentState(userKey) {
		this.currentWordState = this.currentWordState.replace(userKey, "");
	}

	MoveLetterIndex() {
		this.currentLetterIndex++;
	}

	SwitchStateToNextWord() {
		let nextWord = ++this.currentWordIndex;
		this.currentWordLength = this.words[nextWord].length;
		this.currentWordState = this.words[nextWord];
		this.currentLetterIndex = 0;
		this.typedState = "";
	}
}

class Timer {
	constructor(stats, modal) {
		this.TIMER_TIME = 60;
		this.isInProgress = false;
		this.countdownNumberEl = document.getElementsByClassName("timer-time")[0];
		this.countdownNumberEl.textContent = this.TIMER_TIME;
		this.circle = document.getElementsByTagName("circle")[0];
		this.circle.setAttribute("stroke-dashoffset", "0px");
		this.countdown = this.TIMER_TIME;
		this.interval;
		this.Countdown = this.#countdown.bind(this);
		this.step = Math.round(this.#getDashArrayValue() / this.countdown);
		this.stats = stats;
		this.modal = modal;
	}

	Start() {
		this.isInProgress = true;
		this.interval = setInterval(this.Countdown, 1000);
	}

	#stop() {
		this.isInProgress = false;
		clearInterval(this.interval);
	}

	#countdown() {
		if(this.countdown <= 0){
			this.#stop();
			this.modal.Show(this.stats.charsPerMin, this.stats.wordsPerMin, this.stats.accuracy);
			return;
		}

		this.countdown--;
		this.countdownNumberEl.textContent = this.countdown;
		var dashOffset = parseInt(this.circle.getAttribute("stroke-dashoffset").replace("px", ""));
		this.circle.setAttribute("stroke-dashoffset", `${dashOffset + this.step}px`);
	}

	#getDashArrayValue() {
		return parseInt(this.circle.getAttribute("stroke-dasharray").replace("px", ""));
	}
}

class Modal {

	constructor() {
		this.modalContainer = document.getElementById('modal-container');
		this.closeBtn = document.getElementById('close-button');
		this.Close = this.#close.bind(this);
		this.closeBtn.addEventListener("click", this.Close);
		this.Show = this.#show.bind(this);
	}

	destroy() {
		this.closeBtn.removeEventListener("click", this.Close);
	}

 	#show(charsPerMin, wordsPerMin, accuracy) {
		let message = 
		`Well, you type at ${wordsPerMin}words/min, or ${charsPerMin}chars/min.
		Your accuracy is ${accuracy}%.
		Great! Keep practicing!`;

		let p = document.getElementById("modal-content").getElementsByTagName("p")[0];
		p.innerText = message;
		this.modalContainer.style.display = "block";
	}

	#close() {
		this.modalContainer.style.display = "none";
		this.destroy();
	}
}

class Stats {
	constructor() {
		this.wordsPerMin = 0,
		this.charsPerMin = 0,
		this.accuracy = 0,
		this.correctWordsCount = 0
		this.SetUiStats();
	}

	CalulateStats(currentWordLength, wordsCount, isInorrect) {
		if(!isInorrect){
			this.correctWordsCount++;
			this.charsPerMin += currentWordLength;
		}

		this.wordsPerMin = this.correctWordsCount;
		this.accuracy = Math.floor(this.correctWordsCount * 100 / wordsCount);
	}

	SetUiStats() {
		document.getElementsByClassName("words-min")[0].innerText = this.wordsPerMin;
		document.getElementsByClassName("chars-min")[0].innerText = this.charsPerMin;
		document.getElementsByClassName("accuracy")[0].innerText = this.accuracy;
	}
}


class InputService {
	#text;
	#timer;
	#modal;
	#state;
	#stats;

	constructor() {
		this.#text = ["ward","extract","reject","see","launch","knit","ban","width","breeze","profile","feeling","fix","jockey","poll","cancel","hole","biology","cut","trend","rank","risk","week","access","horror","flesh","cane","behead","issue","gloom","general","mislead","dive","power","wedding","distant","king","denial","buffet","mayor","blue","minimum","poor","trouble","grace","rain","rest","coal","code","ice","embryo","laundry","pasture","fear","red","rotten","creep","pig","muggy","raw","neglect","goat","bless","cellar","health","lick","raise","thinker","crisis","strike","faith","space","illness","culture","field","clue","movie","premium","margin","summer","due","north","powder","tune","chalk","lighter","boom","neutral","insert","sausage","seed","texture","contact","harm","light","social","claim","nail","buy","Koran","deadly","agenda","bounce","gap","trace","ranch","arch","skate","remark","sphere","mess","team","waste","damage","mosaic","coerce","sweet","throat","tape","enfix","aspect","grand","basket","calf","vacuum","smell","fleet","drain","guard","minor","cherry","money","race","suntan","design","count","play","smoke","brake","mold","gain","seed","bar","trade","stress","outer","system","title","salt","sip","sun","bay","eye","cow","nut","god","lay","use","owe","rib","fox","fur","us","lie","low","act","law","end","pin","say","ear","map","run","owl","pat","pit","war","day","go","dip","gun","tie","at","in","pay","pot","as","on","red","ex","he","bin","due","bag","sex","by"];
		this.#modal = new Modal();
		this.#state = new WordsState();
		this.#stats = new Stats();
		this.#timer = new Timer(this.#stats, this.#modal);
		this.TypingHandler = this.#typingHandler.bind(this);
		this.#initWordsState();
		this.#initHandler();
		this.#initInput();
	}

	Destroy() {
		document.getElementsByClassName("typed-container")[0].removeEventListener("input", this.TypingHandler);
		document.getElementsByClassName("typing")[0].removeEventListener("click", this.#clickTypingHandler);
	}

	#initInput() {
		let wordContainer = document.getElementsByClassName("input-container")[0];
		wordContainer.innerHTML = "";
		let typedContainer = this.#getTypedContainer();
		typedContainer.innerHTML = "";
		let repoLength = this.#state.words.length;

		for (let i = 0, id = 0; i < repoLength; i++) {
			let element = this.#state.words[i];
			wordContainer.appendChild(this.#createWordDiv(element, id++));
		}

		typedContainer.prepend(this.#createWordDiv("", 0, true));
	}

	#createWordDiv(innerHTML, id, typed) {
		let className = "word-container";
		let wordClassName = ` word-${id}`
		let typedClassName = ` input typed-word-${id}`
		let div = document.createElement("div");
		
		if(typed){
			div.setAttribute("contenteditable", true);
			div.onpaste = e => e.preventDefault();
		}
	
		div.className = className;
		div.className += typed ? typedClassName : wordClassName;
		div.innerHTML = innerHTML;
	
		return div;
	}

	#initWordsState() {
		this.#state.words = this.#shuffle(this.#text);
		let firstWord = this.#state.words[0];
		this.#state.currentWordLength = firstWord.length;
		this.#state.currentWordState = firstWord;
	}

	#typingHandler(e) {
		let userKey = e.inputType === "deleteContentBackward" ? "Backspace" : e.data;

		if(!this.#timer.isInProgress){
			this.#timer.Start();
		}

		this.#moveLetter(userKey);
	}

	#moveLetter(userKey){
		const STATE = this.#state;
		const WORD_CONTAINER_CLASS_NAME = `.word-${STATE.currentWordIndex}`;

		let wordElement = this.#getWordElement(WORD_CONTAINER_CLASS_NAME);
		let typedWordContainer = this.#getTypedWord(STATE.currentWordIndex);

		switch (userKey) {
			case " ":
				if(typedWordContainer.innerHTML === " "){
					typedWordContainer.innerHTML = "";

					return
				}

				this.#completeWord(STATE, wordElement, typedWordContainer);
			break;

			case "Backspace":
				let currentWord = STATE.words[STATE.currentWordIndex];
				STATE.typedState = STATE.typedState.slice(0, -1);
				
				if(typedWordContainer.innerHTML === STATE.typedState && !typedWordContainer.className.includes("incorrect")){
					if(STATE.currentLetterIndex > 0){
						STATE.currentLetterIndex--;
					}
					STATE.currentWordState = `${currentWord.charAt(STATE.currentLetterIndex)}${STATE.currentWordState}`;
					wordElement.innerHTML = STATE.currentWordState;
				}

				if(typedWordContainer.innerHTML === currentWord
					|| typedWordContainer.innerHTML + STATE.currentWordState === currentWord){
					typedWordContainer.className = typedWordContainer.className.replace(" incorrect", "");
				}
			break;

			default:
				STATE.UpdateTypedState(userKey);

				if(this.#isWordCprrect(typedWordContainer, STATE)){
					STATE.RemoveFromCurrentState(userKey);
					STATE.MoveLetterIndex();
					this.#updateUiWord(wordElement);
				} else {
					this.#setTypedWordIncorrect(typedWordContainer)
				}
			break;
		}
	}


	#clickTypingHandler() {
		document.getElementsByClassName("input")[0].focus();
	}

	#initHandler() {
		let typedContainer = document.getElementsByClassName("typed-container")[0];
		typedContainer.addEventListener("keydown", this.#preventDefault);
		typedContainer.addEventListener("input", this.TypingHandler);
		document.getElementsByClassName("typing")[0].addEventListener("click", this.#clickTypingHandler);
	}

	#preventDefault(e) {
		if (e.keyCode == 13)
		{
			e.preventDefault();
		}
	}

	#getWordElement(name) {
		return document.querySelector(name);
	}

	#getTypedWord(currentWordIndex) {
		return document.querySelector(`.typed-word-${currentWordIndex}`);
	}

	#isWordCprrect(typedWordContainer, state) {
		let position = state.currentLetterIndex;
		let typedWord = typedWordContainer.innerHTML;
		let slice = state.words[state.currentWordIndex].slice(position, position + 1);
		
		return !typedWordContainer.className.includes("incorrect") && slice === typedWord.slice(position, position + typedWord.length);
	}

	#updateUiWord(wordElement) {
		wordElement.innerHTML = this.#state.currentWordState;
	}

	#setTypedWordIncorrect(typedWordContainer) {
		if(typedWordContainer.className.includes("incorrect")) {
			return;
		}

		typedWordContainer.className = `${typedWordContainer.className} incorrect`;
	}

	#completeWord(state, wordElement, typedWordContainer) {

		typedWordContainer.innerHTML = typedWordContainer.innerHTML.trim();

		if(!this.#isWordCprrect(typedWordContainer, state)) {
			this.#setTypedWordIncorrect(typedWordContainer);
		}

		wordElement.remove();
		typedWordContainer.className = `${typedWordContainer.className} completed`.replace(" input", "");
		typedWordContainer.removeAttribute("contenteditable");

		let isInorrect = typedWordContainer.className.includes("incorrect");
		this.#stats.CalulateStats(state.currentWordLength, state.currentWordIndex + 1, isInorrect);
		this.#stats.SetUiStats();
		state.SwitchStateToNextWord();

		let wordContainer = this.#createWordDiv("", state.currentWordIndex, true);
		this.#getTypedContainer().prepend(wordContainer);
		wordContainer.focus();
	}

	#getTypedContainer() {
		return document.getElementsByClassName("typed-container")[0];
	}

	#shuffle(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}

		return arr;
	}
}

let service = new InputService();

let clsButton = document.getElementById("close-button");
clsButton.addEventListener("click", () => {
	service.Destroy();
	service = new InputService();
});
