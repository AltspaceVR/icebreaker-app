'use strict';

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
