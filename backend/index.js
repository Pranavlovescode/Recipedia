// const express = require('express')
// const app = express()
// const cors = require('cors')
// require('dotenv').config()
import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
cors(app)

app.get('/test',(req,res)=>{
    res.json({"msg":"Server working fine"})
})

app.listen(process.env.PORT,()=>{
    console.log("recipedia backend running on 5000")
})