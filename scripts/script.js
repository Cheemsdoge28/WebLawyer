//debug
var viewportWidth = window.innerWidth;
var viewportHeight = window.innerHeight;

console.log("Viewport width: " + viewportWidth);
console.log("Viewport height: " + viewportHeight);

var screenWidth = window.screen.width;
var screenHeight = window.screen.height;

console.log("Screen width: " + screenWidth);
console.log("Screen height: " + screenHeight);

var screenWidth = window.screen.width;
var screenHeight = window.screen.height;
var desiredRatio = 3 / 2;

var viewportWidth = screenWidth;
var viewportHeight = Math.floor(screenWidth / desiredRatio);

if (viewportHeight > screenHeight) {
    viewportHeight = screenHeight;
    viewportWidth = Math.floor(screenHeight * desiredRatio);
}

document.querySelector("meta[name=viewport]").setAttribute("content", "width=" + viewportWidth + ", height=" + viewportHeight + ", initial-scale=1");
const globalState = "dialogue"
async function fadeIn(element) {
    await anime({
        targets: element,
        opacity: 1,
        duration: 200, // duration in milliseconds
        easing: 'easeInOutQuad', // easing function
        complete: () => {
        }
    }).finished;
}

async function fadeOut(element) {
    await anime({
        targets: element,
        opacity: 0,
        duration: 200, // duration in milliseconds
        easing: 'easeInOutQuad', // easing function
        complete: () => {
        }
    }).finished;
}

const myElement = document.getElementById('myElement');
fadeIn(myElement);

function isPositiveFloat(str) {
    var positiveFloatRegex = /^\d*\.?\d+$/;
    return positiveFloatRegex.test(str);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class CustomAudio {
    constructor(name, path) {
        this.name = name;
        this.path = path;
    }

    play() {
        let audio = new Audio(this.path);
        audio.play();
    }
}

let textBoxInstances = 0;
let characterInstances = 0;
lastAddedPos = null;
queue = [];
queuePos = 0;
class TextBox {
    constructor(className, name, audio, returnAudio, delay) {
        this.instanceNumber = ++textBoxInstances;
        this.delay = delay || 75;
        this.animIsRunning = false;
        this.prevText = '';
        this.nextText = '';
        this.defaultAudio = audio || new CustomAudio('click', 'audios/click.mp3');
        this.defaultReturnAudio = returnAudio || new CustomAudio('return', 'audios/return.mp3');
        this.element = document.createElement('div');
        this.paragraph = document.createElement('p');
        this.element.classList.add("common-styles")
        this.element.classList.add(className);
        this.element.id = "textBox" + this.instanceNumber;
        this.element.style.opacity = 0;
        this.element.appendChild(this.paragraph);
        this.nextIcon = document.createElement('img');
        this.nextIcon.classList.add("next-icon");
        this.nextIcon.classList.add("common-styles")
        this.nameTagDiv = document.createElement('div');
        this.nameTagDiv.classList.add("name-tag");
        this.nameTagDiv.classList.add("common-styles");
        this.nameTagDiv.textContent = name;
        this.element.appendChild(this.nameTagDiv);
        this.element.appendChild(this.nextIcon);
        document.body.appendChild(this.element);
        document.getElementById('textBox' + this.instanceNumber).addEventListener('click', () => {
            this.next();
        });
    }

    async addText(newText, animationBegin = '001', animationEnd = '000', audio = this.defaultAudio, returnAudio = this.defaultReturnAudio, delay = this.delay) {
        if (this.animIsRunning) {
            this.paragraph.innerHTML = newText;
            returnAudio.play();
            if (typeof this.owner !== 'undefined' && typeof this.owner.name !== 'undefined' && this.owner.spriteImg.src !== 'sprites/' + this.owner.name + '/' + 'Animation_' + animationEnd + '.gif') {
                this.owner.spriteAnimate(animationEnd);
            }
            this.animIsRunning = false;
            this.nextIcon.src = "images/next.png";
        } else {
            this.animIsRunning = true;
            if (typeof this.owner !== 'undefined' && typeof this.owner.name !== 'undefined' && this.owner.spriteImg.src !== 'sprites/' + this.owner.name + '/' + 'Animation_' + animationBegin + '.gif') {
                this.owner.spriteAnimate(animationBegin);
            }
            if (typeof this.owner !== 'undefined' && typeof this.owner.name !== 'undefined') {
                this.name = this.owner.name
            }
            this.nameTagDiv.textContent = this.name;
            this.nextIcon.src = "images/fastForward.png";
            await fadeOut(this.paragraph);
            this.paragraph.innerHTML = '';
            await fadeIn(this.paragraph);
            this.prevText = newText;
            let isTag = false;
            for (let i = 0; i < newText.length; ++i) {
                if (!this.animIsRunning) {
                    break;
                }
                this.paragraph.innerHTML = newText.slice(0, i + 1);
                const currentChar = newText[i];

                if (currentChar === '<') {
                    isTag = true;
                } else if (currentChar === '>') {
                    isTag = false;
                }

                if (!isTag) {
                    audio.play();
                    await sleep(delay);
                }

                if (i === newText.length - 1) {
                    if (typeof this.owner !== 'undefined' && typeof this.owner.name !== 'undefined' && this.owner.spriteImg.src !== 'sprites/' + this.owner.name + '/' + 'Animation_' + animationEnd + '.gif') {
                        this.owner.spriteAnimate(animationEnd);
                    }
                    returnAudio.play();
                    this.animIsRunning = false;
                    ++queuePos;
                    this.nextIcon.src = "images/next.png";
                }
            }
        }
    }

    setOwner(owner) {
        this.owner = owner;
    }

    updateOpacity(newOpacity) {
        if (isPositiveFloat(newOpacity)) {
            if (parseFloat(newOpacity) <= 1) {
                this.element.style.opacity = newOpacity;
            }
        }
    }

    hide() {
        this.updateOpacity("0");
    }

    show() {
        this.updateOpacity("0.75");
    }
    async addToQueue(eventType, eventData, addPos = null) {
        lastAddedPos = addPos;
        switch (eventType) {
            case 'text':
                const {
                    text, animationBegin, animationEnd, audio, returnAudio, delay
                } = eventData;
                if (addPos === null) {
                    queue.push({
                        type: eventType,
                        text,
                        animationBegin,
                        animationEnd,
                        audio,
                        returnAudio,
                        delay
                    });
                } else {
                    queue.splice(addPos, 0, {
                        type: eventType,
                        text,
                        animationBegin,
                        animationEnd,
                        audio,
                        returnAudio,
                        delay
                    });
                }
                break;
            case 'changeCharacter':
                const {
                    newCharacter
                } = eventData;
                if (addPos === null) {
                    queue.push({
                        type: eventType,
                        newCharacter
                    });
                } else {
                    queue.splice(addPos, 0, {
                        type: eventType,
                        newCharacter
                    })
                }
                break;
            case 'changeMusic':
                const {
                    diskId
                } = eventData;
                if (addPos === null) {
                    queue.push({
                        type: eventType,
                        diskId
                    });
                } else {
                    queue.splice(addPos, 0, {
                        type: eventType,
                        diskId
                    });
                }
                break;
            case 'changeScene':
                const {
                    bgIndex, fgIndex, character
                } = eventData;
                if (addPos === null) {
                    queue.push({
                        type: eventType,
                        bgIndex,
                        fgIndex,
                        character
                    });
                } else {
                    queue.splice(addPos, 0, {
                        type: eventType,
                        bgIndex,
                        fgIndex,
                        character
                    });
                }
                break;
            case 'options':
                console.log('added option event')
                const {
                    options, embed1, embed2, embed3
                } = eventData;
                if (addPos === null) {
                    queue.push({
                        type: eventType,
                        options,
                        embed1,
                        embed2,
                        embed3
                    });
                } else {
                    queue.splice(addPos, 0, {
                        type: eventType,
                        options,
                        embed1,
                        embed2,
                        embed3
                    });
                }
                break;
            default:
                console.error('Invalid event type:', eventType);
        }
    }
    async next() {
        if (queuePos <= queue.length - 1) {
            const {
                type,
                ...eventData
            } = queue[queuePos];
            switch (type) {
                case 'text':
                    const {
                        text, animationBegin, animationEnd, audio, returnAudio, delay
                    } = eventData;
                    if (this.animIsRunning) {
                        ++queuePos;
                    }
                    await this.addText(text, animationBegin, animationEnd, audio, returnAudio, delay);
                    break;
                case 'options':
                    const {
                        options, embed1, embed2, embed3
                    } = eventData;

                    // Create buttons
                    const button1 = document.createElement('button');
                    button1.textContent = options[0][0];
                    button1.classList.add('option-button');

                    const button2 = document.createElement('button');
                    button2.textContent = options[1][0];
                    button2.classList.add('option-button');

                    const button3 = document.createElement('button');
                    button3.textContent = options[2][0];
                    button3.classList.add('option-button');
                
                    const grid = document.getElementById('option-grid')
                    grid.appendChild(button1, button2, button3);
                    // Variable to track the currently pressed button
                    let selectedOption = null;

                    // Function to handle button click
                    const handleButtonClick = (option) => {
                        // If another button is already selected, remove the selected class
                        if (selectedOption) {
                            selectedOption.classList.remove('selected');
                        }
                        // Set the current button as selected
                        option.classList.add('selected');
                        // Update the selectedOption variable
                        selectedOption = option;

                        // Switch case based on the selected option
                        let lastI;
                        switch (option) {
                            case button1:
                                // Check if the options event should be duplicated before executing any actions
                                if (options[0][1] === false) {
                                    // Code to execute when button1 is selected
                                    let q = queuePos + 1;
                                    eval(embed1);
                                    lastI = lastAddedPos + 1;
                                    this.addToQueue('options', {
                                        options,
                                        embed1,
                                        embed2,
                                        embed3
                                    }, lastI);
                                    queue.splice(lastI+1, 1)
                                } else if (options[0][1] === true) {
                                    // Code to execute when button1 is selected
                                    let q = queuePos + 1;
                                    eval(embed1);
                                }
                                this.next();
                                ++queuePos
                                break;

                            case button2:
                                // Check if the options event should be duplicated before executing any actions
                                if (options[1][1] === false) {
                                    // Code to execute when button2 is selected
                                    let q = queuePos + 1;
                                    eval(embed2);
                                    lastI = lastAddedPos + 1;
                                    this.addToQueue('options', {
                                        options,
                                        embed1,
                                        embed2,
                                        embed3
                                    }, lastI);
                                    queue.splice(lastI+1, 1)
                                } else if (options[1][1] === true) {
                                    // Code to execute when button1 is selected
                                    let q = queuePos + 1;
                                    eval(embed2);
                                }
                                this.next();
                                ++queuePos
                                break;

                            case button3:
                                // Check if the options event should be duplicated before executing any actions
                                if (options[2][1] === false) {
                                    // Code to execute when button3 is selected
                                    let q = queuePos + 1;
                                    eval(embed3);
                                    lastI = lastAddedPos + 1;
                                    this.addToQueue('options', {
                                        options,
                                        embed1,
                                        embed2,
                                        embed3
                                    }, lastI);
                                    queue.splice(last1+1, 1)
                                } else if (options[2][1] === true) {
                                    //Code to execute when button1 is selected
                                    let q = queuePos + 1;
                                    eval(embed3);
                                }
                                this.next();
                                ++queuePos
                                break;

                            default:
                                console.error("Unknown option selected");
                                break;
                        }
                        // Remove buttons from the DOM
                        button1.remove();
                        button2.remove();
                        button3.remove();
                    };



                    // Add event listeners to each button
                    button1.addEventListener('click', () => handleButtonClick(button1));
                    button2.addEventListener('click', () => handleButtonClick(button2));
                    button3.addEventListener('click', () => handleButtonClick(button3));

                    // Append buttons to DOM
                    document.body.appendChild(button1);
                    document.body.appendChild(button2);
                    document.body.appendChild(button3);
                    break;


                case 'changeCharacter':
                    const {
                        newCharacter
                    } = eventData;
                    character.switchCharacter(newCharacter);
                    ++queuePos;
                    this.next(); // Automatically start the next event
                    break;
                case 'changeMusic':
                    const {
                        diskId
                    } = eventData;
                    jukebox.play(disks[diskId]);
                    ++queuePos;
                    this.next(); // Automatically start the next event
                    break;
                case 'changeScene':
                    const {
                        bgIndex, fgIndex, character: char
                    } = eventData;
                    currentScene.setBg(bgIndex);
                    currentScene.setFg(fgIndex);
                    character.switchCharacter(char);
                    ++queuePos;
                    this.next(); // Automatically start the next event
                    break;
                default:
                    console.error('Invalid event type:', type);
            }
        }
    }
}



class Character {
    constructor(className, name, textBoxClassName, audio, returnAudio, delay) {
        this.instanceNumber = ++characterInstances;
        this.name = name
        this.textBox = new TextBox(textBoxClassName, name, audio, returnAudio, delay);
        this.textBox.setOwner(this);
        this.spriteImg = document.createElement('img');
        this.spriteImg.classList.add('sprite');
        document.body.appendChild(this.spriteImg);
    }
    spriteAnimate(animNumber) {
        if (animNumber === undefined) {
            return false;
        }
        this.spriteImg.src = 'sprites/' + this.name + '/' + 'Animation_' + animNumber + '.gif';
        return true;

    }
    switchCharacter(characterName) {
        this.name = characterName
    }
}
diskIds = 0;
class Disk {
    constructor(name, path, looping = true) {
        this.name = name;
        this.path = path;
        this.id = diskIds++;
        this.audio = new Audio(this.path);
        this.audio.loop = looping;
        this.audio.volume = 1; // Start with volume set to 1
    }

    play() {
        this.audio.play();
    }

    pause() {
        this.audio.pause();
    }
}

class Jukebox {
    constructor() {
        this.currentDisk = null;
    }

    play(disk) {
        if (this.currentDisk) {
            this.currentDisk.pause();
        }
        this.lastdisk = disk;
        this.currentDisk = disk;
        this.currentDisk.play();
    }

    stop() {
        if (this.currentDisk) {
            this.currentDisk.pause();
            this.currentDisk = null;
        }
    }
}

const jukebox = new Jukebox();

const disk0 = new Disk('disk0', 'music/01. Phoenix Wright- Ace Attorney - Opening.mp3');
const disk1 = new Disk('disk1', 'music/02. Defendant Lobby - So it Begins.mp3');
const disk2 = new Disk('disk1', 'music/03. Phoenix Wright- Ace Attorney - Court is Now in Session.mp3');
const disk3 = new Disk('disk1', 'music/04. Cross-Examination - Moderato 2001.mp3');
const disk4 = new Disk('disk1', 'music/05. Tricks and Deductions.mp3');
const disk5 = new Disk('disk1', 'music/06. Phoenix Wright - Objection! 2001.mp3');
const disk6 = new Disk('disk1', 'music/07. Cross-Examination - Allegro 2001.mp3');
const disk7 = new Disk('disk1', 'music/08. Pursuit - Corner the Culprit.mp3');
const disk8 = new Disk('disk1', 'music/09. The Truth Revealed 2001.mp3');
const disk9 = new Disk('disk1', 'music/10. Suspense.mp3');
const disk10 = new Disk('disk1', 'music/11. Pursuit - Corner the Culprit (Variation).mp3');
const disk11 = new Disk('disk1', 'music/12. Jingle - There is No Stopping Here.mp3');

const disks = [disk0, disk1, disk2, disk3, disk4, disk5, disk6, disk7, disk8, disk9, disk10, disk11];
let isPlaying = false;

function togglePlayback() {
    if (isPlaying) {
        jukebox.stop();
    } else {
        if (jukebox.currentDisk) {
            jukebox.play(jukebox.currentDisk);
        } else if (jukebox.lastdisk) {
            jukebox.play(jukebox.lastdisk);
        }
    }
    isPlaying = !isPlaying;
}


const unmuteButton = document.getElementById('unmuteButton');
unmuteButton.classList.add('unmute-button')
unmuteButton.addEventListener('click', togglePlayback);

class DiskPlayElement extends HTMLElement {
    constructor() {
        super();
        // Get the value of the diskId attribute
        const diskId = parseInt(this.getAttribute('diskId'));
        if (!isNaN(diskId) && diskId >= 0 && diskId < disks.length) {
            jukebox.play(disks[diskId]);
        } else {
            console.error("Invalid diskId attribute value:", diskId);
        }
    }
}

// Register custom play element
customElements.define('disk-play', DiskPlayElement);

class ChangeSceneElement extends HTMLElement {
    constructor() {
        super();
        // Get the value of the diskId attribute
        const Bg = this.getAttribute('bg');
        currentScene.setBg(Bg);
        const Fg = this.getAttribute('bg');
        currentScene.setFg(Fg);
        const Character = this.getAttribute('character')
        character.switchCharacter(Character)
    }
}

// Register custom play element
customElements.define('change-scene', ChangeSceneElement);

class Scene {
    constructor(sceneName, bgIndex = '000', hasFg = false, fgIndex = '000') {
        this.character = undefined;
        this.sceneName = sceneName
        this.hasFg = hasFg;
        this.bg = document.getElementById('bg');
        this.fg = document.getElementById('fg');
    }

    setBg(index) {
        this.bg.src = "images/backgrounds/" + index + ".jpg"
    }
    setFg(index) {
        this.fg.src = 'images/foregrounds/' + index + ".png"
    }
}
//TODO
class Inventory {
    constructor() {
        this.items = [];
        this.count = 0;
    }
    addItem(item) {
        this.items.appendChild(item);
        ++this.count;
    }
    searchItem(nameToFind) {
        for (var i = 0; i < this.items.length; ++i) {
            if (this.items[i].name = itemName) {
                return i;
            }
        }
    }
    removeItem(nameToRemove) {
        indexToRemove = searchItem(nameToRemove);
        this.items.removeChild(this.items[i]);
        --this.counter;
    }
}

//scripting
// Instantiate TextBox and attach event listener to the button
courtRoom = new Scene('courtRoom', true, '000', true, '000');
currentScene = courtRoom
courtRoom.setBg('000');
courtRoom.setFg('000');
let character = new Character('character-class', 'Phoenix Wright', 'text-display-box', new CustomAudio('custom-click', 'audios/click.mp3'), new CustomAudio('custom-return', 'audios/return.mp3'), 75);
character.textBox.show();
jukebox.play(disk1);
// Add text to the queue
character.textBox.addToQueue('text', {
    text: 'This is <u>some</u> text.',
    animationBegin: '001',
    animationEnd: '000',
    delay: 75
});

// Change the character
character.textBox.addToQueue('changeCharacter', {
    newCharacter: 'Miles Edgeworth'
});

// Change the music (assuming you have defined disks)
character.textBox.addToQueue('changeMusic', {
    diskId: 8 // Play disk1
});

// Change the scene
character.textBox.addToQueue('changeScene', {
    bgIndex: '003',
    fgIndex: '003',
    character: 'Miles Edgeworth'
});

// Add text to the queue
character.textBox.addToQueue('text', {
    text: 'This is some text.',
    animationBegin: '001',
    animationEnd: '000',
    delay: 75
});

// Define options and embeds for each option
const options = [
    ["Option 1", true], // The second element indicates whether to duplicate the event if incorrect
    ["Option 2", false],
    ["Option 3", true]
];

// Define embedded events for each option
const embed1 = "character.textBox.addToQueue('text', {text: 'This is some text 1.', animationBegin: '001', animationEnd: '000', delay: 75 }, q);"
const embed2 = "character.textBox.addToQueue('text', {text: 'This is some text 2.', animationBegin: '001', animationEnd: '000', delay: 75 }, q);"
const embed3 = "character.textBox.addToQueue('text', {text: 'This is some text 3.', animationBegin: '001', animationEnd: '000', delay: 75 }, q);"


// Add options event to the queue
character.textBox.addToQueue('options', {
    options,
    embed1,
    embed2,
    embed3
});
character.textBox.addToQueue('text', {
    text: 'This is some text.',
    animationBegin: '001',
    animationEnd: '000',
    delay: 75
});