document.addEventListener('DOMContentLoaded', StartScript);

function StartScript() {
    let container = document.querySelector(".container");
    let startButton = document.querySelector("#play");

    startButton.addEventListener("click", () => {
        startGame();
    });
 
    function startGame() {
        container.innerHTML = "";
        let firstClick = true;
        let f1 = true;
        let pole = {
            minesGen: +localStorage.getItem("procent") / 100,
            lines: +localStorage.getItem("width"),
            columns: +localStorage.getItem("height"),
        };
        pole.mines = pole.lines * pole.minesGen < 1? 1: pole.lines * pole.minesGen;

        let cont = document.createElement("div");
        cont.className = "cont";
        container.prepend(cont);

        let metriks = document.createElement('div');
        metriks.classList.add('square');
        container.append(metriks);

        let sqwidth = metriks.offsetWidth;
        let sqheight = metriks.offsetHeight;

        metriks.remove();

        let div = createPole(pole.lines, pole.columns);
        container.append(div);

        let interval = createTimer(cont);
        let gen = generation();
        let counter = createCounter();
        cont.append(counter);

        let end = document.createElement("p");
        document.body.append(end);



        function squareEvents(div) {
            div.onclick = function(e){
                let square = e.target;
                if (!square.classList.contains('square')) return;
                if (square.flaged) return;
                if (firstClick) gen[square.y][square.x] = 0;
                if (gen[square.y][square.x]) {
                    lostGame();
                    return;
                }
                check(square);
                               
            };

            div.oncontextmenu = function(e) {
                let square = e.target;
                e.preventDefault();
                if (!square.classList.contains('square')) return;
                if (firstClick) return;
                if (square.checked) return;
                setFlag(square);
                                  
            };
        }

        function createCounter(){
            let counter = document.createElement('p');
            counter.id = 'counter';
            let div = document.createElement('div');
            div.className = 'divcounter';
            counter.textContent = '000';
            div.append(counter);
            return div;
        }

        function counterActivate(){
            let count = gen.map(array => array.filter(item => item).length).reduce((pr, cr) => pr+cr, 0).toString();
            let nulls = [];
            for(let i = 0; i < 3-count.length; i++){
                nulls.push('0');
            }
            count = nulls.join``+count;
            counter.textContent = count;
        }

        function counterChange(z){
            let count = +counter.textContent;
            eval('count'+z);
            if(count >= 0){
                let nulls = [];
                for(let i = 0; i < 3-count.toString().length; i++){
                    nulls.push('0');
                }
                count = nulls.join``+count;
            }
            counter.textContent = count;
        }

        function createTimer(cont) {
            let timer = document.createElement("div");
            timer.className = "timer";
            let time = document.createElement("p");
            time.id = "time";
            time.textContent = "00:00:00";
            timer.append(time);
            cont.append(timer);
            let i = 1;
            return setInterval(() => {
                let date = new Date(0, 0, 0, 0, 0, 0).setSeconds(i++);
                let clock = new Date(date);
                let vr = [
                    clock.getHours(),
                    clock.getMinutes(),
                    clock.getSeconds(),
                ];
                time.textContent = time.textContent.split(":")
                .map((_, i) => vr[i].toString().length < 2 ? "0" + vr[i] : vr[i]).join`:`;
            }, 1000);
        }

        function createPole(width, height) {
            let div = document.createElement("div");
            div.className = "pole";       
            div.style.maxWidth = width * sqwidth + "px";
            div.style.maxHeight = height * sqheight + "px";
            squareEvents(div);
            return div;
        }

        function generation() {
            let arrpole = [];
            for (let i = 0; i < pole.columns; i++) {
                let line = [];
                for (let j = 0; j < pole.lines; j++) {
                    line.push(0);
                    let square = document.createElement("div");
                    square.className = "square hover";
                    square.y = i;
                    square.x = j;
                    square.checked = false;
                    square.flaged = false;
                    div.append(square);
                }
                let rand = [];
                for (let k = 0; k < Math.trunc(pole.mines); k++) {
                    let value = Math.trunc(Math.random() * pole.lines);
                    if (rand[value]) {
                        k--;
                        continue;
                    }
                    rand[value] = value;
                }
                for (let val of Object.values(rand)) {
                    line[val] = 1;
                }
                arrpole.push(line);
            }

            return arrpole;
        }

        function squareCheck(square0) {
            let variations = [
                [-1, -1],
                [-1, 0],
                [-1, 1],
                [0, -1],
                [0, 1],
                [1, -1],
                [1, 0],
                [1, 1],
            ];
            let res = [];
            function expand(square, y, x) {
                let num = 0;
                let near = [];
                square.checked = true;

                for (let v of variations) {
                    let bm = gen[y + v[0]]?.[x + v[1]];
                    if (bm !== undefined) {
                        if (firstClick) {
                            gen[y + v[0]][x + v[1]] = 0;
                            bm = 0;
                        }
                        if (bm) num++;
                        near.push([y + v[0], x + v[1]]);
                    }
                }
                firstClick = false;

                let all = Array.from(div.querySelectorAll(".square"));

                if (!(num - all.filter((item) => near.some(
                    (v) =>
                        item.y === v[0] &&
                        item.x === v[1] &&
                        item.flaged
                        )
                ).length
                    )) 
                    {
                    all = all.filter((item) =>
                        near.some(
                            (v) =>
                                item.y === v[0] &&
                                item.x === v[1] &&
                                !item.checked &&
                                !item.flaged
                        )
                    );
                    all.some((elem) => {
                        if (gen[elem.y][elem.x]) {
                            lostGame();
                            return true;
                        }
                        res.push(expand(elem, elem.y, elem.x));
                    });
                }
                return [square, num];
            }
            res.push(expand(square0, square0.y, square0.x));

            return res;
        }

        function check(square) {
            let colors = [
                "blue",
                "green",
                "red",
                "darkblue",
                "brown",
                "turquoise",
                "black",
                "white",
            ];
            let result = squareCheck(square);
            result.forEach(([sq, num]) => {
                if (num) {
                    sq.style.color = colors[num - 1];
                    sq.textContent = num;
                }
                sq.className = "square";
                sq.style.backgroundColor = "lightgrey";
            });
            if(f1) {
                counterActivate();
                f1 = !f1;
            }
            if (isWin()) win();
            
        }

        function setFlag(square) {
            if (!square.flaged) {
                square.style.backgroundImage = "url(img/flag.png)";
                counterChange('--');
            } else {
                square.style.backgroundImage = null;
                counterChange('++');
            }
            square.flaged = !square.flaged;  
            if (isWin()) win();
            
        }

        function win() {
            for (let sq of div.children) {
                sq.classList.remove('hover');
            }
            end.className = "win";
            end.textContent = "Victory";
            reset();
        }

        function lostGame() {
            for (let sq of div.children) {
                if (gen[sq.y][sq.x]) {
                    sq.style.backgroundColor = "red";
                    sq.style.backgroundImage = "url(img/bomb.png)";
                }
                sq.classList.remove('hover');
            }
            end.className = "lost";
            end.textContent = "Defeat";
            reset();
            
        }

        function reset(){
            div.onclick = null;
            div.oncontextmenu = null;
            clearInterval(interval);
            restartButton();         
            end.style.display = 'inline';
            end.style.left = document.body.clientWidth/2-end.offsetWidth/2+'px'
            end.style.top = document.body.clientHeight/2-end.offsetHeight/2+'px';
        }

        function isWin() {
            let squares = Array.from(div.querySelectorAll(".square"));
            let allflags = squares.filter((elem) => elem.flaged).length;
            let allbombs = squares.filter((elem) => gen[elem.y][elem.x]).length;
            let alltiles = squares.filter((elem) => !gen[elem.y][elem.x]).length;
            let allchecked = squares.filter((elem) => elem.checked).length;
            if (allchecked === alltiles && allflags === allbombs) {
                return true;
            }
        }

        function restartButton() {
            let restart = document.createElement("button");
            restart.className = "restart";
            restart.textContent = "Restart";
            restart.onclick = function () {
                location = location;
            };
            container.append(restart);
        }
    }
}
