let pole = document.querySelector('#field');

class Field{
    constructor(){
        this.firstClick = true;
        this.arrp = [];
        this.createPole();       
    }

    clickKlet(klet){
        let img = document.createElement('img');
        klet.classList.add('nazh');
        klet.classList.remove('hover');
        if(this.start){
            img.src = 'krestik.png';
            klet.activate = 'x';
        }
        else{
            img.src = 'nolik.png';
            klet.activate = 'o';
        }
        klet.onclick = null;
        klet.append(img);
        this.start = !this.start;

        setTimeout(() => this.checkField(), 10);
    }

    createPole(){
        let kls = [];
        
        for(let i = 0; i < 3; i++){    
            let odn = []       
            for(let j = 0; j < 3; j++){
                let kl = document.createElement('div');
                kl.x = j;
                kl.y = i;
                kl.activate = '';
                kl.classList.add('klet');
                kl.classList.add('hover');
                odn.push(kl);
                kls.push(kl);
            }
            this.arrp.push(odn);               
        }      
        pole.append(...kls);
    }

    checkField(){
        let result = [this.checkHorizontals(), this.checkVerticals(), this.checkDiagonals()].find(res => res);
        if(result) this.win(result);     
        else this.checkDraw();

    }

    checkDiagonals(){
        let diagR = [], diagL = [];
        let i = 0, j = 2;
        for(let line of this.arrp){
            diagR.push(line[i++]);
            diagL.push(line[j--]);
        }

        return this.checkLine(diagR) || this.checkLine(diagL);
    }

    checkHorizontals(){
        for(let line of this.arrp){
            let who = this.checkLine(line);
            if(who) return who;      
        }
    }

    checkVerticals(){
        for(let i = 0; i < 3; i++){
            let column = [];
            for(let line of this.arrp){
                column.push(line[i]);
            }
            let who = this.checkLine(column);
            if(who) return who;
        }
    }

    checkLine(res){
        res = res.map(elem => elem.activate).join``;
        if(res.length === 3){
            if(!~res.indexOf('x')){
                return 'o';
            }
            if(!~res.indexOf('o')){
                return 'x';
            }
        }
    }

    checkDraw(){
        if(this.arrp.flat().map(elem => elem.activate).join``.length === 9) this.draw();
    }

    win(wh){
        alert(`Победили ${wh.toUpperCase()}`);
        location = location;
    }

    draw(){
        alert("Ничья");
        location = location;
    }


}

let field = new Field();

function createEvents(){
    pole.onclick = function(e){
        let klet = e.target;
        if(!klet.classList.contains('klet')) return;
        if(klet.activate) return;
        if(field.firstClick){
            field.start = Array.from(document.querySelectorAll('[name="Kto"]')).find(elem => elem.checked).value === 'X';
            field.firstClick = false;
        }
        field.clickKlet(klet);
    };

    pole.onmousedown = function(e){
        return false;
    }
}

createEvents();
