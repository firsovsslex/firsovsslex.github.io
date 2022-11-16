
import { Circle } from "./circle.js";
export class Player extends Circle{
    constructor(...args){
        super(...args);
        this.toMouseXY = this.toMouseXY.bind(this);

    }

    toMouseXY(e){
        
        if(this.config.pause || this.config.gameover || !e.isPrimary) return;

        this.x = e.clientX;
        this.y = e.clientY;
                 
        this.config.circles.forEach(circle => circle.cmpcolission(circle.checkColission(this), this));
        
    }

    render(){

        this.ctx.fillStyle = this.color;
        this.ctx.fill(this.nextCircle(this.x, this.y, this.radius)); 
    }   

    eat(object){
        
        this.config.points++;
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