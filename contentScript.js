(() => {
    console.log("i have been injected") // just making sure
   
    var recorder = null;
    function onAccessApproved(stream){
        recorder = new MediaRecorder(stream);
        recorder.start();

        recorder.onstop = function(){
            stream.getTracks().forEach(function(track){ //for each stream chunk thaat is sent as an array
                if(track.readyState === 'live'){
                    track.stop();             //stops recording
                }
            })
        }

        recorder.ondataavailable = function(event){
            let recordedBlob = event.data;
            let blobURL = URL.createObjectURL(recordedBlob); //makes url for blob
            chrome.storage.local.set({ 'audioBlobURL': blobURL }); //puts url into storage to be accesed by popup.js
            
        }



    }
   
   
   
   
   
   
    const cuurretTabURL = "";
    chrome.runtime.onMessage.addListener((obj, sender, responce) => {
        const {type, tabURL,action}= obj; //desctructure object             //imma have to chaneg this stuff form url to the tab
        if(type ==="NEW"){
            cuurretTabURL = tabURL;
            highlightedV = "highlightedV"
            document.addEventListener("mouseup",function(){
            const selection = window.getSelection();
            const selectedText = selection.toString().trim()

            if (selectedText !==''){
                chrome.storage.sync.set({[highlightedV]:JSON.stringify(selectedText)});
                chrome.runtime.sendMessage({ 
                type: "DOMtext", 
            });
        }   
    } );   
      
    }
    if(action === 'request_audio'){
        console.log("request recording");
        responce(`processed: ${action}`);

        navigator.mediaDevices.getUserMedia({ //this returns a promise of the media stream
            audio:{
                noiseSuppression:true
            }
            
        }).then((stream)=>{
            onAccessApproved(stream); 
        })


    }
    if(action === 'stop_audio'){
        console.log("request stop recording");
        responce(`processed: ${action}`);
        if(!recorder){
            return console.log("no recorder yet")
        }else{
            recorder.stop(); //goes to the stop methode in onAccessApproved() fucntion
        }
        


    }




}); 
        
   
})();
