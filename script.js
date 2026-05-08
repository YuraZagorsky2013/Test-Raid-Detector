console.log("JS STARTED");

/* ACCESS */

const allowedPhones = [
    "+380638796098",
    "+380673752482",
    "+373079468510"
];

/* NAV */

function openPage(id, el){

    document.querySelectorAll(".page").forEach(page=>{
        page.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".nav button").forEach(btn=>{
        btn.classList.remove("active");
    });

    el.classList.add("active");
}

/* TOAST */

function showToast(text){

    const toast = document.getElementById("toast");

    toast.innerText = text;

    toast.classList.add("show");

    setTimeout(()=>{
        toast.classList.remove("show");
    },2000);
}

/* SETTINGS */

function openSettings(){
    document.getElementById("settings").classList.add("show");
}

function closeSettings(){
    document.getElementById("settings").classList.remove("show");
}

/* PROFILE */

function saveProfile(){

    const name =
        document.getElementById("newName").value;

    const phone =
        document.getElementById("newPhone").value;

    localStorage.setItem("name",name);
    localStorage.setItem("phone",phone);

    document.getElementById("name").innerText = name;

    checkAccess();

    closeSettings();

    showToast("Профіль збережено");
}

function loadProfile(){

    const name = localStorage.getItem("name");

    if(name){
        document.getElementById("name").innerText = name;
    }
}

function resetProfile(){

    localStorage.clear();

    location.reload();
}

/* ACCESS */

function checkAccess(){

    const phone =
        localStorage.getItem("phone");

    const editor =
        document.getElementById("newsEditor");

    if(allowedPhones.includes(phone)){
        editor.style.display = "block";
    }
    else{
        editor.style.display = "none";
    }
}

/* NEWS */

function addNews(){

    const input =
        document.getElementById("newsInput");

    const text = input.value.trim();

    if(!text) return;

    let news =
        JSON.parse(localStorage.getItem("news") || "[]");

    news.unshift(text);

    localStorage.setItem(
        "news",
        JSON.stringify(news)
    );

    input.value = "";

    renderNews();

    showToast("Новину додано");
}

function renderNews(){

    const list =
        document.getElementById("newsList");

    list.innerHTML = "";

    const news =
        JSON.parse(localStorage.getItem("news") || "[]");

    news.forEach(item=>{

        const div =
            document.createElement("div");

        div.className = "card";

        div.innerText = item;

        list.appendChild(div);
    });
}

/* CHAT */

function sendMessage(){

    const input =
        document.getElementById("chatInput");

    const text = input.value.trim();

    if(!text) return;

    addMsg(text,"user");

    setTimeout(()=>{

        addMsg(
            botReply(text),
            "bot"
        );

    },400);

    input.value = "";
}

function addMsg(text,type){

    const box =
        document.getElementById("chatMessages");

    const div =
        document.createElement("div");

    div.className = "msg " + type;

    div.innerText = text;

    box.appendChild(div);

    box.scrollTop = box.scrollHeight;
}

function botReply(text){

    text = text.toLowerCase();

    if(text.includes("рейд")){
        return "Змініть пароль і приберіть підозрілих адмінів.";
    }

    if(text.includes("захист")){
        return "Увімкніть 2FA і не переходьте за підозрілими лінками.";
    }

    if(text.includes("двухетапна перевірка")){
        return "Двухетапна перевірка — це PIN-код для входу у Viber.";
    }

   if(text.includes("що таке двухетапна перевірка")){
        return "Двухетапна перевірка (2FA)— це PIN-код для входу у Viber.";
    }
    
    return "Вибачте, я вас не розумію. спробуйте написати за цими тегами: ”рейд”, ”захист”, ”двухетапна перевірка”";
}

/* CHART */

window.onload = ()=>{

    loadProfile();

    checkAccess();

    renderNews();

    const ctx =
        document.getElementById("chart");

    new Chart(ctx,{

        type:"line",

        data:{
            labels:[
                "Пн",
                "Вт",
                "Ср",
                "Чт",
                "Пт",
                "Сб",
                "Нд"
            ],

            datasets:[{
                label:"Рівень загроз",

                data:[1,2,1,3,2,4,3],

                borderColor:"#3aa0ff",

                tension:0.4
            }]
        }
    });
};