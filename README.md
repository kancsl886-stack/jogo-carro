# Nitro Surf

Jogo de corrida infinita no estilo Subway Surfers, só que de carro: três faixas, pulo, moedas, power-ups e uma loja para comprar vários modelos.

## Como jogar

1. Abra `index.html` no navegador (ou sirva a pasta com qualquer servidor estático).
2. Clique em **Jogar**.
3. Troque de faixa para desviar do trânsito e pule barreiras baixas.
4. Junte moedas e gaste na **Loja de carros**.

### Controles

| Ação | Teclado | Celular |
| --- | --- | --- |
| Faixa esquerda / direita | ← → ou A D | Deslize ou toque no lado |
| Pular | ↑, W ou espaço | Deslize para cima |
| Pausar | Esc | Botão ❚❚ |

## Carros

Cada carro muda três atributos:

- **Velocidade** — teto de velocidade na pista
- **Manobra** — rapidez para trocar de faixa
- **Ímã** — alcance para coletar moedas

O progresso (moedas, recorde e garagem) fica salvo no `localStorage` do navegador.

## Power-ups

- **Ímã (M)** — puxa moedas das faixas próximas
- **Escudo (S)** — aguenta uma batida
- **Nitro (N)** — explosão de velocidade

## Rodar localmente

```bash
python3 -m http.server 8080
```

Depois abra `http://localhost:8080`.
