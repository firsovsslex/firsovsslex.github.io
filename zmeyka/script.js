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
    }

    startMove(way) {
        let func = intervalf.bind(this);

        function compare(cord, max) {
            if (cord > max - 1) {
                cord = 0;
            } else if (cord < 0) {
                cord = max - 1;
            }
            return cord;
        }

        function intervalf() {
            way = this.currentWay;
            this.y += way[0];
            this.x += way[1];

            this.y = compare(this.y, this.field.width);
            this.x = compare(this.x, this.field.height);

            let next = this.arrField[this.y][this.x];

            if (this.snake.includes(next)) {
                this.lose();
                return;
            }

            if (next.isFood) {
                this.snakeLength++;
                next.isFood = false;
                this.createFood();
            }

            next.style.backgroundColor = "red";
            this.snake.push(next);

            if (!this.snakeLength) {
                this.snake.shift().style.backgroundColor = "";
            } else this.snakeLength--;
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
            let y = Math.trunc(Math.random() * this.field.height);
            let x = Math.trunc(Math.random() * this.field.width);
            let food = this.arrField[y][x];
            if (!this.snake.includes(food)) {
                food.isFood = true;
                food.style.backgroundColor = "green";
                break;
            }
        }
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

