//Function referenced from https://www.w3schools.com/js/tryit.asp?filename=tryjs_timing_clock

function startTime() {
    let today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);

    let weekday = new Array(7);
    weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let day = weekday[today.getDay()];

    let months = new Array(7);
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let month = months[today.getMonth()];

    let date = today.getDate();
    let year = today.getFullYear();

    document.getElementById("time").innerHTML =
        day + ', ' + month + ' ' + date + ', ' + year + '<br>Local Time: ' + h + ':' + m + ':' + s;

    let t = setTimeout(startTime, 500);
}
function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}

$(document).ready(function () {

    startTime();

})
