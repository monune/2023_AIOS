// netstat -ano | findstr :3000
// taskkill /PID <PID> /F

const express = require("express");
const cheerio = require('cheerio');
const axios = require('axios');
const bodyParser = require("body-parser");

const app = express();
const fs = require("fs");
const textToSpeech = require("@google-cloud/text-to-speech");
const projectId = "plated-valor-393815";
const client = new textToSpeech.TextToSpeechClient({ projectId });

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// public 폴더를 정적 파일로 서빙
const path = require("path");
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// 루트 경로 처리
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

/**
 * @param {string} keyword 검색할 키워드 선택
 */
const getHTML = async (keyword) => {
  try {
    return await axios.get("https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=" + encodeURI(keyword));
  } catch (err) {
    console.log(err);
  }
};

/**
 * @param {string} keyword 검색 키워드 (날씨)
 * @returns {{temperature: temperature, weather: weatherState}} 검색 날씨의 온도와 날씨 상태
 */
const parsing = async (keyword) => {
  const html = await getHTML(keyword);
  const $ = cheerio.load(html.data);
  const $weather = $(".status_wrap"); // 시작

  const temp = $weather.find("._today .temperature_text strong:eq(0)").text();
  const weather = $weather.find(".summary .weather").text();
  const img = $weather.find("._today .weather_graphic .weather_main i").attr('class');

  const splitTemp = temp.trim().split(" ");
  const temperature = String(splitTemp[1]).replace(/^온도/, "");
  const textArray = img.split(" ");

  console.log("이미지 클래스 명: " + textArray[1]);
  console.log("온도: " + temperature);
  console.log("배경: " + weather);
}

/**
 * 입력된 단어를 문장으로 변경하는 함수
 * @param {string} word 음성으로 변경할 단어
 */
const tts = async (word) => {
  const text = word;
  const outputPath = path.join(__dirname, "public/sounds", word + ".mp3"); // 파일 경로 설정
  const request = {
    input: { text: text },
    voice: {
      languageCode: "ko_KR",
      ssmlGender: "FEMALE",
      name: "ko-KR-Wavenet-A",
    },
    audioConfig: { audioEncoding: "MP3" },
  };
  client.synthesizeSpeech(request, (err, response) => {
    fs.writeFile(outputPath, response.audioContent, "binary", (err) => {});
  });
  console.log(word);
};

/**
 * 상태 설명 함수
 * @param {string} word 사용할 상태 입력
 * @returns {string} 반환할 함수 호출
 */
const state = async (word) => {
  if (word.includes("날씨")) return await saveTTS("weather"); // 크롤링
  else if (word.includes("날짜")) return await saveTTS("date"); // 현재 시간 반환
  else if (word.includes("시간")) return await saveTTS("time");
  else if (word.includes("변경")) {
    const keywords = ["출장", "재실", "교내", "회의", "퇴근"];
    const stateValues = [1, 2, 3, 4, 5];
    const index = keywords.findIndex(keyword => word.includes(keyword)); // 검사
    return await saveTTS("state", index !== -1 ? stateValues[index] : 0);
  }
};

/**
 * keyword에 따라서 사용하는 음성 호출
 * @param {string} keyword 상태 키워드
 * @param {number} state 상태
 * @returns {string} 반환된 상태 키워드
 * */
const saveTTS = async (keyword, state) => {
  if (keyword === "weather") {
    return "weather";
  } else if (keyword === "date") {
    return "date";
  } else if (keyword === "state") {
    switch (state) {
      case 1: return "state_1";
      case 2: return "state_2";
      case 3: return "state_3";
      case 4: return "state_4";
      case 5: return "state_5";
      default: return ("state_err");
    }
  } else console.log("server at state_err");
};

/** tts 호출 함수 */

/**
 * weather includes 간단한 단어 구분 함수, 
 * 사용할 거면 조건을 추가
 * @param word 변경해 return 할 키워드
 */

// 클라이언트에서 tts 호출
app.post("/tts", async (req, res) => {
  const { text } = req.body;
  try {
    tts(text); // 'tts' 함수 호출
    res.status(200).json({ message: "OK", text: text });
  } catch (error) {
    res.status(500).json({ error: "TTS 변환 오류 발생" });
  }
});

// 클라이언트 에서 State 호출
app.post("/state", async (req, res) => {
  const { text } = req.body;
  try {
    let result = await state(text);
    res.status(200).json({ message: "OK", word: result });
  } catch (error) {
    res.status(500).json({ error: "Json 전달 오류 발생" });
  }
});

const timeInterval = 1000 * 30; // 30 sec
setInterval(() => {
  parsing('날씨');
}, timeInterval);

app.listen(3000, () => {
  console.log("3000 포트 서버 시작됨!");
});
