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

// Create steps
function createStep(currElement) {
	let step;
	if (currElement.componentType == 'task') {
		step = createTaskStep(currElement.id, currElement.type, currElement.name);
		// Adding more properties
		step.createdAt = currElement.createdAt;
		step.createdBy = currElement.createdBy;
		step.updatedAt = currElement.updatedAt;
		step.updatedBy = currElement.updatedBy;
		console.log(currElement.properties);
		step.properties = currElement.properties;
		// step.properties.Run = currElement.properties.Run;
	} else {
		console.log("Creating an if/else block", currElement);
		const True = currElement.branches.True;
		const False = currElement.branches.False;
		let trueBranch = [];
		let falseBranch = [];
		for (let j = 0; j < True.length; j++){
			step = createStep(True[j]);
			trueBranch.push(step);
		}
		for (let j = 0; j < False.length; j++){
			step = createStep(False[j]);
			falseBranch.push(step);
		}
		step = createIfStep(currElement.id, trueBranch, falseBranch);
		// Adding more properties
		step.createdAt = currElement.createdAt;
		step.createdBy = currElement.createdBy;
		step.updatedAt = currElement.updatedAt;
		step.updatedBy = currElement.updatedBy;
		step.properties = currElement.properties;
		// step.properties.Run = currElement.properties.Run;
	}
		
	return step;
}

// Return start definition
function loadDefinition(input) {
	let sequence = [];
	
	if (!(input.sequence === undefined)) {
		const l = input.sequence.length;
		for (let i = 0; i < l; i++) {
			sequence.push(createStep(input.sequence[i]));
		}
	}
	return {
		properties: {
			journeyName:input.properties.journeyName,
			createdAt: new Date(input.properties.createdAt),
			createdBy: input.properties.createdBy,
			updatedAt: new Date(input.properties.updatedAt),
			updatedBy: input.properties.updatedBy,
			description:input.properties.description,
			journeyId: input.properties.journeyId
		},
		sequence
	};
}

function createDesinger(startDefinition){
	const placeholder = document.getElementById('designer');
	designer = sequentialWorkflowDesigner.create(placeholder, startDefinition, configuration);
	drawButtons();
	setTimeout(saver,timeout); 			// Auto saving starts
	designer.onDefinitionChanged.subscribe((newDefinition) => {
		clearTimeout(timeoutID);
		console.log('the definition has changed', newDefinition);
		designer.context.definition.properties.updatedAt = new Date();
		console.log("Save journey when definition changes");
		setTimeout(saver,0); 
	});
}


function drawButtons(){
	const canvas = document.getElementsByClassName('sqd-designer')[0];
	const dropDiv = document.createElement('div');
	dropDiv.setAttribute('class', 'dropdown-div');
	const dropBtn = document.createElement('button');
	dropBtn.setAttribute('class','dropdown-btn');
	dropBtn.innerText = 'Draft		';
	const icon = document.createElement('i');
	icon.setAttribute('class', 'fa fa-angle-down');
	dropBtn.appendChild(icon);
	dropDiv.appendChild(dropBtn);
	const dropContent = document.createElement('div');
	dropContent.setAttribute('class', 'dropdown-content-div sqd-hidden');
	dropContent.setAttribute('id', 'dropdown-content');
	dropBtn.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		dropContent.classList.remove("sqd-hidden");
	});
	const butt1 = document.createElement('button');
	butt1.setAttribute('class','dropdown-btn');
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

	butt1.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		dropContent.classList.add("sqd-hidden");
		document.getElementsByClassName('dropdown-btn')[0].appendChild(icon);
		const target = JSON.stringify(designer.context.definition);
		console.log("Auto save canceled");
		window.clearTimeout(timeoutID);	
		makeReq("POST", "http://localhost:8080/journey/saveJourney", target, 200);
	});

	butt2.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		dropContent.classList.add("sqd-hidden");
		document.getElementsByClassName('dropdown-btn')[0].appendChild(icon);
		const target = JSON.stringify(designer.context.definition);
		console.log("Auto save canceled");
		window.clearTimeout(timeoutID);	
		makeReq("POST", "http://localhost:8080/journey/activateJourney", target, 200);
	});

	window.onclick = function(e) {
		if (!e.target.matches('.dropdown-btn')) {
		  if (!dropContent.classList.contains('sqd-hidden')) {
			dropContent.classList.add('sqd-hidden');
		  }
		}
	}
}

//Button event listener
function onActivateClicked() {
	dropContent.classList.add("sqd-hidden");
	// dropBtn.innerText = 'Activate Journey ';
	// dropBtn.appendChild(icon);
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

	httpRequest.onreadystatechange = makeHandler(httpRequest, returnCode, method);

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
function makeHandler(httpRequest, returnCode, method) {
	function handler() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === returnCode) {
				console.log("succeed");
				// console.log("recieved response text:  " + httpRequest.responseText);
				if (method == "GET") {
					startDefinition = loadDefinition(JSON.parse(httpRequest.responseText));
					createDesinger(startDefinition);
				}
			} else {
				console.log("Failed", httpRequest.responseText)
				// alert("There was a problem with the request. Please refresh the page!");
			}
		}
	}
	return handler;
}

let timeoutID;
let timeout = 5 * 60 * 1000;
let startDefinition;
let journeyID;
var url = window.location.pathname;
const userID = url.slice(1);

console.log(userID)

console.log("create empty canvas")
const input = {
	properties: {
		journeyName:'test',
		createdAt: new Date(),
		createdBy: userID,
		updatedAt: new Date(),
		updatedBy: userID,
		description:" ",
		journeyId: ""
	},
	sequence: [
	]
};
createDesinger(input);

// Auto Save
function saver(){
	console.log("saving...", Date());
	const target = JSON.stringify(designer.context.definition);
	makeReq('POST', "http://localhost:8080/journey/saveJourney", target, 200);
	timeoutID = setTimeout(saver, timeout)
}
// Save journey when user leaves the page
document.addEventListener('visibilitychange', function () {
	if (document.visibilityState == 'hidden') {
		// Cancel auto save
		clearTimeout(timeoutID);
		console.log("saving from leaving the page", Date());
		const target = JSON.stringify(designer.context.definition);
		makeReq('POST', "http://localhost:8080/journey/saveJourney", target, 200);
	} 
	if (document.visibilityState == 'visible') {
		// Auto save back on
		setTimeout(saver, timeout);
		console.log("Auto save is on when back to the page");
	}
});