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
    socket.emit('typing');
    const code=editor.getValue();
    socket.emit('code-change',code);
});
//EMit on scratchpad change
scratchpad.addEventListener('input',()=>{
    if (suppressTextChange) return;
    socket.emit('typing');
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
    if (!username) {
        alert("Please enter a username.");
        return; // Stop if username is empty
    }
    const room = prompt("Enter the 6-digit room ID:");

    // Basic validation to ensure a room was entered
    if (!room || room.trim() === '') {
        alert("You must enter a room ID to join.");
        return;
    }

    // Send both username and the prompted room ID to the server now heck yeah !!
    socket.emit('new-user-joined', { username: username, room: room });

    // Hide the input and button after connecting
    usernameInput.style.display = 'none';
    connectButton.style.display = 'none';
});

//-------------------Lower block malfunctioning------------------------
// This block handles showing and hiding the typing indicator
let typingTimer;
const typingIndicator = document.getElementById('typing-indicator');

socket.on('user-typing', (username) => {
    if (!typingIndicator) return;

    // Display the message
    typingIndicator.innerText = `${username} is typing...`;

    // Clear any old timer so the message stays visible
    clearTimeout(typingTimer);

    // Set a new timer that will clear the message after 2 seconds
    typingTimer = setTimeout(() => {
        typingIndicator.innerText = '';
    }, 2000);
});
//--------------------------------------------------------------------------