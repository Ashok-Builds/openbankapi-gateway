# OpenBankAPI Gateway

A managed API gateway simulating an open banking platform built on WSO2 API Manager 4.6.

## Architecture
[paste your architecture diagram here]

## Tech Stack
- WSO2 API Manager 4.6
- Node.js 18 + Express (no npm — built-in http module)
- OAuth2 Client Credentials Flow
- WSO2 apictl 4.6.0
- Postman

## Project Structure
- backend/ — 3 Node.js banking services
- specs/ — OpenAPI 3.0 YAML specs
- apictl/ — exported API configs + deploy.sh
- postman/ — test collection

## APIs
| Service | Port | Endpoints |
|---------|------|-----------|
| Accounts | 3001 | GET /accounts, GET /accounts/{id}, GET /accounts/{id}/balance |
| Transactions | 3002 | GET /transactions, GET /transactions/{id}, POST /transactions/filter |
| Payments | 3003 | POST /payments/initiate, GET /payments/{id}/status, POST /payments/cancel |

## Gateway URL
https://localhost:8243/banking/1.0.0

## Setup Instructions
1. Start WSO2: cd /mnt/c/wso2/wso2am-4.6.0/bin && sh wso2server.sh start
2. Start Accounts API: cd backend/accounts && node index.js
3. Start Transactions API: cd backend/transactions && node index.js
4. Start Payments API: cd backend/payments && node index.js

## Test Scenarios
- Valid token → 200 OK
- No token → 401 Unauthorized
- Wrong scope → 403 Forbidden
- Rate limit exceeded → 429 Too Many Requests
- Malformed body → 400 Bad Request
- Sensitive field stripped → internal_ref absent

## Demo
[Add Loom link here]

## What I Learned
Built a production-pattern API gateway simulating how banks like HDFC expose 
APIs to fintech partners. WSO2 handles all security, throttling, and 
transformation — the Node.js backend stays clean and focused only on data.