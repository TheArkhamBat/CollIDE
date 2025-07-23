const socket=io();//calls socket.io client and connects to the server
console.log("script.js loaded successfully!");

socket.on('connect',()=>{
    console.log("Connected to Socket.io server");
});

socket.on('disconnect',()=>{
    console.log("Disconnected from Socket.io server");
});