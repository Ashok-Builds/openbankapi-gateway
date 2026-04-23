const http = require('http');

const accounts = [
  { id: "ACC001", account_holder: "Rahul Sharma", type: "Savings", balance: 45000.00, currency: "INR" },
  { id: "ACC002", account_holder: "Priya Patel", type: "Current", balance: 120000.00, currency: "INR" },
  { id: "ACC003", account_holder: "Amit Kumar", type: "Savings", balance: 78500.00, currency: "INR" }
];

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = req.url;
  const method = req.method;

  if (method === 'GET' && url === '/accounts') {
    const sanitized = accounts.map(({ internal_ref, ...rest }) => rest);
    res.writeHead(200);
    res.end(JSON.stringify({ accounts: sanitized }));

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

server.listen(3004, () => {
  console.log('Accounts API v2 running on port 3004');
});