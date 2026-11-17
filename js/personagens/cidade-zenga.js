// Cidade da Zenga · Gogogolaiafi usa somente os sprites novos (parado e andando).
// Tamanho original das cenas = 300 px; redução solicitada de 30%: 210 px.
const GOGO_HEIGHT=210;
// Enquanto não houver novos quadros de golpes, use o novo sprite parado com movimento de ataque.

const zengaGogoIdle=new Image();zengaGogoIdle.src='personagens/gogogolaiafi/parado.png';
// Sete quadros de caminhada, com pés alinhados e tamanho constante.
const GOGO_WALK={cw:348,ch:426,frames:7,msPerFrame:115};
// Âncoras medidas nos pixels visíveis dos pés, e não no centro da imagem.
// O parado tem uma pose assimétrica: seu pé de apoio está na coordenada x≈387,
// longe do centro (655) do PNG. Centralizá-lo pelo retângulo fazia a sombra
// aparecer fora dos pés e causava a impressão de que o personagem flutuava.
const GOGO_IDLE_FOOT={x:387,y:1177};
const GOGO_WALK_FOOT_X=190; // média dos pés de apoio dos 7 quadros
const GOGO_WALK_FOOT_Y=[416,417,416,417,416,416,416];

const zengaGogoWalk=new Image();zengaGogoWalk.src='personagens/gogogolaiafi/andar.png';
const zengaGogoPortrait=new Image();zengaGogoPortrait.src='personagens/gogogolaiafi/retrato.png';
const zengaGostosaImg=new Image();zengaGostosaImg.src='personagens/gostosa/sprite.png';
function drawZengaSprite(kind,px,opt={}){
 const isGogo=kind==='gogo';
 const walkingGogo=isGogo&&!!opt.walking&&!opt.atk&&!opt.fallen&&!opt.crouch&&!opt.airborne;
 const walkReady=walkingGogo&&zengaGogoWalk.complete&&zengaGogoWalk.naturalWidth>=GOGO_WALK.cw*GOGO_WALK.frames;
 const img=isGogo?(walkReady?zengaGogoWalk:zengaGogoIdle):zengaGostosaImg;
 if(!img.complete||!img.naturalWidth)return;
 const height=opt.height||(isGogo?GOGO_HEIGHT:186);
 // Usar a dimensão de UM quadro, nunca a largura de toda a spritesheet.
 const width=height*(walkReady?GOGO_WALK.cw/GOGO_WALK.ch:img.naturalWidth/img.naturalHeight);
 const py=opt.py==null?floor:opt.py;
 const fc=opt.face||-1;
 const flash=!!opt.flash,atk=!!opt.atk;
 const anim=opt.p||0;
 const rage=!!opt.rage;
 const t=typeof clock==='number'?clock:performance.now();
 const frame=walkReady?Math.floor(t/GOGO_WALK.msPerFrame)%GOGO_WALK.frames:0;
 const air=Math.max(0,floor-py);
 // Sombra sempre diretamente sob o pé de apoio, menor quando o personagem pula.
 const shadowAir=Math.min(1,air/180);
 g.save();g.fillStyle=`rgba(16,18,37,${(.38-shadowAir*.23).toFixed(3)})`;
 g.beginPath();g.ellipse(px,floor+3,width*.24*(1-shadowAir*.4),8*(1-shadowAir*.35),0,0,Math.PI*2);g.fill();g.restore();
 g.save();g.translate(px,py);g.scale(fc,1);
 if(opt.fallen){g.translate(-30,-12);g.rotate(-1.42);}
 if(opt.rise!=null){g.scale(1,.65+.35*Math.max(0,Math.min(1,opt.rise)));}
 if(rage){
  g.shadowColor='#e46bff';g.shadowBlur=48;
  g.fillStyle='rgba(177,52,244,'+(.20+.12*Math.sin(t/110))+')';
  g.beginPath();g.ellipse(0,-height*.50,width*.55,height*.56,0,0,Math.PI*2);g.fill();
 }
 if(flash){g.shadowColor='#fff1a0';g.shadowBlur=25;g.translate((Math.random()-.5)*8,0)}
 const tA=atk?Math.sin(Math.PI*anim):0;
 g.translate(tA*22,0);
 // Pular: acompanha y do motor e inclina levemente o corpo no ar.
 // Agachar: comprime o desenho com os pés ancorados no chão.
 const crouching=isGogo&&!!opt.crouch&&!opt.airborne&&!opt.fallen;
 const airborne=isGogo&&!!opt.airborne&&!opt.fallen;
 g.rotate(atk?-.13*tA:airborne?-.09:Math.sin(t/480)*.01);
 const breathe=1+Math.sin(t/310)*.008;
 g.scale(breathe,(crouching?.62:1)*breathe);
 if(walkReady){
  // Pé da caminhada colocado exatamente em (px,py), sem margem transparente inferior.
  const scale=height/GOGO_WALK.ch;
  g.drawImage(img,frame*GOGO_WALK.cw,0,GOGO_WALK.cw,GOGO_WALK.ch,
    -GOGO_WALK_FOOT_X*scale,-GOGO_WALK_FOOT_Y[frame]*scale,width,height);
 }else if(isGogo){
  // Pé de apoio da pose parada coincide com a posição física e com a sombra.
  const scale=height/img.naturalHeight;
  g.drawImage(img,-GOGO_IDLE_FOOT.x*scale,-GOGO_IDLE_FOOT.y*scale,width,height);
 }else{
  g.drawImage(img,-width/2,-height,width,height);
 }
 g.restore();
 if(opt.cry){
  const tearX=px+(opt.fallen?-110:15),tearY=py-(opt.fallen?40:height*.75);
  g.save();g.fillStyle='rgba(103,220,255,.9)';
  for(let j=0;j<4;j++){const t=(clock/380+j*.24)%1;g.beginPath();g.ellipse(tearX+j*8,tearY+t*57,3.2,7,0,0,Math.PI*2);g.fill()}
  g.restore();
 }
}
function drawGogoDummy(){
 const atk=dummy.attackAnim>0;
 drawZengaSprite('gogo',dummy.x,{face:x>dummy.x?-1:1,height:GOGO_HEIGHT,py:dummy.y||floor,flash:dummy.flash>0,
    atk,walking:clock<(dummy.gogoWalkUntil||0),p:atk?Math.max(0,Math.min(1,1-dummy.attackAnim/.32)):0,rage:!!window.storyGogoRage});
}
function drawZengaNPC(kind,prop){
 drawZengaSprite(kind,prop.x,{height:kind==='gogo'?GOGO_HEIGHT:175,py:prop.y||floor,face:prop.face||(x<prop.x?-1:1),
   rage:!!prop.rage,atk:!!prop.atk,walking:!!prop.walk||!!prop.walking,p:prop.p||0,fallen:!!prop.fallen,cry:!!prop.cry,rise:prop.rise});
}
function drawZengaTrash(px){
 g.save();g.fillStyle='#737d89';g.fillRect(px-48,floor-77,96,86);
 g.strokeStyle='#c1ccd1';g.lineWidth=5;g.strokeRect(px-48,floor-77,96,86);
 g.fillStyle='#a5b2ba';g.beginPath();g.ellipse(px,floor-78,56,14,0,0,Math.PI*2);g.fill();
 g.strokeStyle='#374049';g.lineWidth=3;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(px+i*16,floor-64);g.lineTo(px+i*16,floor-1);g.stroke()}g.restore();
}
// A ultimate da fúria nas duas primeiras batalhas é cinematográfica;
// só é disparada depois de derrotar o chefe no combate normal.
function drawZengaCinematic(){
 const ult=window.storyGogoUltimate;
 if(!ult)return;
 const q=ult.p||0,hit=q>=.41;
 g.save();
 g.fillStyle='rgba(69,0,88,'+(.18+.17*Math.sin(q*Math.PI))+')';g.fillRect(0,0,960,540);
 if(q>.17&&q<.85){
  const cx=720,cy=235;
  for(let k=0;k<6;k++){
   const angle=k*Math.PI/3+q*11;
   g.strokeStyle=`rgba(${k%2?'255,225,115':'244,51,255'},${.55*(1-q*.4)})`;
   g.lineWidth=6+k%3*4;g.beginPath();
   g.moveTo(cx+Math.cos(angle)*75,cy+Math.sin(angle)*60);
   g.lineTo(cx+Math.cos(angle)*(.1+q)*650,cy+Math.sin(angle)*(.2+q)*370);g.stroke();
  }
  if(hit){const bx=ult.target==='scarecrow'?820:250;
   g.globalAlpha=Math.min(.8,Math.sin(Math.PI*Math.min(1,(q-.41)/.55))+.15);
   const gr=g.createRadialGradient(bx,250,8,bx,250,170);
   gr.addColorStop(0,'rgba(255,253,213,.95)');gr.addColorStop(.3,'rgba(242,83,253,.88)');gr.addColorStop(1,'rgba(255,35,88,0)');
   g.fillStyle=gr;g.fillRect(bx-180,60,360,360);
  }
 }
 if(ult.target==='scarecrow'&&q>.56){
  const xx=885;
  g.fillStyle='#4f5960';g.fillRect(xx-48,floor-67,96,76);
  g.strokeStyle='#b0babc';g.lineWidth=5;g.strokeRect(xx-48,floor-67,96,76);
  g.fillStyle='#727e84';g.beginPath();g.ellipse(xx,floor-67,54,13,0,0,Math.PI*2);g.fill();
  g.strokeStyle='#283139';g.beginPath();g.moveTo(xx-22,floor-57);g.lineTo(xx-22,floor-5);g.moveTo(xx,floor-57);g.lineTo(xx,floor-5);g.moveTo(xx+22,floor-57);g.lineTo(xx+22,floor-5);g.stroke();
 }
 g.restore();
}
