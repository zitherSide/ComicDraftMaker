import { runInNewContext } from 'vm'

const express = require('express')
const app = express()
const {promisify} = require('util')

const sqlite = require('sqlite3')
const db = new sqlite.Database('assets/plot.db')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.post('/api/postSQL', (req, res) => {
    db.run(req.body.sql, req.body.values, err => console.log(err || 'post sql completed: ' + req.body.sql + ', ' + req.body.values))
    res.end()
})

app.get('/api/getAllSQLResults', (req, res) => {
    db.serialize( () => {
        db.all(req.query.sql, req.query.values, (err, data) => res.send(data))
        // promisify(db.all)(req.query.sql, req.query.values)
        //     .then(rows => res.send(rows))
        //     .catch(err => {
        //         console.log(err)
        //         res.end()
        //     })
    })
})

export default app