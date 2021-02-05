/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable default-case */

const ws = new WebSocket('ws://ahj-homewowrk-8.herokuapp.com/ws');

const modal = document.getElementById('modal');
const name = document.getElementById('name');
const membersList = document.getElementById('members-list');
const membersOnline = document.getElementById('members-online');

const sendButton = document.getElementById('send-button');
const messages = document.getElementById('messages-wrapper');
const messageBox = document.getElementById('typing-area');
let myName;

function addMember(e) {
  e.preventDefault();
  ws.send(JSON.stringify({
    method: 'addMember',
    name: name.value,
  }));
}

function sendMessage(e) {
  e.preventDefault();
  if (messageBox.value.length > 0) {
    ws.send(JSON.stringify({
      method: 'sendMessage',
      message: {
        author: myName,
        text: messageBox.value,
      },
    }));
  }
  messageBox.value = '';
}

function closeModal(evt) {
  evt.preventDefault();
  modal.classList.add('hidden');
}

function showAllMembers() {
  ws.send(JSON.stringify({
    method: 'getAllMembers',
  }));
}

function showAllMessages() {
  ws.send(JSON.stringify({
    method: 'getAllMessages',
  }));
}

modal.addEventListener('submit', addMember);
sendButton.addEventListener('click', sendMessage);

ws.addEventListener('message', (evt) => {
  const data = JSON.parse(evt.data);
  switch (data.type) {
    case 'success':
    {
      myName = name.value;
      membersList.classList.remove('hidden');
      closeModal(evt);
      showAllMembers();
      showAllMessages();
      return;
    }
    case 'fail':
    {
      alert('Пользователь с таким именем уже есть');
      return;
    }
    case 'members':
    {
      membersOnline.innerHTML = '';
      const allMembers = data.content;
      for (let i = 0; i < allMembers.length; i += 1) {
        const newMember = document.createElement('li');
        newMember.classList.add('member');
        if (allMembers[i] === myName) {
          newMember.classList.add('member-me');
        }
        newMember.textContent = allMembers[i];
        membersOnline.appendChild(newMember);
      }
      return;
    }
    case 'messages':
    {
      messages.innerHTML = '';
      const allMessages = data.content;
      for (let i = 0; i < allMessages.length; i += 1) {
        const message = document.createElement('div');
        message.classList.add('message');
        if (allMessages[i].author === myName) {
          message.classList.add('your-message');
          message.innerHTML = `<div class='message-info'>${myName}</div><div class='message-text'>${allMessages[i].text}</div>`;
        } else {
          message.innerHTML = `<div class='message-info'>${allMessages[i].author}</div><div class='message-text'>${allMessages[i].text}</div>`;
        }
        messages.appendChild(message);
      }
    }
  }
});

ws.addEventListener('open', () => {
  console.log('connected');
});

ws.addEventListener('close', (evt) => {
  console.log('connection closed', evt);
});

ws.addEventListener('error', () => {
  console.log('error');
});

window.addEventListener('unload', () => {
  ws.send(JSON.stringify({
    method: 'removeMember',
    name: myName,
  }));
});
