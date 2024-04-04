import fs from "fs";
import path from "path";


const openai = new OpenAI();

async function speachIn() {
  const transcriptionJap = await openai.audio.transcriptions.create({
    file: fs.createReadStream("/path/to/file/japanese.mp3"),
    model: "whisper-1",
    response_format: "text",
    prompt:"You dasdasdasd",
  });

  console.log(transcription.text);
}
speachIn();

async function japansesIn() {
    const transcriptionEng = await openai.audio.transcriptions.create({
      file: fs.createReadStream("/path/to/file/speech.mp3"),
      model: "whisper-1",
      response_format: "text",
      prompt:"You ",
    });
  
    console.log(transcription.text);
  }
  japansesIn();



const speechFile = path.resolve("./speech.mp3");  //make sure to empty file in chrome storage after use

async function japanesesTTS() {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: transcriptionJap.text,             //need to change the syntax on this 
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
}
japanesesTTS();

async function speachTTS() {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: transcriptionEng,
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
}
speachTTS();