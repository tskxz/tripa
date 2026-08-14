# Tripa AI - Assistente Inteligente de Viagens e Ferias

O Tripa AI e um assistente IA concebido para analisar pedidos em linguagem natural e planear ferias e viagens economicas de forma automatizada e estruturada.

---

## Funcionalidades Principais

- Analise de Pedidos: Extracao automatica de origem, destino, datas, duracao e restricoes de orcamento.
- Pesquisa de Voos Economicos: Integracao com a API/MCP da Kiwi para identificar as rotas mais vantajosas.
- Sugestoes de Alojamento: Selecao de opcoes estrategicas com geracao de ligacoes diretas parametrizadas para o Booking.com.
- Roteiros e Gastronomia: Pesquisa em tempo real via Tavily Search para recomendacoes de atracoes e restaurantes locais.
- Estimativa Orcamental Consolidada: Calculo automatico das despesas totais previstas (voos, alojamento, alimentacao, transportes e margem de seguranca).
- Respostas em Tempo Real: Streaming Server-Sent Events (SSE) com inferencia ultra-rapida.

---

## Stack Tecnologica

- Frontend: Next.js 16.3.0 (App Router, React 19, TypeScript, Tailwind CSS)
- Backend: FastAPI (Python 3.11+, Pydantic v2) em Vercel Serverless Functions
- Inferencia de IA: Groq Cloud API (Modelos Llama 3.2)
- Orquestracao: LangChain / LangGraph
- Ferramentas e Dados: Kiwi (Voos), Tavily (Pesquisa Web), Booking.com (Alojamento)
- Plataforma de Deploy: Vercel (Frontend e Backend integrados)


---

## Configuracao e Variaveis de Ambiente

Crie um ficheiro `.env` na raiz do projeto com as seguintes variaveis:

```env
GROQ_API_KEY=o_seu_token_da_groq
TAVILY_API_KEY=o_seu_token_da_tavily
KIWI_API_KEY=o_seu_token_da_kiwi
```
