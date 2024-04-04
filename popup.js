//need to make it so when the page has been set to cleared the current responce in storage is cleared 

// still dont know how to use the mic and record audio to be sent
//dont know how to keep the extension open when i am going to highlight text / maybe use the dropper as a reference
//dont know if the highlight function works.



import {getActiveTab} from "/Japanese-Sensei-Extension/utils.js";


const textArea = document.getElementById('textInput');
textArea.setAttribute('state', 'cleared')

function setState(newValue) {           //sets if the text Area has text in it or not
    textArea.setAttribute('state', newValue);
    if(textArea.getAttribute('state')==='cleared'){
        chrome.storage.sync.set({'curentResponce': JSON.stringify('')});
    }

}


const getKey = async () => {
    try {
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: 'GET_API_KEY' }, function(response) {
                if (response && response.apiKey) {
                    resolve(response.apiKey);
                } else {
                    reject(new Error('Failed to retrieve API key'));
                }
            });
        });
        return response;
    } catch (error) {
        console.error("Error getting API key:", error);
        throw error;
    }
}
function resetFunc(){
    textArea.value = "";
    setState('cleared');
};
const reset = document.getElementById("reset");
reset.addEventListener('click', resetFunc);




const TextFromInput = async (textContent) => {
    try {
        // Make a POST request to OpenAI API
        let key = await getKey();
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+ key
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: textContent}]
            })
        });

        // Check if request was successful
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        // Parse response JSON
        const data = await response.json();

        // Extract completion from response
        const comp = data.choices[0].message.content;
        chrome.storage.sync.set({'curentResponce': JSON.stringify(comp)}); //puts the responce in storage to be used later
        
        // Update textarea with response
       const existingTextArea = document.getElementById("textInput");  //adds reponce to responce box
       if (existingTextArea) {
        existingTextArea.value += '\n' + comp;
      }
      setState("active");

    } catch (error) {
        console.error("Error sending text to OpenAI:", error);
    }
    
};

const TextToSpeach = async (textContent) => {
    try {
        // Make a POST request to OpenAI API
        let key = await getKey();
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+ key
            },
            body: JSON.stringify({
                model: "tts-1",
                voice: "alloy",
                input: textContent,
            })
        });

        // Check if request was successful
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        // Process the response
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Play the audio
        const audio = new Audio(audioUrl);
        audio.play();

    } catch (error) {
        console.error("Error sending text to OpenAI:", error);
    }
    
};

chrome.runtime.onMessage.addListener(function(highlighedText, sender, sendResponse) {
    resetFunc(); //resets the text on the page
    const {type}= highlighedText;
    if (type === 'DOMtext') {
        chrome.storage.sync.get(["highlightedV"],(data)=>{  //gest the highlighted text that was put in chrome storage
            const selected = data.highlightedV;   //highlited text 
            textArea.value += selected; // adds that to the text area
            TextFromInput(selected)    //sends to gpt for a translation
            setState('active');

      });
    }
});




document.addEventListener("DOMContentLoaded", () => {
    textArea.addEventListener('input', function() {// constantly checks if the textArea has any input
        setState('active');
    });
    function changeAudioBtnState(){ //changes state of button for recording use
        if(audioButton.getAttribute('state')==='active'){
            audioButton.setAttribute('state','inactive');
        }else{
            audioButton.setAttribute('state','active');
        }
    }
    const audioButton = document.getElementById('mic');
    audioButton.setAttribute('state','inactive');

    audioButton.addEventListener("click", async ()=>{
        const tab = await getActiveTab();  //from utils, grabs current tab
        if(audioButton.getAttribute('state')==='inactive'){
            changeAudioBtnState(); //changes the button to active
        chrome.tabs.sendMessage(tab,{action: "request_audio"},function(responce){
            if(!chrome.runtime.lastError){
                console.log(responce);
            }else{
                console.log(chrome.runtime.lastError, 'error line 156');
            }
            })
        }else{
            chrome.tabs.sendMessage(tab,{action: "stop_audio"},function(responce){
                if(!chrome.runtime.lastError){
                    console.log(responce);
                }else{
                    console.log(chrome.runtime.lastError, 'error line 156');
                }
                })
                changeAudioBtnState(); //changes the button to active
        }
    });

   

const send = document.getElementById("send")
send.addEventListener("click",async function(){
   
    try {
        // Get the current tab
        const tab = await getActiveTab();
        if (tab && tab.id) {
            // Use the tab ID
            console.log("Current tab ID:", tab.id);
        } else {
            console.error("Unable to get the ID of the current tab");
        }

        // Send a message to the background script to retrieve text content from the webpage
        chrome.runtime.sendMessage( { 
            type: "SEND", 
            });
            const textContent = await document.getElementById("textInput").value;
            console.log(textContent);
            if(textArea.getAttribute('state') != 'cleared'){ //if the text area has the attribute of cleared
            TextFromInput(textContent);
            }
        } catch (error) {
        console.error("Error retrieving text from page:", error);
    }
});

const hear = document.getElementById("hear")
hear.addEventListener("click",async function(){
    try {
        if(textArea.getAttribute('state')!=='cleared') // do only if state of textArea us cleared
             chrome.storage.sync.get(['curentResponce'],(data)=>{
                const text = data.curentResponce; // text from the current responce
                console.log(text)
                if(text!==''){
                TextToSpeach(text); //sends current chatgpt responce to the textToSpeach
                }
             })
             
         } catch (error) {
         console.error("Error retrieving text from page:", error);
     }
 });


});

let record = document.getElementById("mic")
record.addEventListener("click", async function(){
    const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true });
});
