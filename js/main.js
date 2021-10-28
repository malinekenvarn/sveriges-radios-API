
"use strict";



//Variables

let numberOfChannels = 10; //the number of channels to be listed. Default is ten. Function changeNumrows() changes this value
let mainNavEl = document.getElementById("mainnavlist");
let numrowsEl = document.getElementById("numrows");
let playButtonEl = document.getElementById("playbutton");
let radioPlayerEl = document.getElementById("radioplayer");
let playChannelEl = document.getElementById("playchannel");

//Event listeners

numrowsEl.addEventListener('change', changeNumrows, false); //event listener to change the number of channels in list
playButtonEl.addEventListener('click', playLiveAudio, false); //by clicking, a radioplayer will play selected radio channel


//when page loads, the channel list will be fetched and displayed
window.onload = loadData;

function loadData() {

    fetch(`https://api.sr.se/api/v2/channels/?size=${numberOfChannels}&liveaudiotemplateid=2&audioquality=hi&format=json`) //fetch channels from the API
        .then((resp) => resp.json())  //parse to object
        .then((data) => {            // data is the object

            mainNavEl.innerHTML = ""; //clear the navigation menu when reload
            playChannelEl.innerHTML = ""; //clear the radio drop down list when reload

            //loop the array and create elements to list channels
            data.channels.forEach(item => {

                let logoEl = document.createElement("li");
                logoEl.title = item.tagline;
                logoEl.id = item.id; //add id so it can be used in function loadfront to accsess a specific channels program schedule
                let channelName = document.createTextNode(item.name);
                logoEl.appendChild(channelName);
                mainNavEl.appendChild(logoEl);

                //then add eventlistener to the channel logos
                logoEl.addEventListener('click', loadFront, false); //click and open schedule

                //uppdate drop down channel lists for the radio player function
                playChannelEl.innerHTML += `<option value=${item.liveaudio.url}>${item.name}</option>`;

            })

        })
        .catch((error) => {
            console.log(error)
        })
}




//function to load a channels program schedule, and only programs that hasn't been sent

function loadFront(evt) {

    let programInfo = document.getElementById("info");
    programInfo.innerHTML = ""; //this is to clear the previously shown schedule 

    //in the event one can access a programs id. The id is given as a parameter to the URL
    let scheduleStr = `http://api.sr.se/api/v2/scheduledepisodes?channelid=${evt.target.id}&size=100&format=json` //a big number is given to be sure all programs are listed. Default size is 10. I want all programs before midnight 

    fetch(scheduleStr)
        .then((resp) => resp.json())
        .then((data) => {

            data.schedule.forEach(item => {

                //timeutc return a JSON format string /Date()/ that has to be converted to JavaScript object
                let startTime = showTime(ToDateObj(item.starttimeutc));
                let endTime = showTime(ToDateObj(item.endtimeutc));


                //get current time
                let date = new Date();
                let currentTime = date.getTime(); //The getTime() method returns the number of milliseconds* since the Unix Epoch

                //the endtime of every program converted to format: number of milliseconds* since the Unix Epoch
                let compareTime = ToDateObj(item.endtimeutc).getTime();

                //this checks if a program has been broadcasted
                if (currentTime < compareTime) {

                    //check if there are a subtitle
                    let subtitle = "";
                    if (item.subtitle != undefined) {
                        subtitle = item.subtitle
                    }

                    //then display programs. Creates article elements and appends to the programInfo element
                    let newArticleEl = document.createElement("article");

                    newArticleEl.innerHTML = `  
                <h3>${item.title}</h3>
                <h4>${subtitle}</h4>
                <h5>${startTime} - ${endTime}</h5>
                <p> ${item.description}</p>
                `
                    programInfo.appendChild(newArticleEl);
                }

            })

        })
        .catch((error) => {
            console.log(error);
        })

}



//function to open radio player
function playLiveAudio() {
    //this creates the radioplayer element
    radioPlayerEl.innerHTML = `<audio controls="" autoplay=""><source src=${playChannelEl.value} type="audio/mpeg"></audio>`;
}


//function to transform the JSON /Date()/ format to a Date() object
function ToDateObj(JSONStr) {
    let dateObj = new Date(JSONStr.match(/\d+/)[0] * 1);
    return dateObj;
}


//function to display a string of time in format hours:minutes
function showTime(date) {

    let hours = date.getHours();
    if (hours < 10) hours = "0" + hours;

    let minutes = date.getMinutes();
    if (minutes < 10) minutes = "0" + minutes;

    return hours + ":" + minutes;
}


//uppdates the number of channels listed in the nav
function changeNumrows() {
    numberOfChannels = document.getElementById("numrows").value; //the input number
    loadData(); //reload list
}


