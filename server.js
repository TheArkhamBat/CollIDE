const express=require('express');//import express
const app=express();//create an instance of express
const PORT=3000;//port we are using
const http=require('http');//import http; required to bind socket.io
const {Server}= require('socket.io');//extract server class from socket.io (destructuring)

const server=http.createServer(app);//create a raw http server; passes to app to respond whenever there is any incoming request
const io=new Server(server);//bind socket.io to the server

app.use(express.static('public'));//this sets up a static server from 'public' folder

io.on('connection',(socket)=>{//triggered when client connects
    console.log("A user connected.");

    //when code is changed, emit code-update event with new code
    socket.on('code-change',(code)=>{
        socket.broadcast.emit('code-update',code);
    })

    //when scratchpad text is changed, emit scratchpad-update event with new text
    socket.on('scratchpad-change',(scratchpadText)=>{
        socket.broadcast.emit('scratchpad-update',scratchpadText);
    })

    socket.on('disconnect',()=>{//triggered when client disconnects
        console.log("A user has disconnected.");
    });
});
//Console log whenever express acts as a static server
server.listen(PORT,()=>{
    console.log(`Server is running at http:/localhost:${PORT}`)
})