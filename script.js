//スクリーンロック防止
let wakeLock = null;

const requestWakeLock = async () => {
    try {
        wakeLock = await navigator.wakeLock.request('screen');

        wakeLock.addEventListener('release', () => {
            console.log('Wake Lock was released');
        });
        console.log('Wake Lock is active');
    }
    catch (err) {
        console.error("error");
  }
};


var ajaxBaseUrlOfNationalHolidays = "https://api.national-holidays.jp/";
var holidaysThisMonth = [];
const now = new Date();

async function getHolidaysInfo(){
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  var url = ajaxBaseUrlOfNationalHolidays + year + ('00'+ month).slice(-2);
  const res = await fetch(url);
  const result =　 await res.json();
  if(result["error"]) return [];

  return result;
}

async function isHoliday(date){
  if (holidaysThisMonth.length == 0) return false;
  return holidaysThisMonth.some(x => new Date(x.date).getDate()==date.getDate());
}

$(window).resize(function () {
  DrawPoint();
});

DrawPoint();

function DrawPoint(){
  for (let i = 0; i < 60; i++) {
    var num = ("00" + i).slice(-2);
    if(num%5==0){
      $('#container_clock').append(`<div class="line" id="line${num}"></div>`);
    }
    else{
      $('#container_clock').append(`<div class="line line_thin" id="line${num}"></div>`);
    }

    var item_num = 60;
    var deg = 360.0 / item_num;
    var radians = (deg * Math.PI) / 180.0;
    var radians90 = (90 * Math.PI) / 180.0;
    var circle_r = $("#container_clock").width() / 2 - 10;

    $(".line").each(function (i, elem) {
      var x = Math.cos(radians * i - radians90) * circle_r + circle_r + 10;
      var y = Math.sin(radians * i - radians90) * circle_r + circle_r + 2;
      $(elem).css("left", x);
      $(elem).css("top", y);
      $(elem).css("transform", `rotate(${deg*i}deg)`);
    });
  }
}

function getElements() {
  const time = new Date();
  const hour = time.getHours();
  const minute = time.getMinutes();
  const second = time.getSeconds();

  const degreeHour = hour / 12 * 360 + minute / 720 * 360;
  const degreeMin = minute / 60 * 360 + second / 3600 * 360;
  const degreeSec = second / 60 * 360;

  const clockHour = document.getElementsByClassName('clock-hour')[0];
  const clockMin = document.getElementsByClassName('clock-min')[0];
  const clockSec = document.getElementsByClassName('clock-sec')[0];

  clockHour.style.setProperty('transform', `rotate(${degreeHour}deg)`);
  clockMin.style.setProperty('transform', `rotate(${degreeMin}deg)`);
  clockSec.style.setProperty('transform', `rotate(${degreeSec}deg)`);
}

setInterval(getElements, 100);

// カレンダー
async function generateCalendar() {
    holidaysThisMonth = await getHolidaysInfo();
    requestWakeLock();

  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  let calendar = `<table>
                              <thead>
                                  <tr><th colspan="7" class="month">${year}年 ${monthNames[month]}</th></tr>
                                  <tr class="week">${dayNames.map(day => `<th>${day}</th>`).join('')}</tr>
                              </thead>
                              <tbody>`;

  let date = 1;
  for (let i = 0; i < 6; i++) {
    calendar += '<tr>';
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        calendar += '<td></td>';
      } else if (date > lastDate) {
        calendar += '<td></td>';
      } else {
        const classes = [];
        if (j===0) classes.push('holiday');
        if (j===6) classes.push('saturday');

        await isHoliday(new Date(`${year}/${month+1}/${date}`)).then(value => {
          if(value) classes.push('holiday');
        });

        if(date === today){
          classes.push('today')
          calendar += `<td class="td_today"><span class="${classes.join(' ')}">${date}</span></td>`;
        }
        else{
          calendar += `<td class="${classes.join(' ')}">${date}</td>`;
        }
        date++;
      }
    }
    calendar += '</tr>';
  }

  calendar += '</tbody></table>';
  document.getElementById('container_calendar').innerHTML = calendar;
}

generateCalendar();
