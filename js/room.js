let messagesContainer = document.getElementById('messagesFeed');
messagesContainer.scrollTop = messagesContainer.scrollHeight;

const memberContainer = document.getElementById('members');
const memberButton = document.getElementById('membersButton');

const chatContainer = document.getElementById('messages');
const chatButton = document.getElementById('chatButton');

let activeMemberContainer = false;

memberButton.addEventListener('click', () => {
  if (activeMemberContainer) {
    memberContainer.style.display = 'none';
  } else {
    memberContainer.style.display = 'block';
  }

  activeMemberContainer = !activeMemberContainer;
});

let activeChatContainer = false;

chatButton.addEventListener('click', () => {
  if (activeChatContainer) {
    chatContainer.style.display = 'none';
  } else {
    chatContainer.style.display = 'block';
  }

  activeChatContainer = !activeChatContainer;
});

let displayFrame = document.getElementById('streamBox');
let videoFrame = document.getElementsByClassName('video');
let userIdinDisplayframe = null;

let expandVideoFrame = (e) => {

  let child = displayFrame.children[0]
  if(child){
      document.getElementById('streams').appendChild(child)
  }

  displayFrame.style.display = 'block'
  displayFrame.appendChild(e.currentTarget)
  userIdinDisplayframe = e.currentTarget.id

  for(let i = 0; videoFrame.length > i; i++){
    if(videoFrame[i].id != userIdinDisplayframe){
      videoFrame[i].style.height = '100px'
      videoFrame[i].style.width = '100px'
    }
  }

}

for(let i = 0; videoFrame.length > i; i++){
  videoFrame[i].addEventListener('click', expandVideoFrame)
  console.log('click')
}

let hidedisplayFrame = () => {
  displayFrame.style.display = 'none'
  userIdinDisplayframe = null

  let child = displayFrame.children[0]
  document.getElementById('streams').appendChild(child)

  for (let i = 0; i < videoFrame.length; i++) {
    videoFrame[i].style.height = '300px';
    videoFrame[i].style.width = '300px';
  }
}

displayFrame.addEventListener('click', hidedisplayFrame)

