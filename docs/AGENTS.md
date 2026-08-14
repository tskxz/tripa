# Diretrizes e Memoria do Projeto Tripa AI

## Regras Globais de Estilo e Comunicacao
1. Nao utilizar emojis em nenhuma documentacao, resposta, codigo ou commit.
2. Utilizar sempre Portugues de Portugal (PT-PT) em toda a documentacao, interfaces, comentarios de codigo e comunicacao com o utilizador (ex.: planeamento, utilizador, ficheiro, etc.).
3. Manter um tom tecnico, formal, profissional e direto.

## Contexto do Projeto
O Tripa AI e um assistente de IA focado no planeamento de ferias e viagens economicas com analise rigorosa de custo-beneficio.

## Diretrizes de Arquitetura e Implementacao Unificada na Vercel
1. Frontend: Next.js 16.3.0 (App Router, React 19, TypeScript, Tailwind CSS).
   - Alojamento / Deploy: Vercel.
2. Backend API: FastAPI (Python 3.11+, Pydantic v2, SSE para streaming).
   - Alojamento / Deploy: Vercel Serverless Functions (Runtime Python nativo da Vercel).
   - Vantagens: Dominio unificado, sem problemas de CORS, custo zero em repouso e escalabilidade automatica.
3. Camada de IA e Inferencia:
   - Fornecedor de LLM: Groq Cloud API (Llama 3.2 / Llama 3.3).
   - Orquestracao: LangChain / LangGraph.
4. Ferramentas e Protocolos:
   - Protocolo: Model Context Protocol (MCP) e integracoes diretas.
   - Pesquisa Web e Gastronomia: Tavily.
   - Voos e Tarifas: Kiwi (Tequila API / MCP).
   - Hoteis: Booking.com (pesquisa e geracao de deep links com parametros).

## Documentos do Projeto
- docs/system_architecture.md: Arquitetura completa com deploy unificado na Vercel, diagramas e justificacoes tecnicas.
- docs/api_contracts.md: Schemas de comunicacao e cargas uteis (payloads) SSE.