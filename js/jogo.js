const canvas=document.getElementById('game'),g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
const held=new Set(),pressedAt={},TIMESPOT=200,COMBO_WIN=120,JUMP_WIN=200,floor=440,keys={a:'left',d:'right',w:'jump',s:'crouch',e:'punch',q:'kick',r:'special',shift:'charge',arrowleft:'left',arrowright:'right',arrowup:'jump',arrowdown:'crouch'};
let x=260,y=floor,vy=0,face=1,energy=0,hp=100,action='',actionUntil=0,walk=0,shots=[],effects=[],last=0,pendingShot=null,clock=0,chargeTick=0,charging=false,stunUntil=0;
const dummy={x:730,hp:100,flash:0,attackTimer:0,attackAnim:0};let dummyMode='idle',parryUntil=0,dummyChar='scarecrow';document.getElementById('dummyMode').addEventListener('change',e=>{dummyMode=e.target.value;dummy.hp=dummyMax;dummy.flash=0;dummy.attackTimer=0;dummy.attackAnim=0;shots=[];effects=[];});const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// Espantalho: o super soco custa 5 e causa 5 de dano por golpe; segurando E+R ele continua girando, golpeando a cada SCARE_TICK ms e gastando 5 de energia por golpe até a energia acabar.
const SCARE_TICK=200,SCARE_FIRST=160;
let scareState=0,scareStart=0,scareNextTick=0,scareFirst=false,scareRecEnd=0;
function applyCharacterSpecs(){if(typeof wesleySpecsReset==='function')wesleySpecsReset();specs.superPunch=selectedCharacter==='scarecrow'?{cost:5,dmg:5,range:160,duration:440}:{cost:40,dmg:20,range:160,duration:440};scareState=0}
function scareHit(){const a=specs.superPunch;if(dummyMode!=='none'&&Math.abs(dummy.x-x)<=a.range&&Math.sign(dummy.x-x)===face)hit(a.dmg)}
function scareHoldTick(){
 if(scareState!==1)return;
 const holding=held.has('punch')&&held.has('special');
 if(action!=='superPunch'||clock<stunUntil){scareState=0;return}
 const stop=()=>{if(scareFirst){scareFirst=false;scareHit()}scareState=2;scareRecEnd=clock+110;actionUntil=scareRecEnd};
 if(!holding){stop();return}
 actionUntil=clock+200;
 if(clock>=scareNextTick){
  if(scareFirst){scareFirst=false;scareHit();scareNextTick+=SCARE_TICK}
  else if(energy>=5){energy-=5;scareHit();scareNextTick+=SCARE_TICK}
  else stop()
 }
}
function hit(dmg,unparry){if(dummyMode==='none'||dummy.hp<=0||!fightLive())return;if(typeof wesleyDummyImmune==='function'&&wesleyDummyImmune()){effects.push({x:dummy.x,y:floor-175,t:450,label:'IMUNE'});return}if(selectedMode==='vs'&&!unparry&&clock<(dummy.parryUntil||0)){dummyParried();return}dummy.hp=clamp(dummy.hp-dmg,0,dummyMax);dummy.flash=170;if(dummyChar==='wesley')wesleyHurtSound();if(selectedMode==='vs'){dummy.stunUntil=clock+250;if(dmg>=10)dummy.pend=null}effects.push({x:dummy.x,y:floor-85,t:350,label:'-'+dmg});if(dummy.hp===0){if(selectedMode==='vs'){endRound(0)}else{effects.push({x:dummy.x,y:floor-160,t:1000,label:'ALVO DERROTADO'});setTimeout(()=>{if(dummy.hp===0)dummy.hp=dummyMax},1200)}}}
function start(name){if(playerCliffFalling)return false;if(selectedCharacter==='zusk'&&action==='mega'&&clock<actionUntil)return false;if(wesUltOn())return false;let a=specs[name];if(selectedCharacter==='wesley'&&(name==='frontTeleport'||name==='backTeleport')&&a)a=wesleyTauntSpec(a);if(clock<stunUntil&&['punch','kick','shot','superPunch','superKick','superShot','mega'].includes(name))return false;if(!a||energy<a.cost||(clock<actionUntil&&!['superPunch','superKick','superShot','parry','frontTeleport','backTeleport','mega'].includes(name)))return false;energy-=a.cost;action=name;actionUntil=clock+a.duration;if(selectedCharacter==='wesley'&&name!=='shot')wesleyStopShotSound();if(selectedCharacter==='wesley'&&name==='punch')wesleyPunchSound();if(selectedCharacter==='wesley'&&(name==='kick'||name==='superKick'))wesleyKickSound();if(name==='punch')playSnd('punch');else if(name==='kick')playSnd('kick');else if(selectedCharacter==='wesley'&&name==='superPunch')wesleySuperPunchSound();else if(selectedCharacter==='wesley'&&name==='superKick')wesleySuperKickSound();else if(name==='superPunch'||name==='superKick')playSuper();else if(selectedCharacter==='zusk'&&(name==='shot'||name==='superShot'||name==='mega'))playKi(name);else if((name==='frontTeleport'||name==='backTeleport')&&selectedCharacter!=='wesley')playTeleport();
if(name==='frontTeleport'||name==='backTeleport'){if(selectedCharacter==='wesley'){wesleyTauntStart(name);return true}if(selectedCharacter==='zusk'&&y>=floor-1){zTpStart=clock;zTpFromX=x;actionUntil=clock+ZTP_TOTAL}const tpDir=(name==='frontTeleport'?1:-1)*face;x=clamp(x+tpDir*300,55,905);effects.push({x,y:y-95,t:420,label:'TELEPORTE'});return true}
if(name==='shot'){const act=actionUntil;if(selectedCharacter==='wesley')wesleyShotSound();setTimeout(()=>{if(action==='shot'&&actionUntil===act){if(selectedCharacter==='wesley')wesleyFireSound();shots.push({x:x+face*100,y:y-92,vx:face*12,damage:a.dmg,size:18,life:1600,color:'#ffdc48',homing:false,spr:selectedCharacter==='zusk',dir:face})}},160);return true}
if(name==='mega'&&selectedCharacter==='zusk'){zMegaStart=clock;zMegaHitIdx=0;actionUntil=clock+ZM_TOTAL;return true}
if(name==='superShot'&&selectedCharacter==='wesley'){const act=wesleySuperShotStart();setTimeout(()=>{if(action==='superShot'&&actionUntil===act){wesleyFireSound();shots.push({x:x+face*100,y:y-92,vx:face*12,damage:a.dmg,size:32,life:1600,color:'#76dcff',homing:true})}},160);return true}
if(name==='superShot'&&selectedCharacter==='zusk'){const act=actionUntil;setTimeout(()=>{if(action==='superShot'&&actionUntil===act)shots.push({x:x+face*100,y:y-92,vx:face*12,damage:a.dmg,size:32,life:1600,color:'#ffdc48',homing:true,spr:true,dir:face})},235);return true}
if(name==='mega'&&selectedCharacter==='wesley'){if(wesleyMegaGun())wesleyMegaStart(a);else wesleyUlt2Start(a);return true}
if(name==='shot'||name==='superShot'||name==='mega'){shots.push({x:x+face*62,y:y-120,vx:face*(name==='mega'?9:12),damage:a.dmg,size:name==='mega'?48:name==='superShot'?32:18,life:1600,color:name==='mega'?'#f6a0ff':name==='superShot'?'#76dcff':'#ffdc48',homing:name==='superShot'});return true}
if(name==='parry'){parryUntil=clock+PARRY_WIN;parryStartAt=clock;parryHitAt=-1;effects.push({x,y:y-145,t:480,label:'PARRY ATIVO'});return true}
if(name==='superPunch'&&selectedCharacter==='scarecrow'){scareState=1;scareStart=clock;scareNextTick=clock+SCARE_FIRST;scareFirst=true;actionUntil=clock+400;return true}
if(name==='superPunch'&&selectedCharacter==='wesley'){const act=actionUntil;wesleySuperPunchHitTimes().forEach(t=>setTimeout(()=>{if(action==='superPunch'&&actionUntil===act&&dummyMode!=='none'&&Math.abs(dummy.x-x)<=a.range&&Math.sign(dummy.x-x)===face)hit(WES_SPUNCH_DMG)},t));return true}
if(name==='superPunch'){const act=actionUntil;setTimeout(()=>{if(action==='superPunch'&&actionUntil===act&&dummyMode!=='none'&&Math.abs(dummy.x-x)<=a.range&&Math.sign(dummy.x-x)===face)hit(a.dmg)},210);return true}
if(name==='superKick'){const act=actionUntil;setTimeout(()=>{if(action==='superKick'&&actionUntil===act&&dummyMode!=='none'&&Math.abs(dummy.x-x)<=a.range&&Math.sign(dummy.x-x)===face)hit(a.dmg)},(selectedCharacter==='wesley'&&typeof wesleyBatHitMs==='function'?wesleyBatHitMs():262));return true}
if(dummyMode!=='none'&&a.range&&Math.abs(dummy.x-x)<=a.range&&Math.sign(dummy.x-x)===face)hit(a.dmg);return true}

// ===== Integração da IA do P2 (modo VS) =====

let sndCtx=null;const sndBuf={},sndEl={};
function sndDecode(k){
  // URL externa em vez de grandes cadeias Base64 dentro do HTML.
  fetch(SND_URLS[k]).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.arrayBuffer()})
    .then(buffer=>sndCtx.decodeAudioData(buffer))
    .then(decoded=>{sndBuf[k]=decoded})
    .catch(er=>console.warn('som: falha ao decodificar',k,er));
}
function sndInit(){if(sndCtx)return;try{const AC=window.AudioContext||window.webkitAudioContext;sndCtx=new AC();Object.keys(SND_URLS).forEach(sndDecode)}catch(er){console.warn('som: WebAudio indisponível',er)}}
function sndUnlock(){sndInit();if(sndCtx&&sndCtx.state==='suspended')sndCtx.resume().catch(()=>{})}
['keydown','pointerdown','touchstart','click'].forEach(ev=>addEventListener(ev,sndUnlock,true));
function playSnd(k,vol){try{sndUnlock();
  if(sndCtx&&sndBuf[k]){const s=sndCtx.createBufferSource();s.buffer=sndBuf[k];if(vol===undefined)s.connect(sndCtx.destination);else{const gn=sndCtx.createGain();gn.gain.value=vol;s.connect(gn);gn.connect(sndCtx.destination)}s.start(0);return}
  if(!sndEl[k])sndEl[k]=new Audio(SND_URLS[k]);const a=sndEl[k].cloneNode();a.volume=vol===undefined?1:vol;const pr=a.play();if(pr&&pr.catch)pr.catch(er=>console.warn('som:',er))}catch(er){console.warn('som:',er)}}
function playPunch(){playSnd('punch')}

function playZap(ctx,t0){ctx=ctx||sndCtx;if(!ctx)return;try{
  t0=t0===undefined?ctx.currentTime:t0;const dur=.6,sr=ctx.sampleRate;
  const out=ctx.createGain();out.gain.value=.55;out.connect(ctx.destination);
  // estalos: ruído branco filtrado, em rajadas aleatórias que vão diminuindo
  const nb=ctx.createBuffer(1,Math.floor(sr*dur),sr),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const ns=ctx.createBufferSource();ns.buffer=nb;
  const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=1800;
  const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=4200;bp.Q.value=.8;
  const ng=ctx.createGain();ng.gain.setValueAtTime(0,t0);
  for(let t=0;t<dur;t+=.012+Math.random()*.03){const a=(1-t/dur)*(.35+Math.random()*.65);ng.gain.setValueAtTime(a,t0+t);ng.gain.setValueAtTime(a*.05,t0+t+.006)}
  ng.gain.setValueAtTime(0,t0+dur);ns.connect(hp);hp.connect(bp);bp.connect(ng);ng.connect(out);ns.start(t0);
  // zumbido elétrico grave com tremor (60 Hz) e descida de tom
  const o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(900,t0);o.frequency.exponentialRampToValueAtTime(90,t0+.35);
  const lfo=ctx.createOscillator();lfo.frequency.value=60;const lg=ctx.createGain();lg.gain.value=.5;
  const og=ctx.createGain();og.gain.setValueAtTime(.35,t0);og.gain.exponentialRampToValueAtTime(.001,t0+.45);
  lfo.connect(lg);lg.connect(og.gain);o.connect(og);og.connect(out);o.start(t0);o.stop(t0+.5);lfo.start(t0);lfo.stop(t0+.5);
}catch(er){console.warn('som:',er)}}

// ===== Aura de carregar energia (som contínuo, sintetizado) =====
let aura=null,auraNoise=null;
function auraStart(){sndUnlock();const c=sndCtx;if(!c||aura)return;try{
  if(!auraNoise){const n=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;auraNoise=n}
  const t=c.currentTime,out=c.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(.5,t+.35);out.connect(c.destination);
  const a={out,nodes:[],timer:0};
  const noise=(f,type,q)=>{const s=c.createBufferSource();s.buffer=auraNoise;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;if(q)fl.Q.value=q;s.connect(fl);s.start(t);a.nodes.push(s);return fl};
  // 1) estrondo grave constante (ar sendo sugado)
  const rg=c.createGain();rg.gain.value=.9;noise(220,'lowpass').connect(rg);rg.connect(out);
  // 2) vento/chamas: ruído médio com tremulação rápida
  const wg=c.createGain();wg.gain.value=.22;noise(1800,'bandpass',.7).connect(wg);wg.connect(out);
  const wl=c.createOscillator();wl.frequency.value=9;const wlg=c.createGain();wlg.gain.value=.12;wl.connect(wlg);wlg.connect(wg.gain);wl.start(t);a.nodes.push(wl);
  // 3) zumbido de poder: dois serrotes levemente desafinados que sobem de tom aos poucos
  const hg=c.createGain();hg.gain.value=.16;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=500;lp.connect(hg);hg.connect(out);
  [58,58.9].forEach(f=>{const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*2.1,t+4);o.connect(lp);o.start(t);a.nodes.push(o)});
  const fl=c.createOscillator();fl.frequency.value=5;const flg=c.createGain();flg.gain.value=.05;fl.connect(flg);flg.connect(hg.gain);fl.start(t);a.nodes.push(fl);
  // 4) brilho agudo que cresce
  const sg=c.createGain();sg.gain.setValueAtTime(.0,t);sg.gain.linearRampToValueAtTime(.1,t+2.5);noise(5200,'highpass').connect(sg);sg.connect(out);
  aura=a;auraCrackle(a);
}catch(er){console.warn('som aura:',er)}}
function auraCrackle(a){if(aura!==a)return;try{const c=sndCtx,s=c.createBufferSource();s.buffer=auraNoise;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=3500;const g=c.createGain(),t=c.currentTime;g.gain.setValueAtTime(.12+Math.random()*.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.03+Math.random()*.04);s.connect(hp);hp.connect(g);g.connect(a.out);s.start(t,Math.random()*1.5,.1)}catch(er){}
  a.timer=setTimeout(()=>auraCrackle(a),50+Math.random()*170)}
function auraStop(){if(!aura)return;const a=aura;aura=null;clearTimeout(a.timer);try{const t=sndCtx.currentTime;a.out.gain.cancelScheduledValues(t);a.out.gain.setValueAtTime(a.out.gain.value,t);a.out.gain.linearRampToValueAtTime(0,t+.3);a.nodes.forEach(n=>{try{n.stop(t+.35)}catch(e){}})}catch(er){}}
function auraUpdate(on){if(selectedCharacter==='wesley'&&typeof wesleyChargeSound==='function'){if(aura)auraStop();wesleyChargeSound(on);return}if(on&&!aura)auraStart();else if(!on&&aura)auraStop()}

// ===== Sons dos tiros especiais do Zusk (sintetizados) =====
let kiLast=null;
function playKi(name,ctx,t0,noCancel){ctx=ctx||sndCtx;if(!ctx)return;try{
  t0=t0===undefined?ctx.currentTime:t0;
  // se um tiro comum acabou de sair e virou especial (combo R+tecla), corta o som do comum
  if(!noCancel&&kiLast&&t0-kiLast.t<.25){try{kiLast.out.gain.cancelScheduledValues(t0);kiLast.out.gain.setTargetAtTime(0,t0,.02)}catch(e){}}
  const out=ctx.createGain();out.connect(ctx.destination);if(!noCancel)kiLast={out,t:t0};
  const nbuf=(len)=>{const b=ctx.createBuffer(1,Math.floor(ctx.sampleRate*len),ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b};
  const noise=(t,len,type,f1,f2,vol,att)=>{const s=ctx.createBufferSource();s.buffer=nbuf(len);const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f1,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+len);fl.Q.value=.9;
    const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(att||.02));g.gain.exponentialRampToValueAtTime(.001,t+len);s.connect(fl);fl.connect(g);g.connect(out);s.start(t)};
  const tone=(t,len,type,f1,f2,vol,att,lpf)=>{const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+len);
    const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(att||.02));g.gain.exponentialRampToValueAtTime(.001,t+len);
    let n=o;if(lpf){const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=lpf;o.connect(f);n=f}n.connect(g);g.connect(out);o.start(t);o.stop(t+len+.05);return o};
  if(name==='shot'){
    // carga curta (0,16 s) e disparo
    out.gain.value=.55;
    tone(t0,.16,'sine',280,800,.35,.12);noise(t0,.16,'bandpass',800,3000,.12,.12);
    tone(t0+.16,.28,'sine',1100,220,.5,.01);tone(t0+.16,.28,'triangle',550,110,.25,.01);noise(t0+.16,.3,'bandpass',3500,600,.3,.01);
  }else if(name==='superShot'){
    // carga mais longa (0,235 s) com brilho, disparo teleguiado com cauda cintilante
    out.gain.value=.6;
    tone(t0,.235,'sawtooth',180,1100,.22,.2,2200);noise(t0,.235,'bandpass',1000,5000,.18,.2);
    tone(t0+.235,.55,'sine',1600,160,.55,.01);tone(t0+.235,.55,'sawtooth',800,90,.2,.01,1800);noise(t0+.235,.5,'bandpass',5000,500,.35,.01);
    const sh=tone(t0+.25,.9,'sine',2400,1800,.12,.05);const lf=ctx.createOscillator();lf.frequency.value=14;const lg=ctx.createGain();lg.gain.value=90;lf.connect(lg);lg.connect(sh.frequency);lf.start(t0+.25);lf.stop(t0+1.2);
  }else if(name==='mega'){
    // Carregamento e zumbido terminam junto com o raio, não com a animação de recuperação.
    out.gain.value=.65;const C=ZM_CHT/1000,E=(ZM_CHT+ZM_BEAMT)/1000;
    tone(t0,C,'sawtooth',45,520,.3,.85,900);tone(t0,C,'sawtooth',46.5,540,.2,.85,900);noise(t0,C,'lowpass',200,1400,.4,.85);noise(t0+.3,C-.3,'highpass',2500,6000,.12,.6);
    tone(t0+C,.7,'sine',140,32,.9,.005);noise(t0+C,.5,'lowpass',2500,150,.8,.005);                       // estouro
    tone(t0+C,E-C-.05,'sawtooth',220,150,.28,.05,1600);tone(t0+C,E-C-.05,'square',110,100,.12,.05,900);  // raio: zumbido
    noise(t0+C,E-C-.05,'bandpass',2200,1500,.35,.1);
    const bl=ctx.createOscillator();bl.frequency.value=20;const bg=ctx.createGain();bg.gain.value=40;bl.connect(bg);bl.start(t0+C);bl.stop(t0+E);

  // GRITO do Zusk (camada de cima). Se existir um áudio 'grito' em SND_B64, toca ele; senão usa o grito sintetizado.
  const scream=(t,len)=>{
    if(ctx===sndCtx&&sndBuf.grito){const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=sndBuf.grito;g.gain.value=.95;s.connect(g);g.connect(ctx.destination);s.start(t);return}
    const v=ctx.createGain();v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(.9,t+.07);v.gain.setValueAtTime(.9,t+len-.3);v.gain.exponentialRampToValueAtTime(.001,t+len);
    const sh=ctx.createWaveShaper(),cv=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;cv[i]=Math.tanh(x*5)}sh.curve=cv;
    const mix=ctx.createGain();mix.gain.value=.22;
    [[800,1,9],[1250,.65,10],[2700,.4,12],[3500,.2,12]].forEach(([f,gn,q])=>{const b=ctx.createBiquadFilter();b.type='bandpass';b.frequency.value=f;b.Q.value=q;const g=ctx.createGain();g.gain.value=gn;sh.connect(b);b.connect(g);g.connect(mix)});
    // O grito tem seu próprio canal e não é interrompido quando o zumbido do raio termina.
    mix.connect(v);v.connect(ctx.destination);
    const lfo=ctx.createOscillator();lfo.frequency.value=6.5;const lg=ctx.createGain();lg.gain.value=22;lfo.connect(lg);lfo.start(t);lfo.stop(t+len);
    [1,1.012].forEach((det,k)=>{const o=ctx.createOscillator();o.type='sawtooth';
      o.frequency.setValueAtTime(230*det,t);o.frequency.exponentialRampToValueAtTime(520*det,t+.3);o.frequency.setValueAtTime(520*det,t+.3);o.frequency.linearRampToValueAtTime(470*det,t+len*.7);o.frequency.exponentialRampToValueAtTime(260*det,t+len);
      lg.connect(o.frequency);const g=ctx.createGain();g.gain.value=k?.6:1;o.connect(g);g.connect(sh);o.start(t);o.stop(t+len+.05)});
    // fôlego/rouquidão
    const nb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*len),ctx.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const ns=ctx.createBufferSource();ns.buffer=nb;const nf=ctx.createBiquadFilter();nf.type='bandpass';nf.frequency.value=1800;nf.Q.value=.6;const ng=ctx.createGain();ng.gain.value=.5;ns.connect(nf);nf.connect(ng);ng.connect(v);ns.start(t);
  };
  // Grito prolongado: acompanha o raio e continua naturalmente por um instante na recuperação.
  scream(sndBuf.grito&&ctx===sndCtx?t0+.3:t0+.5,3.45);
    out.gain.setValueAtTime(.65,t0+E-.25);out.gain.linearRampToValueAtTime(0,t0+E+.05);
  }
}catch(er){console.warn('som ki:',er)}}

// ===== Som de teleporte (sintetizado): "zip" de sucção, estalo na chegada e brilho =====
function playTeleport(ctx,t0){ctx=ctx||sndCtx;if(!ctx)return;try{
  t0=t0===undefined?ctx.currentTime:t0;const out=ctx.createGain();out.gain.value=.6;out.connect(ctx.destination);
  const nb=(len)=>{const b=ctx.createBuffer(1,Math.floor(ctx.sampleRate*len),ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b};
  const noise=(t,len,type,f1,f2,vol,att)=>{const s=ctx.createBufferSource();s.buffer=nb(len);const f=ctx.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(f1,t);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+len);f.Q.value=1.2;
    const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.001,t+len);s.connect(f);f.connect(g);g.connect(out);s.start(t)};
  const tone=(t,len,type,f1,f2,vol,att)=>{const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+len);
    const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(g);g.connect(out);o.start(t);o.stop(t+len+.05)};
  // saída: sucção rápida subindo
  noise(t0,.17,'bandpass',300,7000,.45,.12);tone(t0,.17,'sine',180,2600,.32,.14);tone(t0,.17,'triangle',90,1300,.2,.14);
  // chegada: estalo + brilho cintilante
  tone(t0+.16,.1,'sine',1400,260,.5,.004);noise(t0+.16,.07,'highpass',3000,0,.4,.004);
  tone(t0+.17,.3,'sine',3200,2400,.09,.02);tone(t0+.19,.28,'sine',4300,3300,.06,.02);noise(t0+.17,.25,'bandpass',6000,2500,.12,.03);
}catch(er){console.warn('som teleporte:',er)}}
function playSuper(){sndUnlock();playSnd('kick');setTimeout(()=>playSnd('punch'),150);setTimeout(()=>playZap(),300)}
let eshots=[];
dummy.energy=0;dummy.actionUntil=0;dummy.stunUntil=0;dummy.pend=null;
// ===== Jogador 2 humano (modo VS "contra jogador") =====
// O P2 é o próprio "dummy": o teclado alimenta a mesma interface que a IA usa ({move, attack, charge}).
// Teclas do P2: ← → mover · P soco · O chute · I especial (tiro) · L carregar energia.
let vsOpponent='ai';   // 'ai' ou 'player' (escolhido na tela "Versus", antes da seleção de personagem)
const P2_HUMAN=()=>selectedMode==='vs'&&vsOpponent==='player';
const held2=new Set(),keys2={arrowleft:'left',arrowright:'right',arrowup:'jump',arrowdown:'crouch',p:'punch',o:'kick',i:'special',l:'charge'};
let p2Hit=null;   // golpe apertado e ainda não consumido pelo aiStep (como no P1, apertar durante outro golpe é ignorado)
function p2Press(k){if(!fightLive()||held2.has(k))return;held2.add(k);if(k==='punch')p2Hit='punch';else if(k==='kick')p2Hit='kick';else if(k==='special')p2Hit='shot'}
const P2Pad={reset(){held2.clear();p2Hit=null},decide(){const a=p2Hit;p2Hit=null;return{move:(held2.has('right')?1:0)-(held2.has('left')?1:0),attack:a,charge:held2.has('charge')}}};
const AI_ON=()=>selectedMode==='vs'&&dummyMode==='attack'&&(P2_HUMAN()||!!window.OpponentAI);
const AI_ATTACKING=['punch','kick','shot','superPunch','superKick','superShot','mega'];
function aiHitPlayer(dmg,unparry){
  if(hp<=0||!fightLive())return;
  if(action==='mega'&&clock<actionUntil){effects.push({x,y:y-185,t:450,label:'IMUNE'});return}   // imune durante o ultimate
  if(!unparry&&clock<=parryUntil){parrySuccess();hit(10);effects.push({x,y:y-175,t:550,label:'PARRY! +10'});return}
  hp=clamp(hp-dmg,0,maxHp);stunUntil=clock+500;action='';actionUntil=0;if(selectedCharacter==='wesley')wesleyHurtSound();
  if(pendingShot){clearTimeout(pendingShot);pendingShot=null}
  effects.push({x,y:y-160,t:550,label:'-'+dmg+' VIDA'});effects.push({x,y:y-185,t:500,label:'ATORDOADO'});
  if(hp===0)endRound(1);
}
// ===== Trava do super soco do Wesley (11 socos) =====
const SUPER_LOCK_REACT=[200,550]; // ms: tempo de reação do inimigo até tentar escapar (mín, máx)
const SUPER_LOCK_PARRY_CHANCE=.1; // chance (0 a 1) de o inimigo dar parry durante o super soco
const wesMegaOn=()=>typeof wesleyMegaActive==='function'&&wesleyMegaActive(); // ultimate de arma do Wesley em andamento
const wesUltOn=()=>wesMegaOn()||(typeof wesleyUlt2Active==='function'&&wesleyUlt2Active()); // qualquer ultimate do Wesley em andamento (trava ações e movimento)
function superLock(){return selectedCharacter==='wesley'&&action==='superPunch'&&clock<actionUntil&&clock>=stunUntil}
function aiLockEscape(){
  dummy.pend=null;
  dummy.parryUntil=clock+PARRY_WIN;dummy.actionUntil=clock+PARRY_WIN;
  effects.push({x:dummy.x,y:floor-145,t:480,label:'PARRY ATIVO'});
}
// Parry do inimigo funcionou: cancela o golpe do jogador e devolve 10 de dano.
function dummyParried(){
  if(typeof wesleyDummyInterrupt==='function')wesleyDummyInterrupt();
  dummy.parryUntil=0;dummy.parryOkAt=clock;if(dummyChar==='wesley'&&typeof wesleyParrySound==='function')wesleyParrySound();
  hp=clamp(hp-10,0,maxHp);stunUntil=clock+500;action='';actionUntil=0;
  if(pendingShot){clearTimeout(pendingShot);pendingShot=null}
  if(selectedCharacter==='wesley')wesleyHurtSound();
  effects.push({x:dummy.x,y:floor-175,t:550,label:'PARRY! +10'});effects.push({x,y:y-160,t:550,label:'-10 VIDA'});
  if(hp===0)endRound(1);
}
function aiStep(dt){
  // tiros do P2
  for(const s of eshots){if(s.homing&&hp>0){const dx=x-s.x,dy=(y-90)-s.y,d=Math.hypot(dx,dy);if(d>0){const st=Math.min(660*dt,d);s.x+=dx/d*st;s.y+=dy/d*st}}else s.x+=s.vx*dt*60;s.life-=dt*1000;
    if(s.life>0&&fightLive()&&Math.abs(s.x-x)<s.size/2+22&&Math.abs(s.y-(y-90))<70){aiHitPlayer(s.damage);if(s.wmega){zImpacts.push({t:clock,x,y:y-90,k:2});zShake=Math.max(zShake,12)}s.life=0}}
  eshots=eshots.filter(s=>s.life>0&&s.x>0&&s.x<960);
  if(dummy.hp<=0||!fightLive()||dummy.cliffFalling){if(typeof wesleyDummyReset==='function'&&(dummy.wAct||dummy.charging))wesleyDummyReset();return}
  const AI=P2_HUMAN()?P2Pad:window.OpponentAI;
  if(!P2_HUMAN())dummy.energy=Math.min(100,dummy.energy+8*dt);   // IA recupera sozinha; o P2 humano precisa carregar (L)
  // golpe em andamento: o dano sai no meio da animação
  const p=dummy.pend;
  if(p&&clock>=p.at){dummy.pend=null;const a=specs[p.name];
    if(p.name==='shot'){const d=x>=dummy.x?1:-1;if(dummyChar==='wesley')wesleyFireSound();eshots.push({x:dummy.x+d*60,y:floor-92,vx:d*10,damage:a.dmg,size:18,life:1600})}
    else if(Math.abs(dummy.x-x)<=a.range+8&&Math.abs(y-floor)<80)aiHitPlayer(a.dmg)}
  // Super soco do Wesley em andamento: o inimigo não anda nem ataca; só pode dar parry.
  const lk=superLock();
  if(lk&&!dummy.wasLocked){dummy.lockAt=clock+SUPER_LOCK_REACT[0]+Math.random()*(SUPER_LOCK_REACT[1]-SUPER_LOCK_REACT[0]);dummy.lockDid=P2_HUMAN()||Math.random()>=SUPER_LOCK_PARRY_CHANCE}
  dummy.wasLocked=lk;
  if(lk&&typeof wesleyDummyInterrupt==='function')wesleyDummyInterrupt();
  if(lk){if(!dummy.lockDid&&clock>=dummy.lockAt){dummy.lockDid=true;aiLockEscape()}return}
  const stunned=clock<dummy.stunUntil,busy=clock<dummy.actionUntil;
  if(dummyChar==='wesley'&&typeof wesleyDummyTick==='function'){if(stunned)wesleyDummyInterrupt();wesleyDummyTick(dt)}
  const pick=k=>({range:specs[k].range,dmg:specs[k].dmg,cost:specs[k].cost,duration:specs[k].duration});
  const s={
    self:{x:dummy.x,hp:dummy.hp,hpMax:dummyMax,energy:dummy.energy,canAct:!stunned&&!busy,busy,stunned,facing:x>=dummy.x?1:-1,character:dummyChar,charging:!!dummy.charging,zone:(typeof wesleyDummyZone==='function'?wesleyDummyZone(dummy.hp):'green')},
    enemy:{x,y,hp,hpMax:maxHp,energy,action,attacking:AI_ATTACKING.includes(action)&&clock<actionUntil,stunned:clock<stunUntil,airborne:y<floor-1,crouching:held.has('crouch'),parrying:clock<=parryUntil,facing:face,character:selectedCharacter},
    specs:{punch:pick('punch'),kick:pick('kick'),shot:pick('shot'),parry:pick('parry'),...(dummyChar==='wesley'?{superPunch:pick('superPunch'),superKick:pick('superKick'),superShot:pick('superShot'),mega:pick('mega')}:{})},
    arena:{min:55,max:905},
    round:{number:round,wins:roundWins,time:roundTime,mode:'vs'}
  };
  let r;try{r=AI.decide(s,dt)||{}}catch(e){console.error('Erro na IA:',e);r={}}
  if(stunned||busy){if(dummy.charging)dummyChargeSet(false);return}
  const mv=clamp(+r.move||0,-1,1);
  if((dummyChar==='wesley'||P2_HUMAN())&&r.charge&&!r.attack&&!mv){dummy.energy=Math.min(100,dummy.energy+15*dt);if(!dummy.charging)dummyChargeSet(true);return}
  if(dummy.charging)dummyChargeSet(false);
  const oldX=dummy.x;
  if(mv){dummy.x=clamp(dummy.x+mv*(P2_HUMAN()?250:200)*dt,55,905);dummyCliffDropBegin();}
  if(dummyChar==='wesley' && Math.abs(dummy.x-oldX)>.1){
    dummy.wesleyWalkDistance=(dummy.wesleyWalkDistance||0)+Math.abs(dummy.x-oldX);
    dummy.wesleyWalkUntil=clock+130;
  }
  const n=r.attack;
  if(dummyChar==='wesley'&&['superPunch','superKick','superShot','mega','parry'].includes(n)&&typeof wesleyDummyStart==='function'){const a=specs[n];if(a&&dummy.energy>=a.cost&&wesleyDummyStart(n))dummy.energy-=a.cost;return}
  if(n==='punch'||n==='kick'||n==='shot'){
    const a=specs[n];if(dummy.energy<a.cost)return;
    dummy.energy-=a.cost;dummy.actionUntil=clock+a.duration;if(n==='shot'&&dummyChar==='zusk')playKi('shot');if(n==='punch'||n==='kick')playSnd(n);if(n==='punch'&&dummyChar==='wesley')wesleyPunchSound();if(n==='kick'&&dummyChar==='wesley')wesleyKickSound();if(n==='shot'&&dummyChar==='wesley')wesleyShotSound();dummy.attackAnim=.32;dummy.atkName=n;
    dummy.pend={name:n,at:clock+(n==='kick'?170:n==='shot'?160:110)};
  }
}
function dummyChargeSet(on){dummy.charging=on;if(typeof wesleyDummyChargeSound==='function')wesleyDummyChargeSound(on&&dummyChar==='wesley')}
let lastShotAt=-1;
// Combo em qualquer ordem: se R já está segurado (apertado há até COMBO_WIN ms; pulo: JUMP_WIN) e a outra tecla chega agora, dispara o especial.
// Se o tiro comum já tinha saído com esse R, a energia dele é devolvida e o especial toma o lugar.
function chordPartner(k){
 if(!held.has('special'))return false;
 const now=performance.now(),w=k==='jump'?JUMP_WIN:COMBO_WIN;
 if(now-(pressedAt.special??-Infinity)>w)return false;
 let name=null;
 if(k==='crouch')name='parry';else if(k==='jump')name='superShot';else if(k==='punch')name='superPunch';else if(k==='kick')name='superKick';
 else if(k===(face===1?'right':'left'))name='frontTeleport';else if(k===(face===1?'left':'right'))name='backTeleport';
 if(!name)return false;
 if(clock<stunUntil&&!STUN_OK.includes(name))return false;
 const refund=(action==='shot'&&clock<actionUntil&&lastShotAt===pressedAt.special)?specs.shot.cost:0;
 if(energy+refund<specs[name].cost)return false;
 if(pendingShot){clearTimeout(pendingShot);pendingShot=null}
 energy=Math.min(100,energy+refund);
 return start(name);
}
const STUN_OK=['parry','frontTeleport','backTeleport']; // atordoado: não ataca, mas pode dar parry e teleportar
function special(){
 const now=performance.now();
 // A primeira tecla deve ter sido pressionada há no máximo 200 ms.
 const recent=(k,w=COMBO_WIN)=>held.has(k)&&now-(pressedAt[k]??-Infinity)<=w;
 let name=null;
 if(recent('crouch'))name='parry';
 else if(recent('jump',JUMP_WIN))name='superShot';
 else if(recent('punch'))name='superPunch';
 else if(recent('kick'))name='superKick';
 else if(recent(face===1?'right':'left'))name='frontTeleport';
 else if(recent(face===1?'left':'right'))name='backTeleport';
 if(name){
   if(clock<stunUntil&&!STUN_OK.includes(name))return;
   if(pendingShot){clearTimeout(pendingShot);pendingShot=null;}
   start(name);return;
 }
 if(clock<stunUntil)return;
 // Duplo R dentro de 0,2 segundo; caso contrário, tiro normal.
 if(pendingShot){
   clearTimeout(pendingShot);pendingShot=null;
   if(!start('mega'))start('shot');
   return;
 }
 if(energy>=100){
   pendingShot=setTimeout(()=>{pendingShot=null;start('shot')},TIMESPOT);
 }else{if(start('shot'))lastShotAt=pressedAt.special}
}
function press(k){
 if(!fightLive()||playerCliffFalling)return;
 // O Ultimate bloqueia novas ações até terminar sua recuperação.
 if((selectedCharacter==='zusk'&&action==='mega'&&clock<actionUntil)||wesUltOn())return;
 if(held.has(k))return;
 held.add(k);
 pressedAt[k]=performance.now();
 if(k==='special'){special();return;}
 if(k==='jump'&&y>=floor){vy=-15;y-=1;}
 if(chordPartner(k))return;
 if(k==='punch'||k==='kick'){
   // O golpe básico ainda funciona, e pode ser convertido em combo dentro do TimeSpot.
   start(k);
 }
}
function release(k){held.delete(k)}
document.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);press(k);b.classList.add('active')});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{release(k);b.classList.remove('active')})});
document.addEventListener('keydown',e=>{const kn=e.key.toLowerCase();
 if(P2_HUMAN()&&keys2[kn]){e.preventDefault();if(!e.repeat&&!menuOpen)p2Press(keys2[kn]);return}   // setas, P, O, I, L são só do P2
 let k=keys[kn];if(k){e.preventDefault();if(!e.repeat)press(k)}});
document.addEventListener('keyup',e=>{const kn=e.key.toLowerCase();
 if(P2_HUMAN()&&keys2[kn]){held2.delete(keys2[kn]);return}
 let k=keys[kn];if(k)release(k)});
window.addEventListener('blur',()=>{held.clear();held2.clear()});
function line(x1,y1,x2,y2,w,col){g.strokeStyle=col;g.lineWidth=w;g.lineCap='square';g.beginPath();g.moveTo(Math.round(x1),Math.round(y1));g.lineTo(Math.round(x2),Math.round(y2));g.stroke()}
function bar(x,y,w,value,color){g.fillStyle='#162438';g.fillRect(x,y,w,20);g.fillStyle=color;g.fillRect(x,y,w*value/100,20);g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(x,y,w,20)}
const stageImage=new Image();stageImage.src='mapas/floresta-serena.jpg';


// ===== V3.3: Zusk (sprites do artista) =====
   // 8 frames de caminhada, 4x2; frame 0 = parado
     // retrato (HUD e miniatura)
   // 8 quadros de pulo, 4x2, mesma célula do atlas de caminhada
   // 8 quadros de chute, 4x2, células 440x328, ancorados no pé de apoio
   // 8 quadros de agachamento, 4x2, células 320x328: 0-3 descendo, 4-7 levantando
   // 8 quadros de dano, 4x2, células 360x328, chão na base
   // 8 quadros de soco, 4x2, células 400x328, ancorados no centro dos pés
   // 8 quadros de carregar energia (versão 2), 4x2, células 360x352, ancorados no corpo
   // 12 quadros do super soco, 6x2, células 457x332, ancorados no centro dos pés (x=191)
   // 12 quadros do super chute, 6x2, células 560x420, ancorados no pé de apoio (x=280, chão y=400)
   // 8 quadros do especial base (lançar a bola), 4x2, células 478x362, ancorados no centro dos pés (x=239, chão y=346); a bola sai no quadro 5
   // 8 quadros da bola voando, 1x8, células 388x248, centro da bola em (310,124); 0-3 acendem, 4-7 em voo
   // Espantalho: 20 quadros, 10x2, células 320x330, ancorados no poste (x=160, chão y=310). 0 = parado; 1-9 e 10-19 = giro (ataque comum usa quadros escolhidos, super usa 1-19)
   // retrato do Espantalho (HUD e miniatura)
   // prévia grande do Espantalho na seleção
     // prévia grande da seleção
// ===== Wesley Mafioso — personagem jogável (8 quadros da arte enviada) =====



// Caminhada de Wesley: 8 quadros (4 colunas x 2 linhas), com pés e cabeça alinhados.

const WES={cw:256,ch:510,base:497,ax:128,cols:4,s:.328};
const WES_WALK={cw:384,ch:512,base:484,ax:192,cols:4,frames:8,s:.328,secPerFrame:.095};
const wesleyWalkAtlas=new Image();wesleyWalkAtlas.src=WESLEY_WALK;
const wesleyAtlas=new Image();wesleyAtlas.src=WESLEY_ATLAS;
const wesleyPortrait=new Image();wesleyPortrait.src=WESLEY_FACE;
const ZK={cw:286,ch:328,base:324,s:152/(0.75*427),cols:4,frames:8,secPerFrame:.07};
const zuskAtlas=new Image();zuskAtlas.src=ZUSK_ATLAS;
const zuskJump=new Image();zuskJump.src=ZUSK_JUMP;
const zuskKick=new Image();zuskKick.src=ZUSK_KICK;const ZKK={cw:440,ch:328,base:324};
const zuskCrouch=new Image();zuskCrouch.src=ZUSK_CROUCH;const ZKC={cw:320,ch:328,base:324};
const zuskHurt=new Image();zuskHurt.src=ZUSK_HURT;const ZKH={cw:360,ch:328,base:324};
const zuskPunch=new Image();zuskPunch.src=ZUSK_PUNCH;const ZKP={cw:400,ch:328,base:324};
const zuskCharge=new Image();zuskCharge.src=ZUSK_CHARGE;const ZKG={cw:360,ch:352,base:336};let zChSprite=false;
const zuskSuper=new Image();zuskSuper.src=ZUSK_SUPER;const ZKS={cw:457,ch:332,base:325,ax:191,cols:6};
const zuskSuperKick=new Image();zuskSuperKick.src=ZUSK_SUPERKICK;const ZKSK={cw:560,ch:420,base:400,ax:280,cols:6};
const zuskShot=new Image();zuskShot.src=ZUSK_SHOT;const ZKT={cw:478,ch:362,base:346,ax:239,cols:4};
const zuskOrb=new Image();zuskOrb.src=ZUSK_ORB;const ZKO={pw:388,ph:248,ax:310,ay:124};
const scareImg=new Image();scareImg.src=SCARE_SHEET;const ZKE={cw:320,ch:330,base:310,ax:160,cols:10};
const scarePortrait=new Image();scarePortrait.src=SCARE_FACE;

const zuskTele=new Image();zuskTele.src=ZUSK_TELE;const ZKTP={cw:272,ch:400,base:373,ax:136,cols:8};
// Teleporte do Zusk (8 quadros, 420 ms): 0-4 somem no ponto de origem (4 = coluna de luz que fica), 5-7 reaparecem no destino.
let zTpStart=-1,zTpFromX=0;const ZTP_MS=[40,50,50,55,55,55,60,55],ZTP_TOTAL=420;
function zuskTeleFrame(){if(zTpStart<0)return -1;const t=clock-zTpStart;if(t<0||t>=ZTP_TOTAL){zTpStart=-1;return -1}let acc=0;for(let i=0;i<ZTP_MS.length;i++){acc+=ZTP_MS[i];if(t<acc)return i}return ZTP_MS.length-1}



const zuskMC=new Image();zuskMC.src=ZUSK_MC;const zuskMR=new Image();zuskMR.src=ZUSK_MR;const zuskMB=new Image();zuskMB.src=ZUSK_MB;
// ===== Ultimate do Zusk: carrega -> segura pose durante TODO o raio -> recupera quando o raio some =====
const ZMC={cw:560,ch:372,base:360,ax:272,cols:5},ZMR={cw:560,ch:372,base:360,ax:272,cols:7},ZMB={cw:548,ch:252,cols:5};
const ZM_SLOW=2.2;   // quanto mais lento o DISPARO do ultimate (1 = original, 2.2 = 120% mais lento)
const ZM_CH=[96,96,88,88,88,88,88,88,96,112],ZM_RL=[96,96,80,80,80,80,72,72,72,72,72,72,72].map(v=>v*ZM_SLOW);
const ZM_CHT=ZM_CH.reduce((a,b)=>a+b,0),ZB_MS=67*ZM_SLOW;
const ZBM=[[107, 112, 56.8, 69], [128, 126, 65.4, 61], [168, 137, 70.6, 55], [244, 159, 81.5, 45], [338, 191, 99.1, 27], [416, 208, 106.6, 19], [535, 228, 121.8, 4], [391, 210, 108.4, 18], [310, 179, 92.7, 33], [257, 155, 81.9, 44], [227, 119, 61.1, 65], [193, 114, 56.2, 70], [186, 117, 61.5, 65], [179, 104, 46.3, 80], [251, 95, 35.6, 90]];            // [largura, altura, centro_y, deslocamento_y] de cada quadro do raio
const ZB_FRAC=[0,0,0,.18,.35,.6,1,1,1,1,.9,.7,.5,.3,.15];   // quanto do caminho até a borda da tela o corpo do raio cobre (0 = estrela, tamanho natural)
const ZB_ANCH=[0,0,0,70,70,70,70,25,25,25,25,25,25,25,25];
// Os quadros 0 e 1 são o início do disparo. Segura o 1 até o último quadro do raio desaparecer.
// Só depois reproduz os quadros 2..12, que mostram o personagem relaxando os braços.
const ZM_REC_START=2, ZM_BEAMT=ZBM.length*ZB_MS;
const ZM_TOTAL=ZM_CHT+ZM_BEAMT+ZM_RL.slice(ZM_REC_START).reduce((a,b)=>a+b,0);
const ZM_PX=54,ZM_PY=76,ZB_SY=.8;       // posição da mão e espessura do raio
let zMegaStart=-1;
const ZM_HITS=[400,640,880].map(v=>v*ZM_SLOW),ZM_HITDMG=25;   // ms depois do início do raio (o raio leva ~0,4 s para chegar no alvo)
let zMegaHitIdx=0,zImpacts=[],zShake=0,zDim=0;
function zuskMegaTick(){
 if(zMegaStart<0||selectedCharacter!=='zusk'||!(action==='mega'&&clock<actionUntil))return;
 const t=clock-zMegaStart-ZM_CHT;
 while(zMegaHitIdx<ZM_HITS.length&&t>=ZM_HITS[zMegaHitIdx]){
  const i=zMegaHitIdx++;
  if(dummyMode!=='none'&&dummy.hp>0&&Math.sign(dummy.x-x)===face&&Math.abs((floor-80)-(y-ZM_PY))<110){hit(ZM_HITDMG);zImpacts.push({t:clock,x:dummy.x,y:floor-90,k:i});zShake=Math.max(zShake,i===2?10:7)}}}
// Fundo escurece enquanto o super está ativo (personagens e HUD ficam por cima do filtro).
function drawMegaDim(){const on=(selectedCharacter==='zusk'&&zMegaStart>=0&&action==='mega'&&clock<actionUntil)||wesUltOn();zDim+=((on?.72:0)-zDim)*.1;if(zDim>.01){g.fillStyle='rgba(0,0,0,'+zDim.toFixed(3)+')';g.fillRect(0,0,960,540)}}
// Impact frames: clarão branco com linhas pretas -> quadro preto com linhas brancas -> explosão dourada. Os clarões de tela cheia seguem a opção "Efeitos visuais".
function zRnd(n){const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)}
function zLines(cx,cy,n,r0,r1,col,seed,wid){g.fillStyle=col;for(let i=0;i<n;i++){const a=(i+zRnd(seed+i))/n*Math.PI*2,w=wid*(.35+zRnd(seed+i*3.1)),ri=r0*(.6+zRnd(seed+i*7.7)*.8);g.beginPath();g.moveTo(cx+Math.cos(a)*ri,cy+Math.sin(a)*ri);g.lineTo(cx+Math.cos(a-w)*r1,cy+Math.sin(a-w)*r1);g.lineTo(cx+Math.cos(a+w)*r1,cy+Math.sin(a+w)*r1);g.closePath();g.fill()}}
function zBurst(cx,cy,R,r,fill,stroke,spikes,rot){g.beginPath();for(let i=0;i<spikes*2;i++){const a=rot+i*Math.PI/spikes,rr=(i%2?r:R)*(i%2?1:.8+zRnd(i*2.3+rot)*.4);g[i?'lineTo':'moveTo'](cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}g.closePath();g.fillStyle=fill;g.fill();if(stroke){g.lineWidth=4;g.lineJoin='round';g.strokeStyle=stroke;g.stroke()}}
function drawImpactFrames(){
 if(!zImpacts.length)return;zImpacts=zImpacts.filter(m=>clock-m.t<320);
 for(const m of zImpacts){const a=clock-m.t,cx=m.x,cy=m.y,seed=m.k*17+3;
  g.save();
  if(a<55&&effectsEnabled){g.globalAlpha=.92;g.fillStyle='#fff';g.fillRect(0,0,960,540);g.globalAlpha=1;zLines(cx,cy,38,46,1100,'#0a0a0a',seed,.055)}
  else if(a<120&&effectsEnabled){g.globalAlpha=.86;g.fillStyle='#000';g.fillRect(0,0,960,540);g.globalAlpha=1;zLines(cx,cy,44,40,1100,'#fff',seed+5,.05);zBurst(cx,cy,120,44,'#fff','#000',12,seed)}
  if(a>=40){const p=clamp((a-40)/280,0,1),R=60+150*p;g.globalAlpha=1-p;zBurst(cx,cy,R,R*.42,'#ffd54a','#7a3c10',12,seed+p);zBurst(cx,cy,R*.55,R*.25,'#fff6cf',null,10,seed*2-p);g.lineWidth=10*(1-p)+1;g.strokeStyle='#fff2a8';g.beginPath();g.arc(cx,cy,R*1.05,0,Math.PI*2);g.stroke()}
  g.restore()}}

function zuskMegaSprite(){
 if(zMegaStart<0||!(action==='mega'&&clock<actionUntil))return null;
 if(!(zuskMC.complete&&zuskMC.naturalWidth&&zuskMR.complete&&zuskMR.naturalWidth))return null;
 let t=clock-zMegaStart;if(t<0)return null;let a=0;
 if(t<ZM_CHT){for(let i=0;i<ZM_CH.length;i++){a+=ZM_CH[i];if(t<a)return {img:zuskMC,cw:ZMC.cw,ch:ZMC.ch,base:ZMC.base,ax:ZMC.ax,cols:ZMC.cols,fi:i}}}
 t-=ZM_CHT;
 // Enquanto o raio existir, mantém o personagem com os braços estendidos (sem voltar à guarda).
 if(t<ZM_BEAMT){const fi=t<ZM_RL[0]?0:1;return {img:zuskMR,cw:ZMR.cw,ch:ZMR.ch,base:ZMR.base,ax:ZMR.ax,cols:ZMR.cols,fi}}
 // O raio já sumiu: agora sim executar toda a animação de recuperação.
 t-=ZM_BEAMT;a=0;
 for(let i=ZM_REC_START;i<ZM_RL.length;i++){a+=ZM_RL[i];if(t<a)return {img:zuskMR,cw:ZMR.cw,ch:ZMR.ch,base:ZMR.base,ax:ZMR.ax,cols:ZMR.cols,fi:i}}
 return {img:zuskMR,cw:ZMR.cw,ch:ZMR.ch,base:ZMR.base,ax:ZMR.ax,cols:ZMR.cols,fi:ZM_RL.length-1}}
function drawZuskBeam(){
 if(selectedCharacter!=='zusk'||zMegaStart<0||!(action==='mega'&&clock<actionUntil)||!(zuskMB.complete&&zuskMB.naturalWidth))return;
 const t=clock-zMegaStart-ZM_CHT;if(t<0)return;const bi=Math.floor(t/ZB_MS);if(bi>=ZBM.length)return;
 const m=ZBM[bi],w=m[0],h=m[1],cy=m[2],off=m[3],sx0=(bi%ZMB.cols)*ZMB.cw,sy0=Math.floor(bi/ZMB.cols)*ZMB.ch+off,k=ZB_SY,dy=-cy*k,dh=h*k;
 const ox=x+face*ZM_PX,oy=y-ZM_PY,fr=ZB_FRAC[bi];
 g.save();g.translate(Math.round(ox),Math.round(oy));g.scale(face,1);
 if(fr===0){g.drawImage(zuskMB,sx0,sy0,w,h,-w*k/2,dy,w*k,dh)}
 else{const Hh=Math.min(150,w),an=ZB_ANCH[bi],dist=(face>0?960-ox:ox)+140,len=Math.max(w*k,dist*fr);
  g.drawImage(zuskMB,sx0,sy0,Hh,h,-an*k,dy,Hh*k,dh);
  if(w>Hh)g.drawImage(zuskMB,sx0+Hh,sy0,w-Hh,h,(Hh-an)*k,dy,Math.max(1,len-(Hh-an)*k),dh)}
 g.restore()}

const zuskParry=new Image();zuskParry.src=ZUSK_PARRY;const ZKY={cw:320,ch:372,base:340,ax:150,cols:8,k:1.12};
// Parry do Zusk (16 quadros). Quadros 1-8 (onda de energia) tocam durante a janela de defesa (420 ms).
// Se nada foi defendido, a animação PARA no quadro 8 (e fica nele 100 ms de recuperação). Se defendeu, continua pelos quadros 9-16 (contra-golpe e volta à guarda).
let parryStartAt=-1,parryHitAt=-1;
const PARRY_WIN=420,PARRY_STEP=PARRY_WIN/8,PARRY_STEP2=45,PARRY_FULL=PARRY_WIN+8*PARRY_STEP2;
function parrySuccess(){if(action==='parry'&&clock<actionUntil&&parryHitAt<0){parryHitAt=clock;if(selectedCharacter==='wesley'&&typeof wesleyParrySound==='function')wesleyParrySound();playSnd('kick');setTimeout(()=>playSnd('punch'),150);actionUntil=Math.max(actionUntil,parryStartAt+PARRY_FULL)}}
function zuskParryFrame(){if(!(clock<actionUntil)||action!=='parry'||parryStartAt<0)return -1;const t=clock-parryStartAt;if(t<PARRY_WIN)return Math.min(7,Math.floor(t/PARRY_STEP));if(parryHitAt<0)return 7;return Math.min(15,8+Math.floor((t-PARRY_WIN)/PARRY_STEP2))}
const zuskPortrait=new Image();zuskPortrait.src=ZUSK_FACE;
// Quadro do ciclo: parado = 0; andando = 8 quadros (0,07 s cada, casa com a velocidade para os pés não deslizarem); no ar = 3.
// 'walk' avança dt*11 enquanto anda (ver tick), por isso a divisão por 11*secPerFrame.
// Pulo: quadros 2 (subindo), 3 e 4 (topo), 5 (descendo) conforme a velocidade vertical; quadro 6 = amortecimento por 90 ms ao pousar. Retorna -1 fora do pulo.
let zWasAir=false,zLandUntil=0;
function zuskJumpFrame(){if(y<floor-1){zWasAir=true;const p=clamp((vy+15)/30,0,.999);return [2,3,4,5][Math.floor(p*4)]}if(zWasAir){zWasAir=false;zLandUntil=clock+90}if(clock<zLandUntil)return 6;return -1}
// Chute (normal e super): quadros 1 a 6 da folha ao longo da duração do golpe; a perna fica estendida (3 e 4) no meio. Retorna -1 fora do chute.
function zuskKickFrame(){if(!(clock<actionUntil)||action!=='kick')return -1;const p=clamp(1-(actionUntil-clock)/specs[action].duration,0,.999);return [1,2,3,3,4,4,5,6][Math.floor(p*8)]}
// Agachar: 'zCr' vai de 0 (em pé) a 1 (agachado) em ~140 ms. Descendo usa os quadros 0-3; ao soltar, levanta pelos quadros 4-7. Retorna -1 em pé.
let zCr=0,zCrDir=1,zCrLast=0;
function zuskCrouchFrame(){const dt=Math.min(clock-zCrLast,50);zCrLast=clock;const want=held.has('crouch')&&y>=floor;if(want){zCrDir=1;zCr=Math.min(1,zCr+dt/140)}else{zCrDir=-1;zCr=Math.max(0,zCr-dt/140)}if(zCr<=0&&!want)return -1;return zCrDir>0?Math.min(3,Math.floor(zCr*3.999)):7-Math.min(3,Math.floor(zCr*3.999))}
// Dano: durante o atordoamento (0,5 s) toca os quadros 2 (impacto), 3 (empurrado), 4-6 (recuperando) e 7 (em guarda). Retorna -1 fora do atordoamento.
function zuskHurtFrame(){if(!(clock<stunUntil))return -1;const p=clamp(1-(stunUntil-clock)/500,0,.999);return [2,2,3,3,4,5,6,7][Math.floor(p*8)]}
// Soco (normal e super): quadros 1 a 6 da folha ao longo da duração do golpe; o braço fica estendido (3 e 4) no meio. Retorna -1 fora do soco.
function zuskPunchFrame(){if(!(clock<actionUntil)||action!=='punch')return -1;const p=clamp(1-(actionUntil-clock)/specs[action].duration,0,.999);return [1,2,3,3,4,4,5,6][Math.floor(p*8)]}
// Carregar energia: quadros 1-2 sobem a aura (80 ms cada), 3-4-5-6 giram em loop enquanto segura (90 ms cada), e o 7 dá um desvanecer de 120 ms ao soltar. Retorna -1 fora da carga.
let zChT=0,zChLast=0,zChOut=0;
function zuskChargeFrame(){const dt=Math.min(clock-zChLast,50);zChLast=clock;if(charging){zChT+=dt;zChOut=clock+120;if(zChT<160)return 1+Math.floor(zChT/80);return 3+Math.floor((zChT-160)/90)%4}zChT=0;if(clock<zChOut)return 7;return -1}
// Super soco: 8 passos de 55 ms: 4-5 acumulam energia, 6-7 avançam, 8 é o impacto (o dano é aplicado ~210 ms após o início, junto ao impacto), 9-10 recuperam. Retorna -1 fora do super soco.
function zuskSuperFrame(){if(!(clock<actionUntil)||action!=='superPunch')return -1;const p=clamp(1-(actionUntil-clock)/specs.superPunch.duration,0,.999);return [4,5,6,7,8,8,9,10][Math.floor(p*8)]}
// Super chute: 12 quadros (0 = guarda). Toca 1-11 em 480 ms: 1-2 agacham/preparam, 3-6 sobem a perna com aura, 7-8 são o impacto (dano aplicado ~262 ms), 9-11 recuperam. Retorna -1 fora do super chute.
function zuskSuperKickFrame(){if(!(clock<actionUntil)||action!=='superKick')return -1;const p=clamp(1-(actionUntil-clock)/specs.superKick.duration,0,.999);return 1+Math.floor(p*11)}
// Especial base: 1-4 preparam e carregam a bola, 5 é o lançamento (a bola sai da mão ~160 ms após o início), 6-7 recuperam. Retorna -1 fora do especial base.
function zuskShotFrame(){if(!(clock<actionUntil)||(action!=='shot'&&action!=='superShot'))return -1;const p=clamp(1-(actionUntil-clock)/specs[action].duration,0,.999);return [1,2,3,4,5,5,6,7][Math.floor(p*8)]}
function zuskFrame(){if(y<floor-1)return 3;if(walk>0)return Math.floor(walk/(11*ZK.secPerFrame))%ZK.frames;return 0}
// Espantalho: parado = quadro 0. Ataque comum (soco/chute): giro curto, 8 passos. Super (super soco/chute): giro completo, quadros 1-19 (poeira nos 13-15); o super soco segurado faz o giro em loop nos quadros 6 a 15 da folha (índices 5 a 14).
// Andar, pular, agachar e dano ainda não têm quadros: usa o quadro parado com pulinho/inclinação/achatamento.
function scareFrame(){if(!(clock<actionUntil))return 0;const sp=specs[action];if(!sp)return 0;const p=clamp(1-(actionUntil-clock)/sp.duration,0,.999);
 if(action==='punch'||action==='kick')return [2,4,6,7,8,9,18,19][Math.floor(p*8)];
 if(action==='superPunch'&&scareState){
  if(scareState===2)return [18,19][Math.floor(clamp(1-(scareRecEnd-clock)/110,0,.999)*2)];
  const t=clock-scareStart;return t<SCARE_FIRST?1+Math.floor(t/SCARE_FIRST*4):5+Math.floor((t-SCARE_FIRST)/45)%10}
 if(action==='superPunch'||action==='superKick')return 1+Math.floor(p*19);return 0}
function drawScarecrow(){
 if(!scareImg.complete||!scareImg.naturalWidth)return;
 const crouch=held.has('crouch')&&y>=floor,att=clock<actionUntil?action:'';
 const dur=(att&&specs[att]&&specs[att].duration)||1,p=att?clamp(1-(actionUntil-clock)/dur,0,1):0,a=Math.sin(p*Math.PI);
 const fi=scareFrame(),spin=fi>0;let lunge=0,tilt=0,hop=0;
 if(att==='shot'||att==='superShot'||att==='mega'){lunge=-a*8;tilt=-.04*a}
 if(clock<stunUntil&&!STUN_OK.includes(att)){const q=clamp(1-(stunUntil-clock)/500,0,1),w=Math.sin(q*Math.PI);lunge=-14*w;tilt=-.28*w}
 if(!spin&&y>=floor&&walk>0){hop=Math.abs(Math.sin(walk*1.15))*7;tilt+=Math.sin(walk*1.15)*.04}
 const breathe=(walk===0&&y>=floor&&!crouch&&!spin)?1+Math.sin(clock/380)*.012:1;
 const air=clamp((floor-y)/260,0,.6);g.save();g.fillStyle='rgba(16,24,39,'+(.42-air*.4)+')';g.beginPath();g.ellipse(Math.round(x),floor+3,34*(1-air),6*(1-air),0,0,Math.PI*2);g.fill();g.restore();
 g.save();g.translate(Math.round(x),Math.round(y-hop));g.scale(face,1);g.translate(lunge,0);g.rotate(tilt);g.scale(1,(crouch&&!spin?.8:1)*breathe);
 if(charging&&!spin){g.shadowColor='#ffd45a';g.shadowBlur=16}
 g.drawImage(scareImg,(fi%ZKE.cols)*ZKE.cw,Math.floor(fi/ZKE.cols)*ZKE.ch,ZKE.cw,ZKE.ch,-ZKE.ax*ZK.s,-ZKE.base*ZK.s,ZKE.cw*ZK.s,ZKE.ch*ZK.s);
 g.restore();
}
// Os oito quadros fornecidos são poses/expressões, não sprites exclusivos de cada golpe.
// Reaproveita essas poses no combate e aplica deslocamentos durante os ataques.
function wesleyFrame(attack=false){
 const att=attack?(dummy.actionUntil>clock?dummy.action:''):(clock<actionUntil?action:'');
 const st=attack?(dummy.flash>0):(clock<stunUntil);
 if(st)return Math.floor(clock/100)%2?5:6;
 if(att){
  const until=attack?dummy.actionUntil:actionUntil;
  const dur=(specs[att]||specs.punch).duration||350;
  const p=clamp(1-(until-clock)/dur,0,.999);
  if(att==='punch'||att==='superPunch')return [2,3,4,3,2][Math.floor(p*5)];
  if(att==='kick'||att==='superKick')return [2,3,3,4,2][Math.floor(p*5)];
  if(att==='shot'||att==='superShot'||att==='mega')return [2,3,4,4,3][Math.floor(p*5)];
  if(att==='parry')return 3;
 }
 if(!attack){
  if(charging)return Math.floor(clock/180)%2?4:3;
  if(held.has('crouch')&&y>=floor)return 6;
  if(y<floor-1)return 3;
  // A caminhada utiliza o atlas separado WESLEY_WALK.
 }
 return 0;
}
function drawWesley(){
 if(!(wesleyAtlas.complete&&wesleyAtlas.naturalWidth))return;
 const att=clock<actionUntil?action:'',crouch=held.has('crouch')&&y>=floor;
 const walking=walk>0 && y>=floor-1 && !att && !charging && !crouch && clock>=stunUntil && wesleyWalkAtlas.complete && wesleyWalkAtlas.naturalWidth>0;
 const atlas=walking?wesleyWalkAtlas:wesleyAtlas,sp=walking?WES_WALK:WES;
 const fi=walking?Math.floor(walk/(11*WES_WALK.secPerFrame))%WES_WALK.frames:wesleyFrame(false);
 const dur=(specs[att]||specs.punch).duration||350;
 const wsp=wesleyPlayerSprite();
 const p=att?clamp(1-(actionUntil-clock)/dur,0,1):0,a=Math.sin(Math.PI*p);
 const melee=att==='punch'||att==='kick'||att==='superPunch'||att==='superKick';
 const cast=att==='shot'||att==='superShot'||att==='mega';
 let lunge=melee?a*(att.startsWith('super')?24:15):cast?-a*7:0;
 let tilt=melee?.045*a:0;
 if(clock<stunUntil){lunge=-12;tilt=-.12;if(wsp){lunge=-8;tilt=0}}
 const air=clamp((floor-y)/260,0,.6);
 const bounce=0; // O caminhar já contém a movimentação vertical dos próprios sprites.
 g.save();g.fillStyle='rgba(16,24,39,'+(.42-air*.4)+')';g.beginPath();g.ellipse(Math.round(x),floor+3,30*(1-air),6*(1-air),0,0,Math.PI*2);g.fill();g.restore();
 g.save();g.translate(Math.round(x),Math.round(y-bounce));g.scale(face,1);g.translate(lunge,0);g.rotate(tilt);
 const breathe=walk===0&&!att&&!charging?1+Math.sin(clock/410)*.009:1;
 g.scale(1,(crouch&&!wsp?.80:1)*breathe);
 if(charging&&!wsp){g.shadowColor='#ffc567';g.shadowBlur=19}
 if(clock<stunUntil){g.shadowColor='#ffda63';g.shadowBlur=17}
 if(wsp)drawWesleySheet(g,wsp[0],wsp[1]);
 else g.drawImage(atlas,(fi%sp.cols)*sp.cw,Math.floor(fi/sp.cols)*sp.ch,sp.cw,sp.ch,-sp.ax*sp.s,-sp.base*sp.s,sp.cw*sp.s,sp.ch*sp.s);
 if(wsp&&att==='superKick')drawWesleyBatFlight(g,dur*p);
 g.restore();
 if(melee&&a>.2&&!wsp){g.save();g.translate(x,y);g.scale(face,1);g.globalAlpha=a;
  g.strokeStyle=att.startsWith('super')?'#ffa549':'#fbd398';g.lineWidth=att.startsWith('super')?7:4;g.lineCap='round';
  g.beginPath();g.arc(50,att.toLowerCase().includes('kick')?-55:-95,23,-1.35,1.2);g.stroke();g.restore()}
}
function drawPlayer(){
 if(selectedCharacter==='wesley'){drawWesley();return}
 if(selectedCharacter==='scarecrow'){drawScarecrow();return}
 if(!zuskAtlas.complete||!zuskAtlas.naturalWidth)return;const mg=zuskMegaSprite(),tf=(zuskTele.complete&&zuskTele.naturalWidth)?zuskTeleFrame():-1,jf=(zuskJump.complete&&zuskJump.naturalWidth)?zuskJumpFrame():-1,kf=(zuskKick.complete&&zuskKick.naturalWidth)?zuskKickFrame():-1,cf=(zuskCrouch.complete&&zuskCrouch.naturalWidth)?zuskCrouchFrame():-1,hf=(zuskHurt.complete&&zuskHurt.naturalWidth)?zuskHurtFrame():-1,pf=(zuskPunch.complete&&zuskPunch.naturalWidth)?zuskPunchFrame():-1,chf=(zuskCharge.complete&&zuskCharge.naturalWidth)?zuskChargeFrame():-1,sf=(zuskSuper.complete&&zuskSuper.naturalWidth)?zuskSuperFrame():-1,skf=(zuskSuperKick.complete&&zuskSuperKick.naturalWidth)?zuskSuperKickFrame():-1,shf=(zuskShot.complete&&zuskShot.naturalWidth)?zuskShotFrame():-1,pyf=(zuskParry.complete&&zuskParry.naturalWidth)?zuskParryFrame():-1;
 const crouch=held.has('crouch')&&y>=floor,att=clock<actionUntil?action:'';
 const dur=(att&&specs[att]&&specs[att].duration)||1,p=att?clamp(1-(actionUntil-clock)/dur,0,1):0,a=Math.sin(p*Math.PI);
 const punch=att==='punch'||att==='superPunch',kick=att==='kick'||att==='superKick',cast=att==='shot'||att==='superShot'||att==='mega',big=att==='superPunch'||att==='superKick';
 // Sem quadros de ataque ainda: o corpo avança/inclina e um rastro de impacto marca o golpe.
 let lunge=0,tilt=0;
 if(punch){lunge=(pf>=0||sf>=0)?a*(big?6:5):a*(big?26:16);tilt=(pf>=0||sf>=0)?0:.07*a}
 if(kick){lunge=(kf>=0||skf>=0)?a*(big?5:5):a*(big?30:20);tilt=(kf>=0||skf>=0)?0:-.1*a}
 if(cast){lunge=(shf>=0||mg)?0:-a*8;tilt=(shf>=0||mg)?0:-.04*a}
 const breathe=(walk===0&&y>=floor&&!crouch)?1+Math.sin(clock/380)*.012:1;
 const sp=(hf>=0&&pyf<0&&tf<0)?{img:zuskHurt,cw:ZKH.cw,ch:ZKH.ch,base:ZKH.base,fi:hf}:pyf>=0?{img:zuskParry,cw:ZKY.cw,ch:ZKY.ch,base:ZKY.base,ax:ZKY.ax,cols:ZKY.cols,k:ZKY.k,fi:pyf}:mg?mg:tf>=0?{img:zuskTele,cw:ZKTP.cw,ch:ZKTP.ch,base:ZKTP.base,ax:ZKTP.ax,cols:ZKTP.cols,fi:tf}:shf>=0?{img:zuskShot,cw:ZKT.cw,ch:ZKT.ch,base:ZKT.base,ax:ZKT.ax,cols:ZKT.cols,fi:shf}:skf>=0?{img:zuskSuperKick,cw:ZKSK.cw,ch:ZKSK.ch,base:ZKSK.base,ax:ZKSK.ax,cols:ZKSK.cols,fi:skf}:kf>=0?{img:zuskKick,cw:ZKK.cw,ch:ZKK.ch,base:ZKK.base,fi:kf}:sf>=0?{img:zuskSuper,cw:ZKS.cw,ch:ZKS.ch,base:ZKS.base,ax:ZKS.ax,cols:ZKS.cols,fi:sf}:pf>=0?{img:zuskPunch,cw:ZKP.cw,ch:ZKP.ch,base:ZKP.base,fi:pf}:jf>=0?{img:zuskJump,cw:ZK.cw,ch:ZK.ch,base:ZK.base,fi:jf}:chf>=0?{img:zuskCharge,cw:ZKG.cw,ch:ZKG.ch,base:ZKG.base,fi:chf}:cf>=0?{img:zuskCrouch,cw:ZKC.cw,ch:ZKC.ch,base:ZKC.base,fi:cf}:{img:zuskAtlas,cw:ZK.cw,ch:ZK.ch,base:ZK.base,fi:zuskFrame()},fi=sp.fi,cols=sp.cols||ZK.cols,col=fi%cols,row=Math.floor(fi/cols);zChSprite=sp.img===zuskCharge;
 // sombra no chão (diminui quando pula)
 const air=clamp((floor-y)/260,0,.6);g.save();g.fillStyle='rgba(16,24,39,'+(.42-air*.4)+')';g.beginPath();g.ellipse(Math.round(tf>=0&&tf<=4?zTpFromX:x),floor+3,40*(1-air),7*(1-air),0,0,Math.PI*2);g.fill();g.restore();
 g.save();g.translate(Math.round(tf>=0&&tf<=4?zTpFromX:x),Math.round(y));g.scale(face,1);g.translate(lunge,0);g.rotate(tilt);g.scale(1,(crouch&&cf<0&&kf<0&&tf<0&&pyf<0&&!mg?.8:1)*breathe);
  {const kk=ZK.s*(sp.k||1);g.drawImage(sp.img,col*sp.cw,row*sp.ch,sp.cw,sp.ch,-(sp.ax!==undefined?sp.ax:sp.cw/2)*kk,-sp.base*kk,sp.cw*kk,sp.ch*kk)}
 g.restore();
 if(((punch&&pf<0&&sf<0)||(kick&&kf<0&&skf<0))&&a>.15){
  g.save();g.translate(Math.round(x),Math.round(y));g.scale(face,1);
  const r=specs[att].range||85,hx=r*.78,hy=punch?-98:-52;
  g.globalAlpha=Math.min(1,a*1.4);g.strokeStyle=big?'#ff9a3c':'#ffe27a';g.lineWidth=big?6:4;g.lineCap='round';
  g.beginPath();g.arc(hx-18,hy,22+a*10,-1,1);g.stroke();g.beginPath();g.arc(hx-18,hy,36+a*14,-.8,.8);g.stroke();
  g.restore();
 }
}
let roundTime=99,roundWins=[0,0];
// ===== V5.8: SISTEMA DE ROUNDS =====
// Cada lutador tem 3 barras: [verde, amarela, vermelha]. O dano gasta a verde primeiro, depois a amarela e por último a vermelha.

const LIFE_COL=[['#b9ff80','#3fcf4f','#1f8f3a'],['#fff48a','#f7c61b','#c98f08'],['#ff8f7e','#ee3a2e','#a8172a']];
const WINS_NEEDED=2;
if(typeof LIFE!=='undefined')LIFE.wesley=[20,30,150]; // Wesley: verde 20, amarela 30, vermelha 150 (total 200)
const lifeMax=id=>LIFE[id].reduce((a,b)=>a+b,0);
let maxHp=lifeMax('zusk'),dummyMax=lifeMax('scarecrow');
let round=1,roundState='fight',rsTimer=0,matchOver=false,roundWinner=-1,banner={text:'',t:0,dur:1};
// roundState: 'intro' (ROUND n, comandos travados) -> 'fight' -> 'ko' (K.O., comandos travados) -> próximo round ou fim da partida
const fightLive=()=>!matchOver&&(selectedMode!=='vs'||roundState==='fight');
function refillLife(){maxHp=lifeMax(selectedCharacter);dummyMax=lifeMax(dummyChar);hp=maxHp;dummy.hp=dummyMax}
function lifeSegs(total,id){const c=LIFE[id];let r=total;const red=Math.min(r,c[2]);r-=red;const yel=Math.min(r,c[1]);r-=yel;const grn=Math.min(r,c[0]);return [grn,yel,red]}
function resetFighterState(){playerCliffFalling=false;dummy.cliffFalling=false;dummy.cliffFallY=0;dummy.cliffFallVy=0;x=240;y=floor;vy=0;face=1;walk=0;action='';actionUntil=0;stunUntil=0;parryUntil=0;parryStartAt=-1;parryHitAt=-1;charging=false;energy=0;
  if(pendingShot){clearTimeout(pendingShot);pendingShot=null}
  scareState=0;zMegaStart=-1;zTpStart=-1;zImpacts=[];zShake=0;zDim=0;zCr=0;zChT=0;zChOut=0;
  dummy.x=stageHazardDamage()?650:730;dummy.flash=0;dummy.attackTimer=0;dummy.attackAnim=0;shots=[];effects=[];held.clear();held2.clear();p2Hit=null;eshots=[];dummy.energy=0;dummy.actionUntil=0;dummy.stunUntil=0;dummy.pend=null;dummy.parryUntil=0;dummy.wasLocked=false;if(typeof wesleyDummyReset==='function')wesleyDummyReset();if(window.OpponentAI)OpponentAI.reset()}
function showBanner(text,dur){banner={text,t:dur,dur}}
function endRound(w,text){if(roundState!=='fight')return;roundState='ko';rsTimer=1.7;roundWinner=w;if(w>=0)roundWins[w]++;showBanner(text||'K.O.',99);shots=[];eshots=[];dummy.pend=null;held.clear();held2.clear();p2Hit=null}
function nextRound(){if(roundWinner>=0)round++;resetFighterState();hp=maxHp;dummy.hp=dummyMax;roundTime=99;roundState='intro';rsTimer=1.6;showBanner('ROUND '+round,1.6)}
function finishMatch(){matchOver=true;const pw=roundWins[0]>=WINS_NEEDED;
  document.getElementById('endTitle').textContent=(P2_HUMAN()?(pw?'P1 · ':'P2 · '):'')+charName(pw?selectedCharacter:dummyChar)+' VENCEU!';
  document.body.classList.add('matchEnd');const o=document.getElementById('endOverlay');o.hidden=false;const b=o.querySelector('button');if(b)b.focus({preventScroll:true})}
function hideEndOverlay(){matchOver=false;document.body.classList.remove('matchEnd');document.getElementById('endOverlay').hidden=true}
function roundUpdate(dt){
  if(banner.t>0)banner.t-=dt;
  if(selectedMode!=='vs'||matchOver)return;
  if(roundState==='intro'){rsTimer-=dt;if(rsTimer<=0){roundState='fight';showBanner('LUTE!',.8)}}
  else if(roundState==='fight'){roundTime=Math.max(0,roundTime-dt);
    if(roundTime<=0){const a=hp/maxHp,b=dummy.hp/dummyMax;endRound(a>b?0:a<b?1:-1,a===b?'EMPATE':'TEMPO!')}}
  else if(roundState==='ko'){rsTimer-=dt;if(rsTimer<=0){if(roundWins[0]>=WINS_NEEDED||roundWins[1]>=WINS_NEEDED)finishMatch();else nextRound()}}
}
function drawBanner(){
  if(banner.t<=0)return;
  g.setTransform(canvas.width/960,0,0,canvas.height/540,0,0);
  const age=banner.dur-banner.t,pop=1+.35*Math.max(0,1-age/.16),fade=banner.dur<50?Math.min(1,banner.t/.25):1;
  g.save();g.globalAlpha=fade;g.translate(480,245);g.scale(pop,pop);g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  g.font='900 88px Georgia,serif';g.lineWidth=16;g.strokeStyle='#3b1e10';g.shadowColor='#000a';g.shadowBlur=14;g.shadowOffsetY=5;g.strokeText(banner.text,0,0);
  g.shadowColor='transparent';const gr=g.createLinearGradient(0,-44,0,44);gr.addColorStop(0,'#fff8d6');gr.addColorStop(1,'#f4ae3e');g.fillStyle=gr;g.fillText(banner.text,0,0);
  g.restore();
}
// Barra de vida: 3 camadas sobrepostas na mesma barra. A verde fica por cima; ao perder vida ela revela a amarela por baixo, e depois a vermelha.
function lifeBar(x,y,w,h,total,id,reverse){
  const caps=LIFE[id],rem=lifeSegs(total,id);
  polygon([[x-9,y+6],[x+7,y-5],[x+w-7,y-5],[x+w+9,y+6],[x+w-3,y+h+7],[x+3,y+h+7]],'#271b25','#f6b85a',5);
  g.fillStyle='#130f22';g.fillRect(x,y,w,h);
  for(const k of [2,1,0]){
    const fw=caps[k]?w*rem[k]/caps[k]:0;if(fw<=0)continue;
    g.fillStyle=gradient(x,y,w,h,LIFE_COL[k]);g.fillRect(reverse?x+w-fw:x,y,fw,h)}
  const gw=caps[0]?w*rem[0]/caps[0]:0,yw=caps[1]?w*rem[1]/caps[1]:0,rw=caps[2]?w*rem[2]/caps[2]:0,top=Math.max(gw,yw,rw);
  g.fillStyle='#ffffff32';g.fillRect(reverse?x+w-top:x,y,top,Math.max(3,h*.23));
  g.strokeStyle='#e4a355';g.lineWidth=2;g.strokeRect(x,y,w,h);
}
function polygon(points,fill,stroke='#6b371d',width=3){
 g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=stroke;g.lineWidth=width;g.stroke();
}
function gradient(x,y,w,h,colors){let t=g.createLinearGradient(x,y,x,y+h);colors.forEach((c,i)=>t.addColorStop(i/(colors.length-1),c));return t}
function hudMeter(x,y,w,h,value,colors,reverse=false,segments=false){
 polygon([[x-9,y+6],[x+7,y-5],[x+w-7,y-5],[x+w+9,y+6],[x+w-3,y+h+7],[x+3,y+h+7]],'#271b25','#f6b85a',5);
 g.fillStyle='#130f22';g.fillRect(x,y,w,h);
 const fillW=clamp(value,0,100)/100*w;
 g.fillStyle=gradient(x,y,w,h,colors);
 g.fillRect(reverse?x+w-fillW:x,y,fillW,h);
 g.fillStyle='#ffffff32';g.fillRect(reverse?x+w-fillW:x,y,fillW,Math.max(3,h*.23));
 if(segments){for(let i=1;i<5;i++){let xx=x+i*w/5;g.strokeStyle='#1d3558';g.lineWidth=4;g.beginPath();g.moveTo(xx+8,y+2);g.lineTo(xx-8,y+h-2);g.stroke()}}
 g.strokeStyle='#e4a355';g.lineWidth=2;g.strokeRect(x,y,w,h);
}
function portrait(cx,cy,right=false){
 // Retrato compacto do lutador selecionado: jogador à esquerda, personagem do manequim à direita.
 g.save();g.translate(cx,cy);
 polygon([[-23,-23],[23,-23],[28,-16],[28,20],[20,27],[-20,27],[-28,20],[-28,-16]],'#292332','#e7ac59',3);
 g.beginPath();g.rect(-21,-19,42,38);g.clip();
 g.fillStyle=right?'#58677b':'#293d59';g.fillRect(-21,-19,42,38);
 if(!(right&&dummyMode==='none')){const id=right?dummyChar:selectedCharacter;const pi=id==='scarecrow'?scarePortrait:id==='wesley'?wesleyPortrait:zuskPortrait;if(pi.complete&&pi.naturalWidth)g.drawImage(pi,-21,-19,42,38)}
 g.restore();
 g.fillStyle=right?'#327cce':'#b93447';g.fillRect(cx-14,cy+25,28,12);
 g.fillStyle='#fff1d0';g.font='bold 10px sans-serif';g.textAlign='center';g.fillText(right?'P2':'P1',cx,cy+34);
}
function diamond(cx,cy,filled){polygon([[cx,cy-6],[cx+6,cy],[cx,cy+6],[cx-6,cy]],filled?'#ffd06b':'#2c2230','#f2bc72',2)}
function drawCombatHUD(){
 g.save();g.shadowColor='#110e18';g.shadowBlur=3;g.shadowOffsetY=1;
 // HUD reduzido: ocupa apenas a faixa superior da arena.
 lifeBar(63,21,348,17,hp,selectedCharacter,false);
 lifeBar(549,21,348,17,dummyMode==='none'?dummyMax:dummy.hp,dummyChar,true);
 hudMeter(70,49,330,11,energy,['#94f8ff','#26caff','#177bd4'],false,true);
 hudMeter(560,49,330,11,P2_HUMAN()?dummy.energy:0,['#94f8ff','#26caff','#177bd4'],true,true);
 portrait(33,32);portrait(927,32,true);
 polygon([[480,7],[503,30],[480,69],[457,30]],'#31202d','#f3af4b',3);
 g.shadowBlur=0;g.shadowOffsetY=0;
 g.fillStyle='#fff1bd';g.font='bold 24px Georgia,serif';g.textAlign='center';g.fillText(String(Math.ceil(roundTime)).padStart(2,'0'),480,39);
 for(let i=0;i<2;i++){diamond(442-i*16,73,i<roundWins[0]);diamond(518+i*16,73,i<roundWins[1]);}
 g.fillStyle='#fff0c4';g.font='bold 10px system-ui';g.textAlign='left';g.fillText(charName(selectedCharacter),70,13);
 g.textAlign='right';g.fillText(dummyMode==='none'?'SEM OPONENTE':charName(dummyChar),890,13);
 g.restore();
}
// Manequim com personagem (padrão: Espantalho, escolhido na tela de seleção ou na pausa do treino).
// Parado = quadro 0; vira para o jogador; brilha e é empurrado ao levar dano; ataca com o giro (Espantalho) ou o soco (Zusk).
const charName=id=>({zusk:'ZUSK',scarecrow:'ESPANTALHO',wesley:'WESLEY MAFIOSO'}[id]||'LUTADOR');
function drawDummyChar(){
 const ok=i=>i.complete&&i.naturalWidth,flash=dummy.flash>0,fc=x<dummy.x?-1:1;
 const atk=dummy.attackAnim>0,p=atk?clamp(1-dummy.attackAnim/.32,0,.999):0;
 const hq=flash?clamp(1-dummy.flash/170,0,.999):0,hw=Math.sin(hq*Math.PI);
 let img,cw,ch,base,ax,cols=4,fi=0,lunge=0,tilt=0;
 if(dummyChar==='wesley'){
  if(!ok(wesleyAtlas))return;
  const aiWalking=!flash&&!atk&&clock<(dummy.wesleyWalkUntil||0)&&ok(wesleyWalkAtlas);
  const ws=aiWalking?WES_WALK:WES;
  img=aiWalking?wesleyWalkAtlas:wesleyAtlas;cw=ws.cw;ch=ws.ch;base=ws.base;ax=ws.ax;cols=ws.cols;
  fi=aiWalking?Math.floor((dummy.wesleyWalkDistance||0)/19)%WES_WALK.frames:
      flash?(Math.floor(clock/100)%2?5:6):atk?[2,3,4,3,2][Math.floor(p*5)]:0;
  if(flash){lunge=-12*hw;tilt=wesleyHurtReady()?0:-.15*hw}
  else if(atk){lunge=Math.sin(p*Math.PI)*12;tilt=.04*Math.sin(p*Math.PI)}
 }else if(dummyChar==='scarecrow'){
  if(!ok(scareImg))return;
  img=scareImg;cw=ZKE.cw;ch=ZKE.ch;base=ZKE.base;ax=ZKE.ax;cols=ZKE.cols;
  if(flash){lunge=-14*hw;tilt=-.28*hw}
  else if(atk){fi=[2,4,6,7,8,9,18,19][Math.floor(p*8)];lunge=Math.sin(p*Math.PI)*10}
 }else{
  if(!ok(zuskAtlas))return;
  img=zuskAtlas;cw=ZK.cw;ch=ZK.ch;base=ZK.base;ax=cw/2;
  if(flash&&ok(zuskHurt)){img=zuskHurt;cw=ZKH.cw;ch=ZKH.ch;base=ZKH.base;ax=cw/2;fi=[2,2,3,3,4,5,6,7][Math.floor(hq*8)]}
  else if(atk&&ok(zuskPunch)){img=zuskPunch;cw=ZKP.cw;ch=ZKP.ch;base=ZKP.base;ax=cw/2;fi=[1,2,3,3,4,4,5,6][Math.floor(p*8)];lunge=Math.sin(p*Math.PI)*5}
 }
 const breathe=(!flash&&!atk)?1+Math.sin(clock/380)*.012:1;
 if(dummy.charging&&dummyChar!=='wesley'&&!dummy.cliffFalling){g.save();g.globalAlpha=.3+.15*Math.sin(clock/70);g.fillStyle='#ffe066';g.beginPath();g.ellipse(Math.round(dummy.x),floor-85,50,100,0,0,Math.PI*2);g.fill();g.restore()}
 if(!dummy.cliffFalling){g.save();g.fillStyle='rgba(16,24,39,.42)';g.beginPath();g.ellipse(Math.round(dummy.x),floor+3,36,6,0,0,Math.PI*2);g.fill();g.restore();}
 g.save();g.translate(Math.round(dummy.x),floor+(dummy.cliffFallY||0));g.scale(fc,1);g.translate(lunge,0);g.rotate(tilt);g.scale(1,breathe);
 if(flash){g.shadowColor='#ffe58d';g.shadowBlur=18}
 const s=dummyChar==='wesley'?WES.s:ZK.s;const wsd=dummyChar==='wesley'?wesleyDummySprite(flash,atk,p,hq):null;if(wsd)drawWesleySheet(g,wsd[0],wsd[1]);else g.drawImage(img,(fi%cols)*cw,Math.floor(fi/cols)*ch,cw,ch,-ax*s,-base*s,cw*s,ch*s);if(dummyChar==='wesley'&&typeof wesleyDummyDrawExtra==='function')wesleyDummyDrawExtra(g);
 g.restore();
 g.save();g.font='12px monospace';g.textAlign='center';
 
 
 g.restore();
}
function draw(){g.setTransform(canvas.width/960,0,0,canvas.height/540,0,0);zuskMegaTick();if(zShake>.4){g.translate((Math.random()-.5)*zShake*2,(Math.random()-.5)*zShake*2);zShake*=.85}else zShake=0;if(stageImage.complete&&stageImage.naturalWidth)g.drawImage(stageImage,0,0,960,540);else{g.fillStyle='#c5a46a';g.fillRect(0,0,960,540)}
drawMegaDim();drawCombatHUD();
// Alvo de treino, não é um segundo personagem jogável
if(dummyMode!=='none'){drawDummyChar();if(typeof wesleyDummyDrawStand==='function')wesleyDummyDrawStand(g)}
drawPlayer();if(typeof drawWesleyStand==='function')drawWesleyStand(g);drawZuskBeam();
for(let shot of shots){if(shot.wmega){g.save();const gr=g.createRadialGradient(shot.x,shot.y,2,shot.x,shot.y,shot.size);gr.addColorStop(0,'#fff');gr.addColorStop(.4,'#ffe38a');gr.addColorStop(1,'rgba(255,170,40,0)');g.fillStyle=gr;g.beginPath();g.arc(shot.x,shot.y,shot.size,0,Math.PI*2);g.fill();g.restore();continue}if(shot.spr&&zuskOrb.complete&&zuskOrb.naturalWidth){const age=1600-shot.life,fi=age<140?Math.min(3,Math.floor(age/35)):[5,6,7,6][Math.floor((age-140)/55)%4],sc=.17+.13*Math.min(1,age/160);g.save();g.translate(Math.round(shot.x),Math.round(shot.y));g.scale(shot.dir,1);g.drawImage(zuskOrb,fi*ZKO.pw,0,ZKO.pw,ZKO.ph,-ZKO.ax*sc,-ZKO.ay*sc,ZKO.pw*sc,ZKO.ph*sc);g.restore();continue}g.fillStyle=shot.color;g.fillRect(shot.x-shot.size/2,shot.y-shot.size/2,shot.size,shot.size);g.fillStyle='#fff';g.fillRect(shot.x-shot.size/4,shot.y-shot.size/4,shot.size/2,shot.size/2)}
for(const s of eshots){g.save();if(s.wmega){const gr=g.createRadialGradient(s.x,s.y,2,s.x,s.y,s.size);gr.addColorStop(0,'#fff');gr.addColorStop(.4,'#ffe38a');gr.addColorStop(1,'rgba(255,170,40,0)');g.fillStyle=gr;g.beginPath();g.arc(s.x,s.y,s.size,0,7);g.fill()}else{g.fillStyle=s.homing?'#76dcff':'#ff6b5a';g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.arc(Math.round(s.x),Math.round(s.y),s.homing?15:11,0,7);g.fill();g.stroke()}g.restore()}for(let e of effects){if(!/^[-+]/.test(e.label))continue;g.fillStyle='#fff1aa';g.font='bold 17px monospace';g.fillText(e.label,e.x,e.y)}
drawImpactFrames();
}
function tick(now){if(menuOpen||matchOver){auraUpdate(false);last=now;requestAnimationFrame(tick);return;}if(!last)last=now;let dt=Math.min((now-last)/1000,.05);last=now;clock=now;roundUpdate(dt);let dir=fightLive()&&!playerCliffFalling&&!(selectedCharacter==='zusk'&&action==='mega'&&clock<actionUntil)&&!superLock()&&!wesUltOn()?(held.has('right')?1:0)-(held.has('left')?1:0):0;let moving=dir!==0&&!held.has('crouch');if(moving){x=clamp(x+dir*250*dt,55,905);face=dir;walk+=dt*11}else walk=0;
playerCliffDropBegin();
y+=vy*dt*60;vy+=.75*dt*60;
if(!playerCliffFalling&&y>=floor){if(stageHazardDamage()&&x>=STAGE_CLIFF_LEDGE_X)playerCliffDropBegin();else{y=floor;vy=0}}
playerCliffDropTick();charging=held.has('charge')&&!moving&&fightLive()&&!(selectedCharacter==='zusk'&&action==='mega'&&clock<actionUntil)&&!wesUltOn();auraUpdate(charging);if(selectedCharacter==='wesley'){wesleyTauntTick();if(typeof wesleyUlt2Tick==='function')wesleyUlt2Tick()}if(charging){energy=clamp(energy+15*dt,0,100);chargeTick++}if(AI_ON()){aiStep(dt)}dummyCliffDropTick(dt);if(!AI_ON()&&dummyMode==='attack'&&dummy.hp>0&&fightLive()){dummy.attackTimer+=dt;if(dummy.attackTimer>=3){dummy.attackTimer-=3;dummy.attackAnim=.32;if(Math.abs(dummy.x-x)<115&&Math.abs(y-floor)<80&&!(action==='mega'&&clock<actionUntil)&&!superLock()){if(clock<=parryUntil){parrySuccess();hit(10);effects.push({x,y:y-175,t:550,label:'PARRY! +10'})}else{hp=clamp(hp-10,0,maxHp);stunUntil=clock+500;action='';actionUntil=0;if(selectedCharacter==='wesley')wesleyHurtSound();if(pendingShot){clearTimeout(pendingShot);pendingShot=null}effects.push({x,y:y-160,t:550,label:'-10 VIDA'});effects.push({x,y:y-185,t:500,label:'ATORDOADO'});if(hp===0){if(selectedMode==='vs')endRound(1);else{hp=maxHp;effects.push({x,y:y-190,t:950,label:'TREINO REINICIADO'})}}}}}}dummy.attackAnim=Math.max(0,dummy.attackAnim-dt);for(let s of shots){if(s.homing&&dummyMode!=='none'&&dummy.hp>0){let targetX=dummy.x,targetY=floor-90;let dx=targetX-s.x,dy=targetY-s.y,dist=Math.hypot(dx,dy);if(s.spr&&Math.abs(dx)>4)s.dir=dx>0?1:-1;if(dist>0){let speed=660;let step=Math.min(speed*dt,dist);s.x+=dx/dist*step;s.y+=dy/dist*step;}}else{s.x+=s.vx*dt*60;}s.life-=dt*1000;if(dummyMode!=='none'&&Math.abs(s.x-dummy.x)<s.size/2+22&&Math.abs(s.y-(floor-90))<70&&s.life>0){hit(s.damage);if(s.wmega){zImpacts.push({t:clock,x:dummy.x,y:floor-90,k:2});zShake=Math.max(zShake,12)}s.life=0}}shots=shots.filter(s=>s.life>0&&s.x>0&&s.x<960);effects.forEach(e=>{e.t-=dt*1000;e.y-=dt*15});effects=effects.filter(e=>e.t>0);dummy.flash=Math.max(0,dummy.flash-dt*1000);scareHoldTick();if(clock>=actionUntil)action='';draw();drawBanner();requestAnimationFrame(tick)}requestAnimationFrame(tick);

// Fluxo: Modo -> Personagem -> Cenário -> Jogo
let menuOpen=true,selectedMode='train',selectedCharacter='zusk',selectedStage='forest',menuPage='home';
const overlay=document.getElementById('menuOverlay'),content=document.getElementById('menuContent');
let soundOn=true,pausedAt=0;
function resumeGame(){if(pausedAt){const elapsed=performance.now()-pausedAt;actionUntil+=elapsed;parryUntil+=elapsed;if(dummy.parryUntil)dummy.parryUntil+=elapsed;if(parryStartAt>=0)parryStartAt+=elapsed;if(parryHitAt>=0)parryHitAt+=elapsed;if(zMegaStart>=0)zMegaStart+=elapsed;if(typeof wesleyUlt2Shift==='function')wesleyUlt2Shift(elapsed);if(typeof wesleyDummyShift==='function')wesleyDummyShift(elapsed);if(zTpStart>=0)zTpStart+=elapsed;zImpacts.forEach(m=>m.t+=elapsed);pausedAt=0;}menuOpen=false;overlay.classList.add('hidden');held.clear();last=0;}
function openPause(){if(matchOver)return;if(!window.hasStarted){showMenu('home');return;}pausedAt=performance.now();showMenu('pause');}
const IC=(()=>{const o='<svg viewBox="0 0 24 24" fill="#ffd34a" stroke="#5a2a10" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">',c='</svg>';return{
 play:o+'<path d="M7 4.5v15l12-7.5z"/>'+c,
 pause:o+'<rect x="5.5" y="4.5" width="4.6" height="15" rx="1.3"/><rect x="13.9" y="4.5" width="4.6" height="15" rx="1.3"/>'+c,
 list:o+'<path d="M6 3.5h12v17H6z"/><path d="M9 8h6M9 12h6M9 16h4" fill="none" stroke="#5a2a10" stroke-width="1.9"/>'+c,
 exit:o+'<path d="M4 3.5h9.5v17H4z"/><path d="M15.5 8.2L20 12l-4.5 3.8M19.8 12H10.5" fill="none" stroke="#ffd34a" stroke-width="2.6"/>'+c,
 back:o+'<path d="M10 4.8L2.8 12 10 19.2v-4.1h10.4V8.9H10z"/>'+c,
 gear:o+'<path d="M12 2.5l1.7 2.4 2.9-.7.7 2.9 2.9.7-.7 2.9 2.4 1.7-2.4 1.7.7 2.9-2.9.7-.7 2.9-2.9-.7L12 21.5l-1.7-2.4-2.9.7-.7-2.9-2.9-.7.7-2.9L2.1 12l2.4-1.7-.7-2.9 2.9-.7.7-2.9 2.9.7z"/><circle cx="12" cy="12" r="3.3" fill="#5a2a10"/>'+c}})();
IC.cpu='<svg viewBox="0 0 24 24" fill="#ffd34a" stroke="#5a2a10" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" fill="#5a2a10"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" fill="none" stroke-width="2"/></svg>';
IC.duo='<svg viewBox="0 0 24 24" fill="#ffd34a" stroke="#5a2a10" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><circle cx="8" cy="8" r="3.2"/><circle cx="16.5" cy="8" r="3.2"/><path d="M2.5 20c0-3.8 2.5-6.2 5.5-6.2s5.5 2.4 5.5 6.2z"/><path d="M14 14.2c.8-.3 1.6-.4 2.5-.4 3 0 5 2.4 5 6.2h-5.4"/></svg>';

let storyMsg='';
function storyLoad(){try{const a=JSON.parse(localStorage.getItem('arena_story_slots')||'[]');return [0,1,2].map(i=>a[i]||null)}catch(e){return [null,null,null]}}
function storySave(a){try{localStorage.setItem('arena_story_slots',JSON.stringify(a))}catch(e){}}
function renderStory(){const sl=storyLoad();const fmt=t=>{const d=new Date(t);return d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})};
 const rows=sl.map((d,i)=>`<div class="settingsRow"><label>Save ${i+1}<br><span class="menuSmall">${d?`Capítulo ${d.chapter} · ${fmt(d.updated)}`:'Vazio'}</span></label><span>${d?`<button class="slotBtn primary" data-next="storySlot" data-slot="${i}" data-act="continue">Continuar</button> <button class="slotBtn secondary" data-next="storySlot" data-slot="${i}" data-act="new">Novo jogo</button>`:`<button class="slotBtn primary" data-next="storySlot" data-slot="${i}" data-act="new">Começar</button>`}</span></div>`).join('');
 return `<h2><i class="hi">${IC.list}</i>Modo História</h2><p class="menuSmall">Escolha um local de save.</p>${rows}${storyMsg?`<p class="menuSmall">${storyMsg}</p>`:''}<div class="menuStack"><button class="secondary" data-next="home"><i class="gi">${IC.back}</i><span>Voltar</span></button></div>`}
function storySlotAction(i,act){i=+i;const sl=storyLoad();const now=Date.now();
 if(act==='new'){if(sl[i]&&!confirm('Apagar o Save '+(i+1)+' e começar um novo jogo?'))return;sl[i]={chapter:1,created:now,updated:now};storyMsg='Save '+(i+1)+': novo jogo criado. A história ainda está em construção.'}
 else{sl[i].updated=now;storyMsg='Save '+(i+1)+': continuando do Capítulo '+sl[i].chapter+'. A história ainda está em construção.'}
 storySave(sl);showMenu('story')}
function showMenu(page){menuOpen=true;menuPage=page;overlay.classList.remove('hidden');overlay.classList.toggle('homeScreen',page==='home');overlay.classList.toggle('stageScreen',page==='stage');overlay.classList.toggle('charScreen',page==='character'||page==='opponent');overlay.classList.toggle('panelScreen',page==='pause'||page==='combos'||page==='config'||page==='story'||page==='vsmode');held.clear();
 if(page==='pause')content.innerHTML=`<h2><i class="hi">${IC.pause}</i>Jogo pausado</h2>${selectedMode==='train'?`<div class="settingsRow"><label for="pauseDummy">Manequim</label><select id="pauseDummy">${[...document.getElementById('dummyMode').options].map(o=>`<option value="${o.value}"${o.value===dummyMode?' selected':''}>${o.text}</option>`).join('')}</select></div><div class="settingsRow"><label for="pauseOpp">Personagem do manequim</label><select id="pauseOpp">${CHARACTERS.map(c=>`<option value="${c.id}"${c.id===dummyChar?' selected':''}>${c.name}</option>`).join('')}</select></div>`:''}<div class="settingsRow"><label for="touchToggle">Controles na tela</label><input type="checkbox" id="touchToggle"${touchOn?' checked':''}></div><div class="menuStack"><button class="primary" data-next="resume"><i class="gi">${IC.play}</i><span>Continuar</span></button><button data-next="combos"><i class="gi">${IC.list}</i><span>Lista de combos</span></button><button class="secondary" data-next="exit"><i class="gi">${IC.exit}</i><span>Sair para o menu</span></button></div>`;
 if(page==='combos')content.innerHTML=`<h2><i class="hi">${IC.list}</i>Combos do ${CHARACTERS.find(c=>c.id===selectedCharacter)?.name||'Lutador'}</h2><p class="menuSmall">Aperte os dois botões juntos, em qualquer ordem (até 0,12 s de diferença; Pulo + R até 0,2 s), mantendo os dois pressionados.</p><div class="comboScroll"><table class="comboTable"><thead><tr><th>Golpe</th><th>Comando</th><th>Energia</th><th>Dano</th></tr></thead><tbody>${[['Soco','E',0,5],['Chute','Q',0,5],['Tiro comum','R',30,15],(selectedCharacter==='scarecrow'?['Super Soco (segurar)','E + R',5,'5 por golpe']:['Super Soco','E + R',40,selectedCharacter==='wesley'?'11 x 3':20]),['Super Chute','Q + R',40,20],...(selectedCharacter==='wesley'?[['Provocação','Trás + R',0,'+40 energia'],['Provocação','Frente + R',0,'+40 energia']]:[['Teleporte para trás','Trás + R',30,'—'],['Teleporte para frente','Frente + R',30,'—']]),['Super Tiro Teleguiado','W + R',60,30],['Parry','S + R',20,10],['Super Mega Ultra Tiro','R + R',100,selectedCharacter==='scarecrow'?60:selectedCharacter==='wesley'?((specs.mega&&specs.mega.dmg)||'?'):'3 x 25']].map(a=>`<tr>${a.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="menuStack"><button class="secondary" data-next="pause"><i class="gi">${IC.back}</i><span>Voltar à pausa</span></button><button class="primary" data-next="resume"><i class="gi">${IC.play}</i><span>Continuar</span></button></div>`;
 if(page==='home')content.innerHTML=`<div class="homeArt" aria-hidden="true"></div><div class="homeTitle">ARENA DAS ORIGENS<small>JOGO DE LUTA</small></div><button class="homeHotspot story" aria-label="Modo História" title="Modo História" data-next="story"></button><button class="homeHotspot vs" aria-label="Versus" title="Versus" data-next="mode" data-mode="vs"></button><button class="homeHotspot train" aria-label="Treino" title="Treino" data-next="mode" data-mode="train"></button><button class="homeHotspot config" aria-label="Opções" title="Opções" data-next="config"></button>`;
 if(page==='story')content.innerHTML=renderStory();
 if(page==='vsmode')content.innerHTML=`<h2><i class="hi">${IC.duo}</i>Versus</h2><p class="menuSmall" style="text-align:center">Contra quem você quer lutar?</p><div class="menuStack"><button class="primary" data-next="character" data-vs="ai"><i class="gi">${IC.cpu}</i><span>Contra a IA</span></button><button data-next="character" data-vs="player"><i class="gi">${IC.duo}</i><span>Contra outro jogador</span></button><button class="secondary" data-next="home"><i class="gi">${IC.back}</i><span>Voltar</span></button></div><p class="menuSmall"><b>P1:</b> W A S D mover · E soco · Q chute · R especial · Shift carregar<br><b>P2:</b> ← → mover · P soco · O chute · I especial · L carregar</p>`;
 if(page==='character'||page==='opponent')renderCharacter();
 if(page==='stage')renderStage();
 if(page==='config')content.innerHTML=`<h2><i class="hi">${IC.gear}</i>Configurações</h2><div class="settingsRow"><label for="effectsToggle">Efeitos visuais de energia</label><input type="checkbox" id="effectsToggle" ${effectsEnabled?'checked':''}></div><p class="menuSmall">Controles P1: W/A/S/D para mover, Q chute, E soco, Shift carrega, R especial. TimeSpot: 0,5s.<br>Controles P2 (modo contra jogador): ← → mover, O chute, P soco, L carrega, I especial.</p><div class="menuStack"><button class="secondary" data-next="home"><i class="gi">${IC.back}</i><span>Voltar</span></button></div>`;
 
}
let effectsEnabled=true;
// ===== V3.3: tela cheia, controles de toque e nitidez =====
let touchOn=matchMedia('(pointer:coarse)').matches||innerWidth<=820;   // celular/janela estreita: liga sozinho
const applyTouchUI=()=>document.body.classList.toggle('touchUI',touchOn);applyTouchUI();
function fitCanvas(){const w=document.getElementById('stageWrap').clientWidth,k=Math.min(3,Math.max(1,Math.ceil(w*(devicePixelRatio||1)/960)));
 if(canvas.width!==960*k){canvas.width=960*k;canvas.height=540*k;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high'}}
addEventListener('resize',fitCanvas);fitCanvas();
content.addEventListener('change',e=>{
 if(e.target.id==='touchToggle'){touchOn=e.target.checked;applyTouchUI()}
 if(e.target.id==='pauseOpp'){dummyChar=e.target.value;dummyMax=lifeMax(dummyChar);dummy.hp=dummyMax;dummy.flash=0}
 if(e.target.id==='pauseDummy'){const sel=document.getElementById('dummyMode');sel.value=e.target.value;sel.dispatchEvent(new Event('change'))}
});

// ===== V3.3: seleção de personagem orientada a dados =====
// Para adicionar um personagem: acrescente um item em CHARACTERS (id, name, art = função que devolve o SVG).

const CHAR_PER_PAGE=12;
// Retângulos (x,y,largura,altura) em pixels da arte 1672x941, medidos nas janelas cinza da moldura.
const CX_SLOTS=[[703,255,138,131],[890,255,139,130],[1074,255,138,130],[1259,255,138,130],[703,425,138,129],[890,425,138,129],[1074,425,138,129],[1259,425,137,129],[703,594,138,129],[890,594,139,129],[1074,594,138,129],[1259,594,138,129]];
const CX_BIG=[110,292,340,396],CX_NAME=[112,716,320,56],CX_LEFT=[545,405,95,128],CX_RIGHT=[1447,405,95,128],CX_BACK=[20,815,322,106],CX_OK=[1285,811,365,108];
let charPage=0;
const cxPos=(r,b=0)=>`left:${(r[0]-b)/16.72}%;top:${(r[1]-b)/9.41}%;width:${(r[2]+2*b)/16.72}%;height:${(r[3]+2*b)/9.41}%`;
function charPages(){return Math.max(1,Math.ceil(CHARACTERS.length/CHAR_PER_PAGE))}
function renderCharacter(){
 const opp=menuPage==='opponent',sel=CHARACTERS.find(c=>c.id===(opp?dummyChar:selectedCharacter))||CHARACTERS[0];if(opp)dummyChar=sel.id;else selectedCharacter=sel.id;
 const B=6; // a arte do slot entra 6px por baixo da moldura, sem frestas nos cantos
 let h='<div class="charBg" aria-hidden="true"></div>';
 if(opp)h+=`<div class="cx-p2" style="${cxPos([138,130,168,152])}"><svg viewBox="0 0 168 152" aria-hidden="true"><path d="M3 16Q84 -4 165 16L165 112L110 118L84 150L58 118L3 112Z" fill="#3a1a0a"/><path d="M10 22Q84 6 158 22L158 104L106 110L84 138L62 110L10 104Z" fill="#3b82d6"/><path d="M10 22Q84 6 158 22L158 44Q84 30 10 44Z" fill="#6aa7ee"/><path d="M70 118L98 118L84 136Z" fill="#f5b93a"/><text x="84" y="84" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="54" fill="#fff1d0" stroke="#3a1a0a" stroke-width="7" paint-order="stroke">P2</text></svg></div><div class="cx-title" style="${cxPos([560,48,550,74])}">${P2_HUMAN()?'Seleção do Jogador 2':'Seleção do Manequim'}</div>`;
 CX_SLOTS.forEach((r,i)=>{const c=CHARACTERS[charPage*CHAR_PER_PAGE+i];
  h+=c?`<div class="cx-img" style="${cxPos(r,B)}">${(c.thumb||c.art)()}</div>`:`<div class="cx-img cx-locked" style="${cxPos(r,B)}"></div>`;});
 CX_SLOTS.forEach((r,i)=>{const c=CHARACTERS[charPage*CHAR_PER_PAGE+i];
  h+=c?`<button class="cx-hit${c.id===sel.id?' sel':''}" style="${cxPos(r)}" data-char="${c.id}" aria-pressed="${c.id===sel.id}" aria-label="Selecionar ${c.name}"><span class="cx-label">${c.name}</span></button>`
      :`<div class="cx-hit cx-lock" style="${cxPos(r)}"></div>`;});
 h+=`<div class="cx-shadow" style="${cxPos([150,672,260,34])}"></div><div class="cx-big" style="${cxPos(CX_BIG)}">${sel.art()}</div>`;
 h+=`<div class="cx-name" style="${cxPos(CX_NAME)}">${sel.name}</div>`;
 h+=`<button class="cx-btn cx-arrow" style="${cxPos(CX_LEFT)}" data-cpage="-1" aria-label="Página anterior"></button><button class="cx-btn cx-arrow" style="${cxPos(CX_RIGHT)}" data-cpage="1" aria-label="Próxima página"></button>`;
 h+=`<button class="cx-btn cx-png cx-back" style="${cxPos(CX_BACK)}" data-next="${opp?'character':(selectedMode==='vs'?'vsmode':'home')}" aria-label="Voltar" title="Voltar (Esc)"></button>`;
 h+=`<button class="cx-btn cx-png cx-ok" style="${cxPos(CX_OK)}" data-next="${opp?'stage':'opponent'}" aria-label="Confirmar personagem" title="Confirmar (Z)"></button>`;
 content.innerHTML=h;
}
content.addEventListener('click',e=>{
 const c=e.target.closest('[data-char]');if(c){if(menuPage==='opponent')dummyChar=c.dataset.char;else selectedCharacter=c.dataset.char;renderCharacter();return}
 const p=e.target.closest('[data-cpage]');if(p){const n=charPages();if(n>1){charPage=(charPage+ +p.dataset.cpage+n)%n;renderCharacter()}}
});
// Teclado na tela de personagens: setas escolhem, Z/Enter confirmam (Esc volta, pelo tratador global)
document.addEventListener('keydown',e=>{
 if(!menuOpen||(menuPage!=='character'&&menuPage!=='opponent'))return;
 const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-4,ArrowDown:4}[e.key];
 if(d){e.preventDefault();e.stopImmediatePropagation();
  const opp=menuPage==='opponent',i=CHARACTERS.findIndex(c=>c.id===(opp?dummyChar:selectedCharacter)),n=Math.max(0,Math.min(CHARACTERS.length-1,i+d));
  if(opp)dummyChar=CHARACTERS[n].id;else selectedCharacter=CHARACTERS[n].id;charPage=Math.floor(n/CHAR_PER_PAGE);renderCharacter();return}
 if(e.key==='Enter'||e.key.toLowerCase()==='z'){e.preventDefault();e.stopImmediatePropagation();showMenu(menuPage==='opponent'?'stage':'opponent')}
},true);
