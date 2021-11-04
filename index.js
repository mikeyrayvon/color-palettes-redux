const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

// Serve the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/getColors', (req, res) => {
  try {
    axios.get('https://5plj7j5mce.execute-api.eu-central-1.amazonaws.com/default/updatePalettes?TableName=colors')
      .then(data => res.status(200).send(data))
      .catch(err => res.send(err));
  } catch(err){
    console.error('Error', err);
  }
});

// Wildcard returns React index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Express listening on ${port}`);