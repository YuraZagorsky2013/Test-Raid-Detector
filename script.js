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
  "+380983756610",
  "+380 (63) 879 60 98",
  "+380 (68) 165 55 38",
  "+373 (79) 468510",
  "+380 (93) 013 25 53",
  "638796098",
  "68165565538",
  "930132553"
];

const phone =
    localStorage.getItem("phone")
    || "";



async function isAdmin(){

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if(!user) return false;

  const { data } =
    await supabase

      .from("admins")

      .select("*")

      .eq(
        "email",
        user.email
      )
      .single();

  return !!data;
}


function openUserInfo(
    avatar,
    name,
    phone
){

    if(
        localStorage.getItem("phone")
        !== "+380638796098"
    ){
        return;
    }

    document.getElementById(
        "userInfoAvatar"
    ).src = avatar;

    document.getElementById(
        "userInfoName"
    ).innerText = name;

    document.getElementById(
        "userInfoPhone"
    ).innerText = phone;

    document.getElementById(
        "userInfoModal"
    ).classList.add(
        "show"
    );
}




function closeUserInfo(){

    document.getElementById(
        "userInfoModal"
    ).classList.remove(
        "show"
    );
}



const ADMIN_PHONE = "+380638796098";
const PASSWORD = "Sc203#";

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 60 * 60 * 1000; // 1 час



function getAuthData() {
  return JSON.parse(localStorage.getItem("authData")) || {
    attempts: 0,
    blockedUntil: 0
  };
}

function setAuthData(data) {
  localStorage.setItem("authData", JSON.stringify(data));
}


function isBlocked() {
  const data = getAuthData();
  return Date.now() < data.blockedUntil;
}


function checkPhoneAccess(phoneInput, passwordInput) {
  const phone = phoneInput.trim();
  const pass = passwordInput.trim();

  const data = getAuthData();

  // если заблокирован
  if (isBlocked()) {
    showToast("Ліміт вичерпано. спробуйте через 1 годину");
    return false;
  }

  // если это НЕ твой номер → просто пропускаем (или можешь ограничить)
  if (phone !== ADMIN_PHONE) {
    return true;
  }

  // проверка пароля
  if (pass === PASSWORD) {
    setAuthData({ attempts: 0, blockedUntil: 0 });
    return true;
  }

  // ошибка пароля
  data.attempts += 1;

  if (data.attempts >= MAX_ATTEMPTS) {
    data.blockedUntil = Date.now() + BLOCK_TIME;
    data.attempts = 0;
    showToast("Вичерпано ліміт. Блок на 1 годину");
  } else {
    showToast(`Неправильний пароль (${data.attempts}/${MAX_ATTEMPTS})`);
  }

  setAuthData(data);
  return false;
}



function login() {
  const phone = document.getElementById("newPhone").value;
  const password = prompt("Введіть пароль:");

  if (checkPhoneAccess(phone, password)) {
    localStorage.setItem("phone", phone);
    showToast("Доступ дозволено");
    checkAccess();
  }
}





/* =========================
   NAV
========================= */

function openPage(id, el){

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

  // если номер НЕ в списке → сразу скрыть
  if(!allowedPhones.includes(phone)){
    editor.style.display = "none";
    return;
  }

  // если в списке → НО требует пароль
  const ok = sessionStorage.getItem("auth_ok");

  if(ok === "true"){
    editor.style.display = "block";
  } else {
    editor.style.display = "none";
    askPassword(); // 👈 вот тут магия
  }
}







let attempts = 0;
let blockedUntil = 0;

function askPassword(){
  if(Date.now() < blockedUntil){
    showToast("Почекайте 1 годину");
    return;
  }

  const pass = prompt("Введiть пароль:");

  if(pass === "Sc203#"){
    sessionStorage.setItem("auth_ok", "true");
    attempts = 0;
    checkAccess();
    return;
  }

  attempts++;

  if(attempts >= 5){
    blockedUntil = Date.now() + 3600000;
    attempts = 0;
    showToast("Забагато спроб. Заблоковано на 1 годину");
  } else {
    showToast(`Неправильно (${attempts}/5)`);
  }
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

function updateNewsBadge(){

    const badge =
        document.getElementById(
            "newsBadge"
        );

    const lastRead =
        Number(
            localStorage.getItem(
                "lastNewsRead"
            ) || 0
        );

    if(
        currentLatestNewsId >
        lastRead
    ){

        badge.style.display =
            "flex";
    }
    else{

        badge.style.display =
            "none";
    }
}






// ===============================
// LANGUAGE SYSTEM (PATH 2 FINAL)
// ===============================

let currentLanguage = "ru";
let originalNodes = [];
let isOriginalStored = false;

// Фразы, которые нельзя доверять автопереводу
const MANUAL_TRANSLATIONS = {
  "uk": {
    "Захист каналу": "Захист каналу",
    "Профиль": "Профіль",
    "Настройки": "Налаштування",
    "Главная": "Головна",
    "Сообщения": "Повідомлення"
  },
  "en": {
    "Захист каналу": "Channel protection",
    "Профиль": "Profile",
    "Настройки": "Settings",
    "Главная": "Home",
    "Сообщения": "Messages"
  }
};

// -------------------------------
// 1) Собираем оригинальный русский текст
// -------------------------------
function storeOriginalContent() {
  if (isOriginalStored) return;

  originalNodes = [];

  // Текстовые узлы
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        // Игнорируем script/style
        const tag = parent.tagName?.toLowerCase();
        if (tag === "script" || tag === "style" || tag === "noscript") {
          return NodeFilter.FILTER_REJECT;
        }

        // Игнорируем элементы с запретом перевода
        if (parent.closest("[data-no-translate]")) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node;
  while ((node = walker.nextNode())) {
    originalNodes.push({
      type: "text",
      node,
      original: node.nodeValue
    });
  }

  // placeholder / value у input и textarea
  document.querySelectorAll("input, textarea").forEach(el => {
    if (el.closest("[data-no-translate]")) return;

    if (el.placeholder) {
      originalNodes.push({
        type: "placeholder",
        node: el,
        original: el.placeholder
      });
    }

    // Переводим value только у кнопок/submit, а не у полей ввода текста
    const type = (el.type || "").toLowerCase();
    if ((type === "button" || type === "submit") && el.value) {
      originalNodes.push({
        type: "value",
        node: el,
        original: el.value
      });
    }
  });

  isOriginalStored = true;
  console.log("ORIGINAL CONTENT STORED:", originalNodes.length);
}

// -------------------------------
// 2) Вернуть оригинальный русский
// -------------------------------
function restoreOriginalLanguage() {
  originalNodes.forEach(item => {
    if (item.type === "text") {
      item.node.nodeValue = item.original;
    } else if (item.type === "placeholder") {
      item.node.placeholder = item.original;
    } else if (item.type === "value") {
      item.node.value = item.original;
    }
  });
}

// -------------------------------
// 3) Получить все оригинальные тексты для перевода
// -------------------------------
function getOriginalTexts() {
  return originalNodes.map(item => item.original);
}

// -------------------------------
// 4) Перевод текста через API
// -------------------------------
async function translateTexts(texts, targetLang) {
  // пустые не трогаем
  const prepared = texts.map(t => (t || "").trim());

  // Разбиваем на куски, чтобы URL не взорвался
  const chunks = [];
  const chunkSize = 40;
  for (let i = 0; i < prepared.length; i += chunkSize) {
    chunks.push(prepared.slice(i, i + chunkSize));
  }

  const results = [];

  for (const chunk of chunks) {
    const translatedChunk = await Promise.all(
      chunk.map(async text => {
        if (!text) return text;

        // ручные переводы имеют приоритет
        if (MANUAL_TRANSLATIONS[targetLang]?.[text]) {
          return MANUAL_TRANSLATIONS[targetLang][text];
        }

        try {
          const url =
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

          const response = await fetch(url);
          const data = await response.json();

          if (data && data[0]) {
            return data[0].map(part => part[0]).join("");
          }

          return text;
        } catch (err) {
          console.error("Translation error for:", text, err);
          return text;
        }
      })
    );

    results.push(...translatedChunk);
  }

  return results;
}

// -------------------------------
// 5) Применить переводы к DOM
// -------------------------------
function applyTranslatedTexts(translatedTexts) {
  originalNodes.forEach((item, index) => {
    const translated = translatedTexts[index];
    if (translated == null) return;

    if (item.type === "text") {
      item.node.nodeValue = translated;
    } else if (item.type === "placeholder") {
      item.node.placeholder = translated;
    } else if (item.type === "value") {
      item.node.value = translated;
    }
  });
}

// -------------------------------
// 6) Обновить активную кнопку языка
// -------------------------------
function updateLanguageButtons(lang) {
  document.querySelectorAll(".lang-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

// -------------------------------
// 7) Перевод профиля отдельно (если нужно)
// -------------------------------
async function translateProfileSection(lang) {
  const profile = document.querySelector(".profile, #profile, .profile-card");
  if (!profile) return;

  // если профиль уже попал в общий перевод — можно ничего не делать
  // но если у тебя профиль подгружается отдельно/динамически — тогда:
  // сюда потом можно добавить отдельную обработку
}

// -------------------------------
// 8) Главная функция смены языка
// -------------------------------
async function changeSiteLanguage(lang) {
  try {
    if (!isOriginalStored) {
      storeOriginalContent();
    }

if (lang === "ru") {
    document.body.classList.remove("ua-mode");

    restoreOriginalLanguage();
    updateLanguageButtons(lang);
    return; // ← здесь функция заканчивается
}

currentLanguage = lang;
localStorage.setItem("siteLanguage", lang);

// ...

if (lang === "ru") {
    updateLanguageButtons(lang);
    await translateProfileSection(lang);
    console.log("LANGUAGE RESTORED: RU");
    return;
}


    // Иначе переводим ИМЕННО ИЗ РУССКОГО ОРИГИНАЛА
    const originalTexts = getOriginalTexts();
    const translatedTexts = await translateTexts(originalTexts, lang);

    applyTranslatedTexts(translatedTexts);
    updateLanguageButtons(lang);
    await translateProfileSection(lang);

    console.log(`LANGUAGE APPLIED: ${lang.toUpperCase()}`);
  } catch (err) {
    console.error("changeSiteLanguage error:", err);
  }
}

// -------------------------------
// 9) Инициализация
// -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  storeOriginalContent();

  const savedLang = localStorage.getItem("siteLanguage") || "ru";

  // Назначаем обработчики кнопкам
  document.querySelectorAll(".lang-option").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      changeSiteLanguage(lang);
    });
  });

  updateLanguageButtons(savedLang);

  if (savedLang !== "ru") {
    await changeSiteLanguage(savedLang);
  }
});

// чтобы можно было вызвать вручную
window.changeSiteLanguage = changeSiteLanguage;







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

  const phone =
    localStorage.getItem(
        "phone"
    );

  const author = localStorage.getItem("name") || "Unknown";
  const avatar = localStorage.getItem("avatar") || "default.png";

  const { error } = await supabase
    .from("forum_messages")
    .insert([{
      author,
      avatar,
      phone,
      text: messageText,
      reply_to: replyTo
    }]);

  if(error){
    console.error(error);
    
    showToast("Помилка");
    return;
  }

  renderForum();
}

/* =========================
   FORUM RENDER (FIXED)
========================= */

async function renderForum(){

    const container =
        document.getElementById("forumList");

    if(!container) return;

    const { data, error } =
        await supabase

        .from("forum_messages")

        .select("*")

        .order("id", {
            ascending:false
        });

    if(error){

        console.log(error);

        return;
    }

    container.innerHTML = "";

    data.forEach(msg=>{

        const div =
            document.createElement("div");

        div.className = "message";

        const time =
            msg.created_at
            ? new Date(
                msg.created_at
              ).toLocaleString()
            : "Зараз";

        div.innerHTML = `

            <div class="forum-header">

                <img
                    src="${msg.avatar || '20260513221929.png'}"
                    class="forum-avatar"
                >

                <div>

                    <div class="forum-name">
                        ${msg.author || "Unknown"}
                    </div>

                    <div class="forum-time">
                        🕒 ${time}
                    </div>

                </div>

            </div>

            <div class="forum-text">
                ${msg.text}
            </div>

        `;

        const avatar =
            div.querySelector(
                ".forum-avatar"
            );

        avatar.addEventListener(
            "click",
            ()=>{

                openUserInfo(
                    msg.avatar,
                    msg.author,
                    msg.phone
                );

            }
        );

        container.appendChild(div);

    });

}



function openNews(){

    openPage("news");

    localStorage.setItem(
        "lastNewsRead",
        currentLatestNewsId
    );

    updateNewsBadge();
}



function handleSendForum() {
  const input = document.querySelector("#forumInput");

  sendForumMessage(input.value);
  input.value = "";
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

function toggleUAMode(){

    const enabled =
        document.body.classList.toggle("ua-mode");

    localStorage.setItem(
        "ua_mode",
        enabled ? "on" : "off"
    );

    showToast(
        enabled
        ? "💙💛 Український режим увімкнено"
        : "UA-режим вимкнено"
    );

}


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
   SAFETY GUIDE AI
========================= */

let guideHistory = [];

/* Добавление сообщения в чат */
function addGuideMessage(text, sender = "bot") {
  const chat = document.getElementById("chatMessages");
  if (!chat) return;

  const div = document.createElement("div");
  div.className = `msg ${sender}`;

  // чтобы переносы строк сохранялись
  div.innerHTML = text.replace(/\n/g, "<br>");

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

/* Индикатор "думает..." */
function showTyping() {
  const chat = document.getElementById("chatMessages");
  if (!chat) return null;

  const div = document.createElement("div");
  div.className = "msg bot";
  div.id = "guideTyping";
  div.innerText = "SafetyGuide думає...";
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  return div;
}

function removeTyping() {
  document.getElementById("guideTyping")?.remove();
}

/* Основной запрос к AI */
async function askSafetyGuide(userText) {
  const { data, error } = await supabase.functions.invoke("safetyguide-ai", {
    body: {
      message: userText,
      history: guideHistory
    }
  });

  if (error) {
    console.error("AI error:", error);
    return "⚠️ Помилка: Ядро ChatGPT не працює, або в вас проблеми з підключенням. будь ласка, перезавантажте сторінку";
  }

  if (!data || !data.reply) {
    return "⚠️ Я не можу відповісти на ваш запит(";
  }

  return data.reply;
}

/* Отправка сообщения */
async function sendMessage() {
  const input = document.getElementById("chatInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  // показываем сообщение пользователя
  addGuideMessage(text, "user");

  // сохраняем в историю
  guideHistory.push({
    role: "user",
    content: text
  });

  input.value = "";

  // показываем "печатает..."
  showTyping();

  try {
    const reply = await askSafetyGuide(text);

    removeTyping();
    addGuideMessage(reply, "bot");

    guideHistory.push({
      role: "assistant",
      content: reply
    });

    // ограничим историю, чтобы не раздувалась
    if (guideHistory.length > 20) {
      guideHistory = guideHistory.slice(-20);
    }

  } catch (err) {
    console.error(err);
    removeTyping();
    addGuideMessage("⚠️ Сталася помилка при зверненні до SafetyGuide.", "bot");
  }
}

/* Быстрые кнопки */
function quickAsk(text) {
  const input = document.getElementById("chatInput");
  if (!input) return;

  input.value = text;
  sendMessage();
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
  

const uaBtn = document.getElementById("uaThemeBtn");

  if (uaBtn) {

    uaBtn.addEventListener("click", (e) => {

      e.preventDefault();

      toggleUAMode();

    });

  }

  // восстановление режима после перезагрузки

 // Восстанавливаем украинский режим
if (localStorage.getItem("ua_mode") === "on") {
    document.body.classList.add("ua-mode");
}

// Приветствие SafetyGuide
const chatMessages = document.getElementById("chatMessages");

if (chatMessages && !chatMessages.dataset.loaded) {
    addGuideMessage(
        "Привіт 👋 Я SafetyGuide.\nЯ можу допомогти із захистом каналу, перевіркою підозрілих дій, поясненням рейдів та базовими порадами безпеки.",
        "bot"
    );

    chatMessages.dataset.loaded = "true";
}

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
        raids:30
    },

    {
        avatar: "20260522123339.png",
        name: "X-17",
        tag: "null",
        danger:3,
        raids:20
    },

    {
        avatar: "20260522124356.png",
        name: "BlueLock",
        tag: "@Исаґи",
        danger:3,
        raids:10
    },
 
    {
        avatar: "20260513221929.png",
        name: "it s Nekore",
        tag: "@Tanya-🌙-lunar'n",
        danger:2,
        raids:40
    },
   
    {
        avatar: "20260602084641.png",
        name: "Глафіра",
        tag: "🖤Glafira🖤(Ді)",
        danger:2,
        raids:30
    },
   
    {
        avatar: "20260602085801.png",
        name: "Rora",
        tag: "null",
        danger:3,
        raids:40
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
        name:"КПЗТР",
        desc:"інформаційний канал",
        type:"infochanel",
        link:"https://invite.viber.com/?g2=AQBwQGdd%2BtHCe1Zl6d3z6cRni%2BYROwhvXhfUXQ9QRTJIrIhx13ZL57TsyulpfHaH",
        tags:"КПЗТР ветліс новини"
    },

    {
        name:"ІПЗ",
        desc:"інформаційний канал",
        type:"infochanel",
        link:"https://invite.viber.com/?g2=AQAB12OAeTXzu1ZIOMzGYNZWEvYUhNTnk%2FCw1%2B8bbzUzX5YMberLl86liKISlplR",
        tags:"ІПЗ новини"
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
        name:"БМПЗ",
        desc:"потужний інформаційний канал",
        type:"infochanel",
        link:"https://invite.viber.com/?g2=AQB32pvqWnc0PVaz9tf8DsWdRy7%2B7%2Fej7HbXOAnJNkyOokK8xHZOTUJvGstXgDYe",
        tags:"Рік пау новини"
    },

    {
        name:"solid owl",
        desc:"канал ліквідатора solid",
        type:"likvidator",
        link:"https://invite.viber.com/?g2=AQA2OhSNg5g3mFWibB1Pnh%2B9dDCoxrVStdDkuPZQzO02EVibQr3KH4lGfaGfGj%2BK",
        tags:"solid ліквідатор"
    },

    {
        name:"Імперія КРТ",
        desc:"імперія рейдерів",
        type:"box raider",
        link:"https://invite.viber.com/?g2=AQB0lSCwSDoowFZsEOeGWz49hSoAEuhQYnbf7GQpy8OKj6pJ4Wd7%2FzoSHY1miGHo",
        tags:"КРТ рейдери лохи"
    },

    {
        name:"7 1 1  Хаб",
        desc:"імперія рейдерів",
        type:"raider",
        link:"https://invite.viber.com/?g2=AQBL2Amx6XsJflZ1NJ3d9H65nETiGrONDYNmw1QpvLW%2FQBsDOEn1vHGkwLzSQFsK",
        tags:"hub"
    },

    {
        name:"ŁKS",
        desc:"імперія рейдерів",
        type:"raider",
        link:"https://invite.viber.com/?g2=AQBvd4NF0jcjHFYPPc%2F0wsnJF21WQWkMqo5KhRgCw63ZDWlTm6flKBNR%2Furhzi7%2B",
        tags:"LKS"
    },

    {
        name:"FGG",
        desc:"імперія рeйдерів",
        type:"raider",
        link:"https://invite.viber.com/?g2=AQArMI%2FOWHjg11Z%2BGPSO53uAk14GgsfgjQFa62Y2DSRClAh1IlKZFbhfLHk5gs63",
        tags:"FGG"
    },

    {
        name:"Теневой Легион",
        desc:"легіон рейдерів",
        type:"raider",
        link:"https://invite.viber.com/?g2=AQBcAzlsWjqam1ak2Opf0JlrcoUhWlEQoJ1MojcRSEy3OegtwSIhZFS3sd2iIwtu",
        tags:"legion"
    },

    {
        name:"П.Н.К",
        desc:"імперія рейдерів",
        type:"raider",
        link:"https://invite.viber.com/?g2=AQABAXA%2Bk8ePnFaWOFOuqxHUqFfegFSKfgRiE2Lt8pKfjQ1S316W06wkxN7Gdox4",
        tags:"PNK"
    },

    {
        name:"EnglishEmpire",
        desc:"імперія нейтральних рейдерів",
        type:"raider",
        link:"https://invite.viber.com/?g2=AQB5%2BkYD0zU2DVaAvzsz5OP%2FoEdNVEPzEf%2FwLIM%2B7IVJmEKoOPCBKuHZ9OYhNzi9",
        tags:"EI"
    },

    {
        name:"К.А.Р.А",
        desc:"канал рейдера",
        type:"raider",
        link:"https://invite.viber.com/?g2=AQBCo3RzhiH07FaO9nEkdLaFDmZ%2FGZVN8LYyoBzGYerHbvwqDhwr1Tby7DDhPKZl",
        tags:""
    },

    {
        name:"Dark Age Empire",
        desc:"імперія рейдерів",
        type:"raider",
        link:"https://invite.viber.com/?g2=AQAKqZ%2FyYZ0u91arcaMLOB%2F708QL0zeUxJJChmpKQocJHP4%2By6LN7s5aRq3DLHZ0",
        tags:""
    },

    {
        name:"Hacking Floof",
        desc:"канал найомних хакерів",
        type:"hacker",
        link:"https://invite.viber.com/?g2=AQBdsIkTJjqpKVY1opJ6q5kHDNSu8UZ4UE2ulZmRxqTb%2BR0An0KQDJWl9AHSSDN1",
        tags:""
    },

    {
        name:"XE",
        desc:"імперія рейдерів",
        type:"raider",
        link:"https://invite.viber.com/?g2=AQB7k7gzwdwsXFaC7uqpCbxJ9M4Aifp79yqiBt4B9tzHkf57I4bAMAb8ncs7j%2FyD",
        tags:""
    },

    {
        name:"Gjebi",
        desc:"канал рейдера",
        type:"raider",
        link:"https://invite.viber.com/?g2=AQBrdDrLlbm4hlZYx5HFHrLcdgiRO3JkSBGTs9wkNJkLLxlXFKPkzWW3v065jphQ",
        tags:""
    },

    
    {
        name:"BlueLock⛓️",
        desc:"Імперія рейдерів",
        type:"box raider",
        link:"https://invite.viber.com/?g2=AQAE371PllXwyFaH5Tns8ZvrRsWJ1z%2FcR9NmYR1B7OUwaOIAfNuRIXdqsCydepdH",
        tags:"рейдери bluelock"
    }
];






window.handleSendForum = function () {
  const input = document.querySelector("#forumInput");
  if (!input) return;

  sendForumMessage(input.value);
  input.value = "";
};




supabase

.channel("forum-realtime")

.on(
    "postgres_changes",
    {
        event: "*",
        schema: "public",
        table: "forum_messages"
    },
    () => {

        console.log(
            "Forum updated"
        );

        renderForum();

    }
)

.subscribe();


supabase

.channel("news-realtime")

.on(
    "postgres_changes",
    {
        event: "*",
        schema: "public",
        table: "news"
    },
    () => {

        console.log(
            "News updated"
        );

        renderNews();

    }
)

.subscribe();



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
window.openUserInfo = openUserInfo;
window.closeUserInfo = closeUserInfo;
window.changeSiteLanguage = changeSiteLanguage;

window.sendMessage = sendMessage;
window.quickAsk = quickAsk;