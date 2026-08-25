# Análise de Falhas — Tripa AI

## Resumo Executivo

Foram identificadas **3 falhas críticas** no projeto, todas localizadas no backend (`graph.py`):

1. **Destino errado** — `parse_intent_node` tem `"Barcelona"` como valor padrão fixo e não reconhece destinos fora de uma lista limitada (ex: Brasil).
2. **Ponto 3 com conteúdo bruto da Tavily** — o `generate_response_node` imprime snippets crus dos resultados da Tavily sem formatação adequada, com títulos cortados e sem contexto.
3. **"Leia mais →" / texto truncado** — o conteúdo de `item['content']` é truncado a 160 caracteres com `...` na linha 172, mas o texto original da Tavily pode vir já com links internos ou com "Leia mais" no meio, tornando o resultado confuso.

---

## Falha 1 — Destino Padrão Errado: sempre `"Barcelona"`

### Localização
[graph.py, linha 37](file:///d:/projetos/tripa/api/services/agents/graph.py#L37-L44)

### Causa Raiz
```python
destination = "Barcelona"   # ← HARDCODED como fallback

dest_matches = ["barcelona", "madrid", "paris", "roma", ...]
for city in dest_matches:
    if city in user_query.lower():
        destination = city.capitalize()
        break
```

- A lista `dest_matches` é **muito pequena** (10 cidades europeias apenas).
- Destinos como `"Brasil"`, `"Maldivas"`, `"Nova Iorque"`, `"Tóquio"` não estão na lista → o fallback `"Barcelona"` é usado.
- O título da resposta fica `"Roteiro Personalizado para Barcelona"` mesmo que o utilizador tenha pedido outra cidade.
- Os **voos fallback** no `kiwi.py` também usam o estado detetado (Barcelona), por isso o cartão de voo mostrará `OPO → BCN`.

### Solução
Substituir a deteção simples por regex via LLM (Groq já está disponível no projeto) ou expandir a lista com um dicionário de cidades mais completo. A solução mais simples e robusta sem custo extra é usar uma extração por regex/heurística mais inteligente:

```python
# Em graph.py — parse_intent_node

import re

# 1. Expandir a lista de destinos suportados
DEST_ALIASES = {
    "barcelona": "Barcelona", "madrid": "Madrid", "paris": "Paris",
    "roma": "Roma", "rome": "Roma", "london": "Londres", "londres": "Londres",
    "amsterdam": "Amesterdão", "berlim": "Berlim", "berlin": "Berlim",
    "praga": "Praga", "prague": "Praga", "milao": "Milão", "milan": "Milão",
    "valencia": "Valência", "lisboa": "Lisboa", "lisbon": "Lisboa",
    "porto": "Porto", "sevilha": "Sevilha", "seville": "Sevilha",
    "veneza": "Veneza", "venice": "Veneza", "florenca": "Florença",
    "florence": "Florença", "napoles": "Nápoles", "naples": "Nápoles",
    "atenas": "Atenas", "athens": "Atenas", "viena": "Viena", "vienna": "Viena",
    "budapest": "Budapest", "varsovia": "Varsóvia", "warsaw": "Varsóvia",
    "brasil": "Rio de Janeiro", "brazil": "Rio de Janeiro",
    "nova iorque": "Nova Iorque", "new york": "Nova Iorque",
    "toquio": "Tóquio", "tokyo": "Tóquio", "dubai": "Dubai",
    "cancun": "Cancun", "maldivas": "Maldivas", "maldives": "Maldivas",
    "tailandia": "Banguecoque", "thailand": "Banguecoque",
}

destination = None
query_lower = user_query.lower()

for alias, city_name in DEST_ALIASES.items():
    if alias in query_lower:
        destination = city_name
        break

# Se não encontrou, tentar extrair via padrões de texto
if not destination:
    # Padrão: "em [Cidade]", "para [Cidade]", "a [Cidade]"
    match = re.search(r'\b(?:em|para|a|até|no|na)\s+([A-ZÁÉÍÓÚÀÂÊÔÃÕÜ][a-záéíóúàâêôãõü]+(?:\s+[A-ZÁÉÍÓÚÀÂÊÔÃÕÜ][a-záéíóúàâêôãõü]+)?)', user_query)
    if match:
        destination = match.group(1)

# Fallback seguro — sem assumir Barcelona
if not destination:
    destination = "Destino Não Identificado"
```

> [!IMPORTANT]
> Para o caso `"brasil"` → o utilizador provavelmente quer uma praia brasileira. A solução ideal é usar o LLM (Groq) para extrair o destino do texto livre. Ver secção de solução LLM em baixo.

---

## Falha 2 — Ponto 3: Conteúdo Tavily Bruto e Truncado

### Localização
[graph.py, linhas 168–172](file:///d:/projetos/tripa/api/services/agents/graph.py#L168-L172)

### Causa Raiz
```python
f"#### 3. Dicas Turisticas e Gastronomicas\n"

for item in tavily_items[:2]:
    text_parts.append(f"- **{item.get('title', 'Dica')}**: {item.get('content', '')[:160]}...\n")
```

Problemas:
- O `content` da Tavily é um **snippet HTML convertido** com texto informal e potencialmente links internos como `"Leia mais →"`.
- Truncar a 160 chars corta no meio de frases ou dentro de links, criando lixo visual.
- Os títulos são os títulos de SEO dos artigos Tavily (ex: "Roteiro de 4 Dias em Roma") e não dicas formatadas para o utilizador.
- **Não existe relação com o destino real** — a query Tavily é correta mas o conteúdo exibido é o snippet bruto de terceiros.

### Solução
Pós-processar o conteúdo da Tavily para remover lixo e formatar melhor:

```python
import re

def clean_tavily_snippet(content: str, max_chars: int = 200) -> str:
    """Limpa snippets da Tavily removendo artefactos de HTML e links."""
    # Remove padrões "Leia mais", "Read more", "→", etc.
    content = re.sub(r'(Leia mais|Read more|Ver mais|Saiba mais)\s*[→►»]?', '', content, flags=re.IGNORECASE)
    # Remove referências a outros destinos após ponto final (evita frases soltas)
    content = content.strip()
    # Truncar em fim de frase para não cortar a meio
    if len(content) > max_chars:
        truncated = content[:max_chars]
        last_period = truncated.rfind('.')
        if last_period > max_chars // 2:
            content = truncated[:last_period + 1]
        else:
            content = truncated.rstrip() + "..."
    return content

# No generate_response_node, substituir o loop por:
for item in tavily_items[:3]:
    title = item.get('title', 'Dica de Viagem')
    raw_content = item.get('content', '')
    clean = clean_tavily_snippet(raw_content)
    if clean:
        text_parts.append(f"- **{title}**: {clean}\n")
```

---

## Falha 3 — "Opções Recomendadas" mostra origem/destino errado (OPO → BCN)

### Localização
[graph.py, linhas 256–264](file:///d:/projetos/tripa/api/services/agents/graph.py#L256-L264)

### Causa Raiz
```python
"departure": {"airport": f.get("origin", "OPO"), ...},
"arrival":   {"airport": f.get("destination", "BCN"), ...},
```

Os valores de fallback `"OPO"` e `"BCN"` são hardcoded. Quando o MCP da Kiwi falha (o que é o caso comum, pois a API pode não estar disponível), os voos gerados pelo fallback em `kiwi.py` têm `origin` e `destination` como string de texto (ex: `"Lisboa"`, `"Roma"`), mas o código SSE usa `.get("origin", "OPO")` sem lógica de IATA. Além disso, quando o `parse_intent_node` resolve `destination = "Barcelona"` erroneamente, os fallback de voos também ficam `BCN`.

### Solução
Usar os valores do estado (`state`) como fallback, não hardcoded:

```python
# Em run_tripa_graph_events — ao construir flight_payload
origin_code = state.get("origin", "origem")
dest_code = state.get("destination", "destino")

flight_payload = {
    "flights": [
        {
            "id": f.get("flight_id", "fl_1"),
            "airline": f.get("airline", "Companhia"),
            "flight_number": f.get("flight_number", "---"),
            "departure": {
                "airport": f.get("origin", origin_code),   # ← usa o estado
                "time": f.get("departure_time", "---")
            },
            "arrival": {
                "airport": f.get("destination", dest_code),  # ← usa o estado
                "time": f.get("arrival_time", "---")
            },
            "price": f.get("price", 65.0),
            "currency": currency,
            "booking_url": f.get("booking_url", "https://www.kiwi.com")
        }
        for f in flights[:2]
    ]
}
```

---

## Falha Bónus — Duração "Fim de semana" não é reconhecida

### Localização
[graph.py, linha 48–50](file:///d:/projetos/tripa/api/services/agents/graph.py#L48-L50)

### Causa Raiz
```python
days_match = re.search(r"(\d+)\s*dias", user_query.lower())
```

`"fim de semana"` não contém um número → `duration_days` fica `4` (padrão). Mas "fim de semana" implica 2–3 dias.

### Solução
```python
query_lower = user_query.lower()
days_match = re.search(r"(\d+)\s*dias?", query_lower)

if days_match:
    duration_days = int(days_match.group(1))
elif "fim de semana" in query_lower or "weekend" in query_lower:
    duration_days = 3
elif "semana" in query_lower or "week" in query_lower:
    duration_days = 7
else:
    duration_days = 4  # padrão
```

---

## Solução Recomendada — Usar LLM (Groq) para Extrair Intenção

O projeto já tem `groq_client.py` disponível. A solução mais robusta para as falhas 1, 3 e bónus é usar um LLM para extrair as entidades do texto livre:

```python
# No parse_intent_node — substituir toda a lógica de regex por:
from api.services.tools.groq_client import get_groq_llm

llm = get_groq_llm()

extraction_prompt = f"""Extrai as seguintes informações da query de viagem do utilizador.
Responde APENAS em JSON válido, sem markdown.

Query: "{user_query}"

Formato esperado:
{{
  "origin": "cidade de partida (padrão: Lisboa se não mencionado)",
  "destination": "cidade ou país de destino",
  "duration_days": número de dias (3 para fim de semana, 7 para semana, 4 se não claro),
  "travel_style": "economico | confortavel | luxo"
}}"""

response = llm.invoke(extraction_prompt)
# Parsear o JSON da resposta...
```

---

## Mapa de Ficheiros a Alterar

| Ficheiro | Falhas | Tipo de Alteração |
|---|---|---|
| [graph.py](file:///d:/projetos/tripa/api/services/agents/graph.py) | 1, 2, 3, Bónus | Principal — `parse_intent_node`, `generate_response_node`, `run_tripa_graph_events` |
| [kiwi.py](file:///d:/projetos/tripa/api/services/tools/kiwi.py) | 3 | Remover `"BCN"` hardcoded nos fallbacks |
| [tavily.py](file:///d:/projetos/tripa/api/services/tools/tavily.py) | 2 | Opcional: melhorar mock com conteúdo mais relevante por destino |

