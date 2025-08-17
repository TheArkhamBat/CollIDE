const express=require('express');//import express
const app=express();//create an instance of express
const PORT=3000;//port we are using
const http=require('http');//import http; required to bind socket.io
const {Server}= require('socket.io');//extract server class from socket.io (destructuring)
const rooms = new Map(); // roomId : [list of usernames]

const server=http.createServer(app);//create a raw http server; passes to app to respond whenever there is any incoming request
const io=new Server(server);//bind socket.io to the server

//map which stores all connected users 
const users = new Map();

app.use(express.static('public'));//this sets up a static server from 'public' folder

//now supports everything along with private room 
io.on('connection', (socket) => {
    console.log("A user connected:", socket.id);

    socket.on('new-user-joined', ({ username, room }) => {
        let isCreatingNewRoom = false;

        // Case 1: Room ID is empty → generate one
        if (!room) {
            room = Math.floor(100000 + Math.random() * 900000).toString();
            isCreatingNewRoom = true;
        }

        const validRoomId = /^\d{6}$/.test(room);
        const roomUsers = Array.from(users.values()).filter(user => user.room === room);
        const roomExists = roomUsers.length > 0;

        // Case 2: Joining a non-existent room → reject
        if (!isCreatingNewRoom && (!validRoomId || !roomExists)) {
            socket.emit('room-not-found');
            return;
        }

        //  Passed checks — join the room
        socket.join(room);
        users.set(socket.id, { username, room });

        if (!rooms.has(room)) {
            rooms.set(room, []);
        }
        rooms.get(room).push(username);

        console.log(`${username} joined room: ${room}`);

        const updatedRoomUsers = Array.from(users.values())
            .filter(user => user.room === room)
            .map(user => user.username);

        socket.emit('room-joined', room); // optional, used if you want to track it client-side
        io.to(room).emit('update-user-list', updatedRoomUsers);
    });

    socket.on('code-change', (code) => {
        const user = users.get(socket.id);
        if (user) {
            socket.to(user.room).emit('code-update', code);
        }
    });

    socket.on('scratchpad-change', (scratchpadText) => {
        const user = users.get(socket.id);
        if (user) {
            socket.to(user.room).emit('scratchpad-update', scratchpadText);
        }
    });

    socket.on('typing', () => {
        const user = users.get(socket.id);
        if (user) {
            socket.to(user.room).emit('user-typing', user.username);
        }
    });

    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            console.log(`${user.username} from room ${user.room} has disconnected.`);
            users.delete(socket.id);

            const updatedRoomUsers = rooms.get(user.room)?.filter(u => u !== user.username) || [];
            if (updatedRoomUsers.length === 0) {
                rooms.delete(user.room);
            } else {
                rooms.set(user.room, updatedRoomUsers);
            }

            const roomUsers = Array.from(users.values())
                .filter(u => u.room === user.room)
                .map(u => u.username);

            io.to(user.room).emit('update-user-list', roomUsers);
        }
    });
});


//Console log whenever express acts as a static server
server.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`)
})