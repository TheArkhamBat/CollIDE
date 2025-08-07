const socket=io();//calls socket.io client and connects to the server
let suppressCodeChange=false;//Infinite event emit loop glitch occuring without this
let suppressTextChange=false;
let currentRoomId = null;

//Code for codespace highlighting
var editor=CodeMirror.fromTextArea(document.getElementById('codespace'),{
            lineNumbers:true,
            mode: "javascript",
            theme: "default"
        });

//Scratchpad area
var scratchpad=document.getElementById('scratchpad');

const connectButton = document.getElementById('connect-button');
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
    //display number of users
    document.getElementById("user-count").innerText=users.length;
});

//connect button logic
connectButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const roomInput = document.getElementById("room-id-input");
    let room = roomInput.value.trim();

    if (!username) {
        alert("Please enter a username.");
        return;
    }

    currentRoomId = room;
    socket.emit('new-user-joined', { username, room });

});

socket.on('room-not-found', () => {
    alert("Room not found. Please check the Room ID or leave it empty to create a new one.");
});


//room joined handler
socket.on('room-joined', (room) => {
    document.getElementById('room-id-display').innerText = room;
    document.getElementById("room-info").style.display = "block";
    // Hide modal and show room ID
    document.getElementById("connect-modal").style.display = 'none';
    usernameInput.style.display = 'none';
    connectButton.style.display = 'none';
    roomInput.style.display = 'none';
});



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


//NEED TO REFINE THIS. NOT 100% WORKING YET 
// --- Upload and Download Logic ---

const downloadBtn = document.getElementById('download-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');

// Download Logic
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const code = editor.getValue();
        const blob = new Blob([code], { type: 'text/javascript' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'code.js';
        a.click();
        URL.revokeObjectURL(a.href);
    });
}

// Upload Logic
if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result;
            editor.setValue(fileContent);
        };
        reader.readAsText(file);
        event.target.value = '';
    });
}