
(function(){
'use strict';
const STORE='loafFM';
const W=128,H=32;

/* ================= Fonts ================= */
const BIG_HEX='0000000000'+'00005F0000'+'0007000700'+'147F147F14'+'242A7F2A12'+'2313086462'+'3649552250'+'0005030000'+'001C224100'+'0041221C00'+'14083E0814'+'08083E0808'+'0050300000'+'0808080808'+'0060600000'+'2010080402'+'3E5149453E'+'00427F4000'+'4261514946'+'2141454B31'+'1814127F10'+'2745454539'+'3C4A494930'+'0171090503'+'3649494936'+'064949291E'+'0036360000'+'0056360000'+'0814224100'+'1414141414'+'0041221408'+'0201510906'+'324979413E'+'7E1111117E'+'7F49494936'+'3E41414122'+'7F4141221C'+'7F49494941'+'7F09090901'+'3E4149497A'+'7F0808087F'+'00417F4100'+'2040413F01'+'7F08142241'+'7F40404040'+'7F020C027F'+'7F0408107F'+'3E4141413E'+'7F09090906'+'3E4151215E'+'7F09192946'+'4649494931'+'01017F0101'+'3F4040403F'+'1F2040201F'+'3F4038403F'+'6314081463'+'0708700807'+'6151494543'+'007F414100'+'0204081020'+'0041417F00'+'0402010204'+'4040404040'+'0001020400'+'2054545478'+'7F48444438'+'3844444420'+'384444487F'+'3854545418'+'087E090102'+'0C5252523E'+'7F08040478'+'00447D4000'+'2040443D00'+'7F10284400'+'00417F4000'+'7C04180478'+'7C08040478'+'3844444438'+'7C14141408'+'081414187C'+'7C08040408'+'4854545420'+'043F444020'+'3C4040207C'+'1C2040201C'+'3C4030403C'+'4428102844'+'0C5050503C'+'4464544C44'+'0008364100'+'00007F0000'+'0041360800'+'0804081008';
const BIG={};
for(let i=0;i<95;i++){const cols=[];for(let c=0;c<5;c++)cols.push(parseInt(BIG_HEX.substr((i*5+c)*2,2),16));BIG[String.fromCharCode(32+i)]=cols;}
BIG['°']=[0x06,0x09,0x09,0x06];BIG['·']=[0x00,0x08,0x00];
const SMALL={
 '0':[0x1F,0x11,0x1F],'1':[0x12,0x1F,0x10],'2':[0x1D,0x15,0x17],'3':[0x11,0x15,0x1F],'4':[0x07,0x04,0x1F],'5':[0x17,0x15,0x1D],'6':[0x1F,0x15,0x1D],'7':[0x01,0x01,0x1F],'8':[0x1F,0x15,0x1F],'9':[0x17,0x15,0x1F],
 'A':[0x1E,0x05,0x1E],'B':[0x1F,0x15,0x0A],'C':[0x0E,0x11,0x11],'D':[0x1F,0x11,0x0E],'E':[0x1F,0x15,0x11],'F':[0x1F,0x05,0x01],'G':[0x0E,0x11,0x1D],'H':[0x1F,0x04,0x1F],'I':[0x11,0x1F,0x11],'J':[0x08,0x10,0x0F],'K':[0x1F,0x04,0x1B],'L':[0x1F,0x10,0x10],'M':[0x1F,0x02,0x1F],'N':[0x1F,0x06,0x1F],'O':[0x0E,0x11,0x0E],'P':[0x1F,0x05,0x02],'Q':[0x0E,0x19,0x1E],'R':[0x1F,0x05,0x1A],'S':[0x12,0x15,0x09],'T':[0x01,0x1F,0x01],'U':[0x0F,0x10,0x0F],'V':[0x07,0x18,0x07],'W':[0x1F,0x08,0x1F],'X':[0x1B,0x04,0x1B],'Y':[0x03,0x1C,0x03],'Z':[0x19,0x15,0x13],
 ' ':[0,0],':':[0x0A],'-':[0x04,0x04,0x04],'.':[0x10],',':[0x10,0x08],'/':[0x18,0x04,0x03],'°':[0x02,0x05,0x02],'·':[0x04],'!':[0x17],'?':[0x01,0x15,0x02],'\'':[0x03],'&':[0x0A,0x15,0x1A],'+':[0x04,0x0E,0x04],'%':[0x19,0x04,0x13],'$':[0x16,0x1F,0x0D]
};
function glyph(ch,font){
  if(font==='small')return SMALL[ch.toUpperCase()]||SMALL['?'];
  if(ch===' ')return [0,0,0];
  let g=BIG[ch];if(!g){g=BIG[ch.normalize('NFD').replace(/[̀-ͯ]/g,'')]||BIG['?'];}
  let a=0,b=g.length;while(a<b&&g[a]===0)a++;while(b>a&&g[b-1]===0)b--;return g.slice(a,b);
}
const FH={big:7,small:5};

/* ================= Framebuffer ================= */
const fb=new Int32Array(W*H);let clip=null;
function px(x,y,c){if(x<0||y<0||x>=W||y>=H)return;if(clip&&(x<clip[0]||x>=clip[1]))return;fb[y*W+x]=c;}
function rect(x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)px(x+i,y+j,c);}
function textW(s,font,scale=1){let w=0;for(const ch of s)w+=(glyph(ch,font).length+1)*scale;return Math.max(0,w-scale);}
function text(s,x,y,font,c,scale=1){let cx=x;const h=FH[font];
  for(const ch of s){const g=glyph(ch,font);for(let i=0;i<g.length;i++)for(let r=0;r<h;r++)if(g[i]>>r&1)rect(cx+i*scale,y+r*scale,scale,scale,c);cx+=(g.length+1)*scale;}
  return cx-x-scale;}
const rgb=(r,g,b)=>(r<<16)|(g<<8)|b,hexInt=h=>parseInt(h.slice(1),16),R=c=>c>>16&255,G=c=>c>>8&255,B=c=>c&255;
function dim(c,k){return rgb(Math.round(R(c)*k),Math.round(G(c)*k),Math.round(B(c)*k));}
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const ascii=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/–|—/g,'-').replace(/·/g,'·').replace(/[^\x20-\x7e·°]/g,'').replace(/\s+/g,' ').trim();
function wrap(s,area,font='big'){const words=s.split(' ');const lines=[];let cur='';for(const w of words){const cand=cur?cur+' '+w:w;if(textW(cand,font)<=area)cur=cand;else{if(cur)lines.push(cur);cur=w;}}if(cur)lines.push(cur);return lines;}

/* ================= State ================= */
const locale=navigator.language||'en-US';
const H24=(()=>{try{return !new Intl.DateTimeFormat(locale,{hour:'numeric'}).resolvedOptions().hour12;}catch(e){return false;}})();
const UNIT=/US|LR|MM/.test(locale.split('-')[1]||'')?'F':'C';
const DEFAULTS={palette:'pegs',volume:0.7,station:'gen:late',stationName:'Late Shift',tapes:[]};
let S=Object.assign({},DEFAULTS);
let FIRST=true;try{const saved=JSON.parse(localStorage.getItem(STORE)||'null');if(saved&&typeof saved==='object'){Object.assign(S,saved);FIRST=false;}}catch(e){}
if('brightness' in S||'sitStart' in S||'mtSeen' in S){delete S.brightness;delete S.sitStart;delete S.mtSeen;try{localStorage.setItem(STORE,JSON.stringify(S));}catch(e){}} /* manual dim, the 20-minute sit and the first-visit teaser are gone: nobody stays dim or stuck asleep */
/* ================= Mixtapes =================
   A mixtape is a small recipe for one of Loaf FM's stations: which station it starts from, mood, drums, weather, tempo,
   busyness and tone, plus a name and a label colour. It's a few numbers, so it saves in the browser and fits in a link. */
/* eight cassette shells in the era's design language (no real brands); a new tape gets one at random */
const SHELLS=[
  {sh:'#e7dcc3',hi:'#f4ecd9',lab:'#e8902f',strip:'#fff7e6',ink:'#1d1c21',acc:'#e8902f'},             /* cream and orange */
  {sh:'#232227',hi:'#3a3940',lab:'#f2c94c',strip:'#232227',ink:'#f2c94c',acc:'#f2c94c'},             /* black and yellow */
  {sh:'#6fa9de',hi:'#a3cbf0',lab:'#dcecf9',strip:'#ffffff',ink:'#1d3557',acc:'#58aaf5',clear:1},     /* see-through blue */
  {sh:'#b8e2cb',hi:'#d8f1e3',lab:'#f6f1e2',strip:'#f6f1e2',ink:'#1d1c21',acc:'#4fc48d',band:'#4fc48d'},/* mint and cream */
  {sh:'#26252b',hi:'#3c3b43',lab:'#ff8a73',strip:'#fff1e6',ink:'#1d1c21',acc:'#ff8a73'},             /* black and coral */
  {sh:'#c7b6ea',hi:'#e0d5f5',lab:'#9a72e0',strip:'#f7f2ff',ink:'#3b2a66',acc:'#b293ff'},             /* lavender */
  {sh:'#55545c',hi:'#7a7983',lab:'#d9d4c7',strip:'#efebe0',ink:'#1d1c21',acc:'#cfc8b8',clear:1},     /* smoked clear */
  {sh:'#f2efe8',hi:'#ffffff',lab:'#ffffff',strip:'#ffffff',ink:'#1d1c21',acc:'#e2504a',band:'#e2504a'}];/* white with a red stripe */
const TAPE_MAX=50;
const DAYNAME=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
/* the tracks you start with: a little restrained on purpose, so the first layer you add pays off. [name, layers, what to suggest first] */
const BASES=[['Lo-fi',{d:1,b:0,k:1,w:0,p:1},{b:1,w:1}],['House',{d:3,b:0,k:3,w:0,p:1},{b:2,w:0}],['Ambient',{d:0,b:1,k:3,w:0,p:0},{w:2,d:1}],['8-bit',{d:2,b:0,k:4,w:0,p:2},{b:3}]];
const LEGACY=[{d:1,b:1,k:0,w:1,p:1},{d:1,b:1,k:1,w:0,p:1},{d:2,b:2,k:0,w:0,p:1},{d:0,b:0,k:2,w:2,p:0},{d:3,b:3,k:3,w:0,p:2}]; /* what older tapes (lo-fi, bossa, house, ambient, 8-bit) become */
let draft=null; /* the tape being made, before it's saved */
const clampInt=(v,lo,hi,d)=>{v=Math.round(+v);return Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):d;};
function cleanTape(t){if(!t||typeof t!=='object')return null;const n=String(t.n||'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,24)||'Untitled mixtape';
  let d=t.d,b=t.b,k=t.k,p=t.p,sb=t.s;
  if(t.e!==5){ /* older tapes: bring them up to the layers version */
    if(k==null){let v=t.v,g=t.g;if(v==null&&t.b!=null){v=0;g=+t.t<35?0:+t.t<65?1:2;} /* vibe, mood, groove...: the nearest parts, at the nearest speed */
      const pr=LEGACY[clampInt(v,0,4,0)];d=pr.d;b=pr.b;k=pr.k;p=clampInt(g,0,2,1);}
    else if(t.e!==4)d=[0,1,1,2][clampInt(d,0,3,1)]; /* the drums version: brushes become lo-fi */
    const d4=clampInt(d,0,3,1),k4=clampInt(k,0,3,0);d=[0,2,3,2][d4];k=k4+1;sb=k4===3?3:d4===2?1:d4===0&&k4===2?2:0;} /* the steps version: beats and keys renumbered, keys can now be off */
  return {id:typeof t.id==='string'&&/^[a-z0-9]{1,16}$/.test(t.id)?t.id:undefined,n,c:clampInt(t.c,0,SHELLS.length-1,0),d:clampInt(d,0,3,1),b:clampInt(b,0,3,0),k:clampInt(k,0,4,1),w:clampInt(t.w,0,4,0),p:clampInt(p,0,2,1),f:clampInt(t.f,879,1079,0)||randFreq(),s:clampInt(sb,0,3,0),r:clampInt(t.r,1,2147483647,0),e:5,i:t.i?1:0};} /* r: the tune's seed (0 on older tapes: their name is the seed, so they keep their tune) */
function randFreq(){const taken=new Set(Object.values(FREQ_FIXED).map(f=>Math.round(f*10)));let f;do{f=879+2*Math.floor(Math.random()*101);}while(taken.has(f));return f;} /* a free spot on the dial, odd tenths like real FM */
const FREQ_FIXED={late:88.3,window:91.7,crt:94.1,sunday:97.5,desert:102.9,purr:89.9,rain:90.5,waves:93.3,fire:99.1,brown:100.7};
S.tapes=(Array.isArray(S.tapes)?S.tapes:[]).map(cleanTape).filter(t=>t&&t.id).slice(0,TAPE_MAX);
/* an unsaved mixtape is kept quietly too, so a refresh or a closed tab doesn't lose it */
function keepDraft(){if(BC)return;S.draft=draft?Object.assign({},draft):null;save();}
function tapeOf(id){if(typeof id!=='string'||!id.startsWith('tape:'))return null;return id==='tape:draft'?draft:S.tapes.find(t=>'tape:'+t.id===id)||null;}
function levelOf(id){if(GEN_LEVEL[id]!=null)return GEN_LEVEL[id];const tp=tapeOf(id);return tp?TAPE_LEVEL:.8;}
function freqOf(id){if(FREQ[id])return FREQ[id];const tp=tapeOf(id);return tp?(tp.f/10).toFixed(1):'88.3';} /* every tape keeps its own spot on the dial, chosen when it's made */
function encodeTape(t){const j=JSON.stringify([t.i?7:6,t.n,t.c,t.d,t.b,t.k,t.w,t.p,t.f,t.s,t.r]);return btoa(unescape(encodeURIComponent(j))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decodeTape(s){try{const a=JSON.parse(decodeURIComponent(escape(atob(String(s).replace(/-/g,'+').replace(/_/g,'/')))));if(!Array.isArray(a))return null;
  if(a[0]===7||a[0]===6)return cleanTape({n:a[1],c:a[2],d:a[3],b:a[4],k:a[5],w:a[6],p:a[7],f:a[8],s:a[9],r:a[10],e:5,i:a[0]===7?1:0}); /* 7: the same fields, with independent layers */
  if(a[0]===5)return cleanTape({n:a[1],c:a[2],d:a[3],b:a[4],k:a[5],w:a[6],p:a[7],f:a[8],s:a[9],e:5});
  if(a[0]===4)return cleanTape({n:a[1],c:a[2],d:a[3],b:a[4],k:a[5],w:a[6],p:a[7],f:a[8],e:4});
  if(a[0]===3)return cleanTape({n:a[1],c:a[2],d:a[3],b:a[4],k:a[5],w:a[6],p:a[7],f:a[8]});
  if(a[0]===2)return cleanTape({n:a[1],c:a[2],v:a[3],m:a[4],g:a[5],s:a[6],w:a[7],f:a[8]}); /* links from the vibe/mood/groove version */
  if(a[0]===1)return cleanTape({n:a[1],c:a[2],b:a[3],m:a[4],d:a[5],w:a[6],t:a[7],u:a[8],o:a[9],f:a[10]}); /* links from before vibes still play */
  return null;}catch(e){return null;}}
function save(){if(BC)return;try{localStorage.setItem(STORE,JSON.stringify(S));}catch(e){}} /* broadcast mode never changes your own saved settings */
/* ================= Broadcast mode (for YouTube and streaming software) =================
   ?broadcast=video   for uploaded videos: no clock or date (they'd be wrong later); the display shows the station's frequency
   ?broadcast=live    for a 24/7 livestream: the frequency up top, the real time on the small line, in one time zone
   Options: &station=late|window|crt|sunday|desert|purr|rain|ocean|fire|brown   &tz=America/Los_Angeles (live)
            &rotate=60&stations=late,window,desert (change station every N minutes)   &palette=pegs|teal|red|amber|crt|moon|ember
            &vol=0.8   &case=dark|light   &treats=0 (no automatic treats)   &label=JST (time-zone label)   &dim=0 (no evening dimming)
   Full-screen 16:9 board, no page or controls, sound starts by itself (OBS allows it), she never dozes off waiting
   for a mouse that isn't coming, and every so often a treat drops on its own. */
const BCQ=new URLSearchParams(location.search),BC=/^(video|live)$/.test(BCQ.get('broadcast')||'')?{mode:BCQ.get('broadcast')}:null;
if(!BC&&S.draft){draft=cleanTape(S.draft);if(draft)delete draft.id;}
const ST_KEYS={late:'gen:late',window:'gen:window',crt:'gen:crt',sunday:'gen:sunday',desert:'gen:desert',purr:'gen:purr',rain:'gen:rain',ocean:'gen:waves',waves:'gen:waves',fire:'gen:fire',brown:'gen:brown'};
const FREQ={'gen:late':'88.3','gen:window':'91.7','gen:crt':'94.1','gen:sunday':'97.5','gen:desert':'102.9','gen:purr':'89.9','gen:rain':'90.5','gen:waves':'93.3','gen:fire':'99.1','gen:brown':'100.7'};
if(BC){BC.tz=BCQ.get('tz')||(BC.mode==='live'?'America/Los_Angeles':'');try{if(BC.tz)new Intl.DateTimeFormat('en-US',{timeZone:BC.tz});}catch(e){BC.tz='America/Los_Angeles';}
  BC.list=(BCQ.get('stations')||'').split(',').map(k=>ST_KEYS[k.trim()]).filter(Boolean);BC.rotate=Math.max(0,+BCQ.get('rotate')||0);
  let first=ST_KEYS[BCQ.get('station')]||BC.list[0]||'gen:late';if(BCQ.get('tape')){const tp=decodeTape(BCQ.get('tape'));if(tp){draft=tp;first='tape:draft';}}S.station=first;if(BCQ.get('palette'))S.palette=BCQ.get('palette');
  if(BCQ.get('vol'))S.volume=Math.max(0,Math.min(1,+BCQ.get('vol')));BC.treats=BCQ.get('treats')!=='0';
  document.documentElement.classList.add('broadcast');document.documentElement.dataset.theme=BCQ.get('case')==='light'?'light':'dark';}
/* the time in the broadcast's time zone, as a Date whose local fields read in that zone (worked out once a second) */
let tzCache={k:0,d:null};
function NOW(){if(!BC||!BC.tz)return new Date();const k=Math.floor(Date.now()/1000);if(tzCache.k===k)return tzCache.d;
  const p={};for(const x of new Intl.DateTimeFormat('en-US',{timeZone:BC.tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}).formatToParts(new Date()))p[x.type]=x.value;
  tzCache={k,d:new Date(+p.year,+p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)};return tzCache.d;}
function tzLabel(){if(!BC||!BC.tz)return '';if(BCQ.get('label'))return BCQ.get('label').toUpperCase().slice(0,6);try{const n=new Intl.DateTimeFormat('en-US',{timeZone:BC.tz,timeZoneName:'short'}).formatToParts(new Date()).find(x=>x.type==='timeZoneName').value;return /^[A-Z][SD]T$/.test(n)?n[0]+'T':n.replace(/^GMT$/,'UTC');}catch(e){return '';}}
/* Five vintage displays. Each is a ramp, not one colour: off = unlit dots, deep = shadows under the desk,
   mid = desk line and the cat's shading, primary = clock and text, secondary = labels, hi = moon, snow and sparkle,
   accent = divider and hearts (deliberately off-hue), fish = her fish. floor keeps night palettes readable. */
const PALETTES={
  /* Pegs: a black pegboard with coloured plastic pegs, like the light-up toy from the 80s. Every digit gets its own colour,
     the desk edge is a row of rainbow pegs, and now and then a peg is in the wrong place, the way a kid would leave it. */
  pegs:  {name:'808',       primary:'#f4ecd8',secondary:'#f08a24',accent:'#e8392b',bg:'#050505',seed:'#707070',off:'#151412',deep:'#2a1a12',mid:'#c9632a',hi:'#fff6e0',fish:'#f08a24',peg:true,meter:['#f2d14d','#f08a24','#e8392b'],
          rainbow:['#e8392b','#f08a24','#f2d14d','#f4ecd8','#e8392b','#f08a24','#f2d14d','#f4ecd8'],digits:['#e8392b','#f08a24','#f2d14d','#f4ecd8']}, /* the default: the 808's step-key colours (red, orange, yellow, cream) as glowing pegs. Id kept as 'pegs' so saved choices still work */
  teal:  {name:'VFD',       primary:'#63ddd1',secondary:'#ff8a3d',accent:'#e8392b',bg:'#061314',seed:'#238c89',off:'#0f2021',deep:'#143f3f',mid:'#2a7c77',hi:'#d4fff8',fish:'#ff8a3d',meter:['#2a9d94','#63ddd1','#ff8a3d']}, /* cool: a vacuum-fluorescent receiver display, cyan with orange, same as the tuner */
  red:   {name:'Red LED',   primary:'#ff2a1a',secondary:'#ff5a3c',accent:'#ffb03a',bg:'#120403',seed:'#a8170e',off:'#1e0706',deep:'#3a0b08',mid:'#a3180f',hi:'#ff8f78',fish:'#ffb03a',floor:.45,meter:['#8a140c','#ff2a1a','#ff8f78']}, /* late night: the bedside clock radio, red seven-segment glow, low glare */
  amber: {name:'Amber',     primary:'#ffb03a',secondary:'#ff7a1f',accent:'#e8392b',bg:'#140b05',seed:'#b96d20',off:'#22140a',deep:'#4a2a12',mid:'#c06a1c',hi:'#ffe2a8',fish:'#ff7a1f',floor:.45,meter:['#c06a1c','#ffb03a','#e8392b']}, /* late night: one warm LED colour, low glare */
  crt:   {name:'Phosphor',  primary:'#f1e9c9',secondary:'#b7d39c',accent:'#d9785a',bg:'#0c120e',seed:'#527256',off:'#131c15',deep:'#26392a',mid:'#6f8d67',hi:'#fbf6e2',fish:'#e6a44b'},
  moon:  {name:'Moonlight', primary:'#afc8f4',secondary:'#a88dd8',accent:'#ebcb7d',bg:'#090b1c',seed:'#354f78',off:'#101429',deep:'#17213e',mid:'#354a82',hi:'#f0f4ff',fish:'#ebcb7d',floor:.5}, /* dreamy: icy blue with lavender and pale gold */
  ember: {name:'Ember',     primary:'#ed9272',secondary:'#c65b45',accent:'#f2c46b',bg:'#120d0c',seed:'#7b3029',off:'#1c1312',deep:'#3a1c1c',mid:'#7b3029',hi:'#f7b89a',fish:'#f2c46b',floor:.55}};
const SHOWN_PALETTES=['pegs','teal','red']; /* three looks: 808, VFD, Amber. Moonlight, Phosphor and Ember still work for anyone who chose them (and in broadcast links) */
const TRACK_PALETTE=['red','pegs','teal','pegs']; /* Lo-fi → Red LED, House → 808, Ambient → VFD, 8-bit → 808 */
function pal(){const p=PALETTES[S.palette]||PALETTES.pegs;return {PEG:p.peg?p.rainbow.map(hexInt):null,DIG:p.peg?p.digits.map(hexInt):null,C:hexInt(p.primary),S2:hexInt(p.secondary),A:hexInt(p.accent),BG:hexInt(p.bg),pegs:null,OFF:p.off,DEEP:hexInt(p.deep),MID:hexInt(p.mid),HI:hexInt(p.hi),FISH:hexInt(p.fish),floor:p.floor||0};}
const DAYS=['SUN','MON','TUE','WED','THU','FRI','SAT'],MONTHS=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
function clock(d){let h=d.getHours();const ap=h>=12?'PM':'AM';if(!H24)h=h%12||12;return {s:(H24?String(h).padStart(2,'0'):String(h))+':'+String(d.getMinutes()).padStart(2,'0'),ap,date:DAYS[d.getDay()]+' '+MONTHS[d.getMonth()]+' '+d.getDate()};}
function nightDim(d){if(BC&&BCQ.get('dim')==='0')return 1;const h=d.getHours()+d.getMinutes()/60;if(h>=8&&h<=19)return 1;if(h>19&&h<23)return 1-(h-19)/4*.6;if(h>=23||h<5)return .4;return .4+(h-5)/3*.6;}

/* ================= Sound =================
   Everything Loaf FM plays is made in the browser: its own music stations and the calm sounds. No live radio. */

let actx=null,freq=null;const bands=new Float32Array(16);
function playing(){return !!gen&&!!actx&&actx.state==='running';} /* a suspended context isn't playing, whatever's queued */
/* ================= Calm sounds, made right here: nothing to stream, nothing to buffer ================= */
const CALM=[{id:'gen:purr',name:'Purr',url:''},{id:'gen:rain',name:'Rain',url:''},{id:'gen:waves',name:'Ocean',url:''},{id:'gen:fire',name:'Fireplace',url:''},{id:'gen:brown',name:'Brown noise',url:''}];
let gen=null;
function makeNoise(a,sec,kind){const n=Math.round(a.sampleRate*sec),b=a.createBuffer(2,n,a.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let last=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;if(kind==='brown'){last=(last+.02*w)/1.02;d[i]=last*3.5;}else d[i]=w;}
    if(kind==='brown'){const s=d[0],e=d[n-1];for(let i=0;i<n;i++)d[i]-=s+(e-s)*i/(n-1);}} /* ends meet, so the loop never clicks */
  return b;}
let muted=false,pipMute=null,pipDots=null,pipFeed=null,pipSit=null;const vol=()=>muted?0:S.volume; /* mute is for this visit only; the volume you set is kept */
const GEN_LEVEL={'gen:brown':.5,'gen:rain':2,'gen:purr':.64,'gen:fire':.76,'gen:waves':1.2,'gen:late':.63,'gen:window':.6,'gen:crt':.7,'gen:sunday':.6,'gen:desert':1.04}; /* matched by ear-weighted level so switching sounds never jumps */
/* ===== The calm sounds =====
   All made in the browser, none of them a loop you can learn: anything that happens (a drop, a wave, a crackle, a breath)
   is scheduled a few seconds ahead with its own random timing and size. They're meant to sit under focus or a sit,
   so nothing is sudden: no sharp attacks, no loud one-offs, and slow changes rather than busy ones.
   Each builder returns its sources and a tick(until) that schedules events up to that time. */
const rnd=(lo,hi)=>lo+Math.random()*(hi-lo);
function swayGain(a,gain,base,depth,until,state){while(state.t<until){const d=rnd(4,9);gain.gain.linearRampToValueAtTime(base*(1+rnd(-depth,depth)),state.t+d);state.t+=d;}} /* a slow drift in level, so a steady bed still feels alive */
const SOUNDS={
  'gen:brown':(a,dest)=>{const s=a.createBufferSource();s.buffer=makeNoise(a,8,'brown');s.loop=true;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;s.connect(lp).connect(dest);s.start();return {src:[s]};},
  /* rain: a soft wash with a slow drift, and a light, scattered patter of drops on top (never busy, never sharp) */
  /* rain: gentle pitter-patter on a window. A low, soft hush, small taps scattered (sometimes two close together),
     and now and then a single droplet's plink. Darker and sparser than a downpour, so it settles into the background. */
  'gen:rain':(a,dest)=>{const white=makeNoise(a,6,'white'),s=a.createBufferSource();s.buffer=white;s.loop=true;const hp=a.createBiquadFilter();hp.type='highpass';hp.frequency.value=300;
    const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2300;const bed=a.createGain();bed.gain.value=.11;s.connect(hp).connect(lp).connect(bed).connect(dest);s.start();
    let tn=a.currentTime+.1,pn=a.currentTime+rnd(2,5);const sway={t:a.currentTime};
    const tap=(at,lvl)=>{const d=a.createBufferSource();d.buffer=white;const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.value=rnd(700,2200);bp.Q.value=6;
      const dg=a.createGain(),len=rnd(.03,.07);dg.gain.setValueAtTime(0,at);dg.gain.linearRampToValueAtTime(lvl,at+.003);dg.gain.exponentialRampToValueAtTime(.0001,at+len);d.connect(bp).connect(dg).connect(dest);d.start(at,rnd(0,5),len+.03);};
    return {src:[s],tick(until){swayGain(a,bed,.11,.2,until,sway);
      while(tn<until){tap(tn,rnd(.02,.045));if(Math.random()<.25)tap(tn+rnd(.04,.09),rnd(.012,.03));tn+=-Math.log(1-Math.random())/3.6;}
      while(pn<until){const o=a.createOscillator(),g=a.createGain(),f=rnd(1500,2600);o.frequency.setValueAtTime(f,pn);o.frequency.exponentialRampToValueAtTime(f*.7,pn+.08); /* a droplet */
        g.gain.setValueAtTime(0,pn);g.gain.linearRampToValueAtTime(.006,pn+.004);g.gain.exponentialRampToValueAtTime(.0001,pn+.12);o.connect(g).connect(dest);o.start(pn);o.stop(pn+.14);pn+=rnd(3,8);}}};}, /* a few taps a second, at random */
  /* ocean: slow swells. A wave every ten seconds or so; each one rises gently, softly breaks and takes its time draining back */
  'gen:waves':(a,dest)=>{const white=makeNoise(a,9,'white');let tn=a.currentTime+.5,sea=rnd(.55,.75);
    const bed=a.createBufferSource();bed.buffer=makeNoise(a,9,'brown');bed.loop=true;const bl=a.createBiquadFilter();bl.type='lowpass';bl.frequency.value=240;const bg=a.createGain();bg.gain.value=.17;bed.connect(bl).connect(bg).connect(dest);bed.start(); /* the far-off surf underneath */
    const wave=(t0,size)=>{const rise=rnd(4,6.5),fall=rnd(7,11),peak=.24+.3*size;
      const src=a.createBufferSource();src.buffer=white;const lp=a.createBiquadFilter();lp.type='lowpass';lp.Q.value=.3;const g=a.createGain();const pan=a.createStereoPanner?a.createStereoPanner():null;
      lp.frequency.setValueAtTime(170,t0);lp.frequency.exponentialRampToValueAtTime(550+1300*size,t0+rise);lp.frequency.setTargetAtTime(220,t0+rise,fall/2.5);
      g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(peak*.5,t0+rise*.7);g.gain.linearRampToValueAtTime(peak,t0+rise);g.gain.setTargetAtTime(0,t0+rise,fall/3.2);
      let n=src.connect(lp).connect(g);if(pan){pan.pan.value=rnd(-.25,.25);n=n.connect(pan);}n.connect(dest);src.start(t0,rnd(0,2),rise+fall*1.7);
      if(size>.6){const f=a.createBufferSource();f.buffer=white;const hp=a.createBiquadFilter();hp.type='highpass';hp.frequency.value=rnd(2400,3200);const fg=a.createGain(),fl=rnd(2,3.5); /* a hush of foam on the bigger ones */
        fg.gain.setValueAtTime(0,t0+rise*.8);fg.gain.linearRampToValueAtTime(.02+.035*size,t0+rise+.4);fg.gain.setTargetAtTime(0,t0+rise+.4,fl/3);f.connect(hp).connect(fg).connect(dest);f.start(t0+rise*.8,rnd(0,4),fl+1.5);}
      return rise+fall;};
    return {src:[bed],tick(until){while(tn<until){sea=Math.min(.9,Math.max(.4,sea+rnd(-.06,.06)));const size=Math.min(1,sea*rnd(.75,1.15));tn+=wave(tn,size)*rnd(.62,.85);}}};},
  /* fireplace: a low, slowly flickering roar, a faint hiss and a sparse scatter of small, soft crackles; the odd pop is muffled */
  'gen:fire':(a,dest)=>{const white=makeNoise(a,6,'white');const s=a.createBufferSource();s.buffer=makeNoise(a,8,'brown');s.loop=true;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=360;const roar=a.createGain();roar.gain.value=.5;s.connect(lp).connect(roar).connect(dest);s.start();
    const w=a.createBufferSource();w.buffer=white;w.loop=true;const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.value=2400;bp.Q.value=.6;const hiss=a.createGain();hiss.gain.value=.01;w.connect(bp).connect(hiss).connect(dest);w.start();
    let tn=a.currentTime+.2;const sway={t:a.currentTime};
    return {src:[s,w],tick(until){swayGain(a,roar,.5,.2,until,sway);
      while(tn<until){const at=tn,pop=Math.random()<.04,c=a.createBufferSource();c.buffer=white;const f=a.createBiquadFilter();f.type=pop?'lowpass':'bandpass';f.frequency.value=pop?rnd(700,1100):rnd(1800,3600);f.Q.value=pop?.7:1.2;
        const cg=a.createGain(),len=pop?rnd(.03,.05):rnd(.006,.016);cg.gain.setValueAtTime(0,at);cg.gain.linearRampToValueAtTime(pop?rnd(.07,.1):rnd(.02,.06),at+.002);cg.gain.exponentialRampToValueAtTime(.0001,at+len);
        c.connect(f).connect(cg).connect(dest);c.start(at,rnd(0,5),len+.03);tn+=Math.random()<.3?rnd(.03,.09):-Math.log(1-Math.random())/1.6;}}};}, /* sparse, sometimes in little clusters */
  /* purr: a slow purr that breathes, stronger on the out-breath; the swells are eased in so nothing thumps */
  'gen:purr':(a,dest)=>{const o=a.createOscillator();o.type='sawtooth';o.frequency.value=25;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=210;lp.Q.value=.7;
    const amp=a.createGain();amp.gain.value=0;o.connect(lp).connect(amp).connect(dest);o.start();
    const n=a.createBufferSource();n.buffer=makeNoise(a,4,'brown');n.loop=true;const nl=a.createBiquadFilter();nl.type='lowpass';nl.frequency.value=300;const ng=a.createGain();ng.gain.value=.25;n.connect(nl).connect(ng).connect(amp);n.start();
    let tn=a.currentTime+.05;
    return {src:[o,n],tick(until){while(tn<until){const cyc=rnd(2.6,3.2),ex=cyc*.55,t=tn;
      amp.gain.setValueAtTime(.08,t);amp.gain.linearRampToValueAtTime(.5,t+.4);amp.gain.linearRampToValueAtTime(.4,t+ex);amp.gain.linearRampToValueAtTime(.14,t+ex+.25);amp.gain.linearRampToValueAtTime(.28,t+ex+.55);amp.gain.linearRampToValueAtTime(.08,t+cyc);
      o.frequency.setValueAtTime(rnd(24,26.5),t);o.frequency.linearRampToValueAtTime(rnd(26.5,28.5),t+ex);tn+=cyc;}}};}};
/* ===== Loaf FM originals: music made live in your browser =====
   Five little stations, composed as they play: no recordings, samples or third-party streams, and never quite the same twice.
   Everything is synthesised: an electric piano (two-operator FM), soft analog pads, bass, gentle drums,
   bells, an arpeggiator, crickets and tape hiss. A conductor picks chords, voicings, rhythms and the odd
   melody a few seconds ahead, and moves through quiet sections (keys alone, a groove, a little tune,
   a breakdown) so it keeps changing without ever demanding attention. */
const MUSIC=[{id:'gen:late',name:'Late Shift',url:''},{id:'gen:window',name:'Rainy Window',url:''},{id:'gen:crt',name:'CRT Dreams',url:''},{id:'gen:sunday',name:'Sunday Loaf',url:''},{id:'gen:desert',name:'Desert Night',url:''}];
const mtof=m=>440*Math.pow(2,(m-69)/12);
/* the keys under Loafie: the music tells the desk which note it plays and when, and that key lights up */
const keyHits=[];function keyHit(a,t,m){if(a!==actx)return;keyHits.push(t,m);if(keyHits.length>300)keyHits.splice(0,150);} /* every melodic note; the keys don't light any more, but the deck's pattern display reads this */
const choose=a=>a[Math.floor(Math.random()*a.length)];
const CH={maj7:[0,4,7,11],m7:[0,3,7,10],dom7:[0,4,7,10],maj9:[0,4,7,11,14],m9:[0,3,7,10,14],dom9:[0,4,7,10,14],sus:[0,5,7,10],m11:[0,3,7,10,17],add9:[0,4,7,14]};
/* progressions as [scale-degree root in semitones, chord type] */
const PROGS={
  warm:[[[2,'m9'],[7,'dom9'],[0,'maj9'],[9,'m7']],[[0,'maj7'],[9,'m9'],[2,'m7'],[7,'sus']],[[5,'maj9'],[4,'m7'],[2,'m9'],[0,'maj7']],[[0,'maj9'],[5,'maj9'],[0,'maj9'],[5,'maj9']],[[9,'m9'],[5,'maj7'],[0,'maj9'],[7,'sus']]],
  minor:[[[9,'m9'],[5,'maj7'],[0,'add9'],[7,'sus']],[[9,'m7'],[2,'m7'],[5,'maj7'],[4,'m7']],[[9,'m11'],[9,'m11'],[5,'maj9'],[7,'add9']]],
  jazz:[[[2,'m9'],[7,'dom9'],[0,'maj9'],[0,'maj9']],[[4,'m7'],[9,'dom7'],[2,'m9'],[7,'dom9']],[[0,'maj9'],[9,'m9'],[2,'m9'],[7,'dom9']],[[5,'maj9'],[5,'m9'],[0,'maj9'],[9,'m7']]],
  drone:[[[0,'add9'],[0,'add9'],[5,'add9'],[0,'add9']],[[9,'m9'],[9,'m9'],[7,'sus'],[7,'sus']]]};
const STYLES={
  'gen:late':  {phrase:'motif',bpm:[70,74],swing:.12,prog:'warm', bars:2,keys:'ep',pad:.35,bass:1,drums:'sparse',hats:.25,melody:'ep',mel:.3,hiss:1,lp:2800,rev:.22,level:1},
  'gen:window':{phrase:'sparse',bpm:[62,66],swing:.08,prog:'warm', bars:2,keys:'ep',pad:.8,bass:.6,drums:'brush',hats:0,melody:'lead',mel:.35,hiss:.6,lp:2800,rev:.3,rain:.5,level:1},
  'gen:crt':   {bpm:[76,80],swing:0,  prog:'minor',bars:2,keys:'none',pad:1,bass:1,drums:'four',hats:.5,melody:'arp',mel:.6,hiss:.8,lp:3000,rev:.25,blips:1,level:.9},
  'gen:sunday':{phrase:'approach',bpm:[74,78],swing:.2, prog:'jazz', bars:2,keys:'ep',pad:.3,bass:1.1,drums:'brush',hats:0,melody:'ep',mel:.35,hiss:.8,lp:3000,rev:.22,purr:.18,level:1},
  'gen:desert':{phrase:'wide',bpm:[58,62],swing:0,  prog:'drone',bars:4,keys:'none',pad:1,bass:.7,drums:'none',hats:0,melody:'bell',mel:.35,hiss:.5,lp:2600,rev:.4,crickets:1,level:1}};
function makeVerb(a,sec){const n=Math.round(a.sampleRate*sec),b=a.createBuffer(2,n,a.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);let lp=0;for(let i=0;i<n;i++){lp=lp*.7+(Math.random()*2-1)*.3;d[i]=lp*Math.pow(1-i/n,2.6);}}const v=a.createConvolver();v.buffer=b;return v;}
function music(a,dest,st0){const st=Object.assign({},st0),white=makeNoise(a,6,'white');let hg=null,hfx=null;
  /* the signal chain: everything into a warm low-pass and a gentle tape saturation, with a soft room on a send */
  const bus=a.createGain();bus.gain.value=st.level;const warm=a.createBiquadFilter();warm.type='lowpass';warm.frequency.value=st.lp;warm.Q.value=.5;
  const sat=a.createWaveShaper();const cv=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;cv[i]=Math.tanh(1.6*x)/Math.tanh(1.6);}sat.curve=cv;
  const comp=a.createDynamicsCompressor();comp.threshold.value=-26;comp.knee.value=12;comp.ratio.value=3;comp.attack.value=.03;comp.release.value=.35; /* smooths out the odd louder hit */
  const warm2=a.createBiquadFilter();warm2.type='lowpass';warm2.frequency.value=st.lp;warm2.Q.value=.6;bus.connect(sat).connect(warm).connect(warm2).connect(comp).connect(dest); /* saturate first, then filter, so Tone's darkness sticks */ /* two filters in a row, so Tone really darkens */const verb=makeVerb(a,2.8),wet=a.createGain();wet.gain.value=st.rev;const send=a.createGain();send.connect(verb).connect(wet).connect(warm); /* the room goes through the tone filter too */
  /* tape wow: a slow wobble shared by every oscillator */
  const wow=a.createOscillator();wow.frequency.value=.27;const wowG=a.createGain();wowG.gain.value=st.wobble||7;wow.connect(wowG);wow.start();
  const trem=a.createOscillator();trem.frequency.value=2.3;const tremG=a.createGain();tremG.gain.value=.07; /* slow and shallow: wobble near 4 Hz is the most attention-grabbing kind */trem.connect(tremG);trem.start();
  const srcs=[wow,trem];
  const drumBus=a.createGain();drumBus.gain.value=0;drumBus.connect(bus);
  const out=(node,pan,rv,to)=>{let n=node;if(a.createStereoPanner){const p=a.createStereoPanner();p.pan.value=pan||0;n.connect(p);n=p;}n.connect(to||bus);if(rv){const s=a.createGain();s.gain.value=rv;n.connect(s).connect(send);}};
  const osc=(type,f,t)=>{const o=a.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);wowG.connect(o.detune);return o;};
  /* instruments */
  const ep=(t,m,dur,vel)=>{keyHit(a,t,m);const f=mtof(m),c=osc('sine',f,t),md=osc('sine',f,t),mg=a.createGain(),g=a.createGain(),tg=a.createGain();
    mg.gain.setValueAtTime(f*1.05*vel,t);mg.gain.exponentialRampToValueAtTime(f*.08,t+.9);md.connect(mg).connect(c.frequency);const c2=osc('sine',f,t);c2.detune.setValueAtTime(rnd(5,9),t);const g2=a.createGain();g2.gain.value=.35;c2.connect(g2);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09*vel,t+.006);g.gain.setTargetAtTime(.035*vel,t+.01,.5);g.gain.setTargetAtTime(0,t+dur,.35);
    tg.gain.value=1;tremG.connect(tg.gain);c.connect(g).connect(tg);g2.connect(g);out(tg,(m-62)/30,.6);const e=t+dur+2;c.start(t);md.start(t);c2.start(t);c.stop(e);md.stop(e);c2.stop(e);};
  const pad=(t,ms,dur,lvl)=>{const g=a.createGain(),f=a.createBiquadFilter();f.type='lowpass';f.Q.value=.4;f.frequency.setValueAtTime(400,t);f.frequency.linearRampToValueAtTime(1100,t+dur*.5);f.frequency.linearRampToValueAtTime(600,t+dur+2);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.022*lvl,t+Math.min(2.5,dur*.4));g.gain.setValueAtTime(.022*lvl,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+2.5);f.connect(g);out(g,0,.9);
    for(const m of ms)for(const d of [-7,7]){const o=osc('sawtooth',mtof(m),t);o.detune.setValueAtTime(d,t);o.connect(f);o.start(t);o.stop(t+dur+2.6);}};
  const bass=(t,m,dur,lvl)=>{const o=osc('sine',mtof(m),t),o2=osc('triangle',mtof(m),t),g=a.createGain(),g2=a.createGain();g2.gain.value=.25;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16*lvl,t+.02);g.gain.setTargetAtTime(.09*lvl,t+.05,.4);g.gain.setTargetAtTime(0,t+dur,.12);o.connect(g);o2.connect(g2).connect(g);out(g,0,0);o.start(t);o2.start(t);o.stop(t+dur+1);o2.stop(t+dur+1);};
  const loose=(t,lo,hi)=>Math.max(a.currentTime,t+rnd(lo,hi)); /* human timing: a little early or late, never on the grid */
  const kick=(t,v)=>{t=loose(t,-.008,.01);v*=rnd(.85,1.05);const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.24*v,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+.38);o.connect(g);out(g,0,0,drumBus);o.start(t);o.stop(t+.45);};
  const noiseHit=(t,type,fq,q,att,dec,lvl,pan,rv,to)=>{const s=a.createBufferSource();s.buffer=white;const f=a.createBiquadFilter();f.type=type;f.frequency.value=fq;f.Q.value=q;const g=a.createGain();
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(lvl,t+att);g.gain.exponentialRampToValueAtTime(.0005,t+att+dec);s.connect(f).connect(g);out(g,pan,rv,to);s.start(t,Math.random()*4,att+dec+.05);};
  const snare=(t,v)=>{t=loose(t,.006,.024);v*=rnd(.8,1.05);noiseHit(t,'bandpass',1400,.8,.005,.16,.05*v,.05,.25,drumBus); /* laid back, a touch late */const o=a.createOscillator(),g=a.createGain();o.frequency.value=190;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.04*v,t+.003);g.gain.exponentialRampToValueAtTime(.001,t+.09);o.connect(g);out(g,.05,.2,drumBus);o.start(t);o.stop(t+.12);};
  const hat=(t,v)=>noiseHit(loose(t,-.012,.012),'highpass',6500,.7,.003,.03,.015*v*rnd(.6,1.1),.25,0,drumBus);
  const brush=(t,v,long)=>noiseHit(loose(t,-.01,.015),'bandpass',2800,.9,long?.07:.025,long?.32:.12,.026*v*rnd(.75,1.1),-.15,.3,drumBus);
  const bell=(t,m,v)=>{keyHit(a,t,m);const f=mtof(m),c=osc('sine',f,t),md=osc('sine',f*3.5,t),mg=a.createGain(),g=a.createGain();mg.gain.setValueAtTime(f*2*v,t);mg.gain.exponentialRampToValueAtTime(f*.05,t+2);md.connect(mg).connect(c.frequency);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035*v,t+.01);g.gain.exponentialRampToValueAtTime(.0005,t+4.5);c.connect(g);out(g,rnd(-.5,.5),1.4);c.start(t);md.start(t);c.stop(t+4.6);md.stop(t+4.6);};
  const lead=(t,m,dur,v)=>{keyHit(a,t,m);const o=osc('triangle',mtof(m),t),f=a.createBiquadFilter(),g=a.createGain();f.type='lowpass';f.frequency.value=1300;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045*v,t+.08);g.gain.setTargetAtTime(0,t+dur,.25);
    o.connect(f).connect(g);out(g,.2,.8);o.start(t);o.stop(t+dur+1.5);};
  const pluck=(t,m,v,cut)=>{keyHit(a,t,m);const o=osc('square',mtof(m),t),f=a.createBiquadFilter(),g=a.createGain();f.type='lowpass';f.Q.value=2;f.frequency.setValueAtTime(cut*1.8,t);f.frequency.exponentialRampToValueAtTime(cut*.5,t+.25);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.02*v,t+.004);g.gain.exponentialRampToValueAtTime(.0005,t+.35);o.connect(f).connect(g);out(g,rnd(-.3,.3),.5);o.start(t);o.stop(t+.4);};
  const blip=(t,m)=>{const o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=mtof(m);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.006,t+.003);g.gain.setValueAtTime(.006,t+.05);g.gain.linearRampToValueAtTime(0,t+.06);o.connect(g);out(g,rnd(-.6,.6),.6);o.start(t);o.stop(t+.08);};
  const cricket=(t)=>{const f=rnd(4300,4900),n=2+Math.floor(Math.random()*3),pan=rnd(-.8,.8);for(let i=0;i<n;i++){const tt=t+i*.11,o=a.createOscillator(),am=a.createOscillator(),ag=a.createGain(),g=a.createGain();o.frequency.value=f;am.frequency.value=rnd(16,20);
    am.connect(ag.gain);ag.gain.value=0;g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.004,tt+.025);g.gain.linearRampToValueAtTime(0,tt+.08);o.connect(ag).connect(g);out(g,pan,.6);o.start(tt);am.start(tt);o.stop(tt+.09);am.stop(tt+.09);}};
  /* bed layers: tape hiss, and for some stations rain or a purr underneath */
  if(st.hiss){const h=a.createBufferSource();h.buffer=white;h.loop=true;const hf=a.createBiquadFilter();hfx=hf;hf.type='bandpass';hf.frequency.value=st.hissF||5000;hf.Q.value=.5;hg=a.createGain();hg.gain.value=.006*st.hiss;h.connect(hf).connect(hg).connect(dest);h.start();srcs.push(h);}
  const layers=[];const layerBus=g=>{const lg=a.createGain();lg.gain.value=g;lg.connect(dest);return lg;};
  if(st.rain){const r=SOUNDS['gen:rain'](a,layerBus(st.rain));srcs.push(...r.src);layers.push(r);}
  if(st.purr){const p=SOUNDS['gen:purr'](a,layerBus(st.purr));srcs.push(...p.src);layers.push(p);}
  if(st.waves){const w=SOUNDS['gen:waves'](a,layerBus(st.waves));srcs.push(...w.src);layers.push(w);}
  if(st.fire){const f=SOUNDS['gen:fire'](a,layerBus(st.fire));srcs.push(...f.src);layers.push(f);}
  /* the conductor */
  const key=48+choose([0,2,3,5,7,8,10]);let bpm=rnd(...st.bpm),beat=60/bpm,t=a.currentTime+.4,prog=choose(PROGS[st.prog]),ci=0,bar=0,section='intro',secLeft=2,phrases=0,prevV=null,kickPat=choose([[0,10],[0,7,10],[0,10,14]]),melodyRest=0;if(st.tape){section=st.drumsAlways?'groove':'melody';secLeft=1;} /* a mixtape skips the long intro, so the sliders have something to change straight away */;
  const voice=(root,type)=>{let ns=CH[type].map(i=>key+root+i);ns=ns.map(n=>{while(n<53)n+=12;while(n>71)n-=12;return n;}).sort((x,y)=>x-y);
    if(prevV){const avg=prevV.reduce((s,x)=>s+x,0)/prevV.length,a2=ns.reduce((s,x)=>s+x,0)/ns.length;if(a2-avg>4)ns=ns.map((n,i)=>i===ns.length-1?n-12:n).sort((x,y)=>x-y);else if(avg-a2>4)ns=ns.map((n,i)=>i===0?n+12:n).sort((x,y)=>x-y);}
    prevV=ns;return ns;};
  const PENT=[0,2,4,7,9];const melNote=(root)=>{const deg=choose(PENT);let m=key+deg+24;if(Math.random()<.4)m=key+root+choose([0,4,7])+24;while(m>81)m-=12;while(m<67)m+=12;return m;};
  /* each station has its own way of playing a tune, so you can tell them apart within a few seconds */
  const inRange=(m,lo,hi)=>{while(m>hi)m-=12;while(m<lo)m+=12;return m;};let motif=null;
  const phrase=(b0,root,sw)=>{const p=st.phrase;
    if(p==='motif'){ /* Late Shift: a little motif built on the chord's 9th and 7th, repeated and moved with the chords, played just behind the beat */
      if(motif&&Math.random()<.3){const m=motif[Math.floor(Math.random()*motif.length)];m.tone=choose([14,11,7,4,9,2].filter(x=>x!==m.tone));} /* one note changes */
      if(!motif||Math.random()<.3){motif=[];let i=choose([0,2,4]);const n=3+Math.floor(Math.random()*2);for(let k=0;k<n;k++){motif.push({i,tone:choose([14,11,7,4,14,9]),d:choose([.5,1,1.5])});i+=choose([2,2,3,4]);}}
      for(const nt of motif)if(nt.i<16)ep(sw(nt.i)+.03,inRange(key+root+nt.tone+24,67,81),beat*nt.d,rnd(.4,.58));}
    else if(p==='sparse'){ /* Rainy Window: one or two long, suspended notes that don't quite resolve */
      const n=Math.random()<.6?1:2;let i=choose([0,4,8]);for(let k=0;k<n&&i<16;k++){lead(sw(i),inRange(key+root+choose([2,5,7,14,17]),62,76),beat*rnd(2.5,4),rnd(.55,.8));i+=8;}}
    else if(p==='approach'){ /* Sunday Loaf: little two-note figures, each chord tone approached from a half step below */
      let i=choose([0,2,4]);const n=2+Math.floor(Math.random()*2);for(let k=0;k<n&&i<15;k++){const t=inRange(key+root+choose([4,7,10,14,9]),66,80);ep(sw(i),t-1,beat*.25,rnd(.3,.42));ep(sw(i+1),t,beat*choose([.75,1.25]),rnd(.42,.58));i+=choose([4,5,6]);}}
    else if(p==='wide'){ /* Desert Night: a bell or two in open fifths and octaves, then a lot of silence */
      const base=key+root+24;bell(sw(choose([0,4,8])),inRange(base,60,76),rnd(.5,.75));if(Math.random()<.5)bell(sw(12),inRange(base+choose([7,12,19]),64,84),rnd(.35,.55));}
    else{let i=choose([0,2,4,6]);const n=2+Math.floor(Math.random()*4);for(let k=0;k<n&&i<16;k++){const m=melNote(root),d=beat*choose([.5,.5,1,1.5]);ep(sw(i),m,d,rnd(.4,.6));i+=choose([2,2,3,4]);}}};
  let pending=null,drumsWere=false;
  const pickSection=()=>{const order={intro:['groove','keys'],keys:['groove','melody'],groove:['melody','groove','keys'],melody:['groove','break','keys'],break:['groove','keys']};let n=choose(order[section]);if(st.drums==='none'&&n==='groove')n='keys';return n;};
  const nextSection=()=>{phrases++;if(phrases%6===0&&Math.random()<.6)prog=choose(PROGS[st.prog]);
    section=pending||pickSection();pending=null;
    secLeft=section==='break'?1:2+Math.floor(Math.random()*2);if(Math.random()<.3)kickPat=choose([[0,10],[0,7,10],[0,10,14],[0,6,10]]);};
  const barSlot=(b0)=>{ /* schedule one bar starting at b0 */
    const [root,type]=prog[ci],ns=voice(root,type),sw=i=>b0+i*beat/4+(i%2?st.swing*beat/2:0),firstBar=bar%st.bars===0,full=st.bars*4*beat;
    const drumsOn=st.drumsAlways?section!=='intro':section==='groove'||section==='melody',lastBar=secLeft===1&&ci===prog.length-1&&bar%st.bars===st.bars-1;
    if(drumsOn&&!drumsWere){drumBus.gain.cancelScheduledValues(b0);drumBus.gain.setValueAtTime(.2,b0);drumBus.gain.linearRampToValueAtTime(1,b0+8*beat);}
    if(lastBar){pending=pickSection();if(drumsOn&&!(pending==='groove'||pending==='melody')){drumBus.gain.setValueAtTime(1,b0);drumBus.gain.linearRampToValueAtTime(.35,b0+4*beat);}}
    drumsWere=drumsOn;const BZ=st.busy;const melOn=BZ!=null?(section!=='intro'&&BZ>.12&&(section==='melody'||Math.random()<BZ)):(section==='melody'||(section==='keys'&&Math.random()<.3));
    if(firstBar){if(st.pad&&section!=='groove'||st.pad>=.8)pad(b0,ns.slice(0,4),full,st.pad);
      if(st.keys==='ep'){const v=rnd(.55,.85),spread=rnd(.012,.03);ns.forEach((m,i)=>ep(b0+i*spread,m,full*rnd(.55,.9),v*(i?.85:1)));if(Math.random()<.4)ns.slice(-2).forEach((m,i)=>ep(sw(10)+i*.02,m,beat*1.5,v*.55));}
      if(st.bass&&section!=='intro')bass(b0,key+root-12-(key+root-12>47?12:0),beat*rnd(2.5,3.5),st.bass);}
    else{if(st.keys==='ep'&&Math.random()<(BZ!=null?BZ*.9:.35)){const v=rnd(.4,.6);ns.slice(-3).forEach((m,i)=>ep(sw(choose([2,6,8]))+i*.02,m,beat*1.2,v));}
      if(st.bass&&section!=='intro'&&Math.random()<(BZ!=null?.2+BZ*.8:.7))bass(sw(choose([0,8,10])),key+root-12-(key+root-12>47?12:0)+choose([0,0,7,12]),beat*1.4,st.bass*.85);}
    if(drumsOn){
      if(st.drums==='sparse'){kick(sw(0),.8);if(Math.random()<.5)kick(sw(kickPat[1]||10),.55);snare(sw(12),.75);if(Math.random()<.25)snare(sw(choose([7,15])),.22);for(let i=2;i<16;i+=(BZ!=null&&BZ>.6?2:4))if(Math.random()<(BZ!=null?.15+BZ*.8:st.hats))hat(sw(i),rnd(.5,1));}
      else if(st.drums==='four'){for(const i of [0,8])kick(sw(i),.7);snare(sw(4),.35);snare(sw(12),.5);for(let i=0;i<16;i+=2)if(Math.random()<st.hats)hat(sw(i),i%4?rnd(.4,.7):rnd(.7,1));}
      else if(st.drums==='brush'){for(let i=0;i<16;i+=4)brush(sw(i),rnd(.6,1),i%8===4);for(let i=2;i<16;i+=4)if(Math.random()<.6)brush(sw(i),rnd(.3,.5),false);if(Math.random()<.6)kick(sw(0),.4);}}
    else if(st.drums==='brush'&&section!=='intro'&&Math.random()<.5)for(let i=0;i<16;i+=8)brush(sw(i),.4,true);
    if(st.melody==='arp'&&section!=='intro'){const cut=900+700*Math.sin(b0/23);const seq=ns.concat([ns[0]+12,ns[1]+12]);for(let i=0;i<16;i++)if(BZ!=null?(i%(BZ<.33?4:2)===0||Math.random()<BZ*.6):(i%2===0||Math.random()<.5))pluck(sw(i),seq[(i+bar*3)%seq.length]+12,section==='break'?.5:rnd(.6,1),cut);}
    else if(melOn&&Math.random()<st.mel*.8){if(melodyRest>0)melodyRest--;else{phrase(b0,root,sw);if(BZ!=null&&BZ>.7&&Math.random()<.5)phrase(b0,root,sw);melodyRest=BZ!=null?(BZ>.5?0:choose([0,1,2])):choose([0,1,1,2]);}}
    if(st.blips&&Math.random()<.12)blip(sw(choose([3,7,11,15])),key+choose(PENT)+36);
    if(st.crickets&&Math.random()<.25)cricket(b0+rnd(0,full/st.bars));
    bar++;if(bar%st.bars===0){ci=(ci+1)%prog.length;if(ci===0){secLeft--;if(secLeft<=0)nextSection();}}};
  return {src:srcs,ahead:st.tape?3:8,tick(until){for(const l of layers)l.tick&&l.tick(until);while(t<until){barSlot(t);t+=4*beat;}},
    update(ns){const oldProg=st.prog;Object.assign(st,ns);bpm=(ns.bpm[0]+ns.bpm[1])/2;beat=60/bpm; /* tempo, busyness, tone, drums and mood change live while it plays */
      warm.frequency.setTargetAtTime(st.lp,a.currentTime,.08);warm2.frequency.setTargetAtTime(st.lp,a.currentTime,.08);if(hg)hg.gain.setTargetAtTime(.006*st.hiss,a.currentTime,.1);if(hfx&&st.hissF)hfx.frequency.setTargetAtTime(st.hissF,a.currentTime,.1);if(st.wobble)wowG.gain.setTargetAtTime(st.wobble,a.currentTime,.2);if(st.prog!==oldProg)prog=choose(PROGS[st.prog]);}};}
for(const s of MUSIC)SOUNDS[s.id]=(a,dest)=>music(a,dest,STYLES[s.id]);
/* ===== Mixtapes: a tiny four-track loop machine =====
   You pick the parts: drums, bass, keys and the atmosphere outside, and how fast. Loaf FM does the rest: the tape's name
   quietly picks the key, a mood, the chord changes and a little hook that comes back every eight bars; the bass follows
   the chords, the keys play in the beat's feel (offbeat guitar chops over house, fingerpicking over lo-fi), the drums get small
   fills, and every part is humanised. Vibes are only presets: one tap fills in all four tracks as a starting point. */
const DRUMS=['Soft','Lo-fi','House'],BASSES=['Warm','Deep','Synth'],KEYS=['Rhodes','Guitar','Pad','8-bit'],OUTSIDE=['Rain','Ocean','Fire','Purr'],SPEEDS=['Slow','Easy','Fast']; /* each layer: 0 is off */
const TAPE_LEVEL=.33; /* matched by measured loudness to the stations (see the README) */
const TEMPO=[[60,70,82],[68,78,88],[72,82,92],[112,120,126]],SWING=[[.1,.08,.06],[.12,.1,.08],[.16,.13,.09],[.1,.07,.04]]; /* by drums (off, soft, lo-fi, house), then pace */
Object.assign(CH,{maj:[0,4,7],min:[0,3,7],m7b5:[0,3,6,10],dim7:[0,3,6,9],dom7b9:[0,4,7,10,13],dom13:[0,4,10,14,21],six9:[0,4,7,9,14],m6:[0,3,7,9,14],maj7s11:[0,4,7,11,18],madd9:[0,3,7,14]});
const SCALE={ion:[0,2,4,5,7,9,11],aeo:[0,2,3,5,7,8,10],dor:[0,2,3,5,7,9,10],lyd:[0,2,4,6,7,9,11]};
/* the name picks one of three moods; each has a scale and a few progressions that suit every part ("root+chord" per bar) */
const HARMONY=[
  ['ion',['2m9 7dom9 0maj9 9m7','0maj7 9m9 2m7 7sus','5maj9 4m7 2m9 0maj7','5maj9 7dom9 4m7 9m9','0six9 9m7 2m9 7dom13']],
  ['aeo',['0m9 8maj7 3maj7 10sus','0m9 5m7 8maj9 7dom7b9','0m11 0m11 8maj9 10add9','0m9 3maj7 8maj7 7m7']],
  ['ion',['2m9 7dom7b9 0maj9 9dom7b9','4m7 3dim7 2m9 7dom13','0maj9 1dim7 2m9 7dom7b9','5maj9 5m6 0maj9 9dom7b9']]];
/* the recording: lo-fi drums get a cassette; everything else is clean */
const RECORDING=[
  {dr:.8,hp:25,l1:18000,l2:18000,sh:0,hi:0,wo:0,fl:0},
  {dr:2,hp:75,l1:6000,l2:8500,sh:3,hi:.016,wo:11,fl:3.5}];
function seeded(str){let h=2166136261;for(const ch of String(str))h=Math.imul(h^ch.charCodeAt(0),16777619);
  return ()=>{h=h+0x6D2B79F5|0;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
const parseProg=s=>s.split(' ').map(x=>{const m=x.match(/^(\d+)(\w+)$/);return [+m[1],m[2]];});
/* the hook: a little cell, the same cell moved a step, and a long note to land on, over two bars */
function makeHook(R){const pick=a=>a[Math.floor(R()*a.length)],cell=[];let p=pick([0,0,2,4]),d=pick([0,2,4,4,7]);const n=pick([2,3,3]);
  for(let i=0;i<n&&p<13;i++){const du=pick([2,2,2,3,4,4,6]);cell.push({p,d,du});p+=du;d=Math.max(-2,Math.min(9,d+pick([-2,-1,-1,1,1,2,3])));}
  const sh=pick([-1,1,2,-2]),hook=cell.slice();cell.forEach((c,i)=>{if(i<cell.length-1||R()<.5)hook.push({p:c.p+16,d:c.d+sh,du:c.du});});
  const last=hook[hook.length-1];hook.push({p:Math.min(last.p+last.du,28),d:pick([0,2,4,7]),du:6});return hook;}
const KSC=new Map(); /* plucked strings (Karplus-Strong), made once per note and kept */
function ksBuf(a,m,kind){const k=a.sampleRate+'|'+m+'|'+kind+'|'+Math.floor(Math.random()*3);let e=KSC.get(k);if(e)return e;if(KSC.size>160)KSC.clear(); /* three takes per note, so repeated strums aren't identical */
  const sr=a.sampleRate,f=mtof(m),N=Math.max(2,Math.floor(sr/f+.5)),thumb=kind==='thumb',len=Math.round(sr*(thumb?2.2:1.7)),T60=thumb?1.7:(m>64?1.1:1.5);
  const b=a.createBuffer(1,len,sr),d=b.getChannelData(0),buf=new Float32Array(N);let lp=0;const br=thumb?.22:.5;
  for(let i=0;i<N;i++){lp+=br*((Math.random()*2-1)-lp);buf[i]=lp;}
  const pp=Math.max(1,Math.round(N*(thumb?.22:.13))),ex=buf.slice();for(let i=0;i<N;i++)buf[i]=ex[i]-.7*ex[(i+N-pp)%N]; /* where the string is plucked */
  const g=Math.pow(10,-3/(T60*f));let idx=0,pk=0;
  for(let i=0;i<len;i++){const y=buf[idx],y2=buf[(idx+1)%N];d[i]=y;buf[idx]=g*.5*(y+y2);idx=(idx+1)%N;if(i<N*6)pk=Math.max(pk,Math.abs(y));}
  if(pk>0)for(let i=0;i<len;i++)d[i]*=.8/pk;
  e={b,rate:f*(N-.5)/sr};KSC.set(k,e);return e;} /* the averaging loop's period is N-0.5 samples */
function pulseWave(a,duty){a.__pw=a.__pw||{};if(a.__pw[duty])return a.__pw[duty];const n=40,re=new Float32Array(n),im=new Float32Array(n);
  for(let i=1;i<n;i++)re[i]=2/(i*Math.PI)*Math.sin(i*Math.PI*duty);return a.__pw[duty]=a.createPeriodicWave(re,im);}
let SATC=null;
function band(a,dest,tp0){const tp=cleanTape(tp0||{})||cleanTape({});
  const D=tp.d,BS=tp.b,KO=tp.k===0,K=tp.k-1,G=tp.p,IND=!!tp.i,chipKeys=K===3,chip=IND?tp.s===3:chipKeys,ambient=D===0&&(IND||K===2);
  /* K: 0 Rhodes, 1 guitar, 2 pad, 3 8-bit. Independent tapes (i, everything made since the layers got separate): the starting
     track alone sets the drums, groove and tempo (only the 8-bit start uses the chip kit), so 8-bit keys are just keys.
     Older tapes keep their sound: there 8-bit keys put the drums through a chip kit and speed things up. */
  /* the feel every part plays in: 0 free (no drums), 2 lo-fi (soft drums too), 3 house */
  const feel=D===0?0:D===3?3:2;
  /* the name picks the key, the mood, the changes and the hook */
  const SEEDSTR=tp.r?'seed:'+tp.r:'loaf:'+tp.n.toLowerCase().trim(),RN=seeded(SEEDSTR); /* the tape's own seed; older tapes use their name */const kpc=Math.floor(RN()*12),hook=makeHook(RN),M=Math.floor(RN()*3),pa=Math.floor(RN()*1e6),pb=Math.floor(RN()*1e6);
  const [scName,progStr]=HARMONY[M],SC=SCALE[scName],progs=progStr.map(parseProg),progA=progs[pa%progs.length],progB=progs.length>1?progs[(pa%progs.length+1+pb%(progs.length-1))%progs.length]:progA;
  const bpm=TEMPO[D][G]*(chip&&D<3?1.22:1),beat=60/bpm,step=beat/4,barDur=16*step,swing=SWING[D][G]*(chip?.4:1),bpc=ambient&&G<2?2:1,bright=[1,.85,.72][M],low=0;
  const white=makeNoise(a,3,'white'),srcs=[];
  /* signal chain: parts -> (pump) -> drive -> recording filters -> out; room and echo are recorded with the parts */
  const bq=(type,f,q)=>{const b=a.createBiquadFilter();b.type=type;b.frequency.value=f;if(q!=null)b.Q.value=q;return b;};
  const inG=a.createGain(),pump=a.createGain(),drumG=a.createGain(),drive=a.createGain(),sat=a.createWaveShaper(),post=a.createGain();
  if(!SATC){SATC=new Float32Array(2048);for(let i=0;i<2048;i++){const x=i/1023.5-1;SATC[i]=Math.tanh(1.4*x)/Math.tanh(1.4);}}sat.curve=SATC;
  const hp=bq('highpass',25,.7),lp1=bq('lowpass',18000,.5),lp2=bq('lowpass',18000,.6),shelf=bq('lowshelf',160);
  const comp=a.createDynamicsCompressor();comp.threshold.value=-22;comp.knee.value=10;comp.ratio.value=3;comp.attack.value=.02;comp.release.value=.3;
  const recOut=a.createGain(),wowD=a.createDelay(.1);wowD.delayTime.value=.008;inG.connect(pump).connect(drive);drumG.connect(drive);drive.connect(sat).connect(post).connect(wowD).connect(hp).connect(lp1).connect(lp2).connect(shelf).connect(comp).connect(recOut).connect(dest);
  const verb=makeVerb(a,ambient?5:2.6),wet=a.createGain(),send=a.createGain();send.connect(verb).connect(wet).connect(drive);wet.gain.value=ambient?.7:chip||(chipKeys&&!IND)?.06:.22;
  const dly=a.createDelay(2),dfb=a.createGain(),dlp=bq('lowpass',2600),dsend=a.createGain(),dwet=a.createGain();dly.delayTime.value=ambient?beat*1.5:step*3;dfb.gain.value=ambient?.45:.32;
  dsend.connect(dly);dly.connect(dlp).connect(dfb).connect(dly);dlp.connect(dwet).connect(drive);dwet.gain.value=1;
  const hs=a.createBufferSource();hs.buffer=white;hs.loop=true;const hbp=bq('bandpass',4800,.6),hiss=a.createGain();hs.connect(hbp).connect(hiss).connect(recOut);hs.start();srcs.push(hs);
  const wowO=a.createOscillator(),wowG=a.createGain(),flO=a.createOscillator(),flG=a.createGain();wowO.frequency.value=.48;flO.frequency.value=6.3;
  wowO.connect(wowG).connect(wowD.delayTime);flO.connect(flG).connect(wowD.delayTime);wowO.start();flO.start();srcs.push(wowO,flO);
  const cents2s=(c,f)=>c/1731/(2*Math.PI*f);
  { const r=RECORDING[D===2&&!chip?1:0];drive.gain.value=r.dr;post.gain.value=1/Math.pow(r.dr,.85);hp.frequency.value=r.hp;lp1.frequency.value=r.l1;lp2.frequency.value=r.l2;shelf.gain.value=r.sh;hiss.gain.value=r.hi;wowG.gain.value=cents2s(r.wo,.48);flG.gain.value=cents2s(r.fl,6.3);
    recOut.gain.value=Math.pow(10,((D===0?2.5:0)+(BS===0?3.5:0)+(KO?3:0)-(ambient?3:0))/20);} /* fewer parts, a little make-up gain, so taking the drums out doesn't make it vanish */
  const trem=a.createOscillator();trem.frequency.value=2.3;const tremG=a.createGain();tremG.gain.value=.07;trem.connect(tremG);trem.start();srcs.push(trem);
  const epBus=a.createGain();epBus.gain.value=1;tremG.connect(epBus.gain);epBus.connect(inG); /* the electric piano's tremolo, once for all its notes */
  /* atmosphere happens in your room, not on the tape */
  const layers=[];const lay=(id,g)=>{const lg=a.createGain();lg.gain.value=g*.63/TAPE_LEVEL; /* as loud as on the stations */lg.connect(dest);const l=SOUNDS[id](a,lg);srcs.push(...l.src);layers.push(l);};
  if(tp.w===1)lay('gen:rain',.5);if(tp.w===2)lay('gen:waves',.45);if(tp.w===3)lay('gen:fire',.35);if(tp.w===4)lay('gen:purr',.2);
  /* helpers */
  const now0=()=>a.currentTime;const loose=(t,lo,hi)=>Math.max(now0(),t+rnd(lo,hi));
  const out=(node,pan,rv,dl,to)=>{let n=node;if(a.createStereoPanner&&pan){const p=a.createStereoPanner();p.pan.value=pan;n.connect(p);n=p;}n.connect(to||inG);
    if(rv){const s=a.createGain();s.gain.value=rv;n.connect(s).connect(send);}if(dl){const s=a.createGain();s.gain.value=dl;n.connect(s).connect(dsend);}};
  const osc=(type,f,t)=>{const o=a.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);return o;};
  const noise=(t,type,fq,q,att,dec,lvl,pan,rv,to)=>{const s=a.createBufferSource();s.buffer=white;const f=bq(type,fq,q);const g=a.createGain();
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(lvl,t+att);g.gain.exponentialRampToValueAtTime(.0004,t+att+dec);s.connect(f).connect(g);out(g,pan,rv,0,to);s.start(t,Math.random()*2,att+dec+.05);};
  /* ---- instruments ---- */
  const ep=(t,m,dur,vel,pan,rv,dl)=>{keyHit(a,t,m);const f=mtof(m),c=osc('sine',f,t),md=osc('sine',f,t),mg=a.createGain(),g=a.createGain(),tg=a.createGain();
    mg.gain.setValueAtTime(f*1.05*vel*bright,t);mg.gain.exponentialRampToValueAtTime(f*.08,t+.9);md.connect(mg).connect(c.frequency);const c2=osc('sine',f,t);c2.detune.setValueAtTime(rnd(5,9),t);const g2=a.createGain();g2.gain.value=.35;c2.connect(g2);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09*vel,t+.006);g.gain.setTargetAtTime(.035*vel,t+.01,.5);g.gain.setTargetAtTime(0,t+dur,.35);
    c.connect(g).connect(tg);g2.connect(g);out(tg,pan!=null?pan:(m-62)/30,rv!=null?rv:.6,dl||0,epBus);const e=t+dur+2;c.start(t);md.start(t);c2.start(t);c.stop(e);md.stop(e);c2.stop(e);};
  const pad=(t,ms,dur,lvl,att,wave)=>{const g=a.createGain(),f=bq('lowpass',400*bright,.4);att=att||Math.min(2.5,dur*.4);
    f.frequency.setValueAtTime(380*bright,t);f.frequency.linearRampToValueAtTime(1100*bright,t+dur*.5);f.frequency.linearRampToValueAtTime(600*bright,t+dur+att);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.022*lvl,t+att);g.gain.setValueAtTime(.022*lvl,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+att);f.connect(g);out(g,0,.9);
    for(const m of ms){keyHit(a,t,m);for(const d of [-7,7]){const o=osc(wave||'sawtooth',mtof(m),t);o.detune.setValueAtTime(d,t);o.connect(f);o.start(t);o.stop(t+dur+att+.1);}}};
  const bassLo=(t,m,dur,lvl)=>{keyHit(a,t,m);const o=osc('sine',mtof(m),t),o2=osc('triangle',mtof(m),t),g=a.createGain(),g2=a.createGain();g2.gain.value=.25;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16*lvl,t+.02);g.gain.setTargetAtTime(.09*lvl,t+.05,.4);g.gain.setTargetAtTime(0,t+dur,.12);o.connect(g);o2.connect(g2).connect(g);out(g,0,0);o.start(t);o2.start(t);o.stop(t+dur+1);o2.stop(t+dur+1);};
  const sub=(t,m,dur,lvl)=>{keyHit(a,t,m);const o=osc('sine',mtof(m),t),o2=osc('triangle',mtof(m),t),g=a.createGain(),g2=a.createGain();g2.gain.value=.18;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.2*lvl,t+.008);g.gain.setTargetAtTime(.15*lvl,t+.02,.15);g.gain.setTargetAtTime(0,t+dur,.03);o.connect(g);o2.connect(g2).connect(g);out(g,0,0);o.start(t);o2.start(t);o.stop(t+dur+.4);o2.stop(t+dur+.4);};
  const sbass=(t,m,dur,lvl)=>{keyHit(a,t,m);const f=bq('lowpass',900,4),g=a.createGain(); /* a little analog synth bass: saw and square through a plucky filter */
    f.frequency.setValueAtTime(1400*bright,t);f.frequency.exponentialRampToValueAtTime(260,t+Math.min(.25,dur));g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.11*lvl,t+.005);g.gain.setTargetAtTime(.07*lvl,t+.02,.12);g.gain.setTargetAtTime(0,t+dur,.03);f.connect(g);out(g,0,.05);
    for(const [ty,dt] of [['sawtooth',-6],['square',6]]){const o=osc(ty,mtof(m),t);o.detune.setValueAtTime(dt,t);o.connect(f);o.start(t);o.stop(t+dur+.3);}};
  const gtrBus=a.createGain(),gtrF=bq('lowpass',3600*bright,.5),gtrB=bq('peaking',220,1);gtrB.gain.value=3;gtrBus.connect(gtrB).connect(gtrF);out(gtrF,-.18,.35);
  const thumbBus=a.createGain(),thumbF=bq('lowpass',1100,.5);thumbBus.connect(thumbF);out(thumbF,0,.05);
  const string=(t,m,v,dur,kind)=>{keyHit(a,t,m);const k=ksBuf(a,m,kind),s=a.createBufferSource();s.buffer=k.b;s.playbackRate.value=k.rate;const g=a.createGain();
    g.gain.setValueAtTime(v,t);g.gain.setTargetAtTime(0,t+dur,kind==='thumb'?.06:.04);s.connect(g).connect(kind==='thumb'?thumbBus:gtrBus);s.start(t);s.stop(t+Math.min(dur+.5,k.b.duration));};
  const mallet=(t,m,v,len,rv,dl)=>{keyHit(a,t,m);const f=mtof(m),c=osc('sine',f,t),md=osc('sine',f*2,t),mg=a.createGain(),g=a.createGain();len=len||1.4;
    mg.gain.setValueAtTime(f*1.3*v*bright,t);mg.gain.exponentialRampToValueAtTime(f*.05,t+.35);md.connect(mg).connect(c.frequency);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05*v,t+.005);g.gain.exponentialRampToValueAtTime(.0004,t+len);c.connect(g);out(g,rnd(-.3,.3),rv!=null?rv:.5,dl!=null?dl:.35);c.start(t);md.start(t);c.stop(t+len+.1);md.stop(t+len+.1);};
  const glass=(t,m,v)=>{keyHit(a,t,m);const f=mtof(m),c=osc('sine',f,t),c2=osc('sine',f*2.01,t),g=a.createGain(),g2=a.createGain();g2.gain.value=.15;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045*v,t+.012);g.gain.exponentialRampToValueAtTime(.0004,t+5);c.connect(g);c2.connect(g2).connect(g);out(g,rnd(-.45,.45),1.1,.2);c.start(t);c2.start(t);c.stop(t+5.1);c2.stop(t+5.1);};
  const drone=(t,m,dur,lvl)=>{const g=a.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.03*lvl,t+dur*.4);g.gain.linearRampToValueAtTime(0,t+dur+1.5);out(g,0,.5);
    for(const [mm,k] of [[m,1],[m+7,.4],[m+12,.25]]){const o=osc('sine',mtof(mm),t),gg=a.createGain();gg.gain.value=k;o.connect(gg).connect(g);o.start(t);o.stop(t+dur+1.6);}};
  const pulse=(t,m,dur,v,duty,vibr,pan)=>{if(v>.2)keyHit(a,t,m);const o=osc('sine',mtof(m),t);o.setPeriodicWave(pulseWave(a,duty));const g=a.createGain();
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05*v,t+.003);g.gain.setValueAtTime(.05*v,t+Math.max(.004,dur*.3));g.gain.linearRampToValueAtTime(.038*v,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+.015);
    if(vibr&&dur>.25){const lf=a.createOscillator(),lg=a.createGain();lf.frequency.value=6;lg.gain.setValueAtTime(0,t);lg.gain.setValueAtTime(0,t+.15);lg.gain.linearRampToValueAtTime(18,t+.3);lf.connect(lg).connect(o.detune);lf.start(t);lf.stop(t+dur+.05);}
    o.connect(g);out(g,pan||0,.05);o.start(t);o.stop(t+dur+.05);};
  const tri=(t,m,dur,v)=>{keyHit(a,t,m);const o=osc('triangle',mtof(m),t),g=a.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16*v,t+.003);g.gain.setValueAtTime(.16*v,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+.01);o.connect(g);out(g,0,0);o.start(t);o.stop(t+dur+.03);};
  /* drums (to the drum bus, which the house pump leaves alone); with 8-bit keys the same patterns play on chip drums */
  const crunch=(()=>{const n=Math.round(a.sampleRate*.5),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);let h=0;for(let i=0;i<n;i++){if(i%6===0)h=Math.random()<.5?-1:1;d[i]=h;}return b;})(); /* stepped noise, like an old sound chip */
  const cnoise=(t,fq,dec,lvl)=>{const s=a.createBufferSource();s.buffer=crunch;const f=bq('highpass',fq,.5),g=a.createGain();g.gain.setValueAtTime(lvl,t);g.gain.exponentialRampToValueAtTime(.0004,t+dec);s.connect(f).connect(g);out(g,0,.03,0,drumG);s.start(t,Math.random()*.4,dec+.02);};
  const ckick=(t,v)=>{const o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(40,t+.07);g.gain.setValueAtTime(.3*v,t);g.gain.linearRampToValueAtTime(0,t+.11);o.connect(g);out(g,0,0,0,drumG);o.start(t);o.stop(t+.12);};
  const hits=[],logHit=(ch,t)=>{hits.push(ch,t);if(hits.length>600)hits.splice(0,300);}; /* what plays when: the deck's pattern display reads this */
  const kick=(t,v)=>{logHit('bd',t);if(chip)return ckick(t,v);t=loose(t,-.006,.008);v*=rnd(.88,1.04);const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.26*v,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+.38);o.connect(g);out(g,0,0,0,drumG);o.start(t);o.stop(t+.45);};
  const hkick=(t,v)=>{logHit('bd',t);if(pumpDepth){pump.gain.setValueAtTime(1,t);pump.gain.linearRampToValueAtTime(1-pumpDepth,t+.012);pump.gain.linearRampToValueAtTime(1,t+beat*.8);}if(chip)return ckick(t,v);
    const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(48,t+.09);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.34*v,t+.003);g.gain.exponentialRampToValueAtTime(.12*v,t+.12);g.gain.exponentialRampToValueAtTime(.001,t+.42);o.connect(g);out(g,0,0,0,drumG);o.start(t);o.stop(t+.45);};
  const snare=(t,v)=>{logHit('sd',t);if(chip)return cnoise(t,1200,.11,.05*v);t=loose(t,.006,.022);v*=rnd(.82,1.04);noise(t,'bandpass',1400,.8,.005,.16,.05*v,.05,.25,drumG);const o=a.createOscillator(),g=a.createGain();o.frequency.value=190;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.04*v,t+.003);g.gain.exponentialRampToValueAtTime(.001,t+.09);o.connect(g);out(g,.05,.2,0,drumG);o.start(t);o.stop(t+.12);};
  const hat=(t,v,open)=>{logHit('hh',t);if(chip)return cnoise(t,7000,open?.09:.03,.02*v);noise(loose(t,-.008,.008),'highpass',open?7000:7600,.7,.003,open?.2:.035,(open?.02:.016)*v*rnd(.7,1.1),.22,open?.15:0,drumG);};
  const shaker=(t,v)=>{logHit('hh',t);if(chip)return cnoise(t,6000,.025,.012*v);noise(loose(t,-.006,.006),'bandpass',5600,1.1,.012,.05,.012*v*rnd(.7,1.1),-.25,.1,drumG);};
  const rim=(t,v)=>{logHit('sd',t);if(chip)return cnoise(t,2500,.02,.035*v);t=loose(t,-.004,.006);noise(t,'bandpass',2100,3,.001,.03,.05*v,.18,.15,drumG);const o=a.createOscillator(),g=a.createGain();o.frequency.value=440;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.03*v,t+.001);g.gain.exponentialRampToValueAtTime(.001,t+.045);o.connect(g);out(g,.18,.1,0,drumG);o.start(t);o.stop(t+.06);};
  const clap=(t,v)=>{logHit('sd',t);if(chip)return cnoise(t,1500,.09,.045*v);for(let i=0;i<3;i++)noise(t+i*.011,'bandpass',1150,1,.002,i<2?.012:.16,.045*v,-.05,.35,drumG);};
  const brush=(t,v,long)=>{logHit('hh',t);if(chip)return cnoise(t,3000,long?.12:.04,.02*v);noise(loose(t,-.01,.012),'bandpass',2800,.9,long?.07:.025,long?.32:.12,.026*v*rnd(.75,1.1),-.15,.3,drumG);};
  /* ---- harmony and melody ---- */
  const tonicNear=c=>kpc+12*Math.round((c-kpc)/12);
  const chordAt=bi=>{const p=((bi%32)+32)%32,pr=p>=16?progB:progA;return pr[Math.floor((p%16)/bpc)%pr.length];};
  const pcsOf=ch=>CH[ch[1]].map(i=>(kpc+ch[0]+i)%12);
  const prevV={};
  const tight=ns=>ns.some((n,i)=>i&&n-ns[i-1]<2); /* a minor second inside a voicing sounds like a wrong note */
  const voice=(id,ch,lo,hi,rootless)=>{lo+=low;hi+=low;let iv=CH[ch[1]];if(rootless&&iv.length>=4)iv=iv.slice(1);
    let b=kpc+ch[0]+iv[0];while(b<lo)b+=12;while(b-12>=lo&&b+iv[iv.length-1]-iv[0]>hi)b-=12;
    let ns=iv.map(i=>b-iv[0]+i);const pv=prevV[id];
    if(pv){const mean=x=>x.reduce((s,y)=>s+y,0)/x.length,av=mean(pv);for(let k=0;k<2;k++){const a2=mean(ns);let c=null;
        if(a2-av>4)c=[ns[ns.length-1]-12,...ns.slice(0,-1)];else if(av-a2>4)c=[...ns.slice(1),ns[0]+12];
        if(!c)break;c.sort((x,y)=>x-y);if(tight(c)||c[0]<lo-2||c[c.length-1]>hi+4)break;ns=c;}}
    prevV[id]=ns;return ns;};
  const rootOf=(ch,lo,hi)=>{let n=kpc+ch[0];while(n<lo)n+=12;while(n>hi)n-=12;return n;};
  const degNote=(d,center)=>{const T=tonicNear(center+low),o=Math.floor(d/7);return T+SC[((d%7)+7)%7]+12*o;};
  const fit=(m,ch,strong)=>{const pcs=pcsOf(ch),pc=((m%12)+12)%12;if(pcs.includes(pc))return m;
    const clash=pcs.some(c=>(pc-c+12)%12===1||(c-pc+12)%12===1);if(!strong&&!clash&&SC.map(s=>(s+kpc)%12).includes(pc))return m;
    for(const dd of [-1,1,-2,2,-3,3])if(pcs.includes((((m+dd)%12)+12)%12))return m+dd;return m;};
  const st=(b0,i)=>b0+i*step+(i%2?swing*beat/2:0);
  /* the hook, played by the keys, and little phrases made from it in between */
  const LEAD=KO?null:[{c:74,play:(t,m,d,v)=>ep(t+.025,m,d,v*.62,.15,.6,.08)},{c:72,play:(t,m,d,v)=>string(t,m,.42*v,Math.max(d,step*2),'nyl')},{c:76,play:(t,m,d,v)=>glass(t,m,v)},{c:76,play:(t,m,d,v)=>{pulse(t,m,d*.92,v,.25,true,.1);pulse(t+3*step,m,d*.8,v*.32,.25,false,-.3);}}][K];
  const playNotes=(b0,bi,notes,vel)=>{for(const h of notes){const off=Math.floor(h.p/16),pp=h.p%16;let t=st(b0+off*barDur,pp);
      const ch=chordAt(bi+off),m=fit(degNote(h.d,LEAD.c),ch,pp%4===0);LEAD.play(t,m,Math.max(step,h.du*step*(chip?.9:1)),vel*rnd(.88,1.05));
      if(K===0&&h.du>=4&&Math.random()<.2)LEAD.play(t-step*.5,m-1,step*.4,vel*.5);}}; /* now and then a grace note from below */
  const riff=(b0,bi,hook)=>{const k=1+Math.floor(Math.random()*Math.min(3,hook.length-1)),s0=Math.floor(Math.random()*(hook.length-k)),tr=choose([-2,-1,0,1,2,3]),sh=choose([0,0,2,-2,4]);
    const ns=hook.slice(s0,s0+k).map(h=>({p:((h.p%16)-(hook[s0].p%16)+choose([0,4,8])+sh+16)%16,d:h.d+tr,du:Math.min(h.du,4)})).filter(h=>h.p<15).sort((x,y)=>x.p-y.p);
    playNotes(b0,bi,ns,.8);};
  const improv=[.2,.35,.5][G]*(ambient?.35:1);let hookB=null,hookN=0;
  const tStart=a.currentTime+.25;let bar=0,t=tStart,pumpDepth=D===3&&!chip?[.12,.18,.25][G]:0;
  function barSlot(b0){const bi=bar,p32=bi%32,ch=chordAt(bi),nx=chordAt(bi+1),bd=D>0&&bi>=24&&p32>=24&&p32<28,full=barDur;
    const fill=D>0&&!bd&&(p32===15||p32===31||p32===23)&&Math.random()<.8; /* a little fill going into the next section */
    /* ---- DRUMS ---- */
    if(D>0&&!bd){
      if(D===1){ /* soft: a gentle kick, a rim click on 2 and 4, brushes and a shaker */
        kick(st(b0,0),.6);if(G>=1&&Math.random()<.7)kick(st(b0,10),.42);rim(st(b0,4),.5);rim(st(b0,12),.55);
        for(let i=0;i<16;i+=(G===2?2:4))brush(st(b0,i),i%8===4?.7:.45,i%8===4);if(G>=1)for(let i=2;i<16;i+=(G===2?2:4))shaker(st(b0,i),.55);
        if(fill)for(const i of [13,14,15])rim(st(b0,i),.35+.1*(i-13));}
      else if(D===2){ /* lo-fi: lazy boom-bap with a cassette on it */
        kick(st(b0,0),.85);if(G===0){if(Math.random()<.6)kick(st(b0,10),.5);}else{kick(st(b0,10),.6);if(G===2||Math.random()<.3)kick(st(b0,7),.45);}
        snare(st(b0,4),G===0?.55:.8);snare(st(b0,12),G===0?.6:.85);if(G>0&&Math.random()<.3)snare(st(b0,choose([7,15])),.2);
        const hs=G===0?4:G===1?2:1;for(let i=0;i<16;i+=hs)hat(st(b0,i),(i%4===0?1:.6)*(G===0?.5:.8));
        if(fill){snare(st(b0,14),.45);snare(st(b0,15),.6);}}
      else{ /* house: four on the floor, claps, offbeat open hats, a shaker */
        for(const i of [0,4,8,12])hkick(st(b0,i),G===0?.85:1);if(G===0){rim(st(b0,4),.55);rim(st(b0,12),.6);}else{clap(st(b0,4),[.4,.55,.65][G]);clap(st(b0,12),[.45,.6,.7][G]);}
        for(const i of [2,6,10,14])hat(st(b0,i),[.25,.35,.4][G],true);if(G>=1)for(let i=0;i<16;i++)if(G===2?i%4!==2:true)(G===2?hat:shaker)(st(b0,i),i%2?.4:.65);
        if(fill)clap(st(b0,15),.4);}}
    else if(bd)for(let i=2;i<16;i+=4)hat(st(b0,i),.35,D===3);
    /* ---- BASS: follows the chords, in the drums' feel ---- */
    if(BS>0&&!bd){const lo=BS===2?33:36,r=rootOf(ch,lo,lo+11),r5=r+7>lo+16?r-5:r+7,nr=rootOf(nx,lo,lo+11);
      const play=(i,m,len,v)=>{const tt=st(b0,i),dur=len*step;logHit('bs',tt);if(BS===1)bassLo(tt,m,dur,v);else if(BS===2)sub(tt,m,dur,v);else if(chip||(chipKeys&&!IND))tri(tt,m+12,dur*.9,v*.9);else sbass(tt,m+12,dur,v);};
      let pat;
      if(feel===0)pat=G===2?[[0,r,7],[8,r5,7]]:[[0,r,15*bpc]];
      else if(feel===2){pat=[[0,r,G===0?10:6]];if(G>=1&&Math.random()<.75)pat.push([10,choose([r,r5,r+12]),4]);if(G===2){if(Math.random()<.5)pat.push([7,r,2]);pat.push([14,nr+choose([-1,2,0]),2]);}}
      else pat=[[[2,r,5],[10,r,5]],[[2,r,2.2],[6,r+12,1.5],[10,r,2.2],[13,r,1.5]],[[2,r,1],[3,r+12,.9],[6,r,1.5],[10,r,1],[11,r+12,.9],[14,choose([r+7,r+10]),1.5]]][G];
      if(feel===0&&bpc===2&&bi%2)pat=[];
      for(const [i,m,len] of pat)play(i,m,len,1);}
    /* ---- KEYS: chords in the drums' feel (and the hook, below) ---- */
    if(KO){}
    else if(K===0){ /* Rhodes */
      const ns=voice('ep',ch,53,72),v=rnd(.5,.7);
      if(feel===3){ns.forEach((m,i)=>ep(b0+i*.012,m,full*(G===0?.95:.45),rnd(.5,.62),null,.5,.1));if(G>=1)ns.slice(-3).forEach((m,i)=>ep(st(b0,10)+i*.01,m,beat*.8,.45,null,.4,.2));if(G===2)ns.slice(-3).forEach((m,i)=>ep(st(b0,14)+i*.01,m,beat*.5,.4,null,.4,.2));}
      else{if(bi%bpc===0)ns.forEach((m,i)=>ep(b0+i*rnd(.012,.03),m,full*bpc*rnd(.6,.9),v*(i?.85:1)));
        if(feel===2&&G===1&&Math.random()<.45)ns.slice(-3).forEach((m,i)=>ep(st(b0,10)+i*.02,m,beat*1.2,v*.55));
        if(feel===2&&G===2)for(const i of [6,10,14])if(Math.random()<.55)ns.slice(-3).forEach((m,j)=>ep(st(b0,i)+j*.015,m,beat*.6,v*.5));
        if(feel===0&&bi%bpc===0)pad(b0,voice('pd',ch,48,67),full*bpc,.45);}}
    else if(K===1){ /* nylon guitar */
      const strum=(i,c,len,acc)=>{const ns=voice('g',c,52,69,true);ns.forEach((m,j)=>string(st(b0,i)+j*rnd(.008,.014),m,(.22+.08*Math.random())*acc*(j?.9:1),len,'nyl'));};
      if(feel===3){for(const i of [2,6,10,14])strum(i,ch,step*1.2,.85);if(G===2)for(const i of [3,11])strum(i,ch,step*.8,.5);} /* offbeat chops */
      else{const ns=voice('g',ch,48,72,false),seq=ns.concat(ns.slice(1,-1).reverse());const every=G===0?4:2;for(let i=0,k=0;i<16;i+=every,k++)string(st(b0,i),seq[k%seq.length],.26+.06*Math.random(),step*every*2,'nyl');if(feel===2)strum(0,ch,step*3,.6);}} /* fingerpicking */
    else if(K===2){ /* pad */
      if(bi%bpc===0){pad(b0,voice('pd',ch,48,67),full*bpc,D>0?.7:1,D>0?.6:3.5,M===0?'triangle':'sawtooth');if(ambient)drone(b0,rootOf(ch,31,43),full*bpc,1);}
      const ns=voice('gl',ch,67,84),n=ambient?[1,1,2][G]:G;for(let k=0;k<n;k++)if(Math.random()<(ambient?.6:.35))glass(st(b0,choose([0,4,8,12])+k*2),choose(ns),rnd(.35,.6));
      if(ambient&&Math.random()<.1)mallet(st(b0,choose([2,6,10])),choose(ns)+12,.35,3,1.2,.4);}
    else{ /* 8-bit arpeggios */
      const tr=voice('ar',ch,60,76),seq=tr.concat([tr[0]+12]);const ar=G===0||feel===0?2:1;
      for(let i=0;i<16;i+=ar){const k=G===2?[0,1,2,3,2,1][i%6]:i/ar;pulse(st(b0,i),seq[k%seq.length],step*ar*.85,ar===2?.4:.32,.125,false,-.25);}}
    /* the tune */
    const hookOn=bi%8===2&&!(ambient&&bi%16!==2);
    if(bi%64===32||!hookB)hookB=makeHook(seeded(SEEDSTR+':b'+Math.floor(bi/64))); /* the B half gets its own hook, and a new one every 64 bars */
    const cur=Math.floor(bi/32)%2?hookB:hook;
    if(LEAD){if(hookOn){const v=(hookN++)%4; /* the hook develops: as written, a new ending, a rest, then moved up a step */
        if(v===0)playNotes(b0,bi,cur,1);
        else if(v===1)playNotes(b0,bi,cur.map((h,i)=>i===cur.length-1?Object.assign({},h,{d:h.d+choose([-3,-1,2])}):h),.95);
        else if(v===2){if(Math.random()<improv*1.5)riff(b0,bi,cur);}
        else playNotes(b0,bi,cur.map(h=>Object.assign({},h,{d:h.d+2})),.9);}
      else if(bi%8!==3&&bi>=1&&Math.random()<improv)riff(b0,bi,cur);} /* the tune lives in the keys */
    bar++;}
  return {src:srcs,ahead:2.2,hits,bpm,beat,step,barDur,tStart,tick(until){for(const l of layers)l.tick&&l.tick(until);if(t<a.currentTime)t=a.currentTime+.05; /* after a stall, pick up from now rather than playing the missed bars at once */while(t<until){barSlot(t);t+=barDur;}},
    update(){}};}
window.loafBand=band;window.loafSounds=SOUNDS; /* lets the tests render a tape offline */

function genStart(id,fade){genStop(true);const a=ensureAudio();const master=a.createGain();master.gain.value=0;const an=a.createAnalyser();an.fftSize=256;an.smoothingTimeConstant=.5;
  master.connect(an);an.connect(a.destination);const g={id,master,an,src:[],timers:[]};
  const tpp=tapeOf(id);const snd=(SOUNDS[id]||((a,d)=>band(a,d,tpp)))(a,master);g.snd=snd;g.src.push(...snd.src);if(snd.tick){const ah=snd.ahead||8;snd.tick(a.currentTime+ah);g.timers.push(setInterval(()=>snd.tick(a.currentTime+ah),500));}
  master.gain.setValueAtTime(0,a.currentTime);master.gain.linearRampToValueAtTime(vol()*levelOf(id),a.currentTime+(fade||2));gen=g;dirty=true;paintKeys();}
function genStop(quick){if(!gen)return;const g=gen;gen=null;g.timers.forEach(clearInterval);try{const a=actx;g.master.gain.cancelScheduledValues(a.currentTime);g.master.gain.setValueAtTime(g.master.gain.value,a.currentTime);
    g.master.gain.linearRampToValueAtTime(0,a.currentTime+(quick?.15:.8));setTimeout(()=>{g.src.forEach(s=>{try{s.stop();}catch(e){}});g.master.disconnect();},quick?250:1000);}catch(e){}dirty=true;paintKeys();}
function stationName(){try{const tp=tapeOf(S.station);if(tp)return shownTape(tp).n;}catch(e){}return S.stationName||'Radio';} /* a tape shows the name it has (or would get) */
function playRadio(){genStart(S.station);}
function stopRadio(){genStop();dirty=true;paintKeys();}
const peaks=new Float32Array(16),peakT=new Float32Array(16),bandMax=new Float32Array(16).fill(.2),bandLo=new Float32Array(16);let EDGES=null,vuT=-1;
/* the groove, read off the sound itself (so it works for every station and tape): a kick is a jump in the low bands,
   a hat a jump in the high ones. Loafie listens to this. */
const groove={kickAt:-9,hatAt:-9,lowArmed:true,hiArmed:true};
function vu(t){const on=playing();if(t===vuT)return bands;vuT=t;
  const src=gen&&gen.an;if(on&&src){const n=src.frequencyBinCount;if(!freq||freq.length!==n){freq=new Uint8Array(n);EDGES=[];let e=1;for(let i=0;i<=16;i++){const want=Math.round(Math.pow(Math.min(n,72),i/16));e=Math.max(i?EDGES[i-1]+1:1,want);EDGES.push(e);}}
    src.getByteFrequencyData(freq);const raw=new Float32Array(16);
    for(let i=0;i<16;i++){let v=0;for(let k=EDGES[i];k<EDGES[i+1]&&k<n;k++)v=Math.max(v,freq[k]);raw[i]=v/255;} /* sixteen bands spread out like an ear hears them: bass on the left, sparkle on the right */
    for(let i=0;i<16;i++){const x=raw[i];bandLo[i]+=(x-bandLo[i])*(x<bandLo[i]?.3:.008);if(x>bandMax[i])bandMax[i]=x;else bandMax[i]+=(x-bandMax[i])*.006;bandMax[i]=Math.max(bandMax[i],bandLo[i]+.06);
      const v=Math.pow(clamp((x-bandLo[i])/(bandMax[i]-bandLo[i]),0,1),2.3)*clamp(bandMax[i]/.12,0,1);bands[i]+=(v-bands[i])*(v>bands[i]?.8:.18);}
    /* each band keeps its own floor and ceiling, so every bar swings through its whole height and jumps on the beat */
    {const low=Math.max(bands[0],bands[1],bands[2]),hi=Math.max(bands[11],bands[12],bands[13],bands[14],bands[15]); /* a kick: the low bars fall back, then jump; a hat: the same up top */
      if(low<.45)groove.lowArmed=true;else if(groove.lowArmed&&low>.75&&t-groove.kickAt>.18){groove.kickAt=t;groove.lowArmed=false;}
      if(hi<.4)groove.hiArmed=true;else if(groove.hiArmed&&hi>.7&&t-groove.hatAt>.08){groove.hatAt=t;groove.hiArmed=false;}}}
  else for(let i=0;i<16;i++){const target=on?.25+.55*Math.abs(Math.sin(t*2.1+i*.9))*Math.abs(Math.sin(t*.7+i*.3))+Math.random()*.12:0;bands[i]+=(target-bands[i])*(on?.25:.1);}
  for(let i=0;i<16;i++){if(bands[i]>=peaks[i]){peaks[i]=bands[i];peakT[i]=t;}else if(t-peakT[i]>.3)peaks[i]=Math.max(bands[i],peaks[i]-.012);} /* the peak caps hang, then drift down */
  return bands;}

/* ================= The card ================= */
/* one card on the right: the station while the radio plays, otherwise what the cat is up to */
let dirty=true,cardStart=0,cardKey='';
let boardTextLast='';function boardText(now){const el=document.getElementById('boardText');if(!el)return;const ck=clock(now);
  const s=(BC?'':ck.s+' '+(H24?'':ck.ap)+', '+now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})+'. ')+(gen?'Playing '+stationName()+'.':'Nothing playing.')+(cat.nap?' Loafie is napping.':'');if(s!==boardTextLast){boardTextLast=s;el.textContent=s;}}
function currentCard(){if(BC)return {k:'bc'+S.station,label:'LOAF FM',text:stationName()};if(tuning)return {k:'tune',label:tuneFreq()+' FM',text:'',tune:true};
  return playing()?{k:muted?'mute':'radio',label:muted?'MUTED':freqOf(gen&&gen.id)+' FM',lamp:!muted,text:stationName()}:{k:'cat',label:'LOAFIE',text:catWords()};}

/* ================= The window ================= */
const flash={msg:'',until:0};function say(m){flash.msg=ascii(m).toUpperCase().slice(0,60);flash.until=Date.now()+4000;}
function draw(t,now){fb.fill(-1);const P=pal();
  if(R(P.BG)+G(P.BG)+B(P.BG)>0)rect(0,0,W,H,dim(P.BG,.6));
  /* left: the clock */
  let ck=clock(now);if(BC){const f=freqOf(S.station);ck={s:f,ap:'FM',date:BC.mode==='live'?(clock(now).s+' '+clock(now).ap+' '+tzLabel()).trim():'STEREO'};}
  if(blink12){if(performance.now()>blink12||playing())blink12=0;else ck={s:Math.floor(performance.now()/550)%2?'':'12:00',ap:'',date:ck.date};}
  let card;if(flash.until>Date.now())card={label:'',text:flash.msg,flash:true};
  else{card=currentCard();if(card.k+card.text!==cardKey){cardKey=card.k+card.text;cardStart=t;}}
  const on=playing();
  /* while something plays, the mix is the hero: the time shrinks to the top line and the track, the meter and the cat get the board */
  const hero=on&&!BC&&!!card&&!card.flash&&(card.k==='radio'||card.k==='mute');
  if(hero){let x=3;text(ck.s,x,4,'small',P.C);x+=textW(ck.s,'small');if(!H24){x+=2;text(ck.ap,x,4,'small',P.PEG?P.PEG[5]:P.S2);x+=textW(ck.ap,'small');}
    px(x+3,6,P.S2);x+=7;text(card.label,x,4,'small',P.S2);
    const sw=textW('STEREO','small');if(card.lamp)text('STEREO',W-2-sw,4,'small',P.A);
    const x0=3,area=W-x0-2,big=textW(card.text,'big'),sm=textW(card.text,'small'),el=t-cardStart;let eqH=8;
    clip=[x0,W];const two=wrap(card.text,area,'small');if(big<=area)text(card.text,x0,11,'big',P.C);else if(sm<=area)text(card.text,x0,12,'small',P.C);
    else if(two.length===2){two.forEach((l,i)=>text(l,x0,11+i*6,'small',P.C));eqH=6;}
    else{const sp=13,lead=2.2,tail=2,travel=(sm-area)/sp;const off=Math.round(clamp((el-lead)*sp,0,sm-area));text(card.text,x0-off,12,'small',P.C);if(el>lead+travel+tail)cardStart=t;}clip=null;
    if(CALM.some(c=>c.id===S.station))breath(t,P,x0,area);else meter(t,P,x0,area,eqH);return;}
  const tw=textW(ck.s,'big',2);text(ck.s,3,4,'big',P.C,2);let right=3+tw;
  if(P.DIG){let cx=3,d=ck.s.replace(/\D/g,'').length;for(const ch of ck.s){const w=(glyph(ch,'big').length+1)*2;if(/\d/.test(ch)){d--;const c=P.DIG[(P.DIG.length-1-d%P.DIG.length+P.DIG.length)%P.DIG.length];
    for(let y=4;y<4+FH.big*2;y++)for(let x=cx;x<cx+w&&x<W;x++)if(fb[y*W+x]===P.C)fb[y*W+x]=c;}cx+=w;}} /* each digit its own colour; the colon stays clear */
  if(!H24){text(ck.ap,right+3,5,'small',P.PEG?P.PEG[5]:P.S2);right+=3+textW(ck.ap,'small');}
  text(ck.date,3,22,'small',P.PEG?P.PEG[1]:P.S2);
  const dx=Math.max(58,right+4);for(let y=3;y<29;y++)px(dx,y,dim(P.A,.75));
  /* right: one card, with the spectrum under it while the radio plays */
  const x0=dx+5,area=W-x0-1;
  let twoLines=false,eqH=8;
  const meterCard=!!card&&on&&!BC&&!card.flash&&(card.k==='radio'||card.k==='mute');
  if(meterCard){const big=textW(card.text,'big'),sm=textW(card.text,'small'),el=t-cardStart; /* fits big, else the small letters on one line, else they crawl */
    if(card.label){let lb=card.label;while(lb.length>1&&textW(lb,'small')>area)lb=lb.slice(0,-1);text(lb,x0,4,'small',P.S2);}
    {const w=textW('STEREO','small'),rx=W-2-w;if(card.lamp&&rx>x0+textW(card.label||'','small')+3)text('STEREO',rx,4,'small',P.A);}
    clip=[x0,W];const two=wrap(card.text,area,'small');if(big<=area)text(card.text,x0,11,'big',P.C);else if(sm<=area)text(card.text,x0,12,'small',P.C);
    else if(two.length===2){two.forEach((l,i)=>text(l,x0,11+i*6,'small',P.C));eqH=6;}
    else{const sp=13,lead=2.2,tail=2,travel=(sm-area)/sp;const off=Math.round(clamp((el-lead)*sp,0,sm-area));text(card.text,x0-off,12,'small',P.C);if(el>lead+travel+tail)cardStart=t;}clip=null;}
  else if(card){const wrapIt=!card.flash,lines=wrapIt?wrap(card.text,area):[card.text];const canWrap=wrapIt&&lines.length<=2;twoLines=canWrap&&lines.length>1; /* in broadcast mode a long station name wraps rather than crawls */
    const tw2=textW(card.text,'big');const scroll=!canWrap&&tw2>area;const el=t-cardStart;
    const night=nightDim(now)<.7;const speed=(card.slow?11:15)*(night?.85:1),lead=2.2,tail=2; /* unhurried; slower still after dark */const travel=scroll?(tw2-area)/speed:0;
    if(card.label){let lb=card.label;while(lb.length>1&&textW(lb,'small')>area)lb=lb.slice(0,-1);text(lb,x0,4,'small',card.tune?P.C:P.S2);}
    {const sl=0,right=(card.lamp||card.tune)?'STEREO':'';if(right&&!BC){const w=textW(right,'small'),rx=W-2-w;if(rx>x0+textW(card.label||'','small')+3)text(right,rx,4,'small',sl?P.S2:card.tune?dim(P.A,.35+.3*Math.random()):P.A);}} /* the STEREO lamp lights when a station locks in */
    clip=[x0,W];
    if(canWrap)lines.forEach((l,i)=>text(l,x0,(card.label?11:(lines.length===1?12:6))+i*9,'big',card.flash?P.A:P.C));
    else if(scroll&&card.k!=='cat'&&wrap(card.text,area,'small').length<=3){wrap(card.text,area,'small').forEach((l,i)=>text(l,x0,(card.label?11:6)+i*7,'small',P.C));twoLines=true;} /* a long station or tape name drops to the small letters rather than crawling */
    else if(scroll){const off=Math.round(clamp((el-lead)*speed,0,tw2-area));text(card.text,x0-off,11,'big',P.C);}
    else text(card.text,x0,11,'big',card.flash?P.A:P.C);
    clip=null;
    if(scroll&&el>lead+travel+tail)cardStart=t; /* a long station name crawls, pauses, and starts again */}
  if(on&&!twoLines)meter(t,P,x0,area,eqH);
}
/* CALM: a breathing light where the meter would be. Four seconds in, six out; follow it or don't */
function breath(t,P,x0,area){const cyc=10,ph=t%cyc,inh=ph<4,q=inh?ph/4:1-(ph-4)/6,e=.5-.5*Math.cos(Math.PI*q);
  const bx=x0,bw=area,w=Math.max(1,Math.round(bw*e)),cx=bx+Math.round((bw-w)/2);for(let y=22;y<28;y++)rect(cx,y,w,1,dim(P.C,y===22||y===27?.35:.55+.45*e));}
/* the 16-band meter: bars snap up on the beat, the tops run orange and red, a peak cap hangs for a moment */
function meter(t,P,x0,area,eqH){const b=vu(t);const pitch=area>=90?6:4,bw=pitch-2,nb=Math.floor((area+2)/pitch); /* 80s LED meter: chunky bars with a gap between them */
  const pp=PALETTES[S.palette]||PALETTES.pegs,M=(pp.meter||['#55c975','#f2d14d','#e85a4f']).map(hexInt),GRN=M[0],AMB=M[1],RED=M[2]; /* each look has its own meter: 808 yellow-orange-red, VFD cyan with an orange top, Amber in ambers */const col=j=>{const f=(j+1)/eqH;return f>.9?RED:f>.55?AMB:GRN;}; /* green, then amber, then red at the top, like the real thing */
  for(let i=0;i<nb;i++){const k=Math.floor(i*16/nb),hgt=Math.max(1,Math.min(eqH,Math.round(b[k]*eqH)));for(let j=0;j<hgt;j++)rect(x0+i*pitch,28-j,bw,1,col(j));
    const pj=Math.min(eqH-1,Math.round(peaks[k]*eqH)-1);if(pj>=hgt&&pj>0)rect(x0+i*pitch,28-pj,bw,1,dim(col(pj),.85));}
}

/* ================= Renderer ================= */
const win=document.getElementById('window'),bgC=document.getElementById('bg'),ledC=document.getElementById('led'),unit=document.getElementById('unit'),face=document.getElementById('face');
const bg=bgC.getContext('2d'),ctx=ledC.getContext('2d');
const GH=18,gameWin=document.getElementById('gameWin'),gbgC=document.getElementById('gbg'),gledC=document.getElementById('gled'),gbg=gbgC.getContext('2d'),gctx=gledC.getContext('2d');let pitch=1;const sprites=new Map(),gsprites=new Map();let SPR=sprites,ZOOM=1,gpitch=1,camX=0,petHint=null;
/* on a phone the desk zooms in: twice the size, with a camera that follows her; drawing it swaps in the desk's own scale */
function withGame(fn){const p=pitch,s0=SPR;pitch=gpitch;SPR=gsprites;try{fn();}finally{pitch=p;SPR=s0;}}const DOT=.36,GLOW=.6;
function fitUnit(){if(BC){const rows=H+GH+2,pad=parseFloat(getComputedStyle(unit).paddingTop)||16;unit.style.width=Math.max(288,Math.min(innerWidth*.88,(innerHeight*.86-pad*2-8)*(W/rows)+pad*2))+'px';return;}const top=document.querySelector('.top');const topH=top&&top.offsetParent!==null?top.offsetHeight:16;const pad=parseFloat(getComputedStyle(unit).paddingTop)||16,gap=parseFloat(getComputedStyle(face).marginTop)||16;const availH=Math.min(window.innerHeight-topH-16,window.innerHeight*.66),availW=document.documentElement.clientWidth-2*16;const chrome=pad*2+face.offsetHeight+gap+8;const rows=H+GH+2;unit.style.width=Math.max(288,Math.min(availW,1200,(availH-chrome)*(W/rows)+28))+'px';}
const isPeg=()=>!!(PALETTES[S.palette]||{}).peg;
const PV=new Float32Array(W*(H+GH)).map(()=>.8+Math.random()*.2); /* pegs pushed in to slightly different depths */
function dots(g,cv,rows){const cw=cv.width,peg=isPeg();g.fillStyle=peg?'#000':'#050607';g.fillRect(0,0,cw,cv.height);g.fillStyle=pal().OFF;const r=pitch*DOT*(peg?.55:.85); /* the pegboard: small punched holes in black paper */
  for(let y=0;y<rows;y++)for(let x=0;x<W;x++){g.beginPath();g.arc((x+.5)*pitch,(y+.5)*pitch,r,0,Math.PI*2);g.fill();}}
function layout(){fitUnit();const dpr=Math.min(window.devicePixelRatio||1,2);const cw=Math.round(win.clientWidth*dpr);pitch=cw/W;const ch=Math.round(pitch*H);
  bgC.width=ledC.width=cw;bgC.height=ledC.height=ch;sprites.clear();dots(bg,bgC,H);
  ZOOM=1; /* one board, one dot size, phones too (the camera code stays for a zoomed desk, but it's off) */gpitch=pitch*ZOOM;gsprites.clear();gameWin.classList.toggle('zoom',ZOOM>1);
  gbgC.width=gledC.width=Math.round(W*gpitch);gbgC.height=gledC.height=Math.round(gpitch*GH);withGame(()=>dots(gbg,gbgC,GH));camMove(true);}
function camMove(snap){const view=W/ZOOM;if(petHint&&!petHint.hidden)petHint.style.left=((cat.x+7-camX)/view*100).toFixed(1)+'%';
  if(ZOOM<2){if(camX){camX=0;gbgC.style.transform=gledC.style.transform='';}return;}const want=clamp(cat.x+7-view/2,0,W-view);
  const nx=snap?want:camX+(want-camX)*.06;if(Math.abs(nx-camX)<.01&&!snap)return;camX=nx;const tf='translateX('+(-camX/W*100).toFixed(3)+'%)';gbgC.style.transform=gledC.style.transform=tf;}
function sprite(c){let sp=SPR.get(c);if(sp)return sp;if(SPR.size>600)SPR.clear();if(isPeg())return pegSprite(c);
  const size=Math.ceil(pitch*2.6);const cv=document.createElement('canvas');cv.width=cv.height=size;const g=cv.getContext('2d');const r=R(c),gg=G(c),b=B(c),half=size/2;
  const grad=g.createRadialGradient(half,half,0,half,half,half);grad.addColorStop(0,`rgba(${r},${gg},${b},${.6*GLOW})`);grad.addColorStop(.35,`rgba(${r},${gg},${b},${.22*GLOW})`);grad.addColorStop(1,`rgba(${r},${gg},${b},0)`);
  g.fillStyle=grad;g.fillRect(0,0,size,size);g.globalCompositeOperation='lighter';const dr=pitch*DOT;g.fillStyle=`rgb(${r},${gg},${b})`;g.beginPath();g.arc(half,half,dr,0,Math.PI*2);g.fill();
  g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.arc(half,half,dr*.45,0,Math.PI*2);g.fill();sp={cv,off:half};SPR.set(c,sp);return sp;}
/* a plastic peg: a round translucent cap, brighter at the top-left where the light catches it */
function pegSprite(c){const size=Math.ceil(pitch*2.4);const cv=document.createElement('canvas');cv.width=cv.height=size;const g=cv.getContext('2d');const r=R(c),gg=G(c),b=B(c),half=size/2,dr=pitch*.43;
  const glow=g.createRadialGradient(half,half,0,half,half,half);glow.addColorStop(0,`rgba(${r},${gg},${b},.46)`);glow.addColorStop(.4,`rgba(${r},${gg},${b},.13)`);glow.addColorStop(1,`rgba(${r},${gg},${b},0)`);g.fillStyle=glow;g.fillRect(0,0,size,size);
  const cap=g.createRadialGradient(half-dr*.35,half-dr*.35,dr*.1,half,half,dr);cap.addColorStop(0,`rgb(${Math.min(255,r+90)},${Math.min(255,gg+90)},${Math.min(255,b+90)})`);cap.addColorStop(.55,`rgb(${r},${gg},${b})`);cap.addColorStop(1,`rgb(${Math.round(r*.7)},${Math.round(gg*.7)},${Math.round(b*.7)})`);
  g.fillStyle=cap;g.beginPath();g.arc(half,half,dr,0,Math.PI*2);g.fill();g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.arc(half-dr*.38,half-dr*.4,dr*.2,0,Math.PI*2);g.fill();
  const sp={cv,off:half};SPR.set(c,sp);return sp;}
function present(alpha,g=ctx,buf=fb,rows=H,base=0){g.clearRect(0,0,g.canvas.width,g.canvas.height);const a=clamp(alpha,0,1);g.globalAlpha=a;const peg=isPeg();
  for(let y=0;y<rows;y++)for(let x=0;x<W;x++){const c=buf[y*W+x];if(c<0)continue;const k=base+y*W+x;g.globalAlpha=a*(peg?PV[k]:.86+(PV[k]-.8)*.7); /* no two lights quite the same brightness: pegs vary more, LEDs a little */const sp=sprite(c);g.drawImage(sp.cv,(x+.5)*pitch-sp.off,(y+.5)*pitch-sp.off);}g.globalAlpha=1;}
/* now and then a peg is the wrong colour, or one has wandered off on its own: it changes every few minutes */
function oops(P){if(!P.PEG)return;const w=Math.floor(Date.now()/240000);let h=Math.imul(w^0x9e3779b9,2654435761);const rnd=()=>{h=Math.imul(h^h>>>15,2246822507);h=Math.imul(h^h>>>13,3266489909);return ((h^=h>>>16)>>>0)/4294967296;};
  if(rnd()<.7){const lit=[];for(let y=4;y<18;y++)for(let x=3;x<58;x++){const c=fb[y*W+x];if(c>=0&&c!==P.C)lit.push(y*W+x);}
    if(lit.length){const k=lit[Math.floor(rnd()*lit.length)],c=fb[k];let n=P.PEG[Math.floor(rnd()*P.PEG.length)];if(n===c)n=P.PEG[(P.PEG.indexOf(n)+3)%P.PEG.length];fb[k]=n;}}
  if(rnd()<.55){const x=Math.floor(rnd()*W),y=rnd()<.5?1:30;if(fb[y*W+x]<0)fb[y*W+x]=dim(P.PEG[Math.floor(rnd()*P.PEG.length)],.85);}}
const t0=performance.now();
function frame(){const t=(performance.now()-t0)/1000;const now=NOW();
  draw(t,now);boardText(now);const P0=pal();oops(P0);let alpha=nightDim(now)*(RM.matches?1:.97+Math.random()*.03)*(cat.nap?.6:1); /* Z: the lights go down while she naps */if(!RM.matches&&Math.random()<.003)alpha*=.8;{const fl=pal().floor;if(alpha<fl)alpha=fl;}
  const warm=clamp(t/1.2,0,1);if(warm<1&&!P0.PEG)alpha*=warm*(.6+.4*Math.random());present(alpha); /* a short warm-up flicker on load (the pegboard just appears) */
  drawGame(t);withGame(()=>present(alpha,gctx,gfb,GH,W*H));camMove(false);
  if(vidPip.ready)vidFrame();}
/* the loop runs on whichever window is showing the board, so it keeps going while she floats */
let host=window,loopGen=0;
/* reduced motion: about 12 frames a second instead of the display rate, no flicker, half the weather, and a cat who wanders less */
const RM=matchMedia('(prefers-reduced-motion: reduce)');let lastF=0;
function loop(gen){host.requestAnimationFrame(ts=>{if(gen!==loopGen)return;if(!RM.matches||ts-lastF>=80){lastF=ts;frame();}loop(gen);});}
function restartLoop(){loopGen++;loop(loopGen);}



/* ================= Face ================= */
const $=id=>document.getElementById(id);
const stationEl=$('station');
function setStation(s){const from=S.station,was=!!gen;S.station=s.id;S.stationName=s.name;save();dirty=true;fillStations();if(window.__mtStation)window.__mtStation(s.id);if(was){if(from!==s.id&&!BC)tuneTo(from,s.id);else playRadio();}}
/* Changing station while one plays: the dial rolls through the frequencies in between with a breath of FM static, then the new station fades in */
let tuning=null;
function tuneTo(from,to){genStop(true);const f0=parseFloat(freqOf(from)),f1=parseFloat(freqOf(to)),dur=Math.min(1.1,.45+Math.abs(f1-f0)*.05);
  tuning={f0,f1,t0:performance.now(),dur:dur*1000};dirty=true;staticBurst(dur);
  setTimeout(()=>{if(tuning&&tuning.f1===f1){tuning=null;dirty=true;if(S.station===to)genStart(to);}},dur*1000);}
function tuneFreq(){if(!tuning)return null;const q=Math.min(1,(performance.now()-tuning.t0)/tuning.dur),e=q<.5?2*q*q:1-Math.pow(-2*q+2,2)/2;return (Math.round((tuning.f0+(tuning.f1-tuning.f0)*e)*5)/5).toFixed(1);}
function staticBurst(dur){if(muted)return;try{const a=ensureAudio(),t=a.currentTime,s=a.createBufferSource();s.buffer=makeNoise(a,1.5,'white');const bp=a.createBiquadFilter();bp.type='bandpass';bp.Q.value=.8;
  bp.frequency.setValueAtTime(1200,t);bp.frequency.linearRampToValueAtTime(2600,t+dur*.5);bp.frequency.linearRampToValueAtTime(1500,t+dur);const g=a.createGain(),lv=.05*vol();
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(lv,t+.06);g.gain.setValueAtTime(lv*.8,t+dur*.6);g.gain.linearRampToValueAtTime(0,t+dur);s.connect(bp).connect(g).connect(a.destination);s.start(t);s.stop(t+dur+.1);}catch(e){}}
function fillStations(){stationEl.innerHTML='';{const og=document.createElement('optgroup');og.label='Loaf FM';MUSIC.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;og.appendChild(o);});stationEl.appendChild(og);}{const og=document.createElement('optgroup');og.label='Calm';CALM.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;og.appendChild(o);});stationEl.appendChild(og);}
  if(!BC){const og=document.createElement('optgroup');og.label='Your mixtapes';
    for(const tp of S.tapes){const o=document.createElement('option');o.value='tape:'+tp.id;o.textContent=tp.n;og.appendChild(o);}
    if(draft){const o=document.createElement('option');o.value='tape:draft';o.textContent=shownTape(draft).n+' (not saved)';og.appendChild(o);}
    if(og.children.length)stationEl.appendChild(og);}
  if(!S.station){const o=document.createElement('option');o.value='';o.textContent='Pick a sound';stationEl.insertBefore(o,stationEl.firstChild);}
  stationEl.value=S.station||'';if(window.__dialReady)paintDial();}
if(!PALETTES[S.palette])S.palette='pegs';
if(!CALM.some(s=>s.id===S.station)&&!MUSIC.some(s=>s.id===S.station)&&!(tapeOf(S.station)&&!BC)&&!(BC&&tapeOf(S.station))){S.station='gen:purr';S.stationName='Purr';} /* a radio station saved before live radio was dropped */
delete S.stationUrl;
fillStations();
stationEl.addEventListener('change',()=>{const v=stationEl.value;
  const tp=tapeOf(v);const s=CALM.find(x=>x.id===v)||MUSIC.find(x=>x.id===v)||(tp&&{id:v,name:tp.n});if(s)setStation(s);else stationEl.value=S.station||'';});
/* ================= the tuner =================
   A digital tuner, like an 80s receiver: a glowing readout (band, frequency, name) with ◀ ▶ to step, and three band
   keys that are also the three ways to use Loaf FM: FOCUS (the five music stations), CALM (rain, ocean, fire, purr,
   brown noise) and TAPES (your mixtapes, with a count, so they're never hidden). The real <select> stays for
   keyboard and screen-reader users. */
const BANDS=[{k:'focus',name:'FOCUS'},{k:'calm',name:'CALM'},{k:'tapes',name:'TAPES'}];
function bandOf(id){return MUSIC.some(m=>m.id===id)?'focus':CALM.some(c=>c.id===id)?'calm':'tapes';}
function bandList(k){if(k==='focus')return MUSIC.map(m=>({id:m.id,name:m.name}));if(k==='calm')return CALM.map(c=>({id:c.id,name:c.name}));
  const out=S.tapes.map(tp=>({id:'tape:'+tp.id,name:tp.n}));if(draft)out.push({id:'tape:draft',name:shownTape(draft).n+' (not saved)'});return out;}
const lastIn={};
function paintDial(){const band=bandOf(S.station),list=bandList(band),i=list.findIndex(x=>x.id===S.station);lastIn[band]=S.station;
  $('tuneBand').textContent=BANDS.find(b=>b.k===band).name+(list.length>1?' · '+(i+1)+'/'+list.length:'');
  $('tuneFreq').textContent=freqOf(S.station);$('tuneName').textContent=(list[i]&&list[i].name)||stationName();
  document.querySelectorAll('.bandkey').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.band===band));if(b.dataset.band==='tapes')b.querySelector('em').textContent=bandList('tapes').length||'+';});}
function dialTune(id){if(id===S.station)return;const tp=tapeOf(id);const st=CALM.find(x=>x.id===id)||MUSIC.find(x=>x.id===id)||(tp&&{id,name:tp.n});if(st)setStation(st);}
function dialStep(d){const list=bandList(bandOf(S.station));const i=list.findIndex(x=>x.id===S.station);const n=list[(i+d+list.length)%list.length];if(n)dialTune(n.id);}
$('dialPrev').addEventListener('click',()=>dialStep(-1));$('dialNext').addEventListener('click',()=>dialStep(1));
document.querySelectorAll('.bandkey').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.band,list=bandList(k);
  if(!list.length){openMixtape();return;} /* no tapes yet: TAPES makes one */
  if(bandOf(S.station)===k){dialStep(1);return;} /* tap the lit band again for the next one */
  dialTune(lastIn[k]&&list.some(x=>x.id===lastIn[k])?lastIn[k]:list[0].id);}));
window.__dialReady=true;paintDial();

/* ================= The mixtape deck =================
   Opens inside the case, under the controls. Changes are heard live: tempo, busyness, tone, drums and mood adjust the
   running music; a new starting station or weather re-cuts the tape with a short fade. A new tape is a draft until
   saved; a saved tape saves as you go. Copy link puts the whole recipe in the address. */
let mtTape=null,mtPhase=0,mtSpin=null;
const FACE=['..##......##..','..#p#....#p#..','..##########..','.#####hh#####.','#############s','####o#####o##s','####o#####o##s','######hmh####s'];
const REEL=[[1,0],[2,0],[3,1],[3,2],[2,3],[1,3],[0,2],[0,1]];
function cassettePix(tp,phase){ /* a flat pixel-art cassette; Loafie glows in the window like a little LED screen */
  const W2=56,H2=33,cells=[];const P=(x,y,v)=>{if(x>=0&&y>=0&&x<W2&&y<H2)cells[y*W2+x]=v;};const Rr=(x,y,w,h,v)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)P(x+i,y+j,v);};
  const sh=SHELLS[tp.c]||SHELLS[0],K='#1d1c21',S1=sh.sh,S2=sh.hi,LP=sh.strip,SC=sh.clear?sh.hi:'#a8a49a',lab=sh.lab;
  Rr(1,0,W2-2,H2,K);Rr(0,1,W2,H2-2,K);Rr(1,1,W2-2,H2-2,S1);Rr(1,1,W2-2,1,S2);          /* shell */
  if(sh.clear)for(let y=3;y<31;y+=3)for(let x=2;x<54;x+=7)if((x+y)%2)P(x,y,S2);           /* see-through plastic: a glint of the insides */
  Rr(4,3,48,21,K);Rr(5,4,46,19,lab);Rr(5,4,46,6,LP);                                     /* label, a strip for the name */
  if(sh.band){Rr(5,10,46,1,sh.band);Rr(5,20,46,2,sh.band);}                               /* a printed stripe */
  for(let x=7;x<50;x+=2)P(x,11,sh.band?LP:K);                                            /* a dotted rule */
  Rr(17,12,22,11,K);                                                                     /* the window (Loafie goes here) */
  const RING=[[0,-2],[1,-2],[2,-2],[2,-1],[2,0],[2,1],[2,2],[1,2],[0,2],[-1,2],[-2,2],[-2,1],[-2,0],[-2,-1],[-2,-2],[-1,-2]]; /* the 16 dots round the hub */
  const reel=cx=>{Rr(cx-3,14,7,7,K);Rr(cx-2,15,5,5,'#f1e7cf');Rr(cx-1,16,3,3,K);P(cx,17,'#f1e7cf');const f=phase%4;
    for(let s=0;s<4;s++){const [dx,dy]=RING[(s*4+f)%16];P(cx+dx,17+dy,K);} /* four spokes stepping round the hub */
    if(f%2)[[2,-2],[2,2],[-2,2],[-2,-2]].forEach(([dx,dy])=>P(cx+dx,17+dy,K));}; /* on the in-between steps the corners go dark too, so the light between the spokes breaks into short blades instead of hooked arms */
  reel(10);reel(45);                                                                     /* the reels turn while it plays */
  Rr(12,26,32,7,K);Rr(13,27,30,6,S2);Rr(13,26,30,1,K);                                   /* the notch */
  Rr(18,29,2,2,K);Rr(36,29,2,2,K);Rr(25,28,2,2,K);Rr(29,28,2,2,K);
  [[2,2],[53,2],[2,30],[53,30],[28,31]].forEach(([x,y])=>P(x,y,SC));                    /* screws */
  const dots=[];for(let y=0;y<9;y++)for(let x=0;x<20;x++){const fx=x-3,fy=y-1,ch=fy>=0&&fy<FACE.length&&fx>=0&&fx<14?FACE[fy][fx]:'.';
    dots.push([18+x+.5,13+y+.5,ch==='.'||ch==='o'||ch==='m'?null:ch==='s'?'#8774b8':ch==='p'?'#e064c0':'#f1e7cf']);}
  return {W2,H2,cells,dots,K:sh.ink};}
function cassetteSVG(tp,phase){const {W2,H2,cells,dots,K}=cassettePix(tp,phase);
  let o='';for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){const v=cells[y*W2+x];if(v)o+=`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${v}"/>`;}
  let led='';dots.forEach(([x,y,c])=>{led+=c?`<circle cx="${x}" cy="${y}" r=".43" fill="${c}"/>`:`<circle cx="${x}" cy="${y}" r=".16" fill="#2a2a30"/>`;});
  const nm=tp.n.toUpperCase().replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  return `<svg viewBox="0 0 ${W2} ${H2}" aria-hidden="true"><defs><filter id="mtg" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation=".25" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g shape-rendering="crispEdges">${o}</g><g filter="url(#mtg)">${led}</g><text x="28" y="8.6" text-anchor="middle" font-family="Doto,monospace" font-weight="900" font-size="${nm.length>16?3.1:3.8}" fill="${K}">${nm}</text></svg>`;}
const mt=document.createElement('section');mt.className='mixtape';mt.id='mixtape';mt.hidden=true;mt.setAttribute('aria-label','Mixtape');
/* Under the radio: the tape deck. Normally it shows what's on as a big cassette (a station gets its own cassette,
   your tape its own), reels turning while it plays, with what you can do with it. MAKE A MIXTAPE slides the
   cassette into the deck: START WITH picks the groove (drums, tempo, feel); BASS, KEYS and OUTSIDE are the layers
   (lit = playing, unlit = available, tap a lit one to take it out). SAVE TAPE names it and pops it back out. */
const ROWS=[{k:'b',name:'Bass',opts:[[1,'Warm'],[2,'Deep'],[3,'Synth']]},{k:'k',name:'Keys',opts:[[1,'Rhodes'],[3,'Pad'],[4,'8-bit']],extra:[[2,'Guitar']]},{k:'w',name:'Outside',opts:[[1,'Rain'],[4,'Purr'],[3,'Fire']],extra:[[2,'Ocean']]}];
/* each station has its own cassette and a line about it */
const STATION_TAPE={'gen:late':[1,'Warm Rhodes and a lazy beat. Built for working late.'],'gen:window':[2,'Soft keys, a little melody, rain on the glass. Study mode.'],'gen:crt':[6,'Analog pads, slow arpeggios, a few blips. The synthy one.'],'gen:sunday':[0,'Jazz chords, brushes and a purr underneath. Zero urgency.'],'gen:desert':[5,'Slow pads, far-off bells and crickets. Wind-down mode.'],
  'gen:purr':[3,'Just Loafie, purring.'],'gen:rain':[2,'Rain on the window. Nothing else.'],'gen:waves':[2,'Slow waves on a quiet beach.'],'gen:fire':[4,'A low fire, crackling now and then.'],'gen:brown':[6,'Brown noise. Soft, steady, nothing to notice.']};
mt.innerHTML=`<header class="mt-head"><span class="mt-print mt-where"></span><button class="icon mt-x" type="button" aria-label="Done mixing" title="Done mixing">✕</button></header>
<div class="mt-now"><div class="mt-left"><button type="button" class="mt-big"></button></div><div class="mt-info">
<p class="mt-title"></p><p class="mt-freq"></p><p class="mt-recipe"></p>
<div class="mt-renamebox" hidden><input type="text" class="mt-name" maxlength="24" autocomplete="off" spellcheck="false" aria-label="Tape name"><button type="button" class="hw mt-renamedone">OK</button></div>
<div class="mt-acts"><button class="hw mt-play" type="button">PLAY</button><button class="hw mt-make" type="button">MAKE A MIXTAPE</button><button class="hw mt-savedraft" type="button">SAVE TAPE</button><button class="hw mt-keepmixing" type="button">KEEP MIXING</button><button class="hw mt-share" type="button">SHARE</button><button class="hw mt-rename" type="button">RENAME</button><button class="hw mt-edit" type="button">REMIX</button><button class="hw mt-keep" type="button">KEEP THIS TAPE</button></div>
<p class="mt-hint"></p><p class="mt-note2" aria-live="polite"></p>
<p class="mt-links"><button type="button" class="mt-lk mt-again">Make your own</button><button type="button" class="mt-lk mt-card">Save as picture</button><button type="button" class="mt-lk mt-del">Delete tape</button></p></div></div>
<div class="mt-build" hidden>
<div class="mt-left"><div class="mt-well"><button type="button" class="mt-cass" aria-label="Tap for another cassette" title="Tap for another cassette"></button></div>
<div class="mt-seq" aria-hidden="true"><div class="mt-seqhead"><span class="mt-print">PATTERN</span><span class="mt-readout" id="mtReadout"></span></div>
<div class="mt-grid" id="mtGrid">${['BD','SD','HH','BS','KY'].map(ch=>`<div class="mt-ch" data-ch="${ch.toLowerCase()}"><span>${ch}</span>${Array.from({length:16},(_,i)=>`<i data-s="${i}"></i>`).join('')}</div>`).join('')}</div>
<div class="mt-run" id="mtRun">${Array.from({length:16},(_,i)=>`<i class="c${i>>2}"></i>`).join('')}</div></div></div>
<div class="mt-right">
<div class="mt-hwrow mt-start"><div class="mt-rowhead"><span class="mt-print">START WITH</span><button type="button" class="hw mt-reroll" title="Same layers, a different tune">NEW TUNE ↻</button></div><div class="mt-keys mt-presets" role="group" aria-label="Start with">${BASES.map((b,i)=>`<button type="button" class="hw" data-base="${i}">${b[0].toUpperCase()}</button>`).join('')}</div></div>
${ROWS.map(R=>`<div class="mt-hwrow" data-l="${R.k}"><span class="mt-print">${R.name.toUpperCase()}</span><div class="mt-keys" role="group" aria-label="${R.name}"></div></div>`).join('')}
<div class="mt-rec"><span class="mt-print"><b class="mt-led"></b> REC</span><button type="button" class="hw hw-big mt-save">SAVE TAPE</button></div>
</div></div>
<p class="mt-model">LOAF FM · RHYTHM COMPOSER LF-83 · COMPUTER CONTROLLED</p>`;
mt.hidden=!!BC;face.after(mt);
const mtQ=sel=>mt.querySelector(sel);
function mtIsSaved(){return !!(mtTape&&mtTape.id&&S.tapes.includes(mtTape));}
function mtId(){return mtIsSaved()?'tape:'+mtTape.id:'tape:draft';}
let mtView='now',draftIn=false,delArm=0,renaming=false;
const BEAT_NAME=d=>d?['Soft','Lo-fi','House'][d-1]+' beat':'';
function tapeRecipe(tp){const keys=tp.k?(tp.k===4?'8-bit keys':KEYS[tp.k-1]):null;return [tp.i?BASES[tp.s][0]:BEAT_NAME(tp.d),tp.b?BASSES[tp.b-1]+' bass':null,keys,tp.w?OUTSIDE[tp.w-1]:null].filter(Boolean).join(' · ');}
function autoName(tp){const d=new Date(),day=DAYNAME[d.getDay()],h=d.getHours(),when=h>=20||h<5?' Night':h<12?' Morning':'';
  const adj=tp.w?['Rainy','Seaside','Fireside','Purring'][tp.w-1]:tp.b?['Warm','Deep','Neon'][tp.b-1]:tp.k?['Velvet','Easy','Hazy','Pixel'][tp.k-1]:'Quiet';
  const n=adj+' '+day+when;return n.length<=24?n:adj+' '+day;}
function isAuto(tp){return /^(My|Untitled) mixtape$/.test(tp.n);}
function shownTape(tp){return isAuto(tp)?Object.assign({},tp,{n:autoName(tp)}):tp;}
/* what the deck is showing right now: a station, your tape, a friend's tape, or your unsaved mix */
function nowItem(){const tp=tapeOf(S.station);
  if(tp){mtTape=tp;const kind=tp===draft?(draftIn?'friend':'draft'):'saved';return {kind,tape:shownTape(tp),id:S.station};}
  const st=[...MUSIC,...CALM].find(s=>s.id===S.station)||MUSIC[0],[c,desc]=STATION_TAPE[st.id]||[1,''];
  return {kind:'station',tape:{n:st.name,c,f:Math.round(parseFloat(FREQ[st.id]||'88.3')*10)},desc,id:st.id};}
const onAir=id=>!!gen&&gen.id===id&&playing();
function paintMixtape(){if(BC)return;const build=mtView==='build'&&!!mtTape;mt.classList.toggle('building',build);document.documentElement.classList.toggle('mt-open',build);
  mtQ('.mt-now').hidden=build;mtQ('.mt-build').hidden=!build;mtQ('.mt-x').hidden=!build;
  if(build){const tp=mtTape,saved=mtIsSaved();mtQ('.mt-where').textContent='MIXTAPE · SIDE A';
    mtQ('.mt-cass').innerHTML=cassetteSVG(shownTape(tp),mtPhase); /* the tape you're making, labelled with the name it'll get */
    mt.querySelectorAll('.mt-presets button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.base===tp.s)));
    for(const R of ROWS){const opts=R.opts.concat((R.extra||[]).filter(([v])=>tp[R.k]===v));
      mtQ(`.mt-hwrow[data-l="${R.k}"] .mt-keys`).innerHTML=opts.map(([v,lab])=>`<button type="button" class="hw" data-l="${R.k}" data-v="${v}" aria-pressed="${tp[R.k]===v}">${lab.toUpperCase()}</button>`).join('');}
    mtQ('.mt-save').textContent=saved?'DONE':'SAVE TAPE';mtQ('.mt-led').classList.toggle('on',onAir(mtId()));return;}
  const it=nowItem(),on=onAir(it.id),k=it.kind,show=(c,v)=>{mtQ(c).hidden=!v;};
  mtQ('.mt-where').textContent=(on?'NOW PLAYING':'READY')+(k==='saved'?' · YOUR TAPE':k==='friend'?' · FROM A FRIEND':k==='draft'?' · NOT SAVED':'');
  const big=mtQ('.mt-big');big.innerHTML=cassetteSVG(it.tape,mtPhase);const cyc=k==='saved'||k==='draft';big.classList.toggle('cycles',cyc);
  if(cyc){big.setAttribute('aria-label','Tap for another cassette');big.title='Tap for another cassette';}else{big.removeAttribute('aria-label');big.removeAttribute('title');}
  mtQ('.mt-title').textContent=it.tape.n;mtQ('.mt-freq').textContent=(it.tape.f/10).toFixed(1)+' FM';mtQ('.mt-recipe').textContent=k==='station'?it.desc:tapeRecipe(it.tape);
  /* the one big orange key is whatever you'd most likely do next */
  show('.mt-play',!on);mtQ('.mt-play').textContent='PLAY';
  show('.mt-make',k==='station');show('.mt-savedraft',k==='draft');show('.mt-keepmixing',k==='draft');show('.mt-share',k==='saved');show('.mt-rename',k==='saved');show('.mt-edit',k==='saved');show('.mt-keep',k==='friend');
  const primary=!on?'.mt-play':k==='station'?'.mt-make':k==='saved'?'.mt-share':k==='draft'?'.mt-savedraft':'.mt-keep';
  mt.querySelectorAll('.mt-acts .hw').forEach(b=>b.classList.toggle('hw-big',b.matches(primary)));
  mtQ('.mt-hint').textContent=k==='station'?'Start from '+it.tape.n+', stack a layer or two, save the tape.':'';
  show('.mt-again',k==='friend'||k==='saved');mtQ('.mt-again').textContent=k==='saved'?'New tape':'Make your own';show('.mt-card',k==='saved');show('.mt-del',k==='saved');
  mtQ('.mt-renamebox').hidden=!(renaming&&k==='saved');if(renaming&&document.activeElement!==mtQ('.mt-name'))mtQ('.mt-name').value=it.tape.n;
  mtQ('.mt-del').textContent=delArm>Date.now()?'Tap again to delete':'Delete tape';if(k==='saved')queueCard();}
function mtShow(v){mtView=v;renaming=false;delArm=0;mtQ('.mt-note2').textContent='';paintMixtape();}
window.__mtPaint=paintMixtape;window.__mtStation=id=>{if(mtView==='build'&&id!=='tape:draft'&&!(mtTape&&id==='tape:'+mtTape.id))mtShow('now');else paintMixtape();}; /* play/stop, station changes: the deck follows the radio */
/* hear a change: the tape re-cuts with a quick crossfade */
let mtRecut=null;
function mtApply(structural){const id=mtId();if(mtIsSaved())save();else keepDraft();S.stationName=shownTape(mtTape).n;dirty=true;
  if(gen&&gen.id===id){if(structural){clearTimeout(mtRecut);mtRecut=setTimeout(()=>{if(S.station===id&&gen&&gen.id===id)genStart(id,.35);},60);}}
  else if(structural&&S.station===id)playRadio();
  fillStations();paintMixtape();}
/* a starting track sets the groove and the keys; the bass and the outside you've added stay */
function loadBase(i,tp){const B=BASES[i][1];Object.assign(tp,{d:B.d,k:B.k,p:B.p,s:i});if(!tp.b)tp.b=B.b;if(tp.w==null)tp.w=0;}
/* the deck starts from whatever was on the radio, so it already sounds familiar */
const SEED={'gen:late':[0,0],'gen:window':[0,1],'gen:crt':[3,0],'gen:sunday':[0,4],'gen:desert':[2,0],'gen:purr':[0,4],'gen:rain':[0,1],'gen:waves':[2,2],'gen:fire':[0,3],'gen:brown':[2,0]};
function seedFrom(id){const tp=tapeOf(id);if(tp)return [tp.i?tp.s:0,tp.w];return SEED[id]||[0,0];}
function newDraft(seed){const [s0,w0]=seed,tp={n:'My mixtape',c:Math.floor(Math.random()*SHELLS.length),e:5,i:1,w:w0,b:0,r:1+Math.floor(Math.random()*2147483646)};loadBase(s0,tp);draftIn=false;draft=cleanTape(tp);mtTape=draft;keepDraft();setStation({id:'tape:draft',name:shownTape(draft).n});if(!gen)playRadio();else if(actx&&actx.state!=='running')actx.resume();}
/* into the deck: a new tape from what's on, or the tape you're showing */
function openMixtape(){const cur=tapeOf(S.station);
  if(cur&&!(cur===draft&&draftIn))mtTape=cur;else newDraft(seedFrom(S.station));
  if(!gen)playRadio();mtShow('build');seqStart();
  if(matchMedia('(max-width:700px)').matches)unit.scrollIntoView({block:'start',behavior:'smooth'});else mt.scrollIntoView({block:'nearest',behavior:'smooth'});}
function closeMixtape(){mtShow('now');}
/* the reels step round while that tape is the one playing */
function spinTick(){if(mt.hidden||document.hidden||RM.matches)return;const build=mtView==='build'&&mtTape,id=build?mtId():nowItem().id;if(!onAir(id))return;mtPhase=(mtPhase+1)%4;
  if(build)mtQ('.mt-cass').innerHTML=cassetteSVG(shownTape(mtTape),mtPhase);else mtQ('.mt-big').innerHTML=cassetteSVG(nowItem().tape,mtPhase);}
function startSpin(){stopSpin();if(!BC)mtSpin=setInterval(spinTick,330);}
/* the pattern display: the current bar's hits on a 5×16 grid (what the engine has already scheduled, like a programmed
   pattern), a running light stepping through the 16ths in 808 colours, and a tempo / bar readout */
const seqCells=[...mt.querySelectorAll('.mt-grid i')],runLeds=[...mt.querySelectorAll('.mt-run i')],readout=$('mtReadout');let seqRaf=0,seqLast='';
function seqFrame(){seqRaf=0;if(mt.hidden||mtView!=='build'||!mtTape)return;seqRaf=requestAnimationFrame(seqFrame);
  const g=gen,snd=g&&g.snd,on=!!snd&&snd.tStart!=null&&g.id===mtId()&&playing();
  if(!on){if(seqLast!=='off'){seqLast='off';seqCells.forEach(c=>c.className='');runLeds.forEach(l=>l.classList.remove('on'));readout.textContent='STOPPED';}return;}
  const now=actx.currentTime,barDur=snd.barDur,b0=snd.tStart+Math.floor((now-snd.tStart)/barDur)*barDur,stp=Math.floor(((now-b0)/barDur)*16)%16,barN=Math.floor((now-snd.tStart)/barDur)+1;
  const key=b0.toFixed(2)+':'+stp;if(key===seqLast)return;seqLast=key;
  const grid={bd:0,sd:0,hh:0,bs:0,ky:0};const mark=(ch,t)=>{if(t>=b0-.01&&t<b0+barDur-.01){const i=Math.max(0,Math.min(15,Math.round((t-b0)/barDur*16)))%16;grid[ch]|=1<<i;}};
  for(let i=0;i<snd.hits.length;i+=2)mark(snd.hits[i],snd.hits[i+1]);for(let i=0;i<keyHits.length;i+=2)mark('ky',keyHits[i]);
  seqCells.forEach(c=>{const ch=c.parentNode.dataset.ch,i=+c.dataset.s,hit=!!(grid[ch]>>i&1);c.className=(hit?'on':'')+(i===stp?' now':'');});
  runLeds.forEach((l,i)=>l.classList.toggle('on',i===stp));
  readout.textContent='TEMPO '+Math.round(snd.bpm)+' · BAR '+String(barN).padStart(3,'0')+' · STEP '+String(stp+1).padStart(2,'0');}
function seqStart(){if(!seqRaf&&!RM.matches)seqRaf=requestAnimationFrame(seqFrame);}
function stopSpin(){clearInterval(mtSpin);mtSpin=null;}
mtQ('.mt-x').addEventListener('click',closeMixtape);
mt.addEventListener('click',e=>{
  if(e.target.closest('.mt-big.cycles')&&mtTape){mtTape.c=(mtTape.c+1)%SHELLS.length;mtApply(false);return;} /* tap your tape for another shell */
  if(mtView!=='build'||!mtTape)return;const tp=mtTape;
  const pb=e.target.closest('.mt-presets button');if(pb){const i=+pb.dataset.base;loadBase(i,tp);if(!tp.i){tp.i=1;}autoPalette(i);mtApply(true);return;} /* only an explicit pick changes the display */
  if(e.target.closest('.mt-cass')){tp.c=(tp.c+1)%SHELLS.length;mtApply(false);return;}
  if(e.target.closest('.mt-reroll')){tp.r=1+Math.floor(Math.random()*2147483646);mtApply(true);return;} /* a new seed: new key, mood, chords and hook; the layers and the name stay */
  const kb=e.target.closest('.mt-keys button[data-l]');if(kb){const k=kb.dataset.l,v=+kb.dataset.v;tp[k]=tp[k]===v?0:v;mtApply(true);}}); /* lit: take it out; unlit: put it in */
function keepTape(){if(!mtTape)return;if(mtIsSaved()){mtShow('now');return;}
  if(S.tapes.length>=TAPE_MAX){const i=S.tapes.findIndex(t=>'tape:'+t.id!==S.station);if(i>=0)S.tapes.splice(i,1);} /* never refuse a save: the oldest tape makes room */
  const playing=gen&&gen.id==='tape:draft';mtTape.id=Date.now().toString(36);S.tapes.push(mtTape);draft=null;S.draft=null;draftIn=false;S.station='tape:'+mtTape.id;S.stationName=mtTape.n;if(playing)gen.id=S.station;save();fillStations();mtShow('now');}
/* SAVE TAPE: it names itself (after the outside, the bass or the keys, and the day) and pops out big, in the shell you've been watching */
function saveDraft(){if(!mtTape)return;if(!mtIsSaved()&&isAuto(mtTape))mtTape.n=autoName(mtTape);keepTape();}
mtQ('.mt-save').addEventListener('click',saveDraft);
mtQ('.mt-savedraft').addEventListener('click',()=>{mtTape=draft;saveDraft();});
mtQ('.mt-keepmixing').addEventListener('click',()=>{mtTape=draft;mtShow('build');seqStart();});
mtQ('.mt-make').addEventListener('click',openMixtape);
mtQ('.mt-keep').addEventListener('click',()=>{mtTape=draft;keepTape();});
mtQ('.mt-rename').addEventListener('click',()=>{renaming=!renaming;paintMixtape();if(renaming){const i=mtQ('.mt-name');i.focus();i.select();}});
mtQ('.mt-name').addEventListener('input',e=>{if(!mtTape)return;mtTape.n=e.target.value.replace(/[\u0000-\u001f<>]/g,'').slice(0,24)||'Untitled mixtape';mtQ('.mt-title').textContent=mtTape.n;mtQ('.mt-big').innerHTML=cassetteSVG(mtTape,mtPhase);clearTimeout(e.target._t);e.target._t=setTimeout(()=>mtApply(false),250);}); /* just the name: the music stays exactly as it is */
mtQ('.mt-name').addEventListener('keydown',e=>{if(e.key==='Enter')mtQ('.mt-renamedone').click();});
mtQ('.mt-renamedone').addEventListener('click',()=>{renaming=false;mtApply(false);});
mtQ('.mt-edit').addEventListener('click',()=>{const tp=tapeOf(S.station);if(tp){mtTape=tp;if(!gen)playRadio();mtShow('build');seqStart();}});
mtQ('.mt-again').addEventListener('click',()=>{const tp=tapeOf(S.station);newDraft([tp&&tp.i?tp.s:0,tp?tp.w:0]);mtShow('build');seqStart();});
mtQ('.mt-play').addEventListener('click',()=>{if(gen&&actx&&actx.state!=='running'){actx.resume().then(paintKeys,()=>{});return;}if(!gen)playRadio();paintKeys();});
mtQ('.mt-del').addEventListener('click',()=>{if(!mtIsSaved())return;if(delArm<Date.now()){delArm=Date.now()+4000;paintMixtape();setTimeout(()=>{if(delArm&&delArm<=Date.now()){delArm=0;paintMixtape();}},4100);return;} /* asks once: tap again to delete */
  delArm=0;const id='tape:'+mtTape.id;S.tapes=S.tapes.filter(t=>t!==mtTape);mtTape=null;
  if(S.station===id){const was=!!gen;S.station='gen:late';S.stationName='Late Shift';if(was){genStop(false);setTimeout(()=>genStart('gen:late'),500);}}save();fillStations();mtShow('now');});
setTimeout(()=>{paintMixtape();startSpin();},0); /* after the rest of the page code has loaded (the share card lives further down) */
async function copyTapeLink(b,label){if(!mtTape)return;const url=tapeURL(mtTape);let ok=false;try{await navigator.clipboard.writeText(url);ok=true;}catch(e){}
  b.textContent=ok?'LINK COPIED':'COPY FAILED';mtQ('.mt-note2').textContent=ok?'Paste it anywhere. Whoever opens it hears your tape. It’s also your backup.':url;setTimeout(()=>b.textContent=label,1800);}
/* the share card: the tape, its spot on the dial, the board and Loafie, as a PNG to post or send.
   Link previews can't show a mixtape (crawlers don't run the page), so a picture does that job. */
const tapeURL=tp=>location.origin+location.pathname.replace(/[^/]*$/,'')+'?tape='+encodeTape(tp);
async function tapeCard(tp,opt){opt=opt||{};try{await Promise.all(['900 40px Doto','700 40px Doto','500 24px "IBM Plex Sans"'].map(f=>document.fonts.load(f)));}catch(e){}
  const W0=1200,H0=630,c=document.createElement('canvas');c.width=W0;c.height=H0;const g=c.getContext('2d'),lab=(SHELLS[tp.c]||SHELLS[0]).acc;
  g.fillStyle='#0b0b0e';g.fillRect(0,0,W0,H0);g.fillStyle='rgba(255,255,255,.035)';for(let y=15;y<H0;y+=22)for(let x=15;x<W0;x+=22)g.fillRect(x-1,y-1,2,2);
  const P=cassettePix(tp,0),u=10,X0=56,Y0=Math.round((H0-P.H2*u)/2)-24;
  g.fillStyle='rgba(0,0,0,.45)';g.fillRect(X0+10,Y0+14,P.W2*u,P.H2*u);
  for(let y=0;y<P.H2;y++)for(let x=0;x<P.W2;x++){const v=P.cells[y*P.W2+x];if(v){g.fillStyle=v;g.fillRect(X0+x*u,Y0+y*u,u+.5,u+.5);}}
  P.dots.forEach(([x,y,col])=>{g.beginPath();g.arc(X0+x*u,Y0+y*u,col?u*.43:u*.16,0,7);g.fillStyle=col||'#2a2a30';if(col){g.shadowColor=col;g.shadowBlur=u*.9;}g.fill();g.shadowBlur=0;});
  const nm=tp.n.toUpperCase();g.fillStyle=P.K;g.textAlign='center';g.textBaseline='alphabetic';let fs=38;g.font=`900 ${fs}px Doto, monospace`;while(g.measureText(nm).width>44*u&&fs>18){fs--;g.font=`900 ${fs}px Doto, monospace`;}
  g.fillText(nm,X0+28*u,Y0+8.6*u+(fs<30?0:2));
  const RX=X0+P.W2*u+56,RW=W0-RX-56;g.textAlign='left';
  g.font='900 30px Doto, monospace';g.fillStyle='#f1e7cf';g.fillText('LOAF FM',RX,Y0+26);
  g.font='900 92px Doto, monospace';g.fillStyle=lab;g.shadowColor=lab;g.shadowBlur=22;g.fillText((tp.f/10).toFixed(1),RX-4,Y0+124);g.shadowBlur=0;
  const fw=g.measureText((tp.f/10).toFixed(1)).width;g.font='900 34px Doto, monospace';g.fillText('FM',RX+fw+10,Y0+124);
  const bh=Math.round(RW/4),dh=Math.round(RW*GH/W),by=Y0+P.H2*u-bh-dh-6;
  if(opt.board!==false&&ledC.width){g.fillStyle='#050607';g.fillRect(RX-6,by-6,RW+12,bh+dh+12);g.drawImage(bgC,RX,by,RW,bh);g.drawImage(ledC,RX,by,RW,bh);g.drawImage(gbgC,RX,by+bh,RW,dh);g.drawImage(gledC,RX,by+bh,RW,dh); /* one board, no gap */}
  g.font='500 24px "IBM Plex Sans", sans-serif';g.fillStyle='#a7a3ad';g.fillText(opt.tagline||'Pet cats and chill',X0,H0-50);
  g.textAlign='right';g.fillStyle=lab;g.fillText('loaffm.com',W0-56,H0-50);
  return new Promise(res=>c.toBlob(res,'image/png'));}
/* made ahead of the click, so Share still counts as a tap when the share sheet opens */
let tcBlob=null,tcKey='',tcT=null;
function queueCard(){clearTimeout(tcT);tcT=setTimeout(async()=>{if(!mtTape||mt.hidden)return;const k=JSON.stringify(mtTape);const bl=await tapeCard(mtTape);if(mtTape&&JSON.stringify(mtTape)===k){tcBlob=bl;tcKey=k;}},700);}
async function tapeCardNow(){const k=JSON.stringify(mtTape);if(tcBlob&&tcKey===k)return tcBlob;tcBlob=await tapeCard(mtTape);tcKey=k;return tcBlob;}
const slug=n=>(n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'mixtape')+'-loaffm.png';
mtQ('.mt-share').addEventListener('click',async e=>{if(!mtTape||!mtIsSaved())return;if(!navigator.share){copyTapeLink(e.currentTarget,'SHARE');return;}const url=tapeURL(mtTape),title=mtTape.n+' · Loaf FM',text='“'+mtTape.n+'”, a mixtape on Loaf FM ('+(mtTape.f/10).toFixed(1)+' FM).';
  let data={title,text,url};
  try{const bl=tcBlob&&tcKey===JSON.stringify(mtTape)?tcBlob:null;if(bl){const f=new File([bl],slug(mtTape.n),{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]}))data={title,text:text+' '+url,files:[f]};}}catch(e){}
  try{await navigator.share(data);}catch(e){if(e&&e.name==='AbortError')return;try{await navigator.share({title,text,url});}catch(e2){}}});
mtQ('.mt-card').addEventListener('click',async()=>{if(!mtTape)return;const b=mtQ('.mt-card');b.disabled=true;try{const bl=await tapeCardNow();const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=slug(mtTape.n);document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);}catch(e){}b.disabled=false;});
window.loafCard=tapeCard; /* used to draw the site's own preview image */
/* someone opened a mixtape link: load it as an unsaved tape, ready to play and keep */
if(!BC&&new URLSearchParams(location.search).get('tape')){const tp=decodeTape(new URLSearchParams(location.search).get('tape'));
  if(tp){if(draft&&JSON.stringify(draft)!==JSON.stringify(tp)){if(/^(My|Untitled) mixtape$/.test(draft.n))draft.n=autoName(draft);draft.id=Date.now().toString(36);S.tapes.push(draft);if(S.tapes.length>TAPE_MAX)S.tapes.shift();}draft=tp;keepDraft();S.station='tape:draft';S.stationName=tp.n;draftIn=true;fillStations();mtShow('now');}
  try{const u=new URL(location.href);u.searchParams.delete('tape');history.replaceState(history.state,'',u.pathname+u.search+u.hash);}catch(e){}}
/* ================= Material colour scheme from the palette seed ================= */
const lin=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);};
const gam=v=>{v=v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055;return Math.round(clamp(v,0,1)*255);};
function oklch(hex){const c=hexInt(hex);const r=lin(R(c)),g=lin(G(c)),b=lin(B(c));
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  const A=1.9779984951*l-2.4285922050*m+.4505937099*s,Bb=.0259040371*l+.7827717662*m-.8086757660*s;return {C:Math.hypot(A,Bb),h:Math.atan2(Bb,A)};}
function tone(T,C,h){const L=T<=0?0:(T+16)/116;for(;C>=0;C-=.004){const a=C*Math.cos(h),b=C*Math.sin(h);
  const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.2914855480*b)**3;
  const r=4.0767416621*l-3.3077115913*m+.2309699292*s,g=-1.2684380046*l+2.6097574011*m-.3413193965*s,bb=-.0041960863*l-.7034186147*m+1.7076147010*s;
  if(r>=-.002&&r<=1.002&&g>=-.002&&g<=1.002&&bb>=-.002&&bb<=1.002)return '#'+[r,g,bb].map(v=>gam(v).toString(16).padStart(2,'0')).join('');}const n=gam(L**3).toString(16).padStart(2,'0');return '#'+n+n+n;}
const lightMQ=matchMedia('(prefers-color-scheme: light)');
function isLight(){const t=document.documentElement.dataset.theme;return t==='light'||(t!=='dark'&&lightMQ.matches);}
function applyScheme(){const pp=PALETTES[S.palette]||PALETTES.crt;const seed=pp.seed||pp.primary;const o=oklch(seed);const h=o.h;const chroma=o.C<.01?0:isLight()?.075:.1; /* tonal-spot: fixed primary chroma, hue from the seed; a grey seed gives a monochrome scheme */
  const cs=chroma?.045:0,cn=chroma?(isLight()?.007:.012):0,cv=chroma?.02:0;const light=isLight();
  const t=light?{p:40,onP:100,pc:90,onPc:30,s:40,sc:90,onSc:30,surf:99.6,low:97,con:95,high:92,highest:90,onS:10,onSv:30,out:50,outv:80,inv:20,onInv:95}
               :{p:80,onP:20,pc:30,onPc:90,s:80,sc:30,onSc:90,surf:6,low:10,con:12,high:17,highest:22,onS:90,onSv:80,out:60,outv:30,inv:90,onInv:20};
  const v={'--p':tone(t.p,chroma,h),'--on-p':tone(t.onP,chroma,h),'--p-c':tone(t.pc,chroma,h),'--on-p-c':tone(t.onPc,chroma,h),
    '--s':tone(t.s,cs,h),'--s-c':tone(t.sc,cs,h),'--on-s-c':tone(t.onSc,cs,h),
    '--surf':light?'#fdfdfd':tone(t.surf,cn,h),'--surf-low':tone(t.low,cn,h),'--surf-c':tone(t.con,cn,h),'--surf-high':tone(t.high,cn,h),'--surf-highest':tone(t.highest,cn,h),
    '--on-surf':tone(t.onS,cn,h),'--on-surf-v':tone(t.onSv,cv,h),'--outline':tone(t.out,cv,h),'--outline-v':tone(t.outv,cv,h),'--inv':tone(t.inv,cn,h),'--on-inv':tone(t.onInv,cn,h)};
  /* in light mode the page is nearly pure white; the panel keeps a hint of the palette */
  if(pp.peg&&light){v['--surf-c']='#ecebe6';} /* Pegs in light mode: a putty-coloured case, like 80s electronics */
  /* the case and the page: warm 80s electronics plastic in light mode, nearly-black stereo gear in dark; the palette only tints the accents */
  Object.assign(v,light?{'--surf':'#f7f7f5','--surf-low':'#f1f1ee','--surf-c':'#ebebe8','--surf-high':'#e1e1dd','--surf-highest':'#d6d6d1','--on-surf':'#1d1c21','--on-surf-v':'#55545a','--outline':'#8e8d88','--outline-v':'#d8d7d2','--s-c':'#e1e1dd','--on-s-c':'#1d1c21'}
    :{'--surf':'#121110','--surf-low':'#171614','--surf-c':'#1d1c1a','--surf-high':'#262422','--surf-highest':'#2f2d2a','--on-surf':'#ece6d8','--on-surf-v':'#bdb5a5','--outline':'#77705f','--outline-v':'#3b3833','--s-c':'#34312c','--on-s-c':'#ece6d8'});
  v['--glow']=pp.secondary; /* the MIXTAPE key glows in the palette's lit colour */
  const st=document.documentElement.style;for(const k in v)st.setProperty(k,v[k]);document.documentElement.classList.toggle('light',light);
  const meta=document.querySelector('meta[name=theme-color]');if(meta)meta.content=v['--surf'];}
lightMQ.addEventListener('change',()=>paintKeys());
/* each tile is a tiny board in that palette: tinted unlit dots, clock, label and accent */
function drawPalTile(cv,p,on){const d=Math.min(window.devicePixelRatio||1,2),pt=4*d;cv.width=24*d;cv.height=16*d;const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);
  g.fillStyle='#050607';g.beginPath();g.roundRect(0,0,cv.width,cv.height,3*d);g.fill();const cols=p.peg?p.rainbow.slice(0,6):[p.primary,p.primary,p.secondary,p.mid,p.accent,p.fish];
  for(let y=0;y<4;y++)for(let x=0;x<6;x++){const lit=y>0&&y<3;g.beginPath();g.arc((x+.5)*pt,(y+.5)*pt,pt*.36,0,Math.PI*2);
    if(lit){g.fillStyle=cols[x];g.globalAlpha=on?1:.6;g.shadowColor=cols[x];g.shadowBlur=on?4*d:0;}else{g.globalAlpha=1;g.shadowBlur=0;g.fillStyle=p.off;}g.fill();}g.globalAlpha=1;g.shadowBlur=0;}
/* the display follows the starting track, until someone picks a look by hand */
function autoPalette(base){if(BC||S.palettePicked)return;const id=TRACK_PALETTE[base];if(id&&S.palette!==id){S.palette=id;save();paintKeys();layout();}}
/* DISPLAY: one key, tap for the next look. No panel, nothing opens: the board just changes and says its name. */
const dispKey=$('dispKey');
dispKey.addEventListener('click',()=>{const i=SHOWN_PALETTES.indexOf(S.palette);S.palette=SHOWN_PALETTES[(i+1)%SHOWN_PALETTES.length];S.palettePicked=1;save();paintKeys();layout();dirty=true;}); /* no name flash: the station info stays put */
const playKey=$('playKey');
playKey.addEventListener('click',()=>{if(gen&&actx&&actx.state!=='running'){actx.resume().then(paintKeys,()=>{});return;} /* queued but the browser held it: this tap starts it */
  if(gen){stopRadio();return;}playRadio();
  if(!cat.inBox&&!cat.eat&&!cat.purr&&!cat.goBox&&(cat.state==='sit'||cat.state==='act'))act((performance.now()-t0)/1000,'loaf');}); /* press play and she settles into a loaf */
const volEl=$('volume');volEl.value=S.volume;
function applyVol(){if(gen)gen.master.gain.setTargetAtTime(vol()*levelOf(gen.id),actx.currentTime,.1);}
function setMuted(m){muted=!!m;applyVol();dirty=true;paintKeys();}
const muteKey=$('muteKey');muteKey.addEventListener('click',()=>setMuted(!muted));
volEl.addEventListener('input',()=>{S.volume=+volEl.value;muted=false;applyVol();paintKeys();save();});
function paintKeys(){applyScheme();if(window.__mtPaint)window.__mtPaint();
  const pal=PALETTES[S.palette]||PALETTES.pegs;drawPalTile($('dispTile'),pal,true);dispKey.setAttribute('aria-label','Display: '+pal.name+'. Tap for the next look.');dispKey.title=pal.name+' · tap for the next look';
  const on=playing();playKey.setAttribute('aria-pressed',String(!!on));playKey.title=on?'Stop':'Play';
  if(typeof paintPipMute==='function')paintPipMute(!!on);
  $('volOut').textContent=muted?'Muted':Math.round(S.volume*100);
  muteKey.setAttribute('aria-pressed',String(muted));muteKey.setAttribute('aria-label',muted?'Unmute':'Mute');muteKey.title=muted?'Unmute':'Mute';volEl.closest('.vol').classList.toggle('muted',muted);
  volEl.style.setProperty('--v',(S.volume*100)+'%');}


/* ================= A cat on the desk (she lives on the 128x16 strip) ================= */
const gfb=new Int32Array(W*GH);
const KIT=['..##......##..','..#p#....#p#..','..##########..','.#####hh#####.','#############s','####o#####o##s','####o#####o##s','######hmh####s','.###########s.','...#######s...','#.########ss..','#.s#.#s.#ss...'];
const KIT_STEP=['..##......##..','..#p#....#p#..','..##########..','.#####hh#####.','#############s','####o#####o##s','####o#####o##s','######hmh####s','.###########s.','...#######s...','#.########ss..','#.#s##.s.s#...'];
const KIT_PET=KIT.map((r,j)=>j===5?'#############s':j===6?'####oo###oo##s':r); /* eyes closed happy: two flat dots each */
const KIT_SLEEP=['.##......##...','.##########...','###########s.#','###########s.#','.sssssssssss.s'];
/* her idle moments: loafing, grooming, a yawn, glancing about (an ear twitch first), looking up at the sky, and a big stretch when she wakes */
const KIT_LOAF=['..............','..............','..##......##..','..#p#....#p#..','..##########..','.#####hh#####.','#############s','####oo###oo##s','######hmh####s','.###########s.','#############s','.sssssssssss..'];
const KIT_GROOM=['..##......##..','..#p#....#p#..','..##########..','.#####hh#####.','#############s','#############s','####oo###oo##s','######mss####s','.#####sss###s.','...####ss#s...','#.#####.##ss..','#.s#.#s.#ss...'];
const KIT_YAWN=['..##......##..','..#p#....#p#..','..##########..','.#####hh#####.','#############s','####o#####o##s','####o#####o##s','#####mmm#####s','.####mmm####s.','...#######s...','#.########ss..','#.s#.#s.#ss...'];
const KIT_UP=['..##......##..','..#p#....#p#..','..##########..','.#####hh#####.','####o#####o##s','####o#####o##s','#############s','######hmh####s','.###########s.','...#######s...','#.########ss..','#.s#.#s.#ss...'];
const KIT_LOOK=['..##......##..','..#p#....#p#..','..##########..','.#####hh#####.','#############s','###o#####o###s','###o#####o###s','######hmh####s','.###########s.','...#######s...','#.########ss..','#.s#.#s.#ss...'];
const KIT_LOOKR=['..##......##..','..#p#....#p#..','..##########..','.#####hh#####.','#############s','#####o#####o#s','#####o#####o#s','######hmh####s','.###########s.','...#######s...','#.########ss..','#.s#.#s.#ss...'];
const KIT_EAR=['..##..........','..#p#...###...','..##########..','.#####hh#####.','#############s','####o#####o##s','####o#####o##s','######hmh####s','.###########s.','...#######s...','#.########ss..','#.s#.#s.#ss...'];
const KIT_STRETCH=['..##......##..','..#p#....#p#..','..##########..','.#####hh#####.','#############s','####o#####o##s','####o#####o##s','######hmh####s','############s.','#..#######s...','#..#######s...','#.########ss..','..s#.#s.#ss...']; /* stretches up tall, tail straight up */
const HEART=['.#.#.','#####','.###.','..#..'];
const ZEE=['####','..#.','.#..','####'];
const cat={x:60,dir:1,state:'sit',until:3,target:null,eat:null,blink:0,nextBlink:4,zt:0,purr:false,hearts:[],ht:0,pets:0,bob:0,earAt:-9};
/* what kind of groove is on: 'beat' (drums), 'chip' (the 8-bit start) or 'ambient' (no drums). She behaves accordingly. */
function grooveKind(){if(!playing())return 'none';const tp=tapeOf(S.station);if(tp)return tp.d===0?'ambient':(tp.i?tp.s===3:tp.k===4)?'chip':'beat';return S.station==='gen:desert'||CALM.some(c=>c.id===S.station)?'ambient':'beat';}
let purrNode=null;
const ACT_WORDS={loaf:'loafing',groom:'grooming',yawn:'yawning',glance:'looking around',stretch:'stretching'};
function catWords(){if(cat.inBox)return cat.state==='sleep'?'asleep in her box':cat.purr?'purring in her box':'in her box';if(cat.state==='hop')return 'hop!';if(cat.state==='sleep'&&cat.away)return 'dozing till you get back';if(cat.state==='act'&&ACT_WORDS[cat.act])return ACT_WORDS[cat.act];if(cat.state==='eat')return 'eating a fish';if(cat.state==='fed')return 'happy and full';if(cat.purr)return 'purring';if(cat.state==='sleep')return 'asleep';if(cat.state==='walk')return 'wandering';
  return {rain:'watching the rain',snow:'watching the snow',leaves:'watching leaves fall',petals:'watching petals',fireflies:'watching fireflies'}[skyNow]||(cat.aloof?'pretending not to hear you':isNight(NOW())?'moon gazing':'on the desk');}
function pick(t,now){const night=nightDim(now)<.7;let r=Math.random();const gk=grooveKind();if(gk==='ambient'&&r<.5)r=.52+r*.2;else if(gk==='chip'&&r>.9)r=.3+(r-.9)*2; /* ambient: more loafing, less wandering; 8-bit: she stays up and about */
  if(night&&r<.6){cat.state='sleep';cat.until=t+15+Math.random()*25;return;}
  if(r<(RM.matches?.1:.25)){cat.state='walk';cat.target=DESK_MIN+Math.random()*(W-14-DESK_MIN);return;}
  if(r<.52){cat.state='sit';cat.until=t+5+Math.random()*8;cat.aloof=Math.random()<.2;return;}
  if(r<.62)return act(t,'loaf');
  if(r<.70)return act(t,'groom');
  if(r<.74)return act(t,'yawn');
  if(r<.83)return act(t,'glance');
  if(r<.86&&(skyNow!=='clear'||isNight(now)))return act(t,'lookup');
  if(r<.86){cat.state='sit';cat.until=t+5+Math.random()*6;return;}
  if(r<.94){cat.goBox=true;cat.state='walk';cat.target=BOX_OUT;return;} /* if it fits, she sits */
  cat.state='sleep';cat.until=t+10+Math.random()*15;}
/* her cardboard box, at the left end of the desk: tan whatever the palette, flaps open */
const BOX_X=2,BOX_IN=BOX_X+3,BOX_OUT=BOX_X+21,DESK_MIN=BOX_OUT;
/* her entrance, once per browser session: peeking over the box straight away, then a hop out at about 1.15 s and a
   little walk to the keyboard. Reduced motion skips it (she's just sitting there). Touching the desk finishes it. */
let entering=false,blink12=0; /* blink12: a fresh session opens with the clock blinking 12:00, like every VCR nobody set */
if(!BC&&!RM.matches){try{if(!sessionStorage.getItem('loafIn')){sessionStorage.setItem('loafIn','1');entering=true;blink12=performance.now()+4200;}}catch(e){}}
if(entering){cat.inBox=true;cat.x=BOX_IN;cat.dir=1;cat.state='box';cat.t0=-.5;cat.until=1.15;cat.next=Math.round(W/2-10);}
function endEntrance(){if(!entering)return;entering=false;if(cat.inBox||cat.state==='hop'){const t=(performance.now()-t0)/1000;cat.inBox=false;cat.x=BOX_OUT;cat.next=null;cat.hop=null;cat.state='sit';cat.until=t+4;dirty=true;}}
const BOX=['X..................X','.X................X.','..LLLLLLLLLLLLLLLL..','..HTTTTTTTKKTTTTTD..','..HTTTTTTTKKTWWWWD..','..HTTTTTTTKKWWWWTD..','..SSSSSSSSSSSSSSSS..']; /* H lit side, D shaded side, S shadow at the base, K packing tape, W a crooked shipping label */
const BOXC={X:0xb8894f,L:0xdcb47a,H:0xd1a86f,T:0xc49a62,D:0x8f6b3d,S:0xa07a4a,K:0xae8550,W:0xece2cf};
function hop(t,into){cat.state='hop';cat.hop={x0:cat.x,x1:into?BOX_IN:BOX_OUT,t0:t,d:.65,into};cat.dir=into?-1:1;cat.inBox=false;}
const ACT_LEN={loaf:[8,16],groom:[2.5,4],yawn:[1.4,1.4],glance:[2.6,2.6],lookup:[4,8],stretch:[1.8,1.8]};
function act(t,a,...next){cat.aloof=false;if(cat.inBox){cat.state='box';cat.t0=t;cat.until=t+6+Math.random()*8;return;}cat.state='act';cat.act=a;cat.t0=t;const [lo,hi]=ACT_LEN[a];cat.until=t+lo+Math.random()*(hi-lo);cat.queue=next;}
/* when you've been away from the page for a while she curls up; when you come back she wakes, yawns, stretches and wanders over */
const AWAY_MS=10*60*1000;let lastActive=Date.now();
function noteActive(){lastActive=Date.now();if(cat.away){cat.away=false;if(!cat.nap){act((performance.now()-t0)/1000,'yawn','stretch');cat.comeOver=true;}}}
function catStep(t,dt,now){
  if(cat.purr){cat.ht-=dt;if(cat.ht<=0){cat.hearts.push({x:cat.x+(Math.random()<.5?-2:12),y:2,a:1,dx:(Math.random()-.5)*2});cat.ht=.7+Math.random()*.4;cat.pets++;
      if(cat.pets>6&&cat.state!=='sleep'){cat.state='sleep';cat.until=t+25+Math.random()*25;cat.purr=false;purrStop();}}return;} /* pet her past six hearts and she dozes off */
  if(cat.state==='hop'){const h=cat.hop,q=(t-h.t0)/h.d;if(q<1){cat.x=h.x0+(h.x1-h.x0)*q;return;}cat.x=h.x1;
    entering=false;if(h.into){cat.inBox=true;cat.state='box';cat.t0=t;cat.until=t+12+Math.random()*16;}else if(cat.next!=null){cat.state='walk';cat.target=cat.next;cat.next=null;}else{cat.state='sit';cat.until=t+3+Math.random()*4;}return;}
  if(cat.nap){if(cat.inBox){cat.state='box';cat.until=t+60;}else cat.state='sleep';return;} /* Z: she naps until you wake her */
  if(!BC&&!cat.away&&Date.now()-lastActive>AWAY_MS&&!cat.eat&&cat.state!=='fed'){cat.away=true;cat.state='sleep';cat.until=Infinity;return;}
  if(!cat.eat&&cat.state!=='fed'&&treats.length){const tr=treats.reduce((a,b)=>Math.abs(b.x-cat.x-5)<Math.abs(a.x-cat.x-5)?b:a); /* a treat always wakes her up */
    cat.eat=tr;cat.goBox=false;cat.state='walk';cat.target=clamp(tr.x+2>cat.x+7?tr.x-11:tr.x-1,DESK_MIN,W-14);}
  if(cat.inBox&&cat.state==='walk'){cat.next=cat.target;hop(t,false);return;} /* hop out first */
  if(cat.state==='box'){if(t>cat.until)hop(t,false);return;}
  if(cat.state==='act'){if(t>cat.until){if(cat.queue&&cat.queue.length){act(t,...cat.queue);}else if(cat.comeOver){cat.comeOver=false;cat.state='walk';cat.target=clamp(W/2-7+(Math.random()-.5)*16,DESK_MIN,W-14);}else{cat.state='sit';cat.until=t+3+Math.random()*4;}}return;}
  if(cat.state==='walk'){const d=cat.target-cat.x;const step=12*dt;if(Math.abs(d)<=step){cat.x=cat.target;if(cat.eat){cat.state='eat';cat.until=t+EAT_S;cat.ht=.3;cat.dir=cat.eat.x+2>cat.x+7?1:-1;munch();purrStart();}else if(cat.goBox){cat.goBox=false;hop(t,true);}else{cat.state='sit';cat.until=t+4+Math.random()*6;}}else{cat.dir=Math.sign(d);cat.x+=cat.dir*step;}return;}
  if(cat.state==='eat'||cat.state==='fed'){cat.ht-=dt;if(cat.ht<=0){cat.hearts.push({x:cat.x+(Math.random()<.5?-2:12),y:2,a:1,dx:(Math.random()-.5)*2});cat.ht=cat.state==='eat'?.55:.8;} /* purring and hearts while she eats, and a little after */
    if(t>cat.until){if(cat.state==='eat'){treats=treats.filter(x=>x!==cat.eat);cat.eat=null;cat.state='fed';cat.until=t+3;}else{purrStop();cat.state='sit';cat.until=t+4+Math.random()*4;}}return;}
  if(t>cat.until){if(cat.state==='sleep'&&!cat.away)return act(t,'yawn','stretch');pick(t,now);}}
const flipped=new Map();
function facing(sp){if(cat.dir>0)return sp;let f=flipped.get(sp);if(!f){f=sp.map(row=>{const a=row.split('').reverse();for(let i=1;i<a.length;i++)if(a[i]==='o'&&a[i-1]==='#'){a[i-1]='o';a[i]='#';}return a.join('');});flipped.set(sp,f);}return f;} /* mirrored, eyes one dot toward where she's going */
let SHADE=0,EARC=0,HIC=0;
function blit(sp,x,y,c,eyesOpen=true,still=false){if(!still)sp=facing(sp);sp.forEach((row,j)=>{for(let i=0;i<row.length;i++){const ch=row[i];if(ch==='.')continue;const xx=x+i,yy=y+j;if(xx<0||yy<0||xx>=W||yy>=GH)continue;gfb[yy*W+xx]=ch==='s'?SHADE:ch==='p'?EARC:ch==='h'?HIC:ch==='o'?(eyesOpen?-1:c):ch==='m'?-1:ch==='w'?dim(c,.7):c;}});}

/* ================= The desk's sky (no location needed) =================
   Night brings stars (no moon: nothing big hanging over the desk). The season comes from the date, flipped for the southern
   hemisphere when the device's time zone is there. Each day has its own weather, picked from the date, so it's the
   same all day and on every device. Try ?sky=rain, snow, leaves, petals or fireflies, and &night for the night sky. */
const SKYQ=new URLSearchParams(location.search),SKY_FORCE=(SKYQ.get('sky')||'').toLowerCase(),NIGHT_FORCE=SKYQ.has('night');
const SOUTH=(()=>{try{return /^(Australia|Antarctica|Pacific\/(Auckland|Chatham|Fiji|Tongatapu|Apia|Noumea)|America\/(Sao_Paulo|Argentina|Buenos_Aires|Santiago|Montevideo|Asuncion|La_Paz|Lima|Punta_Arenas)|Africa\/(Johannesburg|Maputo|Harare|Windhoek|Gaborone|Lusaka|Maseru|Mbabane|Blantyre|Lubumbashi)|Indian\/(Mauritius|Reunion|Antananarivo))/.test(Intl.DateTimeFormat().resolvedOptions().timeZone||'');}catch(e){return false;}})();
function season(d){let m=d.getMonth();if(SOUTH)m=(m+6)%12;return m===11||m<2?'winter':m<5?'spring':m<8?'summer':'autumn';}
function dayRand(d){let h=d.getFullYear()*400+d.getMonth()*32+d.getDate();h=Math.imul(h^h>>>15,2246822507);h=Math.imul(h^h>>>13,3266489909);return ((h^h>>>16)>>>0)/4294967296;}
function isNight(d){if(NIGHT_FORCE)return true;const h=d.getHours();return h>=20||h<6;}
/* while something plays, the sky goes with it; otherwise it follows the season and the day */
const STATION_SKY={'gen:window':'rain','gen:rain':'rain','gen:late':'stars','gen:desert':'stars','gen:waves':'stars','gen:fire':'stars','gen:crt':'matrix','gen:sunday':'leaves','gen:purr':'plain','gen:brown':'plain'};
function skyKind(d){if(SKY_FORCE)return SKY_FORCE;
  if(gen){if(STATION_SKY[gen.id])return STATION_SKY[gen.id];const tp=tapeOf(gen.id);
    if(tp)return tp.w===1?'rain':tp.w===2||tp.w===3?'stars':tp.w===4?'plain':(tp.k===4?'matrix':'stars');} /* a tape: its atmosphere, or stars (code rain for 8-bit) */
  const s=season(d),r=dayRand(d);
  if(s==='winter')return r<.45?'snow':r<.6?'rain':'clear';
  if(r<.18)return 'rain';
  return s==='autumn'?'leaves':s==='spring'?'petals':isNight(d)?'fireflies':'clear';}
function outsideNow(){if(!gen)return 0;const tp=tapeOf(gen.id);if(tp)return tp.w;return {'gen:rain':1,'gen:window':1,'gen:waves':2,'gen:fire':3,'gen:purr':4}[gen.id]||0;}
const TINT=[null,['#7fb4e6','#a9d4ff'],['#5fe0d6','#a6fff4'],['#ff8a3d','#ef5548','#ffc06b'],['#f7d7c4','#f4a9c8']];
function tint(t){const w=outsideNow();if(!w)return;const cols=TINT[w].map(hexInt),n=RM.matches?2:4;
  for(let i=0;i<n;i++){const k=Math.floor(t*(w===3?2.2:.5)+i*7.3),h=Math.abs(Math.sin(k*12.9898+i)*43758.5)%1,a=w===3?.35+.4*Math.abs(Math.sin(t*9+i*3)):.25+.2*Math.sin(t*1.3+i);
    if(w===4){put(cat.x+3+h*10,6+((i*3)%5),dim(cols[i%2],Math.max(.12,a*.8)));continue;} /* a soft glow around her while she purrs */
    put((h*W+i*31)%W,w===3?11+(i%2):w===2?12:10+(i%3),dim(cols[i%cols.length],a));}} /* the fire reflecting off the radio; rain and sea in cooler glints */
function moonPhase(d){const p=((d.getTime()-Date.UTC(2000,0,6,18,14))/864e5/29.530588853)%1;return p<0?p+1:p;}
function put(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&x<W&&y>=0&&y<13)gfb[(y+2)*W+x]=c;} /* the sky sits in the 13 rows above the desk */
function drawSky(t,P,now){const peg=k=>[P.A,P.HI,P.FISH,P.S2][k],kind=skyKind(now);
  if(isNight(now)||kind==='stars'){
    for(let i=0;i<(kind==='stars'?14:9);i++){const sx=(i*23+Math.floor(t*(.3+i*.15)))%W;put(W-1-sx,(i*5)%9,dim(i%4?P.HI:P.FISH,i%4?.38:.5));}} /* stars, one in four warm */
  if(kind==='stars'){ /* now and then a meteor: a bright head and a fading tail, across and down */
    const per=11,k=Math.floor(t/per),ph=t-k*per,h=Math.abs(Math.sin(k*91.7+3.1)*43758.5)%1;
    if(h<.75&&ph<1){const x0=12+h*85,y0=Math.floor(h*10)%3,q=ph;for(let j=0;j<7;j++){const qq=q-j*.035;if(qq<0)continue;put(x0+qq*30,y0+qq*8,dim(P.HI,(1-j/7)*(q<.8?1:(1-q)*5)));}}}
  else if(kind==='matrix'){ /* CRT: falling code that wobbles sideways, and a scanline glitch now and then */
    const cc=P.PEG?P.PEG[3]:P.A,wob=Math.round(Math.sin(t*2.3)*Math.sin(t*.7)*1.4);
    for(let i=0;i<(RM.matches?5:9);i++){const sp=3+(i*7%5),x=(i*14+5+wob+W)%W,head=(t*sp+i*5.3)%19-3;
      for(let j=0;j<4;j++){const y=Math.floor(head)-j;if(y>=0&&y<13)put(x,y,dim(cc,j?.55-j*.12:.95));}}
    const g=t%6.5;if(g<.18){const y=Math.floor((t*7)%13);for(let x=0;x<W;x+=2)put(x+(Math.floor(t*40)%2),y,dim(cc,.35));}}
  else if(kind==='rain'){const rc=P.PEG?dim(P.HI,.8):peg(3);for(let i=0;i<(RM.matches?8:16);i++){const y=(t*10+i*4.3)%13,x=(i*8+5-y*.5+W)%W;put(x,y,dim(rc,.6));put(x+.5,y-1,dim(rc,.25));}} /* rain is blue on the pegboard */
  else if(kind==='snow')for(let i=0;i<(RM.matches?7:14);i++){const y=(t*2.2+i*3.7)%13,x=(i*9.1+Math.sin(t*.8+i)*2.2+W)%W;put(x,y,dim(P.HI,.8));}
  else if(kind==='leaves')for(let i=0;i<(RM.matches?4:8);i++){const y=(t*1.6+i*2.9)%13,sw=Math.sin(t*1.1+i*2),x=((i*16.3+sw*4+t*1.5)%W+W)%W,c=dim(peg([0,2,0,2,1,0,2,0][i]),.85);put(x,y,c);put(x+1,y+(sw>0?1:-1),dim(c,.6));} /* two-dot leaves that tumble as they fall */
  else if(kind==='petals')for(let i=0;i<(RM.matches?5:9);i++){const y=(t*1.3+i*2.1)%13,sw=Math.sin(t*.9+i*1.7),x=((i*14.7+sw*5+t*1.2)%W+W)%W,c=i%3?0xff9ec4:dim(P.C,.7);put(x,y,c);if(sw>.3)put(x+1,y,dim(c,.5));}
  else if(kind==='fireflies')for(let i=0;i<(RM.matches?3:5);i++){const a=Math.sin(t*1.7+i*2.1);if(a<.2)continue;const x=(i*26+Math.sin(t*.4+i)*6+W)%W,y=2+(((i*5+Math.sin(t*.6+i*1.7)*3)%8)+8)%8;put(x,y,dim(i%2?peg(1):peg(2),a));}
  return kind;}
let skyNow='clear';
let glast=0;
function drawGame(t){const P=pal();SHADE=P.MID;HIC=P.HI;EARC=P.PEG?P.PEG[5]:dim(P.A,.85);const now=NOW();const FIELD=R(P.BG)+G(P.BG)+B(P.BG)>0?dim(P.BG,.6):-1;gfb.fill(FIELD);const dt=Math.min(.05,glast?t-glast:0);glast=t;catStep(t,dt,now);const ground=15;
  skyNow=drawSky(t,P,now);tint(t);
  for(let x=0;x<W;x++){const major=x%4===0;gfb[(ground+1)*W+x]=P.PEG?FIELD:P.DEEP;
    gfb[ground*W+x]=P.PEG?dim(P.PEG[(x>>2)%P.PEG.length],major?1:.8):major?P.S2:P.MID;} /* the desk edge (on the pegboard, a rainbow line of pegs, four of each colour) */
  drawKeys(P,ground);
  for(const tr of treats){if(tr.y<ground-3){tr.vy+=70*dt;tr.y=Math.min(ground-3,tr.y+tr.vy*dt);if(tr.y>=ground-3)plip();} /* the treat drops onto the desk */
    const bite=cat.state==='eat'&&cat.eat===tr?clamp((cat.until-t)/EAT_S,0,1):1;if(bite>0)blit(FISH,Math.round(tr.x),Math.round(tr.y),dim(P.FISH,.35+.65*bite),true,true);}
  const on=playing();const cx=Math.round(cat.x);const gk=on?grooveKind():'none';
  /* she listens: on a kick she dips (bobs her head) if she's up; a hat flicks an ear now and then */
  if(on&&gk!=='ambient'&&gk!=='none'&&t-groove.kickAt<.02&&!cat.purr&&(cat.state==='sit'||cat.state==='walk'||(cat.state==='act'&&cat.act==='loaf')))cat.bob=gk==='chip'?2:1;
  if(cat.bob&&t-groove.kickAt>.14)cat.bob=0;
  if(on&&t-groove.hatAt<.02&&t-cat.earAt>1.2&&Math.random()<.35&&cat.state==='sit'&&!cat.purr)cat.earAt=t;
  const gy=ground+cat.bob; /* her ground line: a dip on the kick */
  cat.nextBlink-=dt;if(cat.nextBlink<0){cat.blink=.15;cat.nextBlink=3+Math.random()*4;}cat.blink-=dt;
  const eyesOpen=!cat.purr&&cat.blink<=0;
  if(cat.state==='hop'){const h=cat.hop,q=clamp((t-h.t0)/h.d,0,1);blit(KIT_STEP,cx,gy-12-Math.round(Math.sin(Math.PI*q)*3),P.C,true);}
  else if(cat.state==='box'&&!cat.purr){const ph=(t-cat.t0)%7,duck=ph>3&&ph<5;blit(duck?KIT.slice(0,9):KIT,cx,gy-12+(duck?3:0),P.C,eyesOpen);} /* peeking over the edge, ducking down now and then */
  else if(cat.state==='sleep'){blit(KIT_SLEEP,cx,gy-5,P.C);
    cat.zt+=dt;const ph=cat.zt%3.5;if(ph<2){const zx=cat.dir>0?cx+15:cx-5,zy=Math.round(9-ph*3);blit(ZEE,zx,zy,dim(P.S2,.6*(1-ph/2)+.2));}}
  else if(cat.purr||cat.state==='fed')blit(KIT_PET,cx,gy-12,P.C,true);
  else if(cat.state==='eat'){const dn=Math.floor(t*5)%2;blit(dn?KIT:KIT_PET,cx,gy-12+dn,P.C,!dn);} /* nom: eyes shut on each bite, happy squint between */
  else if(cat.state==='act'){const a=cat.act,e=t-cat.t0;
    if(a==='loaf')blit(KIT_LOAF,cx,gy-12,P.C,true);
    else if(a==='groom'){const f=Math.floor(e*3)%2;blit(KIT_GROOM,cx,gy-12+f,P.C,true);}
    else if(a==='yawn')blit(KIT_YAWN,cx,gy-12,P.C,false);
    else if(a==='glance')blit(e<.5?(Math.floor(e*8)%2?KIT_EAR:KIT):e<1.4?KIT_LOOK:e<2.2?KIT_LOOKR:KIT,cx,gy-12,P.C,eyesOpen);
    else if(a==='lookup')blit(KIT_UP,cx,gy-12,P.C,eyesOpen);
    else if(a==='stretch')blit(KIT_STRETCH,cx,gy-13,P.C,false);
    else blit(t-cat.earAt<.14?KIT_EAR:KIT,cx,gy-12,P.C,eyesOpen);}
  else if(cat.state==='walk'){const f=Math.floor(t*6)%2;blit(f?KIT_STEP:KIT,cx,gy-12,P.C,eyesOpen);}
  else blit(t-cat.earAt<.14?KIT_EAR:KIT,cx,gy-12,P.C,eyesOpen);
  if(on&&cat.state!=='sleep'){const tw=Math.round(vu(t)[2]*2);for(let k=0;k<tw;k++){const tx=cat.dir>0?cx-1-k:cx+14+k;if(tx>=0&&tx<W)gfb[(gy-1-k)*W+tx]=P.C;}} /* her tail flicks to the music */
  BOX.forEach((row,j)=>{for(let i=0;i<row.length;i++){const ch=row[i];if(ch!=='.')gfb[(ground-7+j)*W+BOX_X+i]=BOXC[ch];}}); /* the box goes in front of her */
  for(const hh of cat.hearts){hh.y-=dt*4;hh.x+=hh.dx*dt;hh.a-=dt*.35;if(hh.a>0)blit(HEART,Math.round(hh.x),Math.round(hh.y),dim(P.A,Math.max(.25,hh.a)));}
  cat.hearts=cat.hearts.filter(hh=>hh.a>0&&hh.y>-4);}
/* She lives on the synth. Under the desk edge are 32 white keys, four dots each (three lit, one gap), C2 up to G6.
   The gaps under the top row are filled where a black key sits, so the 2-and-3 pattern shows once you look.
   Each note the music plays lights its key for a moment (folded into range by octaves). */
const WHITE=[0,-1,1,-1,2,3,-1,4,-1,5,-1,6],BLACK_AFTER=[1,1,0,1,1,1,0]; /* white index per pitch class; is there a black key after each white key */
function drawKeys(P,ground){const r1=ground+1,r2=ground+2;if(r2>=GH)return;const face=P.PEG?dim(0xffffff,.15):dim(P.HI,.15),blk=P.PEG?dim(0xffffff,.05):dim(P.HI,.055);
  for(let k=0;k<32;k++){const x=k*4;for(let i=0;i<3;i++){gfb[r1*W+x+i]=face;gfb[r2*W+x+i]=face;}
    gfb[r2*W+x+3]=-1;gfb[r1*W+x+3]=BLACK_AFTER[k%7]?blk:-1;}} /* the keys stay dark: lit with the melody they read as the cat stepping on them */
/* touch: tap her to pet (she purrs while you hold); tap the desk and she mews and walks over */
function ensureAudio(){if(!actx){actx=new (window.AudioContext||window.webkitAudioContext)();actx.addEventListener('statechange',()=>{dirty=true;if(typeof paintKeys==='function')paintKeys();});}if(actx.state==='suspended')actx.resume();return actx;}
function purrStart(){if(purrNode)return;try{const a=ensureAudio();const o=a.createOscillator();o.type='sawtooth';o.frequency.value=27;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=140;
    const g=a.createGain();g.gain.value=0;const lfo=a.createOscillator();lfo.frequency.value=5.5;const lg=a.createGain();lg.gain.value=.045;lfo.connect(lg).connect(g.gain);
    o.connect(lp).connect(g).connect(a.destination);o.start();lfo.start();g.gain.linearRampToValueAtTime(.06,a.currentTime+.3);purrNode={o,lfo,g};}catch(e){}}
function purrStop(){if(!purrNode)return;const n=purrNode;purrNode=null;try{n.g.gain.linearRampToValueAtTime(0,actx.currentTime+.4);setTimeout(()=>{n.o.stop();n.lfo.stop();},500);}catch(e){}}
/* calling her over: a soft, breathy "pspsps" made from filtered noise, no tone at all */
let noiseBuf=null;
function mew(){try{const a=ensureAudio();if(!noiseBuf){noiseBuf=a.createBuffer(1,a.sampleRate*.25,a.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
    const t0=a.currentTime+.02,n=3+Math.floor(Math.random()*2);
    for(let i=0;i<n;i++){const t=t0+i*(.15+Math.random()*.03);
      /* the "p": a tiny, dull puff of air */
      const p=a.createBufferSource();p.buffer=noiseBuf;const pl=a.createBiquadFilter();pl.type='lowpass';pl.frequency.value=900;const pg=a.createGain();
      pg.gain.setValueAtTime(0,t);pg.gain.linearRampToValueAtTime(.025,t+.004);pg.gain.exponentialRampToValueAtTime(.0001,t+.03);p.connect(pl).connect(pg).connect(a.destination);p.start(t,Math.random()*.1,.04);
      /* the "s": soft hiss, high and narrow */
      const s=a.createBufferSource();s.buffer=noiseBuf;const hp=a.createBiquadFilter();hp.type='highpass';hp.frequency.value=4200;const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.value=6800+Math.random()*600;bp.Q.value=1.2;
      const sg=a.createGain();const len=.09+Math.random()*.03;sg.gain.setValueAtTime(0,t+.02);sg.gain.linearRampToValueAtTime(.05,t+.04);sg.gain.linearRampToValueAtTime(.035,t+.02+len*.6);sg.gain.exponentialRampToValueAtTime(.0001,t+.02+len);
      s.connect(hp).connect(bp).connect(sg).connect(a.destination);s.start(t+.02,Math.random()*.1,len+.02);}}catch(e){}}
function catHit(e){const r=gameWin.getBoundingClientRect();const x=camX+(e.clientX-r.left)/r.width*(W/ZOOM);return {x,near:Math.abs(x-(cat.x+7))<(COARSE.matches?12:9)};} /* on a touch screen the target is a thumb wide */
const COARSE=matchMedia('(pointer:coarse)');
/* treats: tap the fish button whenever you like and one drops onto the desk near her; she trots over and eats it */
let treats=[];const EAT_S=2.4;
function dropTreat(){if(treats.length>=4)return;let x=cat.dir>0?cat.x+22:cat.x-9;if(x<1||x>W-6)x=cat.dir>0?cat.x-9:cat.x+22;x=clamp(x+Math.round((Math.random()-.5)*6),BOX_OUT+12,W-6);
  for(const o of treats)if(Math.abs(o.x-x)<6)x=clamp(o.x+(x<o.x?-6:6),BOX_OUT+12,W-6);treats.push({x,y:-3,vy:0});dirty=true;}
function plip(){try{const a=ensureAudio(),t0=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(900,t0);o.frequency.exponentialRampToValueAtTime(420,t0+.08);
  g.gain.setValueAtTime(.035,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.12);o.connect(g).connect(a.destination);o.start(t0);o.stop(t0+.14);}catch(e){}} /* a tiny plip as it lands */
function munch(){try{const a=ensureAudio(),t0=a.currentTime;for(let k=0;k<3;k++){const t=t0+.15+k*.42,s=a.createBufferSource(),n=a.sampleRate*.05,bf=a.createBuffer(1,n,a.sampleRate),d=bf.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);s.buffer=bf;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1100;const g=a.createGain();g.gain.value=.05;s.connect(lp).connect(g).connect(a.destination);s.start(t);}}catch(e){}} /* three soft little crunches */
document.addEventListener('pointerdown',()=>{blink12=0;},{capture:true});
gameWin.addEventListener('pointerdown',e=>{e.preventDefault();endEntrance();if(cat.nap){napEnd();return;}const hit=catHit(e);
  if(cat.eat||cat.state==='fed'||cat.state==='hop')return; /* let her eat (or land) in peace */
  if(hit.near){if(!S.petSeen){S.petSeen=1;save();if(petHint)petHint.hidden=true;}cat.purr=true;cat.pets=0;if(cat.state!=='sleep'&&!cat.inBox)cat.state='sit';purrStart();}
  else if(hit.x<BOX_X+20){if(cat.nap)napEnd(true);if(cat.inBox){cat.t0=(performance.now()-t0)/1000-3;return;} /* tap the box: she ducks; or she comes and climbs in */
    cat.purr=false;purrStop();mew();cat.goBox=true;cat.state='walk';cat.target=BOX_OUT;}
  else{if(cat.nap)napEnd(true);cat.purr=false;purrStop();mew();cat.goBox=false;cat.state='walk';cat.target=clamp(hit.x-7,DESK_MIN,W-14);}});
['pointerup','pointerleave','pointercancel'].forEach(ev=>gameWin.addEventListener(ev,()=>{if(cat.purr){cat.purr=false;purrStop();if(cat.state!=='sleep'){const tt=(performance.now()-t0)/1000;if(cat.inBox){cat.state='box';cat.until=Math.max(cat.until||0,tt+8);}else{cat.state='sit';cat.until=tt+6;}}}}));
function paintGame(){gameWin.hidden=false;layout();}
/* first visit on a touch screen: one small hint, gone for good after the first pet */
petHint=document.createElement('div');petHint.className='pethint';petHint.textContent='Pet Loafie';petHint.hidden=true;petHint.setAttribute('aria-hidden','true');gameWin.appendChild(petHint);
if(!BC&&!S.petSeen&&matchMedia('(pointer:coarse)').matches)petHint.hidden=false;


/* ================= Idle fade, keyboard, init ================= */
let idleT;function wake(){noteActive();document.body.classList.remove('idle');clearTimeout(idleT);idleT=setTimeout(()=>document.body.classList.add('idle'),10000);}
['pointermove','pointerdown','keydown','touchstart','focusin','scroll','wheel'].forEach(ev=>document.addEventListener(ev,wake,{passive:true}));wake();
/* No keyboard shortcuts on purpose: people type in other windows, and a stray key should never stop the music.
   Every control is still a normal button, so Tab and Enter work for keyboard users. */
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)){navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>{document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')r.update().catch(()=>{});});}).catch(()=>{}); /* check for a new service worker on every visit and whenever the tab comes back */}
paintKeys();paintGame();


/* ================= Z: Loafie naps =================
   A cat thing, not a mode: tap Z and she curls up (in her box, if she's in it); tap again and she wakes, yawns,
   stretches and carries on. The music doesn't care either way. A fish, or calling her, wakes her too. */
const FISH=['.##.#','####.','.##.#'];
const sitKey=$('sitKey');
function napStart(){cat.nap=true;cat.purr=false;purrStop();cat.goBox=false;cat.comeOver=false;cat.away=false;if(cat.state==='walk'||cat.state==='hop'){cat.target=null;}paintNap();dirty=true;}
function napEnd(quiet){cat.nap=false;const t=(performance.now()-t0)/1000;if(!quiet)act(t,'yawn','stretch');else if(!cat.inBox)cat.state='sit';paintNap();dirty=true;}
function paintNap(){const on=!!cat.nap,tt=on?'Wake her up':'Let her nap';sitKey.setAttribute('aria-pressed',String(on));sitKey.title=tt;sitKey.setAttribute('aria-label',tt);
  if(pipSit){pipSit.setAttribute('aria-pressed',String(on));pipSit.title=tt;pipSit.setAttribute('aria-label',tt);pipSit.classList.toggle('on',on);}}
sitKey.addEventListener('click',()=>{cat.nap?napEnd():napStart();});
win.addEventListener('pointerdown',()=>{if(cat.nap)napEnd();}); /* the clock too: touch the board and she wakes */
const feedKey=$('feedKey');function feed(){if(cat.nap)napEnd(true);dropTreat();}feedKey.addEventListener('click',feed);
paintNap();
/* ================= Float: the board in a small window that stays on top =================
   Chrome and Edge (Document Picture-in-Picture): the real clock and desk move into an always-on-top window,
   so the cat keeps walking and you can still pet her there. Safari: a video picture-in-picture of the clock and
   the desk, drawn into one fixed-size canvas (resizing a streaming canvas is what used to crash it, and the old
   version only drew the clock, which is why the cat never showed). Phones, tablets and Firefox: no Float button. */
const floatKey=$('floatKey'),floatNote=$('floatNote');
const fineDesk=matchMedia('(pointer:fine) and (min-width:701px)');
const canDocPip='documentPictureInPicture' in window;
const vid=document.createElement('video');
const canVidPip=!canDocPip&&typeof vid.webkitSetPresentationMode==='function'&&typeof HTMLCanvasElement.prototype.captureStream==='function';
const vidPip={ready:false,on:false,cv:null,g:null};
let floatWin=null;
const VOL_ON='M4 0h1v1h-1zM3 1h2v1h-2zM9 1h1v1h-1zM0 2h5v1h-5zM7 2h1v1h-1zM10 2h1v1h-1zM0 3h5v1h-5zM8 3h1v1h-1zM10 3h1v1h-1zM0 4h5v1h-5zM8 4h1v1h-1zM10 4h1v1h-1zM0 5h5v1h-5zM8 5h1v1h-1zM10 5h1v1h-1zM0 6h5v1h-5zM7 6h1v1h-1zM10 6h1v1h-1zM3 7h2v1h-2zM9 7h1v1h-1zM4 8h1v1h-1z';
const VOL_OFF='M4 0h1v1h-1zM3 1h2v1h-2zM0 2h5v1h-5zM6 2h1v1h-1zM10 2h1v1h-1zM0 3h5v1h-5zM7 3h1v1h-1zM9 3h1v1h-1zM0 4h5v1h-5zM8 4h1v1h-1zM0 5h5v1h-5zM7 5h1v1h-1zM9 5h1v1h-1zM0 6h5v1h-5zM6 6h1v1h-1zM10 6h1v1h-1zM3 7h2v1h-2zM4 8h1v1h-1z';
/* the floating window's own mute button: shows while something plays, stays lit while muted */
function paintPipMute(on){if(pipFeed)pipFeed.parentNode.parentNode.style.setProperty('--pc',(PALETTES[S.palette]||PALETTES.pegs).primary);if(pipDots){pipDots.style.color=(PALETTES[S.palette]||PALETTES.crt).primary;}if(pipDots)pipDots.querySelectorAll('button').forEach(b=>{const on=b.dataset.pal===S.palette;b.setAttribute('aria-pressed',String(on));drawPalTile(b._cv,b._p,on);});if(!pipMute)return;
  pipMute.style.color=(PALETTES[S.palette]||PALETTES.crt).primary;pipMute.hidden=!(on||muted);pipMute.classList.toggle('muted',muted);pipMute.setAttribute('aria-pressed',String(muted));
  pipMute.setAttribute('aria-label',muted?'Unmute':'Mute');pipMute.title=muted?'Unmute':'Mute';}
function paintFloat(){floatKey.hidden=!(fineDesk.matches&&(canDocPip||canVidPip));const on=!!floatWin||vidPip.on;
  floatKey.setAttribute('aria-pressed',String(on));floatKey.title=on?'Bring her back':'Float: keep her on top of your other windows';}
if(fineDesk.addEventListener)fineDesk.addEventListener('change',paintFloat);
async function floatDoc(){
  const w=Math.round(Math.min(560,Math.max(360,win.clientWidth*.5)));
  const pw=await documentPictureInPicture.requestWindow({width:w,height:Math.round((w-12)*(.25+GH/W))+18+30}); /* +30 for the control strip under the desk */
  /* copy the page's styles in as text (links don't always load into a picture-in-picture window) */
  for(const sh of document.styleSheets){try{const s=pw.document.createElement('style');s.textContent=[...sh.cssRules].map(r=>r.cssText).join('\n');pw.document.head.appendChild(s);}
    catch(e){if(sh.href){const n=pw.document.createElement('link');n.rel='stylesheet';n.href=sh.href;pw.document.head.appendChild(n);}}}
  const st=pw.document.createElement('style');st.textContent='html,body{margin:0;height:100%;background:#050607;overflow:hidden}body{display:flex;flex-direction:column;gap:0;padding:6px;box-sizing:border-box}.pipbar{flex:0 0 auto;margin-top:6px;display:flex;align-items:center;gap:4px;height:26px;padding:0 2px;color:var(--pc,#ccc)}.pipleft{display:flex;gap:2px;margin-right:auto;opacity:.5;transition:opacity .2s}body:hover .pipleft{opacity:1}.pipbtn{width:28px;height:24px;border:0;border-radius:3px;padding:0;display:grid;place-items:center;cursor:pointer;background:transparent;color:inherit}.pipbtn:hover{background:rgba(255,255,255,.08)}.pipbtn svg{width:17px;height:15px;fill:currentColor}.pipbtn.on{background:rgba(255,255,255,.12)}.pipbtn:disabled{opacity:.3;cursor:default} /* under the desk, bottom right, never over the display */.pipdots{display:flex;gap:2px;opacity:.4;transition:opacity .2s}body:hover .pipdots,.pipdots:focus-within{opacity:1}.pipdots button{color:inherit;position:relative;width:28px;height:24px;border:0;border-radius:3px;padding:0;background:transparent;cursor:pointer;display:grid;place-items:center}.pipdots canvas{width:20px;height:13px;display:block}.pipdots button::after{content:"";position:absolute;left:50%;bottom:0;width:10px;height:2px;margin-left:-5px;background:repeating-linear-gradient(90deg,currentColor 0 2px,transparent 2px 4px);opacity:0}.pipdots button[aria-pressed="true"]::after{opacity:1}.pipdots button:hover{background:rgba(255,255,255,.08)}.pipmute{width:28px;height:24px;border:0;border-radius:3px;padding:0;display:grid;place-items:center;cursor:pointer;background:transparent;opacity:.5;transition:opacity .2s}.pipmute:hover{background:rgba(255,255,255,.08)}body:hover .pipmute,.pipmute:focus-visible,.pipmute.muted{opacity:1}.pipmute[hidden]{display:none}.pipmute svg{width:20px;height:17px;fill:currentColor;filter:drop-shadow(0 0 2px currentColor)}.pipmute svg+svg,.pipmute.muted svg:first-child{display:none}.pipmute.muted svg+svg{display:block}';
  pw.document.head.appendChild(st);pw.document.title='Loaf FM';
  floatNote.style.minHeight=(win.offsetHeight+gameWin.offsetHeight+8)+'px';floatNote.hidden=false;
  pw.document.body.append(win,gameWin);
  const mb=pw.document.createElement('button');mb.type='button';mb.className='pipmute';mb.innerHTML='<svg viewBox="-1 -1 13 11" shape-rendering="crispEdges"><path d="'+VOL_ON+'"/></svg><svg viewBox="-1 -1 13 11" shape-rendering="crispEdges"><path d="'+VOL_OFF+'"/></svg>';
  mb.addEventListener('click',()=>setMuted(!muted));
  const bar=pw.document.createElement('div');bar.className='pipbar';const pd=pw.document.createElement('div');pd.className='pipdots';pd.setAttribute('role','group');pd.setAttribute('aria-label','Palette');
  Object.entries(PALETTES).filter(([id])=>SHOWN_PALETTES.includes(id)||id===S.palette).forEach(([id,p])=>{const d=pw.document.createElement('button');d.type='button';d.dataset.pal=id;d.title=p.name;d.setAttribute('aria-label',p.name);d.setAttribute('aria-pressed','false');const cv=pw.document.createElement('canvas');d.appendChild(cv);d._cv=cv;d._p=p;
    d.addEventListener('click',()=>{S.palette=id;save();paintKeys();layout();});pd.appendChild(d);});
  const left=pw.document.createElement('div');left.className='pipleft';
  const fb=pw.document.createElement('button');fb.type='button';fb.className='pipbtn';fb.title='Give her a fish';fb.setAttribute('aria-label','Give her a fish');fb.innerHTML='<svg viewBox="-0.5 -2.5 12 12" shape-rendering="crispEdges"><path d="M2 0h4v1h-4zM1 1h6v1h-6zM8 1h2v1h-2zM0 2h1v1h-1zM2 2h8v1h-8zM0 3h9v1h-9zM0 4h10v1h-10zM1 5h6v1h-6zM8 5h2v1h-2zM2 6h4v1h-4z"/></svg>';fb.style.color='#ef8c32';fb.addEventListener('click',feed);
  const zb=pw.document.createElement('button');zb.type='button';zb.className='pipbtn';zb.innerHTML='<svg viewBox="-1.5 -1.5 9 9" shape-rendering="crispEdges"><path d="M0 0h6v1h-6zM4 1h2v1h-2zM3 2h2v1h-2zM2 3h2v1h-2zM1 4h2v1h-2zM0 5h6v1h-6z"/></svg>';zb.addEventListener('click',()=>sitKey.click());zb.title='Let her nap';zb.setAttribute('aria-label','Let her nap');
  left.append(fb,zb);bar.append(left,pd,mb);pw.document.body.appendChild(bar);pipMute=mb;pipDots=pd;pipFeed=fb;pipSit=zb;paintKeys();paintNap();
  floatWin=pw;host=pw;restartLoop();
  pw.addEventListener('resize',relayout);
  ['pointermove','pointerdown','keydown'].forEach(ev=>pw.document.addEventListener(ev,noteActive,{passive:true}));
  pw.addEventListener('pagehide',()=>{pipMute=null;pipDots=null;pipFeed=null;pipSit=null;floatNote.before(win,gameWin);floatNote.hidden=true;floatWin=null;host=window;restartLoop();layout();paintFloat();},{once:true});
  layout();paintFloat();}
function vidFrame(){const g=vidPip.g,w=vidPip.cv.width,h1=Math.round(w/4),h2=Math.round(w*GH/W);g.fillStyle='#050607';g.fillRect(0,0,w,vidPip.cv.height);
  g.drawImage(bgC,0,0,w,h1);g.drawImage(ledC,0,0,w,h1);g.drawImage(gbgC,0,h1,w,h2);g.drawImage(gledC,0,h1,w,h2);}
function prepVid(){if(vidPip.ready)return;const c=document.createElement('canvas');c.width=640;c.height=160+Math.round(640*GH/W);vidPip.cv=c;vidPip.g=c.getContext('2d');vidPip.ready=true;vidFrame();
  vid.muted=true;vid.playsInline=true;vid.setAttribute('playsinline','');vid.setAttribute('aria-hidden','true');vid.style.cssText='position:fixed;width:2px;height:2px;opacity:0;pointer-events:none;bottom:0;right:0';
  document.body.appendChild(vid);vid.srcObject=c.captureStream(30);vid.play().catch(()=>{});
  vid.addEventListener('pause',()=>{if(!vidPip.on)return;setMuted(!muted);vid.play().catch(()=>{});}); /* Safari's pause button in the floating picture mutes and unmutes; the cat keeps moving */
  vid.addEventListener('webkitpresentationmodechanged',()=>{vidPip.on=vid.webkitPresentationMode==='picture-in-picture';paintFloat();});}
if(canVidPip&&fineDesk.matches)prepVid(); /* ready ahead of time, so the click can open it straight away */
floatKey.addEventListener('click',()=>{
  if(canDocPip){if(floatWin){floatWin.close();return;}floatDoc().catch(()=>say('Floating is not available here'));return;}
  if(canVidPip){prepVid();try{vid.webkitSetPresentationMode(vidPip.on?'inline':'picture-in-picture');}catch(e){say('Floating is not available here');}}});
$('floatBack').addEventListener('click',()=>{if(floatWin)floatWin.close();});
paintFloat();
let rt;const relayout=()=>{clearTimeout(rt);rt=setTimeout(layout,60);};window.addEventListener('resize',relayout);
if('ResizeObserver' in window){const ro=new ResizeObserver(relayout);ro.observe(face);ro.observe(win);}
restartLoop();
/* a first visit tunes to Late Shift and plays only if the browser lets sound start by itself; otherwise it waits,
   tuned, for Play or MAKE ONE. The play key never says Stop while the sound is held. */
if(FIRST&&!BC&&!new URLSearchParams(location.search).get('tape')){try{const pol=navigator.getAutoplayPolicy?navigator.getAutoplayPolicy('audiocontext'):'';
  if(pol!=='disallowed'){const a=ensureAudio();setTimeout(()=>{if(a.state==='running'&&!gen)playRadio();},80);}}catch(e){}}
if(BC){const st=[...CALM,...MUSIC].find(s=>s.id===S.station)||(draft&&S.station==='tape:draft'&&{name:draft.n})||MUSIC[0];S.stationName=st.name;fillStations();
  const begin=()=>{if(!gen)genStart(S.station);if(actx&&actx.state!=='running'){const o=document.createElement('button');o.className='bcstart';o.textContent='Click to start the sound';
      o.addEventListener('click',()=>{actx.resume();o.remove();});document.body.appendChild(o);}};
  begin();
  if(BC.rotate&&BC.list.length>1){let i=Math.max(0,BC.list.indexOf(S.station));setInterval(()=>{i=(i+1)%BC.list.length;const nx=[...CALM,...MUSIC].find(s=>s.id===BC.list[i]);
      genStop(false);setTimeout(()=>{S.station=nx.id;S.stationName=nx.name;dirty=true;fillStations();genStart(S.station);},1200);},BC.rotate*60000);} /* a gentle fade between stations */
  if(BC.treats)setInterval(()=>{if(Math.random()<1/25&&!cat.nap)dropTreat();},60000);} /* a treat every 25 minutes or so */

/* ================= Moving between pages without stopping the radio =================
   Links inside the site swap the page below the board instead of reloading, so the cat and the music carry on.
   Every page is still a complete HTML file, so search engines, new tabs and old browsers get the normal page. */
(function(){
  if(!(window.history&&history.pushState&&window.fetch&&window.DOMParser))return;
  const norm=p=>p.replace(/index\.html$/,'');
  let shown=norm(location.pathname),seq=0;
  function target(a){if(!a||(a.target&&a.target!=='_self')||a.hasAttribute('download'))return null;const u=new URL(a.href,location.href);
    if(u.origin!==location.origin||!/(\/|\.html)$/.test(u.pathname))return null;return u;}
  document.addEventListener('click',e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const u=target(e.target.closest&&e.target.closest('a[href]'));if(!u)return;
    if(norm(u.pathname)===shown){if(!u.hash){e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});}return;}
    e.preventDefault();go(u,true);});
  window.addEventListener('popstate',()=>{if(norm(location.pathname)!==shown)go(new URL(location.href),false);});
  async function go(u,push){const my=++seq;document.documentElement.classList.add('turning');
    try{const r=await fetch(u.pathname,{credentials:'same-origin'});if(!r.ok)throw new Error(r.status);
      const doc=new DOMParser().parseFromString(await r.text(),'text/html'),next=doc.getElementById('page');if(!next)throw new Error('no page');if(my!==seq)return;
      document.title=doc.title;
      for(const sel of ['meta[name="description"]','link[rel="canonical"]','meta[name="robots"]']){const a=document.head.querySelector(sel),b=doc.head.querySelector(sel);
        if(a&&b)a.replaceWith(b.cloneNode(true));else if(a)a.remove();else if(b)document.head.appendChild(b.cloneNode(true));}
      document.head.querySelectorAll('[data-page]').forEach(n=>n.remove());doc.head.querySelectorAll('[data-page]').forEach(n=>document.head.appendChild(document.importNode(n,true)));
      const nav=document.querySelector('.top .nav'),nn=doc.querySelector('.top .nav');if(nav&&nn)nav.replaceWith(document.importNode(nn,true));
      const fresh=document.importNode(next,true);document.getElementById('page').replaceWith(fresh);
      fresh.querySelectorAll('script').forEach(old=>{const s=document.createElement('script');for(const at of old.attributes)s.setAttribute(at.name,at.value);s.textContent=old.textContent;old.replaceWith(s);});
      if(push)history.pushState({},'',u.href);shown=norm(u.pathname);
      const t=u.hash&&document.getElementById(decodeURIComponent(u.hash.slice(1)));if(t)t.scrollIntoView();else window.scrollTo(0,0);
      fresh.setAttribute('tabindex','-1');fresh.focus({preventScroll:true});
      window.dispatchEvent(new CustomEvent('loaf:pageview')); /* analytics.js counts these, if it's switched on */}
    catch(err){location.href=u.href;}
    finally{if(my===seq)document.documentElement.classList.remove('turning');}}
})();
})();
