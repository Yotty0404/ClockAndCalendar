//スクリーンロック防止
const wakeLockSwitch = document.querySelector('#wake-lock');

let wakeLock = null;

$('#btn_wake_lock').on('click', function () {
    requestWakeLock();
    $("#container").css("display", "flex");
    $("#container_btn").hide();
});

const requestWakeLock = async () => {
    try {
        wakeLock = await navigator.wakeLock.request('screen');

        wakeLock.addEventListener('release', () => {
            console.log('Wake Lock was released');
        });
        console.log('Wake Lock is active');
    }
    catch (err) {
        console.error(`$\{err.name\}, $\{err.message\}`);
    }
};

if (document.hidden !== undefined) {
    document.addEventListener('visibilitychange', onVisibilityChange);
} else if (document.webkitHidden !== undefined) {
    document.addEventListener('webkitvisibilitychange', onWebkitVisibilityChange);
}
function onVisibilityChange() {
    if (!document.hidden) {
        //ブラウザに戻ってきた際に行いたい処理
        requestWakeLock();
    }
}

function onWebkitVisibilityChange() {
    if (!document.webkitHidden) {
        //ブラウザに戻ってきた際に行いたい処理
        requestWakeLock();
    }
}



var ajaxBaseUrlOfNationalHolidays = "https://api.national-holidays.jp/";
var holidaysThisMonth = [];
let now = new Date();

async function getHolidaysInfo() {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    var url = ajaxBaseUrlOfNationalHolidays + year + ('00' + month).slice(-2);
    const res = await fetch(url);
    const result = await res.json();
    if (result["error"]) return [];

    return result;
}

async function isHoliday(date) {
    if (holidaysThisMonth.length == 0) return false;
    return holidaysThisMonth.some(x => new Date(x.date).getDate() == date.getDate());
}

$(window).resize(function () {
    DrawPoint();
});

DrawPoint();

function DrawPoint() {
    // 既存の目盛り要素を削除して重複を防ぐ
    $('#container_clock').find('.line, .line_thin').remove();

    const item_num = 60;
    const deg = 360.0 / item_num;
    const radians = (deg * Math.PI) / 180.0;
    const radians90 = (90 * Math.PI) / 180.0;

    // padding を含む内側幅・高さで中心を計算する（padding があると左右がずれるため）
    const innerW = $("#container_clock").innerWidth();
    const innerH = $("#container_clock").innerHeight();
    const circle_r = Math.min(innerW, innerH) / 2 - 10;
    const centerX = innerW / 2;
    const centerY = innerH / 2;

    for (let i = 0; i < item_num; i++) {
        const num = ("00" + i).slice(-2);
        if (i % 5 == 0) {
            $('#container_clock').append(`<div class="line" id="line${num}"></div>`);
        }
        else {
            $('#container_clock').append(`<div class="line line_thin" id="line${num}"></div>`);
        }

        const x = Math.cos(radians * i - radians90) * circle_r + centerX;
        const y = Math.sin(radians * i - radians90) * circle_r + centerY;
        const $elem = $(`#line${num}`);
        $elem.css("left", `${x}px`);
        $elem.css("top", `${y}px`);
        // 目盛りの中心が指定位置になるように translate(-50%,-50%) を付与
        $elem.css("transform", `translate(-50%,-50%) rotate(${deg * i}deg)`);
    }
}

function getElements() {
    // const time = new Date();
    let time = new Date(2021, 1, 11,12,0,0);
    const hour = time.getHours();
    const minute = time.getMinutes();
    const second = time.getSeconds();

    const degreeHour = hour / 12 * 360 + minute / 720 * 360;
    const degreeMin = minute / 60 * 360 + second / 3600 * 360;
    const degreeSec = second / 60 * 360;

    const clockHour = document.getElementsByClassName('clock-hour')[0];
    const clockMin = document.getElementsByClassName('clock-min')[0];
    const clockSec = document.getElementsByClassName('clock-sec')[0];

    // 針の root 側で translateX(-50%) を使用しているので、ここでも必ず同じ translate を維持して回転のみ差し替える
    clockHour.style.setProperty('transform', `translateX(-50%) rotate(${degreeHour}deg)`);
    clockMin.style.setProperty('transform', `translateX(-50%) rotate(${degreeMin}deg)`);
    clockSec.style.setProperty('transform', `translateX(-50%) rotate(${degreeSec}deg)`);
}

setInterval(getElements, 100);

function CreateDayNames(dayNames) {
    return dayNames.map(day => {
        if (day === '日') {
            return `<th class="holiday">${day}</th>`;
        }
        else if (day === '土') {
            return `<th class="saturday">${day}</th>`;
        }
        else {
            return `<th>${day}</th>`;
        }
    }).join('');
}

// カレンダー
async function generateCalendar() {
    holidaysThisMonth = await getHolidaysInfo();

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
                                  <tr class="week">${CreateDayNames(dayNames)}</tr>
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
                if (j === 0) classes.push('holiday');
                if (j === 6) classes.push('saturday');

                await isHoliday(new Date(`${year}/${month + 1}/${date}`)).then(value => {
                    if (value) classes.push('holiday');
                });

                if (date === today) {
                    classes.push('today')
                    calendar += `<td class="td_today"><span class="${classes.join(' ')}">${date}</span></td>`;
                }
                else {
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

function updateToday() {
    var newDate = (new Date()).getDate();
    if (now.getDate() == newDate) return;

    $('.td_today').removeClass('td_today');
    $('.today').removeClass('today');

    var today = $(`td:contains(${newDate})`).filter(function () {
        return $(this).text() == newDate;
    });
    today.addClass('td_today');
    today.text('');
    today.append(`<span class="today">${newDate}</span>`)
}

setInterval(updateToday, 100);
