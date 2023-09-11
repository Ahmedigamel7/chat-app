// const myId =document.getElementById('myId').value;


function extractTime(time){
    const date = new Date(time);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}
