const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const HOSTNAME = process.env.HOST || 'localhost'
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://drcvvsvulvxlbr:eb482de988c4c2db3ff7145eb099146387dc372dece17a5173c56b26899b4ab9@ec2-23-23-93-115.compute-1.amazonaws.com:5432/d17lv613j57ujr'

const Sequelize = require('sequelize')
console.log('HOST', HOSTNAME)
console.log('Database URL', DATABASE_URL)
const db = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  },
  pool: {
    max: 25,
    min: 0,
    idle: 10000
  }
})

db
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  })

const app = express()

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('view engine', 'ejs')
  .get('/cool', (req, res) => res.send(cool()))
  .get('/', (req, res) => res.send('Hello World\n'))
  .get('/times', (req, res) => {
    let result = ''
    const times = process.env.TIMES || 5
    for (i = 0; i < times; i++) {
      result += i + ' '
    }
    res.send(result)
  })
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      console.log(result)
      res.send(result);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, HOSTNAME, () => console.log(`Listening on http://${HOSTNAME}:${PORT}`));
