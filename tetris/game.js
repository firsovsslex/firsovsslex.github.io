let field = document.querySelector("#field"),
score = document.querySelector("#score"),
start = document.querySelector("#play"),
cont = document.querySelector(".start"),
recordcont = document.querySelector(".records"),
record = document.querySelector("#record");

let div = document.createElement("div"),
p = document.createElement("p"),
level = document.createElement("div");

let coords = field.getBoundingClientRect();

if (!localStorage.getItem("record")) localStorage.setItem("record", "0");

addElements(div, p, level);

let colors = ["cyan", "blue", "orange", "yellow", "red", "green", "purple"];
preLoad(colors);



start.onclick = function() {
    Start();
};

function addElements(div, p, level) {
    
    // start.style.left = document.documentElement.clientWidth / 2 - start.offsetWidth / 2 + "px";
    // start.style.top = document.documentElement.clientHeight / 2 - start.offsetHeight / 2 + "px";   

    div.classList.add("next");

    div.style.top = coords.top + "px";
    div.style.left = coords.right + 50 + "px";

    p.classList.add("textNx");
    p.textContent = "Next";

    level.classList.add("level");
    level.textContent = "Level 1";

    recordcont.style.top = coords.top + 100 + "px";
    recordcont.style.left = coords.right + 50 + "px";

    let value = localStorage.getItem("record");
    record.textContent = "0".repeat(7 - value.length) + value;

    
}

function preLoad(urls){
    document.createElement('img').src = "img/blocks/white.png";
    for(let url of urls){          
        [`img/${url}.png`, `img/blocks/${url}.png`].forEach(url => document.createElement('img').src = url);
    }
}

function Start() {

    let pause = createFieldElement('div', 'pause', 'Pause');

    setElements();

    function setElements() {
        start.remove();
        cont.replaceWith(field);
        document.body.append(div);

        p.style.top = div.getBoundingClientRect().top - 100 + "px";
        p.style.left = div.getBoundingClientRect().left + "px";

        document.body.append(p);
        document.body.append(level);

        level.style.top = coords.top + "px";
        level.style.left = coords.left - level.offsetWidth - 25 + "px";

        pause.style.left = field.offsetWidth / 2 - pause.offsetWidth / 2 + "px";
        pause.style.top = field.offsetHeight / 2 - pause.offsetHeight / 2 + "px";
        pause.hidden = true;
    }

    let pole = {
        width: 10,
        height: 20,
        timer: null,
        isClearing: false,
        linesCleared: 0,
        level: 1,
        levels: 20,
        color: ["easy", "normal", "hard", "superhard"],
        scores: [40, 100, 300, 1200],
        currentLevel: 0,
        maxInterval: 800,
        interval: 800,
        max: 4,
        hardMode: 15,
        gameover: false,
        animInterval: 200,
        animateCount: 3,
        pressdown: false,
        paused: false
    };

    level.classList.add(pole.color[pole.currentLevel]);

    let klet = document.createElement("div");
    klet.classList.add("klet");

    pole.array = generateField(pole.width, pole.height);

    let types = ["I", "J", "L", "O", "Z", "S", "T"];

    let figures = [
        [[0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]],

        [[1, 0, 0],
         [1, 1, 1],
         [0, 0, 0]],

        [[0, 0, 1],
         [1, 1, 1],
         [0, 0, 0]],

        [[1, 1],
         [1, 1]],

        [[1, 1, 0],
         [0, 1, 1],
         [0, 0, 0]],

        [[0, 1, 1],
         [1, 1, 0],
         [0, 0, 0]],

        [[0, 1, 0],
         [1, 1, 1],
         [0, 0, 0]]
    ];

    class Figure {
        constructor(type) {
            this.type = type;
            this.arrf = null;
            this.currentWay = null;
            this.currentIndex = types.indexOf(this.type);
            this.figure = figures[this.currentIndex];
            this.stopped = false;
            this.mapStarted = false;
            this.x = pole.width / 2 - Math.floor(this.figure.length / 2);
            this.y = 0;
        }

        createFigure() {
            this.arrf = this.nextPosition(this.figure);
            if (!this.checkCollision(this.figure)) {
                lose();
                return;
            }
            this.changeFigureInNextPosition();
            return this;
        }

        attachFigure() {
            let result = this.checkCollision(this.figure);
            if (!result) {
                this.stopped = true;
                this.stop();
                if (!this.checkLose(this.figure)) checkField();
                return;
            }

            this.mapFigure(result);
        }

        checkLose(figure) {
            let height = figure.reduce(
                (prev, arr) => (prev + arr.includes(1) ? 1 : 0),
                0
            );
            if (this.y + figure.length - height <= 0) {
                lose();
                return true;
            }
        }

        mapFigure(result) {
            this.arrf.flat().forEach((block) => {
                block.isFigureBody = false;
                block.style.backgroundImage = "";
            });

            this.arrf = result;

            this.changeFigureInNextPosition();
        }

        changeFigureInNextPosition(){
            this.arrf.flat().forEach((block) => {
                block.isFigureBody = true;
                block.style.backgroundImage = `url(
                    img/blocks/${colors[this.currentIndex]}.png
                )`;
            });
        }

        nextPosition(array) {
            let blocks = [];
            for (let i = 0; i < array.length; i++) {
                let line = [];
                for (let j = 0; j < array[i].length; j++) {
                    let block = pole.array[this.y + i]?.[this.x + j];
                    if (array[i][j]) {
                        line.push(block);
                    }
                }
                blocks.push(line);
            }
            return blocks;
        }

        checkCollision(figure) {
            let blocks = this.nextPosition(figure);

            if (blocks.flat().some((block) => !block || block.isBlocked)) {
                return false;
            }

            return blocks;
        }

        rotateFigure() {
            let result = [];
            for (let j = 0; j < this.figure[0].length; j++) {
                let line = [];
                for (let i = 0; i < this.figure.length; i++) {
                    line.push(this.figure[i][j]);
                }
                result.push(line.reverse());
            }

            if (!this.checkCollision(result)) return;
            this.figure = result;

            this.mapFigure(this.nextPosition(this.figure));
        }

        moveFigure(way) {
            this.currentWay = way;
            let ways = {
                down() {
                    this.y++;
                },
                up() {
                    this.rotateFigure();
                    return true;
                },
                left() {
                    this.x--;
                    if (!this.checkCollision(this.figure)) {
                        this.x++;
                        return true;
                    }
                },
                right() {
                    this.x++;
                    if (!this.checkCollision(this.figure)) {
                        this.x--;
                        return true;
                    }
                },
            };

            if (ways[way].call(this)) return;

            this.attachFigure();
        }

        stop() {
            this.arrf.flat().forEach((block) => (block.isBlocked = true));
        }
    }

    addEvents();

    let currentFigure = new Figure(getRandomType()).createFigure();
    let nextFigure = new Figure(createNextFigure(getRandomType()));

    startUpdate(pole.interval);

    function getRandomType() {
        return types[Math.floor(Math.random() * types.length)];
    }

    function createNextFigure(type) {
        let img = new Image();
        img.src = `img/${colors[types.indexOf(type)]}.png`;
        div.innerHTML = "";

        div.append(img);

        return type;
    }

    function startUpdate() {
        field.addEventListener("Continue", () => update());
        setTimeout(update, pole.interval);
    }

    function update(fromEvent) {
        if ((pole.pressdown && !fromEvent) || pole.gameover || pole.paused) return;

        if (!currentFigure.stopped) {
            currentFigure.moveFigure(fromEvent || "down");
        }

        if (currentFigure.stopped) {
            currentFigure = nextFigure.createFigure();
            nextFigure = new Figure(createNextFigure(getRandomType()));
        }

        if (!fromEvent) {
            pole.timer = setTimeout(update, pole.interval);
        }
    }

    function checkField() {
        let lineIndexes = [];
        pole.array.forEach((line, i) =>
            line.every((block) => block.isBlocked) ? lineIndexes.push(i) : 0
        );
        if (lineIndexes.length) {
            pole.paused = true;
            pole.isClearing = true;
            (async function () {
                await new Promise((resolve) => {
                    let animCount = 0;
                    let allblocks = pole.array
                        .filter((_, i) => lineIndexes.includes(i))
                        .flat();
                    let chet = true;
                    let animate = setInterval(function() {
                        if (chet) {
                            allblocks.forEach((elem) => {
                                elem.prevSrc = elem.style.backgroundImage;
                                elem.style.backgroundImage =
                                    "url(img/blocks/white.png)";
                            });
                        } else {
                            allblocks.forEach((elem) => {
                                elem.style.backgroundImage = elem.prevSrc;
                            });
                            animCount++;
                        }
                        if (animCount === pole.animateCount) {
                            allblocks.forEach((elem) => {
                                elem.style.backgroundImage = elem.prevSrc;
                            });
                            clearInterval(animate);
                            setTimeout(() => {
                                resolve("Done");
                            }, pole.animInterval);
                        }
                        chet = !chet;
                    }, pole.animInterval);
                });

                for (let index of lineIndexes) {
                    let line = pole.array[index].map((block) => {
                        block.remove();
                        return klet.cloneNode(true);
                    });
                    pole.array.splice(index, 1);
                    pole.array.unshift(line);
                    field.prepend(...line);
                }

                pole.linesCleared += lineIndexes.length;

                updateScores(lineIndexes, pole);

                let event = new Event("Continue");
                pole.paused = false;
                pole.isClearing = false;
                field.dispatchEvent(event);
            }());
        }
    }
    
    function updateScores(lineIndexes, {hardMode, color, maxInterval, levels, scores}){
        if (pole.linesCleared >= pole.max) {
            pole.level += 1;
            level.textContent = "Level " + pole.level;
            let x = 1;
            if (pole.level >= hardMode) {
                x = 1.5;
            }

            let levelDiff = [5, 10, 15];

            if(pole.level === levelDiff[pole.currentLevel]){
                pole.currentLevel++;
                level.classList.add(color[pole.currentLevel]);
            }

            (pole.interval -= (maxInterval * x) / levels),
                (pole.linesCleared -= pole.max);
            pole.max += 1;
        }

        let resc = (
            +score.textContent +
            +scores[lineIndexes.length - 1] * pole.level).toString();
        score.innerHTML = "0".repeat(7 - resc.length) + resc;

        if (+localStorage.getItem("record") < +resc) {
            localStorage.setItem("record", resc);
            record.textContent = "0".repeat(7 - resc.length) + resc;
        }
    }

    function lose() {
        pole.gameover = true;

        document.removeEventListener("keydown", keyDown);
        document.removeEventListener("keyup", keyUp);

        createRestart(createGameover()).onclick = function () {
            location = location;
        };

        function createGameover() {
            let gameover = createFieldElement("div", "gameover", "GameOver");
            gameover.style.left = field.offsetWidth / 2 - gameover.offsetWidth / 2 + "px";
            gameover.style.top = field.offsetHeight / 2 - gameover.offsetHeight / 2 + "px";
            return gameover;
        }

        function createRestart(gameover) {
            let restart = createFieldElement("button", "restart", "Restart");
            restart.style.left = field.offsetWidth / 2 - restart.offsetWidth / 2 + "px";
            restart.style.top = gameover.getBoundingClientRect().bottom - field.offsetTop + 30 + "px";
            return restart;
        }

    }

    function pauseGame(){
        pause.hidden = !pause.hidden;
        pole.paused = !pole.paused;
        if(!pole.paused){
            pole.timer = setTimeout(() => field.dispatchEvent(new Event("Continue")), pole.interval);
            return;
        }
        clearTimeout(pole.timer);
        
    }

    function createFieldElement(type, className, text) {
        let elem = document.createElement(type);
        elem.classList.add(className);
        elem.textContent = text;
        field.append(elem);
        return elem;
    }

    function generateField(width, height) {
        let res = [];
        for (let i = 0; i < height; i++) {
            let arr = [];
            for (let j = 0; j < width; j++) {
                let clone = klet.cloneNode(true);
                clone.isFigureBody = 0;
                arr.push(clone);
            }
            res.push(arr);
            field.append(...arr);
        }

        return res;
    }

    let buttons = ["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"];

    function addEvents() {
        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);
    }

    function keyDown(e) {
        if(e.code === 'Space' && !e.repeat && !pole.isClearing){
            pauseGame();
            return;
        }
        if (!buttons.includes(e.key)) return;
        let way = e.key.slice(5);
        if (way === "down" && !e.repeat) pole.pressdown = true;

        if (!pole.paused) {
            update(way.toLowerCase());
        }
    }
    
    function keyUp(e) {
        if (e.key !== "ArrowDown") return;
        pole.pressdown = false;
    }

}
