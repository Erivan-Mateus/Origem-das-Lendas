/* =====================================================================
   ia_oponente.js — CÉREBRO DO PLAYER 2 (modo VS)
   ---------------------------------------------------------------------
   Este arquivo só DECIDE o que o oponente faz. O jogo (o HTML) cuida de
   mover o boneco, tocar as animações, causar dano, etc.

   COMO USAR
   - Deixe este arquivo na MESMA PASTA do arquivo .html do jogo.
   - O jogo carrega ele sozinho. Se o arquivo não for encontrado, o modo VS
     volta ao comportamento antigo (manequim que ataca a cada 3 segundos).
   - Dificuldade: "facil", "normal" ou "dificil".
       * Mude a linha DIFICULDADE_PADRAO aqui embaixo, ou
       * abra o jogo com  ?ia=dificil  no final do endereço, ou
       * no console do navegador:  OpponentAI.setDifficulty('dificil')

   O QUE O JOGO MANDA PARA A IA (objeto "s", a cada quadro)
     s.self    -> o oponente (P2): x, hp, hpMax, energy,
                  canAct (true = pode começar um golpe agora),
                  busy (está no meio de um golpe), stunned (levou dano agora),
                  facing, character
     s.enemy   -> o jogador (P1): x, y, hp, hpMax, energy, action,
                  attacking, stunned, airborne, crouching, parrying,
                  facing, character
     s.specs   -> punch / kick / shot / parry: { range, dmg, cost, duration }
     s.arena   -> { min, max }  (limites da arena no eixo x)
     s.round   -> { number, wins:[p1,p2], time, mode }
     dt        -> segundos desde o último quadro

   O QUE A IA DEVOLVE
     { move: -1..1,  attack: null | 'punch' | 'kick' | 'shot' }
       move   -> -1 anda para a esquerda, 1 para a direita, 0 fica parado
                 (valores entre 0 e 1 andam mais devagar)
       attack -> golpe que quer começar agora (o jogo só aceita se
                 s.self.canAct for true e houver energia)

   PARA CRIAR OUTRA PERSONALIDADE: copie o objeto OpponentAI, mude o nome e
   a função decide(), e troque a linha "window.OpponentAI = ..." no fim.
   ===================================================================== */
(function () {
  'use strict';

  const DIFICULDADE_PADRAO = 'normal';

  // Ajustes de cada dificuldade
  //  reaction     tempo médio (s) entre uma decisão e outra (menor = mais esperta)
  //  gap          pausa mínima (s) entre dois golpes (evita combo infinito)
  //  speed        velocidade de andar (1 = máxima)
  //  shotChance   chance de parar e atirar quando está longe e tem energia
  //  kickChance   chance de usar chute em vez de soco quando está colada
  //  retreatChance chance de recuar depois de atacar (bate e foge)
  //  parryRespect chance de NÃO atacar quando o jogador está com parry ativo
  //  dodgeChance  chance de recuar quando o jogador começa um golpe perto dela
  const PRESETS = {
    facil:   { reaction: 0.38, gap: 1.40, speed: 0.75, shotChance: 0.20, kickChance: 0.25, retreatChance: 0.20, parryRespect: 0.00, dodgeChance: 0.05 },
    normal:  { reaction: 0.24, gap: 0.95, speed: 0.90, shotChance: 0.35, kickChance: 0.30, retreatChance: 0.35, parryRespect: 0.50, dodgeChance: 0.20 },
    dificil: { reaction: 0.14, gap: 0.75, speed: 1.00, shotChance: 0.50, kickChance: 0.35, retreatChance: 0.50, parryRespect: 0.85, dodgeChance: 0.40 }
  };

  const rnd = (a, b) => a + Math.random() * (b - a);

  const AI = {
    name: 'IA Padrão',
    difficulty: DIFICULDADE_PADRAO,

    // estado interno (timers e plano atual)
    _think: 0,        // tempo até a próxima decisão
    _gap: 0,          // tempo até poder atacar de novo
    _retreat: 0,      // tempo restante de recuo
    _plan: 'approach',

    setDifficulty(d) {
      if (PRESETS[d]) { this.difficulty = d; this.reset(); }
      return this.difficulty;
    },

    // O jogo chama isso no começo de cada round.
    reset() {
      this._think = 0;
      this._gap = 0.5;
      this._retreat = 0;
      this._plan = 'approach';
    },

    // Escolhe o plano (muda a cada "reaction" segundos)
    _choose(s, P, dist) {
      const me = s.self, en = s.enemy, R = s.specs;

      if (this._retreat > 0) return 'retreat';

      // jogador começou um golpe perto: às vezes recua para não apanhar
      if (en.attacking && dist <= (R.kick.range + 25) && Math.random() < P.dodgeChance) {
        this._retreat = rnd(0.25, 0.45);
        return 'retreat';
      }
      // jogador com parry ativo: espera em vez de atacar
      if (en.parrying && Math.random() < P.parryRespect) return 'wait';

      if (dist <= R.kick.range + 10) return 'melee';

      // longe e com energia: às vezes para e atira
      if (me.energy >= R.shot.cost && dist > 200 && dist < 700 && Math.random() < P.shotChance) return 'zone';

      return 'approach';
    },

    // Chamada a cada quadro pelo jogo.
    decide(s, dt) {
      const P = PRESETS[this.difficulty] || PRESETS.normal;
      const me = s.self, en = s.enemy, R = s.specs;

      this._think -= dt;
      this._gap -= dt;
      this._retreat -= dt;

      const dist = Math.abs(en.x - me.x);
      const toward = Math.sign(en.x - me.x) || 1;

      if (this._think <= 0) {
        this._think = P.reaction * rnd(0.7, 1.3);
        this._plan = this._choose(s, P, dist);
      }

      const ready = me.canAct && this._gap <= 0;
      let move = 0, attack = null;

      switch (this._plan) {
        case 'approach':
          move = toward * P.speed;
          break;

        case 'retreat': {
          move = -toward * P.speed;
          // encurralada na parede: não adianta recuar, parte para a luta
          const blocked = (move < 0 && me.x <= s.arena.min + 4) || (move > 0 && me.x >= s.arena.max - 4);
          if (blocked) { this._plan = 'melee'; move = 0; }
          break;
        }

        case 'wait':
          move = dist < R.kick.range + 40 ? -toward * P.speed * 0.6 : 0;
          break;

        case 'zone':
          if (me.energy >= R.shot.cost) { if (ready) attack = 'shot'; }
          else this._plan = 'approach';
          break;

        case 'melee':
          if (dist <= R.punch.range * 0.95) {
            if (ready) attack = Math.random() < P.kickChance ? 'kick' : 'punch';
          } else if (dist <= R.kick.range * 0.95) {
            if (ready) attack = 'kick';
          } else {
            move = toward * P.speed * 0.6; // chegou perto demais ou longe demais: ajusta
          }
          break;
      }

      // jogador atordoado e ao alcance: aproveita
      if (!attack && ready && en.stunned && dist <= R.kick.range * 0.95) {
        attack = dist <= R.punch.range * 0.95 ? 'punch' : 'kick';
      }

      if (attack) {
        this._gap = P.gap * rnd(0.8, 1.2);
        if (Math.random() < P.retreatChance) {      // bate e foge
          this._retreat = rnd(0.5, 1.0);
          this._plan = 'retreat';
          this._think = 0.15;
        }
      }

      return { move, attack };
    }
  };

  // =====================================================================
  // IA DO WESLEY MAFIOSO (usada quando o Wesley é o oponente / P2)
  // ---------------------------------------------------------------------
  // Diferenças da IA padrão: CARREGA energia quando o jogador está longe, usa os ESPECIAIS
  // (super soco, super chute, super tiro teleguiado, parry) e o ULTIMATE (R+R):
  //   - vida verde/amarela -> mega tiro de arma
  //   - vida VERMELHA      -> Dama Rosa, com RED_ULT_CHANCE (20%) de chance
  // A chance é sorteada UMA vez cada vez que a energia chega a 100. Se não sair, ele gasta a
  // energia nos outros especiais e carrega de novo (novo sorteio quando voltar a 100).
  // =====================================================================
  const RED_ULT_CHANCE = 0.20;   // chance de usar a Dama Rosa quando está com a vida vermelha

  //  special     chance (por decisão) de usar super soco/chute quando está colado
  //  superShot   chance de usar o super tiro teleguiado de longe
  //  parry       chance de dar parry quando o jogador começa um golpe perto
  //  chargeBelow só carrega energia se estiver abaixo disso
  //  chargeDist  só carrega se o jogador estiver mais longe que isso (px)
  //  chargeChance chance de começar a carregar (por decisão)
  //  gunChance   chance de usar o mega tiro de arma (vida verde/amarela) quando chega a 100
  //  saveChance  chance de GUARDAR energia (sem gastar em especiais) ao passar de 60, para chegar a 100 e tentar o ultimate
  const WES_PRESETS = {
    facil:   { reaction: 0.38, gap: 1.40, speed: 0.75, shotChance: 0.20, kickChance: 0.25, retreatChance: 0.20, parryRespect: 0.00, dodgeChance: 0.05, special: 0.20, superShot: 0.15, parry: 0.10, chargeBelow: 60, chargeDist: 420, chargeChance: 0.30, gunChance: 0.30, saveChance: 0.30 },
    normal:  { reaction: 0.24, gap: 0.95, speed: 0.90, shotChance: 0.30, kickChance: 0.30, retreatChance: 0.30, parryRespect: 0.50, dodgeChance: 0.15, special: 0.35, superShot: 0.30, parry: 0.30, chargeBelow: 70, chargeDist: 380, chargeChance: 0.50, gunChance: 0.50, saveChance: 0.50 },
    dificil: { reaction: 0.14, gap: 0.75, speed: 1.00, shotChance: 0.40, kickChance: 0.35, retreatChance: 0.40, parryRespect: 0.85, dodgeChance: 0.25, special: 0.50, superShot: 0.45, parry: 0.50, chargeBelow: 80, chargeDist: 340, chargeChance: 0.70, gunChance: 0.70, saveChance: 0.65 }
  };

  const WES = {
    name: 'IA Wesley Mafioso',
    difficulty: DIFICULDADE_PADRAO,
    _think: 0, _gap: 0, _retreat: 0, _plan: 'approach',
    _ult: null,        // { zone, go } sorteio do ultimate
    _wasFull: false,
    _saving: false,    // true = guardando energia para o ultimate
    _wasHigh: false,

    reset() {
      this._think = 0; this._gap = 0.5; this._retreat = 0; this._plan = 'approach';
      this._ult = null; this._wasFull = false; this._saving = false; this._wasHigh = false;
    },

    _choose(s, P, dist) {
      const me = s.self, en = s.enemy, R = s.specs;
      const can = k => R[k] && me.energy >= R[k].cost && !(this._saving && k !== 'parry'); // guardando energia: só parry gasta

      if (this._ult && this._ult.go && me.canAct) return 'mega';
      if (this._retreat > 0) return 'retreat';

      // jogador começou um golpe perto: parry, recuo ou nada
      if (en.attacking && dist <= R.kick.range + 25) {
        if (can('parry') && Math.random() < P.parry) return 'parry';
        if (Math.random() < P.dodgeChance) { this._retreat = rnd(0.25, 0.45); return 'retreat'; }
      }
      if (en.parrying && Math.random() < P.parryRespect) return 'wait';

      // colado: tenta um especial antes do ataque comum (jogador atordoado = mais chance)
      if (dist <= R.kick.range + 10) {
        const k = en.stunned ? 1.8 : 1;
        if (can('superPunch') && dist <= R.superPunch.range * 0.9 && Math.random() < P.special * k) return 'superPunch';
        if (can('superKick') && dist <= R.superKick.range * 0.9 && Math.random() < P.special * 0.8 * k) return 'superKick';
        return 'melee';
      }

      // longe: super tiro teleguiado, tiro comum ou carregar energia
      if (can('superShot') && dist > 220 && Math.random() < P.superShot) return 'superShot';
      if (can('shot') && dist > 200 && dist < 700 && Math.random() < P.shotChance) return 'zone';

      // já estava carregando: continua enquanto estiver seguro
      if (this._plan === 'charge' && me.energy < 100 && dist > P.chargeDist - 80 && !en.attacking && Math.random() < 0.88) return 'charge';
      const cBelow = this._saving ? 100 : P.chargeBelow, cDist = this._saving ? P.chargeDist - 100 : P.chargeDist;
      if (me.energy < cBelow && dist > cDist && !en.airborne && Math.random() < P.chargeChance) return 'charge';

      return 'approach';
    },

    decide(s, dt) {
      const P = WES_PRESETS[this.difficulty] || WES_PRESETS.normal;
      const me = s.self, en = s.enemy, R = s.specs;

      this._think -= dt; this._gap -= dt; this._retreat -= dt;

      const dist = Math.abs(en.x - me.x);
      const toward = Math.sign(en.x - me.x) || 1;

      // ao passar de 60 de energia, às vezes decide guardar para o ultimate; abaixo de 30 desiste
      const high = me.energy >= 60;
      if (high && !this._wasHigh) this._saving = Math.random() < P.saveChance;
      if (me.energy < 30) this._saving = false;
      this._wasHigh = high;

      // sorteio do ultimate: cada vez que a energia chega a 100
      const full = R.mega && me.energy >= R.mega.cost;
      if (full && !this._wasFull) {
        const zone = me.zone;
        this._ult = { zone, go: Math.random() < (zone === 'red' ? RED_ULT_CHANCE : P.gunChance) };
        this._saving = false; // chegou a 100: sorteou; se não saiu, gasta nos outros especiais
      }
      if (!full) this._ult = null;
      this._wasFull = full;
      // mudou de faixa de vida depois do sorteio: sorteia de novo com a regra da faixa nova
      if (this._ult && this._ult.zone !== me.zone) {
        this._ult = { zone: me.zone, go: Math.random() < (me.zone === 'red' ? RED_ULT_CHANCE : P.gunChance) };
      }

      if (this._think <= 0) {
        this._think = P.reaction * rnd(0.7, 1.3);
        this._plan = this._choose(s, P, dist);
      }

      const ready = me.canAct && this._gap <= 0;
      let move = 0, attack = null, charge = false;

      switch (this._plan) {
        case 'approach': move = toward * P.speed; break;

        case 'retreat': {
          move = -toward * P.speed;
          const blocked = (move < 0 && me.x <= s.arena.min + 4) || (move > 0 && me.x >= s.arena.max - 4);
          if (blocked) { this._plan = 'melee'; move = 0; }
          break;
        }

        case 'wait': move = dist < R.kick.range + 40 ? -toward * P.speed * 0.6 : 0; break;

        case 'charge':
          if (me.energy >= 100 || dist < P.chargeDist - 120 || en.attacking) this._plan = 'approach';
          else charge = true;
          break;

        case 'zone':
          if (me.energy >= R.shot.cost) { if (ready) attack = 'shot'; } else this._plan = 'approach';
          break;

        case 'superShot':
          if (me.energy >= R.superShot.cost) { if (me.canAct) { attack = 'superShot'; this._plan = 'approach'; this._gap = P.gap * 1.2; } }
          else this._plan = 'approach';
          break;

        case 'parry':
          if (me.canAct && me.energy >= R.parry.cost) { attack = 'parry'; this._plan = 'wait'; this._gap = 0.3; }
          else this._plan = 'melee';
          break;

        case 'superPunch':
        case 'superKick': {
          const sp = R[this._plan];
          if (me.energy < sp.cost || dist > sp.range * 1.1) { this._plan = 'melee'; break; }
          if (dist > sp.range * 0.9) { move = toward * P.speed * 0.6; break; }
          if (me.canAct) { attack = this._plan; this._plan = 'melee'; this._gap = P.gap * 1.5; }
          break;
        }

        case 'mega':
          if (this._ult && this._ult.go && me.energy >= R.mega.cost) {
            if (me.canAct) { attack = 'mega'; this._ult = null; this._plan = 'approach'; this._gap = 2; }
          } else this._plan = 'approach';
          break;

        case 'melee':
          if (dist <= R.punch.range * 0.95) {
            if (ready) attack = Math.random() < P.kickChance ? 'kick' : 'punch';
          } else if (dist <= R.kick.range * 0.95) {
            if (ready) attack = 'kick';
          } else move = toward * P.speed * 0.6;
          break;
      }

      // jogador atordoado e ao alcance: aproveita
      if (!attack && !charge && ready && en.stunned && dist <= R.kick.range * 0.95) {
        attack = dist <= R.punch.range * 0.95 ? 'punch' : 'kick';
      }

      // só golpes comuns e tiro comum têm "bate e foge" (especiais já são longos)
      if (attack && (attack === 'punch' || attack === 'kick' || attack === 'shot')) {
        this._gap = P.gap * rnd(0.8, 1.2);
        if (Math.random() < P.retreatChance) { this._retreat = rnd(0.5, 1.0); this._plan = 'retreat'; this._think = 0.15; }
      }

      return { move, attack, charge };
    }
  };

  // Despachante: o jogo continua chamando window.OpponentAI; a IA certa é escolhida pelo personagem do P2.
  const DISPATCH = {
    name: 'IA (por personagem)',
    get difficulty() { return AI.difficulty; },
    setDifficulty(d) {
      if (PRESETS[d]) { AI.difficulty = d; WES.difficulty = d; AI.reset(); WES.reset(); }
      return AI.difficulty;
    },
    reset() { AI.reset(); WES.reset(); },
    decide(s, dt) {
      return (s.self.character === 'wesley' ? WES : AI).decide(s, dt);
    }
  };

  // Dificuldade pelo endereço: jogo.html?ia=dificil
  try {
    const q = new URLSearchParams(location.search).get('ia');
    if (q && PRESETS[q]) { AI.difficulty = q; WES.difficulty = q; }
  } catch (e) { /* ignora */ }

  AI.reset(); WES.reset();
  window.OpponentAI = DISPATCH;
})();
