# King of Gangues Bangues — projeto dividido em pastas

Esta é a versão do `index (1).html` enviado pelo usuário, reorganizada em arquivos externos sem mudar intencionalmente as mecânicas do jogo.

## Iniciar

**Método recomendado:** abra a pasta no VS Code e utilize a extensão *Live Server* (ou publique o conteúdo da pasta em um servidor estático, como GitHub Pages).

Alternativa via Python (no terminal dentro da pasta):

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000/` no navegador.

> Evite abrir o HTML diretamente por `file://`: o áudio externo depende do carregamento via HTTP, e hospedar o projeto evita restrições de segurança dos navegadores.

## Onde editar

- `index.html`: estrutura da página, botões e canvas.
- `css/style.css`: aparência, menus e HUD.
- `js/jogo.js`: motor do combate, movimentos, efeitos e lógica do precipício.
- `js/ia-oponente.js`: inteligência artificial do adversário.
- `js/selecao-mapas.js`: comportamento de seleção dos cenários e eventos finais.
- `js/personagens/catalogo.js`: roster de personagens.
- `js/personagens/zusk.js`, `espantalho.js`, `wesley-mafioso.js`: referências às artes individuais.
- `js/config/combate.js`: **alcance e dano dos ataques e vida colorida de cada lutador**.
- `js/modo-historia.js`: **fases do Modo História** (lista `FASES`, com passos de título, fala, andar, transição e fim).
- `js/personagens/golem-roxo.js`: Golem Roxo (chefe da Fase 1; alcance, dano e velocidade no topo do arquivo).
- `js/mapas.js`: nomes, descrições, ordem e imagens de todos os mapas.
- `js/audio-arquivos.js`: caminhos dos sons.
- `personagens/`: sprites (atlas e retratos) por lutador.
- `mapas/`: 7 imagens de mapas, em sua resolução e formato originais.
- `audio/`: MP3 de soco, chute e grito do Ultimate.
- `interface/`: fundos, molduras e botões.

## Observação importante

O tamanho do **index.html** é pequeno porque os recursos foram extraídos. O conjunto de sprites, músicas e fundos continua ocupando espaço no disco. O navegador pode cachear os arquivos separadamente.

Os arquivos JavaScript usam `<script>` clássico para manter compatibilidade com o código original e conservar as dependências globais. Não converta cada arquivo para `type="module"` isoladamente sem atualizar a arquitetura.

## Correção do Modo História (16/11/2026)

- Corrigido o conflito entre os botões dos saves do Modo História e os botões de seleção de mapas: os saves usam `data-save-slot` e a seleção de mapas só processa `data-slot` dentro da própria tela de mapas.
- **Começar / Novo jogo:** inicia a Fase 1. **Continuar:** abre a fase associada ao save, quando disponível.
- Após a vitória sobre o Golem Roxo, o save é atualizado para o Capítulo 2. Como o Capítulo 2 ainda não está implementado, a interface agora exibe **Rejogar fase 1** em vez de oferecer um botão Continuar que não pode iniciar uma fase nova. Rejogar não apaga o progresso do save.
- Durante os diálogos, clique no balão ou aperte **Enter**, **Espaço** ou **Z** para avançar.
- Saves ficam guardados no armazenamento local do navegador. Usar um servidor estático (por exemplo, Live Server) mantém a origem estável para carregar arquivos e recuperar os saves.

## Batalha do Golem Roxo em duas etapas (16/11/2026)

No Modo História, a **primeira luta** do Golem Roxo tem 10 HP verde + 20 HP amarela + 20 HP vermelha (50 no total). Ao vencer, o Golem cai e Zusk diz: “Isso ae viu doutoutor torronio vc perdeu e minha floresta ta salva”. O Golem então se levanta, recupera 500 HP em **uma barra vermelha** e grita “GAARRRRRBUUUUGAAAAA”. Só depois do grito a **segunda luta** começa, com os 500 HP. A fase e o progresso do save só são concluídos após a vitória nessa segunda luta.

Se Zusk perder, o botão **Recomeçar** refaz a etapa da luta em que estava. O valor original de vida do Golem nos outros modos é restaurado ao sair da história.

## Martelada do Golem Roxo (sprites novos)

- A arte original com os **5 quadros do martelo** está em `personagens/golem-roxo/martelada.png`, sem alteração da ilustração recebida. O jogo carrega a cópia `martelada-jogo.webp` com as bordas das partículas suavizadas, evitando cortes retangulares entre quadros.
- O Golem utiliza a sequência durante o **golpe forte** (tipo `kick`, controlado pela IA): preparação, martelo levantado, descida, impacto e recuperação. O golpe básico continua disponível.
- O dano acontece no **quadro do impacto**, após a preparação do golpe (telegráfico), com tremor de câmera e onda de poeira no chão.
- A IA prioriza marteladas em curta distância. A animação funciona nas **duas lutas do Modo História** e em confrontos com o Golem nos demais modos.
- As configurações de escala, quadros e velocidade ficam no topo de `js/personagens/golem-roxo.js`.


## Desfecho da Fase 1 + grito do Golem (nova atualização)

- O arquivo `audio/golem-ressurgimento.mp3` é o som `garburgars.MP3` enviado pelo autor, incorporado integralmente; reproduz ao Golem se levantar, junto ao balão **GAARRRRRBUUUUGAAAAA**. A cena de grito dura ~8 s para que o áudio toque inteiro antes da segunda luta.
- **Primeira luta:** 10 verde / 20 amarela / 20 vermelha. Se perder, ainda aparece o botão Recomeçar; se vencer, Zusk comemora e o Golem revive com 500 de vida vermelha.
- **Segunda luta:** ao perder, o jogo **não mostra Game Over**. Zusk desmaia, a tela escurece, ele desperta na **Floresta Contaminada** (já presente em `mapas/floresta-contaminada.png`), corre até o **Precipício Contaminado** (`mapas/precipicio-contaminado.png`), é surpreendido pelo Golem, recebe um soco e despenca do penhasco. A cena termina com o título **FIM DA FASE 1**.
- O save avança para a fase 2 **depois de assistir à cena final**, não antes. Se o jogador derrotar o Golem de 500 HP, permanece o final alternativo por vitória, concluindo igualmente a fase 1.
- Tudo é controlado por passos no arquivo `js/modo-historia.js`, sem alterar a seleção de mapas, o jogo versus nem o modo treino.


## Mapa de fases do Modo História

- Abra **Modo História**, escolha um dos **3 saves**, então **Mapa de fases**. Saves novos também abrem o mapa antes de iniciar a primeira fase.
- O mapa apresenta **Floresta Serena (Fase 1)**, **Milharal (Fase 2)** e **Cidade (Fase 3)**, conectados visualmente. Fases concluídas ficam verdes e podem ser **rejogadas**. A fase atual fica dourada e, se implementada, pode ser iniciada; fases futuras ficam bloqueadas.
- As fases **1 e 2** estão jogáveis. O Milharal fica disponível após concluir a Fase 1; a Cidade é o próximo destino, ainda sem fase jogável.
- A conclusão atualiza `arena_story_slots` no `localStorage`. Rejogar uma fase concluída não diminui o capítulo alcançado: o avanço usa `Math.max`.
- O retorno ao fim da Fase 1 agora é para o mapa do save escolhido.
- Para adicionar um capítulo, insira-o em `FASES` de `js/modo-historia.js`. As entradas visuais do mapa estão em `STORY_MAP_POINTS` no `js/jogo.js`.


## Capítulo 2 — O Milharal (implementado)

- No Modo História, conclua a **Fase 1** num save e escolha **O Milharal** no mapa. Não é necessário criar um novo save.
- Zusk desperta no milharal e vê o Espantalho parado. Os diálogos reproduzem as falas fornecidas e o Espantalho torna-se o primeiro inimigo.
- **Perder para o Espantalho:** a luta reinicia automaticamente, sem perder o progresso do save.
- **Vencer o Espantalho:** inicia os diálogos de aliança, Wesley grita de longe, entra no cenário e começa a segunda luta.
- **Wesley Mafioso:** ao chegar a **30 HP ou menos**, tem **50% de chance** de ativar a Ultimate Mega Ultra 2 da Dama Rosa, **uma única tentativa de sorteio por luta**. Se a chance der certo, golpes que ultrapassariam 30 HP param momentaneamente em 30 para a animação. Se não der certo, recebe dano normalmente e pode ser derrotado. Ele não ativa Dama Rosa pela IA comum nesta luta fora desse sorteio. As novas tentativas contra Wesley ganham um novo sorteio.
- **Perder para Wesley:** Zusk fala «MORRI», Wesley responde «7.7.7 CARALHO», aparece «DERROTA · TENTE NOVAMENTE» e o jogo reinicia somente a luta do Wesley.
- **Vencer Wesley:** Zusk pede ajuda, Wesley concorda em ir para a cidade da Zenga e a conclusão registra **Capítulo 3** no save. A Cidade permanece visível no mapa como próxima fase, ainda em desenvolvimento.
- Os saves são independentes. Rejogar os capítulos 1 e 2 não reduz o avanço salvo.

## Desbloqueio de personagens secretos

- **Zusk** permanece disponível desde o início. **Espantalho** e **Wesley Mafioso** aparecem em cinza, com cadeado e nome `?????`, na seleção de personagem (inclusive seleção de P2/manequim).
- A vitória contra o Espantalho no Capítulo 2 o desbloqueia imediatamente; a vitória contra Wesley o desbloqueia separadamente. Perder não desbloqueia. A História continua usando os personagens como adversários normalmente.
- A conquista é registrada no `localStorage` em `arena_character_unlocks`, independente dos 3 saves. Rejogar, recomeçar um save ou mudar de modo não revoga os personagens.
- Compatibilidade com saves anteriores: caso um save antigo já tenha concluído o Capítulo 2 (`chapter >= 3`), ambos já aparecerão desbloqueados.
- Seleção por mouse, toque ou teclado respeita os cadeados; os bloqueios também se aplicam aos personagens disponíveis no modo treino e nas lutas normais.


## Versus local — Jogador 2 com todos os golpes (17/11/2026)

**Alteração principal:** o P2 humano agora usa `js/jogador2.js`, com entrada de comandos independente da IA e do P1. O arquivo anterior deixava o P2 usar apenas soco, chute e tiro comum. Agora as três opções do elenco podem andar, pular, agachar, carregar energia, atacar, fazer combos, aparar, usar especiais e ativar a ultimate com as animações dos sprites existentes. O motor de adversários controlados pela IA e o Modo História permanecem independentes.

| Ação | P1 | P2 |
| --- | --- | --- |
| Mover | A / D | ← / → |
| Pular | W | ↑ |
| Agachar | S | ↓ |
| Soco | E | P |
| Chute | Q | O |
| Carregar energia | Shift | L |
| Tiro comum | R | I |
| Super soco | E + R | P + I |
| Super chute | Q + R | O + I |
| Super tiro teleguiado | W + R | ↑ + I |
| Parry | S + R | ↓ + I |
| Teleporte (Wesley: provocação) | A/D + R | ←/→ + I |
| Ultimate | R, soltar, R | I, soltar, I |

Combine as teclas em até **0,12 s** (pulo tem **0,2 s**). Para o super soco contínuo do Espantalho, segure os dois botões. O P2 também tem energia, especiais e dano próprios. A Dama Rosa funciona tanto quando Wesley é P1 quanto quando é P2, respeitando a faixa de vida vermelha. Ao usar controle na tela no modo Versus local, aparece uma segunda fileira de botões, identificada como **P2**.

A tela **Lista de combos** mostra separadamente os comandos do P2 quando houver dois jogadores humanos. A nova implementação redefine o estado do P2 a cada round, evitando resíduos de golpes e energia após o K.O.


## Novo mapa: Cidade Normal (17/11/2026)

- O cenário enviado foi adicionado em `mapas/cidade-normal.png`, sem substituição dos mapas existentes.
- Na seleção de mapas de Versus e Treino, clique no **segundo ponto** na parte inferior para acessar a página 2 e selecionar **Cidade Normal**.
- O capítulo 3 (Cidade) já exibe a imagem deste cenário como prévia no mapa do Modo História, mas continua **não jogável / em desenvolvimento**. Os dois capítulos anteriores, os saves e os personagens secretos são mantidos.

## Ultimate nova do Espantalho — Revoada do Fim (17/11/2026)

- **Ativação:** o Espantalho precisa estar na **barra vermelha (1 a 25 HP)** e com **100 de energia**. Comandos: **R + R** para P1 e **I + I** para P2. Fora da vida vermelha, a ultimate não é ativada.
- **Duração:** **15 segundos de tempo ativo de combate**. Pausar congela o cronômetro da ultimate.
- **Visual:** o Espantalho cresce e assume as poses gigantes do material enviado pelo autor. **25 corvos teleguiados** surgem um após outro, perseguem o adversário e **explodem**. Os corvos são animados com os sprites enviados pelo autor.
- **Dano:** **25 impactos de 6 pontos = 150 de dano total potencial** (vida do adversário não fica negativa). O K.O. aguarda o fim da ultimate quando o alvo morre durante a sequência.
- **Som:** usa a mesma faixa `audio/jojo-wason-exploding.mp3` da Ultimate 2 do Wesley, interrompida quando os 15 segundos terminam ou a partida é reiniciada.
- **Compatibilidade:** Player 1, Player 2 humano e Espantalho oponente controlado pela IA. Não remove os golpes anteriores, saves, os capítulos ou o cenário Cidade Normal.
- Arquivo da habilidade: `js/personagens/espantalho-ultimate.js`. Assets: `personagens/espantalho/gigante-{1,2,3}.webp` e `personagens/espantalho/corvo-00.webp` a `corvo-11.webp`.

## Atualização de áudio, seleção de mapas e Golem (17/11/2026)

- **Ultimate do Espantalho:** mantém a música original da ultimate de Wesley e, simultaneamente, reproduz a risada enviada em `audio/espantalho-risada.mp3` com `loop=true` ao longo dos 15 segundos. A risada é interrompida ao concluir a habilidade, encerrar o round ou sair da luta. Pause/Continue pausa/retoma o áudio sincronizado com a habilidade.
- **Corvos explosivos:** cada um dos 25 impactos toca `audio/corvo-explosao.mp3` em volume de 4,5% por reprodução para que o som não fique exagerado enquanto as explosões se sobrepõem. O dano da ultimate continua sendo 25 × 6 = 150.
- **Setas nos mapas:** dois botões de seta ◀ e ▶ foram adicionados ao lado dos indicadores de página na seleção de cenários, com desativação automática na primeira/última página. Os pontinhos e as setas de teclado anteriores continuam funcionando.
- **Golem Roxo:** na primeira luta do Modo História, seus socos e marteladas continuam com dano de 10. **Após reviver com 500 HP vermelhos**, cada golpe físico que acerta o Zusk causa exatamente **50** de dano. Nenhuma outra luta ou personagem foi alterado.

## Atualização da Ultimate do Espantalho — Revoada do Fim (17/11/2026)

- Ao entrar na vida vermelha (25 HP ou menos) e possuir 100 de energia, o Espantalho pode usar sua ultimate.
- A transformação gigante e os áudios anteriores continuam; a habilidade dura 15 segundos de tempo de jogo.
- **100 corvos** partem dos quatro cantos/bordas da arena, em momentos aleatórios, com velocidades e curvas variadas; alguns voam juntos e outros separados, perseguindo o oponente.
- Cada explosão causa 1,5 de dano, totalizando 150 com os 100 acertos em um inimigo com HP suficiente.
- A risada se repete durante a habilidade e a explosão usa volume discreto adequado para explosões sobrepostas.
- O texto flutuante que mostrava a quantidade de corvos e o cronômetro foi retirado.
- Vale para P1, P2 e Espantalho controlado pela IA; os outros golpes e cenários continuam presentes.


## CAPÍTULO 3 — Cidade da Zenga
- Disponível após concluir o Milharal no mapa do Modo História.
- Três batalhas jogáveis: Zusk x Gogogolaiafi, Espantalho x Gogogolaiafi e Wesley Mafioso x Gogogolaiafi.
- A derrota em qualquer batalha reinicia apenas o confronto atual.
- Depois das vitórias de Zusk e Espantalho, Gogogolaiafi volta enfurecido e os derrota em cena cinematográfica; não há como evitar essa parte da história.
- Após a vitória de Wesley e o convite com carinho, a fase é concluída e o save progride.
- Gogogolaiafi é desbloqueado na seleção de personagens apenas ao finalizar o Capítulo 3.
- Os sprites de Gogogolaiafi e Gostosa são temporários, fornecidos pelo autor, guardados em `personagens/gogogolaiafi` e `personagens/gostosa`. Gostosa aparece como figurante; não foi criada uma luta não especificada no roteiro.

## Gogogolaiafi — arte nova e comandos (17/11/2026)

- Removidos permanentemente `personagens/gogogolaiafi/sprite.png`, `original-temporario.jpg` e o arquivo redundante `parado-original.png`; nenhuma referência aos sprites antigos permanece.
- `retrato.png` foi reconstruído usando o novo desenho parado; utilizado na seleção, HUD e cenas do Capítulo 3.
- O tamanho do Gogogolaiafi no combate e nas cenas foi reduzido de 300 para **210 pixels** (30%). A miniatura grande da seleção também foi reduzida em 30%.
- O Gogogolaiafi acompanha a altura do pulo e tem pose visual de agachamento, tanto no P1 (**W/S**) quanto no P2 (**↑/↓**). Controles de toque já têm esses dois botões.
- Ataques usam temporariamente a arte NOVA parada com animação de avanço, sem retornar à arte antiga. Os 7 quadros de caminhada permanecem.

## Correção do Gogogolaiafi flutuando (17/11/2026)

- Alinhamento de renderização definido pelo **pé de apoio** de cada sprite, em vez do centro geométrico do PNG.
- Removido o espaço transparente que deixava os pés acima da linha do chão; a sombra acompanha o ponto de contato.
- Mantidos 210 px de altura, caminhada de 7 quadros, pulo, agachamento, retrato novo e o restante do jogo.
