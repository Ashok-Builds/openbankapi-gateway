const http = require('http');

const accounts = [
  { id: "ACC001", owner: "Rahul Sharma", type: "Savings", balance: 45000.00, currency: "INR", internal_ref: "INT-REF-001" },
  { id: "ACC002", owner: "Priya Patel", type: "Current", balance: 120000.00, currency: "INR", internal_ref: "INT-REF-002" },
  { id: "ACC003", owner: "Amit Kumar", type: "Savings", balance: 78500.00, currency: "INR", internal_ref: "INT-REF-003" }
];

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = req.url;
  const method = req.method;

  if (method === 'GET' && url === '/accounts') {
    res.writeHead(200);
    res.end(JSON.stringify({ accounts }));

  } else if (method === 'GET' && url.startsWith('/accounts/') && url.endsWith('/balance')) {
    const id = url.split('/')[2];
    const account = accounts.find(a => a.id === id);
    if (account) {
      res.writeHead(200);
      res.end(JSON.stringify({ id: account.id, balance: account.balance, currency: account.currency }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Account not found" }));
    }

  } else if (method === 'GET' && url.startsWith('/accounts/')) {
    const id = url.split('/')[2];
    const account = accounts.find(a => a.id === id);
    if (account) {
      res.writeHead(200);
      res.end(JSON.stringify(account));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Account not found" }));
    }

  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

server.listen(3001, () => {
  console.log('Accounts API running on port 3001');
});