

document.addEventListener('DOMContentLoaded', startScript);

function startScript(){

    let options = document.querySelector("#opts");
    let container = document.querySelector(".container");

    if(!localStorage.getItem('procent')) localStorage.setItem("procent", 20);
    if(!localStorage.getItem('width')) localStorage.setItem("width", 10);
    if(!localStorage.getItem('height')) localStorage.setItem("height", 10);

    options.addEventListener("click", () => {
        clickOptions();
    });
    
    function clickOptions() {
        container.innerHTML = "";
        let nastr = document.createElement("div");
        let resbutton = document.createElement('button');
        resbutton.className = 'res';
        resbutton.textContent = 'Сохранить';
        nastr.className = "options";
        let texts = ["% Мин", "Длина поля", "Высота поля"];
        let ranges = [
            [10, 60],
            [5, 30],
            [5, 20],
        ];
        let um = [
            localStorage.getItem("procent"),
            localStorage.getItem("width"),
            localStorage.getItem("height"),
        ];
        let names = ["procent", "width", "height"];
        for (let i = 0; i < 3; i++) {
            let input = document.createElement("input");
            let text = document.createElement("p");
            let value = document.createElement("span");
            value.className = "znach";
            text.className = "opttext";
            text.textContent = texts[i];
            input.className = "inputs";
            input.setAttribute("type", "range");
            input.setAttribute("min", ranges[i][0]);
            input.setAttribute("max", ranges[i][1]);
            input.setAttribute("step", "1");
            input.setAttribute("name", names[i]);
            input.setAttribute("value", um[i]);
            value.innerHTML = input.getAttribute("value");
            nastr.append(text, value, input);
        }
        nastr.append(resbutton);
        let inputs = Array.from(nastr.querySelectorAll('.inputs'));  
        for(let input of inputs){
            input.oninput = function(){
                input.previousElementSibling.textContent = input.value;
            }
        }     
    
        resbutton.onclick = function(){
            for(let inp of nastr.querySelectorAll('.inputs')){
                localStorage.setItem(inp.name, inp.value);
            }
            location = location;
        }
    
        container.append(nastr);
        
    }
}

