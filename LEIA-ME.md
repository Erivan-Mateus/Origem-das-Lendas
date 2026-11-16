# Arena das Origens — projeto dividido em pastas

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
- `js/mapas.js`: nomes, descrições, ordem e imagens de todos os mapas.
- `js/audio-arquivos.js`: caminhos dos sons.
- `personagens/`: sprites (atlas e retratos) por lutador.
- `mapas/`: 6 imagens de mapas, em sua resolução e formato originais.
- `audio/`: MP3 de soco, chute e grito do Ultimate.
- `interface/`: fundos, molduras e botões.

## Observação importante

O tamanho do **index.html** é pequeno porque os recursos foram extraídos. O conjunto de sprites, músicas e fundos continua ocupando espaço no disco. O navegador pode cachear os arquivos separadamente.

Os arquivos JavaScript usam `<script>` clássico para manter compatibilidade com o código original e conservar as dependências globais. Não converta cada arquivo para `type="module"` isoladamente sem atualizar a arquitetura.
