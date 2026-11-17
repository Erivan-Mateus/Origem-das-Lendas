/* Modo Versus local: controles completos do Jogador 2.
 * Usa o mesmo catálogo specs/LIFE, sprites, efeitos e rotinas de dano do P1.
 * Ao contrário da IA, processa os comandos diretamente (incluindo acordes e ultimates).
 */
const P2S = {
  pressed:{}, pending:null, lastShotAt:-1, token:0, events:[],
  action:'', at:0, face:-1, y:floor, vy:0, walk:0,
  scare:0, scareNext:0, scareFirst:false, scareEnd:0,
  megaHit:0, tpFrom:0, tpAt:-1, parryAt:-1, chargeAt:0
};
function player2Reset(){
  if(P2S.pending){clearTimeout(P2S.pending);P2S.pending=null}
  P2S.token++;P2S.events=[];P2S.pressed={};P2S.lastShotAt=-1;
  P2S.action='';P2S.at=0;P2S.face=-1;P2S.y=floor;P2S.vy=0;P2S.walk=0;
  P2S.scare=0;P2S.scareNext=0;P2S.scareFirst=false;P2S.scareEnd=0;
  P2S.megaHit=0;P2S.tpFrom=0;P2S.tpAt=-1;P2S.parryAt=-1;P2S.chargeAt=0;
  dummy.p2Action='';dummy.p2At=0;dummy.face=-1;dummy.y=floor;dummy.charging=false;
  dummy.actionUntil=0;dummy.stunUntil=0;dummy.parryUntil=0;
  if(typeof _wdStop==='function')_wdStop('taunt');
  held2.clear();p2Hit=null;
}
function player2StopInput(){
  if(P2S.pending){clearTimeout(P2S.pending);P2S.pending=null}
  held2.clear();p2Hit=null;
  dummyChargeSet(false);
}
function player2Interrupt(){
  if(!P2_HUMAN())return;
  if((P2S.action==='mega'&&clock<dummy.actionUntil)||scareUltActive('p2'))return;
  P2S.token++;P2S.events=[];P2S.action='';P2S.scare=0;
  dummy.p2Action='';dummy.actionUntil=0;dummy.pend=null;
  if(typeof wesleyDummyInterrupt==='function')wesleyDummyInterrupt();
  if(typeof _wdStop==='function')_wdStop('taunt');
}
function player2PauseShift(ms){
  if(P2_HUMAN()){dummy.stunUntil+=ms;if(typeof _wd==='undefined'||!_wd.act)dummy.actionUntil+=ms;}
  P2S.at+=ms;P2S.parryAt+=ms;if(P2S.tpAt>=0)P2S.tpAt+=ms;
  P2S.scareNext+=ms;P2S.scareEnd+=ms;P2S.chargeAt+=ms;
  P2S.events.forEach(e=>e.at+=ms);
}
function player2Schedule(ms,callback){P2S.events.push({at:clock+ms,callback,token:P2S.token})}
function player2Hit(damage,range){
  if(hp>0&&Math.abs(dummy.x-x)<=range+8&&Math.abs(P2S.y-y)<85&&Math.sign(x-dummy.x)===P2S.face)aiHitPlayer(damage);
}
function player2Projectile(a,homing=false,mega=false){
  eshots.push({x:dummy.x+P2S.face*(mega?62:100),y:P2S.y-92,
    vx:P2S.face*(mega?9:12),damage:a.dmg,size:mega?48:homing?32:18,
    life:1600,homing,color:mega?'#f6a0ff':homing?'#76dcff':'#ffdc48',wmega:dummyChar==='wesley'&&mega,
    spr:dummyChar==='zusk',dir:P2S.face});
}
// Respeita os mesmos custos dos golpes do P1. Só o golpe comum já iniciado dentro
// da janela de combo pode devolver seus 30 pontos (como no sistema do P1).
function player2Spec(name){
  // Especificações do próprio P2 (o P1 pode ter escolhido outro personagem).
  if(name==='superPunch'){
    if(dummyChar==='scarecrow')return {cost:5,dmg:5,range:160,duration:440};
    return {cost:40,dmg:20,range:160,duration:440};
  }
  return specs[name];
}
function player2Start(name,refund=0){
  if(!P2_HUMAN()||!fightLive()||dummy.hp<=0||dummy.cliffFalling)return false;
  const a=player2Spec(name);if(!a)return false;
  const isMega=P2S.action==='mega'&&clock<dummy.actionUntil;
  if(name==='mega'&&dummyChar==='scarecrow'&&!scareUltRed('p2'))return false;
  if(isMega||clock<dummy.stunUntil&&!STUN_OK.includes(name))return false;
  if(clock<dummy.actionUntil && !['superPunch','superKick','superShot','parry','frontTeleport','backTeleport','mega'].includes(name))return false;
  const cost=dummyChar==='wesley'&&(name==='frontTeleport'||name==='backTeleport')?0:a.cost;
  if(dummy.energy+refund<cost)return false;
  if(P2S.pending){clearTimeout(P2S.pending);P2S.pending=null}
  P2S.token++;P2S.events=[];dummy.energy=clamp(dummy.energy+refund-cost,0,100);
  dummyChargeSet(false);
  P2S.action=name;P2S.at=clock;dummy.p2Action=name;dummy.p2At=clock;
  dummy.actionUntil=clock+a.duration;dummy.attackAnim=a.duration/1000;dummy.atkName=name;
  P2S.scare=0;
  if(dummyChar==='wesley'){
    if(['superPunch','superKick','superShot','parry','mega'].includes(name)){
      // O Wesley já tem um motor próprio para os golpes do P2 (inclusive Dama Rosa).
      dummy.actionUntil=0;
      if(!wesleyDummyStart(name)){
        dummy.energy=Math.min(100,dummy.energy+cost-refund);P2S.action='';dummy.p2Action='';return false;
      }
      return true;
    }
    if(name==='frontTeleport'||name==='backTeleport'){
      dummy.actionUntil=clock+WES_TAUNT_MS;dummy.attackAnim=WES_TAUNT_MS/1000;
      if(typeof _wdPlay==='function')_wdPlay('taunt');
      player2Schedule(WES_TAUNT_MS,()=>{if(typeof _wdStop==='function')_wdStop('taunt');dummy.energy=Math.min(100,dummy.energy+WES_TAUNT_ENERGY);
        effects.push({x:dummy.x,y:P2S.y-155,t:650,label:'+40 ENERGIA'});});
      return true;
    }
  }
  if(name==='frontTeleport'||name==='backTeleport'){
    P2S.tpAt=clock;P2S.tpFrom=dummy.x;
    dummy.x=clamp(dummy.x+(name==='frontTeleport'?1:-1)*P2S.face*300,55,905);
    effects.push({x:dummy.x,y:P2S.y-140,t:420,label:'TELEPORTE'});playTeleport();return true;
  }
  if(name==='parry'){
    dummy.parryUntil=clock+PARRY_WIN;P2S.parryAt=clock;
    effects.push({x:dummy.x,y:P2S.y-145,t:480,label:'PARRY ATIVO'});return true;
  }
  if(name==='punch'||name==='kick'){
    playSnd(name);
    if(dummyChar==='wesley'){if(name==='punch')wesleyPunchSound();else wesleyKickSound()}
    // Como o P1, os ataques comuns atingem imediatamente se estiver ao alcance.
    player2Hit(a.dmg,a.range);return true;
  }
  if(name==='shot'){
    if(dummyChar==='wesley')wesleyShotSound();else if(dummyChar==='zusk')playKi('shot');
    player2Schedule(160,()=>{if(dummyChar==='wesley')wesleyFireSound();player2Projectile(a)});
    return true;
  }
  if(name==='superPunch'&&dummyChar==='scarecrow'){
    P2S.scare=1;P2S.scareFirst=true;P2S.scareNext=clock+SCARE_FIRST;
    dummy.actionUntil=clock+400;return true;
  }
  if(name==='superPunch'||name==='superKick'){
    playSuper();const delay=name==='superPunch'?210:262;
    player2Schedule(delay,()=>player2Hit(a.dmg,a.range));return true;
  }
  if(name==='superShot'){
    if(dummyChar==='zusk')playKi('superShot');
    player2Schedule(235,()=>player2Projectile(a,true));return true;
  }
  if(name==='mega'){
    if(dummyChar==='scarecrow'){scareUltStart('p2');dummy.actionUntil=clock+SCARE_ULT_DURATION;return true}
    if(dummyChar==='zusk'){
      P2S.megaHit=0;dummy.actionUntil=clock+ZM_TOTAL;playKi('mega');
      return true;
    }
    // Mega do Espantalho: o mesmo disparo do P1.
    player2Projectile(a,false,true);return true;
  }
  return true;
}
function player2Partner(k){
  if(!held2.has('special')||performance.now()-(P2S.pressed.special??-Infinity)>(k==='jump'?JUMP_WIN:COMBO_WIN))return false;
  const name=k==='crouch'?'parry':k==='jump'?'superShot':k==='punch'?'superPunch':k==='kick'?'superKick':
    k===(P2S.face===1?'right':'left')?'frontTeleport':k===(P2S.face===1?'left':'right')?'backTeleport':null;
  if(!name)return false;
  const refund=P2S.action==='shot'&&clock<dummy.actionUntil&&P2S.lastShotAt===P2S.pressed.special?specs.shot.cost:0;
  return player2Start(name,refund);
}
function player2Special(){
  const now=performance.now();const recent=(k,ms=COMBO_WIN)=>held2.has(k)&&now-(P2S.pressed[k]??-Infinity)<=ms;
  const name=recent('crouch')?'parry':recent('jump',JUMP_WIN)?'superShot':recent('punch')?'superPunch':
    recent('kick')?'superKick':recent(P2S.face===1?'right':'left')?'frontTeleport':
    recent(P2S.face===1?'left':'right')?'backTeleport':null;
  if(name){player2Start(name);return}
  if(clock<dummy.stunUntil)return;
  if(P2S.pending){clearTimeout(P2S.pending);P2S.pending=null;
    if(!player2Start('mega'))player2Start('shot');return}
  if(dummy.energy>=100){
    P2S.pending=setTimeout(()=>{P2S.pending=null;if(P2_HUMAN()&&!menuOpen&&fightLive())player2Start('shot')},TIMESPOT);
  }else if(player2Start('shot'))P2S.lastShotAt=P2S.pressed.special;
}
function player2Press(k){
  if(!P2_HUMAN()||!fightLive()||dummy.cliffFalling||dummy.hp<=0||held2.has(k))return;
  if((P2S.action==='mega'&&clock<dummy.actionUntil)||scareUltActive('p2'))return;
  held2.add(k);P2S.pressed[k]=performance.now();
  if(k==='special'){player2Special();return}
  if(k==='jump'&&P2S.y>=floor){P2S.vy=-15;P2S.y-=1;dummy.y=P2S.y}
  if(player2Partner(k))return;
  if(k==='punch'||k==='kick')player2Start(k);
}
function player2Release(k){held2.delete(k)}
function player2Tick(dt){
  if(!P2_HUMAN()||!fightLive()||dummy.hp<=0)return;
  if(dummyChar==='wesley'&&typeof wesleyDummyTick==='function')wesleyDummyTick(dt);
  // Eventos atrasados dos especiais (cancelados corretamente quando o golpe é interrompido).
  const due=P2S.events.filter(e=>clock>=e.at);P2S.events=P2S.events.filter(e=>clock<e.at);
  for(const e of due)if(e.token===P2S.token&&fightLive())e.callback();
  if(P2S.action==='mega'&&dummyChar==='zusk'){
    const t=clock-P2S.at-ZM_CHT;
    while(P2S.megaHit<ZM_HITS.length&&t>=ZM_HITS[P2S.megaHit]){
      const i=P2S.megaHit++;
      if(hp>0&&Math.sign(x-dummy.x)===P2S.face&&Math.abs((y-80)-(P2S.y-ZM_PY))<110){
        aiHitPlayer(ZM_HITDMG,true);zImpacts.push({t:clock,x,y:y-90,k:i});zShake=Math.max(zShake,i===2?10:7);
      }
    }
  }
  if(P2S.scare===1){
    const active=P2S.action==='superPunch'&&clock>=dummy.stunUntil;
    const finish=()=>{
      if(P2S.scareFirst){P2S.scareFirst=false;player2Hit(player2Spec('superPunch').dmg,player2Spec('superPunch').range)}
      P2S.scare=2;P2S.scareEnd=clock+110;dummy.actionUntil=P2S.scareEnd;
    };
    if(!active||!held2.has('punch')||!held2.has('special'))finish();
    else{
      dummy.actionUntil=clock+200;
      if(clock>=P2S.scareNext){
        if(P2S.scareFirst){P2S.scareFirst=false;player2Hit(player2Spec('superPunch').dmg,player2Spec('superPunch').range)}
        else if(dummy.energy>=5){dummy.energy-=5;player2Hit(player2Spec('superPunch').dmg,player2Spec('superPunch').range)}
        else finish();P2S.scareNext+=SCARE_TICK;
      }
    }
  }
  const grounded=P2S.y>=floor;
  P2S.y+=P2S.vy*dt*60;P2S.vy+=.75*dt*60;
  if(P2S.y>=floor){P2S.y=floor;P2S.vy=0}
  dummy.y=P2S.y;
  const locked=(P2S.action==='mega'||(dummyChar==='wesley'&&P2S.action==='superPunch'))&&clock<dummy.actionUntil;
  const stunned=clock<dummy.stunUntil;
  const dir=!locked&&!held2.has('crouch')?(held2.has('right')?1:0)-(held2.has('left')?1:0):0;
  if(dir){dummy.x=clamp(dummy.x+dir*250*dt,55,905);P2S.face=dir;P2S.walk+=dt*11}else P2S.walk=0;
  dummy.face=P2S.face;
  if(dir)dummyCliffDropBegin();
  const charge=held2.has('charge')&&!dir&&!locked;
  if(charge!==!!dummy.charging){dummyChargeSet(charge);if(charge)P2S.chargeAt=clock}
  if(charge)dummy.energy=clamp(dummy.energy+15*dt,0,100);
  if(clock>=dummy.actionUntil&&P2S.action&&P2S.scare!==1){
    P2S.action='';dummy.p2Action='';P2S.scare=0;
  }
}
function player2FrameSprite(img,cw,ch,base,fi,cols=4,ax=cw/2,s=ZK.s){
  if(!img?.complete||!img.naturalWidth)return false;
  const f=Math.max(0,Math.floor(fi)),sx=f%cols*cw,sy=Math.floor(f/cols)*ch;
  g.drawImage(img,sx,sy,cw,ch,-ax*s,-base*s,cw*s,ch*s);return true;
}
function player2ZuskMegaSprite(ms){
  if(!(zuskMC.complete&&zuskMC.naturalWidth&&zuskMR.complete&&zuskMR.naturalWidth))return null;
  let acc=0;
  if(ms<ZM_CHT){for(let i=0;i<ZM_CH.length;i++){acc+=ZM_CH[i];if(ms<acc)return [zuskMC,ZMC,i]}}
  ms-=ZM_CHT;
  if(ms<ZM_BEAMT)return [zuskMR,ZMR,ms<ZM_RL[0]?0:1];
  ms-=ZM_BEAMT;acc=0;
  for(let i=ZM_REC_START;i<ZM_RL.length;i++){acc+=ZM_RL[i];if(ms<acc)return [zuskMR,ZMR,i]}
  return [zuskMR,ZMR,ZM_RL.length-1];
}
function drawPlayer2(){
 if(dummyChar==='gogo'){drawZengaSprite('gogo',dummy.x,{height:GOGO_HEIGHT,py:P2S.y,face:P2S.face||-1,flash:dummy.flash>0,crouch:held2.has('crouch')&&P2S.y>=floor,airborne:P2S.y<floor-1,walking:P2S.walk>0,atk:clock<dummy.actionUntil,p:clock<dummy.actionUntil?clamp(1-(dummy.actionUntil-clock)/400,0,1):0});return;}

  if(!P2_HUMAN())return;
  const active=clock<dummy.actionUntil?P2S.action:'',ms=Math.max(0,clock-P2S.at),duration=Math.max(1,dummy.actionUntil-P2S.at),p=clamp(ms/duration,0,.999),hurt=clock<dummy.stunUntil;
  const crouch=held2.has('crouch')&&P2S.y>=floor,air=clamp((floor-P2S.y)/260,0,.6);
  const firstTeleport=active==='frontTeleport'||active==='backTeleport';
  const renderX=firstTeleport&&ms<ZTP_MS.slice(0,5).reduce((a,b)=>a+b,0)?P2S.tpFrom:dummy.x;
  g.save();g.fillStyle='rgba(16,24,39,'+(.42-air*.4)+')';g.beginPath();g.ellipse(Math.round(renderX),floor+3,36*(1-air),7*(1-air),0,0,Math.PI*2);g.fill();g.restore();
  g.save();g.translate(Math.round(renderX),Math.round(P2S.y+(dummy.cliffFallY||0)));g.scale(P2S.face,1);
  if(hurt){g.shadowColor='#ffe58d';g.shadowBlur=18}
  if(dummyChar==='wesley'){
    let used=false;
    if(active==='frontTeleport'||active==='backTeleport'){
      if(_wesOk(WES_TAUNT)){drawWesleySheet(g,WES_TAUNT,_wesTauntFrame(p));used=true}
    }
    if(!used){const w=wesleyDummySprite(hurt,active==='punch'||active==='kick'||active==='shot',p,Math.sin(Math.PI*Math.min(1,(clock-(dummy.stunUntil-500))/500)));
      if(w){drawWesleySheet(g,w[0],w[1]);used=true}}
    if(!used&&P2S.y<floor-1&&_wesOk(WES_JUMP)){
      drawWesleySheet(g,WES_JUMP,Math.min(7,Math.max(0,Math.floor((P2S.vy+15)/30*8))));used=true;
    }
    if(!used&&crouch&&_wesOk(WES_CROUCH)){
      drawWesleySheet(g,WES_CROUCH,3);used=true;
    }
    if(!used){
      const walking=P2S.walk>0&&wesleyWalkAtlas.complete&&wesleyWalkAtlas.naturalWidth;
      const sp=walking?WES_WALK:WES;
      player2FrameSprite(walking?wesleyWalkAtlas:wesleyAtlas,sp.cw,sp.ch,sp.base,walking?Math.floor(P2S.walk/(11*sp.secPerFrame))%sp.frames:0,sp.cols,sp.ax,sp.s);
    }
    if(typeof wesleyDummyDrawExtra==='function')wesleyDummyDrawExtra(g);
  }else if(dummyChar==='scarecrow'){
    if(active==='mega'&&scareUltActive('p2')){scareUltDrawGiant(g,'p2');g.restore();return}
    let fi=0;
    if(active==='punch'||active==='kick')fi=[2,4,6,7,8,9,18,19][Math.floor(p*8)];
    else if(active==='superPunch'&&P2S.scare){fi=P2S.scare===2?[18,19][Math.floor(clamp(1-(P2S.scareEnd-clock)/110,0,.999)*2)]:ms<SCARE_FIRST?1+Math.floor(ms/SCARE_FIRST*4):5+Math.floor((ms-SCARE_FIRST)/45)%10}
    else if(active==='superPunch'||active==='superKick')fi=1+Math.floor(p*19);
    if(hurt)g.rotate(-.1);if(crouch&&fi===0)g.scale(1,.8);
    if(P2S.walk>0&&fi===0)g.translate(0,-Math.abs(Math.sin(P2S.walk*1.15))*7);
    if(dummy.charging&&fi===0){g.shadowColor='#ffd45a';g.shadowBlur=16}
    player2FrameSprite(scareImg,ZKE.cw,ZKE.ch,ZKE.base,fi,ZKE.cols,ZKE.ax,ZK.s);
  }else if(dummyChar==='zusk'){
    let art=null;
    const a=(img,m,fi)=>{art=[img,m,fi]};
    if(hurt&&zuskHurt.complete)a(zuskHurt,ZKH,[2,2,3,3,4,5,6,7][Math.floor(clamp(1-(dummy.stunUntil-clock)/500,0,.999)*8)]);
    else if((active==='parry'||clock-(dummy.parryOkAt||-99999)<780)&&zuskParry.complete){
      const ok=clock-(dummy.parryOkAt||-99999);
      a(zuskParry,ZKY,ok>=0&&ok<780?8+Math.min(7,Math.floor(ok/780*8)) : Math.min(7,Math.floor(ms/PARRY_WIN*8)));
    }
    else if(active==='mega')art=player2ZuskMegaSprite(ms);
    else if((active==='frontTeleport'||active==='backTeleport')&&zuskTele.complete){
      let acc=0,fi=7;for(let i=0;i<ZTP_MS.length;i++){acc+=ZTP_MS[i];if(ms<acc){fi=i;break}}
      a(zuskTele,ZKTP,fi);
    }else if((active==='shot'||active==='superShot')&&zuskShot.complete)a(zuskShot,ZKT,[1,2,3,4,5,5,6,7][Math.floor(p*8)]);
    else if(active==='superPunch'&&zuskSuper.complete)a(zuskSuper,ZKS,[4,5,6,7,8,8,9,10][Math.floor(p*8)]);
    else if(active==='superKick'&&zuskSuperKick.complete)a(zuskSuperKick,ZKSK,1+Math.floor(p*11));
    else if(active==='punch'&&zuskPunch.complete)a(zuskPunch,ZKP,[1,2,3,3,4,4,5,6][Math.floor(p*8)]);
    else if(active==='kick'&&zuskKick.complete)a(zuskKick,ZKK,[1,2,3,3,4,4,5,6][Math.floor(p*8)]);
    else if(P2S.y<floor-1&&zuskJump.complete)a(zuskJump,ZK,clamp(Math.floor(((P2S.vy+15)/30)*4)+2,2,5));
    else if(dummy.charging&&zuskCharge.complete)a(zuskCharge,ZKG,3+Math.floor((clock-P2S.chargeAt)/90)%4);
    else if(crouch&&zuskCrouch.complete)a(zuskCrouch,ZKC,3);
    if(!art)a(zuskAtlas,ZK,P2S.walk?Math.floor(P2S.walk/(11*ZK.secPerFrame))%ZK.frames:0);
    const [img,m,fi]=art;
    player2FrameSprite(img,m.cw,m.ch,m.base,fi,m.cols||ZK.cols,m.ax??m.cw/2,ZK.s*(m.k||1));
  }
  g.restore();
}
function drawPlayer2ZuskBeam(){
  if(!P2_HUMAN()||dummyChar!=='zusk'||P2S.action!=='mega'||clock>=dummy.actionUntil||!zuskMB.complete||!zuskMB.naturalWidth)return;
  const t=clock-P2S.at-ZM_CHT;if(t<0)return;const bi=Math.floor(t/ZB_MS);if(bi>=ZBM.length)return;
  const m=ZBM[bi],w=m[0],h=m[1],cy=m[2],off=m[3],sx0=bi%ZMB.cols*ZMB.cw,sy0=Math.floor(bi/ZMB.cols)*ZMB.ch+off,k=ZB_SY,dy=-cy*k,dh=h*k;
  const ox=dummy.x+P2S.face*ZM_PX,oy=P2S.y-ZM_PY,fr=ZB_FRAC[bi];
  g.save();g.translate(Math.round(ox),Math.round(oy));g.scale(P2S.face,1);
  if(fr===0)g.drawImage(zuskMB,sx0,sy0,w,h,-w*k/2,dy,w*k,dh);
  else{const Hh=Math.min(150,w),an=ZB_ANCH[bi],dist=(P2S.face>0?960-ox:ox)+140,len=Math.max(w*k,dist*fr);
    g.drawImage(zuskMB,sx0,sy0,Hh,h,-an*k,dy,Hh*k,dh);
    if(w>Hh)g.drawImage(zuskMB,sx0+Hh,sy0,w-Hh,h,(Hh-an)*k,dy,Math.max(1,len-(Hh-an)*k),dh)}
  g.restore();
}

// Controles de toque exclusivos do P2; ambos podem jogar na mesma tela.
document.querySelectorAll('[data-p2-k]').forEach(b=>{
 const k=b.dataset.p2K;
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);player2Press(k);b.classList.add('active')});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{player2Release(k);b.classList.remove('active')});
});
function renderPlayer2Combos(){
 const ws=dummyChar==='wesley';
 const lines=[['Soco','P','0'],['Chute','O','0'],['Tiro','I','30'],
   ['Super soco','P + I',dummyChar==='scarecrow'?'5 por golpe':'40'],
   ['Super chute','O + I','40'],[ws?'Provocação':'Teleporte','←/→ + I',ws?'0':'30'],
   ['Super tiro','↑ + I','60'],['Parry','↓ + I','20'],[dummyChar==='scarecrow'?'Revoada do Fim (100 corvos · vida vermelha · 15s · 150 dano)':'Ultimate (Mega / Dama Rosa)','I + I','100']];
 return `<h3>Comandos do Jogador 2 — ${charName(dummyChar)}</h3><p class="menuSmall">Pressione as duas teclas juntas (até 0,12 s); salto + I aceita até 0,2 s. Para o Espantalho, segure P + I.</p><div class="comboScroll"><table class="comboTable"><thead><tr><th>Golpe</th><th>Comando P2</th><th>Energia</th></tr></thead><tbody>${lines.map(row=>`<tr>${row.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
