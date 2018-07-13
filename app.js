const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const HOSTNAME = process.env.HOSTNAME || 'localhost'

express()
  .use(express.static(path.join(__dirname, 'public')))
  .get('/cool', (req, res) => res.send(cool()))
  .get('/', (req, res) => res.send('Hello World\n'))
  .listen(PORT, HOSTNAME, () => console.log(`Listening on http://${HOSTNAME}:${PORT}`))
