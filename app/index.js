const express = require('express');
const os = require('os');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from DevOps Production Container!',
    hostname: os.hostname(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint phục vụ Healthcheck cho CI/CD & Kubernetes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', uptime: process.uptime() });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
