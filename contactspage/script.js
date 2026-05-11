function copyNumber(btn){
const card = btn.closest(".card");
const number = card.querySelector(".number").innerText.trim();

if(!number){
return;
}

if(navigator.clipboard && window.isSecureContext){
navigator.clipboard.writeText(number).then(()=>{
btn.innerText = "Copied!";
setTimeout(()=>btn.innerText="Copy",1500);
});
}
else{
const textArea = document.createElement("textarea");
textArea.value = number;
document.body.appendChild(textArea);
textArea.select();
document.execCommand("copy");
document.body.removeChild(textArea);

btn.innerText = "Copied!";
setTimeout(()=>btn.innerText="Copy",1500);
}
}
function openCredits(){
document.getElementById("popup").style.display="flex";
}

function closeCredits(){
document.getElementById("popup").style.display="none";
}

window.addEventListener("click",function(e){
let popup=document.getElementById("popup");
if(e.target===popup){
popup.style.display="none";
}
});