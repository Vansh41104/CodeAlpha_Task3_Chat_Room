let handleMemberJoined = async (MemberId) => {
    console.log('A new member has joined the room:', MemberId)
    addMemberToDom(MemberId)

    let members = await channel.getMembers()
    updateMemberTotal(members)

    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])

    addBotMessage(`Welcome to the room ${name}! 👋`)
}

let addMemberToDom = async (MemberId) => {
    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])

    let membersWrapper = document.getElementById('memberList')
    let memberItem = `<div class="memberWrapper" id="member__${MemberId}">
                        <span class="greenIcon"></span>
                        <p class="memberName">${name}</p>
                    </div>`

    membersWrapper.insertAdjacentHTML('beforeend', memberItem)
}

let updateMemberTotal = async (members) => {
    let total = document.getElementById('membersCount')
    total.innerText = members.length
}
 
let handleMemberLeft = async (MemberId) => {
    removeMemberFromDom(MemberId)

    let members = await channel.getMembers()
    updateMemberTotal(members)
}

let removeMemberFromDom = async (MemberId) => {
    let memberWrapper = document.getElementById(`member__${MemberId}`)
    let name = memberWrapper.getElementsByClassName('memberName')[0].textContent
    addBotMessage(`${name} has left the room.`)
        
    memberWrapper.remove()
}

let getMembers = async () => {
    let members = await channel.getMembers()
    updateMemberTotal(members)
    for (let i = 0; members.length > i; i++){
        addMemberToDom(members[i])
    }
}

let handleChannelMessage = async (messageData, MemberId) => {
    console.log('A new message was received')
    let data = JSON.parse(messageData.text)

    if(data.type === 'chat'){
        addMessageToDom(data.displayName, data.message)
    }
}

let sendMessage = async (e) => {
    e.preventDefault()

    let message = e.target.message.value
    channel.sendMessage({text:JSON.stringify({'type':'chat', 'message':message, 'displayName':displayName})})
    addMessageToDom(displayName, message)
    e.target.reset()
}

let addMessageToDom = (name, message) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage = `<div class="messageWrapper">
                        <div class="messageBody">
                            <strong class="messageAuthor">${name}</strong>
                            <p class="messageText">${message}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    // Corrected selector
    let lastMessage = document.querySelector('#messages .messageWrapper:last-child')
    if (lastMessage) {
        lastMessage.scrollIntoView()
    }
}


let addBotMessage = (botMessage) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage = `<div class="messageWrapper">
                        <div class="messageBody">
                            <strong class="messageAuthorBot">🤖 Nile Bot</strong>
                            <p class="messageText">${botMessage}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    // Corrected selector
    let lastMessage = document.querySelector('#messages .messageWrapper:last-child')
    if (lastMessage) {
        lastMessage.scrollIntoView()
    }
}


let leaveChannel = async () => {
    await channel.leave()
    await rtmClient.logout()
}

window.addEventListener('beforeunload', leaveChannel)
let messageForm = document.getElementById('messageForm')
messageForm.addEventListener('submit', sendMessage)