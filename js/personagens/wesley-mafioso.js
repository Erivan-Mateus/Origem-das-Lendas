// Caminhos dos sprites — edite aqui ao substituir a arte.
const WESLEY_ATLAS = 'personagens/wesley-mafioso/sprites.webp';
const WESLEY_FACE = 'personagens/wesley-mafioso/retrato.webp';
const WESLEY_FULL = 'personagens/wesley-mafioso/selecao.webp';
const WESLEY_WALK = 'personagens/wesley-mafioso/andando.webp';
const WESLEY_PUNCH = 'personagens/wesley-mafioso/socando.webp';
const WESLEY_KICK = 'personagens/wesley-mafioso/chutando.webp';
const WESLEY_HURT = 'personagens/wesley-mafioso/dano.webp';
const WESLEY_JUMP = 'personagens/wesley-mafioso/pulando.webp';
const WESLEY_HURT_SND = 'audio/wesley-tomando-dano.ogg'; // som do Wesley tomando dano
const WESLEY_SPECIAL = 'personagens/wesley-mafioso/especial.webp';
const WESLEY_BAT = 'personagens/wesley-mafioso/especial2.webp';
const WESLEY_CROUCH = 'personagens/wesley-mafioso/agachando.webp';
const WESLEY_CHARGE = 'personagens/wesley-mafioso/carregando.webp';
const WESLEY_SPUNCH = 'personagens/wesley-mafioso/especial_soco.webp'; // especial R+soco (11 socos)
const WESLEY_SPUNCH_SND = 'audio/socos_socos_socos.mp3';
const WESLEY_TAUNT = 'personagens/wesley-mafioso/provocacao.webp'; // provocação (no lugar do teleporte)
const WESLEY_TAUNT_SND = 'audio/wesley-provocacao.mp3';
const WESLEY_PARRY = 'personagens/wesley-mafioso/parry.png'; // parry (10 quadros, 5x2)
const WESLEY_PARRY_SND = 'audio/ole-wesley.mp3'; // "olé" quando o parry acerta
const WESLEY_ULT2 = 'personagens/wesley-mafioso/ultimate2.png'; // ultimate 2 (vida vermelha): ativação do stand, 12 quadros
const WESLEY_ULT2_SND = 'audio/wesley-ultimate2.mp3';
const WESLEY_ULT2_BGM = 'audio/jojo-wason-exploding.mp3'; // música de fundo do ultimate 2 (cortada quando a animação acaba)
const WESLEY_STAND = 'personagens/wesley-mafioso/stand.png'; // stand Dama Rosa (faixa 2172x724, 11 quadros)
const WESLEY_CHARGE_SND = 'audio/wesley_subindo_ara.mp3'; // loop enquanto carrega energia

// ===== Animações próprias do Wesley (soco, chute, dano, pulo) — tudo fica neste arquivo =====
// Cada quadro: [sx, sy, sw, sh, ax, ay] = recorte na folha + ponto de ancoragem (centro dos pés, chão),
// em pixels da folha. s = escala de desenho.
function _wesSheet(src, s, rects, ys, ax, ay) {
  const img = new Image(); img.src = src;
  return { img, s, f: rects.map((r, i) => [r[0], ys[i][0], r[1] - r[0], ys[i][1] - ys[i][0], ax[i], Array.isArray(ay) ? ay[i] : ay]) };
}
(function () {
  const rows = (b, y0, y1) => ({ r: b.slice(0, -1).map((v, i) => [v, b[i + 1]]), y: b.slice(0, -1).map(() => [y0, y1]) });
  // Soco: 2172x724, 8 quadros.
  let o = rows([0, 271.5, 543, 814.5, 1086, 1370, 1629, 1900.5, 2172], 0, 724);
  window.WES_PUNCH = _wesSheet(WESLEY_PUNCH, .398, o.r, o.y, [143, 138.5, 132.5, 136.5, 135, 124, 134.5, 145].map((v, i) => i * 271.5 + v), 557);
  // Chute: 1916x821, 8 quadros (do 2 ao 6 só o pé de apoio fica no chão).
  o = rows([0, 252, 472, 678, 881, 1160, 1468, 1656, 1916], 0, 821);
  window.WES_KICK = _wesSheet(WESLEY_KICK, .404, o.r, o.y, [129, 364, 618, 830, 1023, 1304, 1596, 1785], 613);
  // Dano: 2172x724, 8 quadros.
  o = rows([0, 252, 541, 815, 1087, 1365, 1627, 1890, 2172], 0, 724);
  window.WES_HURT = _wesSheet(WESLEY_HURT, .402, o.r, o.y, [130, 396, 707, 993, 1216, 1478, 1758, 2036], 561);
  // Agachar: 2172x724, 6 quadros (0 em pé, 1-3 descendo, 4-5 levantando).
  const cb = [0, 415, 766, 1111, 1457, 1790, 2172];
  window.WES_CROUCH = _wesSheet(WESLEY_CROUCH, .289, cb.slice(0, -1).map((v, i) => [v, cb[i + 1]]),
    cb.slice(0, -1).map(() => [0, 724]), [243, 580, 917, 1255, 1605, 1969], 635);
  // Especial base (R): arma de brinquedo. Folha 2172x724; usa só os 8 primeiros quadros (linha de cima).
  // Quadros: 0 parado, 1-4 saca a arma, 5 DISPARO (clarão), 6 fumaça, 7 piscadinha (último quadro: o golpe para aqui).
  const sb = [0, 260, 495, 758, 1040, 1297, 1612, 1869, 2172];
  window.WES_SPECIAL = _wesSheet(WESLEY_SPECIAL, .476, sb.slice(0, -1).map((v, i) => [v, sb[i + 1]]),
    sb.slice(0, -1).map(() => [0, 455]), [160, 394, 635, 886, 1159, 1421, 1699, 1986], 447);
  // Especial R+Chute (taco): folha reorganizada 4200x724, 10 células de 420 px.
  // Quadros: 0 parado, 1-3 prepara, 4 taco no alto, 5 giro, 6 taco estendido (impacto), 7 arremesso, 8 taco voando, 9 parado.
  const bx = [106, 283, 482, 676, 895, 1134, 1378, 1653, 1894, 2072], blo = [32, 197, 395, 590, 789, 1007, 1294, 1569, 1825, 2000];
  window.WES_BAT = _wesSheet(WESLEY_BAT, .593, bx.map((_, i) => [i * 420, i * 420 + 420]),
    bx.map(() => [0, 724]), bx.map((v, i) => i * 420 + 10 + (v - blo[i])), 481);
  // Carregar energia: folha 2880x724, 9 células de 320 px. Quadros: 0 aura máxima (gritando), 1 punhos, 2 comemorando,
  // 3 "paz" com estrela, 4 acenando, 5-8 aura sumindo até ficar parado.
  const cax = [163.5, 459, 774, 1084, 1406.5, 1727, 2039, 2356, 2668];
  window.WES_CHARGE = _wesSheet(WESLEY_CHARGE, .535, cax.map((_, i) => [i * 320, i * 320 + 320]),
    cax.map(() => [0, 724]), cax, [524, 525, 527, 526, 529, 530, 530, 530, 530]);
  // Especial R+soco: folha 3520x1448, 2 linhas de 724 px (11 quadros em cima, 10 embaixo), células de 320 px.
  // Quadros: 0 parado, 1-4 prepara, 5-15 os 11 socos (5-7 e 12 braço estendido, o resto fists borrados), 16-20 recolhe.
  const spx = [75.5, 400.5, 723.5, 1048.0, 1370.0, 1691.5, 2011.0, 2326.0, 2644.0, 2965.0, 3280.5, 90.0, 411.0, 732.0, 1048.0, 1372.5, 1690.0, 2024.5, 2325.0, 2643.5, 2952.5], spy = [331, 332, 331, 332, 331, 331, 331, 331, 331, 331, 331, 1364, 1364, 1364, 1363, 1363, 1363, 1362, 1361, 1361, 1361];
  window.WES_SPUNCH = _wesSheet(WESLEY_SPUNCH, .657, spx.map((_, i) => { const c = i < 11 ? i : i - 11; return [c * 320, c * 320 + 320]; }),
    spx.map((_, i) => i < 11 ? [0, 724] : [724, 1448]), spx, spy);
  // Provocação: folha 2560x724, 8 células de 320 px. Quadros: 0 parado, 1 começa, 2-3 ri com a mão no queixo, 4 mão aberta,
  // 5 apontando, 6 curvado de rir, 7 mão na nuca (último quadro).
  const tax = [96, 429, 753.5, 1092.5, 1407, 1743, 2010, 2349];
  window.WES_TAUNT = _wesSheet(WESLEY_TAUNT, .501, tax.map((_, i) => [i * 320, i * 320 + 320]),
    tax.map(() => [0, 724]), tax, [497, 497, 497, 497, 497, 498, 499, 498]);
  // Parry: folha 1983x793, 5 colunas x 2 linhas (10 quadros). Quadros: 0 parado, 1-5 desvio/giro (janela de defesa),
  // 6-9 comemoração depois de aparar (apontando, rindo, mão na cintura).
  const pcx = [272, 623, 1000, 1365.5, 1727.5, 261.5, 609.5, 994, 1370.5, 1748], pyb = [374, 380, 372, 374, 375, 770, 770, 767, 767, 767], pw = 1983 / 5;
  window.WES_PARRY = _wesSheet(WESLEY_PARRY, .47, pcx.map((_, i) => [(i % 5) * pw, (i % 5 + 1) * pw]),
    pcx.map((_, i) => i < 5 ? [0, 396] : [397, 793]), pcx, pyb);
  // Ultimate 2 (ativando o stand): faixa 2172x724 com 12 quadros de larguras diferentes. Quadro 10 (índice 9) = pose com o stand aparecendo.
  const ub = [0, 166, 321, 491, 692, 867, 1040, 1231, 1415, 1623, 1828, 2000, 2172], ucx = [89.5, 241.0, 403.5, 593.0, 777.0, 960.0, 1145.0, 1337.5, 1525.0, 1728.0, 1912.5, 2081.0];
  window.WES_ULT2 = _wesSheet(WESLEY_ULT2, .68, ucx.map((_, i) => [ub[i], ub[i + 1]]), ucx.map(() => [0, 724]), ucx, 481);
  // Stand Dama Rosa: faixa 2172x724, 11 quadros de larguras diferentes. Quadros: 0 parada, 1 alerta (!), 2 guarda,
  // 3-8 socos (giro rosa, braços borrados), 9 soco final com explosão rosa, 10 piscadinha. Âncora = centro dos saltos vermelhos.
  const sdb = [0, 186, 381, 572, 797, 993, 1199, 1389, 1581, 1757, 1999, 2172];
  const sdx = [120.7, 283.8, 482.9, 679.7, 883.0, 1088.8, 1283.0, 1470.3, 1664.0, 1854.7, 2079.0];
  const sdy = [489, 487, 486, 488, 485, 491, 492, 488, 492, 492, 505];
  window.WES_STAND = _wesSheet(WESLEY_STAND, .6, sdx.map((_, i) => [sdb[i], sdb[i + 1]]), sdx.map(() => [0, 724]), sdx, sdy);
  // Pulo: 1774x887, 4x2. Ancorado no próprio pé de cada quadro (a altura vem da física do jogo).
  const jr = [[0, 420], [420, 880], [880, 1330], [1330, 1774]];
  window.WES_JUMP = _wesSheet(WESLEY_JUMP, .389, [...jr, ...jr],
    [[0, 443], [0, 443], [0, 443], [0, 443], [443, 887], [443, 887], [443, 887], [443, 887]],
    [226, 657, 1092, 1529, 210, 649, 1097, 1549], [425, 422, 413, 368, 795, 839, 870, 870]);
})();

const _wesOk = sh => sh.img.complete && sh.img.naturalWidth > 0;
const _wesPick = (seq, p) => seq[Math.min(seq.length - 1, Math.floor(Math.max(0, Math.min(.999, p)) * seq.length))];
const WES_SEQ = {
  punch: [1, 2, 3, 4, 4, 5, 5, 6, 7],
  kick: [1, 2, 3, 4, 5, 5, 6, 7],
  hurt: [1, 2, 3, 3, 4, 5, 5, 6, 7],
  jump: [2, 3, 3, 4, 5, 5, 5, 4]
};
// Carregar energia: a aura "sobe" (8 -> 0), depois fica em loop; ao soltar, a aura some (4 -> 8). Passos em ms por quadro.
const WES_CHARGE_INTRO = [8, 7, 6, 5, 4, 3, 2, 1, 0], WES_CHARGE_STEP = 55;
const WES_CHARGE_LOOP = [0, 1, 2, 1], WES_CHARGE_LOOP_STEP = 120;
const WES_CHARGE_OUT = [4, 5, 6, 7, 8], WES_CHARGE_OUT_STEP = 60;
// Provocação: fim de cada quadro (fração da duração do golpe, que é a do áudio). Ajuste para acelerar/atrasar quadros.
const WES_TAUNT_ENDS = [.06, .15, .27, .39, .53, .70, .85, 1];
function _wesTauntFrame(p) {
  p = Math.max(0, Math.min(.999, p));
  for (let i = 0; i < WES_TAUNT_ENDS.length; i++) if (p < WES_TAUNT_ENDS[i]) return i;
  return WES_TAUNT_ENDS.length - 1;
}
// Especial R+soco: 11 socos de 3 de dano cada. A animação dura o mesmo que o som (WES_SPUNCH_MS, medido ao carregar o áudio).
const WES_SPUNCH_HITS = 11, WES_SPUNCH_DMG = 3;
let WES_SPUNCH_MS = 3366;
const WES_SP_A = .12, WES_SP_B = .90; // fração do golpe: 0-A preparação (quadros 1-4), A-B os 11 socos (5-15), B-1 recolher (16-20)
function _wesSuperPunchFrame(ms) {
  const f = Math.max(0, Math.min(.999, ms / WES_SPUNCH_MS));
  if (f < WES_SP_A) return 1 + Math.floor(f / WES_SP_A * 4);
  if (f < WES_SP_B) return 5 + Math.floor((f - WES_SP_A) / (WES_SP_B - WES_SP_A) * 11);
  return 16 + Math.floor((f - WES_SP_B) / (1 - WES_SP_B) * 5);
}
// Momentos (ms desde o início do golpe) em que cada um dos 11 socos acerta: logo após o início de cada quadro de soco.
function wesleySuperPunchHitTimes() {
  const t = [];
  for (let i = 0; i < WES_SPUNCH_HITS; i++) t.push(Math.round(WES_SPUNCH_MS * (WES_SP_A + (WES_SP_B - WES_SP_A) / WES_SPUNCH_HITS * (i + .35))));
  return t;
}
// Especial R+Chute (super chute): quadros 1 a 7 por tempo; o dano do jogo cai aos 262 ms, com o taco estendido (quadro 6).
const WES_BAT_FREEZE = 3000 / 60; // congela 3 frames (50 ms) no taco estendido, depois segue
// Duração-base da animação original: até o taco arremessado sumir (taco estendido + congelada + 600 ms de voo).
const WES_BAT_BASE_MS = 335 + WES_BAT_FREEZE + 600;
// Fator de lentidão da animação (1 = original). Ao carregar o áudio do especial 2, vira (duração do som) / WES_BAT_BASE_MS,
// assim animação e som duram exatamente o mesmo tempo. Até lá (ou se o áudio não carregar) usa 1.5.
let WES_BAT_SLOW = 1.5, WES_BAT_SND_MS = 0;
function _wesBatFrame(ms) {
  ms /= WES_BAT_SLOW;
  return ms < 40 ? 1 : ms < 80 ? 2 : ms < 130 ? 3 : ms < 200 ? 4 : ms < 250 ? 5 : ms < 335 + WES_BAT_FREEZE ? 6 : 7;
}
// Taco arremessado (quadro 8): sai da mão no quadro 7 e voa para frente. Desenhado no contexto do personagem (pé em 0,0).
function drawWesleyBatFlight(g, ms) {
  ms /= WES_BAT_SLOW;
  const T0 = 335 + WES_BAT_FREEZE;
  if (ms < T0 || !_wesOk(WES_BAT)) return;
  const t = ms - T0, f = WES_BAT.f[8], s = WES_BAT.s;
  const x0 = 80 + t * .55, y0 = -104 - t * .05;               // do punho para frente, subindo um pouco
  g.save(); g.globalAlpha = Math.max(0, 1 - t / 600);
  g.drawImage(WES_BAT.img, f[0], f[1], f[2], f[3], x0 - 106 * s, y0 - 274 * s, f[2] * s, f[3] * s); // centro do taco na célula = (106, 274)
  g.restore();
}
// Especial base: quadro por tempo (ms desde o início). O projétil sai aos 160 ms, junto ao quadro 5 (clarão);
// depois disso a animação segue até o quadro 7 (8º sprite) e fica nele até o golpe acabar.
function _wesSpecialFrame(ms) {
  return ms < 40 ? 1 : ms < 80 ? 2 : ms < 120 ? 3 : ms < 160 ? 4 : ms < 230 ? 5 : ms < 300 ? 6 : 7;
}

// Desenha o quadro fi da folha sh com o pé no ponto (0,0) do contexto atual.
function drawWesleySheet(g, sh, fi) {
  const f = sh.f[fi], s = sh.s;
  g.drawImage(sh.img, f[0], f[1], f[2], f[3], -(f[4] - f[0]) * s, -(f[5] - f[1]) * s, f[2] * s, f[3] * s);
}
// Parry do jogador: 1-5 durante a janela de defesa (PARRY_WIN); se aparar (parryHitAt), 6-9 até o fim do golpe.
function _wesParryFrame() {
  if (parryHitAt >= 0) {
    const tot = Math.max(1, parryStartAt + PARRY_FULL - parryHitAt), p = Math.min(.999, (clock - parryHitAt) / tot);
    return 6 + Math.floor(p * 4);
  }
  const t = clock - parryStartAt;
  return t < PARRY_WIN ? 1 + Math.floor(Math.max(0, t) / PARRY_WIN * 5) : 5;
}
// ===== Ultimate (R+R) por faixa de vida =====
// Vida verde ou amarela: saca a arma, escurece a tela, dispara o mega tiro com impact frame. Vida vermelha: ultimate 2 (stand), mais abaixo.
const WES_MEGA_T = { fire: 1100, total: 1900 }; // ms: disparo e fim do golpe
let wesMegaStart = -1, wesMegaGun = false;
function wesleyLifeZone() {
  const c = (typeof LIFE !== 'undefined' && LIFE.wesley) || [20, 30, 150];
  return hp > c[1] + c[2] ? 'green' : hp > c[2] ? 'yellow' : 'red';
}
function wesleyMegaGun() { return wesleyLifeZone() !== 'red'; }
function wesleyMegaActive() { return selectedCharacter === 'wesley' && wesMegaGun && wesMegaStart >= 0 && action === 'mega' && clock < actionUntil; }
// Quadros da folha do especial (arma): 1-4 saca (hold no 4 carregando), 5 disparo, 6 fumaça, 7 piscadinha.
function _wesMegaFrame(ms) { return ms < 150 ? 1 : ms < 300 ? 2 : ms < 450 ? 3 : ms < WES_MEGA_T.fire ? 4 : ms < 1250 ? 5 : ms < 1500 ? 6 : 7; }
function wesleyMegaStart(a) {
  wesMegaStart = clock; wesMegaGun = true; wesUlt2On = false;
  actionUntil = clock + WES_MEGA_T.total;
  const act = actionUntil;
  wesleyShotSound();
  setTimeout(() => {
    if (action !== 'mega' || actionUntil !== act) return; // interrompido
    wesleyFireSound();
    shots.push({ x: x + face * 100, y: y - 92, vx: face * 10, damage: a.dmg, size: 70, life: 1600, color: '#ffe38a', homing: false, wmega: true });
    zImpacts.push({ t: clock, x: x + face * 90, y: y - 92, k: 0 }); // impact frame no cano da arma
    zShake = Math.max(zShake, 10);
  }, WES_MEGA_T.fire);
}
// ===== Ultimate 2 (R+R com a vida vermelha): ativa o stand. Dura até WES_ULT2_MAX ms. =====
// Quadros 1-9 ativando; o quadro 10 TRAVA enquanto o stand estiver aparecendo; depois 11-12 recolhendo.
const WES_ULT2_MAX = 8000, WES_ULT2_START = 1500, WES_ULT2_RECOVER = 500; // sequência inteira (ativação + stand + recolher) = 8 s
const WES_STAND_MS = WES_ULT2_MAX - WES_ULT2_START - WES_ULT2_RECOVER; // 6 s com o stand em cena: a Dama Rosa dá os 20 socos aqui dentro
let wesUlt2Start = -1, wesUlt2On = false;
function _wesUlt2Total() { return Math.min(WES_ULT2_MAX, WES_ULT2_START + WES_STAND_MS + WES_ULT2_RECOVER); }
function wesleyUlt2Active() { return selectedCharacter === 'wesley' && wesUlt2On && wesUlt2Start >= 0 && action === 'mega' && clock < actionUntil; }
function _wesUlt2Frame(ms) {
  if (ms < WES_ULT2_START) return Math.min(8, Math.floor(ms / (WES_ULT2_START / 9)));      // quadros 1-9 (índices 0-8)
  const standEnd = _wesUlt2Total() - WES_ULT2_RECOVER;
  if (ms < standEnd) return 9;                                                              // quadro 10: travado com o stand em cena
  return ms < standEnd + WES_ULT2_RECOVER / 2 ? 10 : 11;                                    // quadros 11-12
}
function wesleyUlt2Start(a) {
  wesUlt2Start = clock; wesUlt2On = true; wesMegaGun = false;
  _wesStandHits = 0; _wesStandX = clamp(x + face * (70 + WES_STAND_GAP), 55, 905); _wesStandFace = face; _wesStandLast = clock;
  actionUntil = clock + _wesUlt2Total();
  _wesPlaySound('ult2');
  _wesPlaySound('ult2bgm');
}
// ===== Stand "Dama Rosa": aparece (0,6 s), dá 20 socos e some (0,6 s). Os 20 socos somam exatamente 130 de dano e não podem ser aparados. =====
const WES_STAND_HITS = 20, WES_STAND_TOTAL_DMG = 130, WES_STAND_APPEAR = 400, WES_STAND_LEAVE = 400, WES_STAND_RANGE = 170, WES_STAND_SPEED = 600, WES_STAND_GAP = 40, WES_STAND_SND_VOL = .2; // SND_VOL: volume (0 a 1) do som de soco de cada soco da Dama Rosa // GAP: afastamento extra (px) entre o Wesley e a Dama Rosa
const WES_STAND_PUNCH_MS = (WES_STAND_MS - WES_STAND_APPEAR - WES_STAND_LEAVE) / WES_STAND_HITS; // 260 ms por soco
let _wesStandX = 0, _wesStandFace = 1, _wesStandHits = 0, _wesStandLast = 0;
const _wesStandT = () => clock - wesUlt2Start - WES_ULT2_START; // ms desde que o stand começou a aparecer
// Dano de cada soco: 130 divididos em 20 (alterna 6 e 7); a soma é sempre exatamente 130.
const _wesStandDmg = i => Math.round(WES_STAND_TOTAL_DMG * (i + 1) / WES_STAND_HITS) - Math.round(WES_STAND_TOTAL_DMG * i / WES_STAND_HITS);
function _wesStandFrame(t) {
  if (t < WES_STAND_APPEAR) return t < WES_STAND_APPEAR / 2 ? 0 : 1;
  const u = t - WES_STAND_APPEAR;
  if (u >= WES_STAND_PUNCH_MS * WES_STAND_HITS) return 10; // piscadinha no fim
  const i = Math.floor(u / WES_STAND_PUNCH_MS), p = (u - i * WES_STAND_PUNCH_MS) / WES_STAND_PUNCH_MS;
  if (i === WES_STAND_HITS - 1 && p >= .55) return 9;      // último soco: explosão rosa
  if (i === 0 && p < .12) return 2;
  return 3 + Math.min(5, Math.floor(p * 6));               // ciclo de soco 3..8
}
// Chamado todo quadro pelo jogo.js: a Dama Rosa vai até o oponente e cada soco acerta na metade do seu ciclo.
function wesleyUlt2Tick() {
  if (!wesleyUlt2Active()) return;
  const t = _wesStandT(); if (t < 0) return;
  const dt = Math.min(50, Math.max(0, clock - _wesStandLast)); _wesStandLast = clock;
  if (dummyMode !== 'none') {
    const dd = dummy.x >= x ? 1 : -1, step = WES_STAND_SPEED * dt / 1000;
    let target = dummy.x - dd * 95;
    if ((target - x) * dd < 70 + WES_STAND_GAP) target = x + dd * (70 + WES_STAND_GAP); // nunca mais perto que 170 px do Wesley
    target = clamp(target, 55, 905);
    _wesStandFace = dd; _wesStandX += clamp(target - _wesStandX, -step, step);
  }
  const u = t - WES_STAND_APPEAR;
  while (_wesStandHits < WES_STAND_HITS && u >= _wesStandHits * WES_STAND_PUNCH_MS + WES_STAND_PUNCH_MS * .5) {
    const i = _wesStandHits++;
    if (typeof playSnd === 'function') playSnd('punch', WES_STAND_SND_VOL); // som de soco baixinho, sincronizado com o soco
    if (dummyMode !== 'none' && dummy.hp > 0 && Math.abs(dummy.x - _wesStandX) <= WES_STAND_RANGE) {
      hit(_wesStandDmg(i), true);
      zShake = Math.max(zShake, i === WES_STAND_HITS - 1 ? 12 : 3);
      if (i === WES_STAND_HITS - 1) zImpacts.push({ t: clock, x: dummy.x, y: floor - 90, k: 2 });
    }
  }
}
function wesleyUlt2Shift(e) { if (wesUlt2Start >= 0) { wesUlt2Start += e; _wesStandLast += e; } } // compensa o tempo em pausa
// Desenha a Dama Rosa (jogo.js chama depois de desenhar o jogador).
function drawWesleyStand(g) {
  if (!wesleyUlt2Active() || !_wesOk(WES_STAND)) return;
  const t = _wesStandT(); if (t < 0 || t > WES_STAND_MS) return;
  const al = Math.max(0, Math.min(1, t / 300, (WES_STAND_MS - t) / 400));
  g.save(); g.globalAlpha = al;
  g.fillStyle = 'rgba(16,24,39,.42)'; g.beginPath(); g.ellipse(Math.round(_wesStandX), floor + 3, 34, 6, 0, 0, Math.PI * 2); g.fill();
  g.translate(Math.round(_wesStandX), floor); g.scale(_wesStandFace, 1);
  g.shadowColor = '#ff5ad8'; g.shadowBlur = 20;
  drawWesleySheet(g, WES_STAND, _wesStandFrame(t));
  g.restore();
}
function wesleyStopUlt2Sound() { // corta a voz e a música do ultimate 2
  for (const k of ['ult2', 'ult2bgm']) { const a = _wesSnd[k].cur; if (a && !a.paused) { try { a.pause(); a.currentTime = 0; } catch (e) {} } }
}
function wesleyHurtReady() { return _wesOk(WES_HURT); }

let _wesWasAir = false, _wesLandUntil = 0, _wesCrouching = false, _wesCrouchT = 0, _wesRiseT = -999;
let _wesCharging = false, _wesChargeT = 0, _wesChargeRel = -99999;
// Jogador: retorna [folha, quadro] ou null (aí o jogo usa a arte antiga: parado, andar, agachar, carregar).
function wesleyPlayerSprite() {
  const att = clock < actionUntil ? action : '';
  if (!(att === 'mega' && wesleyUlt2Active())) wesleyStopUlt2Sound();
  if (att !== 'superPunch') wesleyStopSuperPunchSound(); // golpe interrompido (dano etc.): corta o som
  if (att !== 'frontTeleport' && att !== 'backTeleport') wesleyStopTauntSound();
  if (clock < stunUntil && _wesOk(WES_HURT)) return [WES_HURT, _wesPick(WES_SEQ.hurt, 1 - (stunUntil - clock) / 500)];
  if (att) {
    const dur = (specs[att] && specs[att].duration) || 350, p = 1 - (actionUntil - clock) / dur;
    if (att === 'mega' && wesleyUlt2Active() && _wesOk(WES_ULT2)) return [WES_ULT2, _wesUlt2Frame(clock - wesUlt2Start)];
    if (att === 'mega' && wesleyMegaActive() && _wesOk(WES_SPECIAL)) return [WES_SPECIAL, _wesMegaFrame(clock - wesMegaStart)];
    if (att === 'parry' && _wesOk(WES_PARRY)) return [WES_PARRY, _wesParryFrame()];
    if (att === 'superPunch' && _wesOk(WES_SPUNCH)) return [WES_SPUNCH, _wesSuperPunchFrame(dur * p)];
    if ((att === 'punch' || att === 'superPunch') && _wesOk(WES_PUNCH)) return [WES_PUNCH, _wesPick(WES_SEQ.punch, p)];
    if (att === 'kick' && _wesOk(WES_KICK)) return [WES_KICK, _wesPick(WES_SEQ.kick, p)];
    if (att === 'superKick' && _wesOk(WES_BAT)) return [WES_BAT, _wesBatFrame(dur * p)];
    if ((att === 'shot' || att === 'superShot') && _wesOk(WES_SPECIAL)) return [WES_SPECIAL, _wesSpecialFrame(dur * p)];
    if ((att === 'frontTeleport' || att === 'backTeleport') && _wesOk(WES_TAUNT))
      return [WES_TAUNT, _wesTauntFrame(1 - (actionUntil - clock) / WES_TAUNT_MS)];
    return null;
  }
  if (att || clock < stunUntil) _wesCharging = false;
  if (charging && _wesOk(WES_CHARGE)) {
    if (!_wesCharging) { _wesCharging = true; _wesChargeT = clock; }
    const t = clock - _wesChargeT, n = WES_CHARGE_INTRO.length * WES_CHARGE_STEP;
    return [WES_CHARGE, t < n ? WES_CHARGE_INTRO[Math.floor(t / WES_CHARGE_STEP)]
      : WES_CHARGE_LOOP[Math.floor((t - n) / WES_CHARGE_LOOP_STEP) % WES_CHARGE_LOOP.length]];
  }
  if (charging) return null;
  if (_wesCharging) { _wesCharging = false; _wesChargeRel = clock; }
  if (_wesOk(WES_CHARGE) && y >= floor - 1 && clock - _wesChargeRel < WES_CHARGE_OUT.length * WES_CHARGE_OUT_STEP)
    return [WES_CHARGE, WES_CHARGE_OUT[Math.floor((clock - _wesChargeRel) / WES_CHARGE_OUT_STEP)]];
  if (_wesOk(WES_CROUCH) && y >= floor - 1) {
    if (held.has('crouch')) {
      if (!_wesCrouching) { _wesCrouching = true; _wesCrouchT = clock; }
      const t = clock - _wesCrouchT;
      return [WES_CROUCH, t < 60 ? 1 : t < 120 ? 2 : 3];
    }
    if (_wesCrouching) { _wesCrouching = false; _wesRiseT = clock; }
    const r = clock - _wesRiseT;
    if (r < 100) return [WES_CROUCH, r < 55 ? 4 : 5];
  } else _wesCrouching = false;
  if (!_wesOk(WES_JUMP)) return null;
  if (y < floor - 1) {
    _wesWasAir = true;
    return [WES_JUMP, _wesPick(WES_SEQ.jump, (vy + 15) / 30)];
  }
  if (_wesWasAir) { _wesWasAir = false; _wesLandUntil = clock + 100; }
  if (clock < _wesLandUntil) return [WES_JUMP, 6];
  return null;
}
// Oponente Wesley (manequim/IA): dano (flash) e ataques de soco/chute.
function wesleyDummySprite(flash, atk, p, hq) {
  if (flash && _wesOk(WES_HURT)) return [WES_HURT, _wesPick(WES_SEQ.hurt, hq)];
  const ws = _wdSprite(); if (ws) return ws; // golpes especiais / carregar energia da IA
  if (_wesOk(WES_PARRY)) { // parry do inimigo: janela (1-5) e, se aparar, comemoração (6-9)
    const ok = clock - (dummy.parryOkAt || -99999);
    if (ok >= 0 && ok < 780) return [WES_PARRY, 6 + Math.min(3, Math.floor(ok / 780 * 4))];
    if (dummy.parryUntil > clock) return [WES_PARRY, 1 + Math.min(4, Math.floor((1 - (dummy.parryUntil - clock) / PARRY_WIN) * 5))];
  }
  if (atk) {
    if (dummy.atkName === 'punch' && _wesOk(WES_PUNCH)) return [WES_PUNCH, _wesPick(WES_SEQ.punch, p)];
    if (dummy.atkName === 'kick' && _wesOk(WES_KICK)) return [WES_KICK, _wesPick(WES_SEQ.kick, p)];
    if (dummy.atkName === 'shot' && _wesOk(WES_SPECIAL)) return [WES_SPECIAL, _wesSpecialFrame(p * 320)];
  }
  return null;
}

// Sons do Wesley: tocam direto com <audio>, sem depender do audio-arquivos.js.
// Cada som tenta os nomes da lista em ordem; o primeiro que existir na pasta audio/ é usado.
const WESLEY_PUNCH_SND = 'audio/wesley-soco.mp3'; // só o primeiro "Huck"
const _wesSnd = {
  hurt: { list: [WESLEY_HURT_SND, 'audio/wesley_tomando_dano.ogg', 'audio/wesley_tomando_dano.mp3', 'audio/wesley-tomando-dano.mp3'], gap: 250, at: -999, ok: null },
  bat: { list: ['audio/wesley-especial2.mp3', 'audio/wesley_especial2.mp3'], gap: 300, at: -999, ok: null, rate: 1.5 }, // 50% mais rápido
  shot: { list: ['audio/wesley-especial.mp3', 'audio/wesleyEspecial.mp3'], gap: 300, at: -999, ok: null, rate: 1.7 }, // rate: velocidade de reprodução (1 = normal)
  fire: { list: ['audio/wesley-disparo.mp3'], gap: 100, at: -999, ok: null },
  punch: { list: [WESLEY_PUNCH_SND, 'audio/weslei_soco.mp3', 'audio/wesley_soco.mp3'], gap: 120, at: -999, ok: null },
  spunch: { list: [WESLEY_SPUNCH_SND, 'audio/socos-socos-socos.mp3'], gap: 300, at: -999, ok: null },
  parry: { list: [WESLEY_PARRY_SND, 'audio/olé-wesley.mp3', 'audio/ole_wesley.mp3'], gap: 300, at: -999, ok: null },
  ult2bgm: { list: [WESLEY_ULT2_BGM], gap: 300, at: -999, ok: null, vol: .66 }, // vol: volume da música (0 a 1), abaixo da voz
  ult2: { list: [WESLEY_ULT2_SND], gap: 300, at: -999, ok: null, vol: 1, rate: 0.75 }, // 0,75 = áudio de 6 s dura 8 s; refinado abaixo pela duração real
  taunt: { list: [WESLEY_TAUNT_SND, 'audio/wesley_provocacao.mp3'], gap: 300, at: -999, ok: null }
};
function _wesPlaySound(k) {
  const st = _wesSnd[k], now = performance.now();
  if (now - st.at < st.gap) return; // evita repetir em golpes seguidos
  st.at = now;
  const tryPlay = i => {
    const src = st.ok || st.list[i];
    if (!src) { console.warn('som do Wesley: arquivo não encontrado em', st.list); return; }
    const a = new Audio(src);
    st.cur = a;
    a.volume = st.vol === undefined ? 1 : st.vol;
    if (st.rate) a.playbackRate = st.rate;
    a.addEventListener('error', () => { if (!st.ok) tryPlay(i + 1); }, { once: true });
    const pr = a.play();
    if (pr && pr.then) pr.then(() => { st.ok = src; }).catch(er => { if (er && er.name === 'NotSupportedError' && !st.ok) tryPlay(i + 1); else console.warn('som do Wesley:', er); });
  };
  tryPlay(0);
}
function wesleyParrySound() { _wesPlaySound('parry'); } // "olé" do parry
// Durante qualquer ultimate (do jogador ou do inimigo) só tocam os sons do ultimate: o som de dano do Wesley fica mudo.
function _wesUltimateRunning() {
  return (action === 'mega' && clock < actionUntil) || (typeof _wd !== 'undefined' && _wd.act === 'mega' && clock < dummy.actionUntil);
}
function wesleyHurtSound() { if (_wesUltimateRunning()) return; _wesPlaySound('hurt'); }
function wesleyPunchSound() { _wesPlaySound('punch'); }
function wesleySuperKickSound() { // áudio do especial R+Chute
  _wesPlaySound('bat');
  // iguala a duração do golpe à do som (chamado logo após o jogo iniciar o golpe)
  if (WES_BAT_SND_MS && typeof specs !== 'undefined' && specs.superKick) {
    _wesSetDur('superKick', WES_BAT_SND_MS);
    actionUntil = clock + WES_BAT_SND_MS;
  }
}
// Momento do dano do especial 2 (262 ms na animação original, acompanha a lentidão). Usado pelo jogo.js.
function wesleyBatHitMs() { return Math.round(262 * WES_BAT_SLOW); }
// Mede a duração real do som do especial 2 (já com a velocidade de reprodução) e ajusta a animação para ela.
(function () {
  const st = _wesSnd.bat;
  const tryLoad = i => {
    const src = st.list[i]; if (!src) return;
    const a = new Audio(); a.preload = 'metadata';
    a.addEventListener('loadedmetadata', () => {
      if (!isFinite(a.duration) || a.duration <= 0) return;
      WES_BAT_SND_MS = Math.max(300, Math.min(3000, Math.round(a.duration * 1000 / (st.rate || 1))));
      WES_BAT_SLOW = WES_BAT_SND_MS / WES_BAT_BASE_MS;
    }, { once: true });
    a.addEventListener('error', () => tryLoad(i + 1), { once: true });
    a.src = src;
  };
  tryLoad(0);
})();
// Para o som do especial base (R) — usado quando R vira outro golpe (ex.: R+Chute).
function wesleyStopShotSound() { const a = _wesSnd.shot.cur; if (a) { try { a.pause(); a.currentTime = 0; } catch (e) {} } }
function wesleyShotSound() { _wesPlaySound('shot'); } // áudio do especial (sacar a arma)
function wesleyFireSound() { _wesPlaySound('fire'); } // estouro do disparo
function wesleyKickSound() { _wesPlaySound('punch'); } // o chute usa o mesmo som do soco
// Som de carregar energia: toca em loop enquanto o botão de carregar está apertado e some suavemente ao soltar.
let _wesChAud = null, _wesChFade = null;
function wesleyChargeSound(on) {
  if (on) {
    if (_wesChFade) { clearInterval(_wesChFade); _wesChFade = null; }
    if (!_wesChAud) { _wesChAud = new Audio(WESLEY_CHARGE_SND); _wesChAud.loop = true; }
    _wesChAud.volume = 1;
    if (_wesChAud.paused) { const pr = _wesChAud.play(); if (pr && pr.catch) pr.catch(er => console.warn('som do Wesley (carregar):', er)); }
  } else if (_wesChAud && !_wesChAud.paused && !_wesChFade) {
    const a = _wesChAud;
    _wesChFade = setInterval(() => {
      a.volume = Math.max(0, a.volume - .25);
      if (a.volume <= 0) { clearInterval(_wesChFade); _wesChFade = null; a.pause(); a.currentTime = 0; a.volume = 1; }
    }, 30);
  }
}
// Som do especial R+soco: o golpe passa a durar o mesmo que o som (chamado logo após o jogo iniciar o golpe).
function wesleySuperPunchSound() {
  _wesPlaySound('spunch');
  if (typeof specs !== 'undefined' && specs.superPunch) {
    _wesSetDur('superPunch', WES_SPUNCH_MS);
    actionUntil = clock + WES_SPUNCH_MS;
  }
}
function wesleyStopSuperPunchSound() { const a = _wesSnd.spunch.cur; if (a && !a.paused) { try { a.pause(); a.currentTime = 0; } catch (e) {} } }
// Mede a duração real do som e usa como duração do golpe.
(function () {
  const st = _wesSnd.spunch;
  const tryLoad = i => {
    const src = st.list[i]; if (!src) return;
    const a = new Audio(); a.preload = 'metadata';
    a.addEventListener('loadedmetadata', () => {
      if (isFinite(a.duration) && a.duration > 0) WES_SPUNCH_MS = Math.max(500, Math.min(8000, Math.round(a.duration * 1000)));
    }, { once: true });
    a.addEventListener('error', () => tryLoad(i + 1), { once: true });
    a.src = src;
  };
  tryLoad(0);
})();
// Super tiro teleguiado (pulo + R): usa a mesma animação e o mesmo som do R. A duração do golpe passa a ser a do R,
// para a animação (clarão aos 160 ms) rodar inteira. Retorna o novo actionUntil (o jogo.js usa para validar o disparo).
function wesleySuperShotStart() {
  wesleyShotSound();
  if (typeof specs !== 'undefined' && specs.shot && specs.superShot) {
    _wesSetDur('superShot', specs.shot.duration);
    actionUntil = clock + specs.shot.duration;
  }
  return actionUntil;
}

// ===== Durações de specs alteradas pelo Wesley: guarda o original e devolve ao trocar de personagem =====
const _wesSpecBak = {};
function _wesSetDur(name, ms) {
  const sp = specs[name]; if (!sp) return;
  if (!(name in _wesSpecBak)) _wesSpecBak[name] = sp.duration;
  sp.duration = ms;
}
function wesleySpecsReset() {
  if (typeof specs === 'undefined') return;
  for (const k in _wesSpecBak) { if (specs[k]) specs[k].duration = _wesSpecBak[k]; delete _wesSpecBak[k]; }
}

// ===== Provocação: no lugar do teleporte (Frente + R / Trás + R). Não anda; não custa energia.
// Se o Wesley não tomar dano até a animação e o áudio terminarem, ganha WES_TAUNT_ENERGY de energia na hora. =====
const WES_TAUNT_ENERGY = 40;
let WES_TAUNT_MS = 1500; // duração = duração do áudio (medida ao carregar)
let _wesTaunt = null;
function wesleyTauntSpec(a) { return Object.assign({}, a, { cost: 0, duration: WES_TAUNT_MS }); }
function wesleyTauntStart(name) {
  _wesTaunt = { name, end: clock + WES_TAUNT_MS, hp0: hp };
  _wesPlaySound('taunt');
}
// Chamado todo quadro pelo jogo.js.
function wesleyTauntTick() {
  const t = _wesTaunt; if (!t) return;
  if (hp < t.hp0 || clock < stunUntil) { _wesTaunt = null; wesleyStopTauntSound(); return; } // tomou dano: perde o bônus
  if (clock >= t.end) {
    _wesTaunt = null;
    energy = clamp(energy + WES_TAUNT_ENERGY, 0, 100);
    effects.push({ x, y: y - 175, t: 550, label: '+' + WES_TAUNT_ENERGY + ' ENERGIA' });
  } else if (action !== t.name) { _wesTaunt = null; wesleyStopTauntSound(); } // golpe cancelado
}
function wesleyStopTauntSound() { const a = _wesSnd.taunt.cur; if (a && !a.paused) { try { a.pause(); a.currentTime = 0; } catch (e) {} } }
(function () {
  const st = _wesSnd.taunt;
  const tryLoad = i => {
    const src = st.list[i]; if (!src) return;
    const a = new Audio(); a.preload = 'metadata';
    a.addEventListener('loadedmetadata', () => {
      if (isFinite(a.duration) && a.duration > 0) WES_TAUNT_MS = Math.max(300, Math.min(8000, Math.round(a.duration * 1000)));
    }, { once: true });
    a.addEventListener('error', () => tryLoad(i + 1), { once: true });
    a.src = src;
  };
  tryLoad(0);
})();
// Ultimate 2: o áudio é desacelerado (playbackRate) para durar exatamente a sequência (WES_ULT2_MAX ms).
(function () {
  const st = _wesSnd.ult2;
  const tryLoad = i => {
    const src = st.list[i]; if (!src) return;
    const a = new Audio(); a.preload = 'metadata';
    a.addEventListener('loadedmetadata', () => {
      if (isFinite(a.duration) && a.duration > 0) st.rate = Math.max(0.25, Math.min(4, a.duration * 1000 / WES_ULT2_MAX));
    }, { once: true });
    a.addEventListener('error', () => tryLoad(i + 1), { once: true });
    a.src = src;
  };
  tryLoad(0);
})();

// =====================================================================
// ===== WESLEY COMO INIMIGO (P2 controlado pela IA) ====================
// A decisão fica em ia-oponente.js (WesleyAI). Aqui ficam os GOLPES ESPECIAIS do inimigo: super soco (11 socos),
// super chute (taco), super tiro teleguiado, parry, ultimate (mega tiro / Dama Rosa) e carregar energia.
// O jogo.js chama: wesleyDummyStart / Tick / Interrupt / Reset / Shift / Immune / Zone / DrawExtra / DrawStand.
// Os sons usam instâncias de áudio próprias, para não serem cortados pelo Wesley do jogador (espelho).
// =====================================================================
const _wd = { act: null, t0: 0, tok: 0, ev: [], ult2: false, sx: 0, sf: 1, sHits: 0, sLast: 0, chOn: false, chT: 0, chRel: -99999 };
const _wdAud = {};
function _wdStop(k) { const a = _wdAud[k]; if (a && !a.paused) { try { a.pause(); a.currentTime = 0; } catch (e) {} } }
function _wdPlay(k) {
  const st = _wesSnd[k], src = st && (st.ok || st.list[0]); if (!src) return;
  _wdStop(k);
  const a = new Audio(src); a.volume = st.vol === undefined ? 1 : st.vol; if (st.rate) a.playbackRate = st.rate;
  _wdAud[k] = a; const pr = a.play(); if (pr && pr.catch) pr.catch(() => {});
}
// Faixa de vida do inimigo: 'green' | 'yellow' | 'red' (mesmas faixas do jogador).
function wesleyDummyZone(h) {
  const c = (typeof LIFE !== 'undefined' && LIFE.wesley) || [20, 30, 150];
  return h > c[1] + c[2] ? 'green' : h > c[2] ? 'yellow' : 'red';
}
function wesleyDummyImmune() { return _wd.act === 'mega' && clock < dummy.actionUntil; } // imune durante o ultimate
function wesleyDummyCancel() {
  const was = _wd.act;
  _wd.act = null; _wd.ult2 = false; _wd.ev = []; _wd.tok++; dummy.wAct = null;
  ['spunch', 'bat', 'shot', 'fire', 'ult2', 'ult2bgm'].forEach(_wdStop);
  if (was) dummy.actionUntil = 0;
}
function wesleyDummyInterrupt() { if (_wd.act && !wesleyDummyImmune()) wesleyDummyCancel(); } // levou dano / parry: golpe cai (ultimate não cai)
function wesleyDummyReset() { wesleyDummyCancel(); wesleyDummyChargeSound(false); dummy.charging = false; _wd.chRel = -99999; }
function wesleyDummyShift(e) { _wd.t0 += e; _wd.sLast += e; _wd.chT += e; _wd.ev.forEach(v => v.at += e); if (_wd.act) dummy.actionUntil += e; }

function wesleyDummyStart(name) {
  const a = specs[name]; if (!a || clock < dummy.actionUntil) return false;
  wesleyDummyCancel();
  const d = () => (x >= dummy.x ? 1 : -1), reach = r => Math.abs(dummy.x - x) <= r + 8 && Math.abs(y - floor) < 80;
  const fire = (at, fn) => _wd.ev.push({ at: clock + at, fn, tok: _wd.tok });
  if (name === 'parry') { // mesma janela do parry do jogador; o sprite usa dummy.parryUntil
    dummy.parryUntil = clock + PARRY_WIN; dummy.actionUntil = clock + PARRY_WIN; dummy.pend = null;
    effects.push({ x: dummy.x, y: floor - 145, t: 480, label: 'PARRY ATIVO' });
    return true;
  }
  _wd.act = name; _wd.t0 = clock; dummy.wAct = name; dummy.pend = null;
  if (name === 'superPunch') {
    dummy.actionUntil = clock + WES_SPUNCH_MS; _wdPlay('spunch');
    wesleySuperPunchHitTimes().forEach(t => fire(t, () => { if (reach(a.range)) aiHitPlayer(WES_SPUNCH_DMG); }));
  } else if (name === 'superKick') {
    const dur = WES_BAT_SND_MS > 0 ? WES_BAT_SND_MS : a.duration;
    dummy.actionUntil = clock + dur; _wdPlay('bat'); _wdPlay('punch');
    fire(wesleyBatHitMs(), () => { if (reach(a.range)) aiHitPlayer(a.dmg); });
  } else if (name === 'superShot') {
    dummy.actionUntil = clock + specs.shot.duration; _wdPlay('shot');
    fire(160, () => { _wdPlay('fire'); eshots.push({ x: dummy.x + d() * 100, y: floor - 92, vx: d() * 12, damage: a.dmg, size: 32, life: 1600, homing: true }); });
  } else if (name === 'mega') {
    if (wesleyDummyZone(dummy.hp) !== 'red') { // vida verde/amarela: mega tiro de arma
      dummy.actionUntil = clock + WES_MEGA_T.total; _wdPlay('shot');
      fire(WES_MEGA_T.fire, () => {
        _wdPlay('fire');
        eshots.push({ x: dummy.x + d() * 100, y: floor - 92, vx: d() * 10, damage: a.dmg, size: 70, life: 1600, wmega: true });
        zImpacts.push({ t: clock, x: dummy.x + d() * 90, y: floor - 92, k: 0 }); zShake = Math.max(zShake, 10);
      });
    } else { // vida vermelha: ultimate 2 — Dama Rosa
      _wd.ult2 = true; _wd.sHits = 0; _wd.sf = d(); _wd.sLast = clock;
      _wd.sx = clamp(dummy.x + d() * (70 + WES_STAND_GAP), 55, 905);
      dummy.actionUntil = clock + _wesUlt2Total(); _wdPlay('ult2'); _wdPlay('ult2bgm');
    }
  } else { wesleyDummyCancel(); return false; }
  return true;
}
// Todo quadro (chamado pelo aiStep): dispara os eventos agendados e, no ultimate 2, move a Dama Rosa e aplica os 20 socos.
function wesleyDummyTick(dt) {
  if (!_wd.act) return;
  for (const e of _wd.ev.slice()) if (clock >= e.at) { _wd.ev.splice(_wd.ev.indexOf(e), 1); if (e.tok === _wd.tok) e.fn(); }
  if (_wd.act === 'mega' && _wd.ult2) {
    const t = clock - _wd.t0 - WES_ULT2_START;
    if (t >= 0) {
      const step = WES_STAND_SPEED * Math.min(50, Math.max(0, clock - _wd.sLast)) / 1000; _wd.sLast = clock;
      const dd = x >= dummy.x ? 1 : -1;
      let target = x - dd * 95;
      if ((target - dummy.x) * dd < 70 + WES_STAND_GAP) target = dummy.x + dd * (70 + WES_STAND_GAP);
      target = clamp(target, 55, 905);
      _wd.sf = dd; _wd.sx += clamp(target - _wd.sx, -step, step);
      const u = t - WES_STAND_APPEAR;
      while (_wd.sHits < WES_STAND_HITS && u >= _wd.sHits * WES_STAND_PUNCH_MS + WES_STAND_PUNCH_MS * .5) {
        const i = _wd.sHits++;
        playSnd('punch', WES_STAND_SND_VOL);
        if (Math.abs(x - _wd.sx) <= WES_STAND_RANGE) {
          aiHitPlayer(_wesStandDmg(i), true); // não pode ser aparado
          zShake = Math.max(zShake, i === WES_STAND_HITS - 1 ? 12 : 3);
          if (i === WES_STAND_HITS - 1) zImpacts.push({ t: clock, x, y: floor - 90, k: 2 });
        }
      }
    }
  }
  if (clock >= dummy.actionUntil) { const was = _wd.act; wesleyDummyCancel(); dummy.actionUntil = 0; if (was) { /* acabou naturalmente */ } }
}
// Carregar energia (som em loop só do inimigo, mais baixo).
let _wdChAud = null;
function wesleyDummyChargeSound(on) {
  if (on && !_wd.chOn) { _wd.chOn = true; _wd.chT = clock; }
  if (!on && _wd.chOn) { _wd.chOn = false; _wd.chRel = clock; }
  if (on) {
    if (!_wdChAud) { _wdChAud = new Audio(WESLEY_CHARGE_SND); _wdChAud.loop = true; _wdChAud.volume = .45; }
    if (_wdChAud.paused) { const pr = _wdChAud.play(); if (pr && pr.catch) pr.catch(() => {}); }
  } else if (_wdChAud && !_wdChAud.paused) { try { _wdChAud.pause(); _wdChAud.currentTime = 0; } catch (e) {} }
}
// Sprite do inimigo: [folha, quadro] ou null (aí o jogo usa soco/chute/parado como antes).
function _wdSprite() {
  const ms = clock - _wd.t0;
  if (_wd.act && clock < dummy.actionUntil) {
    if (_wd.act === 'superPunch' && _wesOk(WES_SPUNCH)) return [WES_SPUNCH, _wesSuperPunchFrame(ms)];
    if (_wd.act === 'superKick' && _wesOk(WES_BAT)) return [WES_BAT, _wesBatFrame(ms)];
    if (_wd.act === 'superShot' && _wesOk(WES_SPECIAL)) return [WES_SPECIAL, _wesSpecialFrame(ms)];
    if (_wd.act === 'mega') {
      if (_wd.ult2 && _wesOk(WES_ULT2)) return [WES_ULT2, _wesUlt2Frame(ms)];
      if (!_wd.ult2 && _wesOk(WES_SPECIAL)) return [WES_SPECIAL, _wesMegaFrame(ms)];
    }
  }
  if (_wesOk(WES_PARRY)) {
    const ok = clock - (dummy.parryOkAt || -99999);
    if (ok >= 0 && ok < 780) return [WES_PARRY, 6 + Math.min(3, Math.floor(ok / 780 * 4))];
    if (dummy.parryUntil > clock) return [WES_PARRY, 1 + Math.min(4, Math.floor((1 - (dummy.parryUntil - clock) / PARRY_WIN) * 5))];
  }
  if (_wesOk(WES_CHARGE)) {
    if (dummy.charging) {
      const t = clock - _wd.chT, n = WES_CHARGE_INTRO.length * WES_CHARGE_STEP;
      return [WES_CHARGE, t < n ? WES_CHARGE_INTRO[Math.floor(t / WES_CHARGE_STEP)]
        : WES_CHARGE_LOOP[Math.floor((t - n) / WES_CHARGE_LOOP_STEP) % WES_CHARGE_LOOP.length]];
    }
    const r = clock - _wd.chRel;
    if (r >= 0 && r < WES_CHARGE_OUT.length * WES_CHARGE_OUT_STEP) return [WES_CHARGE, WES_CHARGE_OUT[Math.floor(r / WES_CHARGE_OUT_STEP)]];
  }
  return null;
}
function wesleyDummyDrawExtra(g) { if (_wd.act === 'superKick' && clock < dummy.actionUntil) drawWesleyBatFlight(g, clock - _wd.t0); } // taco voando
function wesleyDummyDrawStand(g) { // Dama Rosa do inimigo
  if (!(_wd.act === 'mega' && _wd.ult2) || !_wesOk(WES_STAND)) return;
  const t = clock - _wd.t0 - WES_ULT2_START; if (t < 0 || t > WES_STAND_MS) return;
  const al = Math.max(0, Math.min(1, t / 300, (WES_STAND_MS - t) / 400));
  g.save(); g.globalAlpha = al;
  g.fillStyle = 'rgba(16,24,39,.42)'; g.beginPath(); g.ellipse(Math.round(_wd.sx), floor + 3, 34, 6, 0, 0, Math.PI * 2); g.fill();
  g.translate(Math.round(_wd.sx), floor); g.scale(_wd.sf, 1);
  g.shadowColor = '#ff5ad8'; g.shadowBlur = 20;
  drawWesleySheet(g, WES_STAND, _wesStandFrame(t));
  g.restore();
}
