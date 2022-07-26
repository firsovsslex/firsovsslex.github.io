class Clock {
    constructor() {
        this.clock = document.getElementById("time");
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
    correct(time) {
        let arr = [time.getHours(), time.getMinutes(), time.getSeconds()];
        this.h = arr[0];
        this.m = arr[1];
        this.s = arr[2];
        arr = arr.map(function (item) {
            if (String(item).length < 2) {
                return "0" + item;
            }
            return String(item);
        });
        this.clock.innerHTML = arr.join(":");
    }

    plus(form, val) {
        if (form == "h") {
            if (this.h != 23) {
                this.time.setHours(this.time.getHours() + val);
                this.correct(this.time);
            }
        } else if (form == "m") {
            this.time.setMinutes(this.time.getMinutes() + val);
            this.correct(this.time);
        } else if (form == "s") {
            this.time.setSeconds(this.time.getSeconds() + val);
            this.correct(this.time);
        }
    }

    minus(form, val) {
        if (form == "h") {
            this.time.setHours(this.time.getHours() - val);
            this.correct(this.time);
        } else if (form == "m") {
            this.time.setMinutes(this.time.getMinutes() - val);
            this.correct(this.time);
        } else if (form == "s") {
            this.time.setSeconds(this.time.getSeconds() - val);
            this.correct(this.time);
        }
    }

    reset() {
        let ico = document.getElementById("start-pauseIcon");
        let text = document.getElementById("startbutton");
        let button = document.querySelector("#pause");

        this.timerActivate = false;
        this.time = new Date(0, 0, 0, 0, 0, 0);
        this.correct(this.time);
        this.buttonsActivate = true;
        this.clickStart = false;
        ico.style.backgroundImage = "url(img/start.png)";
        text.innerHTML = "Start";
        ico.style.width = "26px";
        ico.style.height = "26px";
        for (let elem of document.querySelectorAll(".minusT")) {
            elem.style.cursor = "pointer";
        }
        for (let elem of document.querySelectorAll(".plusT")) {
            elem.style.cursor = "pointer";
        }
        this.stopAudio();
        this.startAudio = false;
        this.timeout = false;

        button.style.cursor = "pointer";
        button.style.backgroundColor = "white";
    }

    start() {
        this.clickStart != true
            ? (this.clickStart = true)
            : (this.clickStart = false);
        this.timerActivate = true;
        this.buttonsActivate = false;
        for (let elem of document.querySelectorAll(".minusT")) {
            elem.style.cursor = "initial";
        }
        for (let elem of document.querySelectorAll(".plusT")) {
            elem.style.cursor = "initial";
        }
        let ico = document.getElementById("start-pauseIcon");
        let text = document.getElementById("startbutton");
        if (this.clickStart != false) {
            let timer = timerF.bind(this);
            let cycle = setTimeout(timer, 1000);
            function timerF() {
                if (this.timerActivate == true) {
                    this.time.setSeconds(this.time.getSeconds() - 1);
                    this.correct(this.time);

                    if (this.h == 0 && this.m == 0 && this.s == 0) {
                        this.timeout = true;
                        let button = document.querySelector("#pause");
                        button.style.cursor = "initial";
                        button.style.backgroundColor = "grey";
                        ico.style.backgroundImage = "url(img/start.png)";
                        text.innerHTML = "Start";
                        ico.style.width = "26px";
                        ico.style.height = "26px";
                        this.audio();

                        clearTimeout(cycle);
                    } else setTimeout(timer, 1000);
                }
            }
        } else {
            this.timerActivate = false;
        }
        if (this.clickStart == true) {
            ico.style.backgroundImage = "url(img/pause.png)";
            text.innerHTML = "Pause";
            ico.style.width = "25px";
            ico.style.height = "24px";
        } else {
            ico.style.backgroundImage = "url(img/start.png)";
            text.innerHTML = "Continue";
            ico.style.width = "26px";
            ico.style.height = "26px";
        }
    }
    audio() {
        this.startAudio = true;
        this.sound = new Audio();
        this.sound.src = "audio.mp3";
        let playPromise = this.sound.play();
        if (playPromise !== undefined) {
            playPromise
                .then((_) => {
                    this.sound.play();
                    function out() {
                        if (timer.sound.ended == true) {
                            timer.sound.play();
                            setTimeout(() => out(), 24000);
                        }
                    }
                    setTimeout(() => out(), 24000);
                })
                .catch((error) => {});
        }
    }

    stopAudio() {
        if ((this.startAudio = true)) {
            if (this.sound !== undefined) {
                this.sound.load();
            }
        }
    }

    addEvents() {
        let textb = document.querySelectorAll('.textb');
        let minus = document.querySelectorAll(".minus");
        let plus = document.querySelectorAll(".plus");
        let hours = document.getElementById("hours");
        let minutes = document.getElementById("minutes");
        let seconds = document.querySelector("#seconds");
        let reset = document.getElementById("reset");
        let start = document.getElementById("pause");
        

        textb[0].onmousedown = function (e) {
            return false;
        };

        textb[1].onmousedown = function (e) {
            return false;
        };

        start.onmouseover = () => {
            if (window.innerWidth >= 676) {
                if (this.timeout == false) {
                    start.style.background = "grey";
                }
            }
        };
        start.onmouseout = () => {
            if (window.innerWidth >= 676) {
                if (this.timeout == false) {
                    start.style.background = "white";
                }
            }
        };

        reset.onmouseover = () => {
            if (window.innerWidth >= 676) {
                reset.style.background = "grey";
            }
        };
        reset.onmouseout = () => {
            if (window.innerWidth >= 676) {
                reset.style.background = "white";
            }
        };

        reset.onmousedown = function (e) {
            return false;
        };
        start.onmousedown = function (e) {
            return false;
        };
        for (let elem of document.querySelectorAll(".minusT")) {
            elem.onmousedown = function (e) {
                return false;
            };
        }
        for (let elem of document.querySelectorAll(".plusT")) {
            elem.onmousedown = function (e) {
                return false;
            };
        }

        start.addEventListener("click", () => {
            if (this.h != 0 || this.m != 0 || this.s != 0) {
                if (this.timeout == false) {
                    this.start();
                    hours.innerHTML = 0 + " hours";
                    minutes.innerHTML = 0 + " minutes";
                    seconds.innerHTML = 0 + " seconds";
                }
            }
        });

        reset.addEventListener("click", () => {
            this.reset();
            hours.innerHTML = 0 + " hours";
            minutes.innerHTML = 0 + " minutes";
            seconds.innerHTML = 0 + " seconds";
        });

        let forms = ["h", "m", "s"];

        for (let i = 0; i < plus.length; i++) {
            plus[i].addEventListener("click", () => {
                if (this.buttonsActivate != false) {
                    timer.plus(forms[i], 1);
                    switch (i) {
                        case 0:
                            hours.innerHTML = timer.h + " hours";
                            break;
                        case 1:
                            minutes.innerHTML = timer.m + " minutes";
                            break;
                        case 2:
                            seconds.innerHTML = timer.s + " seconds";
                    }
                }
            });
        }

        for (let i = 0; i < minus.length; i++) {
            minus[i].addEventListener("click", () => {
                if (this.buttonsActivate != false) {
                    timer.minus(forms[i], 1);
                    switch (i) {
                        case 0:
                            hours.innerHTML = timer.h + " hours";
                            break;
                        case 1:
                            minutes.innerHTML = timer.m + " minutes";
                            break;
                        case 2:
                            seconds.innerHTML = timer.s + " seconds";
                    }
                }
            });
        }
    }
}

let timer = new Clock();

let alltext = document.querySelectorAll("p");
let divs = document.querySelector(".container");
let allbuttons = document.querySelectorAll("a");
let screenHeight = window.innerHeight;
let screenWidth = window.innerWidth;

// function correctSize(widthS){
//     divs.style.width = widthS/4+'px';
// }

// function media(){
//     let screenHeight = window.innerHeight;
//     let screenWidth = window.innerWidth;
//     let per = [];
//     let values = [];
//     per = per.concat(alltext, alldivs, allbuttons);
//     console.log(per);
//     values = per.map(function(item, index){
//         item = Array.from(item);
//         switch(index){
//             case 0: return item.map((item)=>+parseInt(getComputedStyle(item).fontSize)/(screenWidth/screenHeight));

//             case 1:
//                 return item.map((item)=>{
//                    let width = +parseInt(getComputedStyle(item).width)/(screenWidth/screenHeight);
//                    let height = +parseInt(getComputedStyle(item).height)/(screenWidth/screenHeight);
//                    return [width, height]
//                 });

//             case 2:
//                 return item.map((item)=>{
//                    let width = +parseInt(getComputedStyle(item).width)/(screenWidth/screenHeight);
//                    let height = +parseInt(getComputedStyle(item).height)/(screenWidth/screenHeight);
//                    return [width, height]
//                 });
//         }
//     });
//     for(let i = 0; i < alltext.length; i++){
//         alltext[i].style.fontSize = values[0][i]*2+'px';
//     }
//     for(let i = 0; i < alldivs.length; i++){
//         alldivs[i].style.width = values[1][i][0]*2+'px';
//         alldivs[i].style.height = values[1][i][1]*2+'px';
//     }
//     for(let i = 0; i < allbuttons.length; i++){
//         allbuttons[i].style.width = values[2][i][0]*2+'px';
//         allbuttons[i].style.height = values[2][i][1]*2+'px';
//     }
// }

// window.addEventListener('resize', function(){
//     let screenWidth = window.innerWidth;
//     correctSize(screenWidth);
// });
