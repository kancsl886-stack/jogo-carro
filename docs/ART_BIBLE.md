# Bíblia de Arte — Nitro Surf

**Gênero:** Endless runner 3D / corrida infinita em retrato (mobile), perspectiva aérea inclinada.  
**Engine alvo:** HTML5 Canvas 2D (Nitro Surf). As notas técnicas também cobrem Unity, Godot e Unreal, caso o visual seja portado.

Esta bíblia foi extraída da imagem de referência urbana (avenida de três faixas, caixas, moedas e HUD de perseguição). O objetivo é manter o jogo **fiel a essa estética**, sobretudo no bioma **Cidade**, que passa a ser a identidade visual principal.

---

## 1. Direção de Arte e Atmosfera

### Paleta oficial (HEX)

| Função | HEX | Uso |
| --- | --- | --- |
| Asfalto | `#363636` | Pista, base do chão da avenida |
| Faixa / dash | `#F2F2F2` | Divisórias tracejadas, alto contraste |
| Concreto do muro | `#A8ADB4` / `#8C9098` | Jersey barrier (face clara / face na sombra) |
| Faixa de cautela | `#E3C54A` | Listras diagonais nos muros |
| Preto de segurança | `#1A1A1A` | Contraste das listras e marcas de pneu |
| Tijolo | `#8D5545` | Prédios laterais (variações `#7A4A3C`, `#9A6352`) |
| Calçada urbana | `#C4B8A8` | Faixa estreita entre pista e muro |
| Solo / fundo urbano | `#5C4A42` | Fora da pista, terra queimada / tijolo mute |
| Carro laranja | `#E67E22` | Herói quente (esportivo / hatch) |
| Carro azul | `#2980B9` | Herói frio / tráfego / polícia |
| Moeda ouro | `#F1C40F` | Collectible + bloom (`#FFE566` highlight, `#B8860B` borda) |
| Céu meio-dia | `#6BA8D9` → `#D6E7F5` | Gradiente vertical, sol alto à esquerda |
| HUD branco | `#FFFFFF` | Distância, corrida, recorde (sombra preta) |
| Heat polícia | `#2ECC71` → `#F1C40F` → `#E74C3C` | Barra de perseguição |

### Iluminação

- **Sol de meio-dia**, fonte principal no **topo-esquerda** da tela.
- Sombras **longas, nítidas e escuras**, projetadas para **baixo-direita** em carros, caixas, moedas e prédios.
- Volume 3D vem do contraste: face esquerda clara, face direita 30–40% mais escura, topo um pouco dessaturado.
- Sem névoa romântica, sem hora dourada. O clima é claro, direto e legível em celular sob o sol.

### Traço, textura e material

- Semi-realista de mobile premium: asfalto com grão e **marcas de pneu irregulares**, concreto gasto, tijolo tileable, madeira das caixas com veios.
- Moedas com metal reflexivo + **bloom** suave (não neon cyberpunk).
- Contornos só onde a silhueta precisa “ler” à distância (roda, caixa, HUD). Evitar outline cartoon em tudo.
- UI em sans-serif branca, caixa alta, tracking aberto: `DISTÂNCIA`, `CORRIDA`, `RECORDE`, `POLÍCIA`.

### Vibe

Perseguição urbana em alta velocidade. Influência **Need for Speed / Burnout** filtrada para endless runner vertical: três faixas, túnel de atenção, calor da polícia subindo, recompensa dourada no meio da pista. O jogador deve sentir “cidade ao meio-dia, asfalto quente, desvie agora”.

---

## 2. Desconstrução de Assets

Recriar (ou manter alinhado) este kit. Prioridade A = aparece na referência e define a identidade.

### Cenário (A)

- Pista de **3 faixas** com divisórias tracejadas brancas.
- **Jersey barriers** contínuos nas duas laterais, concreto + listra amarela/preta diagonal.
- Calçada estreita e postes de luz modernos (principalmente à esquerda / direita da avenida).
- Prédio de tijolo alto à direita, janelas em grelha uniforme (efeito túnel).
- Decalques de **skid mark** no asfalto.

### Props jogáveis (A)

- **Caixas de madeira** empilhadas de forma irregular (3–5 volumes), bloqueando 1–2 faixas.
- **Moedas de ouro** flutuando em linha vertical na faixa livre.
- Carros de tráfego: esportivo laranja e sedan/azul como silhuetas-âncora.

### Personagens / veículos (A)

- Carro do jogador: esportivo compacto, volume isométrico, pintura saturada.
- Viatura da polícia (azul + faixa branca) atrás do jogador, nunca no mesmo plano da câmera.

### UI (A)

- Topo: Distância (esq.) · Corrida + ícone de moeda (centro) · Recorde + pause quadrado (dir.).
- Barra **POLÍCIA** verde→vermelho sob a distância.
- Chip **CIDADE** arredondado no canto inferior esquerdo.

### Props de variação (B) — outros biomas

Cones, pilha de pneus, óleo, contêiner, caminhão. Não devem roubar a identidade da Cidade; na Cidade o obstáculo-assinatura é a **pilha de caixas**.

---

## 3. Level Design e Mecânicas

A imagem já descreve o loop. Estruturar o cenário assim:

### Espaço

- Retrato mobile. Câmera alta, FOV estreito, horizonte baixo (~15% da altura).
- Largura útil = 3 faixas + muros. O prédio da direita “fecha” o quadro.
- Scroll infinito no eixo Z. Pooling: reciclar prédios, muros, caixas e moedas quando saem por baixo da tela.

### Leitura de faixa

Cada obstáculo deve deixar **pelo menos uma faixa livre**. Na Cidade, o padrão-assinatura da referência é:

1. Pilha de caixas cobrindo meio + direita.
2. Linha de 4 moedas na faixa que sobrou (geralmente centro ou esquerda).
3. Tráfego à frente, forçando troca + coleta.

### Mecânicas que o ambiente pede

| Mecânica | Por que a referência pede |
| --- | --- |
| Troca de faixa / esterço contínuo | Desviar das caixas sem “pulo de tile” robótico |
| Coleta de moedas em linha | Reward visível no eixo da pista |
| Heat da polícia | A barra existe na HUD; nitro afasta, batida/lento aproxima |
| Distância como score | `154 m` vs recorde `225 m` |
| Bioma nomeado | Chip `CIDADE` — o jogador sabe onde está |
| Pulo só em obstáculo baixo | Caixas altas = bloqueio duro; cones/pneus = puláveis |

### Ritmo (Cidade)

- Abertura: reta, 1 obstáculo, linha de moedas — ensina a ler 3 faixas.
- Meio: caixas em 2 faixas + carro na terceira, heat subindo.
- Pico: duas ameaças + polícia perto; nitro ou faixa perfeita.
- Alívio: reta com moedas e prédio “respirando” na lateral.

Outros biomas (interior, orla, serra, porto) são variações de paleta e props, não outro jogo.

---

## 4. Dicas Técnicas por Engine

### HTML5 Canvas (engine atual)

- Perspectiva fake com `project(x, y, z)`: `s = focal / dz`, sol simulado no céu (radial no topo-esq.).
- **Sombras:** elipse preta offset (+x, +z) *antes* do mesh; faces com `shadeHex(cor, +0.22 / -0.34)`.
- **Muros:** extrusão em slices; faixa `#E3C54A` no terço médio + quads pretos deslocados em Z para fingir diagonal.
- **Moedas:** radial glow `rgba(241,196,15,0.85)` + elipse que “gira” no eixo Y (`scaleX = |cos(t)|`).
- **Bloom barato:** segundo fill radial maior, alpha baixo. Evitar stack de filtros CSS (custa bateria).
- **Asfalto:** fill `#363636` + dashes brancas + skid marks em `rgba(12,12,14,0.4)`.
- HUD em DOM/CSS (já no jogo): texto branco, `text-transform: uppercase`, barra com `linear-gradient(90deg, #2ECC71, #F1C40F, #E74C3C)`.
- Performance: 16–28 slices de pista, scenery a cada 7 m, sem `getImageData`. `imageSmoothingEnabled = true` nos carros, não nos tiles pixel.

### Unity (se portar)

- Câmera Perspective, FOV 28–35°, inclinada ~55–65° no X, retrato 1080×1920.
- URP + Directional Light (45°, -35° em Y) + shadow maps de alta resolução, distance 40–60 m.
- Asfalto: URP Lit, roughness alta, normal de grão, **Decal Projector** para skids.
- Moedas: Lit + emission `#F1C40F` + Bloom no Volume (threshold alto para só as moedas estourarem).
- Muros: mesh de Jersey + material com máscara de listra (world-aligned triplanar ou UV unwrap).
- Prédios: modular + texture tiling de tijolo `#8D5545`. Occlusion culling + pooling na Z.
- HUD: TextMeshPro, outline 0.2, cor branca.

### Godot 4

- `WorldEnvironment` com sol `DirectionalLight3D`, shadows Hard/Soft médio.
- `StandardMaterial3D` roughness 0.7–0.9 no asfalto; `Decal` para pneus.
- Glow no Environment só com HDR nas moedas (`emission_energy`).
- Câmera `fov` baixo + `keep_height` em retrato.

### Unreal

- Lumen opcional (mobile: baked + directional shadows).
- Material de asfalto PBR + decals. Niagara para fagulha de nitro, não para a cena base.
- UI: UMG com a mesma hierarquia da referência (três colunas no topo).

### Checklist de fidelidade (playtest visual)

1. Asfalto escuro, dash branco “estoura” na leitura.
2. Muro com amarelo de obra visível a 20 m.
3. Sombra dos carros cai para baixo-direita.
4. Caixa de madeira é o obstáculo que o olho encontra primeiro na Cidade.
5. Moeda brilha sem virar neon.
6. HUD: Distância / Corrida / Recorde / Polícia / Cidade / Pause batem com a referência.
