const express = require('express');

const app = express();
const port = process.env.PORT;

app.get('/', (req: any, res: any) => {
  res.send('splurge running');
});

app.listen(port, () => {
  console.log(`splurge listening on ${port}`);
});
