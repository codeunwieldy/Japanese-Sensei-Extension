# Japanese-Sensei-Extension
Users can highlight text on whatever web page they are browsing and that text will be displpayed in the prompt box of the extension.
The text is sent to GPT-3.5 that has been instructed to explain the japanes text in the order of meaning in english, then breaking the kanji down to hiragana,
then explaining the structure of the sentence. 
GPT-3.5 will then be ready to answer any questions about the japanese, either though typing in the prompt box or takig in the question by the STT button.
The user will have SST button that allows them to first specify whether thay want to ask a question about japanese or practice speaking in japanses,
GPT-3.5 will respond by saying "what i heard you say is + the japanese from the user. 



It Will have a button that takes the text inputed and send it to the TTS API so the user can hear the japanese read out
for this function, gpt will be instructed to read it out in japanese.

-------------see if mic has any input throw error to user interface if nothing is being opicked up------------------
-------------i think when i hit send rn it sends the entire text area not just the user input----------------------
might be using the previouses tab to store the url


add a subtle loading indicator for when a responce is being preoccesed by any of the apis
add somthing to the buttons to show they are being pressed
add a red blinking recording thing for when the record button has the atribute of active.
make a current audio htmlelement using const audio = new Audio(audioUrl) and have its defualt attreibute as empty
store the audio file that is recieved from the api to be able to replay it again so the api dosnt have to be called again giving the html audio element the attribute of filled
have a  condition where if the current audio file has the condition of filled than to play that on click of the audio button else procede as normal
when the the currentgpt text variable is updated make the atribute empty.
make a stop audio button for when the user starts to play the audio, replace it with an  x or somthing. 
