const express = require('express');
const app = express();
const port = 3000;

app.get('/',(req,res)=>res.send('Server Start'));

app.listen(port, ()=>console.log(`Server Start. Port : ${port}`))

const cheerio = require('cheerio');
const axios = require('axios');

const getHTML = async (keyword) => {
  try {
    return await axios.get("https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=" + encodeURI(keyword));
  } catch (err) {
    console.log(err);
  }
};

// parsing 성공 
const parsing = async (keyword) => {
  const html = await getHTML(keyword);
  const $ = cheerio.load(html.data);
  const $weather = $(".status_wrap");

  const temperature = $weather.find("._today .temperature_text strong:eq(0)").text();
  const weatherText = $weather.find(".summary .weather").text();
  
  const splitTemp = temperature.trim().split(" ");
  const tempReplace = String(splitTemp[1]).replace(/^온도/, "");

  console.log("온도: " + tempReplace);
  console.log("배경: " + weatherText);
}

setInterval(async () => {
  parsing(`날씨`);
}, 3000);