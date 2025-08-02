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

//now supports everything along with private room 

io.on('connection', (socket) => {
    console.log("A user connected:", socket.id);

    // This listens to new users joining a specific room
    socket.on('new-user-joined', ({ username, room }) => {
        // Join the socket to the specified room
        socket.join(room);
        // Store user info, including the room
        users.set(socket.id, { username, room });
        console.log(`${username} joined room: ${room}`);

        // Get a list of users ONLY in the current room
        const roomUsers = Array.from(users.values())
            .filter(user => user.room === room)
            .map(user => user.username);
        
        // Broadcast the updated user list to everyone in that room
        io.to(room).emit('update-user-list', roomUsers);
    });

    // When code is changed, broadcast ONLY to the same room
    socket.on('code-change', (code) => {
        const user = users.get(socket.id);
        if (user) {
            socket.to(user.room).emit('code-update', code);
        }
    });

    // When scratchpad text is changed, broadcast ONLY to the same room
    socket.on('scratchpad-change', (scratchpadText) => {
        const user = users.get(socket.id);
        if (user) {
            socket.to(user.room).emit('scratchpad-update', scratchpadText);
        }
    });

    // When a client is typing, broadcast ONLY to the same room
    socket.on('typing', () => {
        const user = users.get(socket.id);
        if (user) {
            socket.to(user.room).emit('user-typing', user.username);
        }
    });

    // When a user disconnects, update the user list for that room
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            console.log(`${user.username} from room ${user.room} has disconnected.`);
            // Remove the user from the map
            users.delete(socket.id);

            // Get the new list of users for that room
            const roomUsers = Array.from(users.values())
                .filter(u => u.room === user.room)
                .map(u => u.username);

            // Broadcast the updated list to the remaining clients in the room
            io.to(user.room).emit('update-user-list', roomUsers);
        }
    });
});

//Console log whenever express acts as a static server
server.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`)
})