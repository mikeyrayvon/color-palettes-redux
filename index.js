const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

// Serve the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Use CORS middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://fast-bastion-98830.herokuapp.com/'
  ],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))

const ENDPOINT = 'https://5plj7j5mce.execute-api.eu-central-1.amazonaws.com/default/updatePalettes' 

app.get('/api/getColors', (req, res) => {
  try {
    axios.get(`${ENDPOINT}?TableName=colors`)
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