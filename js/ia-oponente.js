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

  // Dificuldade pelo endereço: jogo.html?ia=dificil
  try {
    const q = new URLSearchParams(location.search).get('ia');
    if (q && PRESETS[q]) AI.difficulty = q;
  } catch (e) { /* ignora */ }

  AI.reset();
  window.OpponentAI = AI;
})();
