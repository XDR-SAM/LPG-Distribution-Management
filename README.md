# LPG Manager BD 🇧🇩
### Next-Generation LPG Cylinder Distribution & Godown Management System

> **A product engineered and developed by [Makezaa Studio Inc.](https://makezaa.com) ([makezaa.com](https://makezaa.com))**

[![Crafted By Makezaa Studio](https://img.shields.io/badge/Developed%20By-Makezaa%20Studio%20Inc.-EA580C?style=for-the-badge)](https://makezaa.com)
[![Website makezaa.com](https://img.shields.io/badge/Website-makezaa.com-0F172A?style=for-the-badge)](https://makezaa.com)

[![React](https://img.shields.io/badge/React-19.0.1-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-3.5%20Flash-orange?style=flat&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🏢 About Makezaa Studio Inc.

**LPG Manager BD** is conceptualized, designed, and developed by **Makezaa Studio Inc.** ([makezaa.com](https://makezaa.com)). Makezaa Studio specializes in creating high-performance, domain-specific enterprise software, ERP platforms, and AI-automated tooling tailored for mission-critical industry operations.

---

## 📋 System Overview

**LPG Manager BD** is a desktop-first, offline-resilient Enterprise Resource Planning (ERP) suite engineered specifically for Liquefied Petroleum Gas (LPG) distributors, regional dealers, and godown operators across Bangladesh.

Built with real-time cylinder physical tracking, BERC (Bangladesh Energy Regulatory Commission) government tariff compliance, dual-ledger accounting (Cash + Physical Cylinders), bilingual Bengali/English interfaces, and a database-aware **AI Godown Operations Agent** powered by Google Gemini and OpenAI-compatible models.

---

## 🏗️ System Architecture & Workflow Diagram

```
+-----------------------------------------------------------------------------------+
|                              LPG MANAGER BD (ERP)                                 |
|                         Engineered by Makezaa Studio Inc.                         |
+-----------------------------------------------------------------------------------+
                                        |
       +--------------------------------+--------------------------------+
       |                                |                                |
       v                                v                                v
+-------------------+          +-------------------+          +---------------------+
|   SALES & POS     |          |  CYLINDER LEDGER  |          |   ACCOUNTS & CASH   |
| - Counter POS     |          | - Full Stock (In) |          | - Cash in Hand      |
| - Dealer Billing  | <======> | - Empty Stock     | <======> | - bKash / Nagad     |
| - Delivery Challan|          | - Damaged / Lost  |          | - Bank Accounts     |
| - BERC Compliance |          | - Customer Due    |          | - Expense Vouchers  |
+-------------------+          +-------------------+          +---------------------+
       ^                                ^                                ^
       |                                |                                |
       +--------------------------------+--------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                      AI GODOWN OPERATIONS AGENT (AGENTIC AI)                      |
|                      Powered by Gemini 3.5 & OpenAI Protocol                      |
|                                                                                   |
|  * Real-Time Godown Database Snapshot (Stocks, Dues, Cashbook, Sales)             |
|  * Natural Language Commands (Bangla / Banglish / English)                        |
|  * 1-Click Database Mutations (Auto-creates Invoices, Receipts, & Stock Moves)    |
+-----------------------------------------------------------------------------------+
                                        |
        +-------------------------------+-------------------------------+
        |                                                               |
        v                                                               v
+------------------------------------+          +-----------------------------------+
|       OFFLINE LOCALSTORAGE         |          |       SUPABASE POSTGRESQL         |
|   Zero downtime during outages     | <======> |   Cloud synchronization & backup  |
+------------------------------------+          +-----------------------------------+
```

---

## 🌟 Key Features & Capabilities

### 1. 🔄 Dual-Ledger Cylinder Tracking
In the LPG industry, a sale is never purely financial—cylinders are reusable physical assets that leave filled and must return empty:
- **Financial Ledger:** Invoicing amounts, payment collection (Cash, bKash, Nagad, Bank Transfer), customer credit limits, and aging accounts receivable.
- **Physical Cylinder Ledger:** Full cylinders issued vs. empty cylinders returned vs. cylinders currently held on deposit/due by retailers and consumers.
- **Stock States:** Track `Full Stock`, `Empty Stock`, `Damaged / Leaking Stock`, `Lost / Condemned Stock`, `Customer-Held Stock`, and `Supplier-Held Stock`.

### 2. 🇧🇩 Native to the Bangladesh LPG Market
- **Multi-Brand Support:** Out-of-the-box configuration for all major gas operators licensed in Bangladesh:
  - **Bashundhara LP Gas**
  - **Omera LPG**
  - **Beximco LPG**
  - **Jamuna Gas**
  - **TotalGas**
  - **BM Energy**
  - **Fresh / Meghna LPG**
  - **Petromax LPG**
  - **Sena Kalyan LPG**
  - **Promita LPG**
- **Cylinder Sizes:** Domestic 12kg, Commercial 35kg, Industrial 45kg, plus auto-gas and compact 5.5kg sizes.
- **BERC Tariff Compliance:** Track monthly government-notified Bangladesh Energy Regulatory Commission (BERC) retail benchmark rates against purchase costs to monitor profit margins.

### 3. 🤖 Database-Aware AI Godown Operations Agent
- **Live State Awareness:** Injects a live snapshot of godown inventory, customer dues, and cash balances into every conversation turn.
- **Natural Language Execution:** Execute full transactions directly via chat:
  - *"Sell 5 Bashundhara 12kg cylinders to Kalam Store for 7000 cash with 5 empties exchanged."*
  - *"Receive 10,000 tk payment from Bismillah Hotel via bKash."*
  - *"Mark 2 Omera 12kg cylinders as damaged due to pinhole leak."*
  - *"Record 1,500 tk transport fuel expense for vehicle TA-11-1234."*
- **Action Execution Cards:** Auto-generates structured confirmation cards with 1-click deep links to View / Print Invoices (`INV-2026-xxxx`), Money Receipts (`MR-2026-xxxx`), and Stock Movements.
- **Multi-LLM Provider Switching (In Settings):**
  - **Google Gemini:** `gemini-3.5-flash` (Default), `gemini-3.1-flash-lite` (High speed), `gemini-3.1-pro-preview` (Audits). Proxied securely on the backend server.
  - **OpenAI-Compatible Providers:** Plug in OpenAI (ChatGPT `gpt-4o`, `gpt-4o-mini`), Groq, DeepSeek, or local Ollama instances with custom Base URLs and API keys.
- **Rich Markdown Formatting:** Real-time rendering of headings, data tables, bullet points, and code blocks with 1-click copy buttons.
- **Floating Assistant:** Global slide-over drawer accessible from any screen without navigating away.

### 4. 🧾 Point of Sale (POS) & Billing
- **Instant Invoicing:** Multi-tier pricing by customer category (Dealer, Retail Shop, Hotel / Restaurant, Commercial).
- **Print Templates:**
  - Standard **A4 Office Invoice** with BERC license, BIN, and distributor details.
  - **80mm POS Thermal Slip** for fast counter receipts.
  - **Delivery Challan (`DC-2026-xxxx`)** for drivers with vehicle numbers and empty collection targets.
- **Flexible Settlement Modes:** Full Exchange (1:1), Partial Exchange (Empty Due), Cylinder Deposit (`৳2,200`), or Sold Permanently.

### 5. 👥 Customers & Suppliers Management
- **Customer Profiles:** Area mapping (Mohammadpur, Mirpur, Dhanmondi, etc.), credit limits, phone numbers, and physical cylinder balances.
- **Supplier Ledger:** Manage orders from LPG bottling plants, empty returns dispatched to plant, and payable balances.

### 6. 💰 Accounts & Daily Cashbook
- **Accounts:** Live balances for **Cash in Hand**, **bKash Merchant**, **Nagad**, and **Bank Accounts**.
- **Money Receipts (`MR`):** Auto-generated on customer payment collection.
- **Expense Vouchers (`EV`):** Track godown rent, driver tips, vehicle diesel/CNG, labor handling charges, and maintenance.

### 7. 🔐 Role-Based Access Control (RBAC)
Tailored permissions and access boundaries for godown personnel:

| Role | Permissions & Access |
|---|---|
| **Super Admin** | Full unrestricted system control, financial margins, settings, audit logs, AI settings, Supabase sync |
| **Manager** | Sales, purchases, customer credit limit overrides, cylinder audit reconciliation, reports |
| **Accountant** | Invoicing, payment collection, money receipts, expense vouchers, cashbook reconciliation |
| **Store Keeper** | Cylinder stock in/out, empty returns, damaged cylinder reporting, godown physical counts |
| **Sales Operator** | Counter POS sales, customer ledger search, godown pickup billing |
| **Delivery Staff** | Delivery challans view, empty collection confirmation |

### 8. 🌐 Bilingual Localization & Offline First
- **Languages:** Seamless 1-click toggle between English and Bengali (**বাংলা**) across all views, tables, and print templates.
- **Offline First:** Operates smoothly on local machine storage (`localStorage`) during internet outages, syncing automatically to Supabase PostgreSQL when reconnected.
- **Data Export & Import:** Manual backups of the entire database into **JSON** or **CSV** formats in **Settings > Data Backup & Export**.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS 4
- **Backend Server / Proxy:** Node.js Express (`server.ts`) running concurrently with Vite dev server
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) + LocalStorage Fallback
- **AI Engine:** `@google/genai` TypeScript SDK (server-side proxied) & OpenAI-compatible REST proxy
- **Icons & Visualization:** Lucide React, Recharts

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/lpg-manager-bd.git
cd lpg-manager-bd
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your environment variables:
```ini
# Gemini API Key (Required for server-side AI Godown Agent)
GEMINI_API_KEY="your-gemini-api-key-here"

# Application URL
APP_URL="http://localhost:3000"

# Optional Supabase Database Connection
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 4. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
```

---

## ☁️ Deployment on Vercel

The project is preconfigured for deployment to Vercel via `vercel.json`.

1. Push your repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com/), click **Add New > Project** and import the repository.
3. Configure the build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add your Environment Variables in Vercel Project Settings:
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Public Anon Key
5. Click **Deploy**.

---

## 📖 Godown Daily Usage Workflow

### 1. Morning Routine: Godown Physical Audit
1. Open **Reports > Daily Cylinder Audit**.
2. Verify morning opening full cylinders against the physical stack in the godown.
3. Check previous day cash balance in **Accounts > Cashbook**.

### 2. Counter Sales & Retail Deliveries
1. Navigate to **Sales > New Sale Invoice** (or press shortcut `N`).
2. Select Customer (e.g., *Kalam Store*).
3. Add Cylinders (e.g., *Bashundhara 12kg* - Quantity: 10).
4. Enter Empties Received (e.g., 10 exchanged, or 8 returned with 2 remaining due).
5. Choose Payment Method: Cash, bKash, or Credit.
6. Click **Generate & Print Invoice** (Choose A4 or 80mm POS Slip).

### 3. Using the AI Godown Operations Agent
Click the **AI Agent** button in the TopBar or use the Floating Widget in the bottom-right corner:
- **Ask Stock Inquiries:** *"How many 12kg full cylinders are in stock across all brands?"*
- **Ask Dues:** *"Show me top 5 customers with overdue payment."*
- **Execute Transactions:** *"Sell 3 Omera 12kg to Bismillah Hotel for cash with 3 empties."*
- **Confirm Actions:** The agent generates an interactive card; click **Confirm & Execute** (or enable Auto-Execute in Settings).

### 4. Evening Settlement
1. Open **Reports > Daily Report**.
2. Review Total Cylinders Sold, Total Empties Collected, Total Cash Collected, and Pending Deliveries.
3. Take a manual backup via **Settings > Data Backup & Export** (Export JSON).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + K` / `Cmd + K` | Open Global Search Palette |
| `Alt + S` | Navigate to Sales |
| `Alt + I` | Navigate to Inventory Stock |
| `Alt + C` | Open Customers List |
| `Alt + A` | Open AI Godown Agent |
| `Escape` | Close active modals & slide-overs |

---

## 👨‍💻 Credits & Product Attribution

This product is proudly developed, engineered, and maintained by:

### **Makezaa Studio Inc.**
- 🌐 **Website:** [makezaa.com](https://makezaa.com)
- 🏢 **Company:** Makezaa Studio Inc.
- 💡 **Specialization:** High-performance Enterprise ERPs, Domain Systems, and AI Agent Solutions.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
**Made with pride by Makezaa Studio Inc. ([makezaa.com](https://makezaa.com)) for the LPG Distribution Industry.**
