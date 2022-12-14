

let figureCounter1 = document.querySelector('#data-figures1');
let figureCounter2 = document.querySelector('#data-figures2');
let chesslog = document.querySelector('.chess-log');

let generation = [['Rb','Hb','Bb','Qb','Kb','Bb','Hb','Rb'], ['Pb','Pb','Pb','Pb','Pb','Pb','Pb','Pb'], '00000000', '00000000', '00000000', '00000000', ['Pw','Pw','Pw','Pw','Pw','Pw','Pw','Pw'], ['Rw','Hw','Bw','Qw','Kw','Bw','Hw','Rw']];

class Figure{
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

        this.specialMoves = [];

        if(this.type === 'P'){
            this.passP = null;
        }


        this.figureNames = {
            K: 'king',
            Q: 'queen',
            B: 'bishop',
            H: 'knight',
            R: 'rook',
            P: 'pawn'
        };

        this.pick = this.pick.bind(this);

        this.setImage();
        
    }

    move(tile){
        let {x, y} = tile;
        this.x = x;
        this.y = y;

        let special = tile.special;

        this.delete();

        if(tile.figure) tile.figure.beat();

        this.prevTile = this.tile;

        let figure = this.tile.children[0];

        if(figure.style.transform) figure.style.transform = '';
        
        tile.append(this.tile.children[0]);
        this.tile = tile;
        this.tile.figure = this;

        if(this.type === 'P' && !this.pawnPlayed) this.pawnPlayed = true;
        
        if(special){
            switch(special){

                case 'lastMove': this.setFigure(field.eventObject);
                break;
    
                case 'passMove': {
                    this.passP.beat();
                    break;
                }

                case 'castlingL':{

                    castlingRook(field.figures.find(elem => elem.y === this.y && elem.x === 0).figure, field.tiles.find(elem => elem.y === this.y && elem.x === this.x + 1));                
                    break;
                }

                case 'castlingR':{

                    castlingRook(field.figures.find(elem => elem.y === this.y && elem.x === 7).figure, field.tiles.find(elem => elem.y === this.y && elem.x === this.x - 1));
                    
                }
    
            }

        }

        function castlingRook(rook, next){
            field.animateFigure(next, rook)
            .then(_ => {
                rook.move(next);
                field.checkKings();
            });
        }

        field.figures = field.getAllFigures();

        this.updateSelection();      
        field.updateInteractFigures(this.prevTile, this.tile);

        field.updateFigures();
        
        this.setImage();

    }


    beat(){

        let img = createElement('img', 'Fcount');
        img.src = this.tile.image;

        if(!this.color){
            figureCounter1.append(img);
        }
        else figureCounter2.append(img);

        this.tile.children[0].remove();

        this.delete();
    }

    delete(){
        this.tile.image = null;
        this.tile.figure = null;
        this.specialMoves.forEach(move => move.special = '');
    }

    setFigure(e){
        this.div = createElement('div', 'select-figure');

        let figures = ['Q', 'H', 'R', 'B'];   
        for(let i = 0; i < figures.length; i++){
            let figure = createElement('div', 'pick', null, figures[i]);

            changeImage(figure, `url(./img/${this.figureNames[figures[i]] + (this.color? 'W': 'B')}.svg)`);       
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

        this.specialMoves.forEach(move => {
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

        let image = `./img/${this.figureNames[this.type] + (this.color? 'W': 'B')}.svg`;

        this.tile.image = image;
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
           filtered = this.checkPawnMoves();
        }

        if(this.type === 'K'){

            this.clearSpecialTiles();

            this.specialMoves = [];

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
                            let xs = [2, 6];
                            
                            let res = field.tiles.find(elem => elem.y === this.y && elem.x === xs[i])
                            res.special = names[i];
                        
                            this.specialMoves.push(res);
                            
                        }
                        else{
                            if(!this.filterShah([tile]).length) break;
                        }

                    }
                }
                
            }

        }

        this.possibleTiles = this.filterShah(filtered.filter(elem => elem.figure?.color !== this.color));
        this.specialMoves = this.filterShah(this.specialMoves);
    }


  
    updateAllSelection(){

        this.updateSelection();
        this.updatePossibleSelection();
    }

    checkPawnMoves(){

        this.clearSpecialTiles();

        this.specialMoves = [];

        let v = this.color? -1: 1;
        return this.allTiles.filter(elem => {
            if(elem.y === this.y + 1 * v && (elem.x === this.x - 1 || elem.x === this.x + 1)){
                
                if(!elem.figure){
                    if(this.color && this.y === 3 || !this.color && this.y === 4){
                        let pass = field.figures.find(tile => tile.x === elem.x && tile.y === this.y && tile.figure?.type === 'P');
                        if(!pass) return false;

                        if(pass.figure === field.prevFigure && (this.color && pass.figure.prevTile.y === 1 || !this.color && pass.figure.prevTile.y === 6)){
                            this.specialMoves.push(elem);
                            this.passP = pass.figure;
                            elem.special = 'passMove';
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

                this.specialMoves.push(elem);
                elem.special = 'lastMove';

                return false;
            }

            return true;
        });
    }

    clearSpecialTiles(){
        field.tiles.forEach(tile => {
            if(this.specialMoves.includes(tile)) tile.special = '';
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
    constructor(width, height, currentPlay, gen){
        this.Field = document.querySelector('#field');
        this.currentPlay = currentPlay;
        this.gen = gen;
        this.tiles = null;
        this.figureSelected = null;
        this.eventObject = null;
        this.korols = [];

        this.width = width;
        this.height = height;

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

        this.coordsX = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']; 
        this.coordsY = ['1', '2', '3', '4', '5', '6', '7', '8']; 
        this.figureIcons = {H: '♘',
                            B: '♗',
                            R: '♖',
                            Q: '♕',
                            K: '♔'}

        chesslog.insertAdjacentHTML('beforeend', `<div class="num"><p>${this.countMove}</p></div>`);
  
    }

    createField(){

        let white = true;

        let coordsX = createElement('div', 'coordsX');
        let coordsY = createElement('div', 'coordsY');

        let rows = [];
        for(let i = 0; i < this.height; i++){

            coordsX.insertAdjacentHTML('beforeend',`<p>${this.coordsX[i]}</p>`);
            coordsY.insertAdjacentHTML('beforeend',`<p>${this.coordsY[i]}</p>`);

            let row = createElement('div', 'row');
            for(let j = 0; j < this.width; j++){

                let color = white? 'tileW': 'tileB';

                let tile = createElement('div', 'tile');
                tile.classList.add(color);

                tile.x = j;
                tile.y = i;

                row.append(tile);

                white = !white;
            }

            rows.push(row);

            white = !white;
        }

        this.Field.append(...rows);

        coordsX.style.width = this.Field.offsetWidth + 'px';
        coordsY.style.height= this.Field.offsetHeight + 'px';

        this.Field.before(coordsX);
        this.Field.after(coordsX.cloneNode(true));

        this.Field.parentElement.before(coordsY);
        this.Field.parentElement.after(coordsY.cloneNode(true));

        this.tiles = Array.from(this.Field.querySelectorAll('.tile'));

        
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
                
                tile.figure = new Figure(type, tile, color === 'w');    

                if(type === 'K') {
                    if(color === 'w') this.korols[0] = tile.figure;
                    else this.korols[1] = tile.figure;
                }

            }

        }

        this.figures = this.getAllFigures();

        for(let i = 0; i < this.figures.length; i++){

            let figure = this.figures[i].figure;

            figure.currentK = this.korols[+!figure.color];
            figure.updateAllSelection();

        }
    }

    click(e){

        if(this.pawnSet || this.animate) return;

        let tile = e.target.closest('.tile');
        if(!tile) return;

        this.eventObject = e;
        if(tile.figure !== this.figureSelected){
       
            if(tile.selected){

                this.clearSelected();

                if(this.figureSelected.type === 'K'){
                    this.figureSelected.tile.style.backgroundColor = '';
                }

                this.writeMove(tile, this.figureSelected);
                
                this.animateFigure(tile, this.figureSelected)
                .then(_ => {
                    this.setPosition(tile);  
                })   
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
        this.currentPlay = !this.currentPlay;   
    
    }

    checkKings(){
        this.korols.forEach(korol => {

            korol.shahActive = korol.checkShah();

            if(korol.shahActive){
                korol.tileColor = 'red';
                changeColor(korol.tile, 'red');
            }
            else {
                korol.tileColor = '';
                changeColor(korol.tile, '');

                if(korol.prevTile) changeColor(korol.prevTile, '');
            }

            korol.updatePossibleSelection();

            if(!this.figures.some(elem => elem.figure.possibleTiles.length && elem.figure.color === korol.color)){
                if(korol.shahActive){
                    field.checkmate();
                    return;
                }
                
                
                
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
          
            else changeImage(elem, `url(${elem.parentElement.image})`);

            

        }

    }

    writeMove(next, figure){
        this.chered++;
        if(this.chered === 3){
            this.chered = 1;
            this.countMove++;

            if(this.countMove > 4){
                chesslog.style.height = +chesslog.style.height.slice(0, -2) + 37.5 + 'px';
                chesslog.style.gridTemplateRows += ' 1fr';
            }
            chesslog.insertAdjacentHTML('beforeend', `<div class="num"><p>${this.countMove}</p></div>`);
        }

        let f = figure.type !== 'P'? this.figureIcons[figure.type]: '';

        chesslog.insertAdjacentHTML('beforeend', `<div class="move"><p>${f+(next.figure? 'x': '')+this.coordsX[next.x]+this.coordsY[next.y]}</p></div>`);
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
        setTimeout(() => alert('Мат'));

    }

    pat(){
        this.gameover();
        setTimeout(() => alert('Пат'));
    }

    gameover(){
        this.Field.removeEventListener('pointerdown', this.click);
        this.Field.removeEventListener('pointerdown', this.drag);
        this.Field.style.cursor = 'default';
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


let field = new Field(8, 8, true, generation);
field.createField();
field.generate();


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

