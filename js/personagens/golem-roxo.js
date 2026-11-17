// Golem Roxo (chefe da Fase 1) — arte única; as animações são feitas por código (respirar, avançar, tremer).
const GOLEM_SPRITE='personagens/golem-roxo/sprite.webp';
const GOLEM_FACE='personagens/golem-roxo/retrato.webp';
const golemImg=new Image();golemImg.src=GOLEM_SPRITE;
const golemPortrait=new Image();golemPortrait.src=GOLEM_FACE;
const GOLEM_H=340;          // altura na tela (px do canvas 960x540)
const GOLEM_REACH=45;       // alcance extra dos golpes
const GOLEM_DMG=2;          // multiplicador de dano
const GOLEM_SPEED=110;
// Animação da martelada (5 quadros fornecidos pelo autor: preparação, erguer, impacto e recuperação).
const GOLEM_HAMMER_DURATION=1.05; // segundos, com colisão no quadro de impacto
const GOLEM_HAMMER_SCALE=.73;
const golemHammerImg=new Image();golemHammerImg.src='personagens/golem-roxo/martelada-jogo.webp';
// Coordenadas no PNG 1536x1024 e âncora na região dos pés, para não saltar entre poses.
const GOLEM_HAMMER_FRAMES=[
 {x:0,y:0,w:512,h:512,ax:235,base:480},
 {x:512,y:0,w:512,h:512,ax:258,base:481},
 {x:1024,y:0,w:512,h:512,ax:253,base:482},
 {x:0,y:512,w:550,h:512,ax:220,base:468},
 {x:550,y:512,w:500,h:512,ax:238,base:470}
];
function golemHammerFrame(progress){
 if(progress<.11)return 0;
 if(progress<.31)return 1;
 if(progress<.62)return 2;
 if(progress<.81)return 3;
 return 4;
}
// Onda de poeira e tremor no instante em que o martelo toca o solo.
let golemHammerBursts=[];
function golemHammerImpact(){
 const dir=x>dummy.x?1:-1;
 golemHammerBursts.push({x:dummy.x+dir*130,t:clock});
 zShake=Math.max(zShake,7);
 if(typeof playSnd==='function')playSnd('kick');
}
function drawGolemHammerEffects(){
 golemHammerBursts=golemHammerBursts.filter(b=>clock-b.t<600);
 for(const b of golemHammerBursts){
  const a=clamp((clock-b.t)/600,0,1),fade=(1-a);
  g.save();
  g.strokeStyle=`rgba(255,223,185,${.65*fade})`;g.lineWidth=5*fade+1;
  g.beginPath();g.ellipse(b.x,floor-3,18+a*110,5+a*22,0,0,Math.PI*2);g.stroke();
  for(let i=0;i<7;i++){
   const side=(i%2?1:-1),spread=(24+i*14)*a;
   g.fillStyle=`rgba(231,200,167,${.65*fade})`;
   g.beginPath();g.arc(b.x+side*spread,floor-6-24*Math.sin(Math.PI*a)*(1+i%3*.2),Math.max(1,(11+i%3*3)*(1-a)),0,Math.PI*2);g.fill();
  }
  g.restore();
 }
}
      // velocidade de andar (px/s)
// gx = posição x; o = {fc:+1/-1 (lado do jogador), flash, atk, p (0..1 do ataque)}
function drawGolemAt(gx,o){
 o=o||{};if(!golemImg.complete||!golemImg.naturalWidth)return;
 const h=GOLEM_H,w=h*golemImg.naturalWidth/golemImg.naturalHeight;
 const fc=o.fc||(typeof x==='number'&&x>gx?1:-1),atk=!!o.atk,p=o.p||0,flash=!!o.flash;
 const breathe=1+Math.sin(performance.now()/520)*.012;
 g.save();g.fillStyle='rgba(16,24,39,.45)';g.beginPath();g.ellipse(Math.round(gx),floor+4,95,12,0,0,Math.PI*2);g.fill();g.restore();
 g.save();g.translate(Math.round(gx),floor+30);g.scale(-fc,1);
 const lunge=atk?Math.sin(p*Math.PI)*34:0,tilt=atk?.05*Math.sin(p*Math.PI):0,shake=flash?(Math.random()-.5)*8:0;
 g.translate(lunge+shake,0);g.rotate(tilt);g.scale(1,breathe);
 if(flash){g.shadowColor='#ffe58d';g.shadowBlur=22}
 g.drawImage(golemImg,-w/2,-h,w,h);
 g.restore();
}
// Sprites da luta: 4 quadros de andar (parado, passo, passo, passo). Mira para a direita.
const GOLEM_WALK='personagens/golem-roxo/andando.webp';
const golemWalk=new Image();golemWalk.src=GOLEM_WALK;
const GOLEM_SHEET={cw:319,ch:434,ax:157,base:376,cols:4,s:.95};
function drawGolemDummy(){
 if(!golemWalk.complete||!golemWalk.naturalWidth){return}
 const S=GOLEM_SHEET,flash=dummy.flash>0,atk=dummy.attackAnim>0;
 const hammering=atk&&dummy.atkName==='kick'&&golemHammerImg.complete&&golemHammerImg.naturalWidth>0;
 const p=atk?clamp(1-dummy.attackAnim/(hammering?GOLEM_HAMMER_DURATION:.32),0,.999):0;
 const fall=dummy.storyPose==='fallen'?1:dummy.storyPose==='rise'?1-clamp(dummy.storyRise||0,0,1):0;
 const rising=dummy.storyPose==='rise';
 // distância andada nesta luta define o quadro de caminhada
 const dx=Math.abs(dummy.x-(dummy._gx==null?dummy.x:dummy._gx));dummy._gx=dummy.x;
 if(dx>.05){dummy.gd=(dummy.gd||0)+dx;dummy.gwu=clock+140}
 const walking=!fall&&!rising&&!flash&&!atk&&clock<(dummy.gwu||0);
 const fi=walking?Math.floor((dummy.gd||0)/26)%4:0;
 const dir=x>dummy.x?1:-1;
 const breathe=(!flash&&!atk&&!walking)?1+Math.sin(clock/420)*.012:1;
 let lunge=0,tilt=0,shake=0;
 if(atk&&!hammering){const k=p<.4?-Math.sin(p/.4*Math.PI/2)*.1:Math.sin((p-.4)/.6*Math.PI)*.3;tilt=k;lunge=p<.4?-6*p/.4:Math.sin((p-.4)/.6*Math.PI)*46}
 if(flash)shake=(Math.random()-.5)*9;
 g.save();g.fillStyle='rgba(16,24,39,.45)';g.beginPath();g.ellipse(Math.round(dummy.x),floor+4,92,12,0,0,Math.PI*2);g.fill();g.restore();
 // Quando é derrotado, cai de lado. Na ressurreição, levanta progressivamente.
 if(rising){
  const power=clamp(dummy.storyRise||0,0,1),t=performance.now()/100;
  g.save();g.globalAlpha=.13+.24*power;
  const aura=g.createRadialGradient(dummy.x,floor-125,12,dummy.x,floor-125,170+50*power);
  aura.addColorStop(0,'#ffbac7');aura.addColorStop(.4,'#e03569');aura.addColorStop(1,'#b31c5500');
  g.fillStyle=aura;g.beginPath();g.arc(dummy.x,floor-125,170+50*power,0,Math.PI*2);g.fill();
  g.strokeStyle='#ff688d';g.lineWidth=2.5;
  for(let i=0;i<6;i++){
   const angle=i*Math.PI/3+t*.075,radius=67+power*85;
   g.beginPath();g.moveTo(dummy.x+Math.cos(angle)*30,floor-125+Math.sin(angle)*30);
   g.lineTo(dummy.x+Math.cos(angle+.12)*radius,floor-125+Math.sin(angle+.12)*radius);
   g.stroke();
  }
  g.restore();
 }
 g.save();g.translate(Math.round(dummy.x),floor+6);g.scale(dir,1);g.translate(lunge+shake,0);
 if(fall){g.translate(26*fall,0);g.rotate(1.28*fall);g.scale(1-.27*fall,1-.27*fall)}
 g.rotate(tilt);g.scale(1,breathe);
 if(flash){g.shadowColor='#ffe58d';g.shadowBlur=22}
 if(hammering){
  const f=GOLEM_HAMMER_FRAMES[golemHammerFrame(p)],s=GOLEM_HAMMER_SCALE;
  g.drawImage(golemHammerImg,f.x,f.y,f.w,f.h,-f.ax*s,-f.base*s,f.w*s,f.h*s);
 }else{
  g.drawImage(golemWalk,fi*S.cw,0,S.cw,S.ch,-S.ax*S.s,-S.base*S.s,S.cw*S.s,S.ch*S.s);
 }
 g.restore();
}
