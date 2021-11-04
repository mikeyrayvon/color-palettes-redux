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

// Use JSON middleware
app.use(express.json())

// AWS API endpoint
const ENDPOINT = 'https://5plj7j5mce.execute-api.eu-central-1.amazonaws.com/default/colorPalettes' 

/**
 * Get entire table of data
 * @param {string} table Name of table to retrieve
 * @return {Array.<Object>} Array of items 
 */
app.post('/api/getData', (req, res) => {
  const { table } = req.body

  axios.get(`${ENDPOINT}?TableName=${table}`)
    .then(response => {
      console.log(table, response.data)
      res.status(200).send(response.data.Items)
    })
    .catch(err => res.send(err));
});

/**
 * Add new item to a table
 *
 * @param {string} table Name of the table to update on
 * @param {Object} item Item to add
 * @return {string | Error} Success message or Error 
 */
app.post('/api/addItem', (req, res) => {
  const { table, item } = req.body

  axios.post(ENDPOINT, JSON.stringify({
    TableName: table,
    Item: item
  }), { 
    headers: {'Content-Type': 'application/json'} 
  })
    .then(response => {
      res.status(200).send({'success': 'true'})
    })
    .catch(err => {
      console.error(err)
      res.send(err)
    });
});

/**
 * Update item on a table
 *
 * @param {string} table Name of the table to update on
 * @param {string} id ID of the item to update
 * @param {Array.<Object>} updates Array of objects with keys and values to update
 * @return {string | Error} Success message or Error 
 */
app.post('/api/updateItem', (req, res) => {
  const { table, id, updates } = req.body

  const UpdateExpression = 'SET ' + updates.map((u, i) => {
    return `#${u.key} = :val${i + 1}`
  }).join(', ')
  console.log('UpdateExpression', UpdateExpression)

  const ExpressionAttributeValues = updates.reduce((cur, u, i) => {
    return {
      ...cur,
      [`:val${i + 1}`]: u.value,
    };
  }, {})
  console.log('ExpressionAttributeValues', ExpressionAttributeValues)

  const ExpressionAttributeNames = updates.reduce((cur, u) => {
    return {
      ...cur,
      [`#${u.key}`]: u.key,
    };
  }, {})
  console.log('ExpressionAttributeNames', ExpressionAttributeNames)

  axios.put(ENDPOINT, JSON.stringify({
    TableName: table,
    Key: {
      id
    },
    UpdateExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames
  }), { 
    headers: {'Content-Type': 'application/json'} 
  })
    .then(response => {
      res.status(200).send({'success': 'true'})
    })
    .catch(err => {
      console.error(err)
      res.send(err)
    });
});

/**
 * Delete an item
 * @param {string} table Name of the table to delete item from
 * @param {string} id ID of the item to delete
 * @return {string | Error} Success message or Error 
 */
app.post('/api/deleteItem', (req, res) => {
  const { table, id } = req.body
  console.log('delete', table, id)
  //res.status(200).send({'success': 'true'})
  axios.delete(ENDPOINT, { 
    data: JSON.stringify({
      TableName: table,
      Key: {
        id
      },
    }),
    headers: {'Content-Type': 'application/json'} 
  })
    .then(() => {
      res.status(200).send({'success': 'true'})
    })
    .catch(err => {
      console.error(err.response.data)
      res.send(err)
    });
})

/**
 * Get color name
 * @param {string} hex Hexidecimal value of the color
 * @return {string | Error} Success message or Error 
 */
app.post('/api/getName', (req, res) => {
  const { hex } = req.body

  axios('https://api.color.pizza/v1/' + hex)
    .then(response => {
      res.status(200).send(response.data)
    })
    .catch(err => {
      console.error(err)
      res.send(err)
    });
})

// Wildcard returns React index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Express listening on ${port}`);