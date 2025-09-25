# CollIDE: A Real-Time Collaborative IDE
A web-based collaborative IDE built with Node.js, Express, and Socket.IO. This application allows multiple users to write and share code in real-time, communicate via a shared scratchpad, and execute JavaScript or Python code directly in the browser.

## Features
* **Real-Time Code Syncing:** Code written in the editor syncs instantly across all connected clients in a private room.

* **Shared Scratchpad:** A separate text area for jotting down notes and ideas, also synced in real-time.

* **Private Rooms:** Users can create or join private, isolated sessions using a 6-digit room ID.

* **Live User Presence:** See a real-time list of all users currently in the collaboration session.

* **In-Browser Code Execution:** Run JavaScript or Python code directly in the browser and view the output in a resizable panel.

* **File System Integration:** Upload code from your local machine and download the current editor content as a .js file.

## Technologies Used
* **Backend:** Node.js, Express.js

* **Real-Time Communication:** Socket.IO (WebSocket)

* **Frontend:** HTML5, CSS3, JavaScript, CodeMirror.js

* **Client-Side Python:** Pyodide

## Getting Started
To run this project on your local machine, please follow the steps below.

### Prerequisites
You must have the following software installed on your system:

Node.js (which includes npm). You can download it from [nodejs.org](https://nodejs.org/).

### Installation & Setup
1. Clone the Repository
Open your terminal or command prompt and clone the project's GitHub repository:

```
git clone https://github.com/TheArkhamBat/CollIDE.git
```

2. Navigate to the Project Directory
Change your current directory to the newly cloned folder:

```
cd CollIDE
```

3. Install Dependencies
Install all the required Node.js packages listed in package.json:

```
npm install
```

This will install express and socket.io for the server.

4. Start the Server
Run the following command to start the local Node.js server:

```
npm start
```

You should see a confirmation message in your terminal:

Server is running at http://localhost:3000

5. Access the Application
Open your web browser and navigate to the following URL:

```
http://localhost:3000
```

The collaborative IDE will now be running in your browser. To collaborate with someone, have them follow the same steps and join the same Room ID.
