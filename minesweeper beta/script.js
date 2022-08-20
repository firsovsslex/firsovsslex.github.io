new Promise(resolve => window.onload = () => resolve('Done'))
.then(StartScript, alert);

function StartScript(){
    let startButton = document.querySelector('#play');
    let options = document.querySelector('#opts');
    let container = document.querySelector('.container');

    addEvents();

    function addEvents(){
        startButton.addEventListener('click', () => {
            startGame();
        });
        options.addEventListener('click', () => {
            clickOptions();
        });
    }

    function clickOptions(){
        container.innerHTML = '';
        let nastr = document.createElement('div');
        let form = document.createElement('form');
        form.setAttribute('name', 'Values');
        let submit = document.createElement('input');
        submit.setAttribute('type', 'submit');
        submit.setAttribute('value', 'Сохранить');
        submit.className = 'submit';
        nastr.className = 'options';
        let texts = ['% Мин', 'Длина поля', 'Высота поля'];
        let ranges = [[0, 100], [5, 30], [5, 20]];
        let um = [20, 10, 10]
        let names = ['value1', 'value2', 'value3']
        for(let i = 0; i < 3; i++){
            let input = document.createElement('input');
            let text = document.createElement('p');
            let value = document.createElement('span'); 
            value.className = 'znach';
            text.className = 'opttext';
            text.textContent = texts[i];
            input.className = 'inputs';
            input.setAttribute('type','range');
            input.setAttribute('min', ranges[i][0]);
            input.setAttribute('max', ranges[i][1]);
            input.setAttribute('step','1');
            input.setAttribute('name', names[i]);
            input.setAttribute('value', um[i]);
            value.innerHTML = input.getAttribute('value');
            form.append(text, value, input);
        }
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'center';
        form.append(submit);

        nastr.append(form);

        container.append(nastr);

        for(let inp of nastr.querySelectorAll('.inputs')){
            inp.oninput = function(){
                inp.previousElementSibling.innerHTML = inp.value;
            }
        }

        document.forms.Values.onsubmit = function(){
            localStorage.setItem('procent', this.value1.value); 
            localStorage.setItem('width', this.value2.value);
            localStorage.setItem('height', this.value3.value);
        }
    }


    // function createCounter(){
    //     let counter = document.createElement('p');
    //     counter.className = 'counter';   
    //     let count = Array.from(div.querySelectorAll('.square')).filter(elem => gen[elem.y][elem.x]).length;     

    // }

    function startGame(){

        container.innerHTML = '';
        let firstClick = true;
        let pole = {
            minesGen: localStorage.getItem('procent')/100,
            lines: localStorage.getItem('width'),
            columns: localStorage.getItem('height'),   
        };
        pole.mines = pole.lines*pole.columns*pole.minesGen;

        let cont = document.createElement('div');
        cont.className = 'cont';
        container.prepend(cont);

        let div = createPole(container, pole.lines, pole.columns);
        let interval = createTimer(cont);
        let gen = generation();
        
        console.log(gen);

        function squareEvents(square){   
            square.onclick = () => {
                let th = gen[square.y][square.x];
                if(!square.flaged){
                    if(firstClick) th = 0;
                    if(th){
                        lostGame();
                        return;
                    }
                    check(square);  
                }  
            }

            square.oncontextmenu = () => {
                if(!square.checked){
                    setFlag(square);
                }
                return false;
            }
                
        }

        function createTimer(cont){
            let timer = document.createElement('div');
            timer.className = 'timer';
            let time = document.createElement('p');
            time.id = 'time';
            time.textContent = '00:00:00'; 
            timer.append(time);
            cont.append(timer);
            let i = 1;
            return setInterval(() => {
                let date = new Date(0,0,0,0,0,0).setSeconds(i++);
                let clock = new Date(date);
                let vr = [clock.getHours(), clock.getMinutes(), clock.getSeconds()];
                time.textContent = time.textContent.split(':').map((_, i) => vr[i].toString().length < 2? '0'+vr[i]: vr[i]).join`:`;
            }, 1000);      
        }
    
        function createPole(container, width, height){
            let div = document.createElement('div');
            div.className = 'pole';
            div.style.maxWidth = width*32+'px';
            div.style.maxHeight = height*32+'px';
            container.append(div);
            return div;
        }


        function generation(){
            let arrpole = [];
            for(let i = 0; i < pole.columns; i++){
                let line = [];
                for(let j = 0; j < pole.lines; j++){
                    line.push(0);
                    let square = document.createElement('div');
                    square.className = 'square hover';
                    square.y = i;
                    square.x = j;
                    square.checked = false;
                    square.flaged = false;
                    div.append(square);
                    squareEvents(square);                
                }
                let rand = [];
                for(let k = 0; k < Math.trunc(pole.mines / pole.columns); k++){
                    let value = Math.trunc(Math.random()*pole.lines);
                    if(rand[value]){
                        k--;
                        continue;
                    }
                    rand[value] = value;
                }
                for(let val of Object.values(rand)){
                    line[val] = 1;
                }
                arrpole.push(line);
            }

            return arrpole;     
        }
    
        
        function squareCheck(square0){
            
            let variations = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
            let res = [];
            function expand(square, y, x){
                let num = 0;
                let near = [];
                square.checked = true;

                for(let v of variations){
                    let bm = gen[y+v[0]]?.[x+v[1]];
                    if(bm !== undefined){
                        if(firstClick) {
                            gen[y+v[0]][x+v[1]] = 0;
                            bm = 0;  
                        }        
                        if(bm) num++;
                        near.push([y+v[0], x+v[1]]);
                    }
                }
                firstClick = false;
                
                let all = Array.from(div.querySelectorAll('.square'));
                
                if(!(num-all.filter(item => near.some(v => item.y === v[0] && item.x === v[1] && item.flaged)).length)){
                    
                    all = all.filter(item => near.some(v => item.y === v[0] && item.x === v[1] && !item.checked && !item.flaged))
                    all.some(elem => {
                        if(gen[elem.y][elem.x]){
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
              
        function check(square){
            let colors = ['blue','green','red','darkblue','brown','turquoise','black','white'];
            let result = squareCheck(square);
            result.forEach(([sq, num]) => {
                if(num){                 
                    sq.style.color = colors[num-1];
                    sq.textContent = num;                       
                }
                sq.className = 'square';
                sq.style.backgroundColor = 'lightgrey';
            });
            setTimeout(() => {
                if(isWin()) win();
            }, 20);
        }
        
        function setFlag(square){
                if(!square.flaged){
                    square.style.backgroundImage = 'url(img/flag.png)';
                }
                else {
                    square.style.backgroundImage = null;
                }
                square.flaged = !square.flaged;
                setTimeout(() => {
                    if(isWin()) win();
                }, 20);
            }

            

        function win(){
            for(let sq of div.children){
                sq.onclick = null;
                sq.oncontextmenu = null;
                sq.className = 'square';
            }
            clearInterval(interval);
            restartButton();
            let win = document.createElement('p');
            win.className = 'win';
            win.textContent = 'Victory';
            win.style.left = `${window.innerWidth/2-90}px`;
            win.style.top = `${window.innerHeight/2-30}px`;
            document.body.append(win);
        }

        function lostGame(){
            for(let sq of div.children){
                if(gen[sq.y][sq.x]) {
                    sq.style.backgroundColor = 'red';
                    sq.style.backgroundImage = 'url(img/bomb.png)';
                }
                sq.onclick = null;
                sq.oncontextmenu = null;
                sq.className = 'square';
            }
            restartButton();
            clearInterval(interval);
            let lost = document.createElement('p');
            lost.className = 'lost';
            lost.textContent = 'Defeat';
            lost.style.left = `${window.innerWidth/2-90}px`;
            lost.style.top = `${window.innerHeight/2-30}px`;
            document.body.append(lost);

        }

        function isWin(){
            let squares = Array.from(div.querySelectorAll('.square'));
            let allflags = squares.filter(elem => elem.flaged).length;
            let allbombs = squares.filter(elem => gen[elem.y][elem.x]).length;
            let alltiles = squares.filter(elem => !gen[elem.y][elem.x]).length;
            let allchecked = squares.filter(elem => elem.checked).length;
            if( allchecked === alltiles && allflags === allbombs){
                return true;
            }
        }

        function restartButton(){
            let restart = document.createElement('button');
            restart.className = 'restart';
            restart.textContent = 'Restart';
            restart.onclick = function(){
                location = location;
            }
            container.append(restart);
        }


    










    }












}