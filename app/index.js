const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'UP', timestamp: new Date() }));
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Hello from DevOps Production Container!',
    hostname: process.env.HOSTNAME,
    environment: process.env.NODE_ENV || 'development'
  }));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
