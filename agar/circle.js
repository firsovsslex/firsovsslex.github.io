export class Circle{
    constructor(x, y, radius, speed, color, config, canvas){
        this.x = x;
        this.y = y;
        this.speed = speed / 10;
        this.vx = 0;
        this.vy = 0;
        this.radius = radius;
        this.color = color;
        this.config = config;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
     
    }

    spawn(){

        this.vx = (getRandomNumber()) * this.speed + 1;
        this.vy = (getRandomNumber()) * this.speed + 1;

        if(this.x > this.canvas.width / 2) this.vx *= -1;    
        if(this.y > this.canvas.height / 2) this.vy *= -1;
        
        this.ctx.fillStyle = this.color;
        this.ctx.fill(this.nextCircle(this.x, this.y, this.radius));
       
        return this;      
    }
   
    moveXY(){  

        this.x += this.vx;
        this.y += this.vy;

        if(this.y - this.radius >= this.canvas.height && this.vy > 0 || this.y + this.radius <= 0 && this.vy < 0 || this.x - this.radius >= this.canvas.width && this.vx > 0 || this.x + this.radius <= 0 && this.vx < 0) this.delete();

        return this;
    }

    checkColission(player){

        if(this.getDistance(player, this) <= this.radius + player.radius) return this.radius < player.radius? this: 'lose';

    }

    getDistance(player, circle){
        return Math.sqrt(Math.pow(player.x - circle.x , 2) + Math.pow(player.y - circle.y , 2));
    }

    render(){
   
        this.ctx.fillStyle = this.color;
        this.ctx.fill(this.nextCircle(this.x, this.y, this.radius));

    }

    nextCircle(x, y, radius){
        let circle = new Path2D();
        circle.arc(x, y, radius, 0, Math.PI * 2);
        circle.closePath();
        return circle;
    }

    delete(){
        this.config.circles.delete(this); 
    }

    cmpcolission(object, player){
        if(object){
            if(object !== 'lose'){
                player.eat(object);
            }
            else{
                this.config.lose();
            }
        }
    }

}