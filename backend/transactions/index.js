const http = require('http');

const transactions = [
  { id: "TXN001", account_id: "ACC001", type: "Credit", amount: 5000.00, currency: "INR", description: "Salary credit", date: "2026-04-01", status: "Completed" },
  { id: "TXN002", account_id: "ACC001", type: "Debit", amount: 1500.00, currency: "INR", description: "Online shopping", date: "2026-04-03", status: "Completed" },
  { id: "TXN003", account_id: "ACC002", type: "Credit", amount: 25000.00, currency: "INR", description: "Client payment", date: "2026-04-05", status: "Completed" },
  { id: "TXN004", account_id: "ACC003", type: "Debit", amount: 3000.00, currency: "INR", description: "Utility bill", date: "2026-04-07", status: "Completed" },
  { id: "TXN005", account_id: "ACC002", type: "Debit", amount: 8000.00, currency: "INR", description: "Rent payment", date: "2026-04-10", status: "Completed" }
];

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = req.url;
  const method = req.method;

  if (method === 'GET' && url === '/transactions') {
    res.writeHead(200);
    res.end(JSON.stringify({ transactions }));

  } else if (method === 'GET' && url.startsWith('/transactions/')) {
    const id = url.split('/')[2];
    const txn = transactions.find(t => t.id === id);
    if (txn) {
      res.writeHead(200);
      res.end(JSON.stringify(txn));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Transaction not found" }));
    }

  } else if (method === 'POST' && url === '/transactions/filter') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const filter = JSON.parse(body || '{}');
      let result = transactions;
      if (filter.account_id) {
        result = result.filter(t => t.account_id === filter.account_id);
      }
      if (filter.type) {
        result = result.filter(t => t.type === filter.type);
      }
      res.writeHead(200);
      res.end(JSON.stringify({ transactions: result }));
    });

  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

server.listen(3002, () => {
  console.log('Transactions API running on port 3002');
});