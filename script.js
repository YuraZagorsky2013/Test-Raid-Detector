console.log("JS STARTED");

import { createClient }
from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(

    "https://gudtenuriajpddjsckxi.supabase.co",

    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1ZHRlbnVyaWFqcGRkanNja3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzE4MjIsImV4cCI6MjA5NDI0NzgyMn0.wd89oJ95WgMnzI2TR1RfVR5dFcPYPCCAyQ-o7J1LbAk"
);

console.log("SUPABASE CONNECTED");

/* ACCESS */

const allowedPhones = [
    "+380638796098",
    "+380681655538",
    "+373079468510",
    "+380930132553",
    "+380 (63) 879 60 98",
    "+380 (68) 165 55 38",
    "+373 (79) 468510",
    "+380 (93) 013 25 53",
    "638796098",
    "681655538",
    "930132553"
];

/* NAV */

function openPage(id, el){
window.openPage = openPage;

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

    const avatarInput =
        document.getElementById("newAvatar");

    localStorage.setItem("name", name);
    localStorage.setItem("phone", phone);

    document.getElementById("name").innerText = name;

    /* АВАТАР */

    const file = avatarInput.files[0];

    if(file){

        const reader = new FileReader();

        reader.onload = function(e){

            const avatarData = e.target.result;

            localStorage.setItem(
                "avatar",
                avatarData
            );

            document.getElementById("avatar").src =
                avatarData;
        };

        reader.readAsDataURL(file);
    }

    checkAccess();

    closeSettings();

    showToast("Профіль збережено")
}


function loadProfile(){

    const name =
        localStorage.getItem("name");

    const avatar =
        localStorage.getItem("avatar");

    if(name){

        document.getElementById("name").innerText =
            name;
    }

    if(avatar){

        document.getElementById("avatar").src =
            avatar;
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

async function addNews(){

    const input =
        document.getElementById("newsInput");

    const text =
        input.value.trim();

    if(!text) return;

    const author =
        localStorage.getItem("name")
        || "Unknown";

    const {
        error
    } = await supabase

    .from("news")

    .insert([
        {
            author:author,
            text:text
        }
    ]);

    if(error){

        console.log(error);

        showToast("Помилка");

        return;
    }

    input.value = "";

    renderNews();

    showToast("Новину додано");
}

async function renderNews(){

    const list =
        document.getElementById("newsList");

    list.innerHTML = "";

    const {
        data,
        error
    } = await supabase

    .from("news")

    .select("*")

    .order("id",{ascending:false});

    if(error){

        console.log(error);

        return;
    }

    data.forEach(item=>{

        const div =
            document.createElement("div");

        div.className = "card";

        div.innerHTML = `
            <b>${item.author}</b>
            <p>${item.text}</p>
        `;

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

function toggleTheme(){

    const toggle =

        document.getElementById("themeToggle");

    if(toggle.checked){

        document.body.classList.add("dark");

        localStorage.setItem(

            "theme",

            "dark"

        );

    }

    else{

        document.body.classList.remove("dark");

        localStorage.setItem(

            "theme",

            "light"
         );
     }
}





function loadTheme(){

    const savedTheme =
        localStorage.getItem("theme");

    if(savedTheme){

        if(savedTheme === "dark"){

            document.body.classList.add("dark");

            document.getElementById("themeToggle").checked = true;
        }

        return;
    }

    const prefersDark =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

    if(prefersDark){

        document.body.classList.add("dark");

        document.getElementById("themeToggle").checked = true;
    }
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

const guideAnswers = {

    "рейд":
        "🚨 Якщо почався рейд — одразу приберіть підозрілих адміністраторів.",

    "захист":
        "🛡 Увімкніть 2FA та не передавайте PIN-код.",

    "2fa":
        "🔐 2FA — це додатковий PIN-код для входу у Viber.",

    "спам":
        "📛 Увімкніть підтвердження повідомлень та обмежте лінки."
};

function quickAsk(text){

    addMsg(text,"user");

    setTimeout(()=>{

        addMsg(
            botReply(text),
            "bot"
        );

    },300);
}

function botReply(text){

    text = text.toLowerCase().trim();

    /* РЕЙД */

    if(
        text.includes("рейд") ||
        text.includes("захват") ||
        text.includes("raid")
    ){
        return "🚨 Якщо почався рейд — одразу приберіть підозрілих адміністраторів та увімкніть 2FA.";
    }

    /* ЗАХИСТ */

    if(
        text.includes("захист") ||
        text.includes("безпека") ||
        text.includes("security")
    ){
        return "🛡 Нікому не передавайте PIN-код та не переходьте за підозрілими лінками.";
    }

    /* 2FA */

    if(
        text.includes("2fa") ||
        text.includes("двухетап") ||
        text.includes("двухфактор")
    ){
        return "🔐 2FA — це додатковий PIN-код для захисту акаунта.";
    }

    /* СПАМ */

    if(
        text.includes("спам") ||
        text.includes("spam")
    ){
        return "📛 Якщо вас спамлять — закрийте доступ до повідомлень та поскаржтесь.";
    }

    /* ХАК */

    if(
        text.includes("взлом") ||
        text.includes("хак") ||
        text.includes("hack")
    ){
        return "⚠️ Якщо акаунт зламали — терміново змініть пароль та видаліть чужі сесії.";
    }

    /* ВІРУС */

    if(
        text.includes("вірус") ||
        text.includes("virus")
    ){
        return "🦠 Не встановлюйте APK-файли від незнайомих людей.";
    }

    /* ПЕРЕВІРКА НІКУ */

    const foundRaider = raiders.find(r =>

        text.includes(r.name.toLowerCase()) ||
        text.includes(r.tag.toLowerCase())
    );

    if(foundRaider){

        return `
⚠️ Знайдено в базі рейдерів

👤 ${foundRaider.name}
🏷 ${foundRaider.tag}
🔥 Рівень небезпеки: ${foundRaider.danger}
⚔️ Рейдів: ${foundRaider.raids}
        `;
    }

    /* БЕЗПЕЧНИЙ */

    if(
        text.includes("безпечний") ||
        text.includes("safe")
    ){
        return "✅ Якщо людини немає в базі рейдерів — це ще не гарантує безпеку.";
    }

    /* НЕВІДОМО */

    return "🤖 Я не знайшов відповіді. Спробуйте інші ключові слова.";
}

document.getElementById("themeToggle")
.addEventListener("change", toggleTheme);


/* CHART */

window.onload = ()=>{

    loadProfile();

    loadTheme();

    checkAccess();

    renderNews();

    renderRaiders();
    
    renderChannels();

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
                label:"Кількість рейдів",

                data:[0,0,0,4,0,0,0],

                borderColor:"#3aa0ff",

                tension:0.4
            }]
        }
    });
};

function searchContent(value){

    value = value.toLowerCase().trim();

    const elements =
        document.querySelectorAll(
            ".box, .card, .raider-card"
        );

    if(value === ""){

        elements.forEach(el=>{

            el.style.display = "";
        });

        return;
    }

    elements.forEach(el=>{

        const text =
            el.innerText.toLowerCase();

        const extra =
            (el.dataset.search || "")
            .toLowerCase();

        if(
            text.includes(value) ||
            extra.includes(value)
        ){

            el.style.display = "";
        }
        else{

            el.style.display = "none";
        }
    });
}

function renderRaiders(){

    const container =
        document.getElementById("raidersList");

    container.innerHTML = "";

    raiders.forEach(raider=>{

        const div =
            document.createElement("div");

        div.className = "raider-card searchable";

        div.innerHTML = `
            <img
                src="${raider.avatar}"
                class="raider-avatar"
            >

            <div class="raider-info">

                <div class="raider-name">
                    ${raider.name}
                </div>

                <div class="raider-tag">
                    ${raider.tag}
                </div>

                <div class="raider-stats">

                    <span class="danger">
                        🔥 Рівень ${raider.danger}
                    </span>

                    <span class="raids">
                        ⚠️ ${raider.raids} рейдів
                    </span>

                </div>

            </div>
        `;

        container.appendChild(div);
    });
}




function renderChannels(){

    const container =
        document.getElementById("channelsList");

    container.innerHTML = "";

    channels.forEach(channel=>{

        const a =
            document.createElement("a");

        a.className =
            "box " + channel.type;

        a.href =
            channel.link;

        a.target = "_blank";

        a.dataset.search =
            `
            ${channel.name}
            ${channel.desc}
            ${channel.tags}
            `.toLowerCase();

        a.innerHTML = `
            <b>${channel.name}</b>

            <p>${channel.desc}</p>
        `;

        container.appendChild(a);
    });
}






const raiders = [
    {
        avatar:"20260513221929.png",
        name:"Алекс",
        tag:"@Ыыы",
        danger:1,
        raids:46
    },

    {
        avatar:"20260514182103.png",
        name:"VLASICHOOOOK",
        tag:"@LEONCHIK",
        danger:3,
        raids:12
    },

    {
        avatar: "20260513221929.png",
        name: "Яся",
        tag: "@★⁓((Яся))⁓★",
        danger:4,
        raids:0
    },

    {
        avatar: "20260513221929.png",
        name: "Некий",
        tag: "@некий ",
        danger:2,
        raids:0
    },

    {
        avatar: "20260513221929.png",
        name: "X-16",
        tag: "@почему я",
        danger:2,
        raids:20
    },
    {
        avatar: "20260522123339.png",
        name: "X-17",
        tag: "underfined",
        danger:3,
        raids:20
    },
    {
        avatar: "20260522124356.png",
        name: "BlueLock",
        tag: "@Исаґи",
        danger:3,
        raids:10
    }
];







const channels = [

    {
        name:"БКV",
        desc:"(Безпека Каналів Viber) інформаційний канал автора цього сайту",
        type:"box creator",
        link:"https://invite.viber.com/?g2=AQBBDKNn7JFDQFYpaWK3VmFGOgYA2zuS0MPX1xGijrCdX3fkP5%2BdN1tPOoXUYUH%2F",
        tags:"БКV безпека захист viber"
    },

    {
        name:"ВІПЗ",
        desc:"Вся інфа про захват",
        type:"box infochanel",
        link:"https://invite.viber.com/?g2=AQBvDLtUVRVjelVh4RSVqkNRHhtLz7WHZR8rWv2OYY4Vz5lM4LKnjw%2B9E3Td1snP",
        tags:"ВІПЗ новини"
    },

    {
        name:"ІТРН",
        desc:"інформаційний канал. не нехтуйте, коли вони оголошують тривогу",
        type:"box infochanel",
        link:"https://invite.viber.com/?g2=AQBvDLtUVRVjelVh4RSVqkNRHhtLz7WHZR8rWv2OYY4Vz5lM4LKnjw%2B9E3Td1snP",
        tags:"ІТРН Рома новини"
    },

    {
        name:"АІПЗ",
        desc:"інформаційний канал",
        type:"infochanel",
        link:"https://invite.viber.com/?g2=AQAV3cSlplfIfVYYLarvOTkCGHxXMYUtaaZ7ZhrGRI5iFNuQKEtmuIQ%2Bzjk1EfhK",
        tags:"АІПЗ новини"
    },

    {
        name:"КЗІП",
        desc:"інформаційний канал",
        type:"infochanel",
        link:"https://invite.viber.com/?g2=AQAF%2F9L665rn2FZugBy2lWzxO%2BgxsMsROQ%2F09KMsrbVQ4q018TsKRioTBs%2FIOGIb",
        tags:"КЗІП новини"
    },

    {
        name:"ПЗК",
        desc:"інформаційний канал",
        type:"infochanel",
        link:"https://invite.viber.com/?g2=AQB0GD7IPR3Hh1Zn7j2KRS7Zbds8uQ2afIQ0h2XzV59fNjqPkjdbbTT13mKiJLOX",
        tags:"ПЗК Алiка новини"
    },
    
    {
        name:"ХВР",
        desc:"інформаційний канал",
        type:"infochanel",
        link:"https://invite.viber.com/?g2=AQBrdDrLlbm4hlZYx5HFHrLcdgiRO3JkSBGTs9wkNJkLLxlXFKPkzWW3v065jphQ",
        tags:"ХВР новини"
    },
 
    {
        name:"ПЗІ",
        desc:"інформаційний канал",
        type:"infochanel",
        link:"https://invite.viber.com/?g2=AQA994%2Bx0lRf1FZ%2BVsJbdvurEkXzVdaoXD3zYQzB%2F8wHorsHWYw6zQNPJ2v3ik%2FB",
        tags:"ПЗІ новини"
    },

    {
        name:"ХПЗ",
        desc:"інформаційний канал",
        type:"infochanel",
        link:"https://invite.viber.com/?g2=AQBFUSWTCzG5QlY14Y8D7w%2F3I8RdbzYvby1c2GypQ%2BHcjjdc8lmuk52z7z%2F2ZufN",
        tags:"ХПЗ новини"
    },

    {
        name:"підвал Рік Пау",
        desc:"нейтральний інформаційний канал",
        type:"Ninfochanel",
        link:"https://invite.viber.com/?g2=AQBGTAtmqA7dilZJYFxNZDwvlxztimZ%2BW%2FRVbQ6OhyYh9nZxhVST1KbiGOr9X5KI",
        tags:"Рік пау новини нейтрал"
    },
  
    {
        name:"solid owl",
        desc:"канал ліквідатора solid",
        type:"likvidator",
        link:"https://invite.viber.com/?g2=AQA2OhSNg5g3mFWibB1Pnh%2B9dDCoxrVStdDkuPZQzO02EVibQr3KH4lGfaGfGj%2BK",
        tags:"solid ліквідатор"
    },

    {
        name:"VLASICHOOOK",
        desc:"канал рейдера Vlasik",
        type:"box raider",
        link:"https://invite.viber.com/?g2=AQAYrRGY%2FwSWV1YjD0ce4nGNdkmapFESratZGaO25lrDmM0D73XqghFzrCLOa%2BXR",
        tags:"VLAS VLASIK VLASICHOK рейдер"
    },

    
        
    {
        name:"BlueLock⛓️",
        desc:"Імперія рейдерів",
        type:"box raider",
        link:"https://invite.viber.com/.....",
        tags:"рейдери bluelock"
    }

];






window.addNews = addNews;

window.openPage = openPage;

window.openSettings = openSettings;

window.closeSettings = closeSettings;

window.saveProfile = saveProfile;

window.resetProfile = resetProfile;

window.sendMessage = sendMessage;