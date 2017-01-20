'use strict';

function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var qKey = -1;
if(!getParameterByName('q')){
    document.getElementById('question-text').innerHTML = 'Make friends by asking questions';
} else {
    qKey = parseInt(getParameterByName('q'));
    var question = window.IBQuestions[qKey];
    document.getElementById('question-text').innerHTML = question;
}

function changeText(direction)
{
    var newQKey = 0;
    if(direction === 'random'){
        newQKey = Math.floor((Math.random() * (IBQuestions.length-1)));
        if(newQKey >= qKey) newQKey++;
    }
    else if(direction === 'prev'){
        newQKey = (IBQuestions.length + qKey - 1) % IBQuestions.length;
    }
    else if(direction === 'next'){
        newQKey = (IBQuestions.length + qKey + 1) % IBQuestions.length;
    }

    var newUrl = '?q=' + newQKey;
    window.location = newUrl;
}

function makeHandler(direction){
    return function(){
        changeText(direction);
    }
}

document.querySelector('#random').addEventListener('click', makeHandler('random'));
document.querySelector('#prev').addEventListener('click', makeHandler('prev'));
document.querySelector('#next').addEventListener('click', makeHandler('next'));
