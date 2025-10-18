const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

cors(app)

app.listen(process.env.PORT,()=>{
    console.log("recipedia backend running on 5000")
})