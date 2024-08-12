const appId="67abbcf1f0984f16913171ed8736a928"

let uid= sessionStorage.getItem("uid")


if(!uid){
    uid = String(Math.floor(Math.random()*1000000));
    sessionStorage.setItem("uid",uid);
}
let token = null;
let client;

let rtmClient;
let channel;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('room');

if(!roomId){
    roomId = "demo"
}

let displayName=sessionStorage.getItem('displayName');
if(!displayName){
    window.location.href = 'lobby.html'; 
}

let localTracks = [];
let remoteUsers = {};

let loacalScreenTrack;
let sharingScreen = false;

let joinRoonInit= async ()=>{
    rtmClient = await AgoraRTM.createInstance(appId);
    await rtmClient.login({uid,token});

    await rtmClient.addOrUpdateLocalUserAttributes({'name':displayName})
    
    channel = await rtmClient.createChannel(roomId);
    await channel.join();

    channel.on('MemberJoined',handleMemberJoined);
    channel.on('MemberLeft',handleMemberLeft);
    channel.on('ChannelMessage',handleChannelMessage);


    getMembers();

    addBotMessage(`Welcome to the room ${displayName}! 👋👋`);

    client = AgoraRTC.createClient({mode:`rtc`,codec:`h264`});

    await client.join(appId,roomId,token,uid);

    client.on("user-published",handleUserPublished);
    client.on("user-left",handleUserLeft);

    joinStreamInit();
}


let joinStreamInit = async ()=>{

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({},{encoderConfig:{width:{min:640,ideal:1920,max:1920},height:{min:480,ideal:1080,max:1080}}});

    let player = ` <div class="video" id="${uid}">
                        <div class="videoPlayer" id="user${uid}" ></div>
                    </div>`
    
    document.getElementById("streams").insertAdjacentHTML('beforeend',player);
    document.getElementById(uid).addEventListener('click',expandVideoFrame)
                    
    localTracks[1].play(`user${uid}`)

    await client.publish([localTracks[0],localTracks[1]]);        
                    
}

let switchToCamera = async () => {
    let player = ` <div class="video" id="${uid}">
                        <div class="videoPlayer" id="user${uid}" ></div>
                    </div>`;
    displayFrame.insertAdjacentHTML('beforeend', player);
    await localTracks[0].setMuted(true);
    await localTracks[1].setMuted(true);

    let micButton = document.getElementById('micBtn');
    let screenButton = document.getElementById('screenBtn');

    if (micButton) {
        micButton.classList.remove('active');
    } else {
        console.warn('micBtn element not found.');
    }

    if (screenButton) {
        screenButton.classList.add('active');
    } else {
        console.warn('screenBtn element not found.');
    }

    localTracks[1].play(`user${uid}`);
    await client.publish([localTracks[1]]); 
}

let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.uid] = user;

    await client.subscribe(user, mediaType);

    let player = document.getElementById(user.uid);

    if (player === null) {
        player = `<div class="video" id="${user.uid}">
                        <div class="videoPlayer" id="user${user.uid}"></div>
                    </div>`;

        document.getElementById("streams").insertAdjacentHTML('beforeend', player);
        document.getElementById(user.uid).addEventListener('click', expandVideoFrame);
    }

    if (displayFrame && displayFrame.style.display) {
        player.style.height = '100px';
        player.style.width = '100px';
    }

    if (mediaType === "video") {
        user.videoTrack.play(`user${user.uid}`);
    }
    if (mediaType === "audio") {
        user.audioTrack.play();
    }
};

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid];
    let item = document.getElementById(user.uid);
    if (item) {
        item.remove();
    }

    if (userIdinDisplayframe === user.uid) {
        displayFrame.style.display = 'none';
        console.log('displayFrame.style.display', displayFrame.style.display);

        let videoFrames = document.getElementsByClassName('video');

        for (let i = 0; i < videoFrames.length; i++) {
            videoFrames[i].style.height = '300px';
            videoFrames[i].style.width = '300px';
        }
    }
};

let toggleMic = async (e) => {
    let button=e.currentTarget;
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false);
        button.classList.add('active');
    }
    else{
        await localTracks[0].setMuted(true);
        button.classList.remove('active');
    }
}
document.getElementById('micBtn').addEventListener('click',toggleMic);

let toggleCamera = async (e) => {
    let button=e.currentTarget;
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false);
        button.classList.add('active');
    }
    else{
        await localTracks[1].setMuted(true);
        button.classList.remove('active');
    }
}
document.getElementById('cameraBtn').addEventListener('click',toggleCamera);


let toggleScreenShare = async (e) => {
    let screeButton = e.currentTarget;
    let cameraButton = document.getElementById('cameraBtn');
    if(!sharingScreen){
        sharingScreen = true;
        screeButton.classList.add('active');
        cameraButton.classList.remove('active');
        cameraButton.style.display='none';

        loacalScreenTrack = await AgoraRTC.createScreenVideoTrack();
        document.getElementById(uid).remove();
        displayFrame.style.display = 'block';

        let player = `<div class="video" id="${uid}">
                        <div class="videoPlayer" id="user${uid}"></div>
                    </div>`;
        displayFrame.insertAdjacentHTML('beforeend', player);
        document.getElementById(uid).addEventListener('click', expandVideoFrame);

        userIdinDisplayframe = uid;

        loacalScreenTrack.play(`user${uid}`);

        await client.unpublish(localTracks[1]);

        await client.publish(loacalScreenTrack);

        let videoFrame = document.getElementsByClassName('video');

        for(let i = 0; videoFrame.length > i; i++){
            if(videoFrame[i].id != userIdinDisplayframe){
              videoFrame[i].style.height = '100px'
              videoFrame[i].style.width = '100px'
            }
          }

    } 
    else{
        sharingScreen = false;
        screeButton.classList.remove('active');
        cameraButton.style.display='block';
        document.getElementById(uid).remove();
        await client.unpublish(loacalScreenTrack);
        switchToCamera();

    }
}
document.getElementById('screenBtn').addEventListener('click',toggleScreenShare);

joinRoonInit();