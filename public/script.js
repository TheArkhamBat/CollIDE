const socket=io();//calls socket.io client and connects to the server
let suppressChange=false;//Infinite event emit loop glitch occuring without this

//Code for codespace highlighting
var editor=CodeMirror.fromTextArea(document.getElementById('codespace'),{
            lineNumbers:true,
            mode: "javascript",
            theme: "default"
        });

//Emits only if the change occurs locally, not remotely
editor.on('change',()=>{
    if (suppressChange) return;//prevents the loop
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
    currentCode=editor.getValue();//gets code in local textArea
    if (currentCode===newCode) return;//does not emit if there isn't any actual change
    
    suppressChange=true;//semaphore lock
    editor.setValue(newCode);//update actual code
    editor.setCursor(currentCursor);//update cursor position
    suppressChange=false;//semaphore unlock
});