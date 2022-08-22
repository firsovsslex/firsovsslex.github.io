new Promise((resolve) => (window.onload = () => resolve("Done"))).then(StartScript,alert);

function StartScript() {
    let startButton = document.querySelector("#play");
    let options = document.querySelector("#opts");
    let container = document.querySelector(".container");

    addEvents();

    function addEvents() {
        startButton.addEventListener("click", () => {
            startGame();
        });
        options.addEventListener("click", () => {
            clickOptions();
        });
    }

    function clickOptions() {
        container.innerHTML = "";
        let nastr = document.createElement("div");
        let resbutton = document.createElement('button');
        resbutton.className = 'res';
        resbutton.textContent = 'Сохранить';
        nastr.className = "options";
        let texts = ["% Мин", "Длина поля", "Высота поля"];
        let ranges = [
            [10, 60],
            [5, 30],
            [5, 20],
        ];
        let um = [
            localStorage.getItem("procent") ?? 20,
            localStorage.getItem("width") ?? 10,
            localStorage.getItem("height") ?? 10,
        ];
        let names = ["procent", "width", "height"];
        for (let i = 0; i < 3; i++) {
            let input = document.createElement("input");
            let text = document.createElement("p");
            let value = document.createElement("span");
            value.className = "znach";
            text.className = "opttext";
            text.textContent = texts[i];
            input.className = "inputs";
            input.setAttribute("type", "range");
            input.setAttribute("min", ranges[i][0]);
            input.setAttribute("max", ranges[i][1]);
            input.setAttribute("step", "1");
            input.setAttribute("name", names[i]);
            input.setAttribute("value", um[i]);
            value.innerHTML = input.getAttribute("value");
            nastr.append(text, value, input);
        }
        nastr.append(resbutton);
        let inputs = Array.from(nastr.querySelectorAll('.inputs'));  
        for(let input of inputs){
            input.oninput = function(){
                input.previousElementSibling.textContent = input.value;
            }
        }     

        resbutton.onclick = function(){
            for(let inp of nastr.querySelectorAll('.inputs')){
                localStorage.setItem(inp.name, inp.value);
            }
            location = location;
        }

        container.append(nastr);
        
    }

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

        let lost = document.createElement("p");
        lost.className = "lost";
        lost.textContent = "Defeat";
        document.body.append(lost);

        let winm = document.createElement("p");
        winm.className = "win";
        winm.textContent = "Victory";
        document.body.append(winm);

        


        function squareEvents(square) {
            square.onclick = () => {
                if (!square.flaged) {
                    if (firstClick) gen[square.y][square.x] = 0;
                    if (gen[square.y][square.x]) {
                        lostGame();
                        return;
                    }
                    check(square);
                }
            };

            square.oncontextmenu = () => {
                if (!square.checked) {
                    setFlag(square);
                }
                return false;
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
                    squareEvents(square);
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
                sq.onclick = null;
                sq.oncontextmenu = null;
                sq.className = "square";
            }
            clearInterval(interval);
            restartButton();
            winm.style.display = 'inline';
            winm.style.left = document.body.clientWidth/2-winm.offsetWidth/2+'px';
            winm.style.top = document.body.clientHeight/2-winm.offsetHeight/2+'px';
        }

        function lostGame() {
            for (let sq of div.children) {
                if (gen[sq.y][sq.x]) {
                    sq.style.backgroundColor = "red";
                    sq.style.backgroundImage = "url(img/bomb.png)";
                }
                sq.onclick = null;
                sq.oncontextmenu = null;
                sq.className = "square";
            }
            restartButton();
            clearInterval(interval);
            lost.style.display = 'inline';
            lost.style.left = document.body.clientWidth/2-lost.offsetWidth/2+'px'
            lost.style.top = document.body.clientHeight/2-lost.offsetHeight/2+'px';
            
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
