
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d");

canvas.height = document.body.clientHeight;
canvas.width = document.body.clientWidth;

canvas.oncontextmenu = () => false; 

let gameover = false;

let pauseText = document.createElement('p');
pauseText.setAttribute('id', 'pause');
pauseText.innerHTML = 'Pause';

let endText = document.createElement('p');
endText.innerHTML = 'Points 0';
endText.setAttribute('id', 'points');

document.body.append(pauseText, endText);

toCenter(endText);
toCenter(pauseText);

endText.hidden = pauseText.hidden = true;

function toCenter(elem){

    elem.style.left = canvas.width / 2 - elem.offsetWidth / 2  + 'px';
    elem.style.top = canvas.height / 2 - elem.offsetHeight / 2  + 'px';

}

let config = {
    mainCircle: { 
        radius: 10,
        color: '#ffffff',
    },
    maxWidth: 2560,
    maxHeight: 1440,
    circles: new Set(),
    spawnTimeout: false,
    focusWindow: true
}

const WH = (screen.width / screen.height) / (config.maxWidth / config.maxHeight);

config.circlesSpeed = WH * 10;
config.spawnInterval = 250 / WH;
config.mainCircle.spawnPosition = [canvas.width / 2, canvas.height / 2]; 

function start(){
    
    canvas.style.cursor = 'none';
    
    let pause = false;
    let points = 0;
    
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
    
    function getRandomNumber(){
        return crypto.getRandomValues(new Uint16Array(1)) / 65535;
    }
    
    
    function getRandomRadius(player){
        return Math.abs(getRandomNumber() * ((player.radius + 35) - (player.radius - 15)) + (player.radius - 15)) + 5;    
    }
    
    
    class Circle{
        constructor(x, y, radius, speed, color){
            this.x = x;
            this.y = y;
            this.speed = speed / 10;
            this.vx = 0;
            this.vy = 0;
            this.radius = radius;
            this.color = color;

            this.vx = (getRandomNumber() + 1) * this.speed;
            this.vy = (getRandomNumber() + 1) * this.speed;
    
            if(this.x > canvas.width / 2) this.vx *= -1;    
            if(this.y > canvas.height / 2) this.vy *= -1;
        }
    
        spawn(){
            
            ctx.fillStyle = this.color;
            ctx.fill(nextCircle(this.x, this.y, this.radius));
           
            return this;      
        }
       
        moveXY(){  
    
            this.x += this.vx;
            this.y += this.vy;

            if(this.y - this.radius >= canvas.height && this.vy > 0 || this.y + this.radius <= 0 && this.vy < 0 || this.x - this.radius >= canvas.width && this.vx > 0 || this.x + this.radius <= 0 && this.vx < 0) this.delete();
    
            return this;
        }
    
        render(){
       
            ctx.fillStyle = this.color;
            ctx.fill(nextCircle(this.x, this.y, this.radius));
    
        }

        delete(){
            config.circles.delete(this);
        }

        checkColission(player){

                let distance = Math.sqrt(Math.pow(this.x - player.x, 2) + Math.pow(this.y - player.y, 2));

                if(distance <= this.radius + player.radius) return this.radius < player.radius? this: 'lose';
    
        }
    
    }
    
    class Player extends Circle{
        constructor(...args){
            super(...args);
            this.toMouseXY = this.toMouseXY.bind(this);
   
        }
    
        toMouseXY(e){
            
            if(pause || gameover || !e.isPrimary) return;
    
            this.x = e.clientX;
            this.y = e.clientY;
                     
            config.circles.forEach(circle => cmpcolission(circle.checkColission(this), this));
            
        }
    
        render(){
    
            ctx.fillStyle = this.color;
            ctx.fill(nextCircle(this.x, this.y, this.radius)); 
    
        }   

        eat(object){
            
            points++;
            this.radius += 2 * (object.radius / this.radius)   //Math.sqrt((Math.PI * Math.pow(this.radius, 2) + Math.PI * Math.pow(object.radius / 2, 2)) / Math.PI);
            this.color = this.changeColor(object);

            object.delete();
        }

        changeColor(object){

            let result = [];
            for(let i = 1; i < 4; i++){
                let color = Math.round((+('0x'+this.color.slice(i * 2 - 1, i * 2 + 1)) + +('0x'+object.color.slice(i * 2 - 1, i * 2 + 1))) / 2).toString(16);
                if(color.length < 2) color = '0'+color;
                result.push(color);
            }
            return '#'+result.join``;
        }

    }
    
    let player = new Player(...config.mainCircle.spawnPosition, config.mainCircle.radius, null, config.mainCircle.color);
    
    spawnCircles();
    tick();
    
    function tick(){

        if(pause || gameover) return;
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        player.render();

        config.circles.forEach(circle => {
            circle.moveXY().render();
            cmpcolission(circle.checkColission(player), player);
        });

        
    
        requestAnimationFrame(tick);
    }
    
    function lose(){

        gameover = true;

        canvas.removeEventListener('pointermove', player.toMouseXY);
        document.removeEventListener('visibilitychange', changeW);

        if(!navigator.userAgentData.mobile){
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
     
        endText.innerHTML = 'Points '+points;
        endText.hidden = false;     

        

    }
    
    function cmpcolission(object, player){
        if(object){
            if(object !== 'lose'){
                player.eat(object);
            }
            else{
                lose();
            }
        }
    }
    
    function spawnCircles(){
    
        if(pause || gameover || !config.focusWindow) return;

    
        let radius = getRandomRadius(player);
        let circle = new Circle(...getRandomSpawnPosition(radius), radius, config.circlesSpeed, getRandomColor());
        circle.spawn();
        config.circles.add(circle);

        setTimeout(() => config.spawnTimeout = false, config.spawnInterval);
        setTimeout(spawnCircles, config.spawnInterval);
    }
    
    
    function nextCircle(x, y, radius){
        let circle = new Path2D();
        circle.arc(x, y, radius, 0, Math.PI * 2);
        circle.closePath();
        return circle;
    }
    
    
    canvas.addEventListener('pointermove', player.toMouseXY);

    if(!navigator.userAgentData.mobile){
        document.addEventListener('keydown', space);
    }
    else{
        document.body.addEventListener('pointerdown', touchdown);
        document.body.addEventListener('pointerup', touchup);
    }

    document.addEventListener('visibilitychange', changeW);

    function changeW(){
        config.focusWindow = !config.focusWindow; 
        if(config.focusWindow) spawnCircles();
    }

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
        if(gameover) return;
        pause = !pause;  
        
        if(pause){
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

start();

if(!navigator.userAgentData.mobile){
    document.addEventListener('keydown', function(e){
        if(e.code === 'Enter'){
            restart();
        } 
    });
}
else document.body.addEventListener('pointerdown', restart);

function restart(){
    if(gameover){
        gameover = false;
        config.circles.clear();
        start();
        endText.hidden = true;
    }
}





