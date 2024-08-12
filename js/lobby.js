let form=document.getElementById('lobbyForm');

let displayName=sessionStorage.getItem('displayName');
if(displayName){
    form.name.value=displayName;
}

form.addEventListener('submit',(e)=>{
    e.preventDefault();

    sessionStorage.setItem('displayName',e.target.name.value);

    let inviteCode=e.target.room.value;
    if(!inviteCode){
        inviteCode=String(Math.floor(Math.random()*1000000));
    }
    window.location.href=`/room.html?room=${inviteCode}`;
});