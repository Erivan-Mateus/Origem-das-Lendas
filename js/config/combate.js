// Alcance dos golpes em pixels; custo de energia, dano e duração em milissegundos.
const specs={punch:{cost:0,dmg:5,range:100,duration:240},kick:{cost:0,dmg:5,range:140,duration:320},shot:{cost:30,dmg:15,duration:320},superPunch:{cost:40,dmg:20,range:160,duration:440},superKick:{cost:40,dmg:20,range:200,duration:480},backTeleport:{cost:30,duration:250},frontTeleport:{cost:30,duration:250},superShot:{cost:60,dmg:30,duration:470},parry:{cost:20,dmg:10,duration:520},mega:{cost:100,dmg:60,duration:700}};
// Distribuição das três barras de vida: verde, amarela, vermelha.
const LIFE={zusk:[50,50,100],scarecrow:[100,75,25],wesley:[10,20,170],golem:[60,80,160],gogo:[70,70,60]};
