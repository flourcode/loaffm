
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
function wrap(s,area){const words=s.split(' ');const lines=[];let cur='';for(const w of words){const cand=cur?cur+' '+w:w;if(textW(cand,'big')<=area)cur=cand;else{if(cur)lines.push(cur);cur=w;}}if(cur)lines.push(cur);return lines;}

/* ================= State ================= */
const locale=navigator.language||'en-US';
const H24=(()=>{try{return !new Intl.DateTimeFormat(locale,{hour:'numeric'}).resolvedOptions().hour12;}catch(e){return false;}})();
const UNIT=/US|LR|MM/.test(locale.split('-')[1]||'')?'F':'C';
const DEFAULTS={palette:'pegs',brightness:1,volume:0.7,station:'gen:purr',stationName:'Purr'};
let S=Object.assign({},DEFAULTS);
try{const saved=JSON.parse(localStorage.getItem(STORE)||'null');if(saved&&typeof saved==='object')Object.assign(S,saved);}catch(e){}
function save(){if(BC)return;try{localStorage.setItem(STORE,JSON.stringify(S));}catch(e){}} /* broadcast mode never changes your own saved settings */
/* ================= Broadcast mode (for YouTube and streaming software) =================
   ?broadcast=video   for uploaded videos: no clock or date (they'd be wrong later); the display shows the station's frequency
   ?broadcast=live    for a 24/7 livestream: the frequency up top, the real time on the small line, in one time zone
   Options: &station=late|window|crt|sunday|desert|purr|rain|ocean|fire|brown   &tz=America/Los_Angeles (live)
            &rotate=60&stations=late,window,desert (change station every N minutes)   &palette=pegs|teal|amber|crt|moon|ember
            &vol=0.8   &case=dark|light   &treats=0 (no automatic treats)   &label=JST (time-zone label)   &dim=0 (no evening dimming)
   Full-screen 16:9 board, no page or controls, sound starts by itself (OBS allows it), she never dozes off waiting
   for a mouse that isn't coming, and every so often a treat drops on its own. */
const BCQ=new URLSearchParams(location.search),BC=/^(video|live)$/.test(BCQ.get('broadcast')||'')?{mode:BCQ.get('broadcast')}:null;
const ST_KEYS={late:'gen:late',window:'gen:window',crt:'gen:crt',sunday:'gen:sunday',desert:'gen:desert',purr:'gen:purr',rain:'gen:rain',ocean:'gen:waves',waves:'gen:waves',fire:'gen:fire',brown:'gen:brown'};
const FREQ={'gen:late':'88.3','gen:window':'91.7','gen:crt':'94.1','gen:sunday':'97.5','gen:desert':'102.9','gen:purr':'89.9','gen:rain':'90.5','gen:waves':'93.3','gen:fire':'99.1','gen:brown':'100.7'};
if(BC){BC.tz=BCQ.get('tz')||(BC.mode==='live'?'America/Los_Angeles':'');try{if(BC.tz)new Intl.DateTimeFormat('en-US',{timeZone:BC.tz});}catch(e){BC.tz='America/Los_Angeles';}
  BC.list=(BCQ.get('stations')||'').split(',').map(k=>ST_KEYS[k.trim()]).filter(Boolean);BC.rotate=Math.max(0,+BCQ.get('rotate')||0);
  const first=ST_KEYS[BCQ.get('station')]||BC.list[0]||'gen:late';S.station=first;if(BCQ.get('palette'))S.palette=BCQ.get('palette');
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
  pegs:  {name:'Pegs',      primary:'#f1e7cf',secondary:'#e7c74e',accent:'#d94c45',bg:'#000000',seed:'#707070',off:'#101216',deep:'#26202e',mid:'#8774b8',hi:'#f8f0dc',fish:'#e8902f',peg:true,
          rainbow:['#e2504a','#e8902f','#e7c74e','#5ed363','#58aaf5','#e064c0','#9a72e0'],digits:['#e2504a','#e7c74e','#5ed363','#58aaf5']}, /* old bulbs, not RGB strips: a touch softer than full saturation */
  teal:  {name:'Teal VFD',  primary:'#68d4cb',secondary:'#3fb0aa',accent:'#ff8a3d',bg:'#081515',seed:'#238c89',off:'#0d1f1f',deep:'#123a3b',mid:'#238c89',hi:'#b5f1e7',fish:'#ff8a3d'},
  amber: {name:'Amber',     primary:'#f2a52b',secondary:'#d98a2b',accent:'#ff4a3a',bg:'#17100c',seed:'#b96d20',off:'#22170f',deep:'#49301d',mid:'#b96d20',hi:'#ffd66c',fish:'#ffd66c'},
  crt:   {name:'Phosphor',  primary:'#f1e9c9',secondary:'#b7d39c',accent:'#d9785a',bg:'#0c120e',seed:'#527256',off:'#131c15',deep:'#26392a',mid:'#6f8d67',hi:'#fbf6e2',fish:'#e6a44b'},
  moon:  {name:'Moonlight', primary:'#c7d3e3',secondary:'#94acd0',accent:'#e9c77b',bg:'#090c18',seed:'#354f78',off:'#10152a',deep:'#17203b',mid:'#3d5a88',hi:'#eef3fa',fish:'#e9c77b',floor:.5},
  ember: {name:'Ember',     primary:'#ed9272',secondary:'#c65b45',accent:'#f2c46b',bg:'#120d0c',seed:'#7b3029',off:'#1c1312',deep:'#3a1c1c',mid:'#7b3029',hi:'#f7b89a',fish:'#f2c46b',floor:.55}};
function pal(){const p=PALETTES[S.palette]||PALETTES.pegs;return {PEG:p.peg?p.rainbow.map(hexInt):null,DIG:p.peg?p.digits.map(hexInt):null,C:hexInt(p.primary),S2:hexInt(p.secondary),A:hexInt(p.accent),BG:hexInt(p.bg),pegs:null,OFF:p.off,DEEP:hexInt(p.deep),MID:hexInt(p.mid),HI:hexInt(p.hi),FISH:hexInt(p.fish),floor:p.floor||0};}
const DAYS=['SUN','MON','TUE','WED','THU','FRI','SAT'],MONTHS=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
function clock(d){let h=d.getHours();const ap=h>=12?'PM':'AM';if(!H24)h=h%12||12;return {s:(H24?String(h).padStart(2,'0'):String(h))+':'+String(d.getMinutes()).padStart(2,'0'),ap,date:DAYS[d.getDay()]+' '+MONTHS[d.getMonth()]+' '+d.getDate()};}
function nightDim(d){if(BC&&BCQ.get('dim')==='0')return 1;const h=d.getHours()+d.getMinutes()/60;if(h>=8&&h<=19)return 1;if(h>19&&h<23)return 1-(h-19)/4*.6;if(h>=23||h<5)return .4;return .4+(h-5)/3*.6;}

/* ================= Sound =================
   Everything Loaf FM plays is made in the browser: its own music stations and the calm sounds. No live radio. */

let actx=null,freq=null;const bands=new Float32Array(16);
function playing(){return !!gen;}
/* ================= Calm sounds, made right here: nothing to stream, nothing to buffer ================= */
const CALM=[{id:'gen:purr',name:'Purr',url:''},{id:'gen:rain',name:'Rain',url:''},{id:'gen:waves',name:'Ocean',url:''},{id:'gen:fire',name:'Fireplace',url:''},{id:'gen:brown',name:'Brown noise',url:''}];
let gen=null;
function makeNoise(a,sec,kind){const n=Math.round(a.sampleRate*sec),b=a.createBuffer(2,n,a.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let last=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;if(kind==='brown'){last=(last+.02*w)/1.02;d[i]=last*3.5;}else d[i]=w;}
    if(kind==='brown'){const s=d[0],e=d[n-1];for(let i=0;i<n;i++)d[i]-=s+(e-s)*i/(n-1);}} /* ends meet, so the loop never clicks */
  return b;}
let muted=false,pipMute=null,pipDots=null;const vol=()=>muted?0:S.volume; /* mute is for this visit only; the volume you set is kept */
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
function music(a,dest,id){const st=STYLES[id],white=makeNoise(a,6,'white');
  /* the signal chain: everything into a warm low-pass and a gentle tape saturation, with a soft room on a send */
  const bus=a.createGain();bus.gain.value=st.level;const warm=a.createBiquadFilter();warm.type='lowpass';warm.frequency.value=st.lp;warm.Q.value=.5;
  const sat=a.createWaveShaper();const cv=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;cv[i]=Math.tanh(1.6*x)/Math.tanh(1.6);}sat.curve=cv;
  const comp=a.createDynamicsCompressor();comp.threshold.value=-26;comp.knee.value=12;comp.ratio.value=3;comp.attack.value=.03;comp.release.value=.35; /* smooths out the odd louder hit */
  bus.connect(warm).connect(sat).connect(comp).connect(dest);const verb=makeVerb(a,2.8),wet=a.createGain();wet.gain.value=st.rev;const send=a.createGain();send.connect(verb).connect(wet).connect(dest);
  /* tape wow: a slow wobble shared by every oscillator */
  const wow=a.createOscillator();wow.frequency.value=.27;const wowG=a.createGain();wowG.gain.value=7;wow.connect(wowG);wow.start();
  const trem=a.createOscillator();trem.frequency.value=2.3;const tremG=a.createGain();tremG.gain.value=.07; /* slow and shallow: wobble near 4 Hz is the most attention-grabbing kind */trem.connect(tremG);trem.start();
  const srcs=[wow,trem];
  const drumBus=a.createGain();drumBus.gain.value=0;drumBus.connect(bus);
  const out=(node,pan,rv,to)=>{let n=node;if(a.createStereoPanner){const p=a.createStereoPanner();p.pan.value=pan||0;n.connect(p);n=p;}n.connect(to||bus);if(rv){const s=a.createGain();s.gain.value=rv;n.connect(s).connect(send);}};
  const osc=(type,f,t)=>{const o=a.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);wowG.connect(o.detune);return o;};
  /* instruments */
  const ep=(t,m,dur,vel)=>{const f=mtof(m),c=osc('sine',f,t),md=osc('sine',f,t),mg=a.createGain(),g=a.createGain(),tg=a.createGain();
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
  const bell=(t,m,v)=>{const f=mtof(m),c=osc('sine',f,t),md=osc('sine',f*3.5,t),mg=a.createGain(),g=a.createGain();mg.gain.setValueAtTime(f*2*v,t);mg.gain.exponentialRampToValueAtTime(f*.05,t+2);md.connect(mg).connect(c.frequency);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035*v,t+.01);g.gain.exponentialRampToValueAtTime(.0005,t+4.5);c.connect(g);out(g,rnd(-.5,.5),1.4);c.start(t);md.start(t);c.stop(t+4.6);md.stop(t+4.6);};
  const lead=(t,m,dur,v)=>{const o=osc('triangle',mtof(m),t),f=a.createBiquadFilter(),g=a.createGain();f.type='lowpass';f.frequency.value=1300;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045*v,t+.08);g.gain.setTargetAtTime(0,t+dur,.25);
    o.connect(f).connect(g);out(g,.2,.8);o.start(t);o.stop(t+dur+1.5);};
  const pluck=(t,m,v,cut)=>{const o=osc('square',mtof(m),t),f=a.createBiquadFilter(),g=a.createGain();f.type='lowpass';f.Q.value=2;f.frequency.setValueAtTime(cut*1.8,t);f.frequency.exponentialRampToValueAtTime(cut*.5,t+.25);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.02*v,t+.004);g.gain.exponentialRampToValueAtTime(.0005,t+.35);o.connect(f).connect(g);out(g,rnd(-.3,.3),.5);o.start(t);o.stop(t+.4);};
  const blip=(t,m)=>{const o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=mtof(m);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.006,t+.003);g.gain.setValueAtTime(.006,t+.05);g.gain.linearRampToValueAtTime(0,t+.06);o.connect(g);out(g,rnd(-.6,.6),.6);o.start(t);o.stop(t+.08);};
  const cricket=(t)=>{const f=rnd(4300,4900),n=2+Math.floor(Math.random()*3),pan=rnd(-.8,.8);for(let i=0;i<n;i++){const tt=t+i*.11,o=a.createOscillator(),am=a.createOscillator(),ag=a.createGain(),g=a.createGain();o.frequency.value=f;am.frequency.value=rnd(16,20);
    am.connect(ag.gain);ag.gain.value=0;g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.004,tt+.025);g.gain.linearRampToValueAtTime(0,tt+.08);o.connect(ag).connect(g);out(g,pan,.6);o.start(tt);am.start(tt);o.stop(tt+.09);am.stop(tt+.09);}};
  /* bed layers: tape hiss, and for some stations rain or a purr underneath */
  if(st.hiss){const h=a.createBufferSource();h.buffer=white;h.loop=true;const hf=a.createBiquadFilter();hf.type='bandpass';hf.frequency.value=5000;hf.Q.value=.5;const hg=a.createGain();hg.gain.value=.006*st.hiss;h.connect(hf).connect(hg).connect(dest);h.start();srcs.push(h);}
  const layers=[];const layerBus=g=>{const lg=a.createGain();lg.gain.value=g;lg.connect(dest);return lg;};
  if(st.rain){const r=SOUNDS['gen:rain'](a,layerBus(st.rain));srcs.push(...r.src);layers.push(r);}
  if(st.purr){const p=SOUNDS['gen:purr'](a,layerBus(st.purr));srcs.push(...p.src);layers.push(p);}
  /* the conductor */
  const key=48+choose([0,2,3,5,7,8,10]);let bpm=rnd(...st.bpm),beat=60/bpm,t=a.currentTime+.4,prog=choose(PROGS[st.prog]),ci=0,bar=0,section='intro',secLeft=2,phrases=0,prevV=null,kickPat=choose([[0,10],[0,7,10],[0,10,14]]),melodyRest=0;
  const voice=(root,type)=>{let ns=CH[type].map(i=>key+root+i);ns=ns.map(n=>{while(n<53)n+=12;while(n>71)n-=12;return n;}).sort((x,y)=>x-y);
    if(prevV){const avg=prevV.reduce((s,x)=>s+x,0)/prevV.length,a2=ns.reduce((s,x)=>s+x,0)/ns.length;if(a2-avg>4)ns=ns.map((n,i)=>i===ns.length-1?n-12:n).sort((x,y)=>x-y);else if(avg-a2>4)ns=ns.map((n,i)=>i===0?n+12:n).sort((x,y)=>x-y);}
    prevV=ns;return ns;};
  const PENT=[0,2,4,7,9];const melNote=(root)=>{const deg=choose(PENT);let m=key+deg+24;if(Math.random()<.4)m=key+root+choose([0,4,7])+24;while(m>81)m-=12;while(m<67)m+=12;return m;};
  /* each station has its own way of playing a tune, so you can tell them apart within a few seconds */
  const inRange=(m,lo,hi)=>{while(m>hi)m-=12;while(m<lo)m+=12;return m;};let motif=null;
  const phrase=(b0,root,sw)=>{const p=st.phrase;
    if(p==='motif'){ /* Late Shift: a little motif built on the chord's 9th and 7th, repeated and moved with the chords, played just behind the beat */
      if(!motif||Math.random()<.15){motif=[];let i=choose([0,2,4]);const n=3+Math.floor(Math.random()*2);for(let k=0;k<n;k++){motif.push({i,tone:choose([14,11,7,4,14,9]),d:choose([.5,1,1.5])});i+=choose([2,2,3,4]);}}
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
    const drumsOn=section==='groove'||section==='melody',lastBar=secLeft===1&&ci===prog.length-1&&bar%st.bars===st.bars-1;
    if(drumsOn&&!drumsWere){drumBus.gain.cancelScheduledValues(b0);drumBus.gain.setValueAtTime(.2,b0);drumBus.gain.linearRampToValueAtTime(1,b0+8*beat);}
    if(lastBar){pending=pickSection();if(drumsOn&&!(pending==='groove'||pending==='melody')){drumBus.gain.setValueAtTime(1,b0);drumBus.gain.linearRampToValueAtTime(.35,b0+4*beat);}}
    drumsWere=drumsOn;const melOn=section==='melody'||(section==='keys'&&Math.random()<.3);
    if(firstBar){if(st.pad&&section!=='groove'||st.pad>=.8)pad(b0,ns.slice(0,4),full,st.pad);
      if(st.keys==='ep'){const v=rnd(.55,.85),spread=rnd(.012,.03);ns.forEach((m,i)=>ep(b0+i*spread,m,full*rnd(.55,.9),v*(i?.85:1)));if(Math.random()<.4)ns.slice(-2).forEach((m,i)=>ep(sw(10)+i*.02,m,beat*1.5,v*.55));}
      if(st.bass&&section!=='intro')bass(b0,key+root-12-(key+root-12>47?12:0),beat*rnd(2.5,3.5),st.bass);}
    else{if(st.keys==='ep'&&Math.random()<.35){const v=rnd(.4,.6);ns.slice(-3).forEach((m,i)=>ep(sw(choose([2,6,8]))+i*.02,m,beat*1.2,v));}
      if(st.bass&&section!=='intro'&&Math.random()<.7)bass(sw(choose([0,8,10])),key+root-12-(key+root-12>47?12:0)+choose([0,0,7,12]),beat*1.4,st.bass*.85);}
    if(drumsOn){
      if(st.drums==='sparse'){kick(sw(0),.8);if(Math.random()<.5)kick(sw(kickPat[1]||10),.55);snare(sw(12),.75);if(Math.random()<.25)snare(sw(choose([7,15])),.22);for(let i=2;i<16;i+=4)if(Math.random()<st.hats)hat(sw(i),rnd(.5,1));}
      else if(st.drums==='four'){for(const i of [0,8])kick(sw(i),.7);snare(sw(4),.35);snare(sw(12),.5);for(let i=0;i<16;i+=2)if(Math.random()<st.hats)hat(sw(i),i%4?rnd(.4,.7):rnd(.7,1));}
      else if(st.drums==='brush'){for(let i=0;i<16;i+=4)brush(sw(i),rnd(.6,1),i%8===4);for(let i=2;i<16;i+=4)if(Math.random()<.6)brush(sw(i),rnd(.3,.5),false);if(Math.random()<.6)kick(sw(0),.4);}}
    else if(st.drums==='brush'&&section!=='intro'&&Math.random()<.5)for(let i=0;i<16;i+=8)brush(sw(i),.4,true);
    if(st.melody==='arp'&&section!=='intro'){const cut=900+700*Math.sin(b0/23);const seq=ns.concat([ns[0]+12,ns[1]+12]);for(let i=0;i<16;i++)if(i%2===0||Math.random()<.5)pluck(sw(i),seq[(i+bar*3)%seq.length]+12,section==='break'?.5:rnd(.6,1),cut);}
    else if(melOn&&Math.random()<st.mel*.8){if(melodyRest>0)melodyRest--;else{phrase(b0,root,sw);melodyRest=choose([0,1,1,2]);}}
    if(st.blips&&Math.random()<.12)blip(sw(choose([3,7,11,15])),key+choose(PENT)+36);
    if(st.crickets&&Math.random()<.25)cricket(b0+rnd(0,full/st.bars));
    bar++;if(bar%st.bars===0){ci=(ci+1)%prog.length;if(ci===0){secLeft--;if(secLeft<=0)nextSection();}}};
  return {src:srcs,tick(until){for(const l of layers)l.tick&&l.tick(until);while(t<until){barSlot(t);t+=4*beat;}}};}
for(const s of MUSIC)SOUNDS[s.id]=(a,dest)=>music(a,dest,s.id);

function genStart(id){genStop(true);const a=ensureAudio();const master=a.createGain();master.gain.value=0;const an=a.createAnalyser();an.fftSize=64;an.smoothingTimeConstant=.8;
  master.connect(an);an.connect(a.destination);const g={id,master,an,src:[],timers:[]};
  const snd=SOUNDS[id](a,master);g.src.push(...snd.src);if(snd.tick){snd.tick(a.currentTime+8);g.timers.push(setInterval(()=>snd.tick(a.currentTime+8),1000));}
  master.gain.setValueAtTime(0,a.currentTime);master.gain.linearRampToValueAtTime(vol()*GEN_LEVEL[id],a.currentTime+2);gen=g;dirty=true;paintKeys();}
function genStop(quick){if(!gen)return;const g=gen;gen=null;g.timers.forEach(clearInterval);try{const a=actx;g.master.gain.cancelScheduledValues(a.currentTime);g.master.gain.setValueAtTime(g.master.gain.value,a.currentTime);
    g.master.gain.linearRampToValueAtTime(0,a.currentTime+(quick?.15:.8));setTimeout(()=>{g.src.forEach(s=>{try{s.stop();}catch(e){}});g.master.disconnect();},quick?250:1000);}catch(e){}dirty=true;paintKeys();}
function stationName(){return S.stationName||'Radio';}
function playRadio(){genStart(S.station);}
function stopRadio(){genStop();dirty=true;paintKeys();}
function vu(t){const on=playing();
  const src=gen&&gen.an;if(on&&src){if(!freq)freq=new Uint8Array(32);src.getByteFrequencyData(freq);for(let i=0;i<16;i++){const v=freq[Math.min(freq.length-1,i+1)]/255;bands[i]+=(Math.pow(v,1.4)-bands[i])*.5;}}
  else for(let i=0;i<16;i++){const target=on?.25+.55*Math.abs(Math.sin(t*2.1+i*.9))*Math.abs(Math.sin(t*.7+i*.3))+Math.random()*.12:0;bands[i]+=(target-bands[i])*(on?.25:.1);}
  return bands;}

/* ================= The card ================= */
/* one card on the right: the station while the radio plays, otherwise what the cat is up to */
let dirty=true,cardStart=0,cardKey='';
let boardTextLast='';function boardText(now){const el=document.getElementById('boardText');if(!el)return;const ck=clock(now);
  const s=(BC?'':ck.s+' '+(H24?'':ck.ap)+', '+now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})+'. ')+(gen?'Playing '+stationName()+'.':'Nothing playing.')+(S.sitStart?' Sitting.':'');if(s!==boardTextLast){boardTextLast=s;el.textContent=s;}}
function currentCard(){if(BC)return {k:'bc'+S.station,label:'LOAF FM',text:stationName()};const sp=sitPhase();
  if(sp&&sp.ph==='sit')return {k:'sit',label:'SITTING',text:sp.left+(sp.left===1?' minute':' minutes')};
  if(sp&&sp.ph==='rest')return {k:'rest',label:'REST',text:'no hurry'};
  return playing()?{k:muted?'mute':'radio',label:muted?'MUTED':gen?(MUSIC.some(m=>m.id===gen.id)?'LOAF FM':'SOUND'):'ON AIR',text:stationName()}:{k:'cat',label:'KITTY',text:catWords()};}

/* ================= The window ================= */
const flash={msg:'',until:0};function say(m){flash.msg=ascii(m).toUpperCase().slice(0,60);flash.until=Date.now()+4000;}
function draw(t,now){fb.fill(-1);const P=pal();
  if(R(P.BG)+G(P.BG)+B(P.BG)>0)rect(0,0,W,H,dim(P.BG,.6));
  /* left: the clock */
  let ck=clock(now);if(BC){const f=FREQ[S.station]||'88.3';ck={s:f,ap:'FM',date:BC.mode==='live'?(clock(now).s+' '+clock(now).ap+' '+tzLabel()).trim():'STEREO'};}
  const tw=textW(ck.s,'big',2);text(ck.s,3,4,'big',P.C,2);let right=3+tw;
  if(P.DIG){let cx=3,d=ck.s.replace(/\D/g,'').length;for(const ch of ck.s){const w=(glyph(ch,'big').length+1)*2;if(/\d/.test(ch)){d--;const c=P.DIG[(P.DIG.length-1-d%P.DIG.length+P.DIG.length)%P.DIG.length];
    for(let y=4;y<4+FH.big*2;y++)for(let x=cx;x<cx+w&&x<W;x++)if(fb[y*W+x]===P.C)fb[y*W+x]=c;}cx+=w;}} /* each digit its own colour; the colon stays clear */
  if(!H24){text(ck.ap,right+3,5,'small',P.PEG?P.PEG[5]:P.S2);right+=3+textW(ck.ap,'small');}
  text(ck.date,3,22,'small',P.PEG?P.PEG[1]:P.S2);
  const dx=Math.max(58,right+4);for(let y=3;y<29;y++)px(dx,y,dim(P.A,.75));
  /* right: one card, with the spectrum under it while the radio plays */
  const x0=dx+5,area=W-x0-1;const on=playing();
  let card;if(flash.until>Date.now())card={label:'',text:flash.msg,flash:true};
  else{card=currentCard();if(card.k+card.text!==cardKey){cardKey=card.k+card.text;cardStart=t;}}
  let twoLines=false;
  if(card){const wrapIt=(!on||BC)&&!card.flash,lines=wrapIt?wrap(card.text,area):[card.text];const canWrap=wrapIt&&lines.length<=2;twoLines=canWrap&&lines.length>1; /* in broadcast mode a long station name wraps rather than crawls */
    const tw2=textW(card.text,'big');const scroll=!canWrap&&tw2>area;const el=t-cardStart;
    const night=nightDim(now)<.7;const speed=(card.slow?11:15)*(night?.85:1),lead=2.2,tail=2; /* unhurried; slower still after dark */const travel=scroll?(tw2-area)/speed:0;
    if(card.label){let lb=card.label;while(lb.length>1&&textW(lb,'small')>area)lb=lb.slice(0,-1);text(lb,x0,4,'small',P.S2);}
    clip=[x0,W];
    if(canWrap)lines.forEach((l,i)=>text(l,x0,(card.label?11:(lines.length===1?12:6))+i*9,'big',card.flash?P.A:P.C));
    else if(scroll){const off=Math.round(clamp((el-lead)*speed,0,tw2-area));text(card.text,x0-off,11,'big',P.C);}
    else text(card.text,x0,11,'big',card.flash?P.A:P.C);
    clip=null;
    if(scroll&&el>lead+travel+tail)cardStart=t; /* a long station name crawls, pauses, and starts again */}
  if(on&&!twoLines){const b=vu(t);const nb=Math.floor((area+1)/4);for(let i=0;i<nb;i++){const hgt=Math.round(b[Math.floor(i*16/nb)]*8);for(let j=0;j<hgt;j++)rect(x0+i*4,28-j,3,1,j>5?P.A:j>2?(P.PEG?P.S2:P.C):(P.PEG?P.PEG[3]:P.MID));}}
}

/* ================= Renderer ================= */
const win=document.getElementById('window'),bgC=document.getElementById('bg'),ledC=document.getElementById('led'),unit=document.getElementById('unit'),face=document.getElementById('face');
const bg=bgC.getContext('2d'),ctx=ledC.getContext('2d');
const GH=18,gameWin=document.getElementById('gameWin'),gbgC=document.getElementById('gbg'),gledC=document.getElementById('gled'),gbg=gbgC.getContext('2d'),gctx=gledC.getContext('2d');let pitch=1;const sprites=new Map();const DOT=.36,GLOW=.6;
function fitUnit(){if(BC){const rows=H+GH+2,pad=parseFloat(getComputedStyle(unit).paddingTop)||16;unit.style.width=Math.max(288,Math.min(innerWidth*.88,(innerHeight*.86-pad*2-8)*(W/rows)+pad*2))+'px';return;}const top=document.querySelector('.top');const topH=top&&top.offsetParent!==null?top.offsetHeight:16;const pad=parseFloat(getComputedStyle(unit).paddingTop)||16,gap=parseFloat(getComputedStyle(face).marginTop)||16;const availH=Math.min(window.innerHeight-topH-16,window.innerHeight*.66),availW=document.documentElement.clientWidth-2*16;const chrome=pad*2+face.offsetHeight+gap+8;const rows=H+GH+2;unit.style.width=Math.max(288,Math.min(availW,1200,(availH-chrome)*(W/rows)+28))+'px';}
const isPeg=()=>!!(PALETTES[S.palette]||{}).peg;
const PV=new Float32Array(W*(H+GH)).map(()=>.8+Math.random()*.2); /* pegs pushed in to slightly different depths */
function dots(g,cv,rows){const cw=cv.width,peg=isPeg();g.fillStyle=peg?'#000':'#050607';g.fillRect(0,0,cw,cv.height);g.fillStyle=pal().OFF;const r=pitch*DOT*(peg?.55:.85); /* the pegboard: small punched holes in black paper */
  for(let y=0;y<rows;y++)for(let x=0;x<W;x++){g.beginPath();g.arc((x+.5)*pitch,(y+.5)*pitch,r,0,Math.PI*2);g.fill();}}
function layout(){fitUnit();const dpr=Math.min(window.devicePixelRatio||1,2);const cw=Math.round(win.clientWidth*dpr);pitch=cw/W;const ch=Math.round(pitch*H);
  bgC.width=ledC.width=cw;bgC.height=ledC.height=ch;sprites.clear();dots(bg,bgC,H);
  gbgC.width=gledC.width=cw;gbgC.height=gledC.height=Math.round(pitch*GH);dots(gbg,gbgC,GH);}
function sprite(c){let sp=sprites.get(c);if(sp)return sp;if(sprites.size>600)sprites.clear();if(isPeg())return pegSprite(c);
  const size=Math.ceil(pitch*2.6);const cv=document.createElement('canvas');cv.width=cv.height=size;const g=cv.getContext('2d');const r=R(c),gg=G(c),b=B(c),half=size/2;
  const grad=g.createRadialGradient(half,half,0,half,half,half);grad.addColorStop(0,`rgba(${r},${gg},${b},${.6*GLOW})`);grad.addColorStop(.35,`rgba(${r},${gg},${b},${.22*GLOW})`);grad.addColorStop(1,`rgba(${r},${gg},${b},0)`);
  g.fillStyle=grad;g.fillRect(0,0,size,size);g.globalCompositeOperation='lighter';const dr=pitch*DOT;g.fillStyle=`rgb(${r},${gg},${b})`;g.beginPath();g.arc(half,half,dr,0,Math.PI*2);g.fill();
  g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.arc(half,half,dr*.45,0,Math.PI*2);g.fill();sp={cv,off:half};sprites.set(c,sp);return sp;}
/* a plastic peg: a round translucent cap, brighter at the top-left where the light catches it */
function pegSprite(c){const size=Math.ceil(pitch*2.4);const cv=document.createElement('canvas');cv.width=cv.height=size;const g=cv.getContext('2d');const r=R(c),gg=G(c),b=B(c),half=size/2,dr=pitch*.43;
  const glow=g.createRadialGradient(half,half,0,half,half,half);glow.addColorStop(0,`rgba(${r},${gg},${b},.46)`);glow.addColorStop(.4,`rgba(${r},${gg},${b},.13)`);glow.addColorStop(1,`rgba(${r},${gg},${b},0)`);g.fillStyle=glow;g.fillRect(0,0,size,size);
  const cap=g.createRadialGradient(half-dr*.35,half-dr*.35,dr*.1,half,half,dr);cap.addColorStop(0,`rgb(${Math.min(255,r+90)},${Math.min(255,gg+90)},${Math.min(255,b+90)})`);cap.addColorStop(.55,`rgb(${r},${gg},${b})`);cap.addColorStop(1,`rgb(${Math.round(r*.7)},${Math.round(gg*.7)},${Math.round(b*.7)})`);
  g.fillStyle=cap;g.beginPath();g.arc(half,half,dr,0,Math.PI*2);g.fill();g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.arc(half-dr*.38,half-dr*.4,dr*.2,0,Math.PI*2);g.fill();
  const sp={cv,off:half};sprites.set(c,sp);return sp;}
function present(alpha,g=ctx,buf=fb,rows=H,base=0){g.clearRect(0,0,g.canvas.width,g.canvas.height);const a=clamp(alpha,0,1);g.globalAlpha=a;const peg=isPeg();
  for(let y=0;y<rows;y++)for(let x=0;x<W;x++){const c=buf[y*W+x];if(c<0)continue;const k=base+y*W+x;g.globalAlpha=a*(peg?PV[k]:.86+(PV[k]-.8)*.7); /* no two lights quite the same brightness: pegs vary more, LEDs a little */const sp=sprite(c);g.drawImage(sp.cv,(x+.5)*pitch-sp.off,(y+.5)*pitch-sp.off);}g.globalAlpha=1;}
/* now and then a peg is the wrong colour, or one has wandered off on its own: it changes every few minutes */
function oops(P){if(!P.PEG)return;const w=Math.floor(Date.now()/240000);let h=Math.imul(w^0x9e3779b9,2654435761);const rnd=()=>{h=Math.imul(h^h>>>15,2246822507);h=Math.imul(h^h>>>13,3266489909);return ((h^=h>>>16)>>>0)/4294967296;};
  if(rnd()<.7){const lit=[];for(let y=4;y<18;y++)for(let x=3;x<58;x++){const c=fb[y*W+x];if(c>=0&&c!==P.C)lit.push(y*W+x);}
    if(lit.length){const k=lit[Math.floor(rnd()*lit.length)],c=fb[k];let n=P.PEG[Math.floor(rnd()*P.PEG.length)];if(n===c)n=P.PEG[(P.PEG.indexOf(n)+3)%P.PEG.length];fb[k]=n;}}
  if(rnd()<.55){const x=Math.floor(rnd()*W),y=rnd()<.5?1:30;if(fb[y*W+x]<0)fb[y*W+x]=dim(P.PEG[Math.floor(rnd()*P.PEG.length)],.85);}}
const t0=performance.now();
function frame(){const t=(performance.now()-t0)/1000;const now=NOW();
  draw(t,now);boardText(now);const P0=pal();oops(P0);let alpha=S.brightness*nightDim(now)*(RM.matches?1:.97+Math.random()*.03)*(S.sitStart?.7:1);if(!RM.matches&&Math.random()<.003)alpha*=.8;{const fl=pal().floor*S.brightness;if(alpha<fl)alpha=fl;}
  const warm=clamp(t/1.2,0,1);if(warm<1&&!P0.PEG)alpha*=warm*(.6+.4*Math.random());present(alpha); /* a short warm-up flicker on load (the pegboard just appears) */
  drawGame(t);present(alpha,gctx,gfb,GH,W*H);
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
function setStation(s){S.station=s.id;S.stationName=s.name;save();dirty=true;fillStations();if(gen)playRadio();}
function fillStations(){stationEl.innerHTML='';{const og=document.createElement('optgroup');og.label='Loaf FM';MUSIC.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;og.appendChild(o);});stationEl.appendChild(og);}{const og=document.createElement('optgroup');og.label='Calm';CALM.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;og.appendChild(o);});stationEl.appendChild(og);}
  if(!S.station){const o=document.createElement('option');o.value='';o.textContent='Pick a sound';stationEl.insertBefore(o,stationEl.firstChild);}
  stationEl.value=S.station||'';}
if(!PALETTES[S.palette])S.palette='pegs';
if(!CALM.some(s=>s.id===S.station)&&!MUSIC.some(s=>s.id===S.station)){S.station='gen:purr';S.stationName='Purr';} /* a radio station saved before live radio was dropped */
delete S.stationUrl;
fillStations();
stationEl.addEventListener('change',()=>{const v=stationEl.value;const s=CALM.find(x=>x.id===v)||MUSIC.find(x=>x.id===v);if(s)setStation(s);else stationEl.value=S.station||'';});
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
  const st=document.documentElement.style;for(const k in v)st.setProperty(k,v[k]);document.documentElement.classList.toggle('light',light);
  const meta=document.querySelector('meta[name=theme-color]');if(meta)meta.content=v['--surf'];}
lightMQ.addEventListener('change',()=>paintKeys());
const dotsEl=$('dots');
/* each tile is a tiny board in that palette: tinted unlit dots, clock, label and accent */
function drawPalTile(cv,p,on){const d=Math.min(window.devicePixelRatio||1,2),pt=4*d;cv.width=24*d;cv.height=16*d;const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);
  g.fillStyle='#050607';g.beginPath();g.roundRect(0,0,cv.width,cv.height,3*d);g.fill();const cols=p.peg?p.rainbow.slice(0,6):[p.primary,p.primary,p.secondary,p.mid,p.accent,p.fish];
  for(let y=0;y<4;y++)for(let x=0;x<6;x++){const lit=y>0&&y<3;g.beginPath();g.arc((x+.5)*pt,(y+.5)*pt,pt*.36,0,Math.PI*2);
    if(lit){g.fillStyle=cols[x];g.globalAlpha=on?1:.6;g.shadowColor=cols[x];g.shadowBlur=on?4*d:0;}else{g.globalAlpha=1;g.shadowBlur=0;g.fillStyle=p.off;}g.fill();}g.globalAlpha=1;g.shadowBlur=0;}
Object.entries(PALETTES).forEach(([id,p])=>{const b=document.createElement('button');b.type='button';b.className='swatch';b.dataset.pal=id;b.setAttribute('aria-pressed','false');b.setAttribute('aria-label',p.name);b.title=p.name;
  const cv=document.createElement('canvas');cv.setAttribute('aria-hidden','true');b.appendChild(cv);b._cv=cv;b._p=p;b.addEventListener('click',()=>{S.palette=id;save();paintKeys();layout();});dotsEl.appendChild(b);});
const playKey=$('playKey');
playKey.addEventListener('click',()=>{if(gen){stopRadio();return;}playRadio();
  if(!cat.inBox&&!cat.eat&&!cat.purr&&!cat.goBox&&(cat.state==='sit'||cat.state==='act'))act((performance.now()-t0)/1000,'loaf');}); /* press play and she settles into a loaf */
const brightEl=$('brightness'),volEl=$('volume');brightEl.value=S.brightness;volEl.value=S.volume;
brightEl.addEventListener('input',()=>{S.brightness=+brightEl.value;paintKeys();save();});
function applyVol(){if(gen)gen.master.gain.setTargetAtTime(vol()*GEN_LEVEL[gen.id],actx.currentTime,.1);}
function setMuted(m){muted=!!m;applyVol();dirty=true;paintKeys();}
const muteKey=$('muteKey');muteKey.addEventListener('click',()=>setMuted(!muted));
volEl.addEventListener('input',()=>{S.volume=+volEl.value;muted=false;applyVol();paintKeys();save();});
function paintKeys(){applyScheme();
  dotsEl.querySelectorAll('.swatch').forEach(b=>{const on=b.dataset.pal===S.palette;b.setAttribute('aria-pressed',String(on));drawPalTile(b._cv,b._p,on);});
  const on=!!gen;playKey.setAttribute('aria-pressed',String(!!on));playKey.title=on?'Stop':'Play';
  if(typeof paintPipMute==='function')paintPipMute(!!on);
  $('brightnessOut').textContent=Math.round(S.brightness*100);$('volOut').textContent=muted?'Muted':Math.round(S.volume*100);
  muteKey.setAttribute('aria-pressed',String(muted));muteKey.setAttribute('aria-label',muted?'Unmute':'Mute');muteKey.title=muted?'Unmute':'Mute';volEl.closest('.vol').classList.toggle('muted',muted);
  brightEl.style.setProperty('--v',((S.brightness-.1)/.9*100)+'%');volEl.style.setProperty('--v',(S.volume*100)+'%');}


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
const cat={x:60,dir:1,state:'sit',until:3,target:null,eat:null,blink:0,nextBlink:4,zt:0,purr:false,hearts:[],ht:0,pets:0};
let purrNode=null;
const ACT_WORDS={loaf:'loafing',groom:'grooming',yawn:'yawning',glance:'looking around',stretch:'stretching'};
function catWords(){if(cat.inBox)return cat.state==='sleep'?'asleep in her box':cat.purr?'purring in her box':'in her box';if(cat.state==='hop')return 'hop!';if(cat.state==='sleep'&&cat.away)return 'dozing till you get back';if(cat.state==='act'&&ACT_WORDS[cat.act])return ACT_WORDS[cat.act];if(cat.state==='eat')return 'eating a fish';if(cat.state==='fed')return 'happy and full';if(cat.purr)return 'purring';if(cat.state==='sleep')return 'asleep';if(cat.state==='walk')return 'wandering';
  return {rain:'watching the rain',snow:'watching the snow',leaves:'watching leaves fall',petals:'watching petals',fireflies:'watching fireflies'}[skyNow]||(isNight(NOW())?'moon gazing':'on the desk');}
function pick(t,now){const night=nightDim(now)<.7;const r=Math.random();
  if(night&&r<.6){cat.state='sleep';cat.until=t+15+Math.random()*25;return;}
  if(r<(RM.matches?.1:.25)){cat.state='walk';cat.target=DESK_MIN+Math.random()*(W-14-DESK_MIN);return;}
  if(r<.52){cat.state='sit';cat.until=t+5+Math.random()*8;return;}
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
const BOX=['X..................X','.X................X.','..LLLLLLLLLLLLLLLL..','..HTTTTTTTKKTTTTTD..','..HTTTTTTTKKTWWWWD..','..HTTTTTTTKKWWWWTD..','..SSSSSSSSSSSSSSSS..']; /* H lit side, D shaded side, S shadow at the base, K packing tape, W a crooked shipping label */
const BOXC={X:0xb8894f,L:0xdcb47a,H:0xd1a86f,T:0xc49a62,D:0x8f6b3d,S:0xa07a4a,K:0xae8550,W:0xece2cf};
function hop(t,into){cat.state='hop';cat.hop={x0:cat.x,x1:into?BOX_IN:BOX_OUT,t0:t,d:.65,into};cat.dir=into?-1:1;cat.inBox=false;}
const ACT_LEN={loaf:[8,16],groom:[2.5,4],yawn:[1.4,1.4],glance:[2.6,2.6],lookup:[4,8],stretch:[1.8,1.8]};
function act(t,a,...next){if(cat.inBox){cat.state='box';cat.t0=t;cat.until=t+6+Math.random()*8;return;}cat.state='act';cat.act=a;cat.t0=t;const [lo,hi]=ACT_LEN[a];cat.until=t+lo+Math.random()*(hi-lo);cat.queue=next;}
/* when you've been away from the page for a while she curls up; when you come back she wakes, yawns, stretches and wanders over */
const AWAY_MS=10*60*1000;let lastActive=Date.now();
function noteActive(){lastActive=Date.now();if(cat.away){cat.away=false;if(!S.sitStart){act((performance.now()-t0)/1000,'yawn','stretch');cat.comeOver=true;}}}
function catStep(t,dt,now){
  if(cat.purr){cat.ht-=dt;if(cat.ht<=0){cat.hearts.push({x:cat.x+(Math.random()<.5?-2:12),y:2,a:1,dx:(Math.random()-.5)*2});cat.ht=.7+Math.random()*.4;cat.pets++;
      if(cat.pets>6&&cat.state!=='sleep'){cat.state='sleep';cat.until=t+25+Math.random()*25;cat.purr=false;purrStop();}}return;} /* pet her past six hearts and she dozes off */
  if(cat.state==='hop'){const h=cat.hop,q=(t-h.t0)/h.d;if(q<1){cat.x=h.x0+(h.x1-h.x0)*q;return;}cat.x=h.x1;
    if(h.into){cat.inBox=true;cat.state='box';cat.t0=t;cat.until=t+12+Math.random()*16;}else if(cat.next!=null){cat.state='walk';cat.target=cat.next;cat.next=null;}else{cat.state='sit';cat.until=t+3+Math.random()*4;}return;}
  if(S.sitStart){cat.state='sleep';return;} /* she sits with you */
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
   Night brings stars and the real phase of the moon. The season comes from the date, flipped for the southern
   hemisphere when the device's time zone is there. Each day has its own weather, picked from the date, so it's the
   same all day and on every device. Try ?sky=rain, snow, leaves, petals or fireflies, and &night to see the moon. */
const SKYQ=new URLSearchParams(location.search),SKY_FORCE=(SKYQ.get('sky')||'').toLowerCase(),NIGHT_FORCE=SKYQ.has('night');
const SOUTH=(()=>{try{return /^(Australia|Antarctica|Pacific\/(Auckland|Chatham|Fiji|Tongatapu|Apia|Noumea)|America\/(Sao_Paulo|Argentina|Buenos_Aires|Santiago|Montevideo|Asuncion|La_Paz|Lima|Punta_Arenas)|Africa\/(Johannesburg|Maputo|Harare|Windhoek|Gaborone|Lusaka|Maseru|Mbabane|Blantyre|Lubumbashi)|Indian\/(Mauritius|Reunion|Antananarivo))/.test(Intl.DateTimeFormat().resolvedOptions().timeZone||'');}catch(e){return false;}})();
function season(d){let m=d.getMonth();if(SOUTH)m=(m+6)%12;return m===11||m<2?'winter':m<5?'spring':m<8?'summer':'autumn';}
function dayRand(d){let h=d.getFullYear()*400+d.getMonth()*32+d.getDate();h=Math.imul(h^h>>>15,2246822507);h=Math.imul(h^h>>>13,3266489909);return ((h^h>>>16)>>>0)/4294967296;}
function isNight(d){if(NIGHT_FORCE)return true;const h=d.getHours();return h>=20||h<6;}
function skyKind(d){if(SKY_FORCE)return SKY_FORCE;if(gen&&(gen.id==='gen:rain'||gen.id==='gen:window'))return 'rain'; /* play rain and it rains on her desk */const s=season(d),r=dayRand(d);
  if(s==='winter')return r<.45?'snow':r<.6?'rain':'clear';
  if(r<.18)return 'rain';
  return s==='autumn'?'leaves':s==='spring'?'petals':isNight(d)?'fireflies':'clear';}
function moonPhase(d){const p=((d.getTime()-Date.UTC(2000,0,6,18,14))/864e5/29.530588853)%1;return p<0?p+1:p;}
function put(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&x<W&&y>=0&&y<13)gfb[(y+2)*W+x]=c;} /* the sky sits in the 13 rows above the desk */
function drawSky(t,P,now){const peg=k=>[P.A,P.HI,P.FISH,P.S2][k],kind=skyKind(now);
  if(isNight(now)){
    for(let i=0;i<9;i++){const sx=(i*23+Math.floor(t*(.3+i*.15)))%W;put(W-1-sx,(i*5)%9,dim(i%4?P.HI:P.FISH,i%4?.38:.5));} /* stars, one in four warm */
    const p=moonPhase(now),mx=118,my=4,r=3.4;
    for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){if(dx*dx+dy*dy>r*r)continue;const w=Math.sqrt(r*r-dy*dy),c=Math.cos(2*Math.PI*p)*w,ex=SOUTH?-dx:dx;
      const lit=p<.5?ex>c-.5:ex<-c+.5,crater=(dx===-1&&dy===-1)||(dx===1&&dy===1)||(dx===2&&dy===-1)||(dx===-1&&dy===2);put(mx+dx,my+dy,lit?(crater?dim(P.HI,.55):P.HI):dim(P.DEEP,.8));}} /* a few craters so it reads as the moon */
  if(kind==='rain'){const rc=P.PEG?P.PEG[4]:peg(3);for(let i=0;i<(RM.matches?8:16);i++){const y=(t*10+i*4.3)%13,x=(i*8+5-y*.5+W)%W;put(x,y,dim(rc,.6));put(x+.5,y-1,dim(rc,.25));}} /* rain is blue on the pegboard */
  else if(kind==='snow')for(let i=0;i<(RM.matches?7:14);i++){const y=(t*2.2+i*3.7)%13,x=(i*9.1+Math.sin(t*.8+i)*2.2+W)%W;put(x,y,dim(P.HI,.8));}
  else if(kind==='leaves')for(let i=0;i<(RM.matches?4:8);i++){const y=(t*1.6+i*2.9)%13,sw=Math.sin(t*1.1+i*2),x=((i*16.3+sw*4+t*1.5)%W+W)%W,c=dim(peg([0,2,0,2,1,0,2,0][i]),.85);put(x,y,c);put(x+1,y+(sw>0?1:-1),dim(c,.6));} /* two-dot leaves that tumble as they fall */
  else if(kind==='petals')for(let i=0;i<(RM.matches?5:9);i++){const y=(t*1.3+i*2.1)%13,sw=Math.sin(t*.9+i*1.7),x=((i*14.7+sw*5+t*1.2)%W+W)%W,c=i%3?0xff9ec4:dim(P.C,.7);put(x,y,c);if(sw>.3)put(x+1,y,dim(c,.5));}
  else if(kind==='fireflies')for(let i=0;i<(RM.matches?3:5);i++){const a=Math.sin(t*1.7+i*2.1);if(a<.2)continue;const x=(i*26+Math.sin(t*.4+i)*6+W)%W,y=2+(((i*5+Math.sin(t*.6+i*1.7)*3)%8)+8)%8;put(x,y,dim(i%2?peg(1):peg(2),a));}
  return kind;}
let skyNow='clear';
let glast=0;
function drawGame(t){const P=pal();SHADE=P.MID;HIC=P.HI;EARC=P.PEG?P.PEG[5]:dim(P.A,.85);const now=NOW();gfb.fill(-1);const dt=Math.min(.05,glast?t-glast:0);glast=t;catStep(t,dt,now);const ground=15;
  skyNow=drawSky(t,P,now);
  const sp=sitPhase(),pegsLit=sp&&sp.ph==='sit'?Math.floor(sp.p*32):32,pulse=.55+.45*Math.sin(t*1.2);
  for(let x=0;x<W;x++){const major=x%4===0;gfb[(ground+1)*W+x]=P.PEG?-1:P.DEEP;
    if(major&&sp&&sp.ph!=='done'){const k=x>>2;gfb[ground*W+x]=k<pegsLit?(sp.ph==='rest'?dim(P.HI,.6+.4*pulse):P.HI):k===pegsLit?dim(P.HI,.25+.5*pulse):P.DEEP;continue;} /* while you sit, the pegs light one by one */
    gfb[ground*W+x]=P.PEG?dim(P.PEG[(x>>2)%P.PEG.length],major?1:.8):major?P.S2:P.MID;} /* the desk edge (on the pegboard, a rainbow line of pegs, four of each colour) */
  for(const tr of treats){if(tr.y<ground-3){tr.vy+=70*dt;tr.y=Math.min(ground-3,tr.y+tr.vy*dt);if(tr.y>=ground-3)plip();} /* the treat drops onto the desk */
    const bite=cat.state==='eat'&&cat.eat===tr?clamp((cat.until-t)/EAT_S,0,1):1;if(bite>0)blit(FISH,Math.round(tr.x),Math.round(tr.y),dim(P.FISH,.35+.65*bite),true,true);}
  const on=playing();const cx=Math.round(cat.x);
  cat.nextBlink-=dt;if(cat.nextBlink<0){cat.blink=.15;cat.nextBlink=3+Math.random()*4;}cat.blink-=dt;
  const eyesOpen=!cat.purr&&cat.blink<=0;
  if(cat.state==='hop'){const h=cat.hop,q=clamp((t-h.t0)/h.d,0,1);blit(KIT_STEP,cx,ground-12-Math.round(Math.sin(Math.PI*q)*3),P.C,true);}
  else if(cat.state==='box'&&!cat.purr){const ph=(t-cat.t0)%7,duck=ph>3&&ph<5;blit(duck?KIT.slice(0,9):KIT,cx,ground-12+(duck?3:0),P.C,eyesOpen);} /* peeking over the edge, ducking down now and then */
  else if(cat.state==='sleep'){blit(KIT_SLEEP,cx,ground-5,P.C);
    cat.zt+=dt;const ph=cat.zt%3.5;if(ph<2){const zx=cat.dir>0?cx+15:cx-5,zy=Math.round(9-ph*3);blit(ZEE,zx,zy,dim(P.S2,.6*(1-ph/2)+.2));}}
  else if(cat.purr||cat.state==='fed')blit(KIT_PET,cx,ground-12,P.C,true);
  else if(cat.state==='eat'){const dn=Math.floor(t*5)%2;blit(dn?KIT:KIT_PET,cx,ground-12+dn,P.C,!dn);} /* nom: eyes shut on each bite, happy squint between */
  else if(cat.state==='act'){const a=cat.act,e=t-cat.t0;
    if(a==='loaf')blit(KIT_LOAF,cx,ground-12,P.C,true);
    else if(a==='groom'){const f=Math.floor(e*3)%2;blit(KIT_GROOM,cx,ground-12+f,P.C,true);}
    else if(a==='yawn')blit(KIT_YAWN,cx,ground-12,P.C,false);
    else if(a==='glance')blit(e<.5?(Math.floor(e*8)%2?KIT_EAR:KIT):e<1.4?KIT_LOOK:e<2.2?KIT_LOOKR:KIT,cx,ground-12,P.C,eyesOpen);
    else if(a==='lookup')blit(KIT_UP,cx,ground-12,P.C,eyesOpen);
    else if(a==='stretch')blit(KIT_STRETCH,cx,ground-13,P.C,false);
    else blit(KIT,cx,ground-12,P.C,eyesOpen);}
  else if(cat.state==='walk'){const f=Math.floor(t*6)%2;blit(f?KIT_STEP:KIT,cx,ground-12,P.C,eyesOpen);}
  else blit(KIT,cx,ground-12,P.C,eyesOpen);
  if(on&&cat.state!=='sleep'){const tw=Math.round(vu(t)[2]*2);for(let k=0;k<tw;k++){const tx=cat.dir>0?cx-1-k:cx+14+k;if(tx>=0&&tx<W)gfb[(ground-1-k)*W+tx]=P.C;}} /* her tail flicks to the music */
  BOX.forEach((row,j)=>{for(let i=0;i<row.length;i++){const ch=row[i];if(ch!=='.')gfb[(ground-7+j)*W+BOX_X+i]=BOXC[ch];}}); /* the box goes in front of her */
  for(const hh of cat.hearts){hh.y-=dt*4;hh.x+=hh.dx*dt;hh.a-=dt*.35;if(hh.a>0)blit(HEART,Math.round(hh.x),Math.round(hh.y),dim(P.A,Math.max(.25,hh.a)));}
  cat.hearts=cat.hearts.filter(hh=>hh.a>0&&hh.y>-4);}
/* touch: tap her to pet (she purrs while you hold); tap the desk and she mews and walks over */
function ensureAudio(){actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();return actx;}
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
function catHit(e){const r=gameWin.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*W;return {x,near:Math.abs(x-(cat.x+7))<9};}
/* treats: tap the fish button whenever you like and one drops onto the desk near her; she trots over and eats it */
let treats=[];const EAT_S=2.4;
function dropTreat(){if(treats.length>=4)return;let x=cat.dir>0?cat.x+22:cat.x-9;if(x<1||x>W-6)x=cat.dir>0?cat.x-9:cat.x+22;x=clamp(x+Math.round((Math.random()-.5)*6),BOX_OUT+12,W-6);
  for(const o of treats)if(Math.abs(o.x-x)<6)x=clamp(o.x+(x<o.x?-6:6),BOX_OUT+12,W-6);treats.push({x,y:-3,vy:0});dirty=true;}
function plip(){try{const a=ensureAudio(),t0=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(900,t0);o.frequency.exponentialRampToValueAtTime(420,t0+.08);
  g.gain.setValueAtTime(.035,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.12);o.connect(g).connect(a.destination);o.start(t0);o.stop(t0+.14);}catch(e){}} /* a tiny plip as it lands */
function munch(){try{const a=ensureAudio(),t0=a.currentTime;for(let k=0;k<3;k++){const t=t0+.15+k*.42,s=a.createBufferSource(),n=a.sampleRate*.05,bf=a.createBuffer(1,n,a.sampleRate),d=bf.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);s.buffer=bf;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1100;const g=a.createGain();g.gain.value=.05;s.connect(lp).connect(g).connect(a.destination);s.start(t);}}catch(e){}} /* three soft little crunches */
gameWin.addEventListener('pointerdown',e=>{e.preventDefault();const hit=catHit(e);
  if(cat.eat||cat.state==='fed'||cat.state==='hop')return; /* let her eat (or land) in peace */
  if(hit.near){cat.purr=true;cat.pets=0;if(cat.state!=='sleep'&&!cat.inBox)cat.state='sit';purrStart();}
  else if(hit.x<BOX_X+20){if(S.sitStart)return;if(cat.inBox){cat.t0=(performance.now()-t0)/1000-3;return;} /* tap the box: she ducks; or she comes and climbs in */
    cat.purr=false;purrStop();mew();cat.goBox=true;cat.state='walk';cat.target=BOX_OUT;}
  else{if(S.sitStart)return;cat.purr=false;purrStop();mew();cat.goBox=false;cat.state='walk';cat.target=clamp(hit.x-7,DESK_MIN,W-14);}});
['pointerup','pointerleave','pointercancel'].forEach(ev=>gameWin.addEventListener(ev,()=>{if(cat.purr){cat.purr=false;purrStop();if(cat.state!=='sleep'){const tt=(performance.now()-t0)/1000;if(cat.inBox){cat.state='box';cat.until=Math.max(cat.until||0,tt+8);}else{cat.state='sit';cat.until=tt+6;}}}}));
function paintGame(){gameWin.hidden=false;layout();}


/* ================= Idle fade, keyboard, init ================= */
let idleT;function wake(){noteActive();document.body.classList.remove('idle');clearTimeout(idleT);idleT=setTimeout(()=>document.body.classList.add('idle'),10000);}
['pointermove','pointerdown','keydown','touchstart','focusin','scroll','wheel'].forEach(ev=>document.addEventListener(ev,wake,{passive:true}));wake();
/* No keyboard shortcuts on purpose: people type in other windows, and a stray key should never stop the music.
   Every control is still a normal button, so Tab and Enter work for keyboard users. */
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)){navigator.serviceWorker.register('./sw.js').catch(()=>{});}
paintKeys();paintGame();


/* ================= Sit: twenty minutes with the cat =================
   Twenty minutes, the length many meditation practices use (often twice a day), then two unhurried minutes before
   you get up. She sleeps beside you the whole time, the pegs along the desk light one by one as the time passes,
   a soft low tone marks the end, and she gets a fish when it's over. */
const SIT_MIN=20,REST_MIN=2,FISH=['.##.#','####.','.##.#'];
function today(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function sitPhase(){if(!S.sitStart)return null;const e=(Date.now()-S.sitStart)/60000;
  if(e<SIT_MIN)return {ph:'sit',p:e/SIT_MIN,left:Math.max(1,Math.ceil(SIT_MIN-e))};if(e<SIT_MIN+REST_MIN)return {ph:'rest',p:(e-SIT_MIN)/REST_MIN};return {ph:'done'};}
let sitTone=null;
function scheduleTone(){try{const a=ensureAudio(),left=(S.sitStart+SIT_MIN*60000-Date.now())/1000;if(left<=0)return;const t=a.currentTime+left;
  const g=a.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+1.2);g.gain.exponentialRampToValueAtTime(.0001,t+7);g.connect(a.destination);
  const o1=a.createOscillator(),o2=a.createOscillator();o1.type=o2.type='sine';o1.frequency.value=220;o2.frequency.value=330;o1.connect(g);o2.connect(g);o1.start(t);o2.start(t);o1.stop(t+7.2);o2.stop(t+7.2);
  sitTone={stop(){try{o1.stop();o2.stop();g.disconnect();}catch(e){}}};}catch(e){}} /* scheduled on the audio clock, so it arrives on time even in a background tab */
function sitStart(){S.sitStart=Date.now();save();cat.purr=false;purrStop();cat.state='sleep';scheduleTone();paintSit();dirty=true;}
function sitEnd(finished){S.sitStart=0;save();if(sitTone){sitTone.stop();sitTone=null;}
  cat.state='walk';cat.target=clamp(W/2-7+(Math.random()-.5)*20,0,W-14);if(finished)setTimeout(dropTreat,1500);paintSit();dirty=true;}
const sitKey=$('sitKey');
function paintSit(){const on=!!S.sitStart;feedKey.disabled=on;sitKey.setAttribute('aria-pressed',String(on));sitKey.title=on?'End the sit':'Sit for 20 minutes';}
sitKey.addEventListener('click',()=>{S.sitStart?sitEnd(false):sitStart();});
const feedKey=$('feedKey');feedKey.addEventListener('click',dropTreat);
setInterval(()=>{const sp=sitPhase();if(sp&&sp.ph==='done')sitEnd(true);},1000);
if(S.sitStart&&sitPhase().ph==='done')sitEnd(true);
paintSit();
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
function paintPipMute(on){if(pipDots){pipDots.style.color=(PALETTES[S.palette]||PALETTES.crt).primary;}if(pipDots)pipDots.querySelectorAll('button').forEach(b=>{const on=b.dataset.pal===S.palette;b.setAttribute('aria-pressed',String(on));drawPalTile(b._cv,b._p,on);});if(!pipMute)return;
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
  const st=pw.document.createElement('style');st.textContent='html,body{margin:0;height:100%;background:#050607;overflow:hidden}body{display:flex;flex-direction:column;gap:6px;padding:6px;box-sizing:border-box}.pipbar{flex:0 0 auto;align-self:flex-end;display:flex;align-items:center;gap:4px;height:26px;padding:0 2px} /* under the desk, bottom right, never over the display */.pipdots{display:flex;gap:2px;opacity:.4;transition:opacity .2s}body:hover .pipdots,.pipdots:focus-within{opacity:1}.pipdots button{color:inherit;position:relative;width:28px;height:24px;border:0;border-radius:3px;padding:0;background:transparent;cursor:pointer;display:grid;place-items:center}.pipdots canvas{width:20px;height:13px;display:block}.pipdots button::after{content:"";position:absolute;left:50%;bottom:0;width:10px;height:2px;margin-left:-5px;background:repeating-linear-gradient(90deg,currentColor 0 2px,transparent 2px 4px);opacity:0}.pipdots button[aria-pressed="true"]::after{opacity:1}.pipdots button:hover{background:rgba(255,255,255,.08)}.pipmute{width:28px;height:24px;border:0;border-radius:3px;padding:0;display:grid;place-items:center;cursor:pointer;background:transparent;opacity:.5;transition:opacity .2s}.pipmute:hover{background:rgba(255,255,255,.08)}body:hover .pipmute,.pipmute:focus-visible,.pipmute.muted{opacity:1}.pipmute[hidden]{display:none}.pipmute svg{width:20px;height:17px;fill:currentColor;filter:drop-shadow(0 0 2px currentColor)}.pipmute svg+svg,.pipmute.muted svg:first-child{display:none}.pipmute.muted svg+svg{display:block}';
  pw.document.head.appendChild(st);pw.document.title='Loaf FM';
  floatNote.style.minHeight=(win.offsetHeight+gameWin.offsetHeight+8)+'px';floatNote.hidden=false;
  pw.document.body.append(win,gameWin);
  const mb=pw.document.createElement('button');mb.type='button';mb.className='pipmute';mb.innerHTML='<svg viewBox="-1 -1 13 11" shape-rendering="crispEdges"><path d="'+VOL_ON+'"/></svg><svg viewBox="-1 -1 13 11" shape-rendering="crispEdges"><path d="'+VOL_OFF+'"/></svg>';
  mb.addEventListener('click',()=>setMuted(!muted));
  const bar=pw.document.createElement('div');bar.className='pipbar';const pd=pw.document.createElement('div');pd.className='pipdots';pd.setAttribute('role','group');pd.setAttribute('aria-label','Palette');
  Object.entries(PALETTES).forEach(([id,p])=>{const d=pw.document.createElement('button');d.type='button';d.dataset.pal=id;d.title=p.name;d.setAttribute('aria-label',p.name);d.setAttribute('aria-pressed','false');const cv=pw.document.createElement('canvas');d.appendChild(cv);d._cv=cv;d._p=p;
    d.addEventListener('click',()=>{S.palette=id;save();paintKeys();layout();});pd.appendChild(d);});
  bar.append(pd,mb);pw.document.body.appendChild(bar);pipMute=mb;pipDots=pd;paintKeys();
  floatWin=pw;host=pw;restartLoop();
  pw.addEventListener('resize',relayout);
  ['pointermove','pointerdown','keydown'].forEach(ev=>pw.document.addEventListener(ev,noteActive,{passive:true}));
  pw.addEventListener('pagehide',()=>{pipMute=null;pipDots=null;floatNote.before(win,gameWin);floatNote.hidden=true;floatWin=null;host=window;restartLoop();layout();paintFloat();},{once:true});
  layout();paintFloat();}
function vidFrame(){const g=vidPip.g,w=vidPip.cv.width,h1=Math.round(w/4),h2=Math.round(w*GH/W);g.fillStyle='#050607';g.fillRect(0,0,w,vidPip.cv.height);
  g.drawImage(bgC,0,0,w,h1);g.drawImage(ledC,0,0,w,h1);g.drawImage(gbgC,0,h1+6,w,h2);g.drawImage(gledC,0,h1+6,w,h2);}
function prepVid(){if(vidPip.ready)return;const c=document.createElement('canvas');c.width=640;c.height=160+6+80;vidPip.cv=c;vidPip.g=c.getContext('2d');vidPip.ready=true;vidFrame();
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
if(BC){const st=[...CALM,...MUSIC].find(s=>s.id===S.station)||MUSIC[0];S.stationName=st.name;fillStations();
  const begin=()=>{if(!gen)genStart(S.station);if(actx&&actx.state!=='running'){const o=document.createElement('button');o.className='bcstart';o.textContent='Click to start the sound';
      o.addEventListener('click',()=>{actx.resume();o.remove();});document.body.appendChild(o);}};
  begin();
  if(BC.rotate&&BC.list.length>1){let i=Math.max(0,BC.list.indexOf(S.station));setInterval(()=>{i=(i+1)%BC.list.length;const nx=[...CALM,...MUSIC].find(s=>s.id===BC.list[i]);
      genStop(false);setTimeout(()=>{S.station=nx.id;S.stationName=nx.name;dirty=true;fillStations();genStart(S.station);},1200);},BC.rotate*60000);} /* a gentle fade between stations */
  if(BC.treats)setInterval(()=>{if(Math.random()<1/25&&!S.sitStart)dropTreat();},60000);} /* a treat every 25 minutes or so */

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
