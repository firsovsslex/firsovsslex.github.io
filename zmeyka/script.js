let pole = document.querySelector("#field");
let container = document.querySelector(".container");

class Field {
    constructor(width, height, interval, snakeLength) {
        this.field = {
            width,
            height,
            interval,
        };
        this.arrField = this.createPole();
        this.way = {
            ArrowUp: [-1, 0],
            ArrowLeft: [0, -1],
            ArrowRight: [0, 1],
            ArrowDown: [1, 0],
        };
        this.x = 15;
        this.y = 15;
        this.keyDown = this.keyDown.bind(this);
        this.startMove = this.startMove.bind(this);
        this.snake = [];
        this.snakeLength = snakeLength;
        this.currentWay = null;
        this.nextTimeout = null;
        this.firstEvent = true;
        this.createFood();
        this.score = this.createScore();
    }

    startMove(way) {
        let func = intervalf.bind(this);

        function compare(cord, max) {
            if (cord > max - 1 || cord < 0) {
                return true;
            }           
        }

        function intervalf() {
            way = this.currentWay;
            this.y += way[0];
            this.x += way[1];

            if(compare(this.y, this.field.width) || compare(this.x, this.field.height)){
                this.lose();
                return;
            }    

            let next = this.arrField[this.y][this.x];

            if (next.isFood) {
                this.snakeLength++;
                next.isFood = false;
                this.changeScore(5);
                this.createFood();
            }

            if (!this.snakeLength) {
                this.snake.shift().style.backgroundColor = "";
            } else this.snakeLength--;

            if (this.snake.includes(next)) {
                this.lose();
                return;
            }

            next.style.backgroundColor = "red";
            this.snake.push(next);

            
            this.nextTimeout = false;
            setTimeout(func, this.field.interval);
        }
        func();
    }

    keyDown(event) {
        let way = this.way[event.key];
        if (way) {
            if (this.firstEvent ||(Math.abs(this.currentWay[0] + way[0]) === 1 && !this.nextTimeout)) {
                this.currentWay = way;
                this.nextTimeout = true;

                if (this.firstEvent) {
                    this.startMove(this.currentWay);
                    this.firstEvent = false;
                }
            }
        }
    }

    lose() {
        let end = document.createElement("p");
        end.classList.add("lose");
        end.innerHTML = "Defeat";
        document.body.append(end);
        end.style.left = document.documentElement.clientWidth / 2 - end.offsetWidth / 2 +"px";
        end.style.top = document.documentElement.clientHeight / 2 - end.offsetHeight + "px";

        let restart = document.createElement("button");
        restart.classList.add("restart");
        restart.innerHTML = "Restart";
        container.append(restart);

        restart.onclick = () => location = location;
    }

    createFood() {
        while (true) {
            let random = [Math.random(), Math.random()].map(num => num < 0.1? num * 10: num);
            let y = Math.trunc(random[0] * this.field.height);
            let x = Math.trunc(random[1] * this.field.width);
            let food = this.arrField[y][x];
            if (!this.snake.includes(food)) {
                food.isFood = true;
                food.style.backgroundColor = "green";
                break;
            }
        }
    }

    changeScore(och){
        let plusscore = (+this.score.innerHTML + och).toString();
        let scoreLength = plusscore.length;
        for(let i = 0; i < 6 - scoreLength; i++){
            plusscore = '0'+plusscore;
        }
        this.score.innerHTML = plusscore;
    }

    createScore(){
        let score = document.createElement('p');
        score.classList.add('score');
        score.innerHTML = '000000';
        container.prepend(score);
        return score;
    }

    createPole() {
        let cell = document.createElement("div");
        cell.classList.add("klet");
        let arr = [];
        for (let i = 0; i < this.field.height; i++) {
            let line = [];
            for (let j = 0; j < this.field.width; j++) {
                line.push(cell.cloneNode(true));
            }
            arr.push(line);
        }
        pole.append(...arr.flat());
        return arr;
    }
}

let cell = document.createElement("div");
cell.classList.add("klet");
pole.append(cell);
let offsetW = cell.offsetWidth;
let offsetH = cell.offsetHeight;
cell.remove();
let field = new Field(pole.offsetWidth / offsetW, pole.offsetHeight / offsetH, 50, 2);
document.addEventListener("keydown", field.keyDown);

