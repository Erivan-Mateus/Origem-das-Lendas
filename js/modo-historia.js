// ===== MODO HISTÓRIA =====
// Para criar uma fase nova: acrescente um objeto em FASES. Cada fase é uma lista de "passos":
//   {t:'titulo', texto}                         cartão de título (ex.: FASE 1)
//   {t:'fala', quem, texto}                     balão de fala com o desenho de quem fala (veja FALANTES)
//   {t:'andar', dir:-1|1, ate:X, vel}           Zusk anda sozinho até a posição X (pixels do canvas 960x540)
//   {t:'dormir', seg}                           Zusk se agacha e dorme (Zzz)
//   {t:'transicao', palco, x, face, escuro, golem:X}
//                                               escurece, troca de mapa, reposiciona o Zusk (acorda) e clareia;
//                                               "escuro" = segundos de tela preta; "golem" = coloca o Golem em X
//   {t:'esperar', seg}                          pausa
//   {t:'luta', oponente:'scarecrow'|'wesley'|'golem', oponenteX, etapa:1|2} — uma luta única por confronto
//   {t:'entrada',quem:'wesley',de,ate,vel}     Wesley entra caminhando no milharal
//   {t:'retomar',oponente:'wesley'}            retorna ao combate após a derrota
//   {t:'ressurgir', seg}                       Golem levanta com 500 de vida vermelha
//   {t:'rugido', seg}                          toca audio e exibe grito, sincronizado com o som
//   {t:'desmaio'|'acordar'|'corrida'|'emboscada'|'soco'|'queda'}  cena cinematográfica após a derrota da luta 2
//   {t:'fim', texto}                            conclui a fase, salva o progresso e volta ao menu
// "palco" usa os ids de js/mapas.js (forest, cliff-edge, forest-danger...).
// FALANTES: nome, retrato e onde o balão fica ('zusk' = em cima do Zusk, 'golem' = em cima do Golem/Doutor).
const FALANTES={
 zusk:{nome:'ZUSK',retrato:'personagens/zusk/retrato.webp',ancora:'zusk',topo:21},
 doutor:{nome:'DOUTOR DEUTORONIO',retrato:'personagens/doutor/retrato.webp',ancora:'golem',topo:3},
 golem:{nome:'GOLEM ROXO',retrato:'personagens/golem-roxo/retrato.webp',ancora:'golem',topo:3},
 espantalho:{nome:'ESPANTALHO',retrato:'personagens/espantalho/retrato.webp',ancora:'scarecrow',topo:6},
 wesley:{nome:'WESLEY MAFIOSO',retrato:'personagens/wesley-mafioso/retrato.webp',ancora:'wesley',topo:4},
 voz:{nome:'VOZ AO LONGE',retrato:null,ancora:'wesley',topo:8}
};
const FASES=[
 {id:1,palco:'cliff-edge',inicio:{x:330,face:1},passos:[
  {t:'titulo',texto:'FASE 1'},
  {t:'esperar',seg:.6},
  {t:'fala',quem:'zusk',texto:'Mas que floresta linda! Eu sou tão feliz!'},
  {t:'andar',dir:-1,ate:70,vel:150},
  {t:'transicao',palco:'forest',x:110,face:1},
  {t:'esperar',seg:.6},
  {t:'dormir',seg:3},
  // a tela fica escura... e ele acorda na Floresta Serena em Perigo, com o Doutor e o Golem
  {t:'transicao',palco:'forest-danger',x:250,face:1,escuro:1.6,golem:730},
  {t:'esperar',seg:.8},
  {t:'fala',quem:'zusk',texto:'Mas o que é isso?'},
  {t:'fala',quem:'doutor',texto:'EU SOU O DOUTOR DEUTORONIO! MUAHAHAHA!'},
  {t:'fala',quem:'zusk',texto:'Doutor quem?'},
  {t:'fala',quem:'doutor',texto:'Mate ele, meu Golem Roxo!'},
  {t:'fala',quem:'golem',texto:'Gurrr!'},
  {t:'luta',golemX:730,etapa:1},
  {t:'esperar',seg:.7},
  {t:'fala',quem:'zusk',texto:'Isso ae viu doutoutor torronio vc perdeu e minha floresta ta salva'},
  {t:'ressurgir',seg:2.5},
  {t:'rugido',quem:'golem',texto:'GAARRRRRBUUUUGAAAAA',seg:8.05},
  {t:'luta',golemX:730,etapa:2},
  // Vencendo o Golem de 500 HP, a fase também termina.
  {t:'fim',texto:'FASE 1 CONCLUÍDA'},
  // Derrota na segunda luta: fim narrativo canônico da Fase 1.
  {t:'desmaio',seg:2.5},
  {t:'transicao',palco:'forest-contaminated',x:145,face:1,escuro:1.3,fromBlack:true},
  {t:'acordar',seg:1.8},
  {t:'fala',quem:'zusk',texto:'A floresta... está toda roxa! Eu preciso sair daqui!'},
  {t:'corrida',ate:900,vel:370},
  {t:'transicao',palco:'cliff-contaminated',x:125,face:1,escuro:.45},
  {t:'corrida',ate:705,vel:350},
  {t:'emboscada',seg:1.15},
  {t:'soco',seg:1.05},
  {t:'queda',seg:2.6},
  {t:'fim',texto:'FIM DA FASE 1'}
 ]},
 {id:2,palco:'cornfield',inicio:{x:205,face:1},passos:[
  {t:'titulo',texto:'CAPÍTULO 2 · O MILHARAL'},
  // Depois da queda no final do capítulo anterior, Zusk desperta ao lado do espantalho imóvel.
  {t:'acordar',seg:2.2},
  {t:'esperar',seg:.4},
  {t:'fala',quem:'zusk',texto:'caralho, que merda, eu to com muita raivaaaaa, vou socar aquele espantalho totalmente normal e nada estranho ou desenhado em uma camada diferente do cenario'},
  {t:'fala',quem:'espantalho',texto:'QUE ISSOHMMM'},
  {t:'fala',quem:'zusk',texto:'eita lasquera'},
  {t:'fala',quem:'espantalho',texto:'agora vai apanhammmmm'},
  {t:'luta',oponente:'scarecrow',oponenteX:700},
  {t:'fala',quem:'espantalho',texto:'belezammmm vc é fortemmmmm'},
  {t:'fala',quem:'zusk',texto:'eu preciso da sua ajuda tem um homem vindo e ele vai destruir tudo! precisamos'},
  {t:'fala',quem:'voz',texto:'QUEM TA NA PORRA DO MEU MILHARAL? ISSO VIROU BORDEU PRA TER TANTA BAGUNÇA?'},
  {t:'entrada',quem:'wesley',de:1010,ate:690,vel:185},
  {t:'luta',oponente:'wesley',oponenteX:690},
  {t:'fala',quem:'zusk',texto:'me ajude porfavor me ajude'},
  {t:'fala',quem:'wesley',texto:'ta bão chara, vamos pra cidade da zenga!'},
  {t:'fim',texto:'CAPÍTULO 2 CONCLUÍDO'},
  // Rota alternativa para a derrota contra Wesley. Após as falas, recomeça só o confronto com ele.
  {t:'fala',quem:'zusk',texto:'MORRI',rota:'derrotaWesley'},
  {t:'fala',quem:'wesley',texto:'7.7.7 CARALHO'},
  {t:'titulo',texto:'DERROTA · TENTE NOVAMENTE'},
  {t:'retomar',oponente:'wesley'}
 ]}
];

(function(){
 let S=null,els=null;
 // Diagnóstico somente leitura para testar a progressão dos capítulos.
 window.storyState=()=>S?{slot:S.slot,phase:S.ph,index:S.i,step:S.step}:null;
 const wrap=document.getElementById('stageWrap');
 // Salva a configuração original do Golem para não alterar outros modos de jogo.
 const golemLifeOriginal=[...LIFE.golem];
 const bossLife={1:[10,20,20],2:[0,0,500]};
 // Capítulo 2: uma única chance (50%) de ativar Dama Rosa ao chegar a 30 HP.
 // A escolha fica fixa por tentativa; quando ela falha, Wesley pode ser nocauteado.
 window.storyWesleyForceUlt2=false;window.storyWesleyUlt2Triggered=false;
 window.storyWesleyUlt2Decided=false;window.storyWesleyUlt2Approved=false;
 window.storyDecideWesleyUlt2=function(){
  if(!window.storyWesleyForceUlt2)return false;
  if(!window.storyWesleyUlt2Decided){
   window.storyWesleyUlt2Decided=true;
   window.storyWesleyUlt2Approved=Math.random()<0.5;
  }
  return window.storyWesleyUlt2Approved;
 };
 function aplicarVidaChefe(etapa){
  LIFE.golem=[...bossLife[etapa]];
  window.storyBossPhase=etapa;
  dummyMax=lifeMax('golem');
  dummy.hp=dummyMax;
 }
 function iniciarCombate(p){
  const adversario=p.oponente||'golem';
  window.storyWesleyForceUlt2=adversario==='wesley';window.storyWesleyUlt2Triggered=false;
  window.storyWesleyUlt2Decided=false;window.storyWesleyUlt2Approved=false;
  if(adversario==='golem')aplicarVidaChefe(p.etapa||1);
  else window.storyBossPhase=0;
  selectedMode='vs';vsOpponent='ai';dummyChar=adversario;WINS_NEEDED=1;
  setLock(false);
  startSelectedGame();
  dummy.x=p.oponenteX||p.golemX||730;
  dummy.storyPose=null;dummy.storyRise=0;
  window.storyProp=null;
  window.storyHideHud=false;
 }
 // Se o sorteio permitir, ativa Dama Rosa apenas uma vez nessa tentativa.
 window.storyTriggerWesleyUlt2=function(){
  if(!S||!S.step||S.step.t!=='luta'||S.step.oponente!=='wesley'||
     !window.storyWesleyForceUlt2||window.storyWesleyUlt2Triggered||dummy.hp<=0||dummy.hp>30)return false;
  if(!window.storyDecideWesleyUlt2())return false;
  dummy.energy=100;dummy.pend=null;dummy.stunUntil=0;dummy.actionUntil=0;
  if(typeof wesleyDummyCancel==='function')wesleyDummyCancel();
  const started=typeof wesleyDummyStart==='function'&&wesleyDummyStart('mega');
  if(started){
   window.storyWesleyUlt2Triggered=true;
   dummy.energy=0;effects.push({x:dummy.x,y:floor-200,t:1200,label:'DAMA ROSA!'});zShake=Math.max(zShake,7);
  }
  return !!started;
 };
 function build(){
  if(els)return;
  const mk=(id,html)=>{const d=document.createElement('div');d.id=id;if(html)d.innerHTML=html;wrap.appendChild(d);return d};
  els={fade:mk('storyFade'),title:mk('storyTitle'),zzz:mk('storyZzz','<b>Z</b><b>z</b><b>z</b>'),
   impact:mk('storyImpact','PUM!'),balloon:mk('storyBalloon','<div class="sb-box"><div class="sb-face"><img alt=""></div><div class="sb-body"><b class="sb-name"></b><span class="sb-text"></span></div><i class="sb-next">▶</i></div><div class="sb-tail"></div>')};
  els.balloon.addEventListener('pointerdown',e=>{e.preventDefault();avancar()});
  for(const f of Object.values(FALANTES))(new Image()).src=f.retrato;
 }
 const pct=(px)=>(px/960*100);
 function esconder(){if(!els)return;els.balloon.classList.remove('on');els.title.classList.remove('on');els.zzz.classList.remove('on');els.impact.classList.remove('on');els.fade.style.opacity=0}
 function setLock(v){window.storyLock=v;window.storyHideHud=v}
 function mostrarTitulo(txt){els.title.textContent=txt;els.title.classList.toggle('long',txt.length>17);els.title.classList.add('on');els.title.style.animation='none';void els.title.offsetWidth;els.title.style.animation=''}

 // Chamado por storySlotAction (jogo.js) ao escolher Começar / Continuar em um save.
 window.storyPlay=function(slot,cap){
  const fase=FASES.find(f=>f.id===cap);
  if(!fase){openStoryMap(slot,'Save '+(slot+1)+': a Fase '+cap+' ainda está em construção.');return}
  build();
  WINS_NEEDED=2;window.storyProp=null;window.storyBossPhase=0;window.storyZuskFaint=0;window.storyZuskSpin=0;window.storyCinematicFall=false;
  window.storyWesleyForceUlt2=false;window.storyWesleyUlt2Triggered=false;
  window.storyWesleyUlt2Decided=false;window.storyWesleyUlt2Approved=false;
  selectedMode='story';selectedCharacter='zusk';selectedStage=fase.palco;
  startSelectedGame();                       // reaproveita a preparação normal da partida
  dummyMode='none';document.getElementById('dummyMode').value='none';
  x=fase.inicio.x;face=fase.inicio.face;y=floor;vy=0;
  for(const p of fase.passos)if(p.t==='transicao'){const m=STAGES.find(m=>m.id===p.palco);if(m)(new Image()).src=m.img}
  S={slot,fase,i:-1,step:null,t:0,ph:0,chars:0,pronta:false,dorme:false};
  if(fase.id===2){window.storyProp={scarecrow:{x:690}};window.storyZuskFaint=1;}
  setLock(true);esconder();proximo();
 };
 window.storyAbort=function(){
  if(!S&&!window.storyLock)return;
  S=null;setLock(false);esconder();held.delete('crouch');WINS_NEEDED=2;window.storyProp=null;
  LIFE.golem=[...golemLifeOriginal];window.storyBossPhase=0;
  window.storyWesleyForceUlt2=false;window.storyWesleyUlt2Triggered=false;
  window.storyWesleyUlt2Decided=false;window.storyWesleyUlt2Approved=false;
  dummy.storyPose=null;dummy.storyRise=0;window.storyZuskFaint=0;window.storyZuskSpin=0;window.storyCinematicFall=false;
 };

 function proximo(){
  if(!S)return;S.i++;S.t=0;S.ph=0;
  const p=S.fase.passos[S.i];S.step=p;
  if(!p){const slot=S.slot;storyAbort();openStoryMap(slot);return}
  if(p.t==='retomar'){
   const ix=S.fase.passos.findIndex(q=>q.t==='luta'&&q.oponente===p.oponente);
   if(ix<0){console.error('História: combate para reinício não encontrado',p.oponente);return}
   S.i=ix-1;proximo();return;
  }
  if(p.t==='titulo'||p.t==='fim')mostrarTitulo(p.texto);
  if(p.t==='entrada'){
   window.storyProp={scarecrow:{x:865},wesley:{x:p.de,walk:true}};
  }
  if(p.t==='dormir'){S.dorme=true;els.zzz.style.left=pct(x+10)+'%';els.zzz.classList.add('on')}
  if(p.t==='ressurgir'){
   aplicarVidaChefe(2);
   dummy.storyPose='rise';dummy.storyRise=0;dummy.flash=0;
   window.storyHideHud=false;roundTime=99;
   shots=[];eshots=[];
  }
  if(p.t==='desmaio'){
   setLock(true);window.storyZuskFaint=0;window.storyZuskSpin=0;
   window.storyProp={golem:{x:dummy.x}};dummyMode='none';
   hp=0;held.clear();shots=[];eshots=[];banner.t=0;
  }
  if(p.t==='acordar'){window.storyZuskFaint=1;els.fade.style.opacity=1;}
  if(p.t==='emboscada'){
   face=-1;walk=0;window.storyProp={golem:{x:225,atk:false,p:0}};
  }
  if(p.t==='soco'){
   S.hitDone=false;window.storyZuskFaint=0;window.storyZuskSpin=0;
   window.storyProp={golem:{x:565,atk:true,p:0}};
  }
  if(p.t==='queda'){
   window.storyCinematicFall=true;S.fallY=y;S.fallX=x;S.fallV=80;
   els.impact.classList.remove('on');window.storyProp={golem:{x:565,atk:false,p:0}};
  }
  if(p.t==='rugido'){
   if(typeof playSnd==='function')playSnd('golemRoar',.95);
   zShake=Math.max(zShake,9);dummy.storyPose=null;
  }
  if(p.t==='fala'||p.t==='rugido'){
   const f=FALANTES[p.quem]||{nome:'',retrato:'',ancora:'zusk',topo:21};
   const prop=window.storyProp&&window.storyProp[f.ancora];
   const ax=f.ancora==='zusk'?x:prop?prop.x:dummyMode!=='none'?dummy.x:785;
   const img=els.balloon.querySelector('img');img.hidden=!f.retrato;if(f.retrato)img.src=f.retrato;
   els.balloon.querySelector('.sb-face').classList.toggle('mystery',!f.retrato);
   els.balloon.querySelector('.sb-name').textContent=f.nome;
   els.balloon.querySelector('.sb-text').textContent='';
   els.balloon.classList.remove('done');
   els.balloon.classList.toggle('roar',p.quem==='golem'&&window.storyBossPhase===2);
   const bw=Math.min(560,960-40),left=clamp(ax-bw/2,20,960-bw-20);
   els.balloon.style.left=pct(left)+'%';els.balloon.style.width=pct(bw)+'%';els.balloon.style.top=f.topo+'%';
   els.balloon.style.setProperty('--tail',clamp((ax-left)/bw*100,8,92)+'%');
   els.balloon.classList.add('on');S.chars=0;S.pronta=false;
   if(p.t==='rugido'){els.balloon.querySelector('.sb-text').textContent=p.texto;els.balloon.classList.add('done');S.pronta=true;}
  }
 }
 function avancar(){
  if(!S||!S.step||S.step.t!=='fala')return;
  if(!S.pronta){S.chars=S.step.texto.length;return}
  els.balloon.classList.remove('on');proximo();
 }
 window.storyHook=function(dt){
  if(!S)return;
  const p=S.step;if(!p)return;
  if(S.dorme)held.add('crouch');else if(p.t!=='luta')held.delete('crouch');
  switch(p.t){
   case 'titulo':S.t+=dt;if(S.t>=2.2){els.title.classList.remove('on');proximo()}break;
   case 'esperar':S.t+=dt;if(S.t>=p.seg)proximo();break;
   case 'dormir':S.t+=dt;if(S.t>=p.seg){els.zzz.classList.remove('on');proximo()}break;
   case 'fala':{
    const tx=p.texto;S.chars=Math.min(tx.length,S.chars+dt*30);
    els.balloon.querySelector('.sb-text').textContent=tx.slice(0,Math.floor(S.chars));
    if(S.chars>=tx.length&&!S.pronta){S.pronta=true;els.balloon.classList.add('done')}
    break}
   case 'rugido':{
    S.t+=dt;zShake=Math.max(zShake,3+3*Math.sin(S.t*13)**2);
    if(S.t>=p.seg){els.balloon.classList.remove('on');proximo()}
    break}
   case 'desmaio':{
    S.t+=dt;window.storyZuskFaint=clamp(S.t/.75,0,1);
    // Apaga a cena depois de o Zusk tombar inconsciente.
    els.fade.style.opacity=clamp((S.t-1.05)/1.4,0,1);
    if(S.t>=p.seg)proximo();break}
   case 'entrada':{
    S.t+=dt;
    const prop=window.storyProp&&window.storyProp.wesley;
    if(prop){prop.x=Math.max(p.ate,prop.x-(p.vel||180)*dt);prop.walk=true;
     if(prop.x<=p.ate){prop.x=p.ate;prop.walk=false;proximo();}}
    else proximo();
    break}
   case 'acordar':{
    S.t+=dt;
    els.fade.style.opacity=clamp(1-S.t/1.25,0,1);
    window.storyZuskFaint=clamp(1-(S.t-.45)/1.1,0,1);
    if(S.t>=p.seg){window.storyZuskFaint=0;els.fade.style.opacity=0;proximo()}
    break}
   case 'corrida':{
    const v=p.vel||350;x=Math.min(p.ate,x+v*dt);face=1;
    walk+=(dt*11)*(v/250);S.t+=dt;
    if(x>=p.ate){walk=0;proximo()}
    break}
   case 'emboscada':{
    S.t+=dt;const q=clamp(S.t/p.seg,0,1);
    window.storyProp.golem.x=225+340*(q*q*(3-2*q));
    if(S.t>=p.seg)proximo();break}
   case 'soco':{
    S.t+=dt;const q=clamp(S.t/p.seg,0,1);
    window.storyProp.golem.atk=true;window.storyProp.golem.p=q;
    if(q>=.42&&!S.hitDone){
     S.hitDone=true;playSnd('punch',1);zShake=Math.max(zShake,22);
     els.impact.classList.add('on');x+=42;y=floor-15;
     face=-1;window.storyZuskSpin=.16;
    }
    if(S.hitDone){
     x=Math.min(850,x+340*dt);
     y=floor-15-45*Math.sin((q-.42)/.58*Math.PI);
     window.storyZuskSpin=clamp((q-.42)/.58,0,1)*.95;
    }
    if(q>=1){els.impact.classList.remove('on');proximo()}
    break}
   case 'queda':{
    S.t+=dt;
    S.fallV+=720*dt;S.fallY+=S.fallV*dt;S.fallX+=150*dt;
    x=S.fallX;y=S.fallY;face=-1;
    window.storyZuskSpin=1+S.t*2.5;
    els.fade.style.opacity=clamp((S.t-1.65)/.8,0,1);
    if(S.t>=p.seg){window.storyCinematicFall=false;proximo()}
    break}
   case 'ressurgir':{
    S.t+=dt;
    dummy.storyRise=clamp(S.t/(p.seg||2.2),0,1);
    zShake=Math.max(zShake,1+4*dummy.storyRise);
    if(S.t>=p.seg){dummy.storyPose=null;dummy.storyRise=1;proximo()}
    break}
   case 'andar':{
    const v=p.vel||150;face=p.dir;x+=p.dir*v*dt;walk=(S.t+=dt)*11*(v/250);
    if((p.dir<0&&x<=p.ate)||(p.dir>0&&x>=p.ate)){x=p.ate;walk=0;proximo()}
    break}
   case 'transicao':{
    S.t+=dt;const D=.6;
    if(S.ph===0){els.fade.style.opacity=p.fromBlack?1:Math.min(1,S.t/D);if(S.t>=D){
      const m=STAGES.find(m=>m.id===p.palco);selectedStage=p.palco;if(m)stageImage.src=m.img;
      S.dorme=false;held.delete('crouch');els.zzz.classList.remove('on');
      window.storyProp=p.golem?{golem:{x:p.golem}}:null;
      x=p.x;face=p.face;y=floor;vy=0;S.ph=1;S.t=0}}
    else if(S.ph===1){if(stageImage.complete&&stageImage.naturalWidth&&S.t>(p.escuro==null?.15:p.escuro)){S.ph=2;S.t=0}}
    else{els.fade.style.opacity=p.fromBlack?1:Math.max(0,1-S.t/D);if(S.t>=D){els.fade.style.opacity=p.fromBlack?1:0;proximo()}}
    break}
   case 'luta':{
    if(S.ph===0){
     S.ph=1;window.storyProp=null;
     iniciarCombate(p);
    }
    break}
   case 'fim':{
    S.t+=dt;
    if(S.t>=2.8){
     els.title.classList.remove('on');
     const sl=storyLoad(),f=S.fase;
     if(sl[S.slot]){sl[S.slot].chapter=Math.max(sl[S.slot].chapter||1,f.id+1);sl[S.slot].updated=Date.now();storySave(sl)}
     storyMsg='Save '+(S.slot+1)+': Fase '+f.id+' concluída! Progresso salvo.';
     const slot=S.slot,notice=storyMsg;storyAbort();pausedAt=0;window.hasStarted=false;openStoryMap(slot,notice)}
    break}
  }
 };
 // Capítulo 1: perder a segunda luta gera a queda no penhasco.
 // Capítulo 2: perder para o Espantalho reinicia a luta; perder para Wesley
 // executa os dois diálogos de derrota e só depois reinicia Wesley.
 window.storyMatchEnd=function(pw){
  if(!S||!S.step||S.step.t!=='luta')return false;
  const p=S.step,adversario=p.oponente||'golem';
  // Registra a vitória sobre cada personagem secreto no momento exato do K.O. final.
  // Não libera ao apenas iniciar o capítulo, perder ou enfrentar o adversário no Versus.
  if(pw&&(adversario==='scarecrow'||adversario==='wesley'))unlockStoryCharacter(adversario);
  if(!pw&&adversario==='golem'&&p.etapa!==2)return false;
  matchOver=false;banner.t=0;shots=[];eshots=[];
  dummy.pend=null;dummy.actionUntil=0;dummy.attackAnim=0;
  if(pw&&adversario==='golem'){dummy.storyPose='fallen';dummy.storyRise=0;}
  action='';actionUntil=0;charging=false;held.clear();
  selectedMode='story';WINS_NEEDED=2;setLock(true);
  // O Golem precisa continuar visível enquanto cai e se levanta na transição de fases.
  // Outros inimigos viram personagens da cena, sem IA durante os diálogos.
  if(adversario!=='golem'){dummyMode='none';document.getElementById('dummyMode').value='none';}
  if(adversario==='scarecrow')window.storyProp={scarecrow:{x:690}};
  else if(adversario==='wesley')window.storyProp={scarecrow:{x:870},wesley:{x:690}};
  if(!pw){
   if(adversario==='golem'){
    const ix=S.fase.passos.findIndex(q=>q.t==='desmaio');
    if(ix>=0)S.i=ix-1;
   }else if(adversario==='scarecrow'){
    S.i--; // retoma esta luta; o progresso do save é preservado
   }else if(adversario==='wesley'){
    const ix=S.fase.passos.findIndex(q=>q.rota==='derrotaWesley');
    if(ix>=0)S.i=ix-1;
   }
  }
  proximo();return true;
 };

 // Botão Recomeçar após uma derrota: tenta novamente a etapa atual da batalha.
 window.storyRetryBattle=function(){
  if(!S||!S.step||S.step.t!=='luta')return false;
  iniciarCombate(S.step);
  return true;
 };

 // Enter / Espaço / Z avançam o diálogo (antes de qualquer outro tratador de teclado)
 document.addEventListener('keydown',e=>{
  if(!S||menuOpen||!S.step||S.step.t!=='fala')return;
  if(e.key==='Enter'||e.key===' '||e.key.toLowerCase()==='z'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)avancar()}
 },true);
 // Ao sair para qualquer menu, a cena é encerrada
 const _showMenu=showMenu;
 showMenu=function(page){if(page==='home'||page==='character'||page==='stage'||page==='mode'||page==='opponent'||page==='vsmode')storyAbort();return _showMenu(page)};
})();
