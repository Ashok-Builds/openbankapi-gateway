const http = require('http');

const payments = [
  { id: "PAY001", account_from: "ACC001", account_to: "ACC002", amount: 5000.00, currency: "INR", status: "Completed", description: "Rent transfer", date: "2026-04-01" },
  { id: "PAY002", account_from: "ACC002", account_to: "ACC003", amount: 12000.00, currency: "INR", status: "Pending", description: "Invoice payment", date: "2026-04-10" },
  { id: "PAY003", account_from: "ACC003", account_to: "ACC001", amount: 3500.00, currency: "INR", status: "Completed", description: "Loan repayment", date: "2026-04-15" }
];

let paymentCounter = 4;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = req.url;
  const method = req.method;

  if (method === 'POST' && url === '/payments/initiate') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const data = JSON.parse(body || '{}');

      if (!data.account_from || !data.account_to || !data.amount) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Missing required fields: account_from, account_to, amount" }));
        return;
      }

      const newPayment = {
        id: `PAY00${paymentCounter++}`,
        account_from: data.account_from,
        account_to: data.account_to,
        amount: data.amount,
        currency: data.currency || "INR",
        status: "Pending",
        description: data.description || "",
        date: new Date().toISOString().split('T')[0]
      };

      payments.push(newPayment);
      res.writeHead(201);
      res.end(JSON.stringify({ message: "Payment initiated successfully", payment: newPayment }));
    });

  } else if (method === 'GET' && url.startsWith('/payments/') && url.endsWith('/status')) {
    const id = url.split('/')[2];
    const payment = payments.find(p => p.id === id);
    if (payment) {
      res.writeHead(200);
      res.end(JSON.stringify({ id: payment.id, status: payment.status, amount: payment.amount, currency: payment.currency }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Payment not found" }));
    }

  } else if (method === 'POST' && url === '/payments/cancel') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      const payment = payments.find(p => p.id === data.payment_id);
      if (!payment) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Payment not found" }));
        return;
      }
      if (payment.status === 'Completed') {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Cannot cancel a completed payment" }));
        return;
      }
      payment.status = 'Cancelled';
      res.writeHead(200);
      res.end(JSON.stringify({ message: "Payment cancelled successfully", payment }));
    });

  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

server.listen(3003, () => {
  console.log('Payments API running on port 3003');
});