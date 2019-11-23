const config = {
	pathToSound: 'assets/sound/',
}

let state = {
	shouldKill: true,
	locked: true,
	soundOn: true,
}


function toggleKill(){ 
	state.shouldKill = !state.shouldKill; 
	return state.shouldKill;
}

function toggleLock(){
	state.locked = !state.locked;
	return state.locked;
}

function toggleSound(){
	state.soundOn = !state.soundOn;
	return state.soundOn;
}

const lockBtn = document.getElementById('lockBtn');
lockBtn.addEventListener('click', function(){
	if (toggleLock()){
		lockBtn.classList.add('locked')
	} else {
		lockBtn.classList.remove('locked');
	}
});

const soundBtn = document.getElementById('soundBtn');
soundBtn.addEventListener('click', function(){
	if (toggleSound()){
		soundBtn.classList.remove('off');
	} else {
		soundBtn.classList.add('off');
	}
});

/* 
	SOUND SETUP 
	
	sounds recorded at https://twistedwave.com/online
*/
let letters = "abcdefghijklmnopqrstuvwxyz";
let lettersArr = letters.split('');
let numericArr = "1234567890".split('');
let lettersCapitalArr = letters.toUpperCase().split('');
let otherKeys = [
	"Enter", "CapsLock", "Shift", "Control", "Alt", "Backspace",
	"ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "NumLock", "PageUp", "PageDown",
	"Home", "End", "Insert", "Delete", "Escape", "Tab", "Pause", "ScrollLock", "Cancel",
	"F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"
];
let otherKeysMap = []
otherKeysMap[" "] = "Spacebar";
otherKeysMap["."] = "Period";
otherKeysMap[","] = "Comma";
otherKeysMap["/"] = "Forward Slash";
otherKeysMap[":"] = "Colon";
otherKeysMap[";"] = "Semicolon";
otherKeysMap["'"] = "Apostrophe";
otherKeysMap["\""] = "Double Quote";
otherKeysMap["["] = "Left Bracket";
otherKeysMap["{"] = "Left Curly Brace";
otherKeysMap["]"] = "Right Bracket";
otherKeysMap["}"] = "Right Curly Brace";
otherKeysMap["\\"] = "Backslash";
otherKeysMap["|"] = "Pipe";
otherKeysMap["+"] = "Plus";
otherKeysMap["-"] = "Subtraction";
otherKeysMap["*"] = "Asterisk";
otherKeysMap["`"] = "Backtick";
otherKeysMap["~"] = "Tilde";
otherKeysMap["!"] = "Exclamation Point";
otherKeysMap["@"] = "At Symbol";
otherKeysMap["#"] = "Pound";
otherKeysMap["$"] = "Dollar Sign";
otherKeysMap["%"] = "Percent";
otherKeysMap["^"] = "Carat";
otherKeysMap["&"] = "Ampersand";
otherKeysMap["("] = "Left Parenthesis";
otherKeysMap[")"] = "Right Parenthesis";
otherKeysMap["_"] = "Underscore";
otherKeysMap["="] = "Equals";
otherKeysMap["?"] = "Question Mark";
otherKeysMap["Meta"] = "Windows Key";
otherKeysMap["ContextMenu"] = "Context Menu";
for (let prop in otherKeysMap){
	let val = otherKeysMap[prop];
	otherKeys.push(val);
}
let soundNames = lettersArr.concat(otherKeys.concat(numericArr));
otherKeys = otherKeys.concat(lettersCapitalArr);


let sounds = {};
soundNames.forEach((each) => {
	let filename = config.pathToSound + each + ".wav";
	sounds[each] = new Audio(filename);
})
lettersCapitalArr.forEach((each) => {
	let filename = config.pathToSound + each.toUpperCase() + ".wav";
	sounds[each] = new Audio(filename);
})

let activeLetters = [];
document.addEventListener('keydown', (e) => {
	if (state.locked)
		e.preventDefault();
	console.log(e.key);
	let letter = null;
	if (soundNames.indexOf(e.key) != -1 || otherKeys.indexOf(e.key) != -1){
		letter = new Letter(e.key, sounds[e.key]);
	} else if (otherKeysMap[e.key]){
		let otherKey = otherKeysMap[e.key];
		letter = new Letter(otherKey, sounds[otherKey]);
	}

	if (letter != null){
		activeLetters.push(letter);
	}
	if (state.locked){
		e.stopPropagation();
		return false;
	}
})

function step(timestamp){
	let canvas = document.getElementById("view");
	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	activeLetters.forEach((each) => {
		each.live(timestamp);
		if (each.shouldDie(timestamp)){
			each.die(state.shouldKill);
		}
	})
	activeLetters = activeLetters.filter((each) => {
		return each.living;
	})
	window.requestAnimationFrame(step);
}
window.requestAnimationFrame(step);

class Letter{

	constructor(text, sound, start){
		this.text = text;
		this.sound = sound;
		this.birth = null;
		this.lifespan = 10000;
		this.living = true;
		this.size = 50;
		this.color = "blue";
		this.speed = 3;
		let canvas = document.getElementById('view');
		let randomX = Math.floor(Math.random() * (canvas.width - this.size)) + this.size;
		this.ctx = canvas.getContext('2d');
		this.pos = {
			x: randomX,
			y: -this.size
		}

	}

	play = () => {
		let promise = this.sound.play();
		if (promise !== undefined){
			promise.then(function(){

			}).catch(function(){
				console.log('failure playing audio');
			})
		}
	}

	shouldDie = (timestamp) => {
		if (timestamp - this.birth > this.lifespan)
			return true;
		else
			return false;
	}

	update = () => {
		this.pos.y += this.speed;
	}

	draw = () => {
		let c = this.ctx;

		/*
		c.beginPath();
		c.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI, false);
		c.fillStyle = this.color;
		//c.fill();
		c.lineWidth = 2;
		c.strokeStyle = '#003300';
		c.stroke();
		*/
		
		c.fillStyle = "#000";
		c.font = '20px serif';
		c.fillText(this.text, this.pos.x, this.pos.y);
	}

	display = () => {
		let lettersDiv = document.querySelector('#letters');
		let keyDisplay = document.createElement('div');
		keyDisplay.innerText = this.text + '\n';
		keyDisplay.classList.add('keyDisplay');
		lettersDiv.append(keyDisplay);
		this.html = keyDisplay;
	}

	die = (kill = true) => {
		if (kill){
			//this.html.remove();
			this.living = false;
		}
	}

	live = (timestamp) => {
		if (!this.birth){
			this.birth = timestamp;
			if (state.soundOn){
				this.play();
			}
		}
		this.update();
		this.draw();
	}
}