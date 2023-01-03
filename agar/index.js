
import {Circle} from './circle.js';
import {Player} from './player.js';

let mobile = isMobile();

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d");

canvas.height = document.body.clientHeight;
canvas.width = document.body.clientWidth;

canvas.oncontextmenu = () => false; 

let pauseText = createElem('p', 'pause', 'Pause');
let endText = createElem('p', 'points', 'Points 0');
let startText = createElem('p', 'start', 'Click to start');

document.body.append(pauseText, endText, startText);

toCenter(endText, pauseText, startText);

endText.hidden = pauseText.hidden = true;

function createElem(type, id, text){
    let elem = document.createElement(type);
    elem.setAttribute('id', id);
    elem.innerHTML = text;
    return elem;
}

function toCenter(...elems){
    if(!elems.length) return;
    for(let elem of elems){
        elem.style.left = canvas.width / 2 - elem.offsetWidth / 2  + 'px';
        elem.style.top = canvas.height / 2 - elem.offsetHeight / 2  + 'px';
    }
}

let config = {
    player: { 
        data: [10, null, '#ffffff'],
        spawnpos: null
    },
    center: [canvas.clientWidth / 2, canvas.clientHeight / 2],
    maxWidth: 2560,
    maxHeight: 1440,
    circles: new Set(),
    gameover: false,
    pause: false,
    spawnTimeout: false,
    focusWindow: true,
    points: 0,
    lose: null,
}

const WH = (screen.width / screen.height) / (config.maxWidth / config.maxHeight);

config.circlesSpeed = 10 * WH;
config.spawnInterval = 250 / WH;

function start(){
    
    canvas.style.cursor = 'none';
    config.points = 0;
    
    function getRandomSpawnPosition(radius){
        let x, y;
    
        if(Math.round(getRandomNumber())){
            x = Math.round(getRandomNumber() * canvas.width);
            y = Math.round(getRandomNumber())? -radius: canvas.height + radius;
        }
    
        else{
            x = Math.round(getRandomNumber())? -radius: canvas.width + radius;
            y = Math.round(getRandomNumber() * canvas.height);
        }
    
        return [x, y];
    }
    
    function getRandomColor(){
        let result = [];
        for(let i = 3; i > 0; i--){
            let hex = Math.floor(getRandomNumber() * 255).toString(16);
            result.push(hex.length < 2? '0'+hex: hex);
        }
    
        return '#'+result.join``;
    }
 
    window.getRandomNumber = function(min, max){
        let random = crypto.getRandomValues(new Uint16Array(1)) / 65535;
        if(min && max){
            return random * (max - min) + min;
        }

        return random;
    }
    
    function getRandomRadius(player){
        return Math.abs(getRandomNumber() * ((player.radius + 35) - (player.radius - 15)) + (player.radius - 15)) + 5;    
    }

    function getRandomSpeed(){
        return config.circlesSpeed * getRandomNumber(0.1, 2);
    }

    let player = new Player(...config.player.spawnpos, ...config.player.data, config, canvas);

    
    spawnCircles();
    tick();
    
    function tick(){

        if(config.pause || config.gameover) return;
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        player.render();

        config.circles.forEach(circle => {
            circle.moveXY().render();
            circle.cmpcolission(circle.checkColission(player), player);
        });

    
        requestAnimationFrame(tick);
    }
    
    config.lose = function(){

        config.gameover = true;
        canvas.removeEventListener('pointermove', player.toMouseXY);
        // document.removeEventListener('visibilitychange', changeW);

        if(!mobile){
            document.removeEventListener('keydown', space);
        }
        else{
            document.body.removeEventListener('pointerdown', touchdown);
            document.body.removeEventListener('pointerup', touchup);
        }

        player.delete();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        config.circles.forEach(circle => circle.render());

        canvas.style.cursor = 'inherit';
     
        endText.innerHTML = 'Points '+config.points;
        endText.hidden = false;     

        

    }
    
    function spawnCircles(){
    
        if(config.pause || config.gameover) return;
    
        let radius = getRandomRadius(player);
        let circle = new Circle(...getRandomSpawnPosition(radius), radius, getRandomSpeed(), getRandomColor(), config, canvas);
        circle.spawn()
        config.circles.add(circle);

        setTimeout(() => config.spawnTimeout = false, config.spawnInterval);
        setTimeout(spawnCircles, config.spawnInterval);
    }
    

    canvas.addEventListener('pointermove', player.toMouseXY);

    if(!mobile){
        document.addEventListener('keydown', space);
    }
    else{
        document.body.addEventListener('pointerdown', touchdown);
        document.body.addEventListener('pointerup', touchup);
    }

    // document.addEventListener('visibilitychange', changeW);

    // function changeW(){
    //     config.focusWindow = !config.focusWindow; 
    //     if(config.focusWindow) spawnCircles();
    // }

    function touchdown(e){
        config.timeDelay = Date.now();
        config.touchPos = [e.clientX, e.clientY];
    }

    function touchup(e){
        if(Date.now() - config.timeDelay > 500 && (Math.abs(e.clientX - config.touchPos[0]) < 20 && Math.abs(e.clientY - config.touchPos[1]) < 20)) setPause();
    }

    function space(e){
        if(e.code === 'Space') {
            setPause();         
        }
    }

    function setPause(){
        if(config.gameover) return;
        config.pause = !config.pause;  
        
        if(config.pause){
            canvas.style.cursor = 'inherit';     
        }
    
        else {
            canvas.style.cursor = 'none';
        }
    
        tick();
        if(!config.spawnTimeout) spawnCircles();
        config.spawnTimeout = true;     
        
        pauseText.hidden = !pauseText.hidden;     
    } 
    
}


if(!mobile){
    document.addEventListener('keydown', function(e){
        if(e.code === 'Enter'){
            restart(e);
        } 
    });
}

document.body.addEventListener('pointerdown', restart);

function isMobile(){
    if(navigator.userAgent.match(/(Android)|(webOS)|(iPhone)|(iP[ao]d)|(BlackBerry)|(Windows Phone)/i)){
        return true;        
    }

    return false;
}

function restart(e){
    if(startText)
    {
        config.player.spawnpos = e.type === 'pointerdown'? [e.clientX, e.clientY]: config.center;
        startText.remove();
        startText = null; 
        start();
    }
    else if(config.gameover){
        config.gameover = false;
        config.pause = false;
        config.circles.clear();
        config.player.spawnpos = e.type === 'pointerdown'? [e.clientX, e.clientY]: config.center;
        endText.hidden = true;
        start();
    }
}





