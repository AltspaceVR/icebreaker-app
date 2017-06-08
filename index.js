'use strict';

var currentEventPortals = {};
var MAX_EVENTS = 7;
var X_CENTER = -10;
var Y_CENTER = 11;
var RADIUS = 4;

function pollEvents() {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', "https://account.altvr.com/api/home/my_experiences");
    xhr.withCredentials = true;
    xhr.onreadystatechange = function(e) {
        if (this.readyState === XMLHttpRequest.DONE) {
            var response = JSON.parse(this.response);
            var sids = response.items.map(function(el) { return el.item.space.space_sid; });
            var currentSids = Object.keys(currentEventPortals);

            for (var sid of currentSids) {
                if (sids.includes(sid)) continue;

                var app = document.getElementById("app");
                app.removeChild(currentEventPortals[sid]);
                delete currentEventPortals[sid];
            }

            for (var i = 0; i < MAX_EVENTS; i++) {
                if (!sids[i]) break;

                var result = calculatePortalPositionAndRotation(i);
                var position = result[0];
                var rotation = result[1];

                var existingPortal = currentEventPortals[sids[i]];
                if (existingPortal) {
                    existingPortal.setAttribute("position", position);
                    existingPortal.setAttribute("rotation", rotation);
                    continue;
                }

                var newPortal = document.createElement("a-entity");
                newPortal.setAttribute("n-portal", "targetSpace: " + sids[i]);
                newPortal.setAttribute("position", position);
                newPortal.setAttribute("rotation", rotation);

                var eventTitle = document.createElement("a-entity");
                eventTitle.setAttribute("n-text", "text: " + response.items[i].item.name + "; fontSize: 2; width: 2;");
                eventTitle.setAttribute("position", "0 0.3 0");
                newPortal.appendChild(eventTitle);

                document.getElementById("app").appendChild(newPortal);
            }
        }
    };
    xhr.send();

    window.setTimeout(pollEvents, 5 * 60 * 1000);
}

// Center of circle is located at (-10, 0.5, 11), and the radius of it is 4 units.
// Event portals are laid out from "right" to "left".
function calculatePortalPositionAndRotation(i) {
    var theta = i * 30;
    var angle = (theta + 90) * (Math.PI / 180); // Adding 90 degrees here because we want to start laying out portals on the +y axis.
    var xPos = RADIUS * Math.cos(angle) + X_CENTER;
    var yPos = Y_CENTER - RADIUS * Math.sin(angle);

    var position = xPos + " 0.5 " + yPos;
    var rotation = "0 " + (theta + 15) + " 0";
    return [position, rotation];
}

document.addEventListener("DOMContentLoaded", pollEvents);

AFRAME.registerComponent('display-question', {
    schema: {type: 'int'},
    update: function(){
        if( this.data >= 0 && this.data < IBQuestions.length ){
            this.el.setAttribute('n-text', 'text', IBQuestions[this.data]);
            if(IBQuestions[this.data].length < 90)
                this.el.setAttribute('n-text', 'fontSize', 3);
            else
                this.el.setAttribute('n-text', 'fontSize', 2);
        }
        else {
            this.el.setAttribute('n-text', 'text', 'Make friends by asking questions');
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
            var display = document.querySelector('#qText')
            var qKey = parseInt(display.getAttribute('display-question'));
            var newQKey = 0;
            if(direction === 'random'){
                // choose a random item that is not the current one
                newQKey = Math.floor((Math.random() * (IBQuestions.length-1)));
                if(newQKey >= qKey) newQKey++;
            }
            else if(direction === 'prev'){
                newQKey = (IBQuestions.length + qKey - 1) % IBQuestions.length;
            }
            else if(direction === 'next'){
                newQKey = (IBQuestions.length + qKey + 1) % IBQuestions.length;
            }

            var syncRef = document.querySelector('#qText').components.sync;
            syncRef.takeOwnership();
            display.setAttribute('display-question', newQKey);
        });
    }
});

AFRAME.registerComponent('sync-question',
{
	dependencies: ['sync'],
	init: function () {
		var component = this;
		var sync = component.el.components.sync;
		if(sync.isConnected) start(); else component.el.addEventListener('connected', start);

		function start(){
			var questionRef = sync.dataRef.child('question');

			var refChangedLocked = false;

			var firstValue = true;

			component.el.addEventListener('componentchanged', function (event) {
				var name = event.detail.name;
				var oldData = event.detail.oldData;
				var newData = event.detail.newData;

				if (name !== 'display-question') return;
				if (refChangedLocked) return;

				if (oldData !== newData) {
					if(sync.isMine){
						questionRef.set(newData);
					}
				}
			});

			questionRef.on('value', function (snapshot) {
				if (sync.isMine && !firstValue) return;
				var question = snapshot.val();

				refChangedLocked = true;
				component.el.setAttribute('display-question', question);
				refChangedLocked = false;

				firstValue = false;
			});
		}
	}
});
