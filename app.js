const express = require('express');
const cors = require('cors');
const { v4 } = require('uuid');
const fs = require('fs');
const morgan = require('morgan');
const THINGS = require('./things.json');

const app = express();
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set('port', process.env.PORT || 3000);

const initialThings = [
  { "id": "1234", "name": "John", "label": "zeroth" },
  { "id": "2468", "name": "Mary", "label": "first" },
  { "id": "9876", "name": "Kate", "label": "second" }
];

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '/api/v1/things');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});

app.get('/api/v2', (req, res) => {
  res.status(200).json({message: 'v2 is ready'});
});

app.get('/api/v1/things', (req, res) => {
  res.status(200).json(THINGS);
});

app.post('/api/v1/things', (req, res) => {
  const thing = { id: v4(), ...req.body };
  THINGS.push(thing);
  
  fs.writeFileSync('./things.json', JSON.stringify(THINGS, null, '\t'));
  res.status(201).json(thing);
});

app.put('/api/v1/things/:id', (req, res) => {
  const thingId = req.params.id;
  const idx = THINGS.findIndex(el => el.id === thingId);
  THINGS[idx] = { id: thingId, ...req.body };
  fs.writeFileSync('./things.json', JSON.stringify(THINGS, null, '\t'));
  res.json(THINGS[idx]);
});

app.delete('/api/v1/things/:id', (req, res) => {
  const thingId = req.params.id;
  const idx = THINGS.findIndex(el => el.id === thingId);
  const data = [...THINGS.slice(0, idx), ...THINGS.slice(idx + 1)];
  fs.writeFileSync('./things.json', JSON.stringify(data, null, '\t'));
  res.status(200).json({message: 'Thing deleted'});
});

async function start() {
  try {
    app.listen(app.get('port'), () => console.log(`App has been started on PORT: ${app.get('port')}...`));
  } catch (e) {
    console.log('Server error', e.message);
    process.exit(1);
  }
}

start();
