const state_1 = new Audio("sounds/state_1.mp3");
const state_2 = new Audio("sounds/state_2.mp3");
const state_3 = new Audio("sounds/state_3.mp3");
const state_4 = new Audio("sounds/state_4.mp3");
const state_5 = new Audio("sounds/state_5.mp3");
const unchangedValue = new Audio("sounds/unchangedValue.mp3");

document.getElementById("extractButton").addEventListener("click", () => {
  const inputValue = document.getElementById("textInput").value;
  // Fetch API를 사용하여 서버에 입력값 전송
  fetch("/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: inputValue }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data); // 서버로부터 받은 응답 데이터 출력
    })
    .catch((error) => {
      console.error(error);
    });
});

/**
 * 대답 출력 도움
 */
const stateClick = async () => {
  const state = document.getElementById("questinText").value;
  console.log(state);
  fetch("/state", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: state }), // 데이터 전송
  })
    .then((response) => {
      if (response.statusText !== "OK") throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      if (data.message === "OK") { // success
        const json = data; // 지역 변수에 상태 저장 이후 검사
        console.log(data);
        if (data.word.includes("state")) { // state_n
          switch (data.word) {
            case "state_1": changeState("출장"); break;
            case "state_2": changeState("재실"); break;
            case "state_3": changeState("교내"); break;
            case "state_4": changeState("회의"); break;
            case "state_5": changeState("퇴근"); break;
            default: console.log("client in state_err"); break;
          }
        //   console.log("Server response: data word");
        } else if (json.word === "date") {
          date();
        } else {
          console.log("Server response: Not OK");
        }
      } 
    })
    .catch((error) => {
      console.error(error);
    });
};

/** 
 * n년 n월 n일 n요일 n시 n분 n초 출력
 * @returns {{year: number, month:number, date:number, days: string, hour:number, minutes:number, seconds:number}} 
 */
const date = async () => {
  const today = new Date();
  const year = today.getFullYear(); // 년도
  const month = today.getMonth() + 1; // 월
  const date = today.getDate(); // 날짜
  const day = today.getDay(); // 요일
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  const hours = ('0' + today.getHours()).slice(-2); 
  const minutes = ('0' + today.getMinutes()).slice(-2);
  const seconds = ('0' + today.getSeconds()).slice(-2); 
  const timeResult = year + "." + month + "." + date + " " + days[day] + "요일 " + hours + ':' + minutes  + ':' + seconds;
  document.getElementById('timeInput').value = timeResult;
}

/**
 * 현재 상태와 변경할 상태를 비교
 * @param {string} state 변경할 상태의 값
 */
const changeState = async (state) => {
  const value = document.getElementById("resultInput").value;
  if (state === value) unchangedValue.play(); // 명령과 동일한 상태일경우
  else {
    switch (state) {
      case "출장":
        document.getElementById('resultInput').value = state;
        state_1.play(); break;
      case "재실":
        document.getElementById('resultInput').value = state;
        state_2.play(); break;
      case "교내":
        document.getElementById('resultInput').value = state;
        state_3.play(); break;
      case "회의":
        document.getElementById('resultInput').value = state;
        state_4.play(); break;
      case "퇴근":
        document.getElementById('resultInput').value = state;
        state_5.play(); break;
      default: console.log("state_err"); break;
    }
  }
};

const callWeather = () => {
  fetch("/imgState", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: "img" }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      console.log(data); // 서버로부터 받은 응답 데이터 출력
      const gclass = data.class;
      const weather = data.weather;
      const temp = data.temperature;
      document.getElementById('temperatureInput').value = temp;
      document.getElementById('weatherInput').value = weather;
      try {
        document.getElementById('weather').src = "svg/icon_flat_" + gclass + ".svg";
      } catch(err) {
        console.log(err);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};
/**
    폼 > PHP
    INPUT 보내기

    백엔드 (DB) 해야지

    웹 기능
 */