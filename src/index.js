import axios from 'axios';

console.log('----begin----');
const APIKEY = "";

let index = 0;
const storyMessages = [
    {"role": "system", "content": "You are a dungeon master for dungeons and dragons campaign. You will always speak to me as if you are guiding me through a story. You will always end by asking me to make a decision"}
]

const sender = axios.create({
  headers: {
    'authorization': `Bearer ${APIKEY}`,
    'content-type': 'application/json'
  },
});

async function promptForStory(input) {
  console.log('STORY PROMPT');
  console.log(input);
  const chatUrl = "https://api.openai.com/v1/chat/completions";
  const message = {"role": "user", "content": input}
  storyMessages.push(message);


  const response = await sender.post(chatUrl, {
    model: "gpt-3.5-turbo",
    messages: storyMessages
  });

  const dmMessage = response.data["choices"][0].message.content;
  storyMessages.push({"role": "assistant", "content": dmMessage});

  return dmMessage
}

async function promptForStoryScenary(textResult){
  console.log('SCENE PROMPT');
  console.log(textResult);
  const chatUrl = "https://api.openai.com/v1/chat/completions";
  const response = await sender.post(chatUrl, {
    model: "gpt-3.5-turbo",
    //image gen is 1000 cap
    max_tokens: 500,
    messages: [
      {"role": "system", "content": "You illustrate scenery and places with text in detail. You talk about scenes as if you were describing them to someone who had never seen them. you always describe the scene in exactly one way"},
      {"role": "user", "content": textResult}
    ]
  });


  //TODO - get all of the messages compiled and map them to image/chat in a carosel
  //document.getElementById('story').textContent = response.data["choices"][0].message.content;
  return response.data["choices"][0].message.content;

}

async function promptForImage(input) {
  console.log('IMAGE PROMPT');
  console.log(input);
  if(input.split('').length > 1000) {
    console.info('max length exceeded, truncating');
    input = input.slice(0,998);
  }
  console.log("length is: " + input.length)
  const imageUrl = "https://api.openai.com/v1/images/generations";
  const response = await sender.post(imageUrl, {
    prompt: input, 
    size: '512x512',
    n: 1
  });

  return  response.data.data[0].url;
}

/**
 *
 * HTML ELEMENTS AND STUFF
 */

const storyBoard = document.getElementById('storyboard');
const button = document.getElementById('play');
const input = document.getElementById('prompt');
const loader = document.getElementById('loader');
loader.style.display = "none";

button.addEventListener('click', async () => {
  const text = input.value;
  if(text === '') return;
  if(index > 0) {
    let lastStep = document.getElementById(`response-${index-1}`);
    lastStep.textContent = `> ${text}`;

  }

  input.value = '';
  loader.style.display = "block";
  const textResult = await promptForStory(text);
  const scenaryResult = await promptForStoryScenary(textResult);
  const imgResult = await promptForImage(scenaryResult);
  loader.style.display = "none";

  generateStoryBoard(textResult,imgResult);
});


function generateStoryBoard(text, image){
  const div = document.createElement("div")
  div.id = `step-${index}`;
  div.className="story-part";
  storyBoard.appendChild(div);
  let content;
  if(index % 2 === 0){
  content = `
    <img id="illustration-${index}" width="512" height="512" src="${image}" class="story-img">
    <div id="text-${index}">
      <div id="story-${index}" class="story-text white">${text}</div>
      <div id="response-${index}" class="story-text orangered"></div>
    </div>
  `
  }
  else{
  content = `
    <div id="text-${index}">
      <div id="story-${index}" class="story-text white">${text}</div>
      <div id="response-${index}" class="story-text orangered"></div>
    </div>
    <img id="illustration-${index}" width="512" height="512" src="${image}" class="story-img">
  `
  }
  index += 1;
  // Update the placeholder
  if(index === 1) input.placeholder = "Enter your response..";
  div.innerHTML = content;
}

