/* ULTIMATE — ESPANTALHO / REVOADA DO FIM
 * Apenas com a barra de vida vermelha (até 25 HP) e 100 de energia.
 * 15.000 ms, 100 corvos teleguiados surgindo de modo aleatório pelas bordas; 1,5 de dano cada (150 ao todo).
 * Funciona para P1, P2 humano e Espantalho controlado pela IA.
 */
const SCARE_ULT_DURATION = 15000;
const SCARE_ULT_COUNT = 100;
const SCARE_ULT_DAMAGE = 1.5;
// Entradas e velocidades individualizadas: sem grupos rígidos de 5.
// Cada luta sorteia novos tempos e trajetórias; todos os impactos ocorrem antes de 15s.
const SCARE_ULT_LAST_SPAWN = 12700;
const SCARE_ULT_MIN_FLIGHT = 520;
const SCARE_ULT_MAX_FLIGHT = 1900;
// Sons enviados pelo criador: risada contínua e explosão discreta em cada impacto.
const SCARE_LAUGH_SRC = 'audio/espantalho-risada.mp3';
const SCARE_EXPLOSION_SRC = 'audio/corvo-explosao.mp3';
const SCARE_EXPLOSION_VOLUME = .022; // 100 explosões: volume baixo mesmo quando ocorrem juntas
const SCARE_ULT_FRAMES = [1,2,3].map(n=>{
 const a=new Image();a.src=`personagens/espantalho/gigante-${n}.webp`;return a;
});
const SCARE_CROW_FRAMES = Array.from({length:12},(_,i)=>{
 const a=new Image();a.src=`personagens/espantalho/corvo-${String(i).padStart(2,'0')}.webp`;return a;
});
const scareUlts = {p1:null,p2:null};
function scareUltRed(side){
 const current=side==='p1'?selectedCharacter:dummyChar;
 const health=side==='p1'?hp:dummy.hp;
 return current==='scarecrow'&&health>0&&health<=LIFE.scarecrow[2];
}
function scareUltActive(side){const st=scareUlts[side];return !!st&&clock-st.start<SCARE_ULT_DURATION&&clock>=st.start}
function scareUltStart(side){
 if(!scareUltRed(side)||scareUltActive(side))return false;
 scareUltEnd(side);
 const flightPlan=scareUltCreateFlightPlan();
 const st={start:clock,spawned:0,hit:0,crows:[],explosions:[],
  flightPlan,impactPlan:[...flightPlan].sort((a,b)=>a.at-b.at),
  sound:null,laugh:null,booms:[]};
 scareUlts[side]=st;
 // Exatamente a mesma faixa da Ultimate 2 do Wesley; interrompida ao terminar 15s.
 if(soundOn){
  try {
   const a=new Audio('audio/jojo-wason-exploding.mp3');a.volume=.66;a.preload='auto';st.sound=a;
   const musicPlay=a.play();if(musicPlay&&musicPlay.catch)musicPlay.catch(()=>{});
   const laugh=new Audio(SCARE_LAUGH_SRC);laugh.preload='auto';laugh.loop=true; laugh.volume=.47;
   st.laugh=laugh;
   const laughPlay=laugh.play();if(laughPlay&&laughPlay.catch)laughPlay.catch(()=>{});
  } catch(err){console.warn('Áudio da ultimate do Espantalho:',err)}
 }
 effects.push({x:side==='p1'?x:dummy.x,y:floor-230,t:1300,label:'REVOADA DO FIM!'});
 zShake=Math.max(zShake,10);
 return true;
}
// Volume reduzido para preservar a clareza com vários corvos explodindo juntos.
function scareUltExplosionSound(st){
 if(!soundOn)return;
 try {
  const a=new Audio(SCARE_EXPLOSION_SRC);a.volume=SCARE_EXPLOSION_VOLUME;a.preload='auto';
  st.booms.push(a);
  a.addEventListener('ended',()=>{st.booms=st.booms.filter(b=>b!==a)},{once:true});
  const p=a.play();if(p&&p.catch)p.catch(()=>{});
 }catch(err){console.warn('Explosão do corvo:',err)}
}
function scareUltEnd(side){
 const st=scareUlts[side];if(!st)return;
 for(const a of [st.sound,st.laugh,...st.booms])if(a){try{a.pause();a.currentTime=0}catch(e){}}
 st.booms=[];
 scareUlts[side]=null;
}
function scareUltStopAll(){scareUltEnd('p1');scareUltEnd('p2')}
function scareUltPause(){
 for(const st of Object.values(scareUlts))if(st){
  for(const a of [st.sound,st.laugh,...st.booms])if(a&&!a.paused)a.pause();
 }
}
function scareUltResume(ms){
 for(const st of Object.values(scareUlts))if(st){
  st.start+=ms;
  if(soundOn)for(const a of [st.sound,st.laugh,...st.booms])if(a&&!a.ended){
   const p=a.play();if(p&&p.catch)p.catch(()=>{});
  }
 }
}
// Além dos quatro cantos, sorteia pontos distintos nas bordas da tela.
// Todas as origens ficam fora do canvas: não aparecem brotando do Espantalho.
function scareUltCrowOrigin(){
 const margin=45+Math.random()*65,edge=Math.floor(Math.random()*8);
 const jitter=60+Math.random()*190;
 switch(edge){
  case 0:return {x:-margin,y:-margin+jitter};                   // canto superior esquerdo
  case 1:return {x:960+margin,y:-margin+jitter};               // canto superior direito
  case 2:return {x:-margin,y:540+margin-jitter};               // canto inferior esquerdo
  case 3:return {x:960+margin,y:540+margin-jitter};            // canto inferior direito
  case 4:return {x:Math.random()*960,y:-margin};               // borda superior
  case 5:return {x:Math.random()*960,y:540+margin};            // borda inferior
  case 6:return {x:-margin,y:Math.random()*540};               // borda esquerda
  default:return {x:960+margin,y:Math.random()*540};           // borda direita
 }
}
// Um plano diferente a cada ativação: não usa mais horários fixos em blocos.
// A janela de lançamento + o voo máximo garantem 100 explosões até 14,7 segundos.
function scareUltCreateFlightPlan(){
 return Array.from({length:SCARE_ULT_COUNT},(_,i)=>{
  const born=100+Math.random()*SCARE_ULT_LAST_SPAWN;
  const flight=SCARE_ULT_MIN_FLIGHT+Math.random()*(SCARE_ULT_MAX_FLIGHT-SCARE_ULT_MIN_FLIGHT);
  const origin=scareUltCrowOrigin();
  return {i,born,at:born+flight,x:origin.x,y:origin.y,
   pace:.62+Math.random()*1.28,
   curve:(Math.random()-.5)*260,
   phase:Math.random()*Math.PI*2};
 }).sort((a,b)=>a.born-b.born);
}
function scareUltTick(){
 for(const side of ['p1','p2']){
  const st=scareUlts[side];if(!st)continue;
  const elapsed=Math.max(0,clock-st.start);
  const target=side==='p1'?{x:dummy.x,y:P2_HUMAN()?P2S.y:floor}:{x,y};
  // Entradas individuais e imprevisíveis: às vezes 1, às vezes vários juntos.
  // Cada ave tem seu próprio tempo de voo, curva e velocidade de perseguição.
  while(st.spawned<SCARE_ULT_COUNT&&elapsed>=st.flightPlan[st.spawned].born){
   const plan=st.flightPlan[st.spawned++];
   st.crows.push({...plan,angle:0});
  }
  for(const c of st.crows){
   if(c.at<=elapsed)continue;
   const left=Math.max(1,c.at-elapsed);
   const flightProgress=Math.min(1,Math.max(0,(elapsed-c.born)/(c.at-c.born)));
   // Pequenas curvas laterais durante o voo, convergindo para o alvo no final.
   const baseDx=target.x-c.x,baseDy=target.y-90-c.y;
   const orbit=Math.sin(flightProgress*Math.PI)*c.curve*Math.sin(c.phase+flightProgress*2.2);
   const dist=Math.max(1,Math.hypot(baseDx,baseDy));
   const desiredX=target.x-(baseDy/dist)*orbit;
   const desiredY=target.y-90+(baseDx/dist)*orbit;
   const dx=desiredX-c.x,dy=desiredY-c.y;
   const blend=Math.min(1,Math.max(.028,(40*c.pace)/left));
   c.x+=dx*blend;c.y+=dy*blend;c.angle=Math.atan2(dy,dx);
  }
  // Cada corvo explode exatamente uma vez, mesmo com quadros demorados ou simultâneos.
  while(st.hit<SCARE_ULT_COUNT&&elapsed>=st.impactPlan[st.hit].at){
   const i=st.impactPlan[st.hit++].i;
   const px=target.x,py=target.y-94;
   st.explosions.push({x:px+(i%3-1)*11,y:py+((i%5)-2)*9,at:clock,i});
   zShake=Math.max(zShake,st.hit===SCARE_ULT_COUNT?14:3);
   // Evita 100 impactos de tela em cima dos efeitos exclusivos dos corvos.
   if(st.hit%5===1||st.hit===SCARE_ULT_COUNT)zImpacts.push({t:clock,x:px,y:py,k:st.hit===SCARE_ULT_COUNT?2:0});
   scareUltExplosionSound(st);
   if(side==='p1'){
    if(dummyMode!=='none'&&dummy.hp>0)hit(SCARE_ULT_DAMAGE,true,true);
   }else if(hp>0){aiHitPlayer(SCARE_ULT_DAMAGE,true,true)}
  }
  st.crows=st.crows.filter(c=>c.at>elapsed);
  st.explosions=st.explosions.filter(e=>clock-e.at<390);
  if(elapsed>=SCARE_ULT_DURATION){
   scareUltEnd(side);
   if(side==='p1'&&action==='mega'){action='';actionUntil=clock}
   if(side==='p2'){
    if(P2_HUMAN()&&P2S.action==='mega'){P2S.action='';dummy.p2Action=''}
    dummy.actionUntil=Math.min(dummy.actionUntil,clock);
   }
   // Não cortar a animação quando o alvo perde toda a vida antes do 100º corvo.
   if(selectedMode==='vs'&&roundState==='fight'){
    if(dummy.hp===0)endRound(0);
    else if(hp===0)endRound(1);
   }
  }
 }
}
function scareUltDrawGiant(ctx,side){
 const st=scareUlts[side];if(!st)return false;
 const elapsed=Math.max(0,clock-st.start);
 if(elapsed>=SCARE_ULT_DURATION)return false;
 const fi=elapsed<350?0:elapsed<800?1:2;
 const im=SCARE_ULT_FRAMES[fi];if(!im.complete||!im.naturalWidth)return false;
 const intro=Math.min(1,elapsed/900),grow=intro*intro*(3-2*intro);
 const height=155+grow*185+Math.sin(elapsed/180)*3;
 const width=height*im.naturalWidth/im.naturalHeight;
 ctx.save();ctx.shadowColor='#a739ff';ctx.shadowBlur=26;
 ctx.globalAlpha=Math.min(1,.25+elapsed/220);
 ctx.drawImage(im,-width/2,-height,width,height);
 ctx.restore();return true;
}
function scareUltDrawFX(ctx){
 const all=Object.entries(scareUlts).filter(([,st])=>st);
 if(!all.length)return;
 ctx.save();
 for(const [side,st] of all){
  const elapsed=clock-st.start;
  // Enquadramento escurecido e aura púrpura; primeiro quadro e último têm fade suave.
  const a=Math.min(.34,.34*Math.min(1,elapsed/550,(SCARE_ULT_DURATION-elapsed)/550));
  ctx.fillStyle=`rgba(20,6,41,${Math.max(0,a)})`;ctx.fillRect(0,0,960,540);
  const caster=side==='p1'?x:dummy.x;
  const r=140+Math.sin(elapsed/240)*12;
  let glow=ctx.createRadialGradient(caster,floor-140,10,caster,floor-140,r);
  glow.addColorStop(0,'rgba(200,55,255,.15)');glow.addColorStop(1,'rgba(100,0,190,0)');
  ctx.fillStyle=glow;ctx.fillRect(caster-r,floor-140-r,r*2,r*2);
 }
 ctx.restore();
 // Corvos por cima dos lutadores: cada quadro das asas vem do atlas enviado.
 for(const [,st] of all){
  for(const c of st.crows){
   const img=SCARE_CROW_FRAMES[Math.floor((clock-st.start-c.born)/75)%SCARE_CROW_FRAMES.length];
   ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.angle);ctx.shadowColor='#e14cff';ctx.shadowBlur=9;
   if(img?.complete&&img.naturalWidth){const w=64,h=w*img.naturalHeight/img.naturalWidth;ctx.drawImage(img,-w/2,-h/2,w,h)}
   else {ctx.fillStyle='#211024';ctx.beginPath();ctx.ellipse(0,0,22,12,0,0,Math.PI*2);ctx.fill()}
   ctx.restore();
  }
  for(const e of st.explosions){
   const t=(clock-e.at)/390,r=12+t*62;
   ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,1-t);
   const gr=ctx.createRadialGradient(e.x,e.y,1,e.x,e.y,r);
   gr.addColorStop(0,'#fff7cb');gr.addColorStop(.25,'#ffae40');gr.addColorStop(.6,'#dc49ff');gr.addColorStop(1,'rgba(123,3,201,0)');
   ctx.fillStyle=gr;ctx.beginPath();ctx.arc(e.x,e.y,r,0,Math.PI*2);ctx.fill();ctx.restore();
  }
 }
 // A cena permanece limpa: sem texto de quantidade de corvos ou cronômetro.
}
