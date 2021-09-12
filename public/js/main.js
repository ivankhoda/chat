const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat_messages');
const socket = io();
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
// Get username
let { room, userName } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

if (!userName) {
  userName = window.prompt('Input your name?');
}

function getLink() {
  const string = location.href;
  const baseLink = string.substring(0, string.indexOf('?') + 1);
  const roomNumber = string.substring(string.indexOf('&'));
  const link = `${baseLink}` + `${roomNumber}`;
  document.getElementById('clipboard').innerText = link;
}
getLink();

// Copy to clipboard
function copyText(text) {
  navigator.clipboard.writeText(text);
}
function copyToClipboard() {
  const element = document.getElementById('clipboard');
  const linkText = element.textContent;
  copyText(linkText);
}
document.getElementById('clipboard').addEventListener('click', () => copyToClipboard());

// Join chat room
socket.emit('joinRoom', { userName, room });
// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.userName;
    userList.appendChild(li);
  });
}
// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

function outputMessage(message) {
  const { username, text, time } = message;

  const userMessage = `
  <div class="row border-bottom">
          <p class="col-sm"><b>${username}, ${time}</b>:</p>
          <p class="">${text}</p>
        </div>
  `;
  document.querySelector('.chat_messages').insertAdjacentHTML('beforeend', userMessage);
}

socket.on('message', (message) => {
  outputMessage(message);
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const messageElement = event.target.elements.msg;
  const message = event.target.elements.msg.value;
  // emmiting message to the server

  socket.emit('chatMessage', message);
  // Clean input
  messageElement.value = '';
  messageElement.focus();
});

// Leave chatroom

document.getElementById('quit_button').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  }
});
