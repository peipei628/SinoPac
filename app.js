/* MMA Kids 互動 Demo（人生第一個帳戶｜永豐 MMA 延伸提案）
   提案概念展示，非永豐銀行正式產品；人物、金額、合作條件皆為示意。
   架構：單一 state → render() 重繪兩支手機；按鈕以 data-act 對應 ACT。 */
'use strict';

// ================= 資料 =================
const CH = [
  {id:'home',     n:'01', t:'首頁與日常錢包',     dual:true,  kid:'home',   par:'allowance',
   tip:'右邊媽媽可以調整零用錢，也可以關掉「固定給零用錢」，看小安首頁怎麼變。控制台可以觸發撥款和外婆的紅包。'},
  {id:'pay',      n:'02', t:'付款前：買下去 vs 存起來', dual:false, kid:'home', par:'overview',
   tip:'用控制台模擬店家掃碼。珍珠奶茶會出現「買下去／存起來」二選一；公車直接付款；遊戲點數被媽媽封鎖。'},
  {id:'dream',    n:'03', t:'夢想基金與家長配對', dual:true,  kid:'dream',  par:'match',
   tip:'媽媽自選配對比例與上限。小安「存一筆進來」後，媽媽的配對先圈存在媽媽帳戶。按控制台「快轉」再存一筆即可達標，接著「跳到週日結算」。'},
  {id:'pause',    n:'04', t:'家庭狀況改變：配對暫停', dual:true, kid:'dream', par:'match',
   tip:'在媽媽的「配對」分頁按「暫停配對」，選擇已保留的配對要照樣給，還是取消。小安端只會看到「暫停中」，不會看到原因。'},
  {id:'task',     n:'05', t:'任務與禮物',         dual:true,  kid:'task',   par:'task',
   tip:'媽媽出題、選禮物 → 小安按「我做完了」回報 → 媽媽按「小安已完成」→ 小安端馬上顯示禮物到手。任務不經過任何金流。'},
  {id:'school',   n:'06', t:'學堂',               dual:true,  kid:'school', par:'overview',
   tip:'在小安的學堂完成「防詐小測驗」最後一題，媽媽端會看到進度，但仍要媽媽在「任務」按完成才算數。'},
  {id:'approve',  n:'07', t:'需要爸媽同意的交易', dual:true,  kid:'dream',  par:'overview',
   tip:'在小安的夢想基金按「提前領出」，媽媽會收到同意請求。控制台也可以模擬大額消費和 24 小時未回覆。'},
  {id:'scam',     n:'08', t:'詐騙攔截與幫我看看', dual:true,  kid:'home',   par:'overview',
   tip:'控制台模擬人頭帳戶與假買家情境。小安也可以按「幫我看看」檢查可疑簡訊，或按「遇到可疑的事」直接求助。'},
  {id:'level',    n:'09', t:'家長查看程度',       dual:true,  kid:'home',   par:'safety',
   tip:'切換小安的年齡，媽媽端看得到的消費細節會跟著改變；防詐警示與求助不受影響。'},
  {id:'trust',    n:'10', t:'長期：信託與 18 歲', dual:true,  kid:'home',   par:'trust',
   tip:'媽媽在 DAWHO 看小安的成長信託。按控制台「跳到 18 歲」，小安從 MMA Kids 升級成 DAWHO。'},
  {id:'sum',      n:'終', t:'對永豐的價值',       summary:true}
];

const MERCHANTS = [
  {id:'tea',  store:'全家便利商店', name:'珍珠奶茶', amt:70,   cat:'飲食',     items:[['珍珠奶茶', 70]]},
  {id:'bus',  store:'台北捷運公車', name:'公車',     amt:15,   cat:'交通',     items:null},
  {id:'game', store:'遊戲平台',     name:'遊戲點數', amt:300,  cat:'遊戲儲值', items:null},
  {id:'shoe', store:'運動用品店',   name:'跑步鞋',   amt:1200, cat:'服飾',     items:[['跑步鞋', 1200]]}
];
const REMIND_CATS = ['飲食', '娛樂'];
const MAX_REMIND = 2;

const LESSONS = [
  {id:'budget', grp:'聰明消費', kind:'video', t:'什麼是預算？',
   body:'預算就是先決定錢要怎麼用，再開始花。錢一入帳，先想好這週要存多少、能花多少，就不會到週末才發現錢不夠。',
   q:'錢一入帳，最好先做什麼？', a:['先存一部分，再決定能花多少', '先把想買的東西買下來'], c:0,
   ok:'沒錯！先存再花，是理財的第一步。', no:'先花再存，常常會發現沒錢可存喔。'},
  {id:'needwant', grp:'聰明消費', kind:'video', t:'需要 vs 想要',
   body:'需要是生活必須的，例如車資、文具；想要是有了會開心、但沒有也沒關係的，例如飲料、漫畫。兩種都可以花，重點是知道自己在花哪一種。',
   q:'一杯手搖飲比較接近？', a:['需要', '想要'], c:1,
   ok:'答對了！偶爾買沒關係，知道它是「想要」就好。', no:'再想想：不喝手搖飲，生活會過不下去嗎？'},
  {id:'compare', grp:'聰明消費', kind:'quiz', t:'比價小技巧',
   body:'買東西前先比 2 家，不只看總價，也要看「單價」（例如每 100 毫升多少錢）、會不會真的用完、有沒有運費。便宜但用不完，其實不划算。',
   q:'同一款飲料，A 店 500 毫升 $35，B 店 700 毫升 $45，哪一家比較划算？', a:['A 店', 'B 店'], c:1,
   ok:'答對了！A 店每 100 毫升 $7，B 店約 $6.4。', no:'算算看每 100 毫升多少錢：A 店 $7，B 店約 $6.4。'},
  {id:'compound', grp:'存錢', kind:'video', t:'複利：讓錢自己長大',
   body:'利息加回本金，下一次一起生錢，就是複利。時間拉得越長，滾出來的錢越多，所以越早開始存越有利。',
   q:'複利效果最需要什麼？', a:['時間', '運氣'], c:0,
   ok:'沒錯！時間是複利最好的朋友。', no:'複利靠的不是運氣，而是長時間累積。'},
  {id:'fakebuyer', grp:'防詐', kind:'video', t:'假買家詐騙',
   body:'在網路上賣東西時，有些「買家」會說付款失敗、要你操作網銀「驗證帳戶」，或說轉錯帳要你再補一筆。真正的買家付款，從來不需要賣家操作網銀。遇到這種話術，先停下來，告訴爸媽。',
   q:'買家說要你操作網銀「驗證帳戶」才能收款，你該？', a:['停下來，告訴爸媽', '照做，才收得到錢'], c:0,
   ok:'做得好！這就是假買家詐騙的話術。', no:'真正的買家不會要你操作網銀，這是詐騙！'},
  {id:'mule', grp:'防詐', kind:'quiz', t:'借帳戶給別人？',
   body:'有人說「幫忙收錢就能賺錢」或「保證穩賺不賠」，幾乎都是詐騙。把帳戶借給別人用，自己可能變成詐騙共犯，帳戶也會被凍結。',
   q:'網友說借你的帳戶收款可以賺 500 元，你該？', a:['拒絕，並告訴爸媽', '答應，反正只是收錢'], c:0,
   ok:'做得好！這就是人頭帳戶詐騙。', no:'這是人頭帳戶詐騙，答應的話你會變成共犯！'},
  {id:'phish', grp:'防詐', kind:'quiz', t:'可疑連結與假客服',
   body:'收到「帳戶異常」「包裹地址有誤」「你中獎了」並附上連結的訊息，不要點連結，也不要輸入密碼或驗證碼。銀行不會用簡訊連結要你登入。不確定時，用 App 的「幫我看看」，或直接問爸媽。',
   q:'收到簡訊說「你的帳戶異常，請點連結重新驗證」，你該？', a:['不點連結，用「幫我看看」或告訴爸媽', '點進去看看是不是真的'], c:0,
   ok:'做得好！銀行不會用簡訊連結要你登入。', no:'這是釣魚連結，點進去可能被偷走帳號密碼！'}
];
const SCAM_QUIZ = [
  {q:'買家說要你先操作網銀「驗證帳戶」，才能付款給你。你應該？', a:['照著做，先驗證', '拒絕，這是假買家詐騙', '先轉 $1 試試看'], c:1, ok:'答對了！真正的買家不會要你操作網銀'},
  {q:'網友說借你的帳戶收款可以賺 500 元，你該？', a:['答應，反正只是收錢', '拒絕，並告訴爸媽', '問他要不要多給一點'], c:1, ok:'答對了！借帳戶給別人，你可能變成詐騙共犯'},
  {q:'收到簡訊說「你的帳戶異常，請點連結重新驗證」，你該？', a:['點進去看看是不是真的', '回覆簡訊問清楚', '不點連結，用「幫我看看」或告訴爸媽'], c:2, ok:'答對了！銀行不會用簡訊連結要你登入'}
];

const GIFTS = [
  {id:'movie', t:'週末看電影', icon:'film'},
  {id:'dinner', t:'選一次晚餐', icon:'food'},
  {id:'late', t:'晚睡半小時', icon:'moon'},
  {id:'trip', t:'決定去哪玩', icon:'map'}
];
const TASK_TPL = [
  {id:'antiScam', t:'防詐小達人',     cat:'學堂', ref:'看完「假買家詐騙」影片，並答對 3 題防詐題', link:'學堂進度自動同步'},
  {id:'noOver',   t:'這週不超支',     cat:'預算', ref:'本週消費 ≤ 每週預算',                       link:'錢包自動計算'},
  {id:'tagAll',   t:'每一筆都想一下', cat:'記帳', ref:'這週每筆消費都標記需要／想要',               link:'錢包自動計算'},
  {id:'compare',  t:'比價小幫手',     cat:'親子', ref:'買東西前比 2 家，告訴爸媽為什麼選這家',     link:'孩子文字回報'},
  {id:'twoLess',  t:'上完 2 堂學堂',  cat:'學堂', ref:'任選 2 堂課並答對小測驗',                   link:'學堂進度自動同步'}
];
const REPORTS = ['我比了全家和 7-11 的鮮奶，7-11 便宜 5 元，所以在 7-11 買。', '我這週都有照預算花錢！', '我看完影片也答完題目了。'];

const CHECK_SAMPLES = [
  '買家：我付款失敗了，請你操作網銀驗證帳戶，再補轉 $300 給我。',
  '【通知】您的帳戶異常，請點連結重新登入驗證：http://bit.ly/xxxx',
  '週末一起去看電影嗎？我請你喝飲料！'
];
const CHECK_RULES = [
  {k:['驗證帳戶', '操作網銀', '補轉'], t:'這很像「假買家詐騙」', d:'真正的買家不會要你操作網銀。'},
  {k:['借帳戶', '幫忙收款', '轉出去'], t:'這很像「人頭帳戶詐騙」', d:'借帳戶給別人，你可能變成詐騙共犯。'},
  {k:['保證獲利', '穩賺不賠', '高報酬'], t:'這很像「投資詐騙」', d:'保證賺錢的投資都是騙人的。'},
  {k:['帳戶異常', '點連結', '重新登入', '中獎', '包裹'], t:'這很像「釣魚連結」', d:'銀行不會用簡訊連結要你登入；不要點連結、不要輸入密碼或驗證碼。'}
];
const HELP_REASONS = ['有人要我轉錢／借帳戶', '我已經轉出去了', '收到奇怪的訊息', '其他'];
const LEVELS = {
  detail:  {t:'完整明細',     kid:'每筆消費和品項'},
  store:   {t:'店家與金額',   kid:'每筆的店家和金額'},
  monthly: {t:'每月分類總額', kid:'每月分類總額'}
};
const DEFAULT_LEVEL = age => age <= 12 ? 'detail' : age <= 15 ? 'store' : 'monthly';
const JAR_PRESETS = [[50, 40, 10], [30, 60, 10], [20, 70, 10]];
const BUDGETS = [180, 240, 300];
const NOTE_CHIPS = ['我們之後一起再開始', '這個月先暫停一下', '你存得很棒，繼續加油'];
const DECLINE_NOTE = {withdraw:'先存到目標再說喔！', big:'我們先一起討論看看', payee:'這個買家怪怪的，先不要轉'};

// ================= 狀態 =================
function initState() {
  return {
    ch:'home', kidView:'home', parView:'allowance', walletTab:'log',
    age:12, viewLevel:'detail',
    // 日常錢包
    balance:320, budget:240, weekSpent:60, jars:[50, 40, 10], shareJar:40,
    allowance:{on:true, amount:300, paused:false, pauseFor:''},
    family:['外婆', '外公'],
    tx:[
      {id:1, when:'今天', store:'7-ELEVEN', name:'早餐', amt:45, cat:'飲食', tag:'need', src:'carrier', items:[['鮪魚飯糰', 30], ['豆漿', 15]]},
      {id:2, when:'今天', store:'台北捷運公車', name:'公車', amt:15, cat:'交通', tag:'need', src:'card'},
      {id:3, when:'週一', store:'家長零用錢', name:'零用錢入帳', amt:300, cat:'收入', income:true},
      {id:4, when:'上週', store:'書局', name:'自動鉛筆', amt:35, cat:'文具', tag:null, src:'carrier', items:[['自動鉛筆', 35]]},
      {id:5, when:'上週', store:'夜市', name:'雞排', amt:70, cat:'飲食', tag:'want', src:'manual'}
    ],
    reviewPick:null, openTx:null,
    pay:null, remindToday:0,
    // 夢想基金與配對
    goal:{name:'球鞋基金', target:1800, saved:820},
    match:{ratio:1, weekCap:50, goalCap:500, sources:{saveAtPay:true, sundayLeft:true, gift:false},
           heldTotal:300, heldThisWeek:0, paused:false, keepHeld:true, note:''},
    goalReady:false, celebrate:null, goalsDone:0, saveCount:0,
    deposit:null, bigIn:null, pauseSheet:null,
    // 任務
    tasks:[
      {id:'antiScam', t:'防詐小達人',     gift:'movie',  status:'doing',   prog:{type:'quiz', done:2, total:3}},
      {id:'noOver',   t:'這週不超支',     gift:'dinner', status:'doing',   prog:{type:'days', done:5, total:7}},
      {id:'compare',  t:'比價小幫手',     gift:'trip',   status:'waiting', report:REPORTS[0], reportAt:'週四 18:20'},
      {id:'tagAll',   t:'每一筆都想一下', gift:'late',   status:'got'}
    ],
    gifts:['late'], giftShow:null, giftList:false, doneSheet:null, newTask:null, reportOf:null,
    // 學堂
    lessonsDone:['fakebuyer'], lesson:null, quizPick:null, scamQuiz:null,
    // 安全
    dayLimit:1500, threshold:1000, newPayee:true, blocked:{game:true, crypto:true, overseas:false},
    approvals:[], approvalReq:null,
    heldIncoming:null, scene:null, help:null, frozen:false,
    check:null,
    // 長期
    grown:false,
    // 同步
    feed:[], alerts:[], kidToast:'', parToast:''
  };
}
let state = initState();
const timers = {};
let seq = 100;

function set(patch) { Object.assign(state, patch); render(); }
function toast(who, msg) {
  const key = who === 'kid' ? 'kidToast' : 'parToast';
  state[key] = msg; render();
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => { state[key] = ''; render(); }, 3400);
}
// 動態類型：spend（受查看程度影響）| save | goal | lesson | task | approve | help | security | review
function addFeed(type, t, extra = {}) { state.feed = [{type, t, ...extra}].concat(state.feed).slice(0, 10); }
function addAlert(kind, title, text) { state.alerts = [{id:++seq, kind, title, text}].concat(state.alerts).slice(0, 4); }

// ================= 小工具 =================
const fmt = n => Number(n).toLocaleString('en-US');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const chOf = id => CH.find(c => c.id === id);
const giftOf = id => GIFTS.find(g => g.id === id);
const lessonOf = id => LESSONS.find(l => l.id === id);
const taskOf = id => state.tasks.find(t => t.id === id);
const itemsText = items => items.map(([n, a]) => `${n} $${a}`).join('＋');

function spendText(f) {
  if (state.viewLevel === 'store') return `小安在${f.store}付款 $${fmt(f.amt)}`;
  return `小安在${f.store}付款 $${fmt(f.amt)}${f.items ? `（${itemsText(f.items)}）` : ''}${f.tag ? `・${f.tag === 'need' ? '需要' : '想要'}` : ''}`;
}
const feedText = f => f.type === 'spend' ? spendText(f) : f.t;
const visibleFeed = () => state.feed.filter(f => state.viewLevel !== 'monthly' || f.type !== 'spend');

const I = {
  home:'<path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  gift:'<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  wallet:'<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  shieldAlert:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8v5M12 16v.5"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  check:'<path d="M5 12l5 5L20 7"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  next:'<path d="M9 5l7 7-7 7"/>',
  play:'<path d="M7 4l13 8-13 8z"/>',
  phone:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  film:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  food:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/>',
  heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  pause:'<path d="M9 5v14M15 5v14"/>',
  coins:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  trend:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  phoneCall:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'
};
const ic = (n, st = '', cls = 'ico') => `<svg class="${cls}" style="${st}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
const tagHtml = t => t.income ? '' : t.tag === 'need' ? '<span class="tag need">需要</span>'
  : t.tag === 'want' ? '<span class="tag want">想要</span>' : '<span class="tag none">未標記</span>';
const srcHtml = t => t.src === 'carrier' ? '<span class="src">載具</span>' : t.src === 'manual' ? '<span class="src m">手動</span>' : '';
const QR = `<svg width="150" height="150" viewBox="0 0 17 17" aria-hidden="true" shape-rendering="crispEdges"><rect width="17" height="17" fill="#fff"/><g fill="#1F2A37"><rect x="1" y="1" width="5" height="5"/><rect x="11" y="1" width="5" height="5"/><rect x="1" y="11" width="5" height="5"/><rect x="7" y="1" width="1" height="2"/><rect x="9" y="2" width="1" height="3"/><rect x="7" y="4" width="2" height="1"/><rect x="7" y="7" width="3" height="1"/><rect x="11" y="7" width="1" height="3"/><rect x="13" y="8" width="3" height="1"/><rect x="1" y="7" width="2" height="1"/><rect x="4" y="8" width="2" height="2"/><rect x="8" y="9" width="2" height="2"/><rect x="7" y="12" width="1" height="4"/><rect x="9" y="13" width="2" height="1"/><rect x="12" y="11" width="2" height="2"/><rect x="14" y="13" width="2" height="3"/><rect x="11" y="14" width="2" height="2"/></g><g fill="#fff"><rect x="2" y="2" width="3" height="3"/><rect x="12" y="2" width="3" height="3"/><rect x="2" y="12" width="3" height="3"/></g><g fill="#1F2A37"><rect x="3" y="3" width="1" height="1"/><rect x="13" y="3" width="1" height="1"/><rect x="3" y="13" width="1" height="1"/></g></svg>`;
const BARCODE = `<svg width="200" height="36" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">${[2,1,1,3,1,2,2,1,3,1,1,2,1,1,2,3,1,2,1,1,2,2,1,3,1,1,2,1,2,1,1,3,2,1,1,2,1,2,3,1].reduce((acc, w, i) => { const x = acc.x; acc.x += w + 1; if (i % 2 === 0) acc.s += `<rect x="${x}" y="0" width="${w}" height="20" fill="#1F2A37"/>`; return acc; }, {x:0, s:''}).s}</svg>`;

// ================= 計算 =================
function heldAll() { return state.match.heldTotal + state.match.heldThisWeek; }
function pct(saved, held) { return Math.min(100, Math.round((saved + held) / state.goal.target * 100)); }
// 依家長設定計算這筆存款可以配對多少（孩子端不顯示公式）
function matchFor(amount, srcKey) {
  const m = state.match;
  if (m.paused || !srcKey || !m.sources[srcKey]) return 0;
  return Math.max(0, Math.floor(Math.min(amount * m.ratio, m.weekCap - m.heldThisWeek, m.goalCap - heldAll())));
}
function derive() {
  const s = state, held = heldAll();
  const progress = pct(s.goal.saved, held);
  const remain = Math.max(0, s.goal.target - s.goal.saved - held);
  const weekLeft = Math.max(0, s.budget - s.weekSpent);
  const weeklyChildSave = Math.round(s.allowance.on ? s.allowance.amount * s.jars[0] / 100 : 0);
  const weeklyMatchEstimate = s.match.paused ? 0 : Math.min(
    Math.floor(weeklyChildSave * s.match.ratio),
    s.match.weekCap,
    Math.max(0, s.match.goalCap - held)
  );
  const perWeek = weeklyChildSave + weeklyMatchEstimate;
  const spends = s.tx.filter(t => !t.income);
  const need = spends.filter(t => t.tag === 'need').reduce((a, t) => a + t.amt, 0);
  const want = spends.filter(t => t.tag === 'want').reduce((a, t) => a + t.amt, 0);
  const tagged = need + want;
  const weekTx = s.tx.filter(t => t.when !== '上週');
  return {
    held, progress, remain, weekLeft, perWeek,
    eta: remain === 0 ? '已達成！' : perWeek ? `照現在的速度，約 ${Math.ceil(remain / perWeek)} 週後達成` : '持續存錢，就會越來越近',
    needPct: tagged ? Math.round(need / tagged * 100) : 0,
    untagged: spends.filter(t => !t.tag).length,
    weekIn: weekTx.filter(t => t.income).reduce((a, t) => a + t.amt, 0),
    weekOut: weekTx.filter(t => !t.income).reduce((a, t) => a + t.amt, 0),
    pending: s.approvals.filter(a => a.status === 'pending')
  };
}
function checkGoal() {
  const s = state;
  if (!s.goalReady && s.goal.saved + heldAll() >= s.goal.target) {
    s.goalReady = true;
    toast('kid', `目標達成！${heldAll() ? `媽媽的 $${fmt(heldAll())} 會在這週日 20:00 撥進你的帳戶` : '可以去買你的夢想了'}`);
    toast('par', `小安的「${s.goal.name}」達標了！週日 20:00 結算`);
    addFeed('goal', `小安的「${s.goal.name}」達標，週日結算後撥入`);
  }
}

// ================= 左側與主舞台 =================
function viewSide() {
  const c = chOf(state.ch);
  const nav = CH.map(x => {
    const badge = x.summary ? '' : `<span class="badge ${x.dual ? 'duo' : ''}">${x.dual ? '親子' : '孩子'}</span>`;
    return `<button class="chap ${x.id === state.ch ? 'on' : ''}" data-act="goCh" data-arg="${x.id}"><span class="num">${x.n}</span><span>${x.t}</span>${badge}</button>`;
  }).join('');
  return `<aside class="side">
    <div class="col" style="gap:4px">
      <div class="brand"><div class="logo">MMA</div><div class="brand-name">MMA Kids</div></div>
      <div class="slogan">人生第一個帳戶｜永豐 MMA 兒童帳戶的延伸<br>存起來，媽媽陪你存；完成任務，爸媽送你禮物</div>
    </div>
    <nav class="chaps" aria-label="示範章節">${nav}</nav>
    ${c.summary ? '' : `<div class="tipbox"><div class="t">試試看</div><div class="b">${c.tip}</div></div>`}
    <div class="side-foot">
      <button class="btn b-line" style="min-height:40px" data-act="reset">重新開始示範</button>
      <div class="xs" style="line-height:1.5">提案概念展示，非永豐銀行正式產品；人物、金額、合作條件皆為示意。← → 切換章節。</div>
    </div>
  </aside>`;
}

function viewMain(d) {
  const c = chOf(state.ch), idx = CH.indexOf(c);
  const mode = c.summary ? '' : `<span class="mode ${c.dual ? 'duo' : 'solo'}">${c.dual ? '親子互動・雙手機' : '孩子端・單手機'}</span>`;
  const kidLbl = `<div class="lbl-phone">小安的手機（${state.grown ? 18 : state.age} 歲）・MMA Kids App</div>`;
  const stage = c.summary ? viewSummary() : `<div class="stagerow">
      <div class="phonecol">${kidLbl}${viewKid(d)}</div>
      ${c.dual
        ? `<div class="phonecol fade"><div class="lbl-phone">媽媽的手機・DAWHO App › 親子</div>${viewParent(d)}</div>${viewConsole()}`
        : `<div class="rightcol">${viewSync()}${viewConsole()}</div>`}
    </div>`;
  return `<main class="main">
    <div class="mhead">
      <button class="navbtn" data-act="prevCh" ${idx === 0 ? 'disabled' : ''}>${ic('back')}上一章</button>
      <div class="mtitle"><span class="t">${c.n === '終' ? '終章　' : c.n + '　'}${c.t}</span>${mode}</div>
      <button class="navbtn" data-act="nextCh" ${idx === CH.length - 1 ? 'disabled' : ''}>下一章${ic('next')}</button>
    </div>
    ${stage}
  </main>`;
}

function viewSync() {
  const list = visibleFeed();
  const note = state.viewLevel === 'monthly' ? '單筆消費不會通知媽媽。'
    : state.viewLevel === 'store' ? '消費只通知店家與金額。' : '消費含品項與需要／想要標記。';
  return `<div class="sync fade">
    <div class="hd">${ic('phone', 'color:#2B5584')}媽媽的 DAWHO App 同步收到</div>
    ${list.length ? list.slice(0, 5).map(f => `<div class="it">${esc(feedText(f))}</div>`).join('')
      : '<div class="empty">小安在這一章的操作，會依查看程度同步到媽媽的 DAWHO。</div>'}
    <div class="xs" style="line-height:1.6">目前媽媽可以看到：${LEVELS[state.viewLevel].kid}。${note}防詐警示與求助永遠通知。</div>
  </div>`;
}

// ================= 示範控制台（非產品畫面） =================
function viewConsole() {
  const s = state;
  const b = (act, label, arg = '', dis = false) => `<button class="cbtn" data-act="${act}" ${arg !== '' ? `data-arg="${arg}"` : ''} ${dis ? 'disabled' : ''}>${ic('play', 'width:12px;height:12px')}${label}</button>`;
  let body;
  switch (s.ch) {
    case 'home': body = b('autoAllowance', '到了撥款時間（週一 07:00）', '', !s.allowance.on || s.allowance.paused) + b('grandma', '外婆轉入紅包 $2,000'); break;
    case 'pay': body = `<span class="chd">店家掃碼（小安先打開付款碼）</span>
      ${b('scan', '全家：珍珠奶茶 $70', 'tea')}${b('scan', '公車 $15', 'bus')}${b('scan', '遊戲點數 $300', 'game')}`; break;
    case 'dream': case 'pause': body = b('ffGoal', '快轉：存到只差一點') + b('sunday', '跳到週日 20:00 結算'); break;
    case 'approve': body = b('grandma', '外婆轉入紅包 $2,000') + b('scan', '運動用品店：跑步鞋 $1,200', 'shoe')
      + b('expire', '模擬 24 小時未回覆', '', !state.approvals.some(a => a.status === 'pending')); break;
    case 'scam': body = `<span class="chd">① 人頭帳戶</span>
      ${b('simHeld', '陌生人轉入 $5,000', '', !!s.heldIncoming)}
      ${b('simMule', '網友要小安把錢轉出', '', !s.heldIncoming)}
      <span class="chd">② 假買家</span>${b('simFakeBuyer', '買家要求補轉 $300')}`; break;
    case 'level': body = `<span class="chd">切換小安年齡</span><div class="cchips">${[12, 14, 16].map(a => `<button class="cchip ${s.age === a ? 'on' : ''}" data-act="setAge" data-arg="${a}">${a} 歲</button>`).join('')}</div>`; break;
    case 'trust': body = s.grown ? b('ungrow', '回到 12 歲') : b('grow', '跳到 18 歲生日'); break;
    default: body = '<span class="cempty">本章直接操作手機即可。</span>';
  }
  return `<div class="console"><div class="chd0">示範控制台・非產品畫面</div>${body}</div>`;
}

// ================= 終章 =================
function viewSummary() {
  const col = (bg, color, icon, t, dsc) => `<div class="sumcol" style="background:${bg}">${ic(icon, `width:34px;height:34px;color:${color}`)}<span class="st" style="color:${color}">${t}</span><span class="sd">${dsc}</span></div>`;
  return `<div class="summary fade">
    <span class="sk">MMA KIDS 對永豐的價值</span>
    <span class="stt">用「教孩子理財」，替永豐吸引下一代客戶</span>
    <div class="sumgrid">
      ${col('var(--greenBg)', 'var(--greenT)', 'wallet', '活化 MMA 兒童帳戶', '從「爸媽幫孩子存錢」的帳戶，變成孩子天天打開、自己管理零用錢的理財工具。')}
      ${col('var(--blueBg)', 'var(--blue)', 'heart', '提高父母黏著', '零用錢、配對、任務、信託都在 DAWHO 的親子分頁完成，父母打開 DAWHO 的理由變多了。')}
      ${col('var(--purpleBg)', 'var(--purple)', 'cap', '培養未來的大戶', '孩子 18 歲從 MMA Kids 升級成 DAWHO，夢想紀錄與學堂成果一起帶走，成為永豐的正式客戶。')}
    </div>
    <span class="sfoot">配對與禮物都由家長決定，銀行不靠利率或回饋讓利；防詐機制同時守護孩子與永豐的帳戶安全。</span>
  </div>`;
}

// ================= 孩子端 =================
const kidTitles = {home:'嗨，小安', pay:'付款', dream:'夢想', task:'我的任務', school:'學堂', wallet:'日常錢包'};
function viewKid(d) {
  const s = state;
  if (s.grown) return `<div class="ph"><div class="scr">${kidGrown()}</div></div>`;
  const v = s.kidView;
  const views = {home:kidHome, pay:kidPay, dream:kidDream, task:kidTask, school:kidSchool, wallet:kidWallet};
  const tab = (id, label, icon) => `<button class="tab ${v === id || (id === 'home' && v === 'pay') ? 'on' : ''}" data-act="kv" data-arg="${id}">${ic(icon)}${label}</button>`;
  return `<div class="ph"><div class="scr">
    <div class="top"><div class="row" style="gap:10px">
        ${v === 'pay' ? `<button class="iconbtn" aria-label="回首頁" data-act="kv" data-arg="home">${ic('back')}</button>` : ''}
        <div class="col"><span class="app-n">MMA KIDS｜週五</span><span class="ttl">${kidTitles[v]}</span></div></div>
      <div class="avatar">安</div></div>
    <div class="body" data-sk="kid-${v}">${views[v](d)}</div>
    <div class="tabs">${tab('home', '首頁', 'home')}${tab('dream', '夢想', 'star')}${tab('task', '任務', 'gift')}${tab('school', '學堂', 'book')}${tab('wallet', '錢包', 'wallet')}</div>
    ${kidOverlays(d)}
    ${s.kidToast ? `<div class="toast" role="status">${ic('bell')}<span>${esc(s.kidToast)}</span></div>` : ''}
  </div></div>`;
}

function dreamBar(d, extra = null, thin = false) {
  const s = state, t = s.goal.target, paused = s.match.paused;
  const w = v => Math.max(0, Math.min(100, v / t * 100)).toFixed(1);
  let segs = `<div class="seg blue" style="width:${w(s.goal.saved)}%"></div><div class="seg ${paused ? 'gray' : 'pink'}" style="width:${w(d.held)}%"></div>`;
  if (extra) segs = `<div class="seg blue" style="width:${w(s.goal.saved)}%"></div><div class="seg blueL" style="width:${w(extra.me)}%"></div><div class="seg ${paused ? 'gray' : 'pink'}" style="width:${w(d.held)}%"></div><div class="seg pinkL" style="width:${w(extra.mom)}%"></div>`;
  return `<div class="track ${thin ? 'thin' : ''}">${segs}</div>`;
}

function kidHome(d) {
  const s = state, al = s.allowance.on;
  const firstTask = s.tasks.find(t => t.status === 'doing');
  const pending = d.pending.find(a => a.who === 'kid');
  return `
    ${s.frozen ? `<div class="banner warn">${ic('lock')}<span>轉帳暫停中・日常付款不受影響・媽媽已收到你的求助</span></div>` : ''}
    ${s.heldIncoming ? `<div class="banner info">${ic('clock')}<span>有一筆陌生轉入 $${fmt(s.heldIncoming.amt)} 待爸媽確認，確認前不能使用</span></div>` : ''}
    ${pending ? `<div class="banner gray">${ic('clock')}<span>你送出的請求等爸媽回覆中</span></div>` : ''}
    ${s.bigIn ? `<div class="card c-blue fade">
        <span class="h3">收到 $${fmt(s.bigIn.amt)}！</span>
        <span class="sm">${s.bigIn.from}給的紅包。要不要存一部分到${s.goal.name}？</span>
        <div class="grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">
          <button class="btn b-blue" style="min-height:40px;font-size:13px" data-act="bigSave" data-arg="500">存 $500</button>
          <button class="btn b-line" style="min-height:40px;font-size:13px" data-act="openDeposit" data-arg="gift">自己決定</button>
          <button class="btn b-gray" style="min-height:40px;font-size:13px" data-act="bigSkip">先不要</button>
        </div></div>` : ''}
    <button class="card c-green" data-act="kv" data-arg="wallet">
      ${al ? `<span class="sm t-green" style="font-weight:700">本週還能花</span>
        <span class="big t-green">$${fmt(d.weekLeft)}</span>
        <div class="track thin"><div class="seg green" style="width:${(s.budget > 0 ? d.weekLeft / s.budget * 100 : 0).toFixed(1)}%"></div></div>
        <span class="xs">每週預算 $${fmt(s.budget)}・可以用的錢 $${fmt(s.balance)}</span>`
      : `<span class="sm t-green" style="font-weight:700">可以用的錢</span><span class="big t-green">$${fmt(s.balance)}</span>`}
    </button>
    <button class="btn b-green" data-act="openPay">${ic('phone')}出示付款碼</button>
    <div class="jars">
      <button class="jar save" data-act="kv" data-arg="dream"><span class="jn t-blue">儲蓄 ${s.jars[0]}%</span><span class="jp t-blue">${d.progress}%</span><span class="jd">存進${s.goal.name}</span></button>
      <button class="jar spend" data-act="kv" data-arg="wallet"><span class="jn t-green">消費 ${s.jars[1]}%</span><span class="jp t-green">$${fmt(s.balance)}</span><span class="jd">可以用的錢</span></button>
      <button class="jar share" data-act="shareJarInfo" aria-label="查看分享罐，預留分享金 ${fmt(s.shareJar)} 元">
        <span class="jn t-pink">分享 ${s.jars[2]}%</span>
        <span class="jp t-pink">$${fmt(s.shareJar)}</span>
        <span class="jd">預留分享金・點擊查看用途</span>
      </button>
    </div>
    <button class="card c-blue" data-act="kv" data-arg="dream">
      <div class="row sb" style="width:100%"><span class="h3 t-blue">${ic('star', 'width:16px;height:16px;display:inline;vertical-align:-3px')} ${s.goal.name}</span><span class="h3 t-blue">${d.progress}%</span></div>
      ${dreamBar(d, null, true)}
      ${s.match.paused ? '<span class="xs">媽媽的配對暫停中</span>' : `<span class="xs">我存的 $${fmt(s.goal.saved)}・媽媽保留的 $${fmt(d.held)}</span>`}
    </button>
    ${firstTask ? `<button class="card c-yellow" data-act="kv" data-arg="task">
      <div class="row sb" style="width:100%"><span class="h3 t-yellow">${firstTask.t}</span><span class="tag task">進行中</span></div>
      <span class="sm">${progText(firstTask)}</span>
      <span class="giftline">${ic(giftOf(firstTask.gift).icon)}${giftOf(firstTask.gift).t}</span>
    </button>` : ''}
    <div class="safety">
      <button class="sbtn" data-act="askHelp">${ic('shieldAlert')}遇到可疑的事</button>
      <button class="sbtn" data-act="openCheck">${ic('search')}幫我看看</button>
    </div>
    <div class="seeline">${ic('eye')}媽媽可以看到：${LEVELS[s.viewLevel].kid}</div>`;
}

function progText(t) {
  if (!t.prog) return t.status === 'waiting' ? '已回報' : '';
  return t.prog.type === 'quiz' ? `答對 ${t.prog.done} / ${t.prog.total} 題` : `第 ${t.prog.done}/${t.prog.total} 天`;
}

// ---------- 付款 ----------
function kidPay(d) {
  const s = state, p = s.pay;
  if (!p || p.step === 'code') return `
    <div class="card center" style="padding:20px 16px">
      <span class="sm">請店員掃描，或靠近感應</span>
      <div class="qr">${QR}</div>
      <div class="col" style="align-items:center;gap:4px;border-top:1px dashed #CDD5E0;padding-top:10px;width:100%">${BARCODE}<span class="xs">手機條碼載具 /MK8+K2Q・自動記帳</span></div>
    </div>
    <span class="xs" style="text-align:center">示範：點選下方店家，模擬店員掃碼</span>
    ${MERCHANTS.filter(m => m.id !== 'shoe').map(m => `<button class="btn b-line" data-act="scan" data-arg="${m.id}">${m.store}：${m.name} $${fmt(m.amt)}</button>`).join('')}`;
  const m = p.m;
  if (p.step === 'blocked') return `
    <div class="card center fade" style="padding:24px 16px">${ic('shield', 'width:40px;height:40px;color:var(--gray)')}
      <span class="h3" style="font-size:17px">這個類別目前不能付款</span>
      <span class="sm" style="line-height:1.6">「${m.cat}」已被爸媽設為封鎖類別。想買的話，可以先跟爸媽討論看看。</span></div>
    <button class="btn b-line" data-act="kv" data-arg="home">知道了</button>`;
  if (p.step === 'approval') return `
    <div class="card fade"><span class="sm">${m.store}</span><span class="mid">${m.name} $${fmt(m.amt)}</span></div>
    <div class="card c-gray"><span class="h3">這筆需要爸媽同意</span><span class="sm" style="line-height:1.6">單筆 $${fmt(s.threshold)} 以上的消費，要先請爸媽在 DAWHO 同意。</span>
      <span class="xs">想說的話（選填）</span>
      <div class="chips">${['球鞋有特價，想先買便宜的', '我已經存了很久'].map((r, i) => `<button class="chip s ${p.reason === i ? 'on' : ''}" data-act="payReason" data-arg="${i}">${r}</button>`).join('')}</div></div>
    <button class="btn b-green" data-act="sendApproval" data-arg="big">送出給爸媽</button>
    <button class="btn b-line" data-act="kv" data-arg="home">取消</button>`;
  if (p.step === 'choice') {
    const me = m.amt, mom = matchFor(me, 'saveAtPay');
    const newP = pct(s.goal.saved + me, d.held + mom);
    return `
      <div class="card"><span class="sm">${m.store}</span><span class="mid">${m.name} $${m.amt}</span></div>
      <span class="h3" style="font-size:17px">這 $${m.amt} 你想怎麼用？</span>
      <button class="paycard a" data-act="payBuy">
        <div class="row sb"><span class="big2">買下去</span><span class="sm" style="font-weight:700">${s.goal.name.replace('基金', '')} ${d.progress}%</span></div>
        <span class="xs">夢想進度不變</span></button>
      <button class="paycard b" data-act="paySave">
        <div class="row sb"><span class="big2 t-blue">存起來</span><span class="h3 t-blue">${d.progress}% → ${newP}%</span></div>
        ${dreamBar(d, {me, mom}, true)}
        <span class="xs">我 +$${me}${mom ? `　<span class="t-pink" style="font-weight:700">媽媽配對 +$${mom}</span>` : s.match.paused ? '　媽媽的配對暫停中' : ''}</span>
        <span class="h3 t-blue" style="font-size:13px">夢想進度 +${newP - d.progress}%</span></button>
      <span class="xs" style="text-align:center">不會擋你付款，選一個就好</span>`;
  }
  if (p.step === 'confirm') return `
    <div class="card center fade" style="padding:22px 16px"><span class="sm">${m.store}</span><span class="mid">${m.name}</span><span class="big">$${fmt(m.amt)}</span></div>
    <button class="btn b-green" data-act="payBuy">確認付款</button>`;
  if (p.step === 'tag') return `
    <div class="card center fade" style="padding:20px 16px">${ic('check', 'width:40px;height:40px;color:var(--greenT)')}
      <span class="h3" style="font-size:18px">付款成功 $${fmt(m.amt)}</span><span class="sm">已用載具自動記帳</span></div>
    <div class="card"><span class="h3">這筆是「需要」還是「想要」？</span>
      <span class="xs">需要：生活必須的；想要：有了會開心，但沒有也沒關係</span>
      <div class="grid2" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:4px">
        <button class="btn b-blue" style="min-height:58px;font-size:17px" data-act="tagPay" data-arg="need">需要</button>
        <button class="btn b-yellow" style="min-height:58px;font-size:17px" data-act="tagPay" data-arg="want">想要</button></div></div>`;
  return `
    <div class="card fade"><span class="h3">記好了！</span><span class="sm" style="line-height:1.6">本週還能花 $${fmt(d.weekLeft)}。</span></div>
    <button class="btn b-green" data-act="kv" data-arg="home">回首頁</button>
    <button class="btn b-line" data-act="kv" data-arg="wallet">看我的錢包</button>`;
}

// ---------- 夢想 ----------
function kidDream(d) {
  const s = state, paused = s.match.paused;
  const pendingW = d.pending.find(a => a.type === 'withdraw');
  return `
    <div class="card" style="padding:18px 16px;gap:10px">
      <div class="row sb"><span class="h3" style="font-size:18px">${s.goal.name}</span><span class="sm">目標 $${fmt(s.goal.target)}</span></div>
      <span class="big t-blue">${d.progress}%</span>
      ${dreamBar(d)}
      <div class="legend">
        <div class="lr"><span class="row"><span class="dotc" style="background:var(--blue)"></span>我存的</span><b class="t-blue">$${fmt(s.goal.saved)}</b></div>
        <div class="lr"><span class="row"><span class="dotc" style="background:${paused ? '#AEB4BE' : 'var(--pink)'}"></span>媽媽保留的${paused ? '（暫停中）' : ''}</span><b class="${paused ? 't-gray' : 't-pink'}">$${fmt(d.held)}</b></div>
        <div class="lr"><span class="row"><span class="dotc" style="background:#D3D8DF"></span>還差</span><b class="t-gray">$${fmt(d.remain)}</b></div>
      </div>
    </div>
    ${s.goalReady ? `<div class="banner info">${ic('star')}<span>目標達成！${d.held ? `媽媽的 $${fmt(d.held)} 會在這週日 20:00 撥進你的帳戶` : '週日結算後就能使用'}</span></div>`
      : `<div class="card c-green" style="padding:10px 14px"><span class="sm t-green" style="font-weight:700">${d.eta}</span></div>`}
    ${paused ? `<div class="banner gray">${ic('pause')}<span>媽媽的配對暫停中${s.match.note ? `<br><span style="font-weight:500">媽媽：${esc(s.match.note)}</span>` : ''}</span></div>`
      : `<span class="xs" style="text-align:center">${ic('clock', 'width:13px;height:13px;display:inline;vertical-align:-2px')} 這週日 20:00 結算媽媽的配對</span>`}
    <button class="btn b-blue" data-act="openDeposit" data-arg="sundayLeft" ${s.goalReady ? 'disabled style="opacity:.5"' : ''}>存一筆進來</button>
    ${pendingW ? `<div class="banner gray">${ic('clock')}<span>提前領出 $${pendingW.amt} 等爸媽回覆中</span><button class="link" style="margin-left:auto" data-act="cancelApproval" data-arg="${pendingW.id}">取消</button></div>`
      : s.goalReady ? '' : '<button class="link" data-act="askWithdraw">提前領出</button>'}`;
}

// ---------- 任務 ----------
function kidTask() {
  const s = state;
  const label = {doing:'<span class="tag task">進行中</span>', waiting:'<span class="tag wait">等爸媽確認</span>', got:'<span class="tag got">禮物到手</span>', expired:'<span class="tag none">未完成</span>'};
  const card = t => {
    const g = giftOf(t.gift);
    let prog = '';
    if (t.prog && t.prog.type === 'days') prog = `<div class="pdots">${Array.from({length:t.prog.total}, (_, i) => `<span class="${i < t.prog.done ? 'on' : ''}"></span>`).join('')}</div><span class="xs">第 ${t.prog.done}/${t.prog.total} 天</span>`;
    else if (t.prog) prog = `<span class="xs">答對 ${t.prog.done} / ${t.prog.total} 題</span>`;
    if (t.status === 'waiting') prog = '<span class="xs">已回報</span>';
    if (t.status === 'got') prog = '<span class="xs">爸媽已確認</span>';
    return `<div class="taskcard ${t.status === 'got' ? 'got' : ''}">
      <div class="row sb"><span class="h3">${t.t}</span>${label[t.status]}</div>
      ${prog}
      <span class="giftline">${ic(g.icon)}${g.t}</span>
      ${t.id === 'antiScam' && t.status === 'doing' ? '<button class="link" style="align-self:flex-start;padding:0" data-act="startQuiz">去學堂做題目</button>' : ''}
    </div>`;
  };
  return `
    <span class="sm">完成任務，爸媽送你禮物</span>
    ${s.tasks.map(card).join('')}
    <button class="btn b-dash" data-act="openDone" ${s.tasks.some(t => t.status === 'doing') ? '' : 'disabled style="opacity:.5"'}>${ic('bell')}我做完了，通知爸媽</button>
    <button class="link" data-act="openGifts">查看我的禮物（${s.gifts.length}）</button>`;
}

// ---------- 學堂 ----------
function kidSchool() {
  const s = state;
  if (s.scamQuiz) return kidQuiz();
  if (s.lesson) {
    const l = lessonOf(s.lesson), ans = s.quizPick !== null, right = ans && s.quizPick === l.c;
    return `
      <button class="ghost" data-act="closeLesson">${ic('back')}所有課程</button>
      ${l.kind === 'video' ? `<div class="thumb"><div class="playc">${ic('play', 'width:26px;height:26px;fill:#fff;stroke:none')}</div><span class="cap">${l.t}・約 3 分鐘</span></div>` : ''}
      <div class="card fade"><span class="xs">${l.grp}・約 3 分鐘</span><span class="h3" style="font-size:18px">${l.t}</span><span style="font-size:14px;line-height:1.75">${l.body}</span></div>
      <div class="card"><span class="h3">小測驗</span><span style="font-size:14px;line-height:1.6">${l.q}</span>
        ${l.a.map((a, i) => `<button class="opt ${!ans ? '' : i === l.c ? 'right' : i === s.quizPick ? 'wrong' : ''}" data-act="answer" data-arg="${i}">${a}</button>`).join('')}
        ${ans ? `<div class="fb ${right ? 'ok' : 'no'} fade">${right ? l.ok : l.no}</div>` : ''}</div>`;
  }
  const at = taskOf('antiScam');
  const row = l => `<button class="lesson" data-act="openLesson" data-arg="${l.id}">
      <span class="li">${ic(l.kind === 'video' ? 'play' : 'edit')}</span>
      <span class="col" style="flex:1"><span style="font-size:14px;font-weight:700">${l.t}</span><span class="xs">${l.kind === 'video' ? '影片' : '圖文＋題目'}・3 分鐘</span></span>
      ${s.lessonsDone.includes(l.id) ? '<span class="tag ok">已完成</span>' : ''}</button>`;
  const grp = g => `<span class="h3" style="margin-top:4px">${g}</span>${LESSONS.filter(l => l.grp === g).map(row).join('')}`;
  return `
    <span class="sm">一堂約 3 分鐘，看完做一題小測驗</span>
    ${grp('聰明消費')}${grp('存錢')}
    <span class="h3" style="margin-top:4px">防詐</span>
    ${at ? `<button class="lesson" data-act="startQuiz" style="border-color:#E3B86A"><span class="li" style="background:var(--yellowBg);color:var(--yellowT)">${ic('shield')}</span>
      <span class="col" style="flex:1"><span style="font-size:14px;font-weight:700">防詐小測驗</span><span class="xs">3 題・${at.prog ? `已答對 ${at.prog.done} 題` : ''}</span></span><span class="tag task">任務</span></button>` : ''}
    ${LESSONS.filter(l => l.grp === '防詐').map(row).join('')}
    <div class="hotline">${ic('phoneCall')}<span class="sm">遇到可疑的事，打 <b>165</b> 反詐騙專線</span></div>`;
}
function kidQuiz() {
  const s = state, q = s.scamQuiz, item = SCAM_QUIZ[q.idx], ans = q.pick !== null, right = ans && q.pick === item.c;
  return `
    <button class="ghost" data-act="closeQuiz">${ic('back')}學堂</button>
    <div class="row sb"><span class="h3" style="font-size:17px">防詐小測驗</span><span class="sm">第 ${q.idx + 1}／3 題</span></div>
    <div class="qbar"><div style="width:${((q.idx + (right ? 1 : 0)) / 3 * 100).toFixed(0)}%"></div></div>
    <div class="card"><span style="font-size:15px;line-height:1.6;font-weight:700">${item.q}</span>
      ${item.a.map((a, i) => `<button class="opt ${!ans ? '' : i === item.c ? 'right' : i === q.pick ? 'wrong' : ''}" data-act="quizAnswer" data-arg="${i}"><span class="k">${'ABC'[i]}</span>${a}</button>`).join('')}</div>
    ${ans ? (right ? `<div class="fb ok fade"><b>${item.ok}</b><br>遇到可疑的事，打 165 反詐騙專線</div>
        ${q.idx < 2 ? '<button class="btn b-green" data-act="quizNext">下一題</button>' : '<button class="btn b-green" data-act="closeQuiz">完成，回到學堂</button>'}`
      : '<div class="fb no fade">再想想看，選另一個答案試試。</div>') : ''}`;
}

// ---------- 錢包 ----------
function kidWallet(d) {
  const s = state, tab = s.walletTab;
  const head = `<div class="chips" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr))">
    <button class="chip ${tab === 'log' ? 'on' : ''}" data-act="walletTab" data-arg="log">收支紀錄</button>
    <button class="chip ${tab === 'set' ? 'on' : ''}" data-act="walletTab" data-arg="set">預算設定</button></div>`;
  if (tab === 'set') return head + `
    <div class="card"><span class="h3">三罐子分配</span><span class="xs">零用錢入帳時自動分配</span>
      <div class="col" style="gap:6px;margin-top:4px">${JAR_PRESETS.map((p, i) => `<button class="opt ${String(s.jars) === String(p) ? 'right' : ''}" data-act="setJars" data-arg="${i}">儲蓄 ${p[0]}%・消費 ${p[1]}%・分享 ${p[2]}%</button>`).join('')}</div>
      <span class="xs" style="line-height:1.6">儲蓄罐的錢會直接存進「${s.goal.name}」；分享罐只是預留金額，不會自動捐款，也不強制捐給任何機構；可以和爸媽討論如何使用。</span></div>
    <div class="card"><span class="h3">每週預算</span><span class="xs">一週打算花多少，超過前會提醒你</span>
      <div class="chips">${BUDGETS.map(b => `<button class="chip ${s.budget === b ? 'on' : ''}" data-act="setBudget" data-arg="${b}">$${b}</button>`).join('')}</div></div>`;
  const rows = ['今天', '週一', '上週'].map(w => {
    const list = s.tx.filter(t => t.when === w);
    if (!list.length) return '';
    return `<div class="grouphd">${w}</div>` + list.map(t => {
      const open = s.openTx === t.id;
      return `<button class="lrbtn" data-act="openTx" data-arg="${t.id}"><div class="lr" style="border:0">
          <span class="col"><span>${t.income ? t.name : t.store}</span><span class="xs">${t.income ? '收入' : t.cat} ${srcHtml(t)}</span></span>
          <span class="row">${tagHtml(t)}<b class="${t.income ? 't-green' : ''}">${t.income ? '+' : '-'}$${fmt(t.amt)}</b></span></div></button>
        ${open && t.items ? `<div class="items">${t.items.map(([n, a]) => `<div class="row sb"><span>${n}</span><span>$${a}</span></div>`).join('')}</div>` : ''}
        ${open && !t.income ? `<div class="chips" style="margin:2px 0 8px"><button class="chip s ${t.tag === 'need' ? 'on' : ''}" data-act="retag" data-arg="${t.id}|need">需要</button><button class="chip s ${t.tag === 'want' ? 'on' : ''}" data-act="retag" data-arg="${t.id}|want">想要</button></div>` : ''}`;
    }).join('');
  }).join('');
  const rv = s.tx.find(t => t.id === s.reviewPick);
  return head + `
    <div class="stat3">
      <div class="statbox" style="background:var(--greenBg)"><span class="xs">本週收入</span><b class="t-green">+$${fmt(d.weekIn)}</b></div>
      <div class="statbox" style="background:var(--pinkBg)"><span class="xs">本週支出</span><b class="t-pink">-$${fmt(d.weekOut)}</b></div>
    </div>
    ${d.untagged ? `<div class="banner gray">${ic('edit')}<span>你還有 ${d.untagged} 筆消費沒標記，點一下就能補標</span></div>` : ''}
    <div class="card" style="gap:0">${rows}
      <button class="ghost" style="margin-top:6px" data-act="manualAdd">${ic('plus')}手動補記（例：夜市雞排 $70）</button></div>
    <div class="card"><span class="h3">需要 vs 想要</span>
      <div class="track"><div class="seg blue" style="width:${d.needPct}%"></div><div class="seg" style="width:${100 - d.needPct}%;background:#E9A93A"></div></div>
      <div class="row sb"><span class="tag need">需要 ${d.needPct}%</span><span class="tag want">想要 ${100 - d.needPct}%</span></div></div>
    <div class="card c-blue"><span class="h3">每週 30 秒回顧</span><span class="sm">這週最值得的一筆花費是？</span>
      ${rv ? `<div class="fb ok fade">你選了「${rv.store}・${rv.name}」，已分享給媽媽。</div>`
        : `<div class="chips">${s.tx.filter(t => !t.income && t.when !== '上週').map(t => `<button class="chip s" data-act="review" data-arg="${t.id}">${t.name} $${t.amt}</button>`).join('')}</div>`}</div>`;
}

// ---------- 18 歲 ----------
function kidGrown() {
  return `<div class="body" style="justify-content:center;padding:28px 20px">
    <div class="pop" style="box-shadow:0 10px 30px rgba(31,42,55,.08)">
      <div class="ring gray">${ic('cap')}</div>
      <span style="font-size:22px;font-weight:800">18 歲生日快樂！</span>
      <span class="sm">從 MMA Kids 畢業，升級成 DAWHO</span>
      <div class="col" style="gap:10px;align-items:flex-start;width:100%;margin:6px 0">
        ${['夢想紀錄、學堂成果一起帶走', `信託 18 歲給付 $${fmt(50000)} 撥入你的 DAWHO`, '從現在起，自己管理自己的錢'].map(t => `<div class="row" style="font-size:14px;text-align:left">${ic('check', 'color:var(--greenT)')}${t}</div>`).join('')}
      </div>
      <button class="btn b-gray" style="background:var(--gray);color:#fff;border:0" data-act="applyDawho">線上申請 DAWHO</button>
      <span class="xs">信託商品條件需向永豐確認</span>
    </div></div>`;
}

// ---------- 孩子端疊層 ----------
function kidOverlays(d) {
  const s = state;
  if (s.celebrate) return `<div class="overlay mid"><div class="pop">
      <div class="ring blue">${ic('check')}</div>
      <span style="font-size:22px;font-weight:800">夢想達成！</span>
      <span class="h3">${s.celebrate.name} $${fmt(s.celebrate.target)}</span>
      <div class="track" style="margin:4px 0"><div class="seg blue" style="width:${(s.celebrate.me / s.celebrate.target * 100).toFixed(1)}%"></div><div class="seg pink" style="width:${(s.celebrate.mom / s.celebrate.target * 100).toFixed(1)}%"></div></div>
      <span class="sm">我存的 $${fmt(s.celebrate.me)}＋媽媽的配對 $${fmt(s.celebrate.mom)}</span>
      ${s.celebrate.mom ? `<div class="card c-pink" style="padding:10px 14px"><span class="sm t-pink" style="font-weight:700">媽媽的 $${fmt(s.celebrate.mom)} 已撥入你的帳戶</span></div>` : ''}
      <button class="btn b-blue" data-act="nextGoal">設定下一個夢想</button></div></div>`;
  if (s.giftShow) { const t = taskOf(s.giftShow), g = giftOf(t.gift);
    return `<div class="overlay mid"><div class="pop">
      <div class="ring yellow">${ic('star')}</div>
      <span style="font-size:20px;font-weight:800">爸媽確認你完成了！</span><span class="sm">${t.t}</span>
      <div class="card c-yellow" style="align-items:center"><span class="xs t-yellow" style="font-weight:700">禮物到手</span><span class="giftline" style="font-size:16px">${ic(g.icon)}${g.t}</span></div>
      <span class="xs">已收進「我的禮物」</span>
      <button class="btn b-yellow" data-act="closeGift">查看我的禮物</button></div></div>`; }
  if (s.giftList) return `<div class="overlay"><div class="sheet">
      <div class="row sb"><span class="h3" style="font-size:18px">我的禮物</span><button class="iconbtn" aria-label="關閉" data-act="closeGifts">${ic('x')}</button></div>
      <div class="grid2" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">${s.gifts.map(id => { const g = giftOf(id); return `<div class="card c-yellow center">${ic(g.icon, 'width:28px;height:28px;color:var(--yellowT)')}<span class="h3 t-yellow">${g.t}</span></div>`; }).join('')}</div></div></div>`;
  if (s.deposit) { const dp = s.deposit, amt = dp.amt, srcMap = {sundayLeft:'零用錢剩下的', gift:'紅包', family:'親友給的', other:'其他'};
    const mk = dp.src === 'family' ? 'gift' : dp.src === 'other' ? null : dp.src;
    const mom = matchFor(amt, mk);
    return `<div class="overlay"><div class="sheet">
      <div class="row sb"><span class="h3" style="font-size:18px">存一筆進${s.goal.name}</span><button class="iconbtn" aria-label="關閉" data-act="closeDeposit">${ic('x')}</button></div>
      <span class="xs">從可以用的錢轉入（目前 $${fmt(s.balance)}）</span>
      <div class="chips">${[50, 100, 200, 500].map(a => `<button class="chip ${amt === a ? 'on' : ''}" data-act="depAmt" data-arg="${a}" ${a > s.balance ? 'disabled style="opacity:.4"' : ''}>$${a}</button>`).join('')}</div>
      <span class="xs">這筆錢是？（選填）</span>
      <div class="chips">${Object.entries(srcMap).map(([k, v]) => `<button class="chip s ${dp.src === k ? 'on' : ''}" data-act="depSrc" data-arg="${k}">${v}</button>`).join('')}</div>
      <div class="card c-blue" style="padding:10px 14px"><span class="sm t-blue" style="font-weight:700">進度 ${d.progress}% → ${pct(s.goal.saved + amt, d.held + mom)}%${mom ? `　媽媽陪你存 +$${mom}` : ''}</span></div>
      <button class="btn b-blue" data-act="doDeposit" ${amt > s.balance ? 'disabled style="opacity:.5"' : ''}>存進去</button></div></div>`; }
  if (s.doneSheet) return `<div class="overlay"><div class="sheet">
      <div class="row sb"><span class="h3" style="font-size:18px">我做完了</span><button class="iconbtn" aria-label="關閉" data-act="closeDone">${ic('x')}</button></div>
      <span class="xs">選一個任務</span>
      <div class="col" style="gap:6px">${s.tasks.filter(t => t.status === 'doing').map(t => `<button class="opt ${s.doneSheet.task === t.id ? 'right' : ''}" data-act="doneTask" data-arg="${t.id}">${t.t}</button>`).join('')}</div>
      <span class="xs">想跟爸媽說的話（選填）</span>
      <div class="col" style="gap:6px">${REPORTS.map((r, i) => `<button class="opt ${s.doneSheet.report === i ? 'right' : ''}" style="font-size:13px" data-act="doneReport" data-arg="${i}">${r}</button>`).join('')}</div>
      <button class="btn b-yellow" data-act="sendDone" ${s.doneSheet.task ? '' : 'disabled style="opacity:.5"'}>通知爸媽</button></div></div>`;
  if (s.approvalReq) return `<div class="overlay"><div class="sheet">
      <span class="h3" style="font-size:18px">這筆需要爸媽同意</span>
      <div class="card c-gray"><span class="sm">提前領出${s.goal.name}</span><span class="mid">$300</span><span class="xs">從夢想基金領回可以用的錢</span></div>
      <span class="xs">想說的話（選填）</span>
      <div class="chips">${['球鞋有特價，想先買便宜的', '想先買文具'].map((r, i) => `<button class="chip s ${s.approvalReq.reason === i ? 'on' : ''}" data-act="wReason" data-arg="${i}">${r}</button>`).join('')}</div>
      <button class="btn b-green" data-act="sendApproval" data-arg="withdraw">送出給爸媽</button>
      <button class="btn b-line" data-act="closeApproval">取消</button></div></div>`;
  if (s.help) return `<div class="overlay"><div class="sheet">
      <div class="row sb"><span class="h3" style="font-size:18px">遇到可疑的事</span><button class="iconbtn" aria-label="關閉" data-act="closeHelp">${ic('x')}</button></div>
      ${s.help.sent ? `<div class="fb ok">已通知媽媽，轉帳先暫停。別擔心，說出來是對的。</div>
          <div class="hotline">${ic('phoneCall')}<span class="sm">165 反詐騙諮詢專線</span></div>
          <span class="xs">刷卡和手機付款照常可以用；媽媽或永豐客服可以解除暫停。</span>
          <button class="btn b-line" data-act="closeHelp">好</button>`
        : `<span class="xs">發生什麼事？（選填）</span>
          <div class="col" style="gap:6px">${HELP_REASONS.map((r, i) => `<button class="opt ${s.help.reason === i ? 'right' : ''}" data-act="helpReason" data-arg="${i}">${r}</button>`).join('')}</div>
          <button class="btn b-green" data-act="sendHelp">通知媽媽</button>`}
    </div></div>`;
  if (s.check) { const c = s.check;
    return `<div class="overlay"><div class="sheet">
      <div class="row sb"><span class="h3" style="font-size:18px">幫我看看</span><button class="iconbtn" aria-label="關閉" data-act="closeCheck">${ic('x')}</button></div>
      <span class="xs">把奇怪的訊息或連結貼上來，我幫你檢查</span>
      <label class="xs" for="check-input" style="font-weight:700">訊息內容</label>
      <textarea id="check-input" class="textarea" placeholder="貼上訊息或網址">${esc(c.text)}</textarea>
      <div class="chips">${CHECK_SAMPLES.map((x, i) => `<button class="chip s" data-act="checkSample" data-arg="${i}">範例 ${i + 1}</button>`).join('')}</div>
      <button class="btn b-green" data-act="doCheck">${ic('search')}檢查</button>
      ${c.result ? `<div class="card ${c.result.hit ? 'c-yellow' : 'c-gray'} fade"><span class="h3">${c.result.t}</span><span class="sm" style="line-height:1.6">${c.result.d}</span></div>
        <div class="grid2" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">
          <button class="btn b-line" data-act="checkTell">告訴爸媽</button><button class="btn b-line" data-act="call165">打 165</button></div>
        <span class="xs" style="line-height:1.5">銀行看不到你的 LINE、IG 訊息，這裡只檢查你主動貼上的內容。</span>` : ''}
    </div></div>`; }
  if (s.scene) return kidScene();
  return '';
}

function kidScene() {
  const sc = state.scene;
  if (sc.type === 'mule') {
    if (sc.step === 0) return `<div class="overlay mid"><div class="pop left">
      <span class="xs" style="font-weight:700">網友傳來訊息</span>
      <div class="msg">我轉錯了，那 5,000 是我的，幫我轉到這個帳戶：012-XXXX-XXXX，謝謝！</div>
      <button class="btn b-line" data-act="muleDo">照做，轉出 $5,000</button>
      <button class="btn b-green" data-act="muleIgnore">不理他</button></div></div>`;
    return `<div class="overlay mid"><div class="pop left">
      <div class="row">${ic('shieldAlert', 'width:26px;height:26px;color:#8A4B00')}<span class="h3" style="font-size:17px">這筆錢還沒入帳，不能轉出</span></div>
      <span style="font-size:14px;line-height:1.7">有人轉錢給你又要你轉出去，這是常見的人頭帳戶詐騙。媽媽也已經收到通知。</span>
      <button class="btn b-green" data-act="sceneHelp">遇到可疑的事</button>
      <button class="btn b-line" data-act="closeScene">我知道了</button></div></div>`;
  }
  return `<div class="overlay mid"><div class="pop left">
    <span class="xs" style="font-weight:700">你在二手平台賣演唱會周邊，買家說：</span>
    <div class="msg">我付款失敗了，請你操作網銀驗證帳戶，再補轉 $300 給我。</div>
    <div class="banner warn">${ic('shieldAlert')}<span>轉帳前提醒：真正的買家不會要你操作網銀，這是假買家詐騙。</span></div>
    <span class="xs">已同步通知媽媽</span>
    <button class="btn b-green" data-act="closeScene">取消轉帳</button>
    <button class="btn b-line" data-act="fakeContinue">我確定要繼續</button></div></div>`;
}

// ================= 家長端 =================
const parTitles = {overview:'小安的 MMA Kids', allowance:'零用錢', match:'配對設定', task:'任務', safety:'安全', trust:'小安成長信託', report:'任務回報', newTask:'新增任務'};
function viewParent(d) {
  const s = state, v = s.parView;
  const views = {overview:parOverview, allowance:parAllowance, match:parMatch, task:parTask, safety:parSafety, trust:parTrust, report:parReport, newTask:parNewTask};
  const tabOf = {trust:'overview', report:'task', newTask:'task'};
  const cur = tabOf[v] || v;
  const tab = (id, label, icon) => `<button class="tab ${cur === id ? 'on' : ''}" data-act="pv" data-arg="${id}">${ic(icon)}${label}</button>`;
  const backable = ['trust', 'report', 'newTask'].includes(v);
  return `<div class="ph"><div class="scr">
    <div class="top"><div class="row" style="gap:10px">
      ${backable ? `<button class="iconbtn" aria-label="返回" data-act="pv" data-arg="${cur}">${ic('back')}</button>` : ''}
      <div class="col"><span class="app-n p">DAWHO › 親子${v === 'trust' ? ' › 信託' : ''}</span><span class="ttl ${v === 'trust' ? 't-purple' : ''}">${parTitles[v]}</span></div></div>
      <div class="avatar p">媽</div></div>
    <div class="body" data-sk="par-${v}">${views[v](d)}</div>
    <div class="tabs p">${tab('overview', '總覽', 'home')}${tab('allowance', '零用錢', 'coins')}${tab('match', '配對', 'heart')}${tab('task', '任務', 'gift')}${tab('safety', '安全', 'shield')}</div>
    ${parOverlays()}
    ${s.parToast ? `<div class="toast" role="status">${ic('bell')}<span>${esc(s.parToast)}</span></div>` : ''}
  </div></div>`;
}

function todoList(d) {
  const s = state, out = [];
  s.alerts.forEach(a => out.push(`<div class="todo red"><span class="ttl2" style="color:#8E2A33">${ic('shieldAlert', 'width:16px;height:16px;display:inline;vertical-align:-3px')} ${a.title}</span><span class="sm" style="line-height:1.6;color:#3F4753">${a.text}</span>
    ${a.kind === 'help' ? `<div class="grid2" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px"><button class="btn b-pink" style="min-height:40px;font-size:13px" data-act="callKid">打電話給小安</button><button class="btn b-line" style="min-height:40px;font-size:13px" data-act="ackAlert" data-arg="${a.id}">聯繫永豐客服</button></div>${s.frozen ? '<button class="link" style="align-self:flex-start;padding:0" data-act="unfreeze">解除轉帳暫停</button>' : ''}`
      : `<button class="btn b-line" style="min-height:40px;font-size:13px" data-act="ackAlert" data-arg="${a.id}">我知道了</button>`}</div>`));
  if (s.heldIncoming) out.push(`<div class="todo blue"><span class="ttl2">陌生帳戶轉入 $${fmt(s.heldIncoming.amt)}，已先保留</span><span class="sm">對方不在家人名單內。確認是認識的人才會入帳。</span>
    <div class="grid2" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px"><button class="btn b-line" style="min-height:40px;font-size:13px" data-act="heldOk">確認是認識的人</button><button class="btn b-pink" style="min-height:40px;font-size:13px" data-act="heldReturn">退回並通報</button></div></div>`);
  d.pending.forEach(a => out.push(`<div class="todo blue"><span class="ttl2">${a.title}</span>${a.reason ? `<span class="sm">小安：「${a.reason}」</span>` : ''}<span class="xs">24 小時未回覆會自動取消</span>
    <div class="grid2" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px"><button class="btn b-green" style="min-height:40px;font-size:13px" data-act="approveYes" data-arg="${a.id}">同意</button><button class="btn b-line" style="min-height:40px;font-size:13px" data-act="approveNo" data-arg="${a.id}">不同意</button></div></div>`));
  s.tasks.filter(t => t.status === 'waiting').forEach(t => out.push(`<div class="todo yellow"><div class="row sb"><span class="ttl2">${t.t}：小安已回報</span><button class="btn b-yellow" style="min-height:36px;font-size:13px;width:auto" data-act="openReport" data-arg="${t.id}">查看</button></div></div>`));
  return out;
}

function spendBlock() {
  const s = state, spends = s.tx.filter(t => !t.income);
  if (s.viewLevel === 'monthly') {
    const cat = {}; spends.forEach(t => { cat[t.cat] = (cat[t.cat] || 0) + t.amt; });
    return `<div class="card" style="gap:0"><div class="row sb"><span class="h3">本月分類總額</span><span class="xs">每月分類總額</span></div>
      ${Object.entries(cat).map(([k, v]) => `<div class="lr"><span>${k}</span><b>$${fmt(v)}</b></div>`).join('')}
      <span class="xs" style="margin-top:6px">單筆消費不顯示；有異常時才通知</span></div>`;
  }
  return `<div class="card" style="gap:0"><div class="row sb"><span class="h3">最近消費</span><span class="xs">${LEVELS[s.viewLevel].t}</span></div>
    ${spends.slice(0, 4).map(t => `<div class="lr"><span class="col"><span>${t.store}</span>${s.viewLevel === 'detail' && t.items ? `<span class="xs">${itemsText(t.items)}</span>` : `<span class="xs">${t.when}</span>`}</span>
      <span class="row">${s.viewLevel === 'detail' ? tagHtml(t) : ''}<b>-$${fmt(t.amt)}</b></span></div>`).join('')}</div>`;
}

function parOverview(d) {
  const s = state, todo = todoList(d);
  const rv = s.tx.find(t => t.id === s.reviewPick);
  const noOver = taskOf('noOver');
  return `
    ${todo.length ? `<div class="need-box"><span class="h3">需要你處理（${todo.length}）</span>${todo.join('')}</div>` : ''}
    <div class="card"><span class="h3">小安這週</span>
      <div class="stat3">
        <div class="statbox" style="background:var(--greenBg)"><span class="xs">可以用的錢</span><b class="t-green">$${fmt(s.balance)}</b></div>
        <div class="statbox" style="background:var(--blueBg)"><span class="xs">${s.goal.name}</span><b class="t-blue">${d.progress}%</b></div>
        <div class="statbox" style="background:var(--pinkBg)"><span class="xs">選「存起來」</span><b class="t-pink">${s.saveCount} 次</b></div>
        <div class="statbox" style="background:var(--pinkBg)"><span class="xs">本週配對保留</span><b class="t-pink">$${fmt(s.match.heldThisWeek)}</b></div>
      </div>
      ${noOver && noOver.status === 'doing' ? `<span class="sm t-yellow" style="font-weight:700">這週不超支 第 ${noOver.prog.done}/${noOver.prog.total} 天</span>` : ''}</div>
    ${rv ? `<div class="card c-blue fade"><span class="xs t-blue" style="font-weight:700">小安的每週回顧</span><span class="sm">這週最值得的一筆：「${rv.store}・${rv.name}」</span></div>` : ''}
    ${spendBlock()}
    <button class="card c-purple" data-act="pv" data-arg="trust"><div class="row sb" style="width:100%"><span class="h3 t-purple">小安成長信託</span><span class="h3 t-purple">$${fmt(300000)} ›</span></div><span class="xs">每月投入 $3,000</span></button>
    <span class="xs" style="text-align:center">有防詐警示時，永遠排在最上面</span>`;
}

function parAllowance() {
  const s = state, a = s.allowance;
  return `
    <div class="card"><div class="row sb"><span class="h3">固定給零用錢</span><button class="sw ${a.on ? 'on' : ''}" aria-pressed="${a.on}" aria-label="固定給零用錢" data-act="tAllowance"><span class="knob"></span></button></div>
      ${a.on ? `<span class="xs">每週金額</span>
        <div class="chips">${[200, 300, 500].map(v => `<button class="chip ${a.amount === v ? 'on' : ''}" data-act="setAllow" data-arg="${v}">$${v}</button>`).join('')}</div>
        <div class="lr"><span class="sm">轉帳時間</span><span class="sm">每週一 07:00</span></div>
        <div class="lr"><span class="sm">扣款帳戶</span><span class="sm">媽媽的 DAWHO</span></div>
        ${a.paused ? `<div class="banner gray">${ic('pause')}<span>零用錢暫停中（${a.pauseFor}）</span></div><button class="btn b-line" data-act="resumeAllow">恢復零用錢</button>`
          : `<button class="btn b-green" data-act="payNow">提前撥款</button>
             <span class="xs">暫停零用錢</span><div class="chips">${['2 週', '1 個月', '直到我恢復'].map(p => `<button class="chip s" data-act="pauseAllow" data-arg="${p}">${p}</button>`).join('')}</div>`}`
        : '<span class="sm" style="line-height:1.6">不自動撥款。小安仍可用紅包、存款使用夢想基金，首頁不顯示「本週還能花」。</span>'}</div>
    <div class="card"><span class="h3">家人名單</span><span class="xs" style="line-height:1.6">名單內的轉入（例如外婆的紅包）直接入帳，不會被「陌生入帳先保留」擋下。</span>
      ${s.family.map(f => `<div class="lr"><span class="row">${ic('users', 'width:16px;height:16px;color:var(--muted)')}${f}</span><span class="tag ok">已加入</span></div>`).join('')}</div>`;
}

function parMatch(d) {
  const s = state, m = s.match;
  const ratios = [[1, '1:1'], [0.5, '1:0.5'], [2, '1:2']];
  const ck = (k, label) => `<button class="ckrow" data-act="tSource" data-arg="${k}"><span class="check ${m.sources[k] ? 'on' : ''}">${m.sources[k] ? ic('check') : ''}</span>${label}</button>`;
  return `
    <span class="sm">夢想：${s.goal.name} $${fmt(s.goal.target)}</span>
    ${m.paused ? `<div class="banner gray">${ic('pause')}<span>配對暫停中・已保留的 $${fmt(heldAll())} ${heldAll() ? '達標時照樣給小安' : '已解除'}</span></div>` : ''}
    <div class="card"><span class="h3">配對比例（你決定）</span>
      <div class="seg3">${ratios.map(([r, l]) => `<button class="chip ${m.ratio === r ? 'on' : ''}" data-act="setRatio" data-arg="${r}">${l}</button>`).join('')}<button class="chip" data-act="customRatio">自訂</button></div>
      <span class="sm t-pink" style="font-weight:700">小安存 $1，你配 $${m.ratio}</span>
      <span class="xs">儲存後，比例在這個夢想期間不變</span></div>
    <div class="card" style="gap:0">
      <div class="lr"><span>每週配對上限</span><b>$${m.weekCap}</b></div>
      <div class="lr"><span>這個夢想的配對上限</span><b>$${m.goalCap}</b></div>
      <div class="lr"><span>本週已保留</span><b class="t-pink">$${m.heldThisWeek}${m.heldThisWeek >= m.weekCap ? '（已達上限）' : ''}</b></div>
      <div class="lr"><span>累計保留（圈存在你的帳戶）</span><b class="t-pink">$${fmt(heldAll())}</b></div></div>
    <div class="card"><span class="h3">哪些存款可以配對</span>
      ${ck('saveAtPay', '付款前選「存起來」')}${ck('sundayLeft', '把零用錢剩下的存進夢想')}${ck('gift', '紅包、親友贈與')}</div>
    <button class="btn b-pink" data-act="saveMatch">儲存配對規則</button>
    ${m.paused ? '<button class="btn b-line" data-act="resumeMatch">恢復配對</button>' : '<button class="btn b-line" data-act="openPause">暫停配對</button>'}
    <span class="xs" style="line-height:1.6">配對款先圈存在你自己的帳戶，達標當週結算後一次撥入小安的 MMA；上限到了就不再配對。</span>`;
}

function parTask() {
  const s = state, cnt = st => s.tasks.filter(t => t.status === st).length;
  const label = {doing:'進行中', waiting:'等確認', got:'禮物到手', expired:'未完成'};
  return `
    <div class="row" style="gap:6px"><span class="tag task">進行中 ${cnt('doing')}</span><span class="tag wait">等確認 ${cnt('waiting')}</span><span class="tag got">禮物到手 ${cnt('got')}</span></div>
    <button class="btn b-yellow" data-act="pv" data-arg="newTask">${ic('plus')}新增任務</button>
    ${s.tasks.map(t => { const g = giftOf(t.gift);
      return `<div class="taskcard ${t.status === 'got' ? 'got' : ''}"><div class="row sb"><span class="h3">${t.t}</span><span class="xs" style="font-weight:700">${label[t.status]}</span></div>
        <span class="giftline">${ic(g.icon)}${g.t}</span>
        ${t.prog && t.status === 'doing' ? `<span class="xs">參考進度：${progText(t)}</span>` : ''}
        ${t.status === 'waiting' ? `<button class="btn b-yellow" style="min-height:38px;font-size:13px" data-act="openReport" data-arg="${t.id}">查看回報</button>`
          : t.status === 'doing' ? `<button class="btn b-line" style="min-height:38px;font-size:13px" data-act="openReport" data-arg="${t.id}">查看進度</button>` : ''}</div>`; }).join('')}`;
}

function parReport() {
  const s = state, t = taskOf(s.reportOf); if (!t) return '';
  const g = giftOf(t.gift), tpl = TASK_TPL.find(x => x.id === t.id);
  const ref = t.id === 'antiScam' ? `已看完影片、答對 ${t.prog ? t.prog.done : 3}/3 題` : t.prog ? progText(t) : '';
  return `
    <span class="sm">${t.t} → ${g.t}</span>
    ${t.report ? `<div class="card c-gray"><span class="xs" style="font-weight:700">小安的回報</span><span style="font-size:14px;line-height:1.6">${esc(t.report)}</span><span class="xs">${t.reportAt}</span></div>` : ''}
    ${ref ? `<div class="card"><span class="xs" style="font-weight:700">系統參考資料（只供參考）</span><span class="sm">${ref}</span>${tpl ? `<span class="xs">完成參考：${tpl.ref}</span>` : ''}</div>` : ''}
    ${t.status === 'got' ? '<div class="fb ok">已確認完成，禮物已送給小安。</div>' : `
    <button class="btn b-yellow" data-act="taskDone" data-arg="${t.id}">小安已完成</button>
    <button class="btn b-line" data-act="taskNotYet" data-arg="${t.id}">還沒完成</button>
    <span class="xs" style="text-align:center">按下完成，小安會立刻收到禮物</span>`}`;
}

function parNewTask() {
  const s = state, n = s.newTask || {};
  const tpl = TASK_TPL.find(t => t.id === n.tpl);
  return `
    <span class="h3">選一個任務</span>
    <div class="col" style="gap:6px">${TASK_TPL.map(t => `<button class="opt ${n.tpl === t.id ? 'right' : ''}" data-act="ntTpl" data-arg="${t.id}"><span style="flex:1">${t.t}</span><span class="xs">${t.cat}</span></button>`).join('')}</div>
    ${tpl ? `<span class="xs" style="line-height:1.5">完成參考：${tpl.ref}（${tpl.link}）</span>` : ''}
    <span class="h3">選禮物</span>
    <div class="grid2" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px">${GIFTS.map(g => `<button class="opt ${n.gift === g.id ? 'right' : ''}" style="font-size:13px" data-act="ntGift" data-arg="${g.id}">${ic(g.icon, 'width:16px;height:16px')}${g.t}</button>`).join('')}</div>
    <span class="h3">期限</span>
    <div class="chips">${['本週日', '2 週', '1 個月'].map(p => `<button class="chip s ${n.due === p ? 'on' : ''}" data-act="ntDue" data-arg="${p}">${p}</button>`).join('')}</div>
    ${tpl && n.gift ? `<div class="card c-yellow"><span class="sm t-yellow" style="font-weight:700">預覽：${tpl.t} → ${giftOf(n.gift).t}</span></div>` : ''}
    <button class="btn b-yellow" data-act="ntSend" ${tpl && n.gift ? '' : 'disabled style="opacity:.5"'}>送給小安</button>
    <span class="xs" style="line-height:1.5">範本不含家事、成績與存錢金額類任務；需要可選「自訂」（正式版）。</span>`;
}

function parSafety() {
  const s = state;
  const sw = (on, act, label, fixed = false) => fixed ? `<span class="sw fixed" aria-label="已開啟，無法關閉"><span class="knob"></span></span>`
    : `<button class="sw ${on ? 'on' : ''}" aria-pressed="${on}" aria-label="${label}" data-act="${act}"><span class="knob"></span></button>`;
  return `
    <div class="card"><span class="h3">查看程度</span><span class="xs">依小安 ${s.age} 歲自動預設，也可以手動調整</span>
      <div class="col" style="gap:6px">${Object.entries(LEVELS).map(([k, l]) => `<button class="opt ${s.viewLevel === k ? 'right' : ''}" data-act="setLevel" data-arg="${k}">${l.t}${DEFAULT_LEVEL(s.age) === k ? '<span class="xs" style="margin-left:auto">預設</span>' : ''}</button>`).join('')}</div>
      <span class="xs" style="line-height:1.5">小安的首頁會顯示「媽媽可以看到：${LEVELS[s.viewLevel].kid}」。</span></div>
    <div class="card" style="gap:0"><span class="h3" style="margin-bottom:4px">消費限額與需要我同意</span>
      <div class="lr"><span>單日消費上限</span><b>$${fmt(s.dayLimit)}</b></div>
      <div class="lr"><span>單筆超過要我同意</span><b>$${fmt(s.threshold)}</b></div>
      <div class="lr"><span>新增收款人</span>${sw(s.newPayee, 'tPayee', '新增收款人需要同意')}</div>
      <div class="lr"><span>夢想基金提前領出</span>${sw(true, '', '', true)}</div></div>
    <div class="card" style="gap:0"><span class="h3" style="margin-bottom:4px">封鎖消費類別</span>
      ${[['game', '遊戲儲值'], ['crypto', '加密貨幣交易'], ['overseas', '境外網購']].map(([k, l]) => `<div class="lr"><span>${l}</span>${sw(s.blocked[k], `tBlock" data-arg="${k}`, `封鎖${l}`)}</div>`).join('')}</div>
    <div class="card" style="gap:0"><div class="row" style="margin-bottom:4px">${ic('shield', 'color:var(--greenT)')}<span class="h3">永豐防詐守護</span></div>
      <span class="xs" style="margin-bottom:4px">預設開啟，家長無法關閉</span>
      ${['陌生入帳先保留', '短時間大量轉出', '新增陌生收款人', '交易當下提醒'].map(l => `<div class="lr"><span>${l}</span>${sw(true, '', '', true)}</div>`).join('')}</div>`;
}

function parTrust() {
  return `
    <div class="trustbig"><span style="font-size:12px;color:#E5DDF3">信託資產現值</span><span class="big">$${fmt(300000)}</span><span style="font-size:13px;color:#E5DDF3">每月投入 $3,000</span></div>
    <div class="card" style="gap:0"><span class="h3" style="margin-bottom:4px">預定給付</span>
      <div class="lr"><span class="col"><b>15 歲｜2029/3</b><span class="xs">撥入小安的 MMA</span></span><b class="t-purple">$${fmt(20000)}</b></div>
      <div class="lr"><span class="col"><b>18 歲｜2032/3</b><span class="xs">撥入小安的 DAWHO</span></span><b class="t-purple">$${fmt(50000)}</b></div></div>
    <span class="xs" style="line-height:1.6">15 歲給付撥入 MMA 後，大額使用（$1,000 以上）仍需要你同意。</span>
    <button class="btn b-purple" data-act="trustDetail">查看信託明細</button>
    <span class="xs" style="text-align:center">信託商品條件需向永豐確認</span>`;
}

function parOverlays() {
  const s = state;
  if (s.pauseSheet) { const p = s.pauseSheet;
    return `<div class="overlay"><div class="sheet">
      <div class="row sb"><span class="h3" style="font-size:18px">暫停配對</span><button class="iconbtn" aria-label="關閉" data-act="closePause">${ic('x')}</button></div>
      <span class="sm">已經保留的 $${fmt(heldAll())} 要怎麼處理？</span>
      <button class="opt ${p.keep ? 'right' : ''}" data-act="pauseKeep" data-arg="1">達標時照樣給小安（推薦）</button>
      <button class="opt ${!p.keep ? 'right' : ''}" data-act="pauseKeep" data-arg="0">取消，解除保留（錢留在我的帳戶）</button>
      <span class="sm">給小安一句話（選填）</span>
      <div class="chips">${NOTE_CHIPS.map((n, i) => `<button class="chip s ${p.note === i ? 'on' : ''}" data-act="pauseNote" data-arg="${i}">${n}</button>`).join('')}</div>
      <span class="xs" style="line-height:1.5">小安只會看到「媽媽的配對暫停中」，不會看到原因。</span>
      <button class="btn b-pink" data-act="confirmPause">確認暫停</button></div></div>`; }
  return '';
}

// ================= 動作 =================
function goCh(id) {
  const c = chOf(id);
  const patch = {ch:id, pay:null, deposit:null, lesson:null, quizPick:null, scamQuiz:null, scene:null, check:null, help:null, doneSheet:null, approvalReq:null, pauseSheet:null, giftList:false, openTx:null};
  if (!c.summary) { patch.kidView = c.kid; patch.parView = c.par; }
  if (id !== 'trust') patch.grown = false;
  if (id === 'scam' && state.age < 16) Object.assign(patch, {age:16, viewLevel:DEFAULT_LEVEL(16)});
  if (id !== 'scam' && id !== 'level' && state.age === 16 && state.ch === 'scam') Object.assign(patch, {age:12, viewLevel:DEFAULT_LEVEL(12)});
  set(patch);
}
function creditAllowance(label) {
  const s = state, a = s.allowance.amount;
  const save = Math.round(a * s.jars[0] / 100), share = Math.round(a * s.jars[2] / 100), spend = a - save - share;
  s.balance += spend; s.goal.saved += save; s.shareJar += share; s.weekSpent = 0;
  const mom = matchFor(save, 'sundayLeft');
  s.match.heldThisWeek += mom;
  s.tx.unshift({id:++seq, when:'今天', store:'家長零用錢', name:'零用錢入帳', amt:a, cat:'收入', income:true});
  addFeed('save', `${label}零用錢 $${a}（儲蓄 $${save}・消費 $${spend}・分享 $${share}）`);
  toast('kid', `零用錢 $${a} 入帳：$${save} 存進${s.goal.name}${mom ? `，媽媽陪你存 +$${mom}` : ''}`);
  toast('par', `已撥款 $${a} 給小安`);
  checkGoal(); render();
}
function addApproval(type, title, amt, reason, who = 'kid', extra = {}) {
  state.approvals.unshift({id:++seq, type, title, amt, reason, who, status:'pending', ...extra});
  toast('par', `小安送出一筆需要你同意的請求`);
}
function doPay(m) {
  const s = state;
  s.balance -= m.amt; s.weekSpent += m.amt;
  const t = {id:++seq, when:'今天', store:m.store, name:m.name, amt:m.amt, cat:m.cat, tag:null, src:m.items ? 'carrier' : 'card', items:m.items};
  s.tx.unshift(t); s.pay = {...s.pay, step:'tag', txId:t.id};
  addFeed('spend', '', {store:m.store, amt:m.amt, items:m.items, tag:null, txId:t.id});
}

const ACT = {
  goCh,
  prevCh() { const i = CH.findIndex(c => c.id === state.ch); if (i > 0) goCh(CH[i - 1].id); },
  nextCh() { const i = CH.findIndex(c => c.id === state.ch); if (i < CH.length - 1) goCh(CH[i + 1].id); },
  reset() { Object.values(timers).forEach(clearTimeout); state = initState(); render(); },
  kv(v) { set({kidView:v, pay:null, lesson:null, quizPick:null, scamQuiz:null, openTx:null}); },
  pv(v) { set({parView:v}); },

  // 零用錢與紅包
  autoAllowance() { if (state.allowance.on && !state.allowance.paused) creditAllowance('自動撥款：'); },
  payNow() { creditAllowance('提前撥款：'); },
  tAllowance() { const a = state.allowance; a.on = !a.on; a.paused = false; toast('kid', a.on ? '媽媽開啟了固定零用錢' : '媽媽調整了零用錢設定'); },
  setAllow(v) { state.allowance.amount = Number(v); render(); },
  pauseAllow(p) { Object.assign(state.allowance, {paused:true, pauseFor:p}); toast('par', `零用錢暫停（${p}）`); },
  resumeAllow() { Object.assign(state.allowance, {paused:false, pauseFor:''}); toast('par', '零用錢已恢復'); },
  grandma() {
    const s = state; s.balance += 2000;
    s.tx.unshift({id:++seq, when:'今天', store:'外婆', name:'紅包', amt:2000, cat:'收入', income:true});
    s.bigIn = {amt:2000, from:'外婆'}; s.kidView = 'home';
    addFeed('save', '外婆轉入紅包 $2,000（家人名單，直接入帳）');
    toast('par', '外婆轉入 $2,000 給小安（家人名單）');
  },
  bigSave(v) { const s = state, a = Number(v); s.balance -= a; s.goal.saved += a; const mom = matchFor(a, 'gift'); s.match.heldThisWeek += mom; s.bigIn = null;
    addFeed('save', `小安把紅包 $${a} 存進${s.goal.name}`); toast('kid', `存進${s.goal.name} $${a}${mom ? `，媽媽陪你存 $${mom}` : ''}`); checkGoal(); render(); },
  bigSkip() { set({bigIn:null}); },

  // 付款
  openPay() { set({kidView:'pay', pay:{step:'code', m:null}}); },
  scan(id) {
    const s = state, m = MERCHANTS.find(x => x.id === id);
    s.kidView = 'pay'; s.scene = null;
    const blocked = m.cat === '遊戲儲值' && s.blocked.game;
    if (blocked) { s.pay = {step:'blocked', m}; addFeed('security', `小安嘗試在遊戲平台付款 $${m.amt}，已依封鎖設定攔下`); render(); return; }
    if (m.amt >= s.threshold) { s.pay = {step:'approval', m, reason:null}; render(); return; }
    if (m.amt > s.balance) { s.pay = {step:'code', m:null}; toast('kid', '可以用的錢不夠喔'); return; }
    const weekLeft = Math.max(0, s.budget - s.weekSpent);
    const remind = s.remindToday < MAX_REMIND && ((REMIND_CATS.includes(m.cat) && m.amt >= 50) || m.amt >= weekLeft / 2) && !s.goalReady;
    s.pay = {step:remind ? 'choice' : 'confirm', m};
    if (remind) s.remindToday++;
    render();
  },
  payReason(i) { state.pay.reason = Number(i); render(); },
  payBuy() { doPay(state.pay.m); render(); },
  paySave() {
    const s = state, m = s.pay.m, mom = matchFor(m.amt, 'saveAtPay');
    s.balance -= m.amt; s.goal.saved += m.amt; s.match.heldThisWeek += mom; s.saveCount++;
    s.pay = null; s.kidView = 'home';
    addFeed('save', `小安選了「存起來」：$${m.amt} 存進${s.goal.name}${mom ? `，配對保留 $${mom}` : ''}`);
    toast('kid', `存進${s.goal.name} $${m.amt}${mom ? `，媽媽陪你存 $${mom}` : ''}`);
    checkGoal(); render();
  },
  tagPay(tag) {
    const s = state, t = s.tx.find(x => x.id === s.pay.txId); t.tag = tag;
    const f = s.feed.find(x => x.txId === t.id); if (f) f.tag = tag;
    s.pay = {...s.pay, step:'done'}; render();
  },

  // 錢包
  walletTab(t) { set({walletTab:t}); },
  openTx(id) { set({openTx:state.openTx === Number(id) ? null : Number(id)}); },
  retag(arg) { const [id, tag] = arg.split('|'); const t = state.tx.find(x => x.id === Number(id)); t.tag = tag; render(); },
  manualAdd() {
    const s = state; s.balance = Math.max(0, s.balance - 70); s.weekSpent += 70;
    const t = {id:++seq, when:'今天', store:'夜市', name:'雞排', amt:70, cat:'飲食', tag:null, src:'manual'};
    s.tx.unshift(t); s.openTx = t.id;
    addFeed('spend', '', {store:'夜市', amt:70, items:null, tag:null});
    toast('kid', '已手動補記：夜市雞排 $70，記得標記需要或想要');
  },
  review(id) { state.reviewPick = Number(id); const t = state.tx.find(x => x.id === Number(id)); addFeed('review', `小安的每週回顧：最值得的一筆是「${t.name}」`); toast('par', '小安完成每週回顧'); },
  setJars(i) { state.jars = JAR_PRESETS[Number(i)].slice(); toast('kid', '三罐子比例已更新，下次零用錢入帳時套用'); },
  shareJarInfo() { toast('kid', `分享罐目前預留 $${fmt(state.shareJar)}。這筆錢不會自動捐款，可以和爸媽討論如何使用。`); },
  setBudget(b) { state.budget = Number(b); render(); },

  // 夢想基金
  openDeposit(src) { const s = state; set({deposit:{amt:s.balance >= 100 ? 100 : 50, src:src || 'sundayLeft'}}); },
  closeDeposit() { set({deposit:null}); },
  depAmt(a) { state.deposit.amt = Number(a); render(); },
  depSrc(k) { state.deposit.src = k; render(); },
  doDeposit() {
    const s = state, dp = s.deposit; if (dp.amt > s.balance) return;
    const mk = dp.src === 'family' ? 'gift' : dp.src === 'other' ? null : dp.src;
    const mom = matchFor(dp.amt, mk);
    s.balance -= dp.amt; s.goal.saved += dp.amt; s.match.heldThisWeek += mom; s.deposit = null;
    if (dp.src === 'gift' || dp.src === 'family') s.bigIn = null;
    addFeed('save', `小安存進${s.goal.name} $${dp.amt}${mom ? `，配對保留 $${mom}` : ''}`);
    toast('kid', `存進 $${dp.amt}${mom ? `，媽媽陪你存 $${mom}` : ''}`);
    checkGoal(); render();
  },
  ffGoal() {
    const s = state; s.goal.saved = 1250; s.match.heldTotal = 450; s.match.heldThisWeek = 0; s.goalReady = false; s.match.paused = false;
    s.balance = Math.max(s.balance, 200); s.kidView = 'dream';
    toast('kid', '（快轉）再存一筆 $50 就達標了！'); },
  sunday() {
    const s = state, m = s.match;
    m.heldTotal += m.heldThisWeek; m.heldThisWeek = 0;
    if (s.goalReady) {
      const mom = m.heldTotal, me = s.goal.saved;
      s.celebrate = {name:s.goal.name, target:s.goal.target, me, mom};
      s.balance += me + mom; m.heldTotal = 0; s.goalsDone++; s.kidView = 'dream';
      addFeed('goal', `週日結算：小安的「${s.goal.name}」達成，配對 $${mom} 已撥入`);
      toast('par', `週日結算完成，$${mom} 已撥入小安的 MMA`);
    } else { toast('par', '週日結算完成：本週配對已確認保留'); }
    render();
  },
  nextGoal() { const s = state; s.goal = {name:'藍牙耳機基金', target:2500, saved:0}; s.goalReady = false; s.celebrate = null; s.match.heldThisWeek = 0; s.match.heldTotal = 0; render(); },
  askWithdraw() { set({approvalReq:{reason:null}}); },
  closeApproval() { set({approvalReq:null}); },
  wReason(i) { state.approvalReq.reason = Number(i); render(); },
  sendApproval(type) {
    const s = state;
    if (type === 'withdraw') {
      const r = s.approvalReq.reason; const reasons = ['球鞋有特價，想先買便宜的', '想先買文具'];
      addApproval('withdraw', `小安想提前領出${s.goal.name} $300`, 300, r === null ? '' : reasons[r]);
      s.approvalReq = null;
    } else {
      const p = s.pay, reasons = ['球鞋有特價，想先買便宜的', '我已經存了很久'];
      addApproval('big', `小安想在${p.m.store}消費 $${fmt(p.m.amt)}（${p.m.name}）`, p.m.amt, p.reason === null ? '' : reasons[p.reason], 'kid', {m:p.m});
      s.pay = null; s.kidView = 'home';
    }
    toast('kid', '已送出，等爸媽回覆');
  },
  cancelApproval(id) { const a = state.approvals.find(x => x.id === Number(id)); if (a) a.status = 'cancel'; toast('kid', '已取消'); },
  approveYes(id) {
    const s = state, a = s.approvals.find(x => x.id === Number(id)); a.status = 'ok';
    if (a.type === 'withdraw') {
      const amt = Math.min(a.amt, s.goal.saved); s.goal.saved -= amt; s.balance += amt;
      const cut = Math.min(heldAll(), Math.round(amt * s.match.ratio));
      const fromWeek = Math.min(s.match.heldThisWeek, cut); s.match.heldThisWeek -= fromWeek; s.match.heldTotal -= cut - fromWeek;
      toast('kid', `爸媽同意了！$${amt} 已領回可以用的錢${cut ? `，媽媽保留的配對也減少 $${cut}` : ''}`);
    } else if (a.type === 'big') {
      if (a.m.amt > s.balance) { a.status = 'no'; toast('kid', '可以用的錢不夠，這筆已取消'); toast('par', '餘額不足，已取消'); return; }
      s.pay = {step:'tag', m:a.m}; s.kidView = 'pay'; doPay(a.m); toast('kid', '爸媽同意了！付款完成');
    } else if (a.type === 'payee') {
      s.balance = Math.max(0, s.balance - a.amt); toast('kid', '爸媽同意了，已轉帳');
      addAlert('security', '你同意了一筆轉給新收款人的轉帳', '若對方是網路上不認識的買家，請留意假買家詐騙。');
    }
    toast('par', '已同意');
  },
  approveNo(id) { const a = state.approvals.find(x => x.id === Number(id)); a.status = 'no'; toast('kid', `爸媽：${DECLINE_NOTE[a.type]}`); toast('par', '已回覆不同意'); },
  expire() { const a = state.approvals.find(x => x.status === 'pending'); if (!a) return; a.status = 'expired'; toast('kid', '爸媽還沒回覆，這筆已取消'); },

  // 配對（家長）
  setRatio(r) { state.match.ratio = Number(r); render(); },
  customRatio() { toast('par', '自訂比例：正式版可輸入任意比例'); },
  tSource(k) { state.match.sources[k] = !state.match.sources[k]; render(); },
  saveMatch() { toast('par', '配對規則已儲存'); },
  openPause() { set({pauseSheet:{keep:true, note:null}}); },
  closePause() { set({pauseSheet:null}); },
  pauseKeep(v) { state.pauseSheet.keep = v === '1'; render(); },
  pauseNote(i) { state.pauseSheet.note = Number(i); render(); },
  confirmPause() {
    const s = state, p = s.pauseSheet;
    s.match.paused = true; s.match.note = p.note === null ? '' : NOTE_CHIPS[p.note];
    if (!p.keep) { s.match.heldTotal = 0; s.match.heldThisWeek = 0; }
    s.pauseSheet = null;
    toast('kid', '媽媽的配對暫停中'); toast('par', p.keep ? '已暫停配對，已保留的照樣給' : '已暫停配對，並解除保留');
  },
  resumeMatch() { state.match.paused = false; state.match.note = ''; toast('kid', '媽媽的配對恢復了！'); toast('par', '已恢復配對，比例與上限沿用原設定'); },

  // 任務
  openDone() { set({doneSheet:{task:null, report:null}}); },
  closeDone() { set({doneSheet:null}); },
  doneTask(id) { state.doneSheet.task = id; render(); },
  doneReport(i) { state.doneSheet.report = Number(i); render(); },
  sendDone() {
    const s = state, d = s.doneSheet, t = taskOf(d.task);
    t.status = 'waiting'; t.report = d.report === null ? '' : REPORTS[d.report]; t.reportAt = '週五 19:05';
    s.doneSheet = null; addFeed('task', `任務回報：${t.t}`);
    toast('kid', '已通知爸媽，等爸媽確認'); toast('par', `${t.t}：小安已回報`);
  },
  openReport(id) { set({reportOf:id, parView:'report'}); },
  taskDone(id) {
    const s = state, t = taskOf(id); t.status = 'got'; s.gifts.push(t.gift); s.giftShow = id; s.parView = 'task';
    addFeed('task', `${t.t} 完成，禮物：${giftOf(t.gift).t}`); toast('par', '小安會立刻收到禮物');
  },
  taskNotYet(id) { const t = taskOf(id); t.status = 'doing'; toast('kid', `爸媽說「${t.t}」還差一點，加油！`); set({parView:'task'}); },
  closeGift() { set({giftShow:null, giftList:true}); },
  openGifts() { set({giftList:true}); },
  closeGifts() { set({giftList:false}); },
  ntTpl(id) { state.newTask = {...(state.newTask || {due:'本週日'}), tpl:id}; render(); },
  ntGift(id) { state.newTask = {...(state.newTask || {due:'本週日'}), gift:id}; render(); },
  ntDue(p) { state.newTask = {...(state.newTask || {}), due:p}; render(); },
  ntSend() {
    const s = state, n = s.newTask, tpl = TASK_TPL.find(t => t.id === n.tpl);
    const id = tpl.id + seq++;
    s.tasks.unshift({id, t:tpl.t, gift:n.gift, status:'doing', prog:tpl.id === 'twoLess' ? {type:'quiz', done:0, total:2} : null});
    s.newTask = null; s.parView = 'task';
    toast('kid', `新任務：${tpl.t} → ${giftOf(n.gift).t}`); toast('par', '任務已送給小安');
  },

  // 學堂
  openLesson(id) { set({kidView:'school', lesson:id, quizPick:null, scamQuiz:null}); },
  closeLesson() { set({lesson:null, quizPick:null}); },
  answer(i) {
    const s = state, l = lessonOf(s.lesson); s.quizPick = Number(i);
    if (Number(i) === l.c && !s.lessonsDone.includes(l.id)) { s.lessonsDone.push(l.id); addFeed('lesson', `小安完成學堂「${l.t}」`); }
    render();
  },
  startQuiz() { const t = taskOf('antiScam'); set({kidView:'school', lesson:null, scamQuiz:{idx:t && t.prog ? Math.min(2, t.prog.done) : 0, pick:null}}); },
  quizAnswer(i) {
    const s = state, q = s.scamQuiz; if (q.pick === SCAM_QUIZ[q.idx].c) return;
    q.pick = Number(i);
    if (q.pick === SCAM_QUIZ[q.idx].c) {
      const t = taskOf('antiScam');
      if (t && t.prog && t.prog.done <= q.idx) { t.prog.done = q.idx + 1; addFeed('lesson', `防詐小測驗：小安答對 ${t.prog.done}/3 題`); if (t.prog.done === 3) toast('par', '小安完成防詐小測驗 3/3，請到任務確認'); }
    }
    render();
  },
  quizNext() { const q = state.scamQuiz; q.idx++; q.pick = null; render(); },
  closeQuiz() { set({scamQuiz:null}); },

  // 安全（孩子）
  askHelp() { set({help:{reason:null, sent:false}}); },
  closeHelp() { set({help:null}); },
  helpReason(i) { state.help.reason = Number(i); render(); },
  sendHelp() {
    const s = state, r = s.help.reason;
    s.help.sent = true; s.frozen = true;
    addAlert('help', '小安按了「遇到可疑的事」', `${r === null ? '' : `狀況：${HELP_REASONS[r]}。`}小安主動向你求助，請先陪伴，不要責備。轉帳已暫停，刷卡付款照常。`);
    addFeed('help', '小安按了「遇到可疑的事」');
    if (!chOf(s.ch).dual) { s.ch = 'scam'; s.parView = 'overview'; }
    toast('par', '小安向你求助');
  },
  openCheck() { set({check:{text:'', result:null}}); },
  closeCheck() { set({check:null}); },
  checkSample(i) { state.check.text = CHECK_SAMPLES[Number(i)]; state.check.result = null; render(); },
  doCheck() {
    const s = state, text = s.check.text || '';
    const hit = CHECK_RULES.find(r => r.k.some(k => text.includes(k)));
    s.check.result = hit ? {hit:true, t:hit.t, d:hit.d} : {hit:false, t:'沒有發現常見詐騙關鍵字', d:'但如果對方要你轉錢、給密碼或驗證碼，一律先停下來。'};
    render();
  },
  checkTell() { set({check:null, help:{reason:2, sent:false}}); },
  call165() { toast('kid', '（示範）撥打 165 反詐騙諮詢專線'); },
  unfreeze() { set({frozen:false}); toast('kid', '媽媽解除了轉帳暫停'); },
  ackAlert(id) { state.alerts = state.alerts.filter(a => a.id !== Number(id)); render(); },
  callKid() { toast('par', '（示範）撥打給小安'); },

  // 詐騙情境
  simHeld() {
    const s = state; s.heldIncoming = {amt:5000, from:'陌生帳戶'}; s.kidView = 'home';
    addFeed('security', '陌生帳戶轉入 $5,000，已先保留'); toast('kid', '有一筆陌生轉入 $5,000，等爸媽確認'); toast('par', '陌生帳戶轉入 $5,000，已先保留');
  },
  simMule() { set({scene:{type:'mule', step:0}}); },
  muleDo() { state.scene.step = 1; addAlert('security', '人頭帳戶警示', '有人轉錢給小安後，要求小安把錢轉出。款項保留中，無法轉出。'); toast('par', '防詐警示：疑似人頭帳戶'); },
  muleIgnore() { state.scene = null; toast('kid', '做得好！不理會對方，有問題就問爸媽'); },
  sceneHelp() { state.scene = null; ACT.askHelp(); },
  closeScene() { set({scene:null}); },
  simFakeBuyer() {
    set({scene:{type:'fake'}});
    addAlert('security', '假買家詐騙提醒', '小安準備轉 $300 給新的收款人，對方要求「操作網銀驗證帳戶」。'); toast('par', '防詐警示：疑似假買家詐騙');
  },
  fakeContinue() {
    const s = state; s.scene = null;
    if (s.newPayee) { addApproval('payee', '小安想轉 $300 給新的收款人（二手平台買家）', 300, '', 'kid'); toast('kid', '第一次轉帳給這個帳戶，需要爸媽同意'); }
    else { s.balance = Math.max(0, s.balance - 300); toast('kid', '已轉帳 $300'); }
    render();
  },
  heldOk() { const s = state; s.balance += s.heldIncoming.amt; s.heldIncoming = null; toast('kid', '爸媽確認了，款項已入帳'); },
  heldReturn() { set({heldIncoming:null}); toast('kid', '這筆陌生轉入已退回並通報'); toast('par', '已退回並通報永豐'); },

  // 查看程度與安全設定
  setAge(a) { const age = Number(a); set({age, viewLevel:DEFAULT_LEVEL(age)}); toast('par', `小安 ${age} 歲：預設查看程度為「${LEVELS[DEFAULT_LEVEL(age)].t}」`); },
  setLevel(k) { set({viewLevel:k}); toast('kid', `媽媽可以看到：${LEVELS[k].kid}`); },
  tPayee() { state.newPayee = !state.newPayee; render(); },
  tBlock(k) { state.blocked[k] = !state.blocked[k]; render(); },

  // 長期
  trustDetail() { toast('par', '（示範）信託明細：每月投入紀錄與給付條件'); },
  grow() { set({grown:true}); },
  ungrow() { set({grown:false}); },
  applyDawho() { toast('par', '（示範）小安以 MMA 資料線上申請 DAWHO'); }
};

// ================= 渲染與事件 =================
const app = document.getElementById('app');
function render() {
  const scrolls = {};
  app.querySelectorAll('[data-sk]').forEach(el => { scrolls[el.dataset.sk] = el.scrollTop; });
  const d = derive();
  app.innerHTML = `<div class="phonecol"><div class="lbl-phone">孩子端・小安的手機（${state.grown ? 18 : state.age} 歲）</div>${viewKid(d)}</div>
    <div class="phonecol"><div class="lbl-phone">家長端・媽媽的手機</div>${viewParent(d)}</div>`;
  app.querySelectorAll('[data-sk]').forEach(el => { if (scrolls[el.dataset.sk]) el.scrollTop = scrolls[el.dataset.sk]; });
}
app.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act];
  if (fn) fn(el.dataset.arg);
});
app.addEventListener('input', e => { if (e.target.id === 'check-input' && state.check) state.check.text = e.target.value; });
function fit() {
  const W = app.offsetWidth, H = app.offsetHeight, sc = Math.min(innerWidth / W, innerHeight / H);
  app.style.transform = `translate(${(innerWidth - W * sc) / 2}px, ${(innerHeight - H * sc) / 2}px) scale(${sc})`;
}
addEventListener('resize', fit);
render();
fit();
