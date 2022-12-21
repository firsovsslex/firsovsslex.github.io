
let save = document.querySelector('#save');
let modal = document.querySelector('.modal');

let input_name1 = document.querySelector('#input-name1');
let input_name2 = document.querySelector('#input-name2');

let name1 = document.querySelector('#name1'); 
let name2 = document.querySelector('#name2');

let timeInputs = document.querySelectorAll('.settings__time input');

let hours = document.querySelector('#hours');
let minutes = document.querySelector('#minutes');
let seconds = document.querySelector('#seconds');

let figureCounters = [document.querySelector('#data-figures1'), document.querySelector('#data-figures2')];
let chesslog = document.querySelector('.chess-log');

let generation = [['Rb','Hb','Bb','Qb','Kb','Bb','Hb','Rb'], ['Pb','Pb','Pb','Pb','Pb','Pb','Pb','Pb'], '00000000', '00000000', '00000000', '00000000', ['Pw','Pw','Pw','Pw','Pw','Pw','Pw','Pw'], ['Rw','Hw','Bw','Qw','Kw','Bw','Hw','Rw']];

let field;
let fieldContainer = document.querySelector('.field-container');
let fieldContainerX = document.querySelector('.field-container__X');

let figureNames = {
    K: 'king',
    Q: 'queen',
    B: 'bishop',
    H: 'knight',
    R: 'rook',
    P: 'pawn'
};

let timers = [];
let timerElements = [document.querySelector('#timer1'), document.querySelector('#timer2')];

let nums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
for(let elem of timeInputs){

    elem.onkeydown = function(e){
        if(nums.includes(e.key)){
            if(this.value.length === 2) e.preventDefault();
        }
        else if(e.key.length < 2) e.preventDefault();

    }

    elem.oninput = function(){
        if(+this.value < 0) this.value = '0';
        if(this.id === 'hours' && +this.value > 23) this.value = '23';
        if((this.id === 'minutes' || this.id === 'seconds') && +this.value > 59) this.value = '59';
    }
    
}

save.onclick = function(){

    if(!input_name1.value || !input_name2.value){
        pushMessage('Имена не введены!');
        return;
    }

    let time = new Date(0, 0, 0, +hours.value, +minutes.value, +seconds.value);

    if(!time.getHours() && !time.getMinutes() && !time.getSeconds()){
        pushMessage('Время не введено!');
        return;
    }

    for(let i = 0; i < 2; i++){
        timers.push(time);

        if(!time.getHours() && !time.getMinutes() && time.getSeconds() < 30) timerElements[i].style.color = 'red';
        timerElements[i].textContent = updateTimer(time);
    }

  

    modal.remove();

    name1.textContent = input_name1.value;
    name2.textContent = input_name2.value;

    field = new Field(8, true, generation);
    field.createField();
    field.generate();
    field.setChessCoords();

    
}

function updateTimer(date){

    let times = [date.getHours(), date.getMinutes(), date.getSeconds()];
    let items = [];

    for(let i = 0; i < 3; i++){
        items.push('0'.repeat(2 - times[i].toString().length) + times[i]);
    }

    return `${items[0]}:${items[1]}:${items[2]}`;

}


function pushMessage(text){
    let message = createElement('div', 'message');
    let p = createElement('p', 'message__text');

    p.textContent = text;
    
    message.append(p);
    modal.append(message);

    let bounds = save.getBoundingClientRect();

    message.style.left = bounds.left + bounds.width / 2 - message.offsetWidth / 2 + 'px';
    message.style.top = bounds.top - message.offsetHeight  - 15 + 'px';

 
    animate({
        duration: 3000,
        timing(timefr){
            return Math.pow(timefr, 2)
        },
        draw(progress){
            message.style.opacity = 100 - progress * 100 + '%';
        },
        
    });
    

    function animate({timing, draw, duration}){

        let start = performance.now();

        requestAnimationFrame(function hide(time){

            let timefr = (time - start) / duration;

            if(timefr > 1) timefr = 1;
            let progress = timing(timefr);

            draw(progress);
            if(timefr < 1) requestAnimationFrame(hide);
        });

        
    }

}


class Figure{

    static id = 0;

    constructor(type, tile, color){

        let {x, y} = tile;

        this.tile = tile;
        this.tileColor = '';
        this.prevTile = null;
        this.type = type;
        this.color = color; 
        this.x = x;
        this.y = y;  
        this.indiagonal = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        this.inline = [[1, 0], [0, 1], [-1, 0], [0, -1]];

        this.id = this.constructor.id++;

        this.currentK = null; 

        this.filters = {
            K: () => this.korolCheck(),
            Q: () => [...this.checkDiagonals(), ...this.checkLines()],             
            R: () => this.checkLines(),
            B: () => this.checkDiagonals(),
            H: () => this.knightCheck(),
            P: () => this.pawnCheck()
        }

        this.possibleTiles = null;
        this.allTiles = null;

        this.specialMoves = {
            lastMove: [],
            passMove: [],
            castlingL: [],
            castlingR: [],
        };

        this.pick = this.pick.bind(this);

        this.setImage();
        
    }

    move(tile){
        let {x, y} = tile;
        this.x = x;
        this.y = y;

        this.delete();

        for(let [key, arr] of Object.entries(this.specialMoves)){

            if(arr.includes(tile)){
                if(key === 'lastMove') this.setFigure(field.eventObject);

                else if(key === 'passMove') field.figures.find(elem => elem.x === this.x && elem.y === this.y + (this.color? 1: -1)).figure.beat();
                else if(key === 'castlingL') castlingRook.call(this, [0, 1]);  
                else if(key === 'castlingR') castlingRook.call(this, [7, -1]);
            }

        }
        

        function castlingRook(pos){

            let rook = field.figures.find(elem => elem.y === this.y && elem.x === pos[0]).figure;
            let next = field.tiles.find(elem => elem.y === this.y && elem.x === this.x + pos[1]);

            field.animateFigure(next, rook)
            .then(_ => {
                rook.move(next);
                field.checkKings();
            });
        }

        if(tile.figure) tile.figure.beat();

        field.logMemory.set(field.currentRowLog.lastElementChild, field.currentCounters.map(arr => [...arr])); 

        this.prevTile = this.tile;

        let figure = this.tile.children[0];

        if(figure.style.transform) figure.style.transform = '';
        tile.append(figure);

        this.tile = tile;
        this.tile.figure = this;

        if(this.type === 'P' && !this.pawnPlayed) this.pawnPlayed = true;
        
        

        field.figures = field.getAllFigures();

        this.updateSelection();      
        field.updateInteractFigures(this.prevTile, this.tile);

        field.updateFigures();
        
        this.setImage();

    }


    beat(){

        let img = createElement('img', 'Fcount');
        img.src = this.tile.children[0].image;

        let colors = ['W', 'B'];
    
        figureCounters[+this.color].append(img);
        field.currentCounters[+this.color].push(this.type + colors[+!this.color]);       


        this.tile.children[0].remove();
        this.delete();
    }

    delete(){
        this.tile.figure = null;
        if(this.tile.hasChildNodes()) this.tile.children[0].image = null;
    }

    setFigure(e){
        this.div = createElement('div', 'select-figure');

        let figures = ['Q', 'H', 'R', 'B'];   
        for(let i = 0; i < figures.length; i++){
            let figure = createElement('div', 'pick', null, figures[i]);

            changeImage(figure, `url(./img/${figureNames[figures[i]] + (this.color? 'W': 'B')}.svg)`);       
            this.div.append(figure);
        }

        this.div.addEventListener('click', this.pick);

        field.Field.append(this.div);

        this.div.style.left = e.clientX - this.div.offsetWidth / 2 + 'px';


        let offsetY = e.clientY - this.div.offsetHeight - 30;
        if(offsetY < 0){
            offsetY = e.clientY + 30; 
        }

        this.div.style.top = offsetY + 'px';

        field.pawnSet = true;

    }

    pick(e){
        let pick = e.target;
        if(!pick.classList.contains('pick')) return;

        this.div.remove();

        let currentTile = this.tile;
        let prevTile = this.prevTile;

        this.delete();

        let setFigure = new Figure(pick.id, currentTile, !field.currentPlay);
        currentTile.figure = setFigure;

        setFigure.currentK = field.korols[+!setFigure.color];

        setFigure.updateAllSelection();

        field.updateInteractFigures(prevTile, currentTile);
        field.updateFigures();

        field.checkKings();

        field.pawnSet = false;
    }


    select(){   

        changeColor(this.tile, 'rgb(103,110,64)');
        
        this.possibleTiles.forEach(tile => {
            tile.selected = true;
            
            if(tile.figure) changeColor(tile, 'green');
            else changeImage(tile, 'radial-gradient(rgba(20,85,30,0.5) 19%, rgba(0,0,0,0) 20%)');      
        });

        Object.values(this.specialMoves).flat(1).forEach(move => {
            move.selected = true;

            if(move.figure) changeColor(move, 'purple');
            else changeImage(move, 'radial-gradient(rgba(162, 0, 255, 0.5) 19%, rgba(0,0,0,0) 20%)'); 
        })

    }

    filterShah(posTiles){
        let currentTile = this.tile;

        currentTile.figure = null;
        posTiles = posTiles.filter(pos => {
            let prevF = pos.figure;
            pos.figure = this;

            [this.x, this.y] = [pos.x, pos.y];

            this.tile = pos;

            let returnValue = this.currentK.checkShah();
            pos.figure = prevF;

            return !returnValue;
        });

        this.tile = currentTile;
        this.tile.figure = this;

        let {x, y} = this.tile;
        [this.x, this.y] = [x, y];

        return posTiles;
    }



    setImage(){

        let image = `./img/${figureNames[this.type] + (this.color? 'W': 'B')}.svg`;

        this.tile.children[0].image = image;
        changeImage(this.tile.children[0], `url(${image})`);
    }


    getDiagonals(){
        return field.tiles.filter(elem => elem !== this.tile && Math.abs(elem.x - this.x) === Math.abs(elem.y - this.y));
    }

    getLines(){
        return field.tiles.filter(elem => elem !== this.tile && (elem.x === this.x || elem.y === this.y));
    }

    checkDiagonals(){
        return this.checkAllLines(this.indiagonal, this.getDiagonals());
    }

    checkLines(){
        return this.checkAllLines(this.inline, this.getLines());
    }

    updateSelection(){

        this.allTiles = this.filters[this.type].call(this);

    }

    updatePossibleSelection(){
        let filtered = this.allTiles;

        if(this.type === 'P'){

            this.clearSpecialMoves();
        filtered = this.updatePawnSpecialMoves();
        }

        if(this.type === 'K'){

            this.clearSpecialMoves();
            this.updateKingSpecialMoves();

        }

        this.possibleTiles = this.filterShah(filtered.filter(elem => elem.figure?.color !== this.color));

        for(let key in this.specialMoves){
            this.specialMoves[key] = this.filterShah(this.specialMoves[key]);
        }
        
    }


    clearSpecialMoves(){
        for(let key in this.specialMoves){
            this.specialMoves[key] = [];
        }
    }

    updateAllSelection(){

        this.updateSelection();
        this.updatePossibleSelection();
    }

    updateKingSpecialMoves(){

        if(!this.prevTile && !this.shahActive){
            let vsx = [-1, 1];

            for(let i = 0; i < vsx.length; i++){
                for(let j = 1;; j++){
                    let tile = field.tiles.find(elem => elem.y === this.y && elem.x === this.x + j * vsx[i]);
                    
                    if(!tile) break;

                    if(tile.figure){
                        if(tile.figure.type !== 'R') break;
                        if(tile.figure.color !== this.color || tile.figure.prevTile) break;

                        let names = ['castlingL', 'castlingR'];
        
                        this.specialMoves[names[i]].push(field.tiles.find(elem => elem.y === this.y && elem.x === [2, 6][i]));
        
                    }
                    else if(!this.filterShah([tile]).length) break;
                    

                }
            }
            
        }
    }

    updatePawnSpecialMoves(){

        let v = this.color? -1: 1;
        return this.allTiles.filter(elem => {
            if(elem.y === this.y + 1 * v && (elem.x === this.x - 1 || elem.x === this.x + 1)){
                
                if(!elem.figure){
                    if(this.color && this.y === 3 || !this.color && this.y === 4){
                        let pass = field.figures.find(tile => tile.x === elem.x && tile.y === this.y && tile.figure?.type === 'P');
                        if(!pass) return false;

                        if(pass.figure === field.prevFigure && (this.color && pass.figure.prevTile.y === 1 || !this.color && pass.figure.prevTile.y === 6)){
                            this.specialMoves.passMove.push(elem);
                        
                        }                                                 
                    }

                    return false;
                }
                else if(elem.figure.color === this.color){
                    return false;
                }

            }
            else if(elem.figure) return false;

            if(elem.y === 0 && this.color || elem.y === field.height - 1 && !this.color){

                this.specialMoves.lastMove.push(elem);


                return false;
            }

            return true;
        });
    }


    checkAllLines(vs, posTiles){
            
        let result = [];
        for(let k = 0; k < vs.length; k++){
            let v = vs[k];
            for(let i = 1;;i++){
                let tile = posTiles.find(elem => elem.x === this.x + i * v[0] && elem.y === this.y + i * v[1]);

                if(!tile) break;
                result.push(tile);
                if(tile.figure) break;
                
            }
        }
        
        return result;
    }

    knightCheck(){
        return field.tiles.filter(elem => {
            if(Math.abs(elem.x - this.x) === 2){
                return Math.abs(elem.y - this.y) === 1;
            }
            if(Math.abs(elem.y - this.y) === 2){
                return Math.abs(elem.x - this.x) === 1;
            }
        }); 
    }

    pawnCheck(){
        let n = this.pawnPlayed? 1: 2; 
        let v = this.color? -1: 1; 

        let result = [];


        for(let i = 1; i <= n; i++){
            let tile = field.tiles.find(elem => elem.x === this.x && elem.y === this.y + i * v);
            if(!tile) break;

            result.push(tile);
            if(tile.figure) break;
        }

        
        result.push(...field.tiles.filter(elem => {
            if(elem.y === this.y + 1 * v){
                return Math.abs(elem.x - this.x) === 1;
            }
        }));

        return result;
    }

    korolCheck(){

        let ways = [...this.indiagonal, ...this.inline];
        let result = field.tiles.filter(elem => {
            for(let i = 0; i < ways.length; i++){
                if(elem.x === this.x + ways[i][0] && elem.y === this.y + ways[i][1]){
                    ways.splice(i, 1);
                    return true;
                };
            }
        });


        return result;
    }

    checkShah(){
        
        let ways = [this.indiagonal, this.inline];
        let posTiles = [this.getDiagonals(), this.getLines()];

        for(let j = 0; j < ways.length; j++){
            for(let k = 0; k < ways[j].length; k++){
                let v = ways[j][k];
                for(let i = 1;; i++){
                    let tile = posTiles[j].find(elem => elem.x === this.x + i * v[0] && elem.y === this.y + i * v[1]);
                        
                    if(!tile) break;
                    if(tile.figure?.color === this.color) break;
                    
                    if(!tile.figure) continue;
                    if((!j?['Q', 'B'] : ['Q','R']).includes(tile.figure.type)) return true;

                    break;               
                }
                    
                
            }
        }


        for(let tile of this.knightCheck()){
            if(tile.figure?.type === 'H' && tile.figure?.color !== this.color) return true;
        }


        let v = this.color? -1: 1;
        for(let tile of field.tiles){
            if(!tile.figure) continue;
            if(tile.figure.color === this.color) continue;
            if(tile.y === this.y + 1 * v && Math.abs(tile.x - this.x) === 1 && tile.figure.type === 'P'){
                return true;
            }
        }
        
        for(let tile of this.korolCheck()){
            if(tile.figure?.type === 'K') return true;
        }


        return false;
        

    }


}


class Field{
    constructor(scale, currentPlay, gen){
        this.Field = document.querySelector('#field');
        this.currentPlay = currentPlay;
        this.gen = gen;
        this.tiles = null;
        this.figureSelected = null;
        this.eventObject = null;
        this.players = [name1.textContent, name2.textContent];
        this.korols = [];

        this.scale = scale;

        this.fieldArr = [];

        this.click = this.click.bind(this);
        this.drag = this.drag.bind(this);

        this.Field.addEventListener('pointerdown', this.click);
        this.Field.addEventListener('pointerdown', this.drag);

        this.Field.oncontextmenu = () => false;

        this.pawnSet = false;
        this.animate = false
        this.prevFigure = null;
        this.countMove = 1;
        this.chered = 0;
        this.logIndex = 0;
        this.log = [];
        this.endgame = false;
        this.currentCounters = [[], []];
        this.logMemory = new WeakMap();
        this.currentRowLog = createElement('div', 'chess-log__row');
        this.timer = null;

        this.coordsX = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']; 
        this.coordsY = ['1', '2', '3', '4', '5', '6', '7', '8'].reverse(); 
        this.figureIcons = {H: '♘',
                            B: '♗',
                            R: '♖',
                            Q: '♕',
                            K: '♔'}

        this.currentRowLog.insertAdjacentHTML('beforeend', `<div class="num"><p>${this.countMove}</p></div>`);
        chesslog.append(this.currentRowLog);

    }

    createField(){

        let white = true;
        
        let rows = [];
        for(let i = 0; i < this.scale; i++){

            let row = createElement('div', 'row');
            for(let j = 0; j < this.scale; j++){

                let color = white? 'tileW': 'tileB';
                let tile = createElement('div', `tile ${color}`);

                tile.x = j;
                tile.y = i;

                row.append(tile);

                white = !white;
            }

            rows.push(row);
            white = !white;
        }

        this.Field.append(...rows);
        this.tiles = Array.from(this.Field.querySelectorAll('.tile'));      
    }

    setChessCoords(){

        setCoordsX.call(this);
        setCoordsY.call(this);

        function setCoordsX(){
            let coordsX = createElement('div', 'coords coordsX');

            for(let i = 0; i < this.scale; i++){
                coordsX.insertAdjacentHTML('beforeend',`<p>${this.coordsX[i]}</p>`);
            }

            fieldContainerX.prepend(coordsX);
            fieldContainerX.append(coordsX.cloneNode(true));

        }

        function setCoordsY(){
            let coordsY = createElement('div', 'coords coordsY');
    
            for(let i = 0; i < this.scale; i++){
                coordsY.insertAdjacentHTML('beforeend',`<p>${this.coordsY[i]}</p>`);
            }

            fieldContainer.prepend(coordsY);
            fieldContainer.append(coordsY.cloneNode(true));   
    
        }

    }


    generate(){
        
        for(let i = 0; i < this.gen.length; i++){
        
            let line = this.gen[i];
            for(let j = 0; j < line.length; j++){
        
                let tile = this.tiles.find(elem => elem.x === j && elem.y === i);

                if(line[j] === '0'){
                    tile.figure = null;
                    continue;
                }

                let [type, color] = line[j];    

                let figure = createElement('div', 'figure');            
                tile.append(figure);

                let isWhite = color === 'w'; 
                tile.figure = new Figure(type, tile, isWhite);    

                if(type === 'K') this.korols[+!isWhite] = tile.figure;
                

            }

        }

        this.figures = this.getAllFigures();

        for(let i = 0; i < this.figures.length; i++){

            let figure = this.figures[i].figure;

            figure.currentK = this.korols[+!figure.color];
            figure.updateAllSelection();

        }

        this.checkKings();
    }

    click(e){

        if(this.pawnSet || this.animate) return;

        let tile = e.target.closest('.tile');
        if(!tile) return;

        this.eventObject = e;
        if(tile.figure !== this.figureSelected){
    
            if(tile.selected){

                this.clearSelected();

                if(this.figureSelected.type === 'K') this.figureSelected.tile.style.backgroundColor = '';          

                this.writeMove(tile, this.figureSelected);              
                this.animateFigure(tile, this.figureSelected)
                .then(_ => {
                    this.setPosition(tile);      
                });   
                return;             
            }

            if(this.figureSelected) {
                this.clearSelected();
                this.figureSelected = null;
            }

            if(tile.figure && tile.figure.color === this.currentPlay){

                this.figureSelected = tile.figure;
                this.figureSelected.select();
            }
            
            
        
        }
        
    }

    setPosition(tile){
                
        this.prevFigure = this.figureSelected;
        this.figureSelected.move(tile);            

        this.checkKings();
        this.logm();

        this.currentPlay = !this.currentPlay;  
        
        if(this.timer) this.stopTimer();

        if(!this.endgame) this.activateTimer();  
    
    }

    activateTimer(){
        let index = +!this.currentPlay;
        let elem = timerElements[index];

        update = update.bind(this);

        update();
        this.timer = setInterval(update, 1000);

        function update(){
            
            let time = new Date(timers[index] -= 1000);           

            if(!time.getHours() && !time.getMinutes() && !time.getSeconds()){
                this.timeOver();
                this.stopTimer();
            }

            if(elem.style.color !== 'red' && !time.getHours() && !time.getMinutes() && time.getSeconds() < 30) elem.style.color = 'red';
            
            elem.textContent = updateTimer(new Date(time));
        }
    }

   

    stopTimer(){
        clearInterval(this.timer);
    }

    checkKings(){
        this.korols.forEach(korol => {

            korol.shahActive = korol.checkShah();
            korol.updatePossibleSelection();

            let lastSymbol = '';

            if(korol.shahActive){
                korol.tileColor = 'red';
                changeColor(korol.tile, 'red'); 

                lastSymbol = '+';
            }

            else {
                korol.tileColor = '';
                changeColor(korol.tile, '');

                if(korol.prevTile) changeColor(korol.prevTile, '');
            }

            if(!this.endgame){
                if(!this.figures.some(elem => elem.figure.possibleTiles.length && elem.figure.color === korol.color)){
                    if(korol.shahActive){
                        lastSymbol = '#';
                        field.checkmate();  
                    }
                    else field.pat();
                                        
                } 

                this.currentRowLog.lastElementChild.textContent += lastSymbol;
            }



        });
    }

    animateFigure(next, figure){
        return new Promise(resolve => { 
            this.animate = true;

            let offsetX =  next.x - figure.x;
            let offsetY = next.y - figure.y;

            let anim = figure.tile.children[0];
            anim.style.zIndex = 10;
            anim.addEventListener('transitionend', animate.bind(this));

            function animate(){
                anim.style.zIndex = 0;
                this.animate = false;
                resolve();
            }

            anim.style.transform = `translate(${offsetX * 90}px, ${offsetY * 90}px)`;

        });
        
    }

    drag(event){

        if(this.pawnSet || this.animate) return;

        let elem = event.target;
        if(!elem.closest('.tile')) return;
        if(!elem.parentElement.figure) return;
        if(this.currentPlay !== elem.parentElement.figure.color) return;

        elem.style.zIndex = 99;

        if(!elem.style.position) elem.style.position = 'absolute';

        function moveTo(pageX, pageY){
            if(pageX + elem.offsetWidth / 2 < window.innerWidth && pageX - elem.offsetWidth / 2 > 0){
                elem.style.left = pageX - elem.offsetWidth / 2 + 'px';
            } 
            
            if(pageY + elem.offsetHeight / 2 < window.innerHeight && pageY - elem.offsetHeight / 2 > 0){
                elem.style.top = pageY - elem.offsetHeight / 2 + 'px';
            }  
        }

        mouseMove = mouseMove.bind(this);
        reset = reset.bind(this);

        document.addEventListener('pointermove', mouseMove);
        document.addEventListener('pointerup', reset);

        let currentTile = null;


        function mouseMove(e){

            moveTo(e.pageX, e.pageY);

            elem.hidden = true;

            let pos = document.elementFromPoint(e.clientX, e.clientY)?.closest('.tile');

            elem.hidden = false;

            if(!pos) return;
            if(pos === currentTile) return;
            if(pos === elem.parentElement) return;

            if(currentTile){
                if(currentTile.figure){
                    changeColor(currentTile, currentTile.figure.tileColor);
                    currentTile.figure.tileColor = '';
                }
                else changeColor(currentTile, '');
            } 

            currentTile = pos;

            if(!pos.selected) return;
            if(currentTile.figure) currentTile.figure.tileColor = currentTile.style.backgroundColor;

            changeColor(currentTile, 'rgba(20,85,30,0.5)');
            
        }


        function reset(e){

            this.eventObject = e;

            document.removeEventListener('pointermove', mouseMove);
            document.removeEventListener('pointerup', reset);

            elem.style.cssText = '';
            if(currentTile && currentTile !== elem.parentElement) changeColor(currentTile, '');

            let tile = document.elementFromPoint(e.clientX, e.clientY)?.closest('.tile');
            if(tile && tile.selected){
                this.clearSelected();
                this.writeMove(tile, this.figureSelected);
                this.setPosition(tile);
            }
        
            else changeImage(elem, `url(${elem.image})`);

            

        }

    }

    writeMove(next, figure){

        this.updateFigures();
    
        this.chered++;
        if(this.chered === 3){
            this.chered = 1;
            this.countMove++;

            this.currentRowLog = createElement('div', 'chess-log__row');
            this.currentRowLog.insertAdjacentHTML('beforeend', `<div class="num"><p>${this.countMove}</p></div>`);

            chesslog.append(this.currentRowLog);

            
        }

        if(!figure.specialMoves.castlingR.includes(next) && !figure.specialMoves.castlingL.includes(next)){
            let f = figure.type !== 'P'? this.figureIcons[figure.type]: '';
            let pos = '';
    
            for(let tile of this.figures){
                if(tile.figure === figure || tile.figure.color !== figure.color || tile.figure.type !== figure.type) continue;
    
                if(tile.figure.possibleTiles.includes(next)){      
                    pos = this.coordsX[tile.x] + this.coordsY[tile.y];
                    break;             
                }
            }
    
            this.currentRowLog.insertAdjacentHTML('beforeend', `<div class="move"><p>${f + pos + (next.figure? 'x': '') + this.coordsX[next.x] + this.coordsY[next.y]}</p></div>`);
            
        }
        else this.currentRowLog.insertAdjacentHTML('beforeend', `<div class="move"><p>${figure.specialMoves.castlingR.includes(next)? 'O-O': 'O-O-O'}</p></div>`);
            
        
    }

    clearField(){
        this.tiles.forEach(tile => {
            tile.figure = null;
            if(tile.style.backgroundColor) changeColor(tile, '');
            if(tile.hasChildNodes()) tile.lastElementChild.remove();

        });

        figureCounters.forEach(counter => {
            let elems = [...counter.children];
            while(elems.length){
                elems.pop().remove();          
            }
        });

        
    }

    updateFigures(){
        this.figures.forEach(tile => {
            let figure = tile.figure;
            if(figure.type === 'K') return;
            figure.updatePossibleSelection();
        });
    }

    updateInteractFigures(prevTile, newTile){
        this.figures.forEach(elem => {
            let figure = elem.figure;

            if(figure.allTiles.includes(prevTile) || figure.allTiles.includes(newTile)){
                figure.updateSelection();
            }
        })
    }


    getAllFigures(){
        return this.tiles.filter(elem => elem.figure);
    }

    checkmate(){
        this.gameover();

        this.setGameover(`Мат! Победил "${this.players[+!this.currentPlay]}"`, 'mate');
    }

    pat(){
        this.gameover();
        this.setGameover('Ничья!', 'pat'); 
    }

    timeOver(){
        this.gameover();
        this.clearSelected();

        this.setGameover(`Время истекло! Победил "${this.players[+this.currentPlay]}"`, 'mate');
    }

    setGameover(text, cls){

        let gm = createElement('p', cls);  
        gm.classList.add('endtext');
        gm.textContent = text;

        document.body.append(gm);
        let bounds = fieldContainer.getBoundingClientRect();

        gm.style.left = bounds.left + bounds.width / 2 - gm.offsetWidth / 2 +'px';
        gm.style.top = bounds.top - gm.offsetHeight - 50 +'px';
    }

    gameover(){
        this.Field.removeEventListener('pointerdown', this.click);
        this.Field.removeEventListener('pointerdown', this.drag);
        this.Field.style.cursor = 'default';

        this.endgame = true;
        
        chesslog.addEventListener('click', (e) => {
            let move = e.target.closest('.move');
            if(!move) return;

            this.clearField();

            this.gen = this.log[move.index];
            this.generate();

            let counters = this.logMemory.get(move);
            
            for(let i = 0; i < this.currentCounters.length; i++){

                let images = [];
                for(let j = 0; j < counters[i].length; j++){
                    let image = createElement('img', 'Fcount');

                    let [type, color] = counters[i][j];
                    image.src = `./img/${figureNames[type] + color}.svg`;

                    images.push(image);
                }          

                if(images.length) figureCounters[i].append(...images);
            }
        
        });

    }

    logm(){

        let result = [];
        for(let i = 0, k = 0; i < this.scale; i++){

            let row = [];
            for(let j = 0; j < this.scale; j++, k++){
                if(!this.tiles[k].figure) row.push('0');
                else{
                    row.push(this.tiles[k].figure.type + (this.tiles[k].figure.color? 'w': 'b'));
                }           
            }
            result.push(row);
        }
            
        
        this.currentRowLog.lastElementChild.index = this.logIndex; 

        this.log.push(result);
        this.logIndex++;
    }

    clearSelected(){
        this.tiles.forEach(tile => {
            if(tile.selected){
                tile.selected = false;

                if(!tile.figure){
                    changeImage(tile, '');
                }
                
                changeColor(tile, '');
            }
        }); 

        changeColor(this.figureSelected.tile, this.figureSelected.tileColor);
    }

    }



function changeColor(elem, color){
    elem.style.backgroundColor = color;
}

function changeImage(elem, url){
    elem.style.backgroundImage = url;
}

function createElement(tag, classH, innerText, id){
    let elem = document.createElement(tag);

    if(classH) elem.className = classH;
    if(innerText) elem.textContent = innerText;
    if(id) elem.id = id;

    return elem;
}
