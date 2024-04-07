//need to make it so when the page has been set to cleared the current response in storage is cleared 

// still dont know how to use the mic and record audio to be sent
//dont know how to keep the extension open when i am going to highlight text / maybe use the dropper as a reference
//dont know if the highlight function works.



import {getActiveTab} from "/Japanese-Sensei-Extension/utils.js";


const textArea = document.getElementById('textInput');
textArea.setAttribute('state', 'cleared')

function setState(newValue) {           //sets if the text Area has text in it or not
    textArea.setAttribute('state', newValue);
    if(textArea.getAttribute('state')==='cleared'){
        chrome.storage.sync.set({'curentresponse': JSON.stringify('')});
    }

}


const getKey = async () => {
    try {
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: 'GET_API_KEY' }, function(response) {
                if (response && response.apiKey) {
                    console.log('i got the key');  ///take this away later
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




const textFromInput = async (textContent) => {
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
        chrome.storage.sync.set({'curentresponse': JSON.stringify(comp)}); //puts the response in storage to be used later
        
        // Update textarea with response
       const existingTextArea = document.getElementById("textInput");  //adds reponce to response box
       if (existingTextArea) {
        existingTextArea.value += '\n' + comp;
      }
      setState("active");
      textArea.setAttribute('state',"active"); //delete this later

    } catch (error) {
        console.error("Error sending text to OpenAI:", error);
    }
    
};

const textToSpeach = async (textContent) => {
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

const speachToText = async (formData) => {
    try {
        // Make a POST request to OpenAI API
        let key = await getKey();
        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`
            },
            body: formData
        });

        // Check if request was successful
        if (!response.ok) {
            throw new Error("Network response was not ok");
            
        }else{
            const responseBody = await response.json();
            console.log(responseBody.text);
            return responseBody.text
        
        }
        

    } catch (error) {
        console.error("Error sending data to OpenAI:", error);
    }
    
};

chrome.runtime.onMessage.addListener(function(highlighedText, sender, sendResponse) {
    resetFunc(); //resets the text on the page
    const {type}= highlighedText;
    if (type === 'DOMtext') {
        chrome.storage.sync.get(["highlightedV"],(data)=>{  //gets the highlighted text that was put in chrome storage
            const selected = data.highlightedV;   //highlited text 
            textArea.value += selected; // adds that to the text area
            textFromInput(selected)    //sends to gpt for a translation
            setState('active'); //sets the state of textArea to active

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
    audioButton.setAttribute('state','inactive'); //initially set to inactive

    audioButton.addEventListener("click", async ()=>{
        const tab = await getActiveTab();
                    if (tab && tab.id) {
                             // Use the tab ID
                            console.log("Current tab ID:", tab.id);
                        } else {
                             console.error("Unable to get the ID of the current tab");
                        }
        if(audioButton.getAttribute('state')==='inactive'){
            changeAudioBtnState(); //changes the button to active
        chrome.tabs.sendMessage(tab.id,{action: "request_audio"},function(response){
            if(!chrome.runtime.lastError){
                console.log(response);
            }else{
                console.log(chrome.runtime.lastError, 'error line 197');
            }
            })
        }else{
            try {
                     // Get the current tab
                    const tab = await getActiveTab();
                    let tabID = (tab.id).toString();
                    
                const response = await new Promise((resolve, reject) => {
                    chrome.tabs.sendMessage(tab.id, { action: "stop_audio" }, function(response) {
                        if (!chrome.runtime.lastError) {
                            resolve(response);
                        } else {
                            reject(chrome.runtime.lastError);
                        }
                    });
                });
                console.log("Response from stop_audio:", response);
                if (response) {
                    
                    let blobURL;

                // Define an asynchronous function to handle the logic
            const getBlobUrlAndProcess = async () => {
                // Wrap the timeout in a promise to use await
             blobURL = await new Promise((resolve, reject) => {
                setTimeout(async () => {
                    await new Promise((resolveInner, rejectInner) => {
                        chrome.storage.local.get([tabID], function(result) {
                            if (chrome.runtime.lastError) {
                             rejectInner(chrome.runtime.lastError);
                            } else {
                             resolveInner(result[tabID]); // Resolves the inner promise with the result
                                console.log(`After delay: Retrieved Blob URL from local storage at key ${tabID}`, result[tabID]);
                        }
                    });
                }).then(resolve); // Resolve the outer promise with the value from the inner promise
            }, 100); 
        });

        // Log the Blob URL after the promise resolves
        console.log('Blob URL: ' + blobURL);

        
            return await fetch(blobURL);
            // Further processing using blobResponse...
        
            };

    // Call the asynchronous function we've defined
        let blobResponse= await getBlobUrlAndProcess();

                    
                    let blob = await blobResponse.blob()
                    console.log("Retrieved blob:", blob); 
                    
                    const file = blob;
                    const formData = new FormData();
                    formData.append('file', file, 'recording.webm'); 
                    formData.append('model', 'whisper-1');
                    // Form data goes into the body of the request
                    const transcript = await speachToText(formData);
                    if (textArea.getAttribute('state') === 'cleared') {
                        textArea.value += transcript;  // If there is no text in the text box
                    } else {
                        textArea.value += '\n' + transcript; // If there is text in the text box, add a new line before pasting
                    }
                    textFromInput(transcript); // Puts the text into the chat GPT API
                } else {
                    console.log('No response received from stop_audio');
                }
            } catch(error) {
                console.error("Error occurred:", error); // Log the entire error object
            }
                
                
               
                
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

            const textContent = await document.getElementById("textInput").value;
            console.log(textContent);
            if(textArea.getAttribute('state') != 'cleared'){ //if the text area has the attribute of cleared
            textFromInput(textContent);
            }
        } catch (error) {
        console.error("Error retrieving text from page:", error);
    }
});

const hear = document.getElementById("hear")
hear.addEventListener("click",async function(){
    try {
        if(textArea.getAttribute('state')!=='cleared') // do only if state of textArea us cleared
             chrome.storage.sync.get(['curentresponse'],(data)=>{
                const text = data.curentresponse; // text from the current response
                console.log(text)
                if(text!==''){
                textToSpeach(text); //sends current chatgpt response to the textToSpeach
                }
             })
             
         } catch (error) {
         console.error("Error retrieving text from page:", error);
     }
 });


});


