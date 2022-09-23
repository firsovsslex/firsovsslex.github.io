
let calc = document.querySelector('.calculator');
let output = document.querySelector('#output');

let currentValue = 0;

let memory = [];

let exp = {
    values: ['0'],
    operators: [],
    result: 0,
    repeat: false,
    procActive: false
};

let numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

let operators = {
    plus: '+',
    minus: '-',
    mult: '*',
    degree: '/'
}

let commands = {
    MC(){
        memory.length = 0;
    },
    MR(){
        if(memory.length) exp.values[currentValue] = memory[memory.length - 1].toString();
    },
    Mp(value){
        if(value) memory[memory.length - 1] += +value;
    },
    Mm(value){
        if(value) memory[memory.length - 1] -= +value;
    },
    MS(value){
        if(value) memory.push(+value);
    },
    M(){
    
    },
    CE(value){
        if(value){
            exp.values[currentValue] = '0';
            exp.repeat = false;
        }
    },
    C(){
        currentValue = 0;
        exp.repeat = false;
        exp.result = 0;
        clear();
    },
    del(value){
        if(value){
            let res = value.slice(0, -1);
            exp.values[currentValue] = !res? '0': res;
        }     
    },
    procent(value){
        if(!value || currentValue < 1) return;
        exp.procActive = true;
        exp.values[currentValue] += '%'
    },
    recip(value){
        if(value) exp.values[currentValue] = String(1 / +value);
    },
    sqrt(value){
        if(value) exp.values[currentValue] = Math.sqrt(+value).toString();
    },
    sqr(value){
        if(value) exp.values[currentValue] = Math.pow(+value, 2).toString();
    },
    negat(value){
        if(!value) return;
        exp.values[currentValue] = String(-value);
    },
    zap(value){
        if(!value) return;

        if(!value.includes('.')){
            if(exp.repeat){
                exp.repeat = false;
                clear();
                exp.values.push(value);
            }
            exp.values[currentValue] += '.';
        }
    },
    equal(){
        if(exp.values.length + exp.operators.length < 3){
            let num1 = exp.values[0];      
            this.C();
            exp.values.push(num1);
            return;
        }
        if(!exp.repeat) exp.repeat = true;
        calculate();
    }

}

function read(value){
    let num = numbers.indexOf(value);
    if(~num) return num.toString();
    else if(Object.keys(operators).includes(value)) return operators[value];
    return value;
}

function resolve(a, b, c){
    a = +a;
    c = +c;
    switch(b){
        case '+': return a+c;
        case '-': return a-c;
        case '*': return a*c;
        case '/': return a/c;
        default: alert('error');
    }
}


function calculate(){
    currentValue = 0;
    exp.result = resolve(...update()).toString();
    if(!exp.repeat) clear();
    exp.values[0] = exp.result;
}

function clear(){
    exp.operators.length = 0;
    exp.values.length = 0; 
}


function update(){
    let res = [];
    for(let i = 0; i < exp.values.length; i++){
        res.push(exp.values[i]);
        res.push(exp.operators[i]);
    }
    return res.filter(elem => elem !== undefined);
}

function clickNumber(name){
    let value = exp.values[currentValue];
    let num = read(name);
    
    if(exp.repeat) {
        clear();
        exp.repeat = false;
    }

    value = value? value + num: num;
    if(value.startsWith('0') && !value.includes('.')) value = (+value).toString();

    exp.values[currentValue] = value;
}

function clickOper(name){
    let oper = read(name);

    if(exp.repeat){
        let num = exp.values[0];
        clear();
        exp.values.push(num);
        exp.repeat = false;
    }

    if(currentValue > 0){
        calculate();
    }      
    
    exp.operators.push(oper);
            
    currentValue++;    
}

function buttonActivate(button){
    let value = exp.values[currentValue];

    if(value && button !== 'del'){

        if(value.includes('%')){
            let op = exp.operators;
            value = +value.slice(0, -1) / 100;
            exp.values[currentValue] = String(op.includes('+') || op.includes('-')? exp.values[currentValue - 1] * value: value);
        }

        else if(!numbers.includes(button)){
            if(value.includes('.')){
                if(value.endsWith('0')){
                    let rez = -value.split``.reverse().findIndex(str => str !== '0');
                    value = value.slice(0, rez);
                }
                if(value.endsWith('.')){
                    value = value.slice(0, -1);
                }
    
                exp.values[currentValue] = value;
            }
            
        }
    }  

    if(!Object.keys(commands).includes(button)){

        if(numbers.includes(button)){        
            clickNumber(button);
        }  

        if(Object.keys(operators).includes(button)){         
            if(exp.values.length - exp.operators.length){
                clickOper(button);
            }
            else exp.operators[exp.operators.length-1] = read(button);
        }
    }



    else{
        value = exp.values[currentValue];
        commands[button](value);
    }

    
    
    if(!exp.values.length) exp.values.push('0');



    let restext = exp.textres = update().join`$`.replaceAll('.', ',');
   
    output.value = exp.repeat? restext.split`$`[0]: restext.split`$`.join` `;
    
}

calc.addEventListener('click', function(e){
    let button = e.target.closest('button');
    if(!button) return;
    let name = button.classList.item(1);
    buttonActivate(name || button.id);
   
});

