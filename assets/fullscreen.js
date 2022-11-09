/* global document, sequentialWorkflowDesigner, console */
function createTaskStep(id, type, name) {
	return {
		id,
		componentType: 'task',
		type,
		name,
		properties: {}
	};
}

function createIfStep(id, _true, _false) {
	return {
		id,
		componentType: 'switch',
		type: 'if',
		name: 'If/Else',
		branches: {
			'True': _true,
			'False': _false
		},
		properties: {}
	};
}

function toolboxGroup(name) {
	// if (name == 'Trigger') {
	// 	return {
	// 		name,
	// 		steps: [
	// 			createTaskStep(null, 'text', 'Subscribe'),
	// 			createTaskStep(null, 'text', 'Unsubscribe'),
	// 			createTaskStep(null, 'task', 'Abandon'),
	// 			createTaskStep(null, 'task', 'Purchase'),
	// 			createTaskStep(null, 'task', 'Time Trigger')
	// 		]
	// 	};
	// } else 
	if (name == 'Filter') {
		return {
			name,
			steps: [
				createIfStep(null, [], [])
			]
		};
	} else {
		return {
			name,
			steps: [
				createTaskStep(null, 'text', 'Send Email'),
				createTaskStep(null, 'task', 'Time Delay'),
				createTaskStep(null, 'save', 'Add Tag'),
				createTaskStep(null, 'save', 'Remove Tag')
			]
		};
	}
	
}

let designer;
const configuration = {
	toolbox: {
		isHidden: false,
		groups: [
			// toolboxGroup('Trigger'),
			toolboxGroup('Filter'),
			toolboxGroup('Action')
		]
	},

	steps: {
		iconUrlProvider: (componentType, type) => {
			return `./assets/icon-${type}.svg`
		},

		validator: (step) => {
			return !step.properties['isInvalid'];
		},
	},

	editors: {
		isHidden: false,
		globalEditorProvider: (definition) => {
			const root = document.createElement('div');
			root.innerHTML = '<textarea style="width: 100%; border: 0;" rows="50"></textarea>';
			const textarea = root.getElementsByTagName('textarea')[0];
			textarea.value = JSON.stringify(definition, null, 2);
			return root;
		},

		stepEditorProvider: (step, editorContext) => {
			const root = document.createElement('div');
			root.innerHTML = '<h5></h5> <p>is invalid: <input type="checkbox" /></p>';
			const title = root.getElementsByTagName('h5')[0];
			title.innerText = step.name;
			const input = root.getElementsByTagName('input')[0];
			input.checked = !!step.properties['isInvalid'];
			input.addEventListener('click', () => {
				step.properties['isInvalid'] = !!input.checked;
				editorContext.notifyPropertiesChanged();
			});
			return root;
		}
	}
};

// start from canvas with only start and end points
const startDefinition = {
	properties: {
		journeyName:'test',
		createdAt: new Date(),
		createdBy: "userID",
		updatedAt: new Date(),
		updatedBy: "userID",
		description:" "
	},
	sequence: [
		// createIfStep('00000000000000000000000000000001',
		// 	[ createTaskStep('00000000000000000000000000000002', 'save', 'Save file') ],
		// 	[ createTaskStep('00000000000000000000000000000003', 'text', 'Send email') ]
		// )
	]
};

const placeholder = document.getElementById('designer');
designer = sequentialWorkflowDesigner.create(placeholder, startDefinition, configuration);
designer.onDefinitionChanged.subscribe((newDefinition) => {
	console.log('the definition has changed', newDefinition);
});

// A drop down button on canvas
const canvas = document.getElementsByClassName('sqd-designer')[0];
const dropDiv = document.createElement('div');
dropDiv.setAttribute('class', 'dropdown-div');
const dropBtn = document.createElement('button');
dropBtn.setAttribute('class','dropdown-btn');
dropBtn.innerText = 'Draft		';
const icon = document.createElement('i');
icon.setAttribute('class', 'fa fa-angle-down');
dropBtn.appendChild(icon);
dropBtn.setAttribute('onClick','toggleContent()');
dropDiv.appendChild(dropBtn);

// Save journey to backend
const dropContent = document.createElement('div');
dropContent.setAttribute('class', 'dropdown-content-div sqd-hidden');
dropContent.setAttribute('id', 'dropdown-content');
const butt1 = document.createElement('button');
butt1.setAttribute('class','dropdown-btn');
butt1.setAttribute('onClick','onSaveClicked()');
butt1.innerText = 'Save Journey';
dropContent.appendChild(butt1);
butt1.insertAdjacentHTML("afterend", "</br>");
// Activate journey
const butt2 = document.createElement('button');
butt2.setAttribute('class','dropdown-btn');
butt2.setAttribute('onClick','onActivateClicked()');
butt2.innerText = 'Activate Journey';
dropContent.appendChild(butt2);
dropDiv.appendChild(dropContent);

canvas.appendChild(dropDiv);

// Toggle drop down content
function toggleContent(){
	dropContent.classList.remove("sqd-hidden");
}
window.onclick = function(e) {
	if (!e.target.matches('.dropdown-btn')) {
	  if (!dropContent.classList.contains('sqd-hidden')) {
		dropContent.classList.add('sqd-hidden');
	  }
	}
}

// Button event listener
function onSaveClicked() {
	dropContent.classList.add("sqd-hidden");
	dropBtn.innerText = 'Save Journey ';
	dropBtn.appendChild(icon);
	document.getElementsByClassName('dropdown-btn')[0].appendChild(icon);
	// document.getElementsByClassName('dropdown-btn')[1].innerText = 'Draft		';
	const target = document.getElementsByClassName('sqd-global-editor')[0].children[0].children[0];
	console.log("save", target.value);
	makeReq("POST", "http://localhost:8080/journey/saveJourney", target.value, 200);
}
function onActivateClicked() {
	dropContent.classList.add("sqd-hidden");
	dropBtn.innerText = 'Activate Journey ';
	dropBtn.appendChild(icon);
	// document.getElementsByClassName('dropdown-btn')[2].innerText = 'Draft		';
	const target = document.getElementsByClassName('sqd-global-editor')[0].children[0].children[0];
	console.log("activate",target.value);
	makeReq("POST", "http://localhost:8080/journey/activateJourney", target.value, 200);
}

// Make a request
function makeReq(method, target, data, returnCode) {
	var httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		alert('Cannot create an XMLHttpRequest');
		return false;
	}

	httpRequest.onreadystatechange = makeHandler(httpRequest, returnCode);

	httpRequest.open(method, target);
	
	if (data){
		// console.log(data);
		httpRequest.setRequestHeader('Content-Type', 'application/json');
		httpRequest.send(data);
	}
	else {
		httpRequest.send();
	}
}

// Handle request response
function makeHandler(httpRequest, returnCode) {
	function handler() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === returnCode) {
				console.log("recieved response text:  " + httpRequest.responseText);
			} else {
				console.log(httpRequest.responseText)
				alert("There was a problem with the request. Please refresh the page!");
			}
		}
	}
	return handler;
}
