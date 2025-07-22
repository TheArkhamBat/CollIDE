const express=require('express');//import express
const app=express();//create an instance of express
const PORT=3000;//port we are using
app.use(express.static('public'));//this sets up a static server from 'public' folder
//Console log whenever express acts as a static server
app.listen(PORT,()=>{
    console.log(`Server is running at http:/localhost:${PORT}`)
})