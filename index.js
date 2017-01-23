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

var qKey = null;

AFRAME.registerComponent('display-question', {
    init: function(){
        qKey = getParameterByName('q');
        if(qKey === null){
            this.el.setAttribute('n-text', 'text', 'Make friends by asking questions');
        }
        else {
            this.el.setAttribute('n-text', 'text', IBQuestions[qKey]);
        }
    }
});

AFRAME.registerComponent('advance-question', {
    schema: {type: 'string'},
    init: function()
    {
        var direction = this.data;
        
        this.el.object3D.addEventListener('cursorup', function()
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
        });
    }
});
