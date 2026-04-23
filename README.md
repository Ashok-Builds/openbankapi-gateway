# OpenBankAPI Gateway

A managed API gateway simulating an open banking platform built on **WSO2 API Manager 4.6**. This project demonstrates how banks like HDFC, Axis, and NPCI expose their core services — Accounts, Transactions, and Payments — to fintech partners through a secure, governed, and throttled API gateway.

---

## What This Project Does

Instead of exposing Node.js backend services directly, all traffic goes through WSO2 API Manager which acts as the front door:

- Validates OAuth2 JWT tokens on every request
- Enforces scope-based access control — `payments:write` is restricted
- Applies rate limiting per subscription tier
- Strips sensitive internal fields from responses
- Logs all API activity for audit compliance
- Manages full API lifecycle including versioning

This is the same architectural pattern used by NPCI for UPI APIs, HDFC for Open Banking, and Airtel for their developer API marketplace.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              CONSUMERS                                   │
│   FintechApp          SandboxApp          Postman        │
│  (Standard tier)     (Sandbox tier)     (Testing)        │
└──────────────┬─────────────┬──────────────┬─────────────┘
               │             │              │
               │   HTTPS + Bearer JWT token │
               └─────────────┴──────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│           WSO2 API MANAGER 4.6                          │
│                                                         │
│  Management (port 9443)                                 │
│  ├── Admin Portal    → throttling tiers, key manager    │
│  ├── Publisher Portal → publish APIs, set scopes        │
│  └── Developer Portal → subscribe apps, get tokens      │
│                                                         │
│  Gateway Runtime (port 8243)                            │
│  ① Validate JWT token      → 401 if invalid             │
│  ② Check OAuth2 scope      → 403 if wrong scope         │
│  ③ Enforce rate limit      → 429 if exceeded            │
│  ④ Strip internal_ref      → clean response             │
│  ⑤ Route to backend        → forward request            │
│                                                         │
└───┬──────────────┬──────────────┬──────────────┬────────┘
    │              │              │              │
    ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Accounts │  │ Accounts │  │  Trans.  │  │ Payments │
│  API v1  │  │  API v2  │  │   API    │  │   API    │
│ Node.js  │  │ Node.js  │  │ Node.js  │  │ Node.js  │
│ port3001 │  │ port3004 │  │ port3002 │  │ port3003 │
│          │  │          │  │          │  │          │
│  field:  │  │  field:  │  │GET /trans│  │POST init │
│  owner   │  │ account_ │  │GET /:id  │  │GET status│
│          │  │  holder  │  │POST      │  │POST      │
│GET /accts│  │GET /accts│  │ /filter  │  │ /cancel  │
│GET /:id  │  │GET /:id  │  │          │  │          │
│GET /bal  │  │GET /bal  │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
  v1.0.0 ◄────────────────► v2.0.0
       API Versioning — both live simultaneously
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| API Gateway | WSO2 API Manager | 4.6.0 |
| Backend | Node.js (built-in http module) | 18 LTS |
| API Spec | OpenAPI 3.0 YAML | 3.0 |
| Testing | Postman | Latest |
| APIOps | WSO2 apictl | 4.6.0 |
| CI/CD | GitHub Actions | - |
| Version Control | Git + GitHub | - |
| OS | Windows + WSL (Ubuntu) | - |

---

## Project Structure

```
openbankapi-gateway/
├── backend/
│   ├── accounts/          Node.js Accounts API — port 3001
│   ├── accounts-v2/       Node.js Accounts API v2 — port 3004
│   ├── transactions/      Node.js Transactions API — port 3002
│   └── payments/          Node.js Payments API — port 3003
├── specs/
│   ├── accounts.yaml      OpenAPI 3.0 spec for Accounts API
│   ├── transactions.yaml  OpenAPI 3.0 spec for Transactions API
│   └── payments.yaml      OpenAPI 3.0 spec for Payments API
├── apictl/
│   ├── AccountsAPI_1.0.0.zip
│   ├── TransactionsAPI_1.0.0.zip
│   ├── PaymentsAPI_1.0.0.zip
│   └── deploy.sh          One command deploys all APIs to WSO2
├── postman/
│   └── OpenBankAPI_Tests.json
├── .github/
│   └── workflows/
│       └── api-ci.yml     GitHub Actions CI pipeline
└── README.md
```

---

## API Endpoints

### Accounts API — port 3001 (v1) / port 3004 (v2)

| Method | Endpoint | Scope | Description |
|--------|----------|-------|-------------|
| GET | `/accounts` | `accounts:read` | Get all accounts |
| GET | `/accounts/{id}` | `accounts:read` | Get account by ID |
| GET | `/accounts/{id}/balance` | `accounts:read` | Get account balance |

> v1 returns `owner` field. v2 returns `account_holder` field — demonstrates API versioning without breaking existing consumers.

### Transactions API — port 3002

| Method | Endpoint | Scope | Description |
|--------|----------|-------|-------------|
| GET | `/transactions` | `transactions:read` | Get all transactions |
| GET | `/transactions/{id}` | `transactions:read` | Get transaction by ID |
| POST | `/transactions/filter` | `transactions:read` | Filter by account or type |

### Payments API — port 3003

| Method | Endpoint | Scope | Description |
|--------|----------|-------|-------------|
| POST | `/payments/initiate` | `payments:write` | Initiate a payment |
| GET | `/payments/{id}/status` | `payments:read` | Get payment status |
| POST | `/payments/cancel` | `payments:write` | Cancel a payment |

---

## Gateway URLs

All APIs are bundled as **OpenBankAPI Suite** API Product:

| Version | Gateway URL |
|---------|-------------|
| v1 | `https://localhost:8243/banking/1.0.0` |
| v2 (Accounts) | `https://localhost:8243/banking/2.0.0` |

---

## OAuth2 Scopes

| Scope | Access | Apps |
|-------|--------|------|
| `accounts:read` | Read accounts and balances | FintechApp, SandboxApp |
| `transactions:read` | Read and filter transactions | FintechApp, SandboxApp |
| `payments:read` | Read payment status | FintechApp, SandboxApp |
| `payments:write` | Initiate and cancel payments | FintechApp only |

---

## Subscription Tiers

| Tier | Rate Limit | App |
|------|-----------|-----|
| Sandbox | 5 req/min | SandboxApp — for testing |
| Standard | 50 req/min | FintechApp — fintech partner |
| Premium | 500 req/min | Enterprise apps |

---

## Prerequisites

- WSO2 API Manager 4.6.0 installed
- Node.js 18 LTS installed in WSL
- apictl 4.6.0 installed
- Postman desktop app
- WSL (Ubuntu) on Windows

---

## Setup Instructions

### 1. Start WSO2

```bash
cd /mnt/c/wso2/wso2am-4.6.0/bin
sh wso2server.sh start
```

Wait 3-5 minutes for WSO2 to fully start. Open `https://localhost:9443/publisher` to confirm.

### 2. Start all backend services

Open 4 separate WSL terminal tabs and run one command in each:

```bash
# Tab 1 — Accounts v1
cd backend/accounts && node index.js

# Tab 2 — Accounts v2
cd backend/accounts-v2 && node index.js

# Tab 3 — Transactions
cd backend/transactions && node index.js

# Tab 4 — Payments
cd backend/payments && node index.js
```

### 3. Deploy APIs to WSO2 using apictl

```bash
cd apictl
bash deploy.sh
```

### 4. Generate OAuth2 token in Postman

```
POST https://localhost:9443/oauth2/token
Authorization: Basic Auth — FintechApp Client ID and Secret
Body (x-www-form-urlencoded):
  grant_type = client_credentials
  scope = accounts:read transactions:read payments:read payments:write
```

### 5. Call APIs through gateway

```
GET https://localhost:8243/banking/1.0.0/accounts
Authorization: Bearer <access_token>
```

---

## WSO2 Portal Configuration

| Portal | URL | Purpose |
|--------|-----|---------|
| Admin | `https://localhost:9443/admin` | Throttling tiers, key manager, categories |
| Publisher | `https://localhost:9443/publisher` | API lifecycle, policies, versioning |
| Developer | `https://localhost:9443/devportal` | App subscriptions, token generation |

---

## Test Scenarios

All 7 gateway security tests are in the Postman collection:

| Test | Expected Result |
|------|----------------|
| Valid token | 200 OK |
| No token | 401 Unauthorized |
| Expired token | 401 Unauthorized |
| Wrong scope | 403 Forbidden |
| Rate limit exceeded | 429 Too Many Requests |
| Malformed payment body | 400 Bad Request |
| internal_ref field stripped | 200 — field absent in response |

Import `postman/OpenBankAPI_Tests.json` into Postman to run all tests.

---

## API Versioning

This project demonstrates real API versioning — v1 and v2 coexist simultaneously:

```bash
# v1 — returns owner field
GET https://localhost:8243/banking/1.0.0/accounts

# v2 — returns account_holder field (breaking change)
GET https://localhost:8243/banking/2.0.0/accounts
```

Existing subscribers stay on v1 unaffected. New subscribers use v2. This is the same pattern banks use in production to avoid breaking partner integrations.

---

## CI/CD Pipeline

GitHub Actions runs automatically on every git push:

- **Validate OpenAPI Specs** — checks all 3 YAML specs for errors
- **Test Backend APIs** — starts all 4 services and runs 6 automated tests
- **Versioning Test** — verifies v1 returns `owner` and v2 returns `account_holder`
- **CI Summary** — prints commit info and test results

View pipeline runs in the **Actions** tab of this repo.

---

## APIOps — Deploy as Code

APIs are managed as code using WSO2 apictl:

```bash
# Export APIs from WSO2
apictl export api -n AccountsAPI -v 1.0.0 -e dev -k
apictl export api -n TransactionsAPI -v 1.0.0 -e dev -k
apictl export api -n PaymentsAPI -v 1.0.0 -e dev -k

# Deploy all APIs with one command
bash apictl/deploy.sh
```

---

## Key Learnings

1. **API Gateway pattern** — WSO2 sits between clients and backends handling all security, throttling, and transformation. The Node.js backend stays clean and focused only on data.

2. **OAuth2 scope enforcement** — `payments:write` is a dangerous scope. Without it a request is blocked at the gateway with 403 before the payment backend sees it.

3. **API versioning without breaking consumers** — v1 and v2 coexist. Old subscribers stay on v1. New ones use v2. This is how HDFC and NPCI handle API evolution in production.

4. **APIOps** — Managing API configurations as code using apictl means deployments are repeatable, reviewable, and version controlled — same as application code.

5. **Separation of concerns** — Security, throttling, field masking, and monitoring all live in WSO2 — not in Node.js code. This is the architecture pattern that scales.

6. **Response caching** — Enabling WSO2 response caching on GET /accounts reduced response time from 200ms to 17ms. The backend is called once every 300 seconds regardless of how many consumers are calling — critical for high traffic banking systems.

---

## Project built with

- WSO2 API Manager 4.6.0
- Node.js 18 LTS
- GitHub Actions
- WSO2 apictl 4.6.0
- Postman

---

*OpenBankAPI Gateway — Banking API Management with WSO2 API Manager 4.6*