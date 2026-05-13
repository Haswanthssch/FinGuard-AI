# 🛡️ FinGuard AI: Next-Gen Multi-Agent Financial Platform

[![Status](https://img.shields.io/badge/Status-Production--Ready-success.svg)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20LangGraph-blue.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blueviolet.svg)]()
[![AI](https://img.shields.io/badge/AI-Groq%20%7C%20Llama%203.3-orange.svg)]()

**FinGuard AI** is a sophisticated, multi-agent financial intelligence platform designed for deep portfolio analysis, risk management, and regulatory compliance. Built with a "human-in-the-loop" agentic architecture, it orchestrates multiple specialized AI agents to provide grounded, data-driven financial insights.

---

## 🚀 Core Features

### 🤖 Multi-Agent Orchestration
Powered by **LangGraph** and **Groq (Llama 3.3)**, the system coordinates specialized agents:
- **Portfolio Intelligence Agent**: Deep-dives into asset allocation and holding quality.
- **Risk & Exposure Agent**: Identifies concentration risks and market vulnerabilities.
- **Performance Analytics Agent**: Analyzes historical returns and benchmark comparisons.
- **Compliance Intelligence Agent**: Ensures adherence to regulatory guidelines.

### 📈 Portfolio Intelligence
- **Intelligent Ingestion**: Support for CSV/XLSX uploads with broker-style normalization.
- **Dynamic Metrics**: Real-time calculation of total value, unrealized P&L, and sector diversification.
- **Visual Analytics**: Interactive charts powered by Recharts for heatmaps, sector breakdown, and performance tracking.

### ⚖️ Regulatory Assistant (RAG)
- **Context-Aware Compliance**: Uses Retrieval-Augmented Generation (RAG) to answer complex regulatory questions.
- **Document Grounding**: Insights are grounded in uploaded regulatory PDFs and official guidelines.

### 🧠 ML-Driven Insights
- **Investor DNA**: Archetype clustering to understand investor profiles.
- **Predictive Risk**: Stress testing and risk classification using Scikit-Learn and XGBoost.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18 (Vite)
- **Styling**: TailwindCSS & Shadcn UI
- **State Management**: Zustand & React Query
- **Animations**: Framer Motion
- **Visualization**: Recharts

### **Backend**
- **Framework**: FastAPI (Python 3.11+)
- **Agent Orchestration**: LangGraph
- **LLM**: Groq (Llama 3.3 70B)
- **Database**: SQLite (Local) / PostgreSQL (Prod)
- **Storage**: Azure Blob Storage

### **ML Integration**
- **Libraries**: Scikit-learn, XGBoost, Pandas
- **Models**: Pre-trained classifiers and regressors for risk and stress analysis.

---

## 📂 Project Structure

```text
.
├── backend/                  # FastAPI & LangGraph Orchestration
│   ├── app/                  # Core application logic
│   ├── rag_documents/        # Regulatory PDF corpus
│   └── requirements.txt      # Backend dependencies
├── frontend/                 # React & Vite Application
│   ├── src/                  # Components, Hooks, Stores
│   └── package.json          # Frontend dependencies
├── finguard_ml_integration/  # Dedicated ML Microservice
│   ├── trained_models/       # PKL model binaries
│   └── app/                  # ML inference logic
├── aidlc-docs/               # Architectural & Audit documentation
└── nothing/                  # (Local) Deployment scripts and notes [Ignored]
```

---

## ⚙️ Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API Key

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env      # Configure your GROQ_API_KEY
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. ML Service (Optional)
```bash
cd finguard_ml_integration
pip install -r requirements.txt
uvicorn app.main:app --port 8001
```

---

## ☁️ Deployment

The project is designed for **Azure Container Apps**.
- **Containerization**: Dockerfiles are provided for both Frontend and Backend.
- **Orchestration**: Nginx serves the frontend bundle; FastAPI handles the API requests.
- **CI/CD**: Prepared for GitHub Actions deployment to Azure Container Registry.

---

## 📜 License
Proprietary - FinGuard AI Capstone Project 2026.

---

## 👥 Contributors
- **Haswanth** - Lead Developer & AI Architect
