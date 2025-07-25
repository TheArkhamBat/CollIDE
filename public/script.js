const socket=io();//calls socket.io client and connects to the server

//Code for codespace highlighting
var editor=CodeMirror.fromTextArea(document.getElementById('codespace'),{
            lineNumbers:true,
            mode: "javascript",
            theme: "default"
        });
        editor.on('change',()=>{
            const code=editor.getValue();
            socket.emit('code-change',code);
        });

console.log("script.js loaded successfully!");

socket.on('connect',()=>{
    console.log("Connected to Socket.io server");
});

socket.on('disconnect',()=>{
    console.log("Disconnected from Socket.io server");
});
//when code update event is received
socket.on('code-update',(newCode)=>{
    const currentCursor=editor.getCursor();//get current cursor position
    editor.setValue(newCode);//update actual code
    editor.setCursor(currentCursor);
});