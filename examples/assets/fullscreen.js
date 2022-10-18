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
			'true': _true,
			'false': _false
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
		journeyName:'test'
	},
	sequence: [
	]
};
// Modified below -- Let user set up trigger first
function onStartClicked() {
	// console.log("start clicked", parent)
	const dialogBox = document.createElement('dialog',{
		class: 'triggers-list'
	});
	const triggers = ['Subscribe to a list', 'Unsubscribe from a list', 'Place a purchase', 
	'Abandon checkout', 'Time trigger'];

	const dialogForm = document.createElement('form',{
		// class: 'triggers-list',
		method: 'dialog'
	});

	for (let i = 0; i < triggers.length; i++) {
		const btn1 = document.createElement('button');
		btn1.setAttribute("class", "triggers");
		btn1.setAttribute("type", "submit");
		btn1.setAttribute("name", "userChoice");
		btn1.setAttribute("value", i);
		btn1.innerText = triggers[i];
		btn1.addEventListener(
			'click',
			e => {
				e.preventDefault();
				startDefinition.sequence.push(createTaskStep('start-component', 'task', triggers[e.target.value]));
				console.log(startDefinition);
				document.getElementById("first-step").setAttribute("visibility","hidden");
				dialogBox.close();
				const placeholder = document.getElementById('designer');
				designer = sequentialWorkflowDesigner.create(placeholder, startDefinition, configuration);
				designer.onDefinitionChanged.subscribe((newDefinition) => {
					console.log('the definition has changed', newDefinition);
				});
			},
		);
		dialogForm.appendChild(btn1);
		btn1.insertAdjacentHTML("afterend", "</br>");
	}
	dialogBox.appendChild(dialogForm);
	const root = document.getElementById("first-step");
	root.appendChild(dialogBox);
	dialogBox.showModal();
}

const butt = document.getElementById('choice');
butt.addEventListener('click', e => {
	e.preventDefault();
	onStartClicked();
	document.getElementById("first-step").removeChild(butt);
},false);

