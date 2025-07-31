const socket=io();//calls socket.io client and connects to the server
let suppressCodeChange=false;//Infinite event emit loop glitch occuring without this
let suppressTextChange=false;

//Code for codespace highlighting
var editor=CodeMirror.fromTextArea(document.getElementById('codespace'),{
            lineNumbers:true,
            mode: "javascript",
            theme: "default"
        });

//Scratchpad area
var scratchpad=document.getElementById('scratchpad');

const connectButton = document.getElementById('connectc-button');
const usernameInput = document.getElementById('username-input');

//Emits only if the change occurs locally, not remotely
editor.on('change',()=>{
    if (suppressCodeChange) return;//prevents the loop
    const code=editor.getValue();
    socket.emit('code-change',code);
});
//EMit on scratchpad change
scratchpad.addEventListener('input',()=>{
    if (suppressTextChange) return;
    const scratchpadText=scratchpad.value;
    socket.emit('scratchpad-change',scratchpadText);
})

console.log("script.js loaded successfully!");

socket.on('connect', () => {
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
    
    suppressCodeChange=true;//semaphore lock
    editor.setValue(newCode);//update actual code
    editor.setCursor(currentCursor);//update cursor position
    suppressCodeChange=false;//semaphore unlock
});
//when scratchpad update event is received
socket.on('scratchpad-update',(newText)=>{
    const currentText=scratchpad.value;//text in local scratchpad
    if (currentText===newText) return;//only runs code if actual change in scratchpad text
    const start = scratchpad.selectionStart;
    const end = scratchpad.selectionEnd;
 

    suppressTextChange=true;//semaphore lock
    scratchpad.value=newText;//update scratchpad text
    //restores cursor to where it was before, without this it will go back to bgeinning ever time
    scratchpad.setSelectionRange(start, end);
    suppressTextChange=false;//semaphore unlock
});

socket.on('update-user-list', (users) => {
    const userListElement = document.getElementById('user-list');
    if (!userListElement) return;

    // Clear the current list of user tags
    userListElement.innerHTML = '';

    // Add each user to the list as a styled tag
    users.forEach(user => {
        // Create a <span> element, which is better for inline tags
        const userTag = document.createElement('span');
        userTag.innerText = user;

        // Apply the .user-tag class from your CSS file
        userTag.classList.add('user-tag');

        // Add the new styled tag to the list
        userListElement.appendChild(userTag);
    });
});

connectButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        // Send the username to the server
        socket.emit('new-user-joined', username);

        // Optionally, hide the input and button after connecting
        usernameInput.style.display = 'none';
        connectButton.style.display = 'none';
    } else {
        alert("Please enter a username.");
    }
});