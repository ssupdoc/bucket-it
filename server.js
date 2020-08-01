const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Get ready to bucket it!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))