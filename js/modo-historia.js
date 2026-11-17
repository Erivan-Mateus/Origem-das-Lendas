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
 voz:{nome:'VOZ AO LONGE',retrato:null,ancora:'wesley',topo:8},
 gogo:{nome:'GOGOGOLAIAFI',retrato:'personagens/gogogolaiafi/retrato.png',ancora:'gogo',topo:2},
 // Personagem reservado para o Capítulo 4. Não é exibida em nenhuma cena do Capítulo 3.
 gostosa:{nome:'GOSTOSA',retrato:'personagens/gostosa/retrato.png',ancora:'gostosa',topo:8}
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
 ,{id:3,palco:'city-normal',inicio:{x:175,face:1},passos:[
  {t:'titulo',texto:'CAPÍTULO 3 · CIDADE DA ZENGA'},
  {t:'fala',quem:'zusk',texto:'finalmente chegamos nessa porra'},
  {t:'fala',quem:'espantalho',texto:'cidade bonitammmmm'},
  {t:'fala',quem:'wesley',texto:'BEM VINDOS A CIDADE DA ZENGA CARALHO'},
  {t:'entradaGogo',de:1020,ate:745,vel:370},
  {t:'fala',quem:'gogo',texto:'QUEM COMEU MINHA TORRADAAAAAAAAAAAA'},
  {t:'fala',quem:'zusk',texto:'que porra é essa'},
  {t:'fala',quem:'gogo',texto:'FOI VOCÊ?????'},
  {t:'fala',quem:'zusk',texto:'eu nem te conheço desgraça'},
  {t:'fala',quem:'gogo',texto:'MINHA TORRADA SUMIU'},
  {t:'fala',quem:'espantalho',texto:'que tristeeeeeemmmmm'},
  {t:'fala',quem:'wesley',texto:'KKKKKKKKKKKKKKKKKKKKKK'},
  {t:'fala',quem:'gogo',texto:'EU VOU MATAR TODO MUNDO ATÉ ACHAR MINHA TORRADA'},
  {t:'fala',quem:'zusk',texto:'PORRA MAS É SÓ UMA TORRADA'},
  {t:'fala',quem:'gogo',texto:'SÓ UMA TORRADA?????????'},
  {t:'fala',quem:'zusk',texto:'ih fudeu'},
  {t:'luta',oponente:'gogo',lutador:'zusk',oponenteX:730},
  {t:'fala',quem:'zusk',texto:'pronto vai comprar outra torrada seu doente'},
  {t:'fala',quem:'gogo',texto:'...'},
  {t:'fala',quem:'gogo',texto:'minha...'},
  {t:'fala',quem:'zusk',texto:'hm?'},
  {t:'fala',quem:'gogo',texto:'MINHA TORRADAAAAAAAAAAAAA'},
  {t:'reviverGogo',seg:1.8},
  {t:'fala',quem:'gogo',texto:'GOGOGOLAIAFI EM FÚRIAAAAAAAAA'},
  {t:'fala',quem:'zusk',texto:'CARALHO NÃO É POSSÍVEL'},
  {t:'furiaUltimate',alvo:'zusk',seg:2.6},
  {t:'fala',quem:'zusk',texto:'AAAAAAAAAAAAAAAA'},
  {t:'fala',quem:'espantalho',texto:'ZUSKMMMMM'},
  {t:'fala',quem:'wesley',texto:'KKKKKKKKKKKKK O CARA MORREU POR CAUSA DE PÃO'},
  {t:'trocar',lutador:'scarecrow'},
  {t:'fala',quem:'espantalho',texto:'moçoooooommmm'},
  {t:'fala',quem:'gogo',texto:'O QUE VOCÊ QUER'},
  {t:'fala',quem:'espantalho',texto:'posso te dar outra torradammmmm'},
  {t:'fala',quem:'gogo',texto:'NÃO É A MESMA TORRADA'},
  {t:'fala',quem:'espantalho',texto:'mas é torradammmmm'},
  {t:'fala',quem:'gogo',texto:'VOCÊ NÃO ENTENDE'},
  {t:'fala',quem:'espantalho',texto:'entendommmmm'},
  {t:'fala',quem:'gogo',texto:'NÃO ENTENDE'},
  {t:'fala',quem:'espantalho',texto:'entendommmmm'},
  {t:'fala',quem:'gogo',texto:'AAAAAAAAAAAAAAAAA'},
  {t:'luta',oponente:'gogo',lutador:'scarecrow',oponenteX:730},
  {t:'fala',quem:'espantalho',texto:'ganheimmmmm'},
  {t:'fala',quem:'gogo',texto:'...'},
  {t:'fala',quem:'espantalho',texto:'tudo bemmmmm?'},
  {t:'fala',quem:'gogo',texto:'QUEM...'},
  {t:'fala',quem:'espantalho',texto:'ihmmmm'},
  {t:'fala',quem:'gogo',texto:'COMEU...'},
  {t:'fala',quem:'espantalho',texto:'nãooooooommmm'},
  {t:'fala',quem:'gogo',texto:'MINHA TORRADAAAAAAAAAAAAAAAAAAAAAAAA'},
  {t:'reviverGogo',seg:1.8},
  {t:'furiaUltimate',alvo:'scarecrow',seg:2.6},
  {t:'fala',quem:'espantalho',texto:'AAAAAAAAAAAAAAMMMMMMMMM'},
  {t:'fala',quem:'wesley',texto:'KKKKKKKKKKKKKKKKKKKKKK'},
  {t:'fala',quem:'wesley',texto:'CARALHO O CARA É UMA TORRADEIRA COM DEPRESSÃO'},
  {t:'trocar',lutador:'wesley'},
  {t:'fala',quem:'wesley',texto:'Ô MEU CHARAAAA'},
  {t:'fala',quem:'gogo',texto:'O QUE FOI AGORA'},
  {t:'fala',quem:'wesley',texto:'TU VAI PARAR COM ESSA PUTARIA OU NÃO?'},
  {t:'fala',quem:'gogo',texto:'SÓ QUANDO ENCONTRAR MINHA TORRADA'},
  {t:'fala',quem:'wesley',texto:'ENTÃO VEM CÁ QUE EU VOU TE DAR UMA SURRA EDUCATIVA'},
  {t:'fala',quem:'gogo',texto:'EU SOU INVENCÍVEL'},
  {t:'fala',quem:'wesley',texto:'E EU SOU O WESLEY MAFIOSO PORRA'},
  {t:'luta',oponente:'gogo',lutador:'wesley',oponenteX:730},
  {t:'fala',quem:'gogo',texto:'minha torrada...'},
  {t:'fala',quem:'wesley',texto:'caralho tu ainda tá nessa'},
  {t:'fala',quem:'gogo',texto:'era minha torrada favorita...'},
  {t:'fala',quem:'wesley',texto:'olha só meu chara'},
  {t:'aproximar',ate:530,vel:95},
  {t:'esperar',seg:.7},
  {t:'fala',quem:'wesley',texto:'você gostaria, por gentileza, de entrar para nossa equipe? 😊'},
  {t:'esperar',seg:1.2},
  {t:'fala',quem:'zusk',texto:'...'},
  {t:'fala',quem:'espantalho',texto:'...'},
  {t:'fala',quem:'gogo',texto:'...'},
  {t:'fala',quem:'zusk',texto:'QUE PORRA FOI ESSA WESLEY'},
  {t:'fala',quem:'wesley',texto:'CALA A BOCA CARALHO EU TÔ SENDO EDUCADO'},
  {t:'fala',quem:'gogo',texto:'você...'},
  {t:'fala',quem:'wesley',texto:'sim meu querido?'},
  {t:'fala',quem:'gogo',texto:'VOCÊ PEDIU COM CARINHO...'},
  {t:'fala',quem:'wesley',texto:'pedi sim meu amorzinho ❤️'},
  {t:'fala',quem:'zusk',texto:'MANO?????????'},
  {t:'fala',quem:'gogo',texto:'NINGUÉM NUNCA ME PEDIU NADA COM CARINHO'},
  {t:'chorarGogo',seg:1.6},
  {t:'fala',quem:'gogo',texto:'EU ACEITOOOOOOOOOOOOO'},
  {t:'fala',quem:'espantalho',texto:'QUE BONITOOOOOMMMMM'},
  {t:'fala',quem:'zusk',texto:'EU NÃO TÔ ENTENDENDO MAIS NADA'},
  {t:'fala',quem:'wesley',texto:'PRONTO PORRA RESOLVI'},
  {t:'levantarGogo',seg:1.3},
  {t:'fala',quem:'gogo',texto:'AGORA SOMOS AMIGOS PARA SEMPRE'},
  {t:'fala',quem:'wesley',texto:'tá bom chara'},
  {t:'fala',quem:'gogo',texto:'MAS SE ALGUÉM COMER MINHA TORRADA...'},
  {t:'fala',quem:'wesley',texto:'NINGUÉM VAI COMER SUA TORRADA CARALHO'},
  {t:'fala',quem:'gogo',texto:'tá bom ❤️'},
  {t:'fim',texto:'CAPÍTULO 3 CONCLUÍDO'}
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
  if(p.lutador)selectedCharacter=p.lutador;
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
  WINS_NEEDED=2;window.storyProp=null;window.storyGogoUltimate=null;window.storyGogoRage=false;window.storyBossPhase=0;window.storyZuskFaint=0;window.storyZuskSpin=0;window.storyCinematicFall=false;
  window.storyWesleyForceUlt2=false;window.storyWesleyUlt2Triggered=false;
  window.storyWesleyUlt2Decided=false;window.storyWesleyUlt2Approved=false;
  selectedMode='story';selectedCharacter='zusk';selectedStage=fase.palco;
  startSelectedGame();                       // reaproveita a preparação normal da partida
  dummyMode='none';document.getElementById('dummyMode').value='none';
  x=fase.inicio.x;face=fase.inicio.face;y=floor;vy=0;
  for(const p of fase.passos)if(p.t==='transicao'){const m=STAGES.find(m=>m.id===p.palco);if(m)(new Image()).src=m.img}
  S={slot,fase,i:-1,step:null,t:0,ph:0,chars:0,pronta:false,dorme:false};
  if(fase.id===2){window.storyProp={scarecrow:{x:690}};window.storyZuskFaint=1;}
  if(fase.id===3){window.storyProp={scarecrow:{x:360},wesley:{x:525}};window.storyZuskFaint=0;}
  setLock(true);esconder();proximo();
 };
 window.storyAbort=function(){
  if(!S&&!window.storyLock)return;
  S=null;setLock(false);esconder();held.delete('crouch');WINS_NEEDED=2;window.storyProp=null;window.storyGogoUltimate=null;window.storyGogoRage=false;
  LIFE.golem=[...golemLifeOriginal];window.storyBossPhase=0;
  window.storyWesleyForceUlt2=false;window.storyWesleyUlt2Triggered=false;
  window.storyWesleyUlt2Decided=false;window.storyWesleyUlt2Approved=false;
  dummy.storyPose=null;dummy.storyRise=0;window.storyZuskFaint=0;window.storyZuskSpin=0;window.storyCinematicFall=false;
 };

 function proximo(){
  if(!S)return;S.i++;S.t=0;S.ph=0;
  const p=S.fase.passos[S.i];S.step=p;
  if(!p){const slot=S.slot;storyAbort();openStoryMap(slot);return}
  if(p.t==='trocar'){
   selectedCharacter=p.lutador;applyCharacterSpecs();maxHp=lifeMax(selectedCharacter);hp=maxHp;energy=0;
   x=235;y=floor;face=1;vy=0;walk=0;action='';actionUntil=0;
   window.storyGogoUltimate=null;window.storyGogoRage=false;
   window.storyProp={gogo:{x:745}};
   if(p.lutador==='scarecrow'){window.storyProp.zusk={x:105,fallen:true};window.storyProp.wesley={x:425};}
   else if(p.lutador==='wesley'){window.storyProp.zusk={x:105,fallen:true};window.storyProp.scarecrow={x:882,trash:true};}
   proximo();return;
  }
  if(p.t==='entradaGogo'){
   window.storyProp={scarecrow:{x:355},wesley:{x:525},gogo:{x:p.de,walk:true}};
  }
  if(p.t==='reviverGogo'){
   window.storyGogoRage=true;
   if(!window.storyProp)window.storyProp={};
   window.storyProp.gogo={x:740,rage:true,rise:0};
  }
  if(p.t==='chorarGogo'){
   if(window.storyProp?.gogo)window.storyProp.gogo.cry=true;
  }
  if(p.t==='levantarGogo'){
   if(window.storyProp?.gogo){window.storyProp.gogo.fallen=false;window.storyProp.gogo.rise=0;window.storyProp.gogo.cry=false;}
  }
  if(p.t==='furiaUltimate'){
   window.storyGogoRage=true;
   window.storyGogoUltimate={p:0,target:p.alvo,hitDone:false};
   if(window.storyProp&&window.storyProp.gogo)window.storyProp.gogo.rage=true;
  }
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
   const ax=f.ancora==='zusk'?(selectedCharacter==='zusk'?x:window.storyProp?.zusk?.x||115):f.ancora==='scarecrow'?(selectedCharacter==='scarecrow'?x:prop?.x||365):f.ancora==='wesley'?(selectedCharacter==='wesley'?x:prop?.x||510):prop?prop.x:dummyMode!=='none'?dummy.x:785;
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
   case 'aproximar':{
     S.t+=dt;x=Math.min(p.ate,x+(p.vel||100)*dt);walk+=dt*8;face=1;
     if(x>=p.ate){walk=0;proximo()}break;
    }
   case 'chorarGogo':{S.t+=dt;if(S.t>=p.seg)proximo();break;}
   case 'levantarGogo':{S.t+=dt;if(window.storyProp?.gogo)window.storyProp.gogo.rise=clamp(S.t/p.seg,0,1);if(S.t>=p.seg)proximo();break;}
   case 'entradaGogo':{
     S.t+=dt;
     const prop=window.storyProp?.gogo;
     if(prop){prop.x=Math.max(p.ate,prop.x-(p.vel||360)*dt);if(prop.x<=p.ate){prop.walk=false;proximo();}}
     else proximo();break;
    }
   case 'reviverGogo':{
     S.t+=dt;zShake=Math.max(zShake,2+Math.sin(S.t*19)**2*4);
     if(window.storyProp?.gogo)window.storyProp.gogo.rise=clamp(S.t/p.seg,0,1);
     if(S.t>=p.seg)proximo();break;
    }
   case 'furiaUltimate':{
     S.t+=dt;
     const q=clamp(S.t/p.seg,0,1);
     if(window.storyGogoUltimate){
      const ult=window.storyGogoUltimate;ult.p=q;
      if(q>=.41&&!ult.hitDone){ult.hitDone=true;hp=0;zShake=24;playSnd('kick',.7);
       effects.push({x:x,y:floor-190,t:1150,label:'FÚRIA!'});
      }
     }
     if(q>=.48){
      if(p.alvo==='zusk'){window.storyZuskSpin=q*3.9;x=Math.max(70,240-(q-.48)*300);y=floor-110*Math.sin(Math.PI*clamp((q-.48)/.52,0,1));}
      else{x=Math.min(895,240+(q-.48)*1200);y=floor-100*Math.sin(Math.PI*clamp((q-.48)/.52,0,1));}
     }
     if(S.t>=p.seg){window.storyGogoUltimate=null;window.storyGogoRage=false;window.storyZuskSpin=0;x=p.alvo==='zusk'?85:890;y=floor;proximo()}
     break;
    }
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
     if(f.id===3)unlockStoryCharacter('gogo');
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
  else if(adversario==='gogo')window.storyProp={gogo:{x:740,fallen:pw},...(selectedCharacter==='zusk'?{scarecrow:{x:375},wesley:{x:510}}:selectedCharacter==='scarecrow'?{zusk:{x:105,fallen:true},wesley:{x:425}}:{zusk:{x:100,fallen:true},scarecrow:{x:875,trash:true}})};
  if(!pw){
   if(adversario==='golem'){
    const ix=S.fase.passos.findIndex(q=>q.t==='desmaio');
    if(ix>=0)S.i=ix-1;
   }else if(adversario==='scarecrow'){
    S.i--; // retoma esta luta; o progresso do save é preservado
   }else if(adversario==='gogo'){S.i--; /* perdeu para Gogogolaiafi: repete só esta luta */}
   else if(adversario==='wesley'){
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
