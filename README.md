# Tripa AI - Assistente IA de Viagens e Férias

O Tripa AI é um assistente inteligente concebido para analisar indicações em linguagem natural e planear férias e viagens económicas com análise automatizada de custo-benefício.

---

## Funcionalidades Principais

- **Analise de Pedidos**: Extracao automatica de origem, destino, datas, duracao e restricoes de orcamento.
- **Pesquisa de Voos Economicos**: Integracao com a API/MCP da Kiwi para identificar as rotas mais vantajosas.
- **Sugestoes de Alojamento**: Selecao de opcoes estrategicas com geracao de ligacoes diretas parametrizadas para o Booking.com.
- **Roteiros e Gastronomia**: Pesquisa em tempo real via Tavily Search para recomendacoes de atracoes e restaurantes locais.
- **Estimativa Orcamental Consolidada**: Calculo automatico das despesas totais previstas (voos, alojamento, alimentacao, transportes e margem de seguranca).
- **Respostas em Tempo Real**: Streaming Server-Sent Events (SSE) com inferencia de baixa latencia.

---

## Stack Tecnologica

- **Frontend**: Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS)
- **Backend API**: FastAPI (Python 3.11+, Pydantic v2) em Vercel Serverless Functions
- **Inferencia LLM**: Groq Cloud API (`openai/gpt-oss-20b`)
- **Orquestracao**: LangChain / LangGraph
- **Ferramentas e Dados**: Kiwi (Voos), Tavily (Pesquisa Web), Booking.com (Alojamento)
- **Plataforma de Deploy**: Vercel (Frontend e Backend integrados)

---

## 1. Requisitos Previos

- **Python**: Versao 3.11 ou superior
- **Node.js**: Versao 18.18.0, 20.x ou 22.x
- **npm**: Gestor de pacotes Node.js (ou pnpm / yarn)

---

## 2. Instalacao de Dependencias

Execute os comandos a partir da raiz do repositorio:

### Backend (Python)
```bash
pip install -r requirements.txt
```

### Frontend (Node.js)
```bash
npm install
```
*(No Windows PowerShell, caso ocorram restricoes de execucao de scripts, utilize `npm.cmd install`)*

---

## 3. Configuracao das Variaveis de Ambiente

Crie um ficheiro `.env` na raiz do projeto com base no modelo `.env.example`:

```bash
cp .env.example .env
```

Variaveis suportadas:
```env
# Servicos de Inferencia e Ferramentas (opcionais para a infraestrutura base)
GROQ_API_KEY=o_seu_token_da_groq
TAVILY_API_KEY=o_seu_token_da_tavily
KIWI_API_KEY=o_seu_token_da_kiwi

# Configuracoes de Ambiente
APP_ENV=development
API_V1_STR=/api/v1
PROJECT_NAME=Tripa AI
```

---

## 4. Execucao em Ambiente de Desenvolvimento

Para executar o projeto localmente, inicie o backend e o frontend em dois terminais separados:

### Terminal 1: Backend FastAPI
```bash
python -m uvicorn api.index:app --reload --port 8000
```
- API Base: `http://127.0.0.1:8000`
- Documentacao Swagger: `http://127.0.0.1:8000/api/v1/docs`
- Endpoint de Saude: `http://127.0.0.1:8000/api/v1/health`

### Terminal 2: Frontend Next.js
```bash
npm run dev
```
*(No Windows, utilize `npm.cmd run dev` se necessario)*
- Interface Web: `http://localhost:3000`

---

## 5. Roteamento e Proxy em Desenvolvimento

Durante o desenvolvimento local, o Next.js reencaminha automaticamente os pedidos para `/api/*` diretamente para o servidor FastAPI (`http://127.0.0.1:8000/api/*`).

Pode validar o funcionamento nos seguintes enderecos:
- Diagnostico integrado: `http://localhost:3000/api/v1/health`
- Interface de teste com streaming SSE: `http://localhost:3000`

---

## 6. Build de Producao e Deploy na Vercel

O projeto utiliza uma estrutura monorepo integrada:

### Validar Build Local
```bash
npm run build
```

### Deploy na Vercel
Ao associar o repositorio a Vercel:
1. O runtime `@vercel/python` executa as funcoes serverless a partir de `api/index.py`.
2. O ficheiro `vercel.json` encaminha automaticamente as rotas `/api/*`.
3. O Next.js e compilado e distribuido globalmente sob o mesmo dominio.
