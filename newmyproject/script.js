class Clock{
    constructor(){
        this.clock = document.getElementById('time');
        this.h = 0;
        this.m = 0;
        this.s = 0;
        this.time = new Date(0, 0, 0, this.h, this.m, this.s);
        this.correct(this.time);
        this.addEvents();
        this.clickStart = false;
        this.buttonsActivate = true;
        this.startAudio = false;
        this.timeout = false;

    }
    correct(time){
        let arr = [time.getHours(), time.getMinutes(), time.getSeconds()];
        this.h = arr[0];
        this.m = arr[1];
        this.s = arr[2];
        arr = arr.map(function(item){
            if(String(item).length<2){
                return '0'+item;
            }
            return String(item);
        });
        this.clock.innerHTML = arr.join(':');
    }

    plus(form, val){
        if(form == 'h'){
            if(this.h!=23){
                this.time.setHours(this.time.getHours()+val);
                this.correct(this.time);
            }
        } 
        else if(form == 'm'){
                this.time.setMinutes(this.time.getMinutes()+val);
                this.correct(this.time);        
        }
        else if(form == 's'){
                this.time.setSeconds(this.time.getSeconds()+val);
                this.correct(this.time);  
        }
    }

    minus(form, val){
        if(form == 'h'){
            this.time.setHours(this.time.getHours()-val);
            this.correct(this.time);
        } 
        else if(form == 'm'){
            this.time.setMinutes(this.time.getMinutes()-val);
            this.correct(this.time); 
        }
        else if(form == 's'){
            this.time.setSeconds(this.time.getSeconds()-val);
            this.correct(this.time);
        }
    }

    reset(){
        let ico = document.getElementById('start-pauseIcon');
        let text = document.getElementById('startbutton');
        let button = document.querySelector('#pause');

        this.timerActivate = false;
        this.time = new Date(0, 0, 0, 0, 0, 0);
        this.correct(this.time);
        this.buttonsActivate = true;
        this.clickStart = false;
        ico.style.backgroundImage = 'url(img/start.png)';
        text.innerHTML = 'Start';
        ico.style.width = '26px';
        ico.style.height = '26px';
        for(let elem of document.querySelectorAll('.minusT')){
            elem.style.cursor = 'pointer';
        }
        for(let elem of document.querySelectorAll('.plusT')){
            elem.style.cursor = 'pointer';
        }
        this.stopAudio();
        this.startAudio = false;
        this.timeout = false;
       
        button.style.cursor = 'pointer';
        button.style.background = 'white';
        
        
    }

    start(){
        this.clickStart != true? this.clickStart = true: this.clickStart = false;
        this.timerActivate = true;
        this.buttonsActivate = false;
        for(let elem of document.querySelectorAll('.minusT')){
            elem.style.cursor = 'initial';
        }
        for(let elem of document.querySelectorAll('.plusT')){
            elem.style.cursor = 'initial';
        }
        let ico = document.getElementById('start-pauseIcon');
        let text = document.getElementById('startbutton');
        if(this.clickStart != false){
            let timer = timerF.bind(this);
            let cycle = setTimeout(timer, 1000);
            function timerF(){
                if(this.timerActivate == true){
                    this.time.setSeconds(this.time.getSeconds()-1);
                    this.correct(this.time);
                    
                    if(this.h == 0 && this.m == 0 && this.s == 0){
                        this.timeout = true;
                            let button = document.querySelector('#pause');
                            button.style.cursor = 'initial';
                            button.style.background = 'grey';
                            ico.style.backgroundImage = 'url(img/start.png)';
                            text.innerHTML = 'Start';
                            ico.style.width = '26px';
                            ico.style.height = '26px';
                        this.audio();
                        
                        clearTimeout(cycle);
                     
                    }
                    else setTimeout(timer, 1000);
                }
            }
        }
        else {
            this.timerActivate = false;
        }
        if(this.clickStart == true){
            ico.style.backgroundImage = 'url(img/pause.png)';
            text.innerHTML = 'Pause';
            ico.style.width = '25px';
            ico.style.height = '24px';
        }
        else {
            ico.style.backgroundImage = 'url(img/start.png)';
            text.innerHTML = 'Continue';
            ico.style.width = '26px';
            ico.style.height = '26px';
        }
        
    }
    audio(){
        this.startAudio = true;
        this.sound = new Audio();
        this.sound.src = 'audio.mp3';
        this.sound.preload = 'none';
        let playPromise = this.sound.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {    
                
           
            })
            .catch(error => {
                this.sound.play();
                function out(){
                    if(timer.sound.ended == true){
                        timer.sound.play();
                        setTimeout(()=>out(), 24000);
                    }
                }
                setTimeout(()=>out(), 24000);
                
             });
        }

        
        
    }

    stopAudio(){
        if(this.startAudio = true){
             if(this.sound !== undefined){
                this.sound.load();
             }
        }
    }

    addEvents(){
        let minus = document.querySelectorAll('.minus');
        let plus = document.querySelectorAll('.plus');
        let hours = document.querySelector('#hours');
        let minutes = document.querySelector('#minutes');
        let seconds = document.querySelector('#seconds');
        let reset = document.getElementById('reset');
        let start = document.getElementById('pause');

        reset.onmousedown = function(e){
            return false;
        }
        start.onmousedown = function(e){
            return false;
        }
        for(let elem of document.querySelectorAll('.minusT')){
            elem.onmousedown = function(e){
                return false;
            }
        }
        for(let elem of document.querySelectorAll('.plusT')){
            elem.onmousedown = function(e){
                return false;
            }
        }

        start.addEventListener('click',()=>{
            if(this.h != 0 || this.m != 0 || this.s != 0){
                if(this.timeout == false){
                    this.start();
                    hours.innerHTML = 0 +' hours';
                    minutes.innerHTML = 0 +' minutes';
                    seconds.innerHTML = 0 +' seconds';
                }
            }
        });

        reset.addEventListener('click',()=>{
            this.reset();
            hours.innerHTML = 0 +' hours';
            minutes.innerHTML = 0 +' minutes';
            seconds.innerHTML = 0 +' seconds';
        });
    
        // minhour.addEventListener('click',()=>{
        //     timer.minus('h', 1);
        //     hours.innerHTML = timer.h+' hours';
        // });
    
        // minminute.addEventListener('click',()=>{
        //     timer.minus('m', 1);
        //     minutes.innerHTML = timer.m+' minutes';
        // });
    
        // minsecond.addEventListener('click',()=>{
        //     timer.minus('s', 1);
        //     seconds.innerHTML = timer.s+' seconds';
        // });
    
        // plushour.addEventListener('click',()=>{
        //     timer.plus('h', 1);
        //     hours.innerHTML = timer.h+' hours';
        // });
    
        // plusminute.addEventListener('click',()=>{
        //     timer.plus('m', 1);
        //     minutes.innerHTML = timer.m+' minutes';
        // });
    
        // plussecond.addEventListener('click',()=>{
        //     timer.plus('s', 1);
        //     seconds.innerHTML = timer.s+' seconds';
        // });

        let forms = ['h', 'm', 's'];

        for(let i = 0; i < plus.length; i++){
            plus[i].addEventListener('click',()=>{
                if(this.buttonsActivate !=false){
                    timer.plus(forms[i], 1);
                    switch(i){
                    case 0: hours.innerHTML = timer.h+' hours';
                    break;
                    case 1: minutes.innerHTML = timer.m+' minutes';
                    break;
                    case 2: seconds.innerHTML = timer.s+' seconds';
                    }
                }
            });
        }

        for(let i = 0; i < minus.length; i++){
            minus[i].addEventListener('click',()=>{
                if(this.buttonsActivate != false){
                    timer.minus(forms[i], 1);
                    switch(i){
                        case 0: hours.innerHTML = timer.h+' hours';
                        break;
                        case 1: minutes.innerHTML = timer.m+' minutes';
                        break;
                        case 2: seconds.innerHTML = timer.s+' seconds';
                    }
                }              
            });
        }
    }


}

let timer = new Clock();

