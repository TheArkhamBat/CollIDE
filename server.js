const express=require('express');//import express
const app=express();//create an instance of express
const PORT=3000;//port we are using
const http=require('http');//import http; required to bind socket.io
const {Server}= require('socket.io');//extract server class from socket.io (destructuring)

const server=http.createServer(app);//create a raw http server; passes to app to respond whenever there is any incoming request
const io=new Server(server);//bind socket.io to the server

//map which stores all connected users 
const users = new Map();

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

    //this listens to new users joined event 
    socket.on('new-user-joined', (username) => {
        users.set(socket.id, username);
        const userList = Array.from(users.values());
        io.emit('update-user-list', userList);
    });

    //broadcasts users disconnecting 
    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        if (username) {
            console.log(`${username} has disconnected.`);
            users.delete(socket.id);
            const userList = Array.from(users.values());
            io.emit('update-user-list', userList);
        } else {
            console.log("An anonymous user has disconnected.");
        }
    });

    // Listen for when a client is typing
    socket.on('typing', () => {
        // Get the username associated with this socket
        const username = users.get(socket.id);
        if (username) {
            // Broadcast to all other clients that this user is typing
            socket.broadcast.emit('user-typing', username);
        }
    });

});
//Console log whenever express acts as a static server
server.listen(PORT,()=>{
    console.log(`Server is running at http:/localhost:${PORT}`)
})