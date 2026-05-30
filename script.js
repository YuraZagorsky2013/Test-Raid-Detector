console.log("JS STARTED");

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://gudtenuriajpddjsckxi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1ZHRlbnVyaWFqcGRkanNja3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzE4MjIsImV4cCI6MjA5NDI0NzgyMn0.wd89oJ95WgMnzI2TR1RfVR5dFcPYPCCAyQ-o7J1LbAk"
);

console.log("SUPABASE CONNECTED");

/* =========================
   ACCESS
========================= */

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
  "68165565538",
  "930132553"
];

/* =========================
   NAV
========================= */

function openPage(id, el){
  window.openPage = openPage;

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav button").forEach(b => b.classList.remove("active"));
  el.classList.add("active");
}

/* =========================
   TOAST
========================= */

const roleStyles = {
    user: "linear-gradient(90deg, #2b2b2b, #3a3a3a)",
    moderator: "linear-gradient(90deg, #1e3c72, #2a5298)",
    admin: "linear-gradient(90deg, #ff416c, #ff4b2b)"
};

const currentUser = {
    username: "Yur4ik2013",
    avatar: "https://i.pravatar.cc/100",
    role: "user"
};

function showToast(text){
  const toast = document.getElementById("toast");
  if(!toast) return;

  toast.innerText = text;
  toast.classList.add("show");

  setTimeout(()=> toast.classList.remove("show"), 2000);
}

/* =========================
   SETTINGS
========================= */

function openSettings(){
  document.getElementById("settings")?.classList.add("show");
}

function closeSettings(){
  document.getElementById("settings")?.classList.remove("show");
}

/* =========================
   PROFILE
========================= */

function saveProfile(){
  const name = document.getElementById("newName").value;
  const phone = document.getElementById("newPhone").value;
  const avatarInput = document.getElementById("newAvatar");

  localStorage.setItem("name", name);
  localStorage.setItem("phone", phone);

  document.getElementById("name").innerText = name;

  const file = avatarInput.files[0];

  if(file){
    const reader = new FileReader();

    reader.onload = e => {
      const avatar = e.target.result;
      localStorage.setItem("avatar", avatar);
      document.getElementById("avatar").src = avatar;
    };

    reader.readAsDataURL(file);
  }

  checkAccess();
  closeSettings();
  showToast("Профіль збережено");
}

function loadProfile(){
  const name = localStorage.getItem("name");
  const avatar = localStorage.getItem("avatar");

  if(name) document.getElementById("name").innerText = name;
  if(avatar) document.getElementById("avatar").src = avatar;
}

function resetProfile(){
  localStorage.clear();
  location.reload();
}

/* =========================
   ACCESS
========================= */

function checkAccess(){
  const phone = localStorage.getItem("phone");
  const editor = document.getElementById("newsEditor");

  if(!editor) return;

  editor.style.display = allowedPhones.includes(phone)
    ? "block"
    : "none";
}

/* =========================
   NEWS
========================= */

async function addNews(){
  const input = document.getElementById("newsInput");
  const text = input.value.trim();
  if(!text) return;

  const author = localStorage.getItem("name") || "Unknown";

  const { error } = await supabase
    .from("news")
    .insert([{ author, text }]);

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
  const list = document.getElementById("newsList");
  if(!list) return;

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("id", { ascending:false });

  if(error){
    console.log(error);
    return;
  }

  list.innerHTML = "";

  data.forEach(item=>{
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>${item.author}</b>
      <p>${item.text}</p>
    `;

    list.appendChild(div);
  });
}

/* =========================
   FORUM STATE
========================= */

let selectedMsgId = null;
let selectedMsgText = "";
let pressTimer = null;

/* =========================
   FORUM SEND
========================= */

async function sendForumMessage(text, replyTo=null){
  const messageText = text.trim();
  if(!messageText) return;

  const author = localStorage.getItem("name") || "Unknown";
  const avatar = localStorage.getItem("avatar") || "default.png";

  const { error } = await supabase
    .from("forum_messages")
    .insert([{
      author,
      avatar,
      text: messageText,
      reply_to: replyTo
    }]);

  if(error){
    console.log(error);
    showToast("Помилка");
    return;
  }

  renderForum();
}

/* =========================
   FORUM RENDER (FIXED)
========================= */

async function renderForum(){
  const container = document.getElementById("forumList");
  if(!container) return;

  const { data, error } = await supabase
    .from("forum_messages")
    .select("*")
    .order("id", { ascending: false }); // 🔥 новые сверху

  if(error){
    console.log(error);
    return;
  }

  container.innerHTML = "";

  data.forEach(msg=>{
    const div = document.createElement("div");
    div.className = "message";

    const time = msg.created_at
      ? new Date(msg.created_at).toLocaleString()
      : "now";

    div.innerHTML = `
      <div class="msgHeader">
        <img class="avatar" src="${msg.avatar || 'default.png'}">
        
        <div class="msgMeta">
          <b class="author">${msg.author}</b>
          <span class="time">🕒 ${time}</span>
        </div>
      </div>

      <div class="msgText">
        ${msg.text}
      </div>
    `;

    /* long press */
    div.addEventListener("mousedown", ()=>{
      pressTimer = setTimeout(()=>{
        openMsgMenu(msg.id, msg.text);
      }, 500);
    });

    div.addEventListener("mouseup", ()=> clearTimeout(pressTimer));
    div.addEventListener("mouseleave", ()=> clearTimeout(pressTimer));

    container.appendChild(div);
  });
}

/* =========================
   MESSAGE MENU (TELEGRAM STYLE FIX)
========================= */

function openMsgMenu(id, text){
  selectedMsgId = id;
  selectedMsgText = text;

  document.getElementById("msgMenuOverlay")?.classList.add("show");
}

function closeMsgMenu(){
  document.getElementById("msgMenuOverlay")?.classList.remove("show");
}

function editMsg(){
  const newText = prompt("Edit message:", selectedMsgText);
  if(!newText) return;

  supabase
    .from("forum_messages")
    .update({ text:newText })
    .eq("id", selectedMsgId)
    .then(()=> renderForum());

  closeMsgMenu();
}

function deleteMsg(){
  supabase
    .from("forum_messages")
    .delete()
    .eq("id", selectedMsgId)
    .then(()=> renderForum());

  closeMsgMenu();
}

function replyMsg(){
  showToast("Reply selected");
  closeMsgMenu();
}

/* =========================
   LOAD THEME (FIXED)
========================= */

function loadTheme(){
  const saved = localStorage.getItem("theme");

  if(saved === "dark"){
    document.body.classList.add("dark");
    const t = document.getElementById("themeToggle");
    if(t) t.checked = true;
  }
}

function toggleTheme(){
  const t = document.getElementById("themeToggle");

  if(t.checked){
    document.body.classList.add("dark");
    localStorage.setItem("theme","dark");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme","light");
  }
}

function renderRaiders(){

  const container = document.getElementById("raidersList");
  if(!container) return;

  container.innerHTML = "";

  raiders.forEach(r=>{
    const div = document.createElement("div");
    div.className = "raider-card";

    div.innerHTML = `
      <img src="${r.avatar}" class="raider-avatar">

      <div class="raider-info">
        <b>${r.name}</b>
        <div>${r.tag}</div>

        <div class="stats">
          🔥 ${r.danger} | ⚠️ ${r.raids}
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}


function renderChannels(){

  const container = document.getElementById("channelsList");
  if(!container) return;

  container.innerHTML = "";

  channels.forEach(c=>{
    const a = document.createElement("a");

    a.className = "box " + (c.type || "");
    a.href = c.link;
    a.target = "_blank";

    a.dataset.search = `${c.name} ${c.desc} ${c.tags}`.toLowerCase();

    a.innerHTML = `
      <b>${c.name}</b>
      <p>${c.desc}</p>
    `;

    container.appendChild(a);
  });
}

/* =========================
   INIT
========================= */

window.onload = ()=>{

document.getElementById("themeToggle")
.addEventListener("change", toggleTheme);

  loadProfile();
  renderForum();
  renderNews();
  renderRaiders();     // 🔥 ВОТ ОНИ
  renderChannels();    // 🔥 ВОТ ОНИ
  loadTheme();
  checkAccess();
};

/* =========================
   EXPORTS
========================= */

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













window.openPage = openPage;
window.saveProfile = saveProfile;
window.resetProfile = resetProfile;
window.sendForumMessage = sendForumMessage;
window.renderForum = renderForum;
window.addNews = addNews;
window.renderNews = renderNews;
window.openMsgMenu = openMsgMenu;
window.closeMsgMenu = closeMsgMenu;
window.editMsg = editMsg;
window.deleteMsg = deleteMsg;
window.replyMsg = replyMsg;
window.toggleTheme = toggleTheme;
window.openSettings = openSettings;
window.closeSettings = closeSettings;