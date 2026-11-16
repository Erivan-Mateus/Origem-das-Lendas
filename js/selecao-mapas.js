// ===== V3.3: seleção de mapa orientada a dados =====// Para adicionar um mapa novo: acrescente um objeto em STAGES (id, name, desc, img).

const STAGE_PER_PAGE=6,STAGE_PAGES=Math.max(1,Math.ceil(STAGES.length/STAGE_PER_PAGE));            // a arte tem 6 janelas e 3 pontinhos
// Retângulos (x,y,largura,altura) em pixels da arte 1920x1080, medidos nas janelas transparentes.
const SX_SLOTS=[[137,227,352,200],[543,227,353,200],[137,477,353,191],[544,477,352,191],[138,716,352,179],[544,716,353,179]];
const SX_PREVIEW=[986,218,810,449],SX_NAME=[1128,653,524,75],SX_DESC=[1005,752,780,98];
const SX_DOTS=[[890,989],[939,989],[987,989]],SX_BACK=[60,922,317,124],SX_OK=[1480,922,378,124];

let stagePage=0;
// O precipício está NA TERRA do cenário, não na borda lateral da tela.
// A quina da plataforma é visível a aproximadamente x=785 no canvas de 960px.
const STAGE_CLIFF_LEDGE_X=785;
const STAGE_CLIFF_REAPPEAR_X=125;
const STAGE_CLIFF_FALL_DEPTH=95; // distância vertical percorrida antes do teleporte
let playerCliffFalling=false;
function stageHazardDamage(id=selectedStage){
 return id==='cliff-edge'?25:id==='cliff-contaminated'?50:0;
}
function playerCliffDropBegin(){
 if(!stageHazardDamage()||playerCliffFalling||y<floor-1||x<STAGE_CLIFF_LEDGE_X||!fightLive())return;
 playerCliffFalling=true;
 vy=Math.max(2.2,vy); // começa a descer antes de sofrer dano
 walk=0;charging=false;
 action='';actionUntil=0;
 if(pendingShot){clearTimeout(pendingShot);pendingShot=null}
}
function playerCliffDropTick(){
 if(!playerCliffFalling||y<floor+STAGE_CLIFF_FALL_DEPTH)return;
 const damage=stageHazardDamage();
 playerCliffFalling=false;
 x=STAGE_CLIFF_REAPPEAR_X;y=floor;vy=0;face=1;
 hp=clamp(hp-damage,0,maxHp);
 stunUntil=Math.max(stunUntil,clock+350);
 effects.push({x,y:y-165,t:650,label:'QUEDA -'+damage});
 if(hp===0)endRound(1);
}
function dummyCliffDropBegin(){
 if(!stageHazardDamage()||dummy.cliffFalling||dummy.x<STAGE_CLIFF_LEDGE_X||dummy.hp<=0||!fightLive())return;
 dummy.cliffFalling=true;dummy.cliffFallY=0;dummy.cliffFallVy=2.2;
 dummy.pend=null;dummy.actionUntil=0;dummy.attackAnim=0;
}
function dummyCliffDropTick(dt){
 if(!stageHazardDamage()||!fightLive())return;
 if(!dummy.cliffFalling)dummyCliffDropBegin();
 if(!dummy.cliffFalling)return;
 dummy.cliffFallY+=dummy.cliffFallVy*dt*60;
 dummy.cliffFallVy+=0.75*dt*60;
 if(dummy.cliffFallY<STAGE_CLIFF_FALL_DEPTH)return;
 dummy.cliffFalling=false;dummy.cliffFallY=0;dummy.cliffFallVy=0;
 dummy.x=STAGE_CLIFF_REAPPEAR_X;dummy.pend=null;
 hit(stageHazardDamage());
 effects.push({x:dummy.x,y:floor-195,t:600,label:'CAIU NO RIO'});
}
const sxPos=(r,b=0)=>`left:${(r[0]-b)/19.2}%;top:${(r[1]-b)/10.8}%;width:${(r[2]+2*b)/19.2}%;height:${(r[3]+2*b)/10.8}%`;

function renderStage(){
 const sel=STAGES.find(m=>m.id===selectedStage)||STAGES[0];selectedStage=sel.id;
 const BLEED=8; // a imagem entra 8px por baixo da moldura, assim nunca sobra fresta nos cantos arredondados
 let h='<div class="stageArt" aria-hidden="true"></div>';
 h+=`<div class="sx-img" style="${sxPos(SX_PREVIEW,BLEED)}"><img src="${sel.img}" alt="Prévia de ${sel.name}"></div>`;
 SX_SLOTS.forEach((r,i)=>{const m=STAGES[stagePage*STAGE_PER_PAGE+i];
  h+=m?`<div class="sx-img" style="${sxPos(r,BLEED)}"><img src="${m.img}" alt=""></div>`:`<div class="sx-img sx-empty" style="${sxPos(r,BLEED)}"></div>`;});
 SX_SLOTS.forEach((r,i)=>{const m=STAGES[stagePage*STAGE_PER_PAGE+i];
  h+=m?`<button class="sx-hit${m.id===sel.id?' sel':''}" style="${sxPos(r)}" data-slot="${m.id}" aria-pressed="${m.id===sel.id}" aria-label="Selecionar ${m.name}"><span class="sx-label">${m.name}</span></button>`
      :`<div class="sx-hit sx-locked" style="${sxPos(r)}"><span class="sx-label">Em breve</span></div>`;});
 h+=`<div class="sx-name" style="${sxPos(SX_NAME)}">${sel.name}</div><div class="sx-desc" style="${sxPos(SX_DESC)}">${sel.desc}</div>`;
 SX_DOTS.slice(0,Math.min(SX_DOTS.length,STAGE_PAGES)).forEach((d,i)=>{h+=`<button class="sx-dot${i===stagePage?' on':''}" style="${sxPos([d[0]-20,d[1]-20,40,40])}" data-dot="${i}" aria-label="Página ${i+1}" aria-current="${i===stagePage}"></button>`;});
 h+=`<button class="sx-btn" style="${sxPos(SX_BACK)}" data-next="opponent" aria-label="Voltar à seleção do manequim" title="Voltar"></button>`;
 h+=`<button class="sx-btn" style="${sxPos(SX_OK)}" data-next="play" aria-label="Confirmar mapa e iniciar partida" title="Confirmar"></button>`;
 content.innerHTML=h;
}
function applySelectedStage(){const m=STAGES.find(m=>m.id===selectedStage);if(m&&stageImage.src!==m.img)stageImage.src=m.img}
content.addEventListener('click',e=>{
 const slot=e.target.closest('[data-slot]');if(slot){selectedStage=slot.dataset.slot;renderStage();return}
 const dot=e.target.closest('[data-dot]');if(dot){stagePage=+dot.dataset.dot;renderStage();return}
});
// Teclado na tela de mapas: setas escolhem, Enter confirma (as setas não movem o boneco por trás do menu)
document.addEventListener('keydown',e=>{
 if(!menuOpen||menuPage!=='stage')return;
 const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-2,ArrowDown:2}[e.key];
 if(d){e.preventDefault();e.stopImmediatePropagation();
  const i=STAGES.findIndex(m=>m.id===selectedStage),n=Math.max(0,Math.min(STAGES.length-1,i+d));
  selectedStage=STAGES[n].id;stagePage=Math.floor(n/STAGE_PER_PAGE);renderStage();return}
 if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();startSelectedGame()}
},true);

content.addEventListener('click',e=>{const btn=e.target.closest('button[data-next]');if(!btn)return;if(btn.dataset.slot!==undefined){storySlotAction(btn.dataset.slot,btn.dataset.act);return}if(btn.dataset.mode)selectedMode=btn.dataset.mode;const next=btn.dataset.next;if(next==='story')storyMsg='';if(next==='mode'){showMenu('character');return}if(next==='play'){startSelectedGame();return}if(next==='resume'){resumeGame();return}if(next==='exit'){pausedAt=0;window.hasStarted=false;showMenu('home');return}showMenu(next)});
content.addEventListener('change',e=>{if(e.target.id==='effectsToggle')effectsEnabled=e.target.checked});
function startSelectedGame(){applySelectedStage();applyCharacterSpecs();pausedAt=0;window.hasStarted=true;dummyMode=selectedMode==='vs'?'attack':'idle';document.getElementById('dummyMode').value=dummyMode;x=240;y=floor;vy=0;face=1;refillLife();energy=0;roundTime=99;roundWins=[0,0];round=1;roundWinner=-1;hideEndOverlay();resetFighterState();dummy.flash=0;dummy.attackTimer=0;dummy.attackAnim=0;shots=[];effects=[];held.clear();menuOpen=false;overlay.classList.add('hidden');if(selectedMode==='vs'){roundState='intro';rsTimer=1.6;showBanner('ROUND 1',1.6)}else{roundState='fight';banner.t=0}}
// Botões da tela de fim de partida: Recomeçar / Escolher personagens / Menu
document.getElementById('endOverlay').addEventListener('click',e=>{const b=e.target.closest('[data-end]');if(!b)return;const a=b.dataset.end;
  if(a==='restart'){startSelectedGame();return}
  hideEndOverlay();pausedAt=0;window.hasStarted=false;banner.t=0;showMenu(a==='chars'?'character':'home')});
document.getElementById('menuButton').addEventListener('click',()=>{if(menuOpen&&window.hasStarted)resumeGame();else openPause()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();if(menuOpen&&window.hasStarted)resumeGame();else openPause()}},true);
showMenu('home');
