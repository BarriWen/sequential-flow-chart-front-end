(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.sequentialWorkflowDesigner = factory());
})(this, (function () { 'use strict';

	class Vector {
	    constructor(x, y) {
	        this.x = x;
	        this.y = y;
	    }
	    add(v) {
	        return new Vector(this.x + v.x, this.y + v.y);
	    }
	    subtract(v) {
	        return new Vector(this.x - v.x, this.y - v.y);
	    }
	    multiplyByScalar(s) {
	        return new Vector(this.x * s, this.y * s);
	    }
	    divideByScalar(s) {
	        return new Vector(this.x / s, this.y / s);
	    }
	    round() {
	        return new Vector(Math.round(this.x), Math.round(this.y));
	    }
	    distance() {
	        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	    }
	}

	function readMousePosition(e) {
	    return new Vector(e.clientX, e.clientY);
	}
	function readTouchPosition(e) {
	    if (e.touches.length > 0) {
	        const touch = e.touches[0];
	        return new Vector(touch.clientX, touch.clientY);
	    }
	    throw new Error('Unknown touch position');
	}

	class BehaviorController {
	    constructor() {
	        this.onMouseMoveHandler = (e) => this.onMouseMove(e);
	        this.onMouseUpHandler = (e) => this.onMouseUp(e);
	        this.onTouchMoveHandler = (e) => this.onTouchMove(e);
	        this.onTouchEndHandler = (e) => this.onTouchEnd(e);
	        this.onTouchStartHandler = (e) => this.onTouchStart(e);
	    }
	    start(startPosition, behavior) {
	        if (this.state) {
	            this.stop(true);
	            return;
	        }
	        this.state = {
	            startPosition,
	            behavior
	        };
	        behavior.onStart(this.state.startPosition);
	        window.addEventListener('mousemove', this.onMouseMoveHandler, false);
	        window.addEventListener('touchmove', this.onTouchMoveHandler, false);
	        window.addEventListener('mouseup', this.onMouseUpHandler, false);
	        window.addEventListener('touchend', this.onTouchEndHandler, false);
	        window.addEventListener('touchstart', this.onTouchStartHandler, false);
	    }
	    onMouseMove(e) {
	        e.preventDefault();
	        this.move(readMousePosition(e));
	    }
	    onTouchMove(e) {
	        e.preventDefault();
	        this.move(readTouchPosition(e));
	    }
	    onMouseUp(e) {
	        e.preventDefault();
	        this.stop(false);
	    }
	    onTouchEnd(e) {
	        e.preventDefault();
	        this.stop(false);
	    }
	    onTouchStart(e) {
	        e.preventDefault();
	        if (e.touches.length !== 1) {
	            this.stop(true);
	        }
	    }
	    move(position) {
	        if (!this.state) {
	            throw new Error('State is empty');
	        }
	        const delta = this.state.startPosition.subtract(position);
	        const newBehavior = this.state.behavior.onMove(delta);
	        if (newBehavior) {
	            this.state.behavior.onEnd(true);
	            this.state.behavior = newBehavior;
	            this.state.startPosition = position;
	            this.state.behavior.onStart(this.state.startPosition);
	        }
	    }
	    stop(interrupt) {
	        if (!this.state) {
	            throw new Error('State is empty');
	        }
	        window.removeEventListener('mousemove', this.onMouseMoveHandler, false);
	        window.removeEventListener('touchmove', this.onTouchMoveHandler, false);
	        window.removeEventListener('mouseup', this.onMouseUpHandler, false);
	        window.removeEventListener('touchend', this.onTouchEndHandler, false);
	        window.removeEventListener('touchstart', this.onTouchEndHandler, false);
	        this.state.behavior.onEnd(interrupt);
	        this.state = undefined;
	    }
	}

	class ObjectCloner {
	    static deepClone(instance) {
	        if (typeof window.structuredClone !== 'undefined') {
	            return window.structuredClone(instance);
	        }
	        return JSON.parse(JSON.stringify(instance));
	    }
	}

	class SimpleEvent {
	    constructor() {
	        this.listeners = [];
	    }
	    subscribe(listener) {
	        this.listeners.push(listener);
	    }
	    unsubscribe(listener) {
	        const index = this.listeners.indexOf(listener);
	        if (index >= 0) {
	            this.listeners.splice(index, 1);
	        }
	        else {
	            throw new Error('Unknown listener');
	        }
	    }
	    forward(value) {
	        if (this.listeners.length > 0) {
	            this.listeners.forEach(listener => listener(value));
	        }
	    }
	    count() {
	        return this.listeners.length;
	    }
	}

	function animate(interval, handler) {
	    const iv = setInterval(tick, 15);
	    const startTime = Date.now();
	    const anim = {
	        isAlive: true,
	        stop: () => {
	            anim.isAlive = false;
	            clearInterval(iv);
	        }
	    };
	    function tick() {
	        const progress = Math.min((Date.now() - startTime) / interval, 1);
	        handler(progress);
	        if (progress === 1) {
	            anim.stop();
	        }
	    }
	    return anim;
	}

	class SequenceModifier {
	    static moveStep(sourceSequence, step, targetSequence, targetIndex) {
	        const sourceIndex = sourceSequence.indexOf(step);
	        if (sourceIndex < 0) {
	            throw new Error("Unknown step");
	        }
	        const isSameSequence = sourceSequence === targetSequence;
	        if (isSameSequence && sourceIndex === targetIndex) {
	            return; // Nothing to do.
	        }
	        sourceSequence.splice(sourceIndex, 1);
	        if (isSameSequence && sourceIndex < targetIndex) {
	            targetIndex--;
	        }
	        targetSequence.splice(targetIndex, 0, step);
	    }
	    static insertStep(step, targetSequence, targetIndex) {
	        targetSequence.splice(targetIndex, 0, step);
	    }
	    static deleteStep(step, parentSequence, choice) {
	        if (choice == "0" && step.branches.False.length > 0) {
	            console.log("delete true");
	            for (let i = 0; i < step.branches.False.length; i++) {
	                parentSequence.push(step.branches.False[i]);
	            }
	        }
	        // If deleting false branch, keep blocks in true
	        else if (choice == "1" && step.branches.True.length > 0) {
	            console.log("delete false");
	            for (let i = 0; i < step.branches.True.length; i++) {
	                parentSequence.push(step.branches.True[i]);
	            }
	        }
	        if (choice != null) {
	            const index = parentSequence.indexOf(step);
	            if (index < 0) {
	                throw new Error("Unknown step");
	            }
	            parentSequence.splice(index, 1);
	        }
	    }
	}

	var ComponentType;
	(function (ComponentType) {
	    ComponentType["task"] = "task";
	    ComponentType["switch"] = "switch";
	})(ComponentType || (ComponentType = {}));

	class Dom {
	    static svg(name, attributes) {
	        const element = document.createElementNS('http://www.w3.org/2000/svg', name);
	        if (attributes) {
	            Dom.attrs(element, attributes);
	        }
	        return element;
	    }
	    static translate(element, x, y) {
	        element.setAttribute('transform', `translate(${x}, ${y})`);
	    }
	    static attrs(element, attributes) {
	        Object.keys(attributes).forEach(name => {
	            const value = attributes[name];
	            element.setAttribute(name, typeof value === 'string' ? value : value.toString());
	        });
	    }
	    static element(name, attributes) {
	        const element = document.createElement(name);
	        if (attributes) {
	            Dom.attrs(element, attributes);
	        }
	        return element;
	    }
	    static toggleClass(element, isEnabled, className) {
	        if (isEnabled) {
	            element.classList.add(className);
	        }
	        else {
	            element.classList.remove(className);
	        }
	    }
	}

	const MIN_SCALE = 0.1;
	const MAX_SCALE = 3;
	class DesignerContext {
	    constructor(definition, behaviorController, layoutController, configuration, isToolboxCollapsed, isSmartEditorCollapsed) {
	        this.definition = definition;
	        this.behaviorController = behaviorController;
	        this.layoutController = layoutController;
	        this.configuration = configuration;
	        this.isToolboxCollapsed = isToolboxCollapsed;
	        this.isSmartEditorCollapsed = isSmartEditorCollapsed;
	        this.onViewPortChanged = new SimpleEvent();
	        this.onSelectedStepChanged = new SimpleEvent();
	        this.onIsReadonlyChanged = new SimpleEvent();
	        this.onIsDraggingChanged = new SimpleEvent();
	        this.onIsMoveModeEnabledChanged = new SimpleEvent();
	        this.onIsToolboxCollapsedChanged = new SimpleEvent();
	        this.onIsSmartEditorCollapsedChanged = new SimpleEvent();
	        this.onDefinitionChanged = new SimpleEvent();
	        this.viewPort = {
	            position: new Vector(0, 0),
	            scale: 1,
	        };
	        this.selectedStep = null;
	        this.isDragging = false;
	        this.isMoveModeEnabled = false;
	        this.isReadonly = !!configuration.isReadonly;
	    }
	    setViewPort(position, scale) {
	        this.viewPort = { position, scale };
	        this.onViewPortChanged.forward(this.viewPort);
	    }
	    resetViewPort() {
	        this.getProvider().resetViewPort();
	    }
	    animateViewPort(position, scale) {
	        if (this.viewPortAnimation && this.viewPortAnimation.isAlive) {
	            this.viewPortAnimation.stop();
	        }
	        const startPosition = this.viewPort.position;
	        const startScale = this.viewPort.scale;
	        const deltaPosition = startPosition.subtract(position);
	        const deltaScale = startScale - scale;
	        this.viewPortAnimation = animate(150, (progress) => {
	            const newScale = startScale - deltaScale * progress;
	            this.setViewPort(startPosition.subtract(deltaPosition.multiplyByScalar(progress)), newScale);
	        });
	    }
	    moveViewPortToStep(stepId) {
	        const component = this.getProvider().getComponentByStepId(stepId);
	        this.getProvider().moveViewPortToStep(component);
	    }
	    limitScale(scale) {
	        return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
	    }
	    zoom(direction) {
	        this.getProvider().zoom(direction);
	    }
	    setSelectedStep(step) {
	        if (this.selectedStep !== step) {
	            this.selectedStep = step;
	            this.onSelectedStepChanged.forward(step);
	        }
	    }
	    selectStepById(stepId) {
	        const component = this.getProvider().getComponentByStepId(stepId);
	        this.setSelectedStep(component.step);
	    }
	    tryInsertStep(step, targetSequence, targetIndex) {
	        const canInsertStep = this.configuration.steps.canInsertStep
	            ? this.configuration.steps.canInsertStep(step, targetSequence, targetIndex)
	            : true;
	        if (!canInsertStep) {
	            return false;
	        }
	        SequenceModifier.insertStep(step, targetSequence, targetIndex);
	        this.notifiyDefinitionChanged(true);
	        this.setSelectedStep(step);
	        return true;
	    }
	    tryMoveStep(sourceSequence, step, targetSequence, targetIndex) {
	        const canMoveStep = this.configuration.steps.canMoveStep
	            ? this.configuration.steps.canMoveStep(sourceSequence, step, targetSequence, targetIndex)
	            : true;
	        if (!canMoveStep) {
	            return false;
	        }
	        SequenceModifier.moveStep(sourceSequence, step, targetSequence, targetIndex);
	        this.notifiyDefinitionChanged(true);
	        this.setSelectedStep(step);
	        return true;
	    }
	    tryDeleteStep(step) {
	        var _a;
	        const component = this.getProvider().getComponentByStepId(step.id);
	        const canDeleteStep = this.configuration.steps.canDeleteStep
	            ? this.configuration.steps.canDeleteStep(component.step, component.parentSequence)
	            : true;
	        if (!canDeleteStep) {
	            return false;
	        }
	        promptChoices$1(this, component);
	        this.notifiyDefinitionChanged(true);
	        if (((_a = this.selectedStep) === null || _a === void 0 ? void 0 : _a.id) === step.id) {
	            this.setSelectedStep(null);
	        }
	        return true;
	    }
	    setIsReadonly(isReadonly) {
	        this.isReadonly = isReadonly;
	        this.onIsReadonlyChanged.forward(isReadonly);
	    }
	    setIsDragging(isDragging) {
	        this.isDragging = isDragging;
	        this.onIsDraggingChanged.forward(isDragging);
	    }
	    toggleIsMoveModeEnabled() {
	        this.isMoveModeEnabled = !this.isMoveModeEnabled;
	        this.onIsMoveModeEnabledChanged.forward(this.isMoveModeEnabled);
	    }
	    toggleIsToolboxCollapsed() {
	        this.isToolboxCollapsed = !this.isToolboxCollapsed;
	        this.onIsToolboxCollapsedChanged.forward(this.isToolboxCollapsed);
	    }
	    toggleIsSmartEditorCollapsed() {
	        this.isSmartEditorCollapsed = !this.isSmartEditorCollapsed;
	        this.onIsSmartEditorCollapsedChanged.forward(this.isSmartEditorCollapsed);
	    }
	    notifiyDefinitionChanged(rerender) {
	        this.onDefinitionChanged.forward({ rerender });
	    }
	    getPlaceholders() {
	        return this.getProvider().getPlaceholders();
	    }
	    setProvider(provider) {
	        this.provider = provider;
	    }
	    getProvider() {
	        if (!this.provider) {
	            throw new Error("Provider is not set");
	        }
	        return this.provider;
	    }
	}
	function promptChoices$1(context, component) {
	    //console.log(controller);
	    let output = "";
	    // Create a propmt window
	    const dialogBox = Dom.element("dialog", {
	        class: "confirm-dialog",
	        id: "dialog-box",
	    });
	    const title = Dom.element("h3", {
	        class: "confirm-dialog-content",
	    });
	    let toDo;
	    // A form to include all choices
	    const form = Dom.element("form", {
	        method: "dialog",
	        id: "dialog-form",
	    });
	    if (component.step.componentType == ComponentType.switch) {
	        toDo = ["Delete true path", "Delete false path", "Delete both"];
	        title.innerText = "Which branch do you want to delete?";
	        for (let i = 0; i < toDo.length; i++) {
	            const radio = Dom.element("input", {
	                type: "radio",
	                name: "choice",
	                value: i,
	            });
	            const choice = Dom.element("label");
	            choice.innerText = toDo[i];
	            form.appendChild(radio);
	            form.appendChild(choice);
	            choice.insertAdjacentHTML("afterend", "</br>");
	        }
	    }
	    else {
	        title.innerText = "Are you sure to delete this block?";
	    }
	    dialogBox.appendChild(title);
	    const btn1 = Dom.element("button", {
	        type: "submit",
	    });
	    btn1.innerText = "Confirm";
	    form.appendChild(btn1);
	    const btn2 = Dom.element("button", {
	        type: "submit",
	    });
	    btn2.innerText = "Cancel";
	    btn2.addEventListener("click", function (e) {
	        e.preventDefault();
	        e.stopPropagation();
	        // console.log(context.layoutController.getParent().childNodes);
	        const designer = document.getElementById("designer");
	        while (designer === null || designer === void 0 ? void 0 : designer.childNodes[1]) {
	            designer === null || designer === void 0 ? void 0 : designer.removeChild(designer.childNodes[1]);
	        }
	    });
	    form.appendChild(btn2);
	    dialogBox.appendChild(form);
	    context.layoutController.parent.appendChild(dialogBox);
	    console.log(dialogBox);
	    if (typeof dialogBox.showModal === "function") {
	        dialogBox.showModal();
	    }
	    else {
	        prompt("Wrong window", "ok");
	    }
	    btn1.addEventListener("click", function (e) {
	        e.preventDefault();
	        e.stopPropagation();
	        // console.log(component);
	        if (component.step.componentType == "switch") {
	            var elem = document.getElementsByTagName("input");
	            for (let i = 0; i < elem.length; i++) {
	                // console.log(570, elem);
	                if (elem[i].type == "radio" && elem[i].checked) {
	                    output = elem[i].value;
	                }
	            }
	        }
	        else {
	            output = "2";
	        }
	        console.log("designer context", output);
	        SequenceModifier.deleteStep(component.step, component.parentSequence, output);
	        if (context.provider != undefined) {
	            context.provider.render();
	        }
	        const designer = document.getElementById("designer");
	        while (designer === null || designer === void 0 ? void 0 : designer.childNodes[1]) {
	            designer === null || designer === void 0 ? void 0 : designer.removeChild(designer.childNodes[1]);
	        }
	    });
	}

	// Icons source: https://github.com/google/material-design-icons
	class Icons {
	    static create(className, content) {
	        const icon = Dom.svg('svg', {
	            class: className,
	            viewBox: '0 0 24 24'
	        });
	        if (content) {
	            icon.innerHTML = content;
	        }
	        return icon;
	    }
	}
	Icons.center = '<path d="M4 15c-.55 0-1 .45-1 1v3c0 1.1.9 2 2 2h3c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1-.45-1-1v-2c0-.55-.45-1-1-1zm1-9c0-.55.45-1 1-1h2c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.1 0-2 .9-2 2v3c0 .55.45 1 1 1s1-.45 1-1V6zm14-3h-3c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1 .45 1 1v2c0 .55.45 1 1 1s1-.45 1-1V5c0-1.1-.9-2-2-2zm0 15c0 .55-.45 1-1 1h-2c-.55 0-1 .45-1 1s.45 1 1 1h3c1.1 0 2-.9 2-2v-3c0-.55-.45-1-1-1s-1 .45-1 1v2zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>';
	Icons.delete = '<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm4.3 14.3a.996.996 0 0 1-1.41 0L12 13.41 9.11 16.3a.996.996 0 1 1-1.41-1.41L10.59 12 7.7 9.11A.996.996 0 1 1 9.11 7.7L12 10.59l2.89-2.89a.996.996 0 1 1 1.41 1.41L13.41 12l2.89 2.89c.38.38.38 1.02 0 1.41z" fill="#E01A24"/>';
	Icons.move = '<path d="M10.5 9h3c.28 0 .5-.22.5-.5V6h1.79c.45 0 .67-.54.35-.85l-3.79-3.79c-.2-.2-.51-.2-.71 0L7.85 5.15a.5.5 0 0 0 .36.85H10v2.5c0 .28.22.5.5.5zm-2 1H6V8.21c0-.45-.54-.67-.85-.35l-3.79 3.79c-.2.2-.2.51 0 .71l3.79 3.79a.5.5 0 0 0 .85-.36V14h2.5c.28 0 .5-.22.5-.5v-3c0-.28-.22-.5-.5-.5zm14.15 1.65-3.79-3.79a.501.501 0 0 0-.86.35V10h-2.5c-.28 0-.5.22-.5.5v3c0 .28.22.5.5.5H18v1.79c0 .45.54.67.85.35l3.79-3.79c.2-.19.2-.51.01-.7zM13.5 15h-3c-.28 0-.5.22-.5.5V18H8.21c-.45 0-.67.54-.35.85l3.79 3.79c.2.2.51.2.71 0l3.79-3.79a.5.5 0 0 0-.35-.85H14v-2.5c0-.28-.22-.5-.5-.5z"/>';
	Icons.options = '<path d="M19.5 12c0-.23-.01-.45-.03-.68l1.86-1.41c.4-.3.51-.86.26-1.3l-1.87-3.23a.987.987 0 0 0-1.25-.42l-2.15.91c-.37-.26-.76-.49-1.17-.68l-.29-2.31c-.06-.5-.49-.88-.99-.88h-3.73c-.51 0-.94.38-1 .88l-.29 2.31c-.41.19-.8.42-1.17.68l-2.15-.91c-.46-.2-1-.02-1.25.42L2.41 8.62c-.25.44-.14.99.26 1.3l1.86 1.41a7.343 7.343 0 0 0 0 1.35l-1.86 1.41c-.4.3-.51.86-.26 1.3l1.87 3.23c.25.44.79.62 1.25.42l2.15-.91c.37.26.76.49 1.17.68l.29 2.31c.06.5.49.88.99.88h3.73c.5 0 .93-.38.99-.88l.29-2.31c.41-.19.8-.42 1.17-.68l2.15.91c.46.2 1 .02 1.25-.42l1.87-3.23c.25-.44.14-.99-.26-1.3l-1.86-1.41c.03-.23.04-.45.04-.68zm-7.46 3.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>';
	Icons.close = '<path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>';
	Icons.arrowDown = '<path d="M8.12 9.29 12 13.17l3.88-3.88a.996.996 0 1 1 1.41 1.41l-4.59 4.59a.996.996 0 0 1-1.41 0L6.7 10.7a.996.996 0 0 1 0-1.41c.39-.38 1.03-.39 1.42 0z"/>';
	Icons.zoomIn = '<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>';
	Icons.zoomOut = '<path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.26 4.25c.41.41 1.07.41 1.48 0l.01-.01c.41-.41.41-1.07 0-1.48L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm-2-5h4c.28 0 .5.22.5.5s-.22.5-.5.5h-4c-.28 0-.5-.22-.5-.5s.22-.5.5-.5z"/>';

	class ControlBarView {
	    constructor(resetButton, zoomInButton, zoomOutButton, moveButton, deleteButton) {
	        this.resetButton = resetButton;
	        this.zoomInButton = zoomInButton;
	        this.zoomOutButton = zoomOutButton;
	        this.moveButton = moveButton;
	        this.deleteButton = deleteButton;
	    }
	    static create(parent) {
	        const root = Dom.element('div', {
	            class: 'sqd-control-bar'
	        });
	        const deleteButton = createButton(Icons.delete, 'Delete selected step');
	        deleteButton.classList.add('sqd-hidden');
	        const resetButton = createButton(Icons.center, 'Reset');
	        const zoomInButton = createButton(Icons.zoomIn, 'Zoom in');
	        const zoomOutButton = createButton(Icons.zoomOut, 'Zoom out');
	        const moveButton = createButton(Icons.move, 'Turn on/off drag and drop');
	        moveButton.classList.add('sqd-disabled');
	        root.appendChild(resetButton);
	        root.appendChild(zoomInButton);
	        root.appendChild(zoomOutButton);
	        root.appendChild(moveButton);
	        root.appendChild(deleteButton);
	        parent.appendChild(root);
	        return new ControlBarView(resetButton, zoomInButton, zoomOutButton, moveButton, deleteButton);
	    }
	    bindResetButtonClick(handler) {
	        bindClick(this.resetButton, handler);
	    }
	    bindZoomInButtonClick(handler) {
	        bindClick(this.zoomInButton, handler);
	    }
	    bindZoomOutButtonClick(handler) {
	        bindClick(this.zoomOutButton, handler);
	    }
	    bindMoveButtonClick(handler) {
	        bindClick(this.moveButton, handler);
	    }
	    bindDeleteButtonClick(handler) {
	        bindClick(this.deleteButton, handler);
	    }
	    setIsDeleteButtonHidden(isHidden) {
	        Dom.toggleClass(this.deleteButton, isHidden, 'sqd-hidden');
	    }
	    setIsMoveButtonDisabled(isDisabled) {
	        Dom.toggleClass(this.moveButton, isDisabled, 'sqd-disabled');
	    }
	}
	function bindClick(element, handler) {
	    element.addEventListener('click', e => {
	        e.preventDefault();
	        handler();
	    }, false);
	}
	function createButton(iconContent, title) {
	    const button = Dom.element('div', {
	        class: 'sqd-control-bar-button',
	        title
	    });
	    const icon = Icons.create('sqd-control-bar-button-icon', iconContent);
	    button.appendChild(icon);
	    return button;
	}

	class ControlBar {
	    constructor(view, context) {
	        this.view = view;
	        this.context = context;
	    }
	    static create(parent, context) {
	        const view = ControlBarView.create(parent);
	        const bar = new ControlBar(view, context);
	        view.bindResetButtonClick(() => bar.onResetButtonClicked());
	        view.bindZoomInButtonClick(() => bar.onZoomInButtonClicked());
	        view.bindZoomOutButtonClick(() => bar.onZoomOutButtonClicked());
	        view.bindMoveButtonClick(() => bar.onMoveButtonClicked());
	        view.bindDeleteButtonClick(() => bar.onDeleteButtonClicked());
	        context.onIsReadonlyChanged.subscribe(() => bar.onIsReadonlyChanged());
	        context.onSelectedStepChanged.subscribe(() => bar.onSelectedStepChanged());
	        context.onIsMoveModeEnabledChanged.subscribe(i => bar.onIsMoveModeEnabledChanged(i));
	        return bar;
	    }
	    onResetButtonClicked() {
	        this.context.resetViewPort();
	    }
	    onZoomInButtonClicked() {
	        this.context.zoom(true);
	    }
	    onZoomOutButtonClicked() {
	        this.context.zoom(false);
	    }
	    onMoveButtonClicked() {
	        this.context.toggleIsMoveModeEnabled();
	        if (this.context.selectedStep) {
	            this.context.setSelectedStep(null);
	        }
	    }
	    onDeleteButtonClicked() {
	        if (this.context.selectedStep) {
	            this.context.tryDeleteStep(this.context.selectedStep);
	        }
	    }
	    onIsReadonlyChanged() {
	        this.refreshDeleteButtonVisibility();
	    }
	    onSelectedStepChanged() {
	        this.refreshDeleteButtonVisibility();
	    }
	    onIsMoveModeEnabledChanged(isEnabled) {
	        this.view.setIsMoveButtonDisabled(!isEnabled);
	    }
	    refreshDeleteButtonVisibility() {
	        const isHidden = !this.context.selectedStep || this.context.isReadonly;
	        this.view.setIsDeleteButtonHidden(isHidden);
	    }
	}

	class GlobalEditorView {
	    constructor(root) {
	        this.root = root;
	    }
	    static create(content) {
	        const se = Dom.element('div', {
	            class: 'sqd-global-editor'
	        });
	        se.appendChild(content);
	        return new GlobalEditorView(se);
	    }
	}

	class GlobalEditor {
	    constructor(view) {
	        this.view = view;
	    }
	    static create(definition, context) {
	        const editorContext = {
	            notifyPropertiesChanged: () => {
	                context.notifiyDefinitionChanged(false);
	            }
	        };
	        const content = context.configuration.editors.globalEditorProvider(definition, editorContext);
	        const view = GlobalEditorView.create(content);
	        return new GlobalEditor(view);
	    }
	}

	class SmartEditorView {
	    constructor(root, toggle, toggleIcon) {
	        this.root = root;
	        this.toggle = toggle;
	        this.toggleIcon = toggleIcon;
	    }
	    static create(parent) {
	        const root = Dom.element('div', {
	            class: 'sqd-smart-editor'
	        });
	        const toggle = Dom.element('div', {
	            class: 'sqd-smart-editor-toggle',
	            title: 'Toggle editor'
	        });
	        const toggleIcon = Icons.create('sqd-smart-editor-toggle-icon');
	        toggle.appendChild(toggleIcon);
	        parent.appendChild(toggle);
	        parent.appendChild(root);
	        return new SmartEditorView(root, toggle, toggleIcon);
	    }
	    bindToggleIsCollapsedClick(handler) {
	        this.toggle.addEventListener('click', e => {
	            e.preventDefault();
	            handler();
	        }, false);
	    }
	    setIsCollapsed(isCollapsed) {
	        Dom.toggleClass(this.root, isCollapsed, 'sqd-hidden');
	        Dom.toggleClass(this.toggle, isCollapsed, 'sqd-collapsed');
	        this.toggleIcon.innerHTML = isCollapsed ? Icons.options : Icons.close;
	    }
	    setView(view) {
	        if (this.view) {
	            this.root.removeChild(this.view.root);
	        }
	        this.root.appendChild(view.root);
	        this.view = view;
	    }
	}

	class StepEditorView {
	    constructor(root) {
	        this.root = root;
	    }
	    static create(content) {
	        const root = Dom.element('div', {
	            class: 'sqd-step-editor'
	        });
	        root.appendChild(content);
	        return new StepEditorView(root);
	    }
	}

	class StepEditor {
	    constructor(view) {
	        this.view = view;
	    }
	    static create(step, context) {
	        const editorContext = {
	            notifyPropertiesChanged: () => {
	                context.notifiyDefinitionChanged(false);
	            },
	            notifyNameChanged: () => {
	                context.notifiyDefinitionChanged(true);
	            }
	        };
	        const content = context.configuration.editors.stepEditorProvider(step, editorContext);
	        const view = StepEditorView.create(content);
	        return new StepEditor(view);
	    }
	}

	class SmartEditor {
	    constructor(view, context) {
	        this.view = view;
	        this.context = context;
	        this.currentStep = undefined;
	    }
	    static create(parent, context) {
	        const view = SmartEditorView.create(parent);
	        view.setIsCollapsed(context.isSmartEditorCollapsed);
	        const editor = new SmartEditor(view, context);
	        view.bindToggleIsCollapsedClick(() => editor.toggleIsCollapsedClick());
	        editor.tryRender(null);
	        context.onSelectedStepChanged.subscribe(s => editor.onSelectedStepChanged(s));
	        context.onDefinitionChanged.subscribe(() => editor.onDefinitionChanged());
	        context.onIsSmartEditorCollapsedChanged.subscribe(ic => view.setIsCollapsed(ic));
	        return editor;
	    }
	    toggleIsCollapsedClick() {
	        this.context.toggleIsSmartEditorCollapsed();
	    }
	    onSelectedStepChanged(step) {
	        this.tryRender(step);
	    }
	    onDefinitionChanged() {
	        this.tryRender(this.context.selectedStep);
	    }
	    tryRender(step) {
	        if (this.currentStep !== step) {
	            const editor = step ? StepEditor.create(step, this.context) : GlobalEditor.create(this.context.definition, this.context);
	            this.currentStep = step;
	            this.view.setView(editor.view);
	        }
	    }
	}

	class ScrollBoxView {
	    constructor(root, viewport) {
	        this.root = root;
	        this.viewport = viewport;
	        this.onResizeHandler = () => this.onResize();
	        this.onTouchMoveHandler = (e) => this.onTouchMove(e);
	        this.onMouseMoveHandler = (e) => this.onMouseMove(e);
	        this.onTouchEndHandler = (e) => this.onTouchEnd(e);
	        this.onMouseUpHandler = (e) => this.onMouseUp(e);
	    }
	    static create(parent, viewport) {
	        const root = Dom.element('div', {
	            class: 'sqd-scrollbox'
	        });
	        parent.appendChild(root);
	        const view = new ScrollBoxView(root, viewport);
	        window.addEventListener('resize', view.onResizeHandler, false);
	        root.addEventListener('wheel', e => view.onWheel(e), false);
	        root.addEventListener('touchstart', e => view.onTouchStart(e), false);
	        root.addEventListener('mousedown', e => view.onMouseDown(e), false);
	        return view;
	    }
	    setContent(element) {
	        if (this.content) {
	            this.root.removeChild(this.content.element);
	        }
	        element.classList.add('sqd-scrollbox-body');
	        this.root.appendChild(element);
	        this.reload(element);
	    }
	    refresh() {
	        if (this.content) {
	            this.reload(this.content.element);
	        }
	    }
	    destroy() {
	        window.removeEventListener('resize', this.onResizeHandler, false);
	    }
	    reload(element) {
	        const maxHeightPercent = 0.7;
	        const minDistance = 200;
	        let height = Math.min(this.viewport.clientHeight * maxHeightPercent, element.clientHeight);
	        height = Math.min(height, this.viewport.clientHeight - minDistance);
	        this.root.style.height = height + 5 + 'px';
	        element.style.top = '0px';
	        this.content = {
	            element,
	            height
	        };
	    }
	    onResize() {
	        this.refresh();
	    }
	    onWheel(e) {
	        e.stopPropagation();
	        if (this.content) {
	            const delta = e.deltaY > 0 ? -25 : 25;
	            const scrollTop = this.getScrollTop();
	            this.setScrollTop(scrollTop + delta);
	        }
	    }
	    onTouchStart(e) {
	        e.preventDefault();
	        this.startScroll(readTouchPosition(e));
	    }
	    onMouseDown(e) {
	        this.startScroll(readMousePosition(e));
	    }
	    onTouchMove(e) {
	        e.preventDefault();
	        this.moveScroll(readTouchPosition(e));
	    }
	    onMouseMove(e) {
	        e.preventDefault();
	        this.moveScroll(readMousePosition(e));
	    }
	    onTouchEnd(e) {
	        e.preventDefault();
	        this.stopScroll();
	    }
	    onMouseUp(e) {
	        e.preventDefault();
	        this.stopScroll();
	    }
	    startScroll(startPosition) {
	        if (!this.scroll) {
	            window.addEventListener('touchmove', this.onTouchMoveHandler, false);
	            window.addEventListener('mousemove', this.onMouseMoveHandler, false);
	            window.addEventListener('touchend', this.onTouchEndHandler, false);
	            window.addEventListener('mouseup', this.onMouseUpHandler, false);
	        }
	        this.scroll = {
	            startPositionY: startPosition.y,
	            startScrollTop: this.getScrollTop()
	        };
	    }
	    moveScroll(position) {
	        if (this.scroll) {
	            const delta = position.y - this.scroll.startPositionY;
	            this.setScrollTop(this.scroll.startScrollTop + delta);
	        }
	    }
	    stopScroll() {
	        if (this.scroll) {
	            window.removeEventListener('touchmove', this.onTouchMoveHandler, false);
	            window.removeEventListener('mousemove', this.onMouseMoveHandler, false);
	            window.removeEventListener('touchend', this.onTouchEndHandler, false);
	            window.removeEventListener('mouseup', this.onMouseUpHandler, false);
	            this.scroll = undefined;
	        }
	    }
	    getScrollTop() {
	        if (this.content && this.content.element.style.top) {
	            return parseInt(this.content.element.style.top);
	        }
	        return 0;
	    }
	    setScrollTop(scrollTop) {
	        if (this.content) {
	            const max = this.content.element.clientHeight - this.content.height;
	            const limited = Math.max(Math.min(scrollTop, 0), -max);
	            this.content.element.style.top = limited + 'px';
	        }
	    }
	}

	var StepComponentState;
	(function (StepComponentState) {
	    StepComponentState[StepComponentState["default"] = 0] = "default";
	    StepComponentState[StepComponentState["selected"] = 1] = "selected";
	    StepComponentState[StepComponentState["dragging"] = 2] = "dragging";
	})(StepComponentState || (StepComponentState = {}));

	class JoinView {
	    static createStraightJoin(parent, start, height) {
	        const join = Dom.svg('line', {
	            class: 'sqd-join',
	            x1: start.x,
	            y1: start.y,
	            x2: start.x,
	            y2: start.y + height
	        });
	        parent.insertBefore(join, parent.firstChild);
	    }
	    static createJoins(parent, start, targets) {
	        for (const target of targets) {
	            const c = Math.abs(start.y - target.y) / 2; // size of a corner
	            const l = Math.abs(start.x - target.x) - c * 2; // size of the line between corners
	            const x = start.x > target.x ? -1 : 1;
	            const y = start.y > target.y ? -1 : 1;
	            const join = Dom.svg('path', {
	                class: 'sqd-join',
	                fill: 'none',
	                d: `M ${start.x} ${start.y} q ${x * c * 0.3} ${y * c * 0.8} ${x * c} ${y * c} l ${x * l} 0 q ${x * c * 0.7} ${y * c * 0.2} ${x * c} ${y * c}`
	            });
	            parent.insertBefore(join, parent.firstChild);
	        }
	    }
	}

	const LABEL_HEIGHT$2 = 22;
	const LABEL_PADDING_X$2 = 10;
	const MIN_LABEL_WIDTH$1 = 50;
	class LabelView {
	    static create(parent, x, y, text, theme) {
	        const nameText = Dom.svg('text', {
	            class: 'sqd-label-text',
	            x,
	            y: y + LABEL_HEIGHT$2 / 2
	        });
	        nameText.textContent = text;
	        parent.appendChild(nameText);
	        const nameWidth = Math.max(nameText.getBBox().width + LABEL_PADDING_X$2 * 2, MIN_LABEL_WIDTH$1);
	        const nameRect = Dom.svg('rect', {
	            class: 'sqd-label-rect',
	            width: nameWidth,
	            height: LABEL_HEIGHT$2,
	            x: x - nameWidth / 2,
	            y,
	            rx: 10,
	            ry: 10
	        });
	        if (theme) {
	            nameRect.classList.add(`sqd-label-${theme}`);
	        }
	        parent.insertBefore(nameRect, nameText);
	    }
	}

	class RegionView {
	    constructor(regions) {
	        this.regions = regions;
	    }
	    static create(parent, widths, height) {
	        const totalWidth = widths.reduce((c, v) => c + v, 0);
	        const mainRegion = Dom.svg('rect', {
	            class: 'sqd-region',
	            width: totalWidth,
	            height,
	            fill: 'transparent',
	            rx: 5,
	            ry: 5
	        });
	        const regions = [mainRegion];
	        parent.insertBefore(mainRegion, parent.firstChild);
	        let offsetX = widths[0];
	        for (let i = 1; i < widths.length; i++) {
	            const line = Dom.svg('line', {
	                class: 'sqd-region',
	                x1: offsetX,
	                y1: 0,
	                x2: offsetX,
	                y2: height
	            });
	            regions.push(line);
	            parent.insertBefore(line, parent.firstChild);
	            offsetX += widths[i];
	        }
	        return new RegionView(regions);
	    }
	    getClientPosition() {
	        const rect = this.regions[0].getBoundingClientRect();
	        return new Vector(rect.x, rect.y);
	    }
	    setIsSelected(isSelected) {
	        this.regions.forEach(region => {
	            Dom.toggleClass(region, isSelected, 'sqd-selected');
	        });
	    }
	}

	const SIZE$2 = 20;
	class ValidationErrorView {
	    constructor(g) {
	        this.g = g;
	    }
	    static create(parent, x, y) {
	        const g = Dom.svg('g', {
	            class: 'sqd-hidden'
	        });
	        Dom.translate(g, x, y);
	        const circle = Dom.svg('path', {
	            class: 'sqd-validation-error',
	            d: `M 0 ${-SIZE$2 / 2} l ${SIZE$2 / 2} ${SIZE$2} l ${-SIZE$2} 0 Z`
	        });
	        g.appendChild(circle);
	        parent.appendChild(g);
	        return new ValidationErrorView(g);
	    }
	    setIsHidden(isHidden) {
	        Dom.toggleClass(this.g, isHidden, 'sqd-hidden');
	    }
	}

	const RECT_INPUT_SIZE = 18;
	const RECT_INPUT_ICON_SIZE = 14;
	const ROUND_INPUT_SIZE = 7;
	class InputView {
	    constructor(root) {
	        this.root = root;
	    }
	    static createRectInput(parent, x, y, iconUrl) {
	        const g = Dom.svg('g');
	        parent.appendChild(g);
	        const rect = Dom.svg('rect', {
	            class: 'sqd-input',
	            width: RECT_INPUT_SIZE,
	            height: RECT_INPUT_SIZE,
	            x: x - RECT_INPUT_SIZE / 2,
	            y: y + RECT_INPUT_SIZE / -2 + 0.5,
	            rx: 4,
	            ry: 4
	        });
	        g.appendChild(rect);
	        if (iconUrl) {
	            const icon = Dom.svg('image', {
	                href: iconUrl,
	                width: RECT_INPUT_ICON_SIZE,
	                height: RECT_INPUT_ICON_SIZE,
	                x: x - RECT_INPUT_ICON_SIZE / 2,
	                y: y + RECT_INPUT_ICON_SIZE / -2
	            });
	            g.appendChild(icon);
	        }
	        return new InputView(g);
	    }
	    static createRoundInput(parent, x, y) {
	        const circle = Dom.svg('circle', {
	            class: 'sqd-input',
	            cx: x,
	            xy: y,
	            r: ROUND_INPUT_SIZE
	        });
	        parent.appendChild(circle);
	        return new InputView(circle);
	    }
	    setIsHidden(isHidden) {
	        Dom.attrs(this.root, {
	            visibility: isHidden ? 'hidden' : 'visible'
	        });
	    }
	}

	class SequencePlaceholder {
	    constructor(element, parentSequence, index) {
	        this.element = element;
	        this.parentSequence = parentSequence;
	        this.index = index;
	    }
	    setIsHover(isHover) {
	        Dom.toggleClass(this.element, isHover, "sqd-hover");
	        Dom.toggleClass(this.element.childNodes[0], !isHover, "sqd-hidden");
	    }
	}

	const PH_WIDTH = 100;
	const PH_HEIGHT = 150;
	const SIZE$1 = 30;
	function addStop() {
	    const s = SIZE$1 * 0.5;
	    const m = (SIZE$1 - s) / 2;
	    const circle = Dom.svg("circle", {
	        class: "sqd-start-stop",
	        cx: SIZE$1 / 2,
	        cy: SIZE$1 / 2,
	        r: SIZE$1 / 2,
	    });
	    const g = Dom.svg("g", { class: "stop" });
	    g.appendChild(circle);
	    const stop = Dom.svg("rect", {
	        class: "sqd-start-stop-icon",
	        x: m,
	        y: m,
	        width: s,
	        height: s,
	        rx: 4,
	        ry: 4,
	    });
	    g.appendChild(stop);
	    return g;
	}
	class SequenceComponentView {
	    constructor(g, width, height, joinX, placeholders, components) {
	        this.g = g;
	        this.width = width;
	        this.height = height;
	        this.joinX = joinX;
	        this.placeholders = placeholders;
	        this.components = components;
	    }
	    static create(parent, sequence, configuration) {
	        const g = Dom.svg("g");
	        parent.appendChild(g);
	        const components = sequence.map((s) => StepComponentFactory.create(g, s, sequence, configuration));
	        const maxJoinX = components.length > 0
	            ? Math.max(...components.map((c) => c.view.joinX))
	            : PH_WIDTH / 2;
	        const maxWidth = components.length > 0
	            ? Math.max(...components.map((c) => c.view.width))
	            : PH_WIDTH;
	        let offsetY = PH_HEIGHT;
	        const placeholders = [];
	        // Empty canvas
	        if (components.length == 0) {
	            placeholders.push(appendPlaceholder(g, maxJoinX - PH_WIDTH / 2, 0));
	        }
	        // Adding lines, placeholders, and stop points on TOP of components
	        let i = 0;
	        for (i; i < components.length; i++) {
	            const component = components[i];
	            const offsetX = maxJoinX - component.view.joinX;
	            JoinView.createStraightJoin(g, new Vector(maxJoinX, offsetY - PH_HEIGHT), PH_HEIGHT);
	            placeholders.push(appendPlaceholder(g, maxJoinX - PH_WIDTH / 2, offsetY - PH_HEIGHT));
	            Dom.translate(component.view.g, offsetX, offsetY);
	            offsetY += component.view.height + PH_HEIGHT;
	        }
	        /* Add placeholder & stop sign to the BOTTOM of last component
	            if it's not a switch component */
	        if (i > 0 && components[i - 1].step.componentType == ComponentType.task) {
	            JoinView.createStraightJoin(g, new Vector(maxJoinX, offsetY - PH_HEIGHT), PH_HEIGHT);
	            placeholders.push(appendPlaceholder(g, maxJoinX - PH_WIDTH / 2, offsetY - PH_HEIGHT));
	            // Add stop sign to task block
	            const stop = addStop();
	            Dom.translate(stop, maxJoinX - PH_WIDTH / 6.8, offsetY - PH_HEIGHT / 16);
	            // Calculate location
	            g.appendChild(stop);
	        }
	        let containsSwitch;
	        for (i = 0; i < components.length; i++) {
	            // Modify switch components
	            if (components[i].step.componentType == ComponentType.switch) {
	                JoinView.createStraightJoin(g, new Vector(maxJoinX, 0), PH_HEIGHT);
	                containsSwitch = 1;
	                // If there is one or more blocks below if/else,
	                // move them to the end of true branch
	                while (components[i + 1]) {
	                    // Move every block to true branch
	                    components[i].step.branches.True.push(components[i].parentSequence[i + 1]);
	                    // Remove from parent sequence of if/else & components
	                    components[i].parentSequence.splice(i + 1, 1);
	                    components.splice(i + 1, 1);
	                }
	            }
	        }
	        // Hide start component, and placeholder & line below it
	        //if (components.length > 0 && components[0].step.id == 'start-component') {
	        if (components.length > 0 &&
	            components[0].step.id.startsWith("start-component")) {
	            Dom.attrs(placeholders[0], {
	                display: "none",
	            });
	            const lines = parent.childNodes[0].childNodes;
	            if (components.length == 1) {
	                parent.childNodes[0].removeChild(lines[1]);
	            }
	            else {
	                // console.log(lines);
	                parent.childNodes[0].removeChild(lines[components.length]);
	                if (containsSwitch) {
	                    parent.childNodes[0].removeChild(lines[0]);
	                }
	            }
	            // console.log(document.getElementsByClassName("sqd-input")[0]);
	            document
	                .getElementsByClassName("sqd-input")[0]
	                .setAttribute("display", "none");
	        }
	        return new SequenceComponentView(g, maxWidth, offsetY, maxJoinX, placeholders, components);
	    }
	    getClientPosition() {
	        throw new Error("Not supported");
	    }
	    setIsDragging(isDragging) {
	        this.placeholders.forEach((p) => {
	            Dom.attrs(p, {
	                visibility: isDragging ? "visible" : "hidden",
	            });
	        });
	    }
	}
	function appendPlaceholder(g, x, y) {
	    const g1 = Dom.svg("g", {
	        class: "sqd-placeholder",
	        visibility: "hidden",
	    });
	    const circle = Dom.svg("circle", {
	        class: "sqd-placeholder-circle",
	        cx: x + PH_WIDTH / 2,
	        cy: y + PH_HEIGHT / 2,
	        r: SIZE$1 / 3,
	    });
	    const startX = x + PH_WIDTH / 2 - SIZE$1 / 8;
	    const startY = y + PH_HEIGHT / 2 - SIZE$1 / 8;
	    const endX = x + PH_WIDTH / 2 + SIZE$1 / 8;
	    const endY = y + PH_HEIGHT / 2 + SIZE$1 / 8;
	    const sign = Dom.svg("path", {
	        class: "sqd-placeholder-icon",
	        d: `M ${startX} ${y + PH_HEIGHT / 2} H ${endX} M ${x + PH_WIDTH / 2} ${startY} V ${endY}`,
	    });
	    // Outside circle
	    const outside = Dom.svg("circle", {
	        id: "outside-circle",
	        cx: x + PH_WIDTH / 2,
	        cy: y + PH_HEIGHT / 2,
	        r: SIZE$1,
	    });
	    Dom.toggleClass(outside, true, "sqd-hidden");
	    g1.appendChild(outside);
	    g1.appendChild(circle);
	    g1.appendChild(sign);
	    g.appendChild(g1);
	    return g1;
	}

	class SequenceComponent {
	    constructor(view, sequence) {
	        this.view = view;
	        this.sequence = sequence;
	    }
	    static create(parent, sequence, configuration) {
	        const view = SequenceComponentView.create(parent, sequence, configuration);
	        return new SequenceComponent(view, sequence);
	    }
	    findByElement(element) {
	        for (const component of this.view.components) {
	            const sc = component.findByElement(element);
	            if (sc) {
	                return sc;
	            }
	        }
	        return null;
	    }
	    findById(stepId) {
	        for (const component of this.view.components) {
	            const sc = component.findById(stepId);
	            if (sc) {
	                return sc;
	            }
	        }
	        return null;
	    }
	    getPlaceholders(result) {
	        this.view.placeholders.forEach((ph, index) => {
	            result.push(new SequencePlaceholder(ph, this.sequence, index));
	        });
	        this.view.components.forEach(c => c.getPlaceholders(result));
	    }
	    setIsDragging(isDragging) {
	        this.view.setIsDragging(isDragging);
	        this.view.components.forEach(c => c.setIsDragging(isDragging));
	    }
	    validate() {
	        let isValid = true;
	        for (const component of this.view.components) {
	            isValid = component.validate() && isValid;
	        }
	        return isValid;
	    }
	}

	const MIN_CHILDREN_WIDTH = 150;
	const PADDING_X$5 = 20;
	const PADDING_TOP = 20;
	const LABEL_HEIGHT = 22;
	const CONNECTION_HEIGHT = 16;
	const RECT_RADIUS$5 = 15;
	const MIN_TEXT_WIDTH$5 = 98; // 70
	const PADDING_Y$5 = 10;
	const ICON_SIZE$6 = 22;
	const DROPDOWN_Y = 90;
	const DROPDOWN_X1 = 30;
	const DROPDOWN_X2 = 160;
	const DROPDOWN_X3 = 280;
	class SwitchStepComponentView {
	    constructor(g, width, height, joinX, sequenceComponents, regionView, inputView, validationErrorView) {
	        this.g = g;
	        this.width = width;
	        this.height = height;
	        this.joinX = joinX;
	        this.sequenceComponents = sequenceComponents;
	        this.regionView = regionView;
	        this.inputView = inputView;
	        this.validationErrorView = validationErrorView;
	    }
	    static create(parent, step, configuration) {
	        const g = Dom.svg("g", {
	            class: `sqd-switch-group sqd-type-${step.type}`,
	        });
	        parent.appendChild(g);
	        const branchNames = Object.keys(step.branches);
	        const sequenceComponents = branchNames.map((bn) => SequenceComponent.create(g, step.branches[bn], configuration));
	        const maxChildHeight = Math.max(...sequenceComponents.map((s) => s.view.height));
	        const containerWidths = sequenceComponents.map((s) => Math.max(s.view.width, MIN_CHILDREN_WIDTH) + PADDING_X$5 * 2);
	        const containersWidth = containerWidths.reduce((p, c) => p + c, 0);
	        // const containerHeight = maxChildHeight + PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT * 2;
	        const containerOffsets = [];
	        const joinXs = sequenceComponents.map((s) => Math.max(s.view.joinX, MIN_CHILDREN_WIDTH / 2));
	        const boxHeight = ICON_SIZE$6 + PADDING_Y$5; // 32
	        const containerHeight = maxChildHeight +
	            PADDING_TOP +
	            LABEL_HEIGHT * 2 +
	            CONNECTION_HEIGHT * 2 +
	            boxHeight / 2;
	        let totalX = 0;
	        for (let i = 0; i < branchNames.length; i++) {
	            containerOffsets.push(totalX);
	            totalX += containerWidths[i];
	        }
	        // Create branch
	        branchNames.forEach((branchName, i) => {
	            const sequence = sequenceComponents[i];
	            const offsetX = containerOffsets[i];
	            LabelView.create(g, offsetX + joinXs[i] + PADDING_X$5, PADDING_TOP + LABEL_HEIGHT + CONNECTION_HEIGHT + boxHeight / 2, branchName, "secondary");
	            const sequenceX = offsetX +
	                PADDING_X$5 +
	                Math.max((MIN_CHILDREN_WIDTH - sequence.view.width) / 2, 0);
	            const sequenceY = PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT + boxHeight / 2;
	            JoinView.createStraightJoin(g, new Vector(containerOffsets[i] + joinXs[i] + PADDING_X$5, PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT + boxHeight / 2), 120);
	            Dom.translate(sequence.view.g, sequenceX, sequenceY);
	        });
	        // LabelView.create(g, containerWidths[0], PADDING_TOP, step.name);
	        const g1 = Dom.svg("g");
	        const text = Dom.svg("text", {
	            x: ICON_SIZE$6 + containerWidths[0] - PADDING_X$5 / 2 - 160,
	            y: boxHeight / 1.7 + PADDING_TOP,
	            class: "sqd-task-text",
	        });
	        text.textContent = "If/Else";
	        g1.appendChild(text);
	        const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH$5);
	        const boxWidth = ICON_SIZE$6 + 8 * PADDING_X$5 + 2 * textWidth;
	        const rect = Dom.svg("rect", {
	            x: containerWidths[0] - textWidth - 85,
	            y: PADDING_TOP,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: boxHeight,
	            rx: 15,
	            ry: 15,
	        });
	        g1.insertBefore(rect, text);
	        const rectLeft = Dom.svg("rect", {
	            x: containerWidths[0] - textWidth - 85,
	            y: PADDING_TOP,
	            class: "sqd-task-rect",
	            width: textWidth + 5,
	            height: boxHeight,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        const textRight = Dom.svg("text", {
	            x: ICON_SIZE$6 + containerWidths[0] - 10,
	            y: boxHeight / 1.7 + PADDING_TOP,
	            class: "sqd-task-text",
	        });
	        if (step.properties["subject"]) {
	            textRight.textContent = step.properties["subject"].toString();
	        }
	        else {
	            textRight.textContent = "Choose Condition";
	        }
	        g1.appendChild(textRight);
	        g1.insertBefore(rectLeft, text);
	        g1.appendChild(textRight);
	        const textRightReminder = Dom.svg("text", {
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 132,
	            y: boxHeight / 2,
	            class: "sqd-task-text",
	        });
	        textRightReminder.textContent = "Please set up your filter";
	        const rectRight = Dom.svg("rect", {
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 80,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: 2 * boxHeight,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        const rectRightLine = Dom.svg("line", {
	            class: "sqd-join",
	            x1: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 50,
	            x2: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 81,
	            y1: 15,
	            y2: 15,
	        });
	        const clickOkBut = Dom.svg("rect", {
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 182,
	            y: 1.25 * boxHeight,
	            class: "sqd-task-rect",
	            width: 40,
	            height: 20,
	            rx: 5,
	            ry: 5,
	        });
	        const clickOkButCover = Dom.svg("rect", {
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 182,
	            y: 1.25 * boxHeight,
	            class: "option select-field choice",
	            width: 40,
	            height: 20,
	            rx: 5,
	            ry: 5,
	            id: `clickOkButCover${Date.now()}`,
	        });
	        Dom.attrs(clickOkButCover, {
	            opacity: 0.1,
	        });
	        const clickOkText = Dom.svg("text", {
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 192,
	            y: 1.55 * boxHeight,
	            class: "sqd-task-text",
	        });
	        clickOkText.textContent = "OK";
	        const setUpReminder = Dom.svg("g", {
	            class: `sqd-task-group setup-reminder sqd-hidden`,
	        });
	        setUpReminder.appendChild(rectRightLine);
	        setUpReminder.appendChild(textRightReminder);
	        setUpReminder.insertBefore(rectRight, textRightReminder);
	        setUpReminder.appendChild(clickOkText);
	        setUpReminder.insertBefore(clickOkBut, clickOkText);
	        setUpReminder.appendChild(clickOkButCover);
	        const moreUrl = "../assets/switch_more.svg";
	        const moreIcon = Dom.svg("image", {
	                href: moreUrl,
	            })
	            ;
	        Dom.attrs(moreIcon, {
	            class: "moreIcon",
	            x: ICON_SIZE$6 + containerWidths[0] + PADDING_X$5 + textWidth + 28,
	            y: PADDING_TOP * 1.2,
	            width: ICON_SIZE$6,
	            height: ICON_SIZE$6,
	        });
	        const rightCopyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightCopyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 102,
	            y: PADDING_Y$5 + 10, //  - 6, 4,
	        });
	        Dom.attrs(rightCopyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const changeUrl = "../assets/change.svg";
	        const changeIcon = Dom.svg("image", {
	                href: changeUrl,
	            })
	            ;
	        Dom.attrs(changeIcon, {
	            class: "moreicon",
	            id: `RightChangeIcon-${step.id}`,
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 106,
	            y: PADDING_Y$5 + 14,
	            width: ICON_SIZE$6,
	            height: ICON_SIZE$6,
	        });
	        rightCopyImgContainer.appendChild(rightCopyImgContainerCircle);
	        rightCopyImgContainer.appendChild(changeIcon);
	        const rightDeleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightDeleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 82,
	            y: PADDING_Y$5 + 40, // + 27,
	        });
	        Dom.attrs(rightDeleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const deleteUrl = "../assets/delete.svg";
	        const deleteIcon = Dom.svg("image", {
	                href: deleteUrl,
	            })
	            ;
	        Dom.attrs(deleteIcon, {
	            class: "moreicon",
	            id: `RightDeleteIcon-${step.id}`,
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 85,
	            y: PADDING_Y$5 + 43,
	            width: 22,
	            height: 22,
	        });
	        rightDeleteImgContainer.appendChild(rightDeleteImgContainerCircle);
	        rightDeleteImgContainer.appendChild(deleteIcon);
	        const rightEditImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightEditImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 82,
	            y: PADDING_Y$5 - 20, // -30
	        });
	        Dom.attrs(rightEditImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const editUrl = "../assets/edit.svg";
	        const editIcon = Dom.svg("image", {
	                href: editUrl,
	            })
	            ;
	        Dom.attrs(editIcon, {
	            class: "moreicon",
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 85,
	            y: PADDING_Y$5 - 16,
	            width: ICON_SIZE$6,
	            height: ICON_SIZE$6,
	        });
	        rightEditImgContainer.appendChild(rightEditImgContainerCircle);
	        rightEditImgContainer.appendChild(editIcon);
	        const checkImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const checkImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$6 + textWidth / 2 + 2 * PADDING_X$5 + 89,
	            y: PADDING_Y$5 - 40,
	        });
	        Dom.attrs(checkImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCheckIconUrl = "../assets/check.svg";
	        const upCheckIcon = Dom.svg("image", {
	                href: upCheckIconUrl,
	            })
	            ;
	        Dom.attrs(upCheckIcon, {
	            class: "moreicon",
	            // id: `tagUpCheckIcon`,
	            x: ICON_SIZE$6 + textWidth / 2 + 2 * PADDING_X$5 + 93,
	            y: PADDING_Y$5 - 37,
	            width: 22,
	            height: 22,
	        });
	        checkImgContainer.appendChild(checkImgContainerCircle);
	        checkImgContainer.appendChild(upCheckIcon);
	        const deleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const deleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$6 + textWidth / 2 + 2 * PADDING_X$5 + 41 + 110,
	            y: PADDING_Y$5 - 40,
	        });
	        Dom.attrs(deleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upDeleteIconUrl = "../assets/delete.svg";
	        const upDeleteIcon = Dom.svg("image", {
	                href: upDeleteIconUrl,
	            })
	            ;
	        Dom.attrs(upDeleteIcon, {
	            class: "moreicon",
	            id: `UpDeleteIcon-${step.id}`,
	            x: ICON_SIZE$6 + textWidth / 2 + 2 * PADDING_X$5 + 44 + 110,
	            y: PADDING_Y$5 - 37,
	            width: ICON_SIZE$6,
	            height: ICON_SIZE$6,
	        });
	        deleteImgContainer.appendChild(deleteImgContainerCircle);
	        deleteImgContainer.appendChild(upDeleteIcon);
	        const copyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const copyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$6 + textWidth / 2 + 2 * PADDING_X$5 + 22 + 98,
	            y: PADDING_Y$5 - 40,
	        });
	        Dom.attrs(copyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upchangeUrl = "../assets/change.svg";
	        const upchangeIcon = Dom.svg("image", {
	                href: upchangeUrl,
	            })
	            ;
	        Dom.attrs(upchangeIcon, {
	            class: "moreicon",
	            id: `UpChangeIcon-${step.id}`,
	            x: ICON_SIZE$6 + textWidth / 2 + 2 * PADDING_X$5 + 22 + 102,
	            y: PADDING_Y$5 - 37,
	            width: ICON_SIZE$6,
	            height: ICON_SIZE$6,
	        });
	        copyImgContainer.appendChild(copyImgContainerCircle);
	        copyImgContainer.appendChild(upchangeIcon);
	        const gRightPop3 = Dom.svg("g", {
	            class: `sqd-task-group right-popup sqd-hidden Collapsed`,
	        });
	        const gUpPop3 = Dom.svg("g", {
	            class: `sqd-task-group up-popup sqd-hidden Collapsed`,
	        });
	        //add reminder prompt
	        const gRightPop3Reminder = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder`,
	        });
	        const gRightPop3Reminder1 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const gRightPop3Reminder2 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const gRightPop3Reminder3 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const reminder1 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        Dom.attrs(reminder1, {
	            id: `reminder1${Date.now()}`,
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 82,
	            y: PADDING_Y$5 - 35,
	        });
	        const reminderText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 22 + 72.5,
	            y: PADDING_Y$5 - 23,
	        });
	        Dom.attrs(reminderText1, {
	            //class: 'sqd-hidden',
	            id: `reminderText${Date.now()}`,
	        });
	        reminderText1.textContent = "Edit";
	        const reminder2 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        Dom.attrs(reminder2, {
	            id: `reminder2${Date.now()}`,
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 22 + 75,
	            y: PADDING_Y$5,
	        });
	        const reminderText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 22 + 80,
	            y: PADDING_Y$5 + 12,
	        });
	        Dom.attrs(reminderText2, {
	            //class: 'sqd-hidden',
	            id: `reminderText2${Date.now()}`,
	        });
	        reminderText2.textContent = "Reset";
	        const reminder3 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        Dom.attrs(reminder3, {
	            id: `reminder3${Date.now()}`,
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 82,
	            y: PADDING_Y$5 + 35,
	        });
	        const reminderText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$6 + 4 * PADDING_X$5 + 2 * textWidth + 22 + 67,
	            y: PADDING_Y$5 + 47,
	        });
	        Dom.attrs(reminderText3, {
	            //class: 'sqd-hidden',
	            id: `reminderText3${Date.now()}`,
	        });
	        reminderText3.textContent = "Delete";
	        gRightPop3Reminder1.appendChild(reminderText1);
	        gRightPop3Reminder1.insertBefore(reminder1, reminderText1);
	        gRightPop3Reminder2.appendChild(reminderText2);
	        gRightPop3Reminder2.insertBefore(reminder2, reminderText2);
	        gRightPop3Reminder3.appendChild(reminderText3);
	        gRightPop3Reminder3.insertBefore(reminder3, reminderText3);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder1);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder2);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder3);
	        gRightPop3.appendChild(rightCopyImgContainer);
	        gRightPop3.appendChild(rightDeleteImgContainer);
	        gRightPop3.appendChild(rightEditImgContainer);
	        gUpPop3.appendChild(checkImgContainer);
	        gUpPop3.appendChild(deleteImgContainer);
	        gUpPop3.appendChild(copyImgContainer);
	        // ============ add dropdown =============
	        // =======================================
	        // ======= start with general node =======
	        const gDropdown = Dom.svg("g", {
	            class: `sqd-task-group dropdown sqd-hidden Collapsed`,
	        });
	        const rect1 = Dom.svg("rect", {
	            x: 5,
	            y: 53,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: 2.5 * boxHeight,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        Dom.attrs(rect1, {
	            id: `dropdown${Date.now()}`,
	        });
	        const nameText = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y,
	        });
	        Dom.attrs(nameText, {
	            //class: 'sqd-hidden',
	            id: `dropdownword${Date.now()}`,
	        });
	        const nameText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 13.3 * PADDING_X$5,
	            y: DROPDOWN_Y,
	        });
	        Dom.attrs(nameText1, {
	            //class: 'sqd-hidden',
	            id: `dropdownword1${Date.now()}`,
	        });
	        const nameText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 20.8 * PADDING_X$5,
	            y: DROPDOWN_Y,
	        });
	        Dom.attrs(nameText2, {
	            //class: 'sqd-hidden',
	            id: `dropdownword2${Date.now()}`,
	        });
	        const nameTextMain1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y + 15,
	        });
	        Dom.attrs(nameTextMain1, {
	            //class: 'sqd-hidden',
	            id: `dropdownwordmain1${Date.now()}`,
	        });
	        const nameTextMain2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: PADDING_X$5,
	            y: DROPDOWN_Y + 30,
	        });
	        Dom.attrs(nameTextMain2, {
	            //class: 'sqd-hidden',
	            id: `dropdownwordmain2${Date.now()}`,
	        });
	        nameText.textContent = "";
	        nameText1.textContent = "";
	        nameText2.textContent = "";
	        nameTextMain1.textContent = "";
	        nameTextMain2.textContent = "";
	        gDropdown.appendChild(nameText);
	        gDropdown.appendChild(nameText1);
	        gDropdown.appendChild(nameText2);
	        gDropdown.appendChild(nameTextMain1);
	        gDropdown.appendChild(nameTextMain2);
	        gDropdown.insertBefore(rect1, nameText);
	        // =============== gSubDropdown
	        const gSubDropdown = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
	        });
	        const gSubDropdown1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed`,
	        });
	        const gSubDropdown2 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed`,
	        });
	        const gSubDropdownMain1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed`,
	        });
	        const gSubDropdownMain2 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed`,
	        });
	        // =============== gSubDropdownbox
	        const gSubDropdownbox = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox`,
	        });
	        const gSubDropdownbox1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox`,
	        });
	        const gSubDropdownbox2 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox`,
	        });
	        const gSubDropdownboxMain1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox`,
	        });
	        const gSubDropdownboxMain2 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox`,
	        });
	        // ================== dropdownBoxShape
	        const dropdownBoxShape = Dom.svg("rect", {
	            width: 120,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y,
	        });
	        const dropdownBoxShape1 = Dom.svg("rect", {
	            width: 110,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: DROPDOWN_X2,
	            y: DROPDOWN_Y,
	        });
	        const dropdownBoxShape2 = Dom.svg("rect", {
	            width: 80,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: DROPDOWN_X3,
	            y: DROPDOWN_Y,
	        });
	        const dropdownBoxShapeMain1 = Dom.svg("rect", {
	            width: 120,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y + 15,
	        });
	        const dropdownBoxShapeMain2 = Dom.svg("rect", {
	            width: 120,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y + 30,
	        });
	        // ================= dropdownRightButton
	        const dropdownRightButton = Dom.svg("text", {
	            class: "sqd-task-text select-field",
	            x: DROPDOWN_X1 + 105,
	            y: DROPDOWN_Y + 8,
	        });
	        const dropdownRightButton1 = Dom.svg("text", {
	            class: "sqd-task-text select-field",
	            x: DROPDOWN_X2 + 95,
	            y: DROPDOWN_Y + 8,
	        });
	        const dropdownRightButton2 = Dom.svg("text", {
	            class: "sqd-task-text select-field",
	            x: DROPDOWN_X3 + 65,
	            y: DROPDOWN_Y + 8,
	        });
	        const dropdownRightButtonMain1 = Dom.svg("text", {
	            class: "sqd-task-text select-field",
	            x: DROPDOWN_X1 + 105,
	            y: DROPDOWN_Y + 23,
	        });
	        const dropdownRightButtonMain2 = Dom.svg("text", {
	            class: "sqd-task-text select-field",
	            x: DROPDOWN_X1 + 105,
	            y: DROPDOWN_Y + 38,
	        });
	        dropdownRightButton.textContent = "▼";
	        dropdownRightButton1.textContent = "▼";
	        dropdownRightButton2.textContent = "▼";
	        dropdownRightButtonMain1.textContent = "▼";
	        dropdownRightButtonMain2.textContent = "▼";
	        // ================= dropdownBoxInnerText
	        const dropdownBoxInnerText = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: DROPDOWN_X1 + 3,
	            y: DROPDOWN_Y + 7,
	        });
	        dropdownBoxInnerText.textContent = "Condition";
	        const dropdownBoxInnerText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: DROPDOWN_X2 + 3,
	            y: DROPDOWN_Y + 7,
	        });
	        dropdownBoxInnerText1.textContent = "";
	        const dropdownBoxInnerText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: DROPDOWN_X3 + 3,
	            y: DROPDOWN_Y + 7,
	        });
	        dropdownBoxInnerText2.textContent = "";
	        const dropdownBoxInnerTextMain1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: DROPDOWN_X1 + 3,
	            y: DROPDOWN_Y + 22,
	        });
	        dropdownBoxInnerTextMain1.textContent = "CONTACT INFO";
	        const dropdownBoxInnerTextMain2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: DROPDOWN_X1 + 3,
	            y: DROPDOWN_Y + 37,
	        });
	        dropdownBoxInnerTextMain2.textContent = "ACTIONS";
	        // ================== dropdownBoxShapeAfter
	        const dropdownBoxShapeAfter = Dom.svg("rect", {
	            width: 120,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y,
	            id: `dropdownBoxShape${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfter, {
	            opacity: 0,
	        });
	        const dropdownBoxShapeAfter1 = Dom.svg("rect", {
	            width: 110,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: DROPDOWN_X2,
	            y: DROPDOWN_Y,
	            id: `dropdownBoxShapeAfter1${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfter1, {
	            opacity: 0,
	        });
	        const dropdownBoxShapeAfter2 = Dom.svg("rect", {
	            width: 80,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: DROPDOWN_X3,
	            y: DROPDOWN_Y,
	            id: `dropdownBoxShapeAfter2${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfter2, {
	            opacity: 0,
	        });
	        const dropdownBoxShapeAfterMain1 = Dom.svg("rect", {
	            width: 120,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y + 15,
	            id: `dropdownBoxShapeMain1${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfterMain1, {
	            opacity: 0,
	        });
	        const dropdownBoxShapeAfterMain2 = Dom.svg("rect", {
	            width: 120,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y + 30,
	            id: `dropdownBoxShapeMain2${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfterMain2, {
	            opacity: 0,
	        });
	        // Iterate thourgh list items and create options
	        // Sub dropdown menues
	        const gSubDropdownboxPop = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const gSubDropdownbox1Pop = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const gSubDropdownbox2Pop = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const gSubDropdownboxPopMain1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const gSubDropdownboxPopMain2 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        // =================== Dropdown item lists 
	        let list1 = [''];
	        let contInfo = ['Tag', 'Email Address', 'Gender', 'First Name', 'Last Name', 'Full Name', 'Phone Number', 'Birthday', 'Location'];
	        let actions = ['Opened', 'Not Opened', 'Clicked', 'Not Clicked'];
	        let list2 = [''];
	        let list2Tag = ['Exists', 'Does not exist'];
	        let list2Gender = ['is'];
	        let list2Bd = ['Month is', 'Date is', 'is before date', 'is After date', 'is Blank'];
	        let list2Email = ['Contains', 'Does not contain', 'is Blank'];
	        let list2Loc = ['Is Within', 'Is Not Within', 'Is in Country', 'Is not in Country', 'Is in US state', 'Is not in US state'];
	        let list3 = [''];
	        let list3Tag = ['Tag A', 'Tag B'];
	        let list3Gender = ['Male', 'Female', 'Non-binary', 'Blank'];
	        let list3Bdm = ['Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	        let list3LocWithin = [25, 50, 75, 100, 150, 200];
	        let list3Ctry = ['United States', 'Canada', 'United Kingdom', 'France', 'German', 'Italy', '...'];
	        let list3Actions = ['Campaign A', 'Campaign B', 'Campaign C'];
	        let choice1 = "";
	        let choice2 = "";
	        const emailIn = Dom.element('input', {
	            class: 'sqd-email-input',
	            type: 'text',
	            placeholder: 'Email address',
	        });
	        let list3Email = [emailIn];
	        // ============ 1st dropdown
	        for (let i = 1; i <= list1.length; i++) {
	            Dom.svg("rect", {
	                width: 120,
	                height: 15,
	                class: "option select-field",
	                fill: "#fff",
	                stroke: "#a0a0a0",
	                x: DROPDOWN_X1,
	                y: DROPDOWN_Y + 15 * i,
	            });
	            const dropdownBoxBottomShapeText = Dom.svg("text", {
	                class: "sqd-task-text",
	                x: DROPDOWN_X1 + 2,
	                y: DROPDOWN_Y + 5 + 15 * i,
	            });
	            dropdownBoxBottomShapeText.textContent = list1[i - 1];
	            const dropdownBoxBottomShapecover = Dom.svg("rect", {
	                width: 120,
	                height: 15,
	                class: "option select-field choice",
	                fill: "#fff",
	                stroke: "#a0a0a0",
	                x: DROPDOWN_X1,
	                y: DROPDOWN_Y + 15 * i,
	                id: `dropdownBoxBottomShapecover${Date.now()}`,
	            });
	            Dom.attrs(dropdownBoxBottomShapecover, {
	                opacity: 0.3,
	            });
	        }
	        // ================ CONTACT INFO dropdown
	        for (let i = 1; i <= contInfo.length; i++) {
	            const dropdownBoxBottomShapeMain1 = Dom.svg("rect", {
	                width: 120,
	                height: 15,
	                class: "option select-field",
	                fill: "#fff",
	                stroke: "#a0a0a0",
	                x: DROPDOWN_X1,
	                y: DROPDOWN_Y + 15 + 15 * i,
	            });
	            const dropdownBoxBottomShapeTextMain1 = Dom.svg("text", {
	                class: "sqd-task-text",
	                x: DROPDOWN_X1 + 2,
	                y: DROPDOWN_Y + 15 + 5 + 15 * i,
	            });
	            dropdownBoxBottomShapeTextMain1.textContent = contInfo[i - 1];
	            const dropdownBoxBottomShapecoverMain1 = Dom.svg("rect", {
	                width: 120,
	                height: 15,
	                class: "option select-field choice",
	                fill: "#fff",
	                stroke: "#a0a0a0",
	                x: DROPDOWN_X1,
	                y: DROPDOWN_Y + 15 + 15 * i,
	                id: `dropdownBoxBottomShapecoverMain1${Date.now()}`,
	            });
	            Dom.attrs(dropdownBoxBottomShapecoverMain1, {
	                opacity: 0.3,
	            });
	            dropdownBoxBottomShapecoverMain1.addEventListener("click", function (e) {
	                choice1 = dropdownBoxBottomShapeTextMain1.textContent;
	                gSubDropdownboxPopMain1.classList.toggle("sqd-hidden");
	                gSubDropdownMain1.classList.toggle("sqd-hidden");
	                gSubDropdownMain2.classList.toggle("sqd-hidden");
	                gSubDropdown1.classList.remove('sqd-hidden');
	                gSubDropdown2.classList.remove('sqd-hidden');
	                dropdownBoxInnerText.textContent = dropdownBoxBottomShapeTextMain1.textContent;
	                if (choice1 == 'Tag') {
	                    list2 = list2Tag;
	                }
	                else if (choice1 == 'Gender') {
	                    list2 = list2Gender;
	                }
	                else if (choice1 == 'Birthday') {
	                    list2 = list2Bd;
	                }
	                else if (choice1 == 'Email Address') {
	                    list2 = list2Email;
	                }
	                else if (choice1 == 'Location') {
	                    list2 = list2Loc;
	                }
	                // ===================== 2nd dropdown
	                for (let i = 1; i <= list2.length; i++) {
	                    const dropdownBoxBottomShape1 = Dom.svg("rect", {
	                        width: 110,
	                        height: 15,
	                        class: "option select-field",
	                        fill: "#fff",
	                        stroke: "#a0a0a0",
	                        x: DROPDOWN_X2,
	                        y: DROPDOWN_Y + 15 * i,
	                    });
	                    const dropdownBoxBottomShape1Text = Dom.svg("text", {
	                        class: "sqd-task-text",
	                        x: DROPDOWN_X2 + 2,
	                        y: DROPDOWN_Y + 5 + 15 * i,
	                    });
	                    dropdownBoxBottomShape1Text.textContent = list2[i - 1];
	                    const dropdownBoxBottomShape1cover = Dom.svg("rect", {
	                        width: 110,
	                        height: 15,
	                        class: "option select-field choice",
	                        fill: "#fff",
	                        stroke: "#a0a0a0",
	                        x: DROPDOWN_X2,
	                        y: DROPDOWN_Y + 15 * i,
	                        id: `dropdownBoxBottomShape1cover${Date.now()}`,
	                    });
	                    Dom.attrs(dropdownBoxBottomShape1cover, {
	                        opacity: 0.3,
	                    });
	                    // Add event listners for 2nd dropdowns 
	                    dropdownBoxBottomShape1cover.addEventListener("click", function (e) {
	                        dropdownBoxInnerText1.textContent = dropdownBoxBottomShape1Text.textContent;
	                        gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
	                        choice2 = dropdownBoxInnerText1.textContent;
	                        if (choice2 == 'Exists' || choice2 == 'Does not exist') {
	                            list3 = list3Tag;
	                        }
	                        else if (choice2 == 'is') {
	                            list3 = list3Gender;
	                        }
	                        else if (choice2 == 'Month is') {
	                            list3 = list3Bdm;
	                        }
	                        else if (choice2 == 'Date is') {
	                            list3 = [1, 2, 3];
	                        }
	                        else if (choice2 == 'Is Within' || choice2 == 'Is Not Within') {
	                            list3 = list3LocWithin;
	                        }
	                        else if (choice2 == 'Is in Country' || choice2 == 'Is not in Country') {
	                            list3 = list3Ctry;
	                        }
	                        else if (choice2 == 'Contains' || choice2 == 'Does not contain') {
	                            list3 = list3Email;
	                        }
	                        // ======================== 3rd dropdowns 
	                        for (let i = 1; i <= list3.length; i++) {
	                            const dropdownBoxBottomShape2 = Dom.svg("rect", {
	                                width: 80,
	                                height: 15,
	                                class: "option select-field",
	                                fill: "#fff",
	                                stroke: "#a0a0a0",
	                                x: DROPDOWN_X3,
	                                y: DROPDOWN_Y + 15 * i,
	                            });
	                            const dropdownBoxBottomShape2Text = Dom.svg("text", {
	                                class: "sqd-task-text",
	                                x: DROPDOWN_X3 + 2,
	                                y: DROPDOWN_Y + 5 + 15 * i,
	                            });
	                            dropdownBoxBottomShape2Text.textContent = list3[i - 1];
	                            const dropdownBoxBottomShape2cover = Dom.svg("rect", {
	                                width: 80,
	                                height: 15,
	                                class: "option select-field choice",
	                                fill: "#fff",
	                                stroke: "#a0a0a0",
	                                x: DROPDOWN_X3,
	                                y: DROPDOWN_Y + 15 * i,
	                                id: `dropdownBoxBottomShape2cover${Date.now()}`,
	                            });
	                            Dom.attrs(dropdownBoxBottomShape2cover, {
	                                opacity: 0.3,
	                            });
	                            // Add event listners for 3rd dropdown 
	                            dropdownBoxBottomShape2cover.addEventListener("click", function (e) {
	                                dropdownBoxInnerText2.textContent = dropdownBoxBottomShape2Text.textContent;
	                                gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
	                            });
	                            // Append Child 3rd 
	                            gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2Text);
	                            gSubDropdownbox2Pop.insertBefore(dropdownBoxBottomShape2, dropdownBoxBottomShape2Text);
	                            gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2cover);
	                        }
	                    });
	                    // Append Child 2nd 
	                    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text);
	                    gSubDropdownbox1Pop.insertBefore(dropdownBoxBottomShape1, dropdownBoxBottomShape1Text);
	                    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1cover);
	                }
	            });
	            // Append Child CONTACT INFO  
	            gSubDropdownboxPopMain1.appendChild(dropdownBoxBottomShapeTextMain1);
	            gSubDropdownboxPopMain1.insertBefore(dropdownBoxBottomShapeMain1, dropdownBoxBottomShapeTextMain1);
	            gSubDropdownboxPopMain1.appendChild(dropdownBoxBottomShapecoverMain1);
	        }
	        // ================ ACTIONS dropdown
	        for (let i = 1; i <= actions.length; i++) {
	            const dropdownBoxBottomShapeMain2 = Dom.svg("rect", {
	                width: 120,
	                height: 15,
	                class: "option select-field",
	                fill: "#fff",
	                stroke: "#a0a0a0",
	                x: DROPDOWN_X1,
	                y: DROPDOWN_Y + 30 + 15 * i,
	            });
	            const dropdownBoxBottomShapeTextMain2 = Dom.svg("text", {
	                class: "sqd-task-text",
	                x: DROPDOWN_X1 + 2,
	                y: DROPDOWN_Y + 30 + 5 + 15 * i,
	            });
	            dropdownBoxBottomShapeTextMain2.textContent = actions[i - 1];
	            const dropdownBoxBottomShapecoverMain2 = Dom.svg("rect", {
	                width: 120,
	                height: 15,
	                class: "option select-field choice",
	                fill: "#fff",
	                stroke: "#a0a0a0",
	                x: DROPDOWN_X1,
	                y: DROPDOWN_Y + 30 + 15 * i,
	                id: `dropdownBoxBottomShapecoverMain2${Date.now()}`,
	            });
	            Dom.attrs(dropdownBoxBottomShapecoverMain2, {
	                opacity: 0.3,
	            });
	            dropdownBoxBottomShapecoverMain2.addEventListener("click", function (e) {
	                choice1 = dropdownBoxBottomShapeTextMain2.textContent;
	                gSubDropdownboxPopMain2.classList.toggle("sqd-hidden");
	                gSubDropdownMain1.classList.toggle("sqd-hidden");
	                gSubDropdownMain2.classList.toggle("sqd-hidden");
	                dropdownBoxInnerText.textContent = dropdownBoxBottomShapeTextMain2.textContent;
	                gSubDropdown1.classList.add('sqd-hidden');
	                gSubDropdown2.classList.remove('sqd-hidden');
	                if (choice1 == 'Opened' || choice2 == 'Not Opened' || choice2 == 'Clicked' || choice2 == 'Not Clicked') {
	                    list3 = list3Actions;
	                }
	                // ======================== 3rd dropdowns 
	                for (let i = 1; i <= list3.length; i++) {
	                    const dropdownBoxBottomShape2 = Dom.svg("rect", {
	                        width: 80,
	                        height: 15,
	                        class: "option select-field",
	                        fill: "#fff",
	                        stroke: "#a0a0a0",
	                        x: DROPDOWN_X3,
	                        y: DROPDOWN_Y + 15 * i,
	                    });
	                    const dropdownBoxBottomShape2Text = Dom.svg("text", {
	                        class: "sqd-task-text",
	                        x: DROPDOWN_X3 + 2,
	                        y: DROPDOWN_Y + 5 + 15 * i,
	                    });
	                    dropdownBoxBottomShape2Text.textContent = list3[i - 1];
	                    const dropdownBoxBottomShape2cover = Dom.svg("rect", {
	                        width: 80,
	                        height: 15,
	                        class: "option select-field choice",
	                        fill: "#fff",
	                        stroke: "#a0a0a0",
	                        x: DROPDOWN_X3,
	                        y: DROPDOWN_Y + 15 * i,
	                        id: `dropdownBoxBottomShape2cover${Date.now()}`,
	                    });
	                    Dom.attrs(dropdownBoxBottomShape2cover, {
	                        opacity: 0.3,
	                    });
	                    // Add event listners for 3rd dropdown 
	                    dropdownBoxBottomShape2cover.addEventListener("click", function (e) {
	                        dropdownBoxInnerText2.textContent = dropdownBoxBottomShape2Text.textContent;
	                        gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
	                    });
	                    // Append Child 3rd 
	                    gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2Text);
	                    gSubDropdownbox2Pop.insertBefore(dropdownBoxBottomShape2, dropdownBoxBottomShape2Text);
	                    gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2cover);
	                }
	            });
	            // Append Child ACTIONS
	            gSubDropdownboxPopMain2.appendChild(dropdownBoxBottomShapeTextMain2);
	            gSubDropdownboxPopMain2.insertBefore(dropdownBoxBottomShapeMain2, dropdownBoxBottomShapeTextMain2);
	            gSubDropdownboxPopMain2.appendChild(dropdownBoxBottomShapecoverMain2);
	        }
	        // =================== Append
	        gSubDropdownbox.appendChild(dropdownRightButton);
	        gSubDropdownbox1.appendChild(dropdownRightButton1);
	        gSubDropdownbox2.appendChild(dropdownRightButton2);
	        gSubDropdownboxMain1.appendChild(dropdownRightButtonMain1);
	        gSubDropdownboxMain2.appendChild(dropdownRightButtonMain2);
	        gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownRightButton);
	        gSubDropdownbox1.insertBefore(dropdownBoxShape1, dropdownRightButton1);
	        gSubDropdownbox2.insertBefore(dropdownBoxShape2, dropdownRightButton2);
	        gSubDropdownboxMain1.insertBefore(dropdownBoxShapeMain1, dropdownRightButtonMain1);
	        gSubDropdownboxMain2.insertBefore(dropdownBoxShapeMain2, dropdownRightButtonMain2);
	        gSubDropdownbox.appendChild(dropdownBoxInnerText);
	        gSubDropdownbox1.appendChild(dropdownBoxInnerText1);
	        gSubDropdownbox2.appendChild(dropdownBoxInnerText2);
	        gSubDropdownboxMain1.appendChild(dropdownBoxInnerTextMain1);
	        gSubDropdownboxMain2.appendChild(dropdownBoxInnerTextMain2);
	        gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
	        gSubDropdownbox1.appendChild(dropdownBoxShapeAfter1);
	        gSubDropdownbox2.appendChild(dropdownBoxShapeAfter2);
	        gSubDropdownboxMain1.appendChild(dropdownBoxShapeAfterMain1);
	        gSubDropdownboxMain2.appendChild(dropdownBoxShapeAfterMain2);
	        gSubDropdown.appendChild(gSubDropdownbox);
	        gSubDropdown.appendChild(gSubDropdownboxPop);
	        gSubDropdown1.appendChild(gSubDropdownbox1);
	        gSubDropdown1.appendChild(gSubDropdownbox1Pop);
	        gSubDropdown2.appendChild(gSubDropdownbox2);
	        gSubDropdown2.appendChild(gSubDropdownbox2Pop);
	        gSubDropdownMain1.appendChild(gSubDropdownboxMain1);
	        gSubDropdownMain1.appendChild(gSubDropdownboxPopMain1);
	        gSubDropdownMain2.appendChild(gSubDropdownboxMain2);
	        gSubDropdownMain2.appendChild(gSubDropdownboxPopMain2);
	        gDropdown.appendChild(gSubDropdownMain2);
	        gDropdown.appendChild(gSubDropdownMain1);
	        gDropdown.appendChild(gSubDropdown2);
	        gDropdown.appendChild(gSubDropdown1);
	        gDropdown.appendChild(gSubDropdown);
	        g1.appendChild(moreIcon);
	        g.appendChild(g1);
	        g.appendChild(gRightPop3);
	        g.appendChild(gDropdown);
	        g.appendChild(gRightPop3Reminder);
	        g.appendChild(gUpPop3);
	        g.appendChild(setUpReminder);
	        // ========== Add EventListeners for "More" icon 
	        moreIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gRightPop3.classList.toggle("sqd-hidden");
	        });
	        // ========================= Edit
	        editIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            gSubDropdown.classList.toggle("sqd-hidden");
	            gSubDropdown1.classList.toggle("sqd-hidden");
	            gSubDropdown2.classList.toggle("sqd-hidden");
	            gSubDropdownMain1.classList.toggle("sqd-hidden");
	            gSubDropdownMain2.classList.toggle("sqd-hidden");
	        });
	        upCheckIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gDropdown.classList.toggle("sqd-hidden");
	            gSubDropdown.classList.toggle("sqd-hidden");
	            gSubDropdown1.classList.toggle("sqd-hidden");
	            gSubDropdown2.classList.toggle("sqd-hidden");
	            gSubDropdownMain1.classList.toggle("sqd-hidden");
	            gSubDropdownMain2.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            // =============== Add properties
	            if (dropdownBoxInnerText.textContent && dropdownBoxInnerText.textContent != "Condition") {
	                textRight.textContent = dropdownBoxInnerText.textContent;
	                step.properties["property"] = dropdownBoxInnerText.textContent;
	            }
	            if (dropdownBoxInnerText1.textContent && dropdownBoxInnerText1.textContent != "") {
	                textRight.textContent = dropdownBoxInnerText.textContent;
	                step.properties["condition"] = dropdownBoxInnerText1.textContent;
	            }
	            if (dropdownBoxInnerText2.textContent && dropdownBoxInnerText2.textContent != "") {
	                textRight.textContent = dropdownBoxInnerText2.textContent;
	                step.properties["value"] = dropdownBoxInnerText2.textContent;
	            }
	        });
	        // Event listeners in Dropdown
	        dropdownBoxShapeAfter.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gSubDropdownMain1.classList.toggle("sqd-hidden");
	            gSubDropdownMain2.classList.toggle("sqd-hidden");
	            if (!gSubDropdownMain1.classList.contains("sqd-hidden") &&
	                !gSubDropdownMain2.classList.contains("sqd-hidden")) {
	                gSubDropdownMain1.classList.remove("sqd-hidden");
	                gSubDropdownMain2.classList.remove("sqd-hidden");
	            }
	        });
	        dropdownBoxShapeAfter1.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
	            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPop.classList.remove("sqd-hidden");
	            }
	        });
	        dropdownBoxShapeAfter2.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
	            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPop.classList.remove("sqd-hidden");
	            }
	        });
	        dropdownBoxShapeAfterMain1.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gSubDropdownboxPopMain1.classList.toggle("sqd-hidden");
	            if (!gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPopMain1.classList.remove("sqd-hidden");
	            }
	        });
	        dropdownBoxShapeAfterMain2.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gSubDropdownboxPopMain2.classList.toggle("sqd-hidden");
	            if (!gSubDropdownboxPopMain2.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPopMain2.classList.remove("sqd-hidden");
	            }
	        });
	        JoinView.createStraightJoin(g, new Vector(containerWidths[0], 0), PADDING_TOP + boxHeight);
	        JoinView.createJoins(g, new Vector(containerWidths[0], PADDING_TOP + LABEL_HEIGHT + boxHeight / 2), containerOffsets.map((o, i) => new Vector(o + joinXs[i] + PADDING_X$5, PADDING_TOP + LABEL_HEIGHT + CONNECTION_HEIGHT + boxHeight / 2)));
	        const inputView = InputView.createRoundInput(g, containerWidths[0], 0);
	        const regionView = RegionView.create(g, containerWidths, containerHeight);
	        const validationErrorView = ValidationErrorView.create(g, containersWidth, 0);
	        return new SwitchStepComponentView(g, containersWidth, containerHeight, containerWidths[0], sequenceComponents, regionView, inputView, validationErrorView
	        // icon1,
	        // icon2,
	        // icon3
	        );
	    }
	    getClientPosition() {
	        return this.regionView.getClientPosition();
	    }
	    containsElement(element) {
	        return this.g.contains(element);
	    }
	    setIsDragging(isDragging) {
	        this.inputView.setIsHidden(isDragging);
	    }
	    setIsSelected(isSelected) {
	        this.regionView.setIsSelected(isSelected);
	    }
	    setIsDisabled(isDisabled) {
	        Dom.toggleClass(this.g, isDisabled, "sqd-disabled");
	    }
	    setIsValid(isValid) {
	        this.validationErrorView.setIsHidden(isValid);
	    }
	}
	// export {condition_type as ct, condition as cd, requirement as rq, value as vl};

	class SwitchStepComponent {
	    constructor(view, step, parentSequence, configuration) {
	        this.view = view;
	        this.step = step;
	        this.parentSequence = parentSequence;
	        this.configuration = configuration;
	        this.currentState = StepComponentState.default;
	    }
	    static create(parent, step, parentSequence, configuration) {
	        const view = SwitchStepComponentView.create(parent, step, configuration);
	        return new SwitchStepComponent(view, step, parentSequence, configuration);
	    }
	    findByElement(element) {
	        for (const sequence of this.view.sequenceComponents) {
	            const sc = sequence.findByElement(element);
	            if (sc) {
	                return sc;
	            }
	        }
	        if (this.view.containsElement(element)) {
	            return this;
	        }
	        return null;
	    }
	    findById(stepId) {
	        if (this.step.id === stepId) {
	            return this;
	        }
	        for (const sequence of this.view.sequenceComponents) {
	            const sc = sequence.findById(stepId);
	            if (sc) {
	                return sc;
	            }
	        }
	        return null;
	    }
	    getPlaceholders(result) {
	        if (this.currentState !== StepComponentState.dragging) {
	            this.view.sequenceComponents.forEach(sc => sc.getPlaceholders(result));
	        }
	    }
	    setIsDragging(isDragging) {
	        if (this.currentState !== StepComponentState.dragging) {
	            this.view.sequenceComponents.forEach(s => s.setIsDragging(isDragging));
	        }
	        this.view.setIsDragging(isDragging);
	    }
	    setState(state) {
	        this.currentState = state;
	        switch (state) {
	            case StepComponentState.default:
	                this.view.setIsSelected(false);
	                this.view.setIsDisabled(false);
	                break;
	            case StepComponentState.selected:
	                this.view.setIsSelected(true);
	                this.view.setIsDisabled(false);
	                break;
	            case StepComponentState.dragging:
	                this.view.setIsSelected(false);
	                this.view.setIsDisabled(true);
	                break;
	        }
	    }
	    validate() {
	        const isValid = this.configuration.validator ? this.configuration.validator(this.step) : true;
	        this.view.setIsValid(isValid);
	        let areChildrenValid = true;
	        for (const component of this.view.sequenceComponents) {
	            areChildrenValid = component.validate() && areChildrenValid;
	        }
	        return isValid && areChildrenValid;
	    }
	}

	const OUTPUT_SIZE = 5;
	class OutputView {
	    constructor(root) {
	        this.root = root;
	    }
	    static create(parent, x, y) {
	        const circle = Dom.svg('circle', {
	            class: 'sqd-output',
	            cx: x,
	            cy: y,
	            r: OUTPUT_SIZE
	        });
	        parent.appendChild(circle);
	        return new OutputView(circle);
	    }
	    setIsHidden(isHidden) {
	        Dom.attrs(this.root, {
	            visibility: isHidden ? 'hidden' : 'visible'
	        });
	    }
	}

	const PADDING_X$4 = 12;
	const PADDING_Y$4 = 10;
	const MIN_TEXT_WIDTH$4 = 70;
	const ICON_SIZE$5 = 22;
	const RECT_RADIUS$4 = 15;
	class TriggerComponentView {
	    constructor(g, width, height, joinX, rect, inputView, outputView, validationErrorView) {
	        this.g = g;
	        this.width = width;
	        this.height = height;
	        this.joinX = joinX;
	        this.rect = rect;
	        this.inputView = inputView;
	        this.outputView = outputView;
	        this.validationErrorView = validationErrorView;
	    }
	    static create(parent, step, configuration) {
	        const g = Dom.svg("g", {
	            class: `sqd-task-group sqd-type-${step.type}`,
	        });
	        parent.appendChild(g);
	        const boxHeight = ICON_SIZE$5 + PADDING_Y$4;
	        const text = Dom.svg("text", {
	            x: PADDING_X$4 / 1.5,
	            y: boxHeight / 1.7,
	            class: "sqd-task-text",
	        });
	        text.textContent = step.name;
	        g.appendChild(text);
	        const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH$4);
	        const boxWidth = ICON_SIZE$5 + 8 * PADDING_X$4 + 2 * textWidth;
	        const rect = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: boxHeight,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        g.insertBefore(rect, text);
	        const rectLeft = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: textWidth + 5,
	            height: boxHeight,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        const textRight = Dom.svg("text", {
	            x: ICON_SIZE$5 + 3 * PADDING_X$4 + textWidth - 10,
	            y: boxHeight / 1.7,
	            class: "sqd-task-text",
	        });
	        if (step.properties["list"]) {
	            textRight.textContent = step.properties["list"].toString();
	        }
	        else {
	            textRight.textContent = "Default list";
	        }
	        g.appendChild(textRight);
	        g.insertBefore(rectLeft, text);
	        g.appendChild(textRight);
	        const textRightReminder = Dom.svg("text", {
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 132,
	            y: boxHeight / 2,
	            class: "sqd-task-text",
	        });
	        textRightReminder.textContent = "Please set up your filter";
	        const rectRight = Dom.svg("rect", {
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 80,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: 2 * boxHeight,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        const rectRightLine = Dom.svg("line", {
	            class: "sqd-join",
	            x1: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 50,
	            x2: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 81,
	            y1: 15,
	            y2: 15,
	        });
	        const clickOkBut = Dom.svg("rect", {
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 182,
	            y: 1.25 * boxHeight,
	            class: "sqd-task-rect",
	            width: 40,
	            height: 20,
	            rx: 5,
	            ry: 5,
	        });
	        const clickOkButCover = Dom.svg("rect", {
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 182,
	            y: 1.25 * boxHeight,
	            class: "option select-field choice",
	            width: 40,
	            height: 20,
	            rx: 5,
	            ry: 5,
	            id: `clickOkButCover${Date.now()}`,
	        });
	        Dom.attrs(clickOkButCover, {
	            opacity: 0.1,
	        });
	        const clickOkText = Dom.svg("text", {
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 192,
	            y: 1.55 * boxHeight,
	            class: "sqd-task-text",
	        });
	        clickOkText.textContent = "OK";
	        const setUpReminder = Dom.svg("g", {
	            class: `sqd-task-group setup-reminder sqd-hidden`,
	        });
	        setUpReminder.appendChild(rectRightLine);
	        setUpReminder.appendChild(textRightReminder);
	        setUpReminder.insertBefore(rectRight, textRightReminder);
	        setUpReminder.appendChild(clickOkText);
	        setUpReminder.insertBefore(clickOkBut, clickOkText);
	        setUpReminder.appendChild(clickOkButCover);
	        const moreUrl = "../assets/more.svg";
	        const moreIcon = Dom.svg("image", {
	                href: moreUrl,
	            })
	            ;
	        Dom.attrs(moreIcon, {
	            class: "moreIcon",
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 22,
	            y: 5,
	            width: ICON_SIZE$5,
	            height: ICON_SIZE$5,
	        });
	        const rightCopyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightCopyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 60,
	            y: PADDING_Y$4 - 6,
	        });
	        Dom.attrs(rightCopyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const changeUrl = "../assets/change.svg";
	        const changeIcon = Dom.svg("image", {
	                href: changeUrl,
	            })
	            ;
	        Dom.attrs(changeIcon, {
	            class: "moreicon",
	            id: `RightChangeIcon-${step.id}`,
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 64,
	            y: PADDING_Y$4 - 2,
	            width: ICON_SIZE$5,
	            height: ICON_SIZE$5,
	        });
	        rightCopyImgContainer.appendChild(rightCopyImgContainerCircle);
	        rightCopyImgContainer.appendChild(changeIcon);
	        const rightDeleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightDeleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 46,
	            y: PADDING_Y$4 + 27,
	        });
	        Dom.attrs(rightDeleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const deleteUrl = "../assets/delete.svg";
	        const deleteIcon = Dom.svg("image", {
	                href: deleteUrl,
	            })
	            ;
	        Dom.attrs(deleteIcon, {
	            class: "moreicon",
	            id: `RightDeleteIcon-${step.id}`,
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 50,
	            y: PADDING_Y$4 + 30,
	            width: 22,
	            height: 22,
	        });
	        rightDeleteImgContainer.appendChild(rightDeleteImgContainerCircle);
	        rightDeleteImgContainer.appendChild(deleteIcon);
	        const rightEditImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightEditImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 50,
	            y: PADDING_Y$4 - 40,
	        });
	        Dom.attrs(rightEditImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const editUrl = "../assets/edit.svg";
	        const editIcon = Dom.svg("image", {
	                href: editUrl,
	            })
	            ;
	        Dom.attrs(editIcon, {
	            class: "moreicon",
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 53,
	            y: PADDING_Y$4 - 36,
	            width: ICON_SIZE$5,
	            height: ICON_SIZE$5,
	        });
	        rightEditImgContainer.appendChild(rightEditImgContainerCircle);
	        rightEditImgContainer.appendChild(editIcon);
	        const checkImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const checkImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$5 + textWidth / 2 + 2 * PADDING_X$4 + 89,
	            y: PADDING_Y$4 - 40,
	        });
	        Dom.attrs(checkImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCheckIconUrl = "../assets/check.svg";
	        const upCheckIcon = Dom.svg("image", {
	                href: upCheckIconUrl,
	            })
	            ;
	        Dom.attrs(upCheckIcon, {
	            class: "moreicon",
	            // id: `tagUpCheckIcon`,
	            x: ICON_SIZE$5 + textWidth / 2 + 2 * PADDING_X$4 + 93,
	            y: PADDING_Y$4 - 37,
	            width: 22,
	            height: 22,
	        });
	        checkImgContainer.appendChild(checkImgContainerCircle);
	        checkImgContainer.appendChild(upCheckIcon);
	        const deleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const deleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$5 + textWidth / 2 + 2 * PADDING_X$4 + 41 + 110,
	            y: PADDING_Y$4 - 40,
	        });
	        Dom.attrs(deleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upDeleteIconUrl = "../assets/delete.svg";
	        const upDeleteIcon = Dom.svg("image", {
	                href: upDeleteIconUrl,
	            })
	            ;
	        Dom.attrs(upDeleteIcon, {
	            class: "moreicon",
	            id: `UpDeleteIcon-${step.id}`,
	            x: ICON_SIZE$5 + textWidth / 2 + 2 * PADDING_X$4 + 44 + 110,
	            y: PADDING_Y$4 - 37,
	            width: ICON_SIZE$5,
	            height: ICON_SIZE$5,
	        });
	        deleteImgContainer.appendChild(deleteImgContainerCircle);
	        deleteImgContainer.appendChild(upDeleteIcon);
	        const copyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const copyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$5 + textWidth / 2 + 2 * PADDING_X$4 + 22 + 98,
	            y: PADDING_Y$4 - 40,
	        });
	        Dom.attrs(copyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upchangeUrl = "../assets/change.svg";
	        const upchangeIcon = Dom.svg("image", {
	                href: upchangeUrl,
	            })
	            ;
	        Dom.attrs(upchangeIcon, {
	            class: "moreicon",
	            id: `UpChangeIcon-${step.id}`,
	            x: ICON_SIZE$5 + textWidth / 2 + 2 * PADDING_X$4 + 22 + 102,
	            y: PADDING_Y$4 - 37,
	            width: ICON_SIZE$5,
	            height: ICON_SIZE$5,
	        });
	        copyImgContainer.appendChild(copyImgContainerCircle);
	        copyImgContainer.appendChild(upchangeIcon);
	        const gRightPop3 = Dom.svg("g", {
	            class: `sqd-task-group right-popup sqd-hidden Collapsed`,
	        });
	        const gUpPop3 = Dom.svg("g", {
	            class: `sqd-task-group up-popup sqd-hidden Collapsed`,
	        });
	        //add reminder prompt
	        const gRightPop3Reminder = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder`,
	        });
	        const gRightPop3Reminder1 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const gRightPop3Reminder2 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const gRightPop3Reminder3 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const reminder1 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        Dom.attrs(reminder1, {
	            id: `reminder1${Date.now()}`,
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 82,
	            y: PADDING_Y$4 - 35,
	        });
	        const reminderText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 22 + 72.5,
	            y: PADDING_Y$4 - 23,
	        });
	        Dom.attrs(reminderText1, {
	            //class: 'sqd-hidden',
	            id: `reminderText${Date.now()}`,
	        });
	        reminderText1.textContent = "Edit";
	        const reminder2 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        Dom.attrs(reminder2, {
	            id: `reminder2${Date.now()}`,
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 22 + 75,
	            y: PADDING_Y$4,
	        });
	        const reminderText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 22 + 80,
	            y: PADDING_Y$4 + 12,
	        });
	        Dom.attrs(reminderText2, {
	            //class: 'sqd-hidden',
	            id: `reminderText2${Date.now()}`,
	        });
	        reminderText2.textContent = "Reset";
	        const reminder3 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        Dom.attrs(reminder3, {
	            id: `reminder3${Date.now()}`,
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 82,
	            y: PADDING_Y$4 + 35,
	        });
	        const reminderText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$5 + 4 * PADDING_X$4 + 2 * textWidth + 22 + 67,
	            y: PADDING_Y$4 + 47,
	        });
	        Dom.attrs(reminderText3, {
	            //class: 'sqd-hidden',
	            id: `reminderText3${Date.now()}`,
	        });
	        reminderText3.textContent = "Delete";
	        gRightPop3Reminder1.appendChild(reminderText1);
	        gRightPop3Reminder1.insertBefore(reminder1, reminderText1);
	        gRightPop3Reminder2.appendChild(reminderText2);
	        gRightPop3Reminder2.insertBefore(reminder2, reminderText2);
	        gRightPop3Reminder3.appendChild(reminderText3);
	        gRightPop3Reminder3.insertBefore(reminder3, reminderText3);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder1);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder2);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder3);
	        gRightPop3.appendChild(rightCopyImgContainer);
	        gRightPop3.appendChild(rightDeleteImgContainer);
	        gRightPop3.appendChild(rightEditImgContainer);
	        gUpPop3.appendChild(checkImgContainer);
	        gUpPop3.appendChild(deleteImgContainer);
	        gUpPop3.appendChild(copyImgContainer);
	        //add dropdown
	        //**************************************************//
	        //***********start with general node****************//
	        const gDropdown = Dom.svg("g", {
	            class: `sqd-task-group dropdown sqd-hidden Collapsed`,
	        });
	        const rect1 = Dom.svg("rect", {
	            x: 0.5,
	            y: boxHeight,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: 2.5 * boxHeight,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        Dom.attrs(rect1, {
	            id: `dropdown${Date.now()}`,
	        });
	        const nameText = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: PADDING_X$4,
	            y: 1.5 * boxHeight,
	        });
	        Dom.attrs(nameText, {
	            //class: 'sqd-hidden',
	            id: `dropdownword1${Date.now()}`,
	        });
	        const nameText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: PADDING_X$4,
	            y: 2 * boxHeight,
	        });
	        Dom.attrs(nameText1, {
	            //class: 'sqd-hidden',
	            id: `dropdownword2${Date.now()}`,
	        });
	        nameText.textContent = "Select List:";
	        nameText1.textContent = "Run:";
	        gDropdown.appendChild(nameText);
	        gDropdown.appendChild(nameText1);
	        gDropdown.insertBefore(rect1, nameText);
	        const gSubDropdown = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
	        });
	        const gSubDropdown1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
	        });
	        const gSubDropdownbox = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox`,
	        });
	        const gSubDropdownbox1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox`,
	        });
	        const dropdownBoxShape = Dom.svg("rect", {
	            width: 60,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4,
	            y: 1.2 * boxHeight,
	        });
	        const dropdownBoxShape1 = Dom.svg("rect", {
	            width: 60,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4,
	            y: 1.75 * boxHeight,
	        });
	        const dropdownRightButton = Dom.svg("text", {
	            class: "sqd-task-text select-field",
	            x: ICON_SIZE$5 + 9 * PADDING_X$4,
	            y: 1.35 * boxHeight,
	        });
	        const dropdownRightButton1 = Dom.svg("text", {
	            class: "sqd-task-text select-field",
	            x: ICON_SIZE$5 + 9 * PADDING_X$4,
	            y: 1.9 * boxHeight,
	        });
	        dropdownRightButton.textContent = "▼";
	        dropdownRightButton1.textContent = "▼";
	        const dropdownBoxInnerText = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4,
	            y: 1.4 * boxHeight,
	        });
	        dropdownBoxInnerText.textContent = "Select";
	        const dropdownBoxInnerText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4,
	            y: 1.95 * boxHeight,
	        });
	        dropdownBoxInnerText1.textContent = "Select";
	        const dropdownBoxShapeAfter = Dom.svg("rect", {
	            width: 60,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4,
	            y: 1.2 * boxHeight,
	            id: `dropdownBoxShape${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfter, {
	            opacity: 0,
	        });
	        const dropdownBoxShape1After = Dom.svg("rect", {
	            width: 60,
	            height: 15,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4,
	            y: 1.75 * boxHeight,
	            id: `dropdownBoxShape1${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShape1After, {
	            opacity: 0,
	        });
	        // Iterate thourgh list items and create options
	        // Sub dropdown menues
	        const gSubDropdownboxPop = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const gSubDropdownbox1Pop = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        // Options
	        let list = ['Any List', 'List A'];
	        for (let i = 1; i <= list.length; i++) {
	            const dropdownBoxBottomShape = Dom.svg("rect", {
	                width: 60,
	                height: 15,
	                class: "option select-field",
	                fill: "#fff",
	                stroke: "#a0a0a0",
	                x: ICON_SIZE$5 + 5 * PADDING_X$4,
	                y: 1.2 * boxHeight + 15 * i,
	            });
	            const dropdownBoxBottomShapeText = Dom.svg("text", {
	                class: "sqd-task-text",
	                x: ICON_SIZE$5 + 5 * PADDING_X$4,
	                y: 1.4 * boxHeight + 15 * i,
	            });
	            dropdownBoxBottomShapeText.textContent = list[i - 1];
	            const dropdownBoxBottomShapecover = Dom.svg("rect", {
	                width: 60,
	                height: 15,
	                class: "option select-field choice",
	                fill: "#fff",
	                stroke: "#a0a0a0",
	                x: ICON_SIZE$5 + 5 * PADDING_X$4,
	                y: 1.2 * boxHeight + 15 * i,
	                id: `dropdownBoxBottomShapecover${Date.now()}`,
	            });
	            Dom.attrs(dropdownBoxBottomShapecover, {
	                opacity: 0.3,
	            });
	            // Add event listners
	            dropdownBoxBottomShapecover.addEventListener("click", function (e) {
	                dropdownBoxInnerText.textContent = dropdownBoxBottomShapeText.textContent;
	                gSubDropdownboxPop.classList.toggle("sqd-hidden");
	            });
	            gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeText);
	            gSubDropdownboxPop.insertBefore(dropdownBoxBottomShape, dropdownBoxBottomShapeText);
	            gSubDropdownboxPop.appendChild(dropdownBoxBottomShapecover);
	        }
	        // Run time choices
	        list = ['Once', 'Multiple'];
	        // Options
	        for (let i = 1; i <= list.length; i++) {
	            const dropdownBoxBottomShape1 = Dom.svg("rect", {
	                width: 60,
	                height: 15,
	                class: "option select-field",
	                fill: "#fff",
	                stroke: "#a0a0a0",
	                x: ICON_SIZE$5 + 5 * PADDING_X$4,
	                y: 1.75 * boxHeight + 15 * i,
	            });
	            const dropdownBoxBottomShape1Text = Dom.svg("text", {
	                class: "sqd-task-text",
	                x: ICON_SIZE$5 + 5 * PADDING_X$4,
	                y: 1.95 * boxHeight + 15 * i,
	            });
	            dropdownBoxBottomShape1Text.textContent = list[i - 1];
	            const dropdownBoxBottomShape1cover = Dom.svg("rect", {
	                width: 60,
	                height: 15,
	                class: "option select-field choice",
	                fill: "#fff",
	                stroke: "#a0a0a0",
	                x: ICON_SIZE$5 + 5 * PADDING_X$4,
	                y: 1.75 * boxHeight + 15 * i,
	                id: `dropdownBoxBottomShape1cover${Date.now()}`,
	            });
	            Dom.attrs(dropdownBoxBottomShape1cover, {
	                opacity: 0.3,
	            });
	            // Add event listners
	            dropdownBoxBottomShape1cover.addEventListener("click", function (e) {
	                dropdownBoxInnerText1.textContent = dropdownBoxBottomShape1Text.textContent;
	                gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
	            });
	            // Append Child
	            gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text);
	            gSubDropdownbox1Pop.insertBefore(dropdownBoxBottomShape1, dropdownBoxBottomShape1Text);
	            gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1cover);
	        }
	        gSubDropdownbox.appendChild(dropdownRightButton);
	        gSubDropdownbox1.appendChild(dropdownRightButton1);
	        gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownRightButton);
	        gSubDropdownbox1.insertBefore(dropdownBoxShape1, dropdownRightButton1);
	        gSubDropdownbox.appendChild(dropdownBoxInnerText);
	        gSubDropdownbox1.appendChild(dropdownBoxInnerText1);
	        gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
	        gSubDropdownbox1.appendChild(dropdownBoxShape1After);
	        gSubDropdown.appendChild(gSubDropdownbox);
	        gSubDropdown.appendChild(gSubDropdownboxPop);
	        gSubDropdown1.appendChild(gSubDropdownbox1);
	        gSubDropdown1.appendChild(gSubDropdownbox1Pop);
	        gDropdown.appendChild(gSubDropdown1);
	        gDropdown.appendChild(gSubDropdown);
	        g.appendChild(moreIcon);
	        g.appendChild(gRightPop3);
	        g.appendChild(gDropdown);
	        g.appendChild(gRightPop3Reminder);
	        g.appendChild(gUpPop3);
	        g.appendChild(setUpReminder);
	        // Add EventListeners
	        moreIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gRightPop3.classList.toggle("sqd-hidden");
	        });
	        // Edit
	        editIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            gRightPop3.classList.toggle("sqd-hidden");
	            gSubDropdown.classList.toggle("sqd-hidden");
	            gSubDropdown1.classList.toggle("sqd-hidden");
	        });
	        upCheckIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gDropdown.classList.toggle("sqd-hidden");
	            gSubDropdown.classList.toggle("sqd-hidden");
	            gSubDropdown1.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            if (dropdownBoxInnerText.textContent && dropdownBoxInnerText.textContent != "Select") {
	                textRight.textContent = dropdownBoxInnerText.textContent;
	                step.properties["list"] = dropdownBoxInnerText.textContent;
	            }
	            if (dropdownBoxInnerText1.textContent && dropdownBoxInnerText1.textContent != "Select") {
	                step.properties["Run"] = dropdownBoxInnerText1.textContent;
	            }
	            step.updatedAt = new Date();
	        });
	        // Show hints
	        editIcon.addEventListener("mouseover", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mouseout", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        changeIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        changeIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        // Event listeners in Dropdown
	        dropdownBoxShapeAfter.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gSubDropdownboxPop.classList.toggle("sqd-hidden");
	            if (!gSubDropdownbox1Pop.classList.contains("sqd-hidden")) {
	                gSubDropdownbox1Pop.classList.remove("sqd-hidden");
	            }
	        });
	        dropdownBoxShape1After.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
	            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPop.classList.remove("sqd-hidden");
	            }
	        });
	        const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
	        const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
	        const validationErrorView = ValidationErrorView.create(g, boxWidth, 0);
	        return new TriggerComponentView(g, boxWidth, boxHeight, boxWidth / 2, rect, inputView, outputView, validationErrorView);
	    }
	    getClientPosition() {
	        const rect = this.rect.getBoundingClientRect();
	        return new Vector(rect.x, rect.y);
	    }
	    containsElement(element) {
	        return this.g.contains(element);
	    }
	    setIsDragging(isDragging) {
	        this.inputView.setIsHidden(isDragging);
	        this.outputView.setIsHidden(isDragging);
	    }
	    setIsDisabled(isDisabled) {
	        Dom.toggleClass(this.g, isDisabled, "sqd-disabled");
	    }
	    setIsSelected(isSelected) {
	        Dom.toggleClass(this.rect, isSelected, "sqd-selected");
	        Dom.toggleClass(this.g.children[1], isSelected, "sqd-selected");
	        Dom.toggleClass(this.g.children[6].children[0], isSelected, "sqd-selected");
	    }
	    setIsValid(isValid) {
	        this.validationErrorView.setIsHidden(isValid);
	    }
	}

	//import { TaskStepComponentView } from "./task-step-component-view";
	const PADDING_X$3 = 12;
	const PADDING_Y$3 = 10;
	const MIN_TEXT_WIDTH$3 = 70;
	const ICON_SIZE$4 = 22;
	const RECT_RADIUS$3 = 15;
	class TimeDelayTaskStepComponentView {
	    constructor(g, width, height, joinX, rect, inputView, outputView, validationErrorView) {
	        this.g = g;
	        this.width = width;
	        this.height = height;
	        this.joinX = joinX;
	        this.rect = rect;
	        this.inputView = inputView;
	        this.outputView = outputView;
	        this.validationErrorView = validationErrorView;
	    }
	    static create(parent, step, configuration) {
	        const g = Dom.svg("g", {
	            class: `sqd-task-group sqd-type-${step.type}`,
	            id: 'sqd-task-timedelay'
	        });
	        parent.appendChild(g);
	        const boxHeight = ICON_SIZE$4 + PADDING_Y$3;
	        const text = Dom.svg("text", {
	            x: PADDING_X$3 / 2,
	            y: boxHeight / 1.7,
	            class: "sqd-task-text",
	        });
	        text.textContent = step.name;
	        g.appendChild(text);
	        const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH$3);
	        const boxWidth = ICON_SIZE$4 + 8 * PADDING_X$3 + 2 * textWidth;
	        const rect = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: boxHeight,
	            rx: RECT_RADIUS$3,
	            ry: RECT_RADIUS$3,
	        });
	        g.insertBefore(rect, text);
	        const rectLeft = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: textWidth + 5,
	            height: boxHeight,
	            rx: RECT_RADIUS$3,
	            ry: RECT_RADIUS$3,
	        });
	        const textRight = Dom.svg("text", {
	            x: ICON_SIZE$4 + 3 * PADDING_X$3 + textWidth - 10,
	            y: boxHeight / 1.7,
	            class: "sqd-task-text",
	        });
	        if (step.properties.sendOn) {
	            textRight.textContent = step.properties.sendOn.toString();
	        }
	        else if (step.properties.waitFor) {
	            textRight.textContent = step.properties.waitFor.toString();
	        }
	        else {
	            textRight.textContent = "Select time";
	        }
	        g.appendChild(textRight);
	        g.insertBefore(rectLeft, text);
	        g.appendChild(textRight);
	        const textRightReminder = Dom.svg("text", {
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 132,
	            y: boxHeight / 2,
	            class: "sqd-task-text",
	        });
	        textRightReminder.textContent = "Please set up your filter";
	        const rectRight = Dom.svg("rect", {
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 80,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: 2 * boxHeight,
	            rx: RECT_RADIUS$3,
	            ry: RECT_RADIUS$3,
	        });
	        const rectRightLine = Dom.svg("line", {
	            class: "sqd-join",
	            x1: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 50,
	            x2: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 81,
	            y1: 15,
	            y2: 15,
	        });
	        const clickOkBut = Dom.svg("rect", {
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 182,
	            y: 1.25 * boxHeight,
	            class: "sqd-task-rect",
	            width: 40,
	            height: 20,
	            rx: 5,
	            ry: 5,
	        });
	        const clickOkButCover = Dom.svg("rect", {
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 182,
	            y: 1.25 * boxHeight,
	            class: "option select-field choice",
	            width: 40,
	            height: 20,
	            rx: 5,
	            ry: 5,
	            id: `clickOkButCover${Date.now()}`,
	        });
	        Dom.attrs(clickOkButCover, {
	            opacity: 0.1,
	        });
	        const clickOkText = Dom.svg("text", {
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 192,
	            y: 1.55 * boxHeight,
	            class: "sqd-task-text",
	        });
	        clickOkText.textContent = "OK";
	        const setUpReminder = Dom.svg("g", {
	            class: `sqd-task-group setup-reminder sqd-hidden`,
	        });
	        setUpReminder.appendChild(rectRightLine);
	        setUpReminder.appendChild(textRightReminder);
	        setUpReminder.insertBefore(rectRight, textRightReminder);
	        setUpReminder.appendChild(clickOkText);
	        setUpReminder.insertBefore(clickOkBut, clickOkText);
	        setUpReminder.appendChild(clickOkButCover);
	        const moreUrl = "../assets/send_more.svg";
	        const moreIcon = Dom.svg("image", {
	                href: moreUrl,
	            })
	            ;
	        Dom.attrs(moreIcon, {
	            class: "moreIcon",
	            id: `timeDelayMoreIcon`,
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 22,
	            y: 5,
	            width: ICON_SIZE$4,
	            height: ICON_SIZE$4,
	        });
	        const rightCopyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightCopyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 60,
	            y: PADDING_Y$3 - 6,
	        });
	        Dom.attrs(rightCopyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const copyUrl = "../assets/copy.svg";
	        const copyIcon = Dom.svg("image", {
	                href: copyUrl,
	            })
	            ;
	        Dom.attrs(copyIcon, {
	            class: "moreicon",
	            id: `RightCopyIcon-${step.id}`,
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 64,
	            y: PADDING_Y$3 - 2,
	            width: ICON_SIZE$4,
	            height: ICON_SIZE$4,
	        });
	        rightCopyImgContainer.appendChild(rightCopyImgContainerCircle);
	        rightCopyImgContainer.appendChild(copyIcon);
	        const rightDeleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightDeleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 46,
	            y: PADDING_Y$3 + 27,
	        });
	        Dom.attrs(rightDeleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const deleteUrl = "../assets/delete.svg";
	        const deleteIcon = Dom.svg("image", {
	                href: deleteUrl,
	            })
	            ;
	        Dom.attrs(deleteIcon, {
	            class: "moreicon",
	            id: `RightDeleteIcon-${step.id}`,
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 50,
	            y: PADDING_Y$3 + 30,
	            width: 22,
	            height: 22,
	        });
	        rightDeleteImgContainer.appendChild(rightDeleteImgContainerCircle);
	        rightDeleteImgContainer.appendChild(deleteIcon);
	        const rightEditImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightEditImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 50,
	            y: PADDING_Y$3 - 40,
	        });
	        Dom.attrs(rightEditImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const editUrl = "../assets/edit.svg";
	        const editIcon = Dom.svg("image", {
	                href: editUrl,
	            })
	            ;
	        Dom.attrs(editIcon, {
	            class: "moreicon",
	            // id: `timeDelayRightEditIcon`,
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 53,
	            y: PADDING_Y$3 - 36,
	            width: ICON_SIZE$4,
	            height: ICON_SIZE$4,
	        });
	        rightEditImgContainer.appendChild(rightEditImgContainerCircle);
	        rightEditImgContainer.appendChild(editIcon);
	        const checkImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const checkImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$4 + textWidth / 2 + 2 * PADDING_X$3 + 89,
	            y: PADDING_Y$3 - 40,
	        });
	        Dom.attrs(checkImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCheckIconUrl = "../assets/check.svg";
	        const upCheckIcon = Dom.svg("image", {
	                href: upCheckIconUrl,
	            })
	            ;
	        Dom.attrs(upCheckIcon, {
	            class: "moreicon",
	            // id: `timeDelayUpCheckIcon`,
	            x: ICON_SIZE$4 + textWidth / 2 + 2 * PADDING_X$3 + 93,
	            y: PADDING_Y$3 - 37,
	            width: 22,
	            height: 22,
	        });
	        checkImgContainer.appendChild(checkImgContainerCircle);
	        checkImgContainer.appendChild(upCheckIcon);
	        const deleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const deleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$4 + textWidth / 2 + 2 * PADDING_X$3 + 41 + 110,
	            y: PADDING_Y$3 - 40,
	        });
	        Dom.attrs(deleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upDeleteIconUrl = "../assets/delete.svg";
	        const upDeleteIcon = Dom.svg("image", {
	                href: upDeleteIconUrl,
	            })
	            ;
	        Dom.attrs(upDeleteIcon, {
	            class: "moreicon",
	            id: `UpDeleteIcon-${step.id}`,
	            x: ICON_SIZE$4 + textWidth / 2 + 2 * PADDING_X$3 + 44 + 110,
	            y: PADDING_Y$3 - 37,
	            width: ICON_SIZE$4,
	            height: ICON_SIZE$4,
	        });
	        deleteImgContainer.appendChild(deleteImgContainerCircle);
	        deleteImgContainer.appendChild(upDeleteIcon);
	        const copyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const copyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$4 + textWidth / 2 + 2 * PADDING_X$3 + 22 + 98,
	            y: PADDING_Y$3 - 40,
	        });
	        Dom.attrs(copyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCopyIconUrl = "../assets/copy.svg";
	        const upCopyIcon = Dom.svg("image", {
	                href: upCopyIconUrl,
	            })
	            ;
	        Dom.attrs(upCopyIcon, {
	            class: "moreicon",
	            id: `UpCopyIcon-${step.id}`,
	            x: ICON_SIZE$4 + textWidth / 2 + 2 * PADDING_X$3 + 22 + 102,
	            y: PADDING_Y$3 - 37,
	            width: ICON_SIZE$4,
	            height: ICON_SIZE$4,
	        });
	        copyImgContainer.appendChild(copyImgContainerCircle);
	        copyImgContainer.appendChild(upCopyIcon);
	        const gRightPop3 = Dom.svg("g", {
	            class: `sqd-task-group right-popup sqd-hidden Collapsed`,
	        });
	        const gUpPop3 = Dom.svg("g", {
	            class: `sqd-task-group up-popup sqd-hidden Collapsed`,
	        });
	        //add reminder prompt
	        const gRightPop3Reminder = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder`,
	        });
	        const gRightPop3Reminder1 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const gRightPop3Reminder2 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const gRightPop3Reminder3 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const reminder1 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$3,
	            ry: RECT_RADIUS$3,
	        });
	        Dom.attrs(reminder1, {
	            id: `reminder1${Date.now()}`,
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 82,
	            y: PADDING_Y$3 - 35,
	        });
	        const reminderText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 22 + 72.5,
	            y: PADDING_Y$3 - 23,
	        });
	        Dom.attrs(reminderText1, {
	            //class: 'sqd-hidden',
	            id: `reminderText${Date.now()}`,
	        });
	        reminderText1.textContent = "Edit";
	        const reminder2 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$3,
	            ry: RECT_RADIUS$3,
	        });
	        Dom.attrs(reminder2, {
	            id: `reminder2${Date.now()}`,
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 22 + 75,
	            y: PADDING_Y$3,
	        });
	        const reminderText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 22 + 80,
	            y: PADDING_Y$3 + 12,
	        });
	        Dom.attrs(reminderText2, {
	            //class: 'sqd-hidden',
	            id: `reminderText2${Date.now()}`,
	        });
	        reminderText2.textContent = "Copy";
	        const reminder3 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$3,
	            ry: RECT_RADIUS$3,
	        });
	        Dom.attrs(reminder3, {
	            id: `reminder3${Date.now()}`,
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 82,
	            y: PADDING_Y$3 + 35,
	        });
	        const reminderText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$4 + 4 * PADDING_X$3 + 2 * textWidth + 22 + 67,
	            y: PADDING_Y$3 + 47,
	        });
	        Dom.attrs(reminderText3, {
	            //class: 'sqd-hidden',
	            id: `reminderText3${Date.now()}`,
	        });
	        reminderText3.textContent = "Delete";
	        gRightPop3Reminder1.appendChild(reminderText1);
	        gRightPop3Reminder1.insertBefore(reminder1, reminderText1);
	        gRightPop3Reminder2.appendChild(reminderText2);
	        gRightPop3Reminder2.insertBefore(reminder2, reminderText2);
	        gRightPop3Reminder3.appendChild(reminderText3);
	        gRightPop3Reminder3.insertBefore(reminder3, reminderText3);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder1);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder2);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder3);
	        gRightPop3.appendChild(rightCopyImgContainer);
	        gRightPop3.appendChild(rightDeleteImgContainer);
	        gRightPop3.appendChild(rightEditImgContainer);
	        gUpPop3.appendChild(checkImgContainer);
	        gUpPop3.appendChild(deleteImgContainer);
	        gUpPop3.appendChild(copyImgContainer);
	        //add dropdown
	        //**************************************************//
	        //***********start with general node****************//
	        const gDropdown = Dom.svg("g", {
	            class: `sqd-task-group dropdown sqd-hidden Collapsed`,
	        });
	        const rect1 = Dom.svg("rect", {
	            x: 0.5,
	            y: boxHeight,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: 4 * boxHeight,
	            rx: RECT_RADIUS$3,
	            ry: RECT_RADIUS$3,
	        });
	        Dom.attrs(rect1, {
	            id: `dropdown${Date.now()}`,
	        });
	        const choice1 = Dom.element("input", {
	            type: "radio",
	            name: "choice",
	            value: 1,
	        });
	        choice1.style.marginLeft = "50px";
	        choice1.style.marginTop = "10px";
	        const choice1Text = Dom.element("label");
	        choice1Text.innerText = "Send on the Time You Pick";
	        const choice1TextNextLine = Dom.element("br");
	        const choice2 = Dom.element("input", {
	            type: "radio",
	            name: "choice",
	            value: 2,
	        });
	        choice2.style.marginLeft = "50px";
	        choice2.style.marginTop = "20px";
	        const choice2Text = Dom.element("label");
	        choice2Text.innerText = "Wait until the Time You Enter";
	        //add input for time delay tag
	        var foreignObjectTag = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject"); //Create a rect in SVG's namespace
	        foreignObjectTag.setAttribute("x", "0.5"); //Set rect data
	        foreignObjectTag.setAttribute("y", "32"); //Set rect data
	        foreignObjectTag.setAttribute("width", "258"); //Set rect data
	        foreignObjectTag.setAttribute("height", "128"); //Set rect data
	        //foreignObjectTag.setAttribute("class", "sqd-hidden");
	        var divTagPickTime = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
	        divTagPickTime.setAttribute("class", "sqd-hidden");
	        var divTagInput = document.createElement("INPUT");
	        divTagInput.setAttribute("class", "timedelaydivTagInput");
	        divTagInput.setAttribute("type", "datetime-local");
	        if (step.properties.sendOn) {
	            divTagInput.value = step.properties.sendOn.toString();
	            step["updatedAt"] = new Date();
	        }
	        var divTagInputTimes = document.createElement("INPUT");
	        divTagInputTimes.setAttribute("class", "timedelaydivTagInputTimes");
	        divTagInputTimes.setAttribute("placeholder", "Enter");
	        if (step.properties.waitFor) {
	            divTagInputTimes.value = step.properties.waitFor.toString();
	            step["updatedAt"] = new Date();
	        }
	        divTagPickTime.appendChild(divTagInput);
	        var divTagWaitTime = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
	        divTagWaitTime.setAttribute("class", "sqd-hidden");
	        var collection = document.createElement("Form");
	        collection.setAttribute("class", "timedelaycollection");
	        var select = document.createElement("select");
	        select.setAttribute("class", "timedelayselect");
	        let arr = ["hours", "days", "weeks", "months"];
	        for (var i = 0; i < 4; i++) {
	            var optional = Dom.element("option", {
	                value: arr[i],
	            });
	            optional.innerText = arr[i];
	            select.appendChild(optional);
	        }
	        collection.appendChild(select);
	        divTagWaitTime.appendChild(divTagInputTimes);
	        divTagWaitTime.appendChild(collection);
	        foreignObjectTag.appendChild(choice1);
	        foreignObjectTag.appendChild(choice1Text);
	        foreignObjectTag.appendChild(choice1TextNextLine);
	        foreignObjectTag.appendChild(choice2);
	        foreignObjectTag.appendChild(choice2Text);
	        foreignObjectTag.appendChild(divTagPickTime);
	        foreignObjectTag.appendChild(divTagWaitTime);
	        gDropdown.appendChild(rect1);
	        gDropdown.appendChild(foreignObjectTag);
	        choice1.addEventListener("click", function () {
	            divTagPickTime.classList.remove("sqd-hidden");
	            divTagWaitTime.classList.add("sqd-hidden");
	        });
	        choice2.addEventListener("click", function () {
	            divTagPickTime.classList.add("sqd-hidden");
	            divTagWaitTime.classList.remove("sqd-hidden");
	        });
	        moreIcon.addEventListener("click", function () {
	            gRightPop3.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("click", function () {
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            gRightPop3.classList.toggle("sqd-hidden");
	        });
	        upCheckIcon.addEventListener("click", function () {
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            if (divTagInputTimes.value) {
	                textRight.textContent = divTagInputTimes.value;
	                step.properties.waitFor = divTagInputTimes.value;
	                step.properties.sendOn = "";
	                divTagInput.value = "";
	                step["updatedAt"] = new Date();
	            }
	            if (divTagInput.value) {
	                textRight.textContent = divTagInput.value;
	                step.properties.sendOn = divTagInput.value;
	                step.properties.waitFor = "";
	                divTagInputTimes.value = "";
	                step["updatedAt"] = new Date();
	            }
	        });
	        // Show hints
	        editIcon.addEventListener("mouseover", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mouseout", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        copyIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        copyIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        //create dropdown day/ hour/min
	        //this is dropdown day
	        const dropdownNameLabelText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: PADDING_X$3 + 135,
	            y: 2.3 * boxHeight + 21.5,
	        });
	        Dom.attrs(dropdownNameLabelText1, {
	            id: `dropdownNameLabelText1${Date.now()}`,
	        });
	        dropdownNameLabelText1.textContent = "Day";
	        const selectTimeDropdownLabel1 = Dom.svg("rect", {
	            x: PADDING_X$3 + 135,
	            y: 1.98 * boxHeight + 21.5,
	            class: "sqd-task-rect",
	            width: 60,
	            height: 21.5,
	            rx: 3,
	            ry: 3,
	        });
	        const selectTimeDropdownLabelCover1 = Dom.svg("rect", {
	            x: PADDING_X$3 + 135,
	            y: 1.98 * boxHeight + 21.5,
	            class: "sqd-task-rect",
	            width: 60,
	            height: 21.5,
	            rx: 3,
	            ry: 3,
	        });
	        Dom.attrs(selectTimeDropdownLabelCover1, {
	            opacity: 0.1,
	            id: `selectTimeDropdownLabelCover1${Date.now()}`,
	        });
	        //this is hour
	        const dropdownNameLabelText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: PADDING_X$3 + 135,
	            y: 2.3 * boxHeight + 2 * 21.5,
	        });
	        Dom.attrs(dropdownNameLabelText2, {
	            id: `dropdownNameLabelText2${Date.now()}`,
	        });
	        dropdownNameLabelText2.textContent = "Hour";
	        const selectTimeDropdownLabel2 = Dom.svg("rect", {
	            x: PADDING_X$3 + 135,
	            y: 1.98 * boxHeight + 2 * 21.5,
	            class: "sqd-task-rect",
	            width: 60,
	            height: 21.5,
	            rx: 3,
	            ry: 3,
	        });
	        const selectTimeDropdownLabelCover2 = Dom.svg("rect", {
	            x: PADDING_X$3 + 135,
	            y: 1.98 * boxHeight + 2 * 21.5,
	            class: "sqd-task-rect",
	            width: 60,
	            height: 21.5,
	            rx: 3,
	            ry: 3,
	        });
	        Dom.attrs(selectTimeDropdownLabelCover2, {
	            opacity: 0.1,
	            id: `selectTimeDropdownLabelCover2${Date.now()}`,
	        });
	        //this is minutes
	        const dropdownNameLabelText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: PADDING_X$3 + 135,
	            y: 2.3 * boxHeight + 3 * 21.5,
	        });
	        Dom.attrs(dropdownNameLabelText3, {
	            id: `dropdownNameLabelText3${Date.now()}`,
	        });
	        dropdownNameLabelText3.textContent = "Minutes";
	        const selectTimeDropdownLabel3 = Dom.svg("rect", {
	            x: PADDING_X$3 + 135,
	            y: 1.98 * boxHeight + 3 * 21.5,
	            class: "sqd-task-rect",
	            width: 60,
	            height: 21.5,
	            rx: 3,
	            ry: 3,
	        });
	        const selectTimeDropdownLabelCover3 = Dom.svg("rect", {
	            x: PADDING_X$3 + 135,
	            y: 1.98 * boxHeight + 3 * 21.5,
	            class: "sqd-task-rect",
	            width: 60,
	            height: 21.5,
	            rx: 3,
	            ry: 3,
	        });
	        Dom.attrs(selectTimeDropdownLabelCover3, {
	            opacity: 0.1,
	            id: `selectTimeDropdownLabelCover3${Date.now()}`,
	        });
	        const timedelaySubDropdown = Dom.svg("g", {
	            class: `sqd-task-group timedelay dropdown sqd-hidden Collapsed`,
	        });
	        timedelaySubDropdown.appendChild(dropdownNameLabelText1);
	        timedelaySubDropdown.insertBefore(selectTimeDropdownLabel1, dropdownNameLabelText1);
	        timedelaySubDropdown.appendChild(selectTimeDropdownLabelCover1);
	        timedelaySubDropdown.appendChild(dropdownNameLabelText2);
	        timedelaySubDropdown.insertBefore(selectTimeDropdownLabel2, dropdownNameLabelText2);
	        timedelaySubDropdown.appendChild(selectTimeDropdownLabelCover2);
	        timedelaySubDropdown.appendChild(dropdownNameLabelText3);
	        timedelaySubDropdown.insertBefore(selectTimeDropdownLabel3, dropdownNameLabelText3);
	        timedelaySubDropdown.appendChild(selectTimeDropdownLabelCover3);
	        gDropdown.appendChild(timedelaySubDropdown);
	        g.appendChild(moreIcon);
	        g.appendChild(gRightPop3);
	        g.appendChild(gDropdown);
	        g.appendChild(gRightPop3Reminder);
	        g.appendChild(gUpPop3);
	        g.appendChild(setUpReminder);
	        const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
	        const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
	        const validationErrorView = ValidationErrorView.create(g, boxWidth, 0);
	        return new TimeDelayTaskStepComponentView(g, boxWidth, boxHeight, boxWidth / 2, rect, inputView, outputView, validationErrorView);
	    }
	    getClientPosition() {
	        const rect = this.rect.getBoundingClientRect();
	        return new Vector(rect.x, rect.y);
	    }
	    containsElement(element) {
	        return this.g.contains(element);
	    }
	    setIsDragging(isDragging) {
	        this.inputView.setIsHidden(isDragging);
	        this.outputView.setIsHidden(isDragging);
	    }
	    setIsDisabled(isDisabled) {
	        Dom.toggleClass(this.g, isDisabled, "sqd-disabled");
	    }
	    setIsSelected(isSelected) {
	        Dom.toggleClass(this.rect, isSelected, "sqd-selected");
	        Dom.toggleClass(this.g.children[1], isSelected, "sqd-selected");
	        Dom.toggleClass(this.g.children[6].children[0], isSelected, "sqd-selected");
	    }
	    setIsValid(isValid) {
	        this.validationErrorView.setIsHidden(isValid);
	    }
	}

	/******************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */

	function __awaiter(thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	}

	const PADDING_X$2 = 12;
	const PADDING_Y$2 = 10;
	const MIN_TEXT_WIDTH$2 = 70;
	const ICON_SIZE$3 = 22;
	const RECT_RADIUS$2 = 15;
	class TagComponentView {
	    constructor(g, width, height, joinX, rect, inputView, outputView, validationErrorView) {
	        this.g = g;
	        this.width = width;
	        this.height = height;
	        this.joinX = joinX;
	        this.rect = rect;
	        this.inputView = inputView;
	        this.outputView = outputView;
	        this.validationErrorView = validationErrorView;
	    }
	    static create(parent, step, configuration) {
	        const g = Dom.svg("g", {
	            class: `sqd-task-group sqd-type-${step.type}`,
	            id: 'sqd-task-tag'
	        });
	        parent.appendChild(g);
	        const boxHeight = ICON_SIZE$3 + PADDING_Y$2;
	        const text = Dom.svg("text", {
	            x: PADDING_X$2 / 2,
	            y: boxHeight / 1.7,
	            class: "sqd-task-text",
	        });
	        text.textContent = step.name;
	        g.appendChild(text);
	        const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH$2);
	        const boxWidth = ICON_SIZE$3 + 8 * PADDING_X$2 + 2 * textWidth;
	        const rect = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: boxHeight,
	            rx: RECT_RADIUS$2,
	            ry: RECT_RADIUS$2,
	        });
	        g.insertBefore(rect, text);
	        const rectLeft = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: textWidth + 5,
	            height: boxHeight,
	            rx: RECT_RADIUS$2,
	            ry: RECT_RADIUS$2,
	        });
	        const textRight = Dom.svg("text", {
	            x: ICON_SIZE$3 + 3 * PADDING_X$2 + textWidth - 10,
	            y: boxHeight / 1.7,
	            class: "sqd-task-text",
	        });
	        if (step.properties["tag"]) {
	            textRight.textContent = step.properties["tag"].toString();
	        }
	        else {
	            textRight.textContent = "Any tag";
	        }
	        g.appendChild(textRight);
	        g.insertBefore(rectLeft, text);
	        g.appendChild(textRight);
	        const textRightReminder = Dom.svg("text", {
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 132,
	            y: boxHeight / 2,
	            class: "sqd-task-text",
	        });
	        textRightReminder.textContent = "Please set up your filter";
	        const rectRight = Dom.svg("rect", {
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 80,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: 2 * boxHeight,
	            rx: RECT_RADIUS$2,
	            ry: RECT_RADIUS$2,
	        });
	        const rectRightLine = Dom.svg("line", {
	            class: "sqd-join",
	            x1: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 50,
	            x2: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 81,
	            y1: 15,
	            y2: 15,
	        });
	        const clickOkBut = Dom.svg("rect", {
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 182,
	            y: 1.25 * boxHeight,
	            class: "sqd-task-rect",
	            width: 40,
	            height: 20,
	            rx: 5,
	            ry: 5,
	        });
	        const clickOkButCover = Dom.svg("rect", {
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 182,
	            y: 1.25 * boxHeight,
	            class: "option select-field choice",
	            width: 40,
	            height: 20,
	            rx: 5,
	            ry: 5,
	            id: `clickOkButCover${Date.now()}`,
	        });
	        Dom.attrs(clickOkButCover, {
	            opacity: 0.1,
	        });
	        const clickOkText = Dom.svg("text", {
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 192,
	            y: 1.55 * boxHeight,
	            class: "sqd-task-text",
	        });
	        clickOkText.textContent = "OK";
	        const setUpReminder = Dom.svg("g", {
	            class: `sqd-task-group setup-reminder sqd-hidden`,
	        });
	        setUpReminder.appendChild(rectRightLine);
	        setUpReminder.appendChild(textRightReminder);
	        setUpReminder.insertBefore(rectRight, textRightReminder);
	        setUpReminder.appendChild(clickOkText);
	        setUpReminder.insertBefore(clickOkBut, clickOkText);
	        setUpReminder.appendChild(clickOkButCover);
	        const moreUrl = "../assets/tag_more.svg";
	        const moreIcon = Dom.svg("image", {
	                href: moreUrl,
	            })
	            ;
	        Dom.attrs(moreIcon, {
	            class: "moreIcon",
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 22,
	            y: 5,
	            width: ICON_SIZE$3,
	            height: ICON_SIZE$3,
	        });
	        const rightCopyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightCopyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 60,
	            y: PADDING_Y$2 - 6,
	        });
	        Dom.attrs(rightCopyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const copyUrl = "../assets/copy.svg";
	        const copyIcon = Dom.svg("image", {
	                href: copyUrl,
	            })
	            ;
	        Dom.attrs(copyIcon, {
	            class: "moreicon",
	            id: `RightCopyIcon-${step.id}`,
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 64,
	            y: PADDING_Y$2 - 2,
	            width: ICON_SIZE$3,
	            height: ICON_SIZE$3,
	        });
	        rightCopyImgContainer.appendChild(rightCopyImgContainerCircle);
	        rightCopyImgContainer.appendChild(copyIcon);
	        const rightDeleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightDeleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 46,
	            y: PADDING_Y$2 + 27,
	        });
	        Dom.attrs(rightDeleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const deleteUrl = "../assets/delete.svg";
	        const deleteIcon = Dom.svg("image", {
	                href: deleteUrl,
	            })
	            ;
	        Dom.attrs(deleteIcon, {
	            class: "moreicon",
	            id: `RightDeleteIcon-${step.id}`,
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 50,
	            y: PADDING_Y$2 + 30,
	            width: 22,
	            height: 22,
	        });
	        rightDeleteImgContainer.appendChild(rightDeleteImgContainerCircle);
	        rightDeleteImgContainer.appendChild(deleteIcon);
	        const rightEditImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightEditImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 50,
	            y: PADDING_Y$2 - 40,
	        });
	        Dom.attrs(rightEditImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const editUrl = "../assets/edit.svg";
	        const editIcon = Dom.svg("image", {
	                href: editUrl,
	            })
	            ;
	        Dom.attrs(editIcon, {
	            class: "moreicon",
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 53,
	            y: PADDING_Y$2 - 36,
	            width: ICON_SIZE$3,
	            height: ICON_SIZE$3,
	        });
	        rightEditImgContainer.appendChild(rightEditImgContainerCircle);
	        rightEditImgContainer.appendChild(editIcon);
	        const checkImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const checkImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$3 + textWidth / 2 + 2 * PADDING_X$2 + 89,
	            y: PADDING_Y$2 - 40,
	        });
	        Dom.attrs(checkImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCheckIconUrl = "../assets/check.svg";
	        const upCheckIcon = Dom.svg("image", {
	                href: upCheckIconUrl,
	            })
	            ;
	        Dom.attrs(upCheckIcon, {
	            class: "moreicon",
	            // id: `tagUpCheckIcon`,
	            x: ICON_SIZE$3 + textWidth / 2 + 2 * PADDING_X$2 + 93,
	            y: PADDING_Y$2 - 37,
	            width: 22,
	            height: 22,
	        });
	        checkImgContainer.appendChild(checkImgContainerCircle);
	        checkImgContainer.appendChild(upCheckIcon);
	        const deleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const deleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$3 + textWidth / 2 + 2 * PADDING_X$2 + 41 + 110,
	            y: PADDING_Y$2 - 40,
	        });
	        Dom.attrs(deleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upDeleteIconUrl = "../assets/delete.svg";
	        const upDeleteIcon = Dom.svg("image", {
	                href: upDeleteIconUrl,
	            })
	            ;
	        Dom.attrs(upDeleteIcon, {
	            class: "moreicon",
	            id: `UpDeleteIcon-${step.id}`,
	            x: ICON_SIZE$3 + textWidth / 2 + 2 * PADDING_X$2 + 44 + 110,
	            y: PADDING_Y$2 - 37,
	            width: ICON_SIZE$3,
	            height: ICON_SIZE$3,
	        });
	        deleteImgContainer.appendChild(deleteImgContainerCircle);
	        deleteImgContainer.appendChild(upDeleteIcon);
	        const copyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const copyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$3 + textWidth / 2 + 2 * PADDING_X$2 + 22 + 98,
	            y: PADDING_Y$2 - 40,
	        });
	        Dom.attrs(copyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCopyIconUrl = "../assets/copy.svg";
	        const upCopyIcon = Dom.svg("image", {
	                href: upCopyIconUrl,
	            })
	            ;
	        Dom.attrs(upCopyIcon, {
	            class: "moreicon",
	            id: `UpCopyIcon-${step.id}`,
	            x: ICON_SIZE$3 + textWidth / 2 + 2 * PADDING_X$2 + 22 + 102,
	            y: PADDING_Y$2 - 37,
	            width: ICON_SIZE$3,
	            height: ICON_SIZE$3,
	        });
	        copyImgContainer.appendChild(copyImgContainerCircle);
	        copyImgContainer.appendChild(upCopyIcon);
	        const gRightPop3 = Dom.svg("g", {
	            class: `sqd-task-group right-popup sqd-hidden Collapsed`,
	        });
	        const gUpPop3 = Dom.svg("g", {
	            class: `sqd-task-group up-popup sqd-hidden Collapsed`,
	        });
	        //add reminder prompt
	        const gRightPop3Reminder = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder`,
	        });
	        const gRightPop3Reminder1 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const gRightPop3Reminder2 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const gRightPop3Reminder3 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const reminder1 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$2,
	            ry: RECT_RADIUS$2,
	        });
	        Dom.attrs(reminder1, {
	            id: `reminder1${Date.now()}`,
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 82,
	            y: PADDING_Y$2 - 35,
	        });
	        const reminderText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 22 + 72.5,
	            y: PADDING_Y$2 - 23,
	        });
	        Dom.attrs(reminderText1, {
	            //class: 'sqd-hidden',
	            id: `reminderText${Date.now()}`,
	        });
	        reminderText1.textContent = "Edit";
	        const reminder2 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$2,
	            ry: RECT_RADIUS$2,
	        });
	        Dom.attrs(reminder2, {
	            id: `reminder2${Date.now()}`,
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 22 + 75,
	            y: PADDING_Y$2,
	        });
	        const reminderText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 22 + 80,
	            y: PADDING_Y$2 + 12,
	        });
	        Dom.attrs(reminderText2, {
	            //class: 'sqd-hidden',
	            id: `reminderText2${Date.now()}`,
	        });
	        reminderText2.textContent = "Copy";
	        const reminder3 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$2,
	            ry: RECT_RADIUS$2,
	        });
	        Dom.attrs(reminder3, {
	            id: `reminder3${Date.now()}`,
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 82,
	            y: PADDING_Y$2 + 35,
	        });
	        const reminderText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 22 + 67,
	            y: PADDING_Y$2 + 47,
	        });
	        Dom.attrs(reminderText3, {
	            //class: 'sqd-hidden',
	            id: `reminderText3${Date.now()}`,
	        });
	        reminderText3.textContent = "Delete";
	        gRightPop3Reminder1.appendChild(reminderText1);
	        gRightPop3Reminder1.insertBefore(reminder1, reminderText1);
	        gRightPop3Reminder2.appendChild(reminderText2);
	        gRightPop3Reminder2.insertBefore(reminder2, reminderText2);
	        gRightPop3Reminder3.appendChild(reminderText3);
	        gRightPop3Reminder3.insertBefore(reminder3, reminderText3);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder1);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder2);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder3);
	        gRightPop3.appendChild(rightCopyImgContainer);
	        gRightPop3.appendChild(rightDeleteImgContainer);
	        gRightPop3.appendChild(rightEditImgContainer);
	        gUpPop3.appendChild(checkImgContainer);
	        gUpPop3.appendChild(deleteImgContainer);
	        gUpPop3.appendChild(copyImgContainer);
	        //add dropdown
	        //**************************************************//
	        //***********start with general node****************//
	        const gDropdown = Dom.svg("g", {
	            class: `sqd-task-group dropdown sqd-hidden Collapsed`,
	        });
	        // const rect1 = Dom.svg("rect", {
	        //   x: 0.5,
	        //   y: boxHeight,
	        //   class: "sqd-task-rect",
	        //   width: boxWidth,
	        //   height: 4 * boxHeight,
	        //   rx: RECT_RADIUS,
	        //   ry: RECT_RADIUS,
	        // });
	        // Dom.attrs(rect1, {
	        //   id: `dropdown${Date.now()}`,
	        // });
	        g.appendChild(moreIcon);
	        g.appendChild(gRightPop3);
	        g.appendChild(gDropdown);
	        const newTag = Dom.svg("text", {
	            class: "sqd-task-text",
	        });
	        tagDropDown(gDropdown, boxHeight, boxWidth, newTag);
	        if (step.name === "Add Tag") {
	            step.id;
	            addNewTag(gDropdown, boxHeight, boxWidth, upCheckIcon, newTag);
	        }
	        g.appendChild(gRightPop3Reminder);
	        g.appendChild(gUpPop3);
	        g.appendChild(setUpReminder);
	        // Add EventListeners
	        moreIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gRightPop3.classList.toggle("sqd-hidden");
	        });
	        // Edit
	        editIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            gRightPop3.classList.toggle("sqd-hidden");
	        });
	        upCheckIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            if (newTag.textContent) {
	                textRight.textContent = newTag.textContent;
	                step.properties["tag"] = textRight.textContent;
	                step["updatedAt"] = new Date();
	            }
	        });
	        // Show hints
	        editIcon.addEventListener("mouseover", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mouseout", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        copyIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        copyIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
	        const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
	        const validationErrorView = ValidationErrorView.create(g, boxWidth, 0);
	        return new TagComponentView(g, boxWidth, boxHeight, boxWidth / 2, rect, inputView, outputView, validationErrorView);
	    }
	    getClientPosition() {
	        const rect = this.rect.getBoundingClientRect();
	        return new Vector(rect.x, rect.y);
	    }
	    containsElement(element) {
	        return this.g.contains(element);
	    }
	    setIsDragging(isDragging) {
	        this.inputView.setIsHidden(isDragging);
	        this.outputView.setIsHidden(isDragging);
	    }
	    setIsDisabled(isDisabled) {
	        Dom.toggleClass(this.g, isDisabled, "sqd-disabled");
	    }
	    setIsSelected(isSelected) {
	        Dom.toggleClass(this.rect, isSelected, "sqd-selected");
	        Dom.toggleClass(this.g.children[1], isSelected, "sqd-selected");
	        Dom.toggleClass(this.g.children[6].children[0], isSelected, "sqd-selected");
	    }
	    setIsValid(isValid) {
	        this.validationErrorView.setIsHidden(isValid);
	    }
	}
	function addTxt$1(txt, xVal, yVal, idVal) {
	    const nameText = Dom.svg("text", {
	        class: "sqd-task-text",
	        x: xVal,
	        y: yVal,
	    });
	    nameText.textContent = txt;
	    if (idVal) {
	        Dom.attrs(nameText, {
	            id: idVal
	        });
	    }
	    return nameText;
	}
	function createRect$1(className, xVal, yVal, w, h, id, radius) {
	    const rect = Dom.svg("rect", {
	        x: xVal,
	        y: yVal,
	        class: className,
	        width: w,
	        height: h,
	    });
	    if (id) {
	        Dom.attrs(rect, {
	            id: id
	        });
	    }
	    if (radius) {
	        Dom.attrs(rect, {
	            rx: radius,
	            ry: radius
	        });
	    }
	    return rect;
	}
	function tagDropDown(dropdown, h, w, textToChange) {
	    const gSubDropdownbox = Dom.svg("g", {
	        class: `sqd-task-group sub-dropdownbox`,
	    });
	    dropdown.appendChild(gSubDropdownbox);
	    // Field names
	    const rect1 = createRect$1("sqd-task-rect", 0.5, h, w, 2.5 * h, `dropdown${Date.now()}`, RECT_RADIUS$2);
	    const nameText = addTxt$1("Select tag: ", PADDING_X$2, 1.5 * h);
	    gSubDropdownbox.appendChild(nameText);
	    gSubDropdownbox.insertBefore(rect1, nameText);
	    let startX = nameText.getBBox().x;
	    let startY = nameText.getBBox().y;
	    let wid = nameText.getBBox().width;
	    const dropdownBoxShape = createRect$1("option select-field", startX + wid + PADDING_X$2, startY, 160, 15);
	    Dom.attrs(dropdownBoxShape, {
	        fill: "#fff",
	        stroke: "#a0a0a0",
	    });
	    const dropdownBoxShapeAfter = createRect$1("option select-field", startX + wid + PADDING_X$2, startY, 160, 15, `dropdownBoxShape${Date.now()}`);
	    Dom.attrs(dropdownBoxShapeAfter, {
	        fill: "#fff",
	        stroke: "#a0a0a0",
	        opacity: 0,
	    });
	    // Default value
	    const dropdownBoxInnerText = addTxt$1("Any Tag", startX + wid + PADDING_X$2 + PADDING_X$2 / 2, startY + 6.5);
	    gSubDropdownbox.appendChild(dropdownBoxInnerText);
	    wid = wid + dropdownBoxInnerText.getBBox().width;
	    const dropdownRightButton = addTxt$1("▼ ", startX + wid + PADDING_X$2 * 9, startY + 6.5);
	    startX = dropdownBoxInnerText.getBBox().x;
	    gSubDropdownbox.appendChild(dropdownRightButton);
	    gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownBoxInnerText);
	    gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
	    // Selection list field
	    const gSubDropdownboxPop = Dom.svg("g", {
	        class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	    });
	    dropdown.appendChild(gSubDropdownboxPop);
	    dropdownBoxShapeAfter.addEventListener("click", function (e) {
	        e.stopPropagation();
	        gSubDropdownboxPop.classList.toggle("sqd-hidden");
	        getTags().then(tags => {
	            console.log("Fetching", tags);
	            if (typeof (tags) !== 'number') {
	                editTags(tags);
	            }
	        }).catch(console.log);
	    });
	    // Fetch tags from backend
	    var url = window.location.pathname;
	    var userID;
	    if (url.includes("new")) {
	        userID = url.slice(5); //Need to be changed to an existing user
	    }
	    else {
	        userID = url.substring(1, url.lastIndexOf('/') + 1);
	    }
	    //Need to be changed to an existing journey; //Need to be changed to current user
	    const request = new Request(`http://localhost:8080/tag/${userID}`, { method: 'GET' });
	    let tags = [];
	    // Async way to fetch tags
	    const getTags = () => __awaiter(this, void 0, void 0, function* () {
	        const response = yield fetch(request);
	        if (response.ok) {
	            const val = yield response.json();
	            tags = val;
	            return tags;
	        }
	        else {
	            return Promise.reject(response.status);
	        }
	    });
	    // const tags = ["Food", "Electronics", "Clothes"];
	    const editTags = function (tags) {
	        for (let i = 0; i < tags.length; i++) {
	            const dropdownBoxBottomShape = createRect$1("option select-field", startX - PADDING_X$2 / 2, startY + 15 * (i + 1), 160, 15);
	            Dom.attrs(dropdownBoxBottomShape, {
	                fill: "#fff",
	                stroke: "#a0a0a0",
	            });
	            const dropdownBoxBottomShapeText = addTxt$1(tags[i], startX, startY + 15 * (i + 1) + 8);
	            const dropdownBoxBottomShapecover = createRect$1("option select-field choice", startX - PADDING_X$2 / 2, startY + 15 * (i + 1), 160, 15, `dropdownBoxBottomShapecover${Date.now()}`);
	            Dom.attrs(dropdownBoxBottomShapecover, {
	                fill: "#fff",
	                stroke: "#a0a0a0",
	                opacity: 0.3,
	            });
	            gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeText);
	            gSubDropdownboxPop.insertBefore(dropdownBoxBottomShape, dropdownBoxBottomShapeText);
	            gSubDropdownboxPop.appendChild(dropdownBoxBottomShapecover);
	            // Add Event Listeners
	            dropdownBoxBottomShapecover.addEventListener("click", function (e) {
	                e.stopPropagation();
	                dropdownBoxInnerText.textContent = tags[i];
	                gSubDropdownboxPop.classList.toggle("sqd-hidden");
	                textToChange.textContent = tags[i];
	            });
	        }
	    };
	}
	function addNewTag(parent, h, w, upCheckBut, textToChange, tagId) {
	    const g = Dom.svg("g", {
	        class: `create-tag`,
	    });
	    parent.insertBefore(g, parent.lastChild);
	    const nameText = Dom.svg("text", {
	        class: "new-tag-text",
	        x: w / 4 + PADDING_X$2,
	        y: h + 5 * PADDING_Y$2,
	    });
	    nameText.textContent = "+Create a New Tag";
	    g.appendChild(nameText);
	    // Text wrapper
	    const rect = createRect$1("create-tag", nameText.getBBox().x, nameText.getBBox().y, nameText.getBBox().width, nameText.getBBox().height, `newTag${Date.now()}`);
	    g.insertBefore(rect, nameText);
	    // Page to input new tag
	    const container = Dom.svg("g", {
	        class: `sqd-task-group sub-dropdownbox sqd-hidden`,
	    });
	    parent.appendChild(container);
	    const rect1 = createRect$1("sqd-task-rect", 0.5, h, w, 2.5 * h, `dropdown${Date.now()}`, RECT_RADIUS$2);
	    container.appendChild(rect1);
	    const inputArea = Dom.svg("foreignObject", {
	        class: "new-tag-input",
	        x: 1 + 2 * PADDING_X$2,
	        y: h + 2 * PADDING_Y$2,
	        width: 180,
	        height: 30
	    });
	    const input = Dom.element("input", {
	        class: "new-tag-input",
	        name: "newTag",
	        type: "text",
	        placeholder: "Name your new tag",
	        value: ""
	    });
	    inputArea.appendChild(input);
	    container.appendChild(inputArea);
	    const backText = Dom.svg("text", {
	        class: "new-tag-text",
	        x: w / 4 + PADDING_X$2,
	        y: h + 6 * PADDING_Y$2,
	    });
	    backText.textContent = "< Back to Selection";
	    container.appendChild(backText);
	    // Add event listener
	    g.addEventListener("click", function (e) {
	        e.stopPropagation();
	        container.classList.toggle('sqd-hidden');
	    });
	    backText.addEventListener("click", function (e) {
	        container.classList.toggle('sqd-hidden');
	        input.value = "";
	    });
	    upCheckBut.addEventListener("click", function (e) {
	        if (input.value) {
	            e.stopPropagation();
	            console.log('Will be sending to back end', input.value);
	            // Post tag to backend
	            var url = window.location.pathname;
	            const userID = url.slice(5); //Need to be changed to an existing user
	            const data = { "tag_name": `${input.value}` };
	            const request = new Request(`http://localhost:8080/tags/${userID}`, {
	                method: 'POST',
	                headers: {
	                    "Content-Type": 'application/json'
	                },
	                body: JSON.stringify(data)
	            });
	            // Send tag to backend 
	            textToChange.textContent = input.value;
	            container.classList.toggle('sqd-hidden');
	            input.value = "";
	            fetch(request).then((response) => {
	                if (!response.ok) {
	                    console.log("Connection error", response.status);
	                }
	            });
	        }
	    });
	}

	// import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
	// import { TaskStepComponentView } from "./task-step-component-view";
	// import { ListItem } from "ng-multiselect-dropdown/multiselect.model";
	//import { TaskStepComponentView } from "./task-step-component-view";
	const PADDING_X$1 = 12;
	const PADDING_Y$1 = 10;
	const MIN_TEXT_WIDTH$1 = 70;
	const ICON_SIZE$2 = 22;
	const RECT_RADIUS$1 = 15;
	class TimeTriggerTaskStepComponentView {
	    constructor(g, width, height, joinX, rect, inputView, outputView, validationErrorView) {
	        this.g = g;
	        this.width = width;
	        this.height = height;
	        this.joinX = joinX;
	        this.rect = rect;
	        this.inputView = inputView;
	        this.outputView = outputView;
	        this.validationErrorView = validationErrorView;
	    }
	    static create(parent, step, configuration) {
	        const g = Dom.svg("g", {
	            class: `sqd-task-group sqd-type-${step.type}`,
	            id: "sqd-task-timetrigger"
	        });
	        parent.appendChild(g);
	        const boxHeight = ICON_SIZE$2 + PADDING_Y$1;
	        const text = Dom.svg("text", {
	            x: PADDING_X$1 / 1.5,
	            y: boxHeight / 1.7,
	            class: "sqd-task-text",
	        });
	        text.textContent = step.name;
	        g.appendChild(text);
	        const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH$1);
	        const boxWidth = ICON_SIZE$2 + 8 * PADDING_X$1 + 2 * textWidth;
	        const rect = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: boxHeight,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        g.insertBefore(rect, text);
	        const rectLeft = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: textWidth + 12,
	            height: boxHeight,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        const textRight = Dom.svg("text", {
	            x: ICON_SIZE$2 + 3 * PADDING_X$1 + textWidth - 10,
	            y: boxHeight / 1.7,
	            class: "sqd-task-text",
	        });
	        if (step.properties.send) {
	            if (step.properties.frequency == "Once") {
	                textRight.textContent = step.properties.send.toString();
	            }
	            else {
	                textRight.textContent = "Every " + step.properties.send.toString();
	            }
	        }
	        else {
	            textRight.textContent = "Select time";
	        }
	        g.appendChild(textRight);
	        g.insertBefore(rectLeft, text);
	        g.appendChild(textRight);
	        const textRightReminder = Dom.svg("text", {
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 132,
	            y: boxHeight / 2,
	            class: "sqd-task-text",
	        });
	        textRightReminder.textContent = "Please set up your filter";
	        const rectRight = Dom.svg("rect", {
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 80,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: 2 * boxHeight,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        const rectRightLine = Dom.svg("line", {
	            class: "sqd-join",
	            x1: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 50,
	            x2: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 81,
	            y1: 15,
	            y2: 15,
	        });
	        const clickOkBut = Dom.svg("rect", {
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 182,
	            y: 1.25 * boxHeight,
	            class: "sqd-task-rect",
	            width: 40,
	            height: 20,
	            rx: 5,
	            ry: 5,
	        });
	        const clickOkButCover = Dom.svg("rect", {
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 182,
	            y: 1.25 * boxHeight,
	            class: "option select-field choice",
	            width: 40,
	            height: 20,
	            rx: 5,
	            ry: 5,
	            id: `clickOkButCover${Date.now()}`,
	        });
	        Dom.attrs(clickOkButCover, {
	            opacity: 0.1,
	        });
	        const clickOkText = Dom.svg("text", {
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 192,
	            y: 1.55 * boxHeight,
	            class: "sqd-task-text",
	        });
	        clickOkText.textContent = "OK";
	        const setUpReminder = Dom.svg("g", {
	            class: `sqd-task-group setup-reminder sqd-hidden`,
	        });
	        setUpReminder.appendChild(rectRightLine);
	        setUpReminder.appendChild(textRightReminder);
	        setUpReminder.insertBefore(rectRight, textRightReminder);
	        setUpReminder.appendChild(clickOkText);
	        setUpReminder.insertBefore(clickOkBut, clickOkText);
	        setUpReminder.appendChild(clickOkButCover);
	        const moreUrl = "../assets/trigger_more.svg";
	        const moreIcon = Dom.svg("image", {
	                href: moreUrl,
	            })
	            ;
	        Dom.attrs(moreIcon, {
	            class: "moreIcon",
	            // id: `timeDelayMoreIcon`,
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 22,
	            y: 5,
	            width: ICON_SIZE$2,
	            height: ICON_SIZE$2,
	        });
	        const rightCopyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightCopyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 60,
	            y: PADDING_Y$1 - 6,
	        });
	        Dom.attrs(rightCopyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const changeUrl = "../assets/change.svg";
	        const changeIcon = Dom.svg("image", {
	                href: changeUrl,
	            })
	            ;
	        Dom.attrs(changeIcon, {
	            class: "moreicon",
	            id: `RightChangeIcon-${step.id}`,
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 64,
	            y: PADDING_Y$1 - 2,
	            width: ICON_SIZE$2,
	            height: ICON_SIZE$2,
	        });
	        rightCopyImgContainer.appendChild(rightCopyImgContainerCircle);
	        rightCopyImgContainer.appendChild(changeIcon);
	        const rightDeleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightDeleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 46,
	            y: PADDING_Y$1 + 27,
	        });
	        Dom.attrs(rightDeleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const deleteUrl = "../assets/delete.svg";
	        const deleteIcon = Dom.svg("image", {
	                href: deleteUrl,
	            })
	            ;
	        Dom.attrs(deleteIcon, {
	            class: "moreicon",
	            id: `RightDeleteIcon-${step.id}`,
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 50,
	            y: PADDING_Y$1 + 30,
	            width: 22,
	            height: 22,
	        });
	        rightDeleteImgContainer.appendChild(rightDeleteImgContainerCircle);
	        rightDeleteImgContainer.appendChild(deleteIcon);
	        const rightEditImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightEditImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 50,
	            y: PADDING_Y$1 - 40,
	        });
	        Dom.attrs(rightEditImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const editUrl = "../assets/edit.svg";
	        const editIcon = Dom.svg("image", {
	                href: editUrl,
	            })
	            ;
	        Dom.attrs(editIcon, {
	            class: "moreicon",
	            // id: `timeDelayRightEditIcon`,
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 53,
	            y: PADDING_Y$1 - 36,
	            width: ICON_SIZE$2,
	            height: ICON_SIZE$2,
	        });
	        rightEditImgContainer.appendChild(rightEditImgContainerCircle);
	        rightEditImgContainer.appendChild(editIcon);
	        const checkImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const checkImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$2 + textWidth / 2 + 2 * PADDING_X$1 + 89,
	            y: PADDING_Y$1 - 40,
	        });
	        Dom.attrs(checkImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCheckIconUrl = "../assets/check.svg";
	        const upCheckIcon = Dom.svg("image", {
	                href: upCheckIconUrl,
	            })
	            ;
	        Dom.attrs(upCheckIcon, {
	            class: "moreicon",
	            // id: `timeDelayUpCheckIcon`,
	            x: ICON_SIZE$2 + textWidth / 2 + 2 * PADDING_X$1 + 93,
	            y: PADDING_Y$1 - 37,
	            width: 22,
	            height: 22,
	        });
	        checkImgContainer.appendChild(checkImgContainerCircle);
	        checkImgContainer.appendChild(upCheckIcon);
	        const deleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const deleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$2 + textWidth / 2 + 2 * PADDING_X$1 + 41 + 110,
	            y: PADDING_Y$1 - 40,
	        });
	        Dom.attrs(deleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upDeleteIconUrl = "../assets/delete.svg";
	        const upDeleteIcon = Dom.svg("image", {
	                href: upDeleteIconUrl,
	            })
	            ;
	        Dom.attrs(upDeleteIcon, {
	            class: "moreicon",
	            id: `UpDeleteIcon-${step.id}`,
	            x: ICON_SIZE$2 + textWidth / 2 + 2 * PADDING_X$1 + 44 + 110,
	            y: PADDING_Y$1 - 37,
	            width: ICON_SIZE$2,
	            height: ICON_SIZE$2,
	        });
	        deleteImgContainer.appendChild(deleteImgContainerCircle);
	        deleteImgContainer.appendChild(upDeleteIcon);
	        const copyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const copyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$2 + textWidth / 2 + 2 * PADDING_X$1 + 22 + 98,
	            y: PADDING_Y$1 - 40,
	        });
	        Dom.attrs(copyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upchangeUrl = "../assets/change.svg";
	        const upchangeIcon = Dom.svg("image", {
	                href: upchangeUrl,
	            })
	            ;
	        Dom.attrs(upchangeIcon, {
	            class: "moreicon",
	            id: `UpChangeIcon-${step.id}`,
	            x: ICON_SIZE$2 + textWidth / 2 + 2 * PADDING_X$1 + 22 + 102,
	            y: PADDING_Y$1 - 37,
	            width: ICON_SIZE$2,
	            height: ICON_SIZE$2,
	        });
	        copyImgContainer.appendChild(copyImgContainerCircle);
	        copyImgContainer.appendChild(upchangeIcon);
	        const gRightPop3 = Dom.svg("g", {
	            class: `sqd-task-group right-popup sqd-hidden Collapsed`,
	        });
	        const gUpPop3 = Dom.svg("g", {
	            class: `sqd-task-group up-popup sqd-hidden Collapsed`,
	        });
	        //add reminder prompt
	        const gRightPop3Reminder = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder`,
	        });
	        const gRightPop3Reminder1 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const gRightPop3Reminder2 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const gRightPop3Reminder3 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const reminder1 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        Dom.attrs(reminder1, {
	            // id: `reminder1${Date.now()}`,
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 82,
	            y: PADDING_Y$1 - 35,
	        });
	        const reminderText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 22 + 72.5,
	            y: PADDING_Y$1 - 23,
	        });
	        // Dom.attrs(reminderText1, {
	        //   //class: 'sqd-hidden',
	        //   id: `reminderText${Date.now()}`,
	        // });
	        reminderText1.textContent = "Edit";
	        const reminder2 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        Dom.attrs(reminder2, {
	            // id: `reminder2${Date.now()}`,
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 22 + 75,
	            y: PADDING_Y$1,
	        });
	        const reminderText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 22 + 80,
	            y: PADDING_Y$1 + 12,
	        });
	        // Dom.attrs(reminderText2, {
	        //   //class: 'sqd-hidden',
	        //   id: `reminderText2${Date.now()}`,
	        // });
	        reminderText2.textContent = "Reset";
	        const reminder3 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        Dom.attrs(reminder3, {
	            // id: `reminder3${Date.now()}`,
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 82,
	            y: PADDING_Y$1 + 35,
	        });
	        const reminderText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$2 + 4 * PADDING_X$1 + 2 * textWidth + 22 + 67,
	            y: PADDING_Y$1 + 47,
	        });
	        // Dom.attrs(reminderText3, {
	        //   //class: 'sqd-hidden',
	        //   id: `reminderText3${Date.now()}`,
	        // });
	        reminderText3.textContent = "Delete";
	        gRightPop3Reminder1.appendChild(reminderText1);
	        gRightPop3Reminder1.insertBefore(reminder1, reminderText1);
	        gRightPop3Reminder2.appendChild(reminderText2);
	        gRightPop3Reminder2.insertBefore(reminder2, reminderText2);
	        gRightPop3Reminder3.appendChild(reminderText3);
	        gRightPop3Reminder3.insertBefore(reminder3, reminderText3);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder1);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder2);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder3);
	        gRightPop3.appendChild(rightCopyImgContainer);
	        gRightPop3.appendChild(rightDeleteImgContainer);
	        gRightPop3.appendChild(rightEditImgContainer);
	        gUpPop3.appendChild(checkImgContainer);
	        gUpPop3.appendChild(deleteImgContainer);
	        gUpPop3.appendChild(copyImgContainer);
	        //add dropdown
	        //**************************************************//
	        //***********start with general node****************//
	        const gDropdown = Dom.svg("g", {
	            class: `sqd-task-group dropdown sqd-hidden Collapsed`,
	            id: "timetrigger-dropdown"
	        });
	        const rect1 = Dom.svg("rect", {
	            x: 0.5,
	            y: boxHeight,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: 6 * boxHeight,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        Dom.attrs(rect1, {
	            id: `dropdown${Date.now()}`,
	        });
	        const choice1Text = Dom.element("label");
	        choice1Text.innerText = "Select List";
	        choice1Text.setAttribute("class", "timeTriggerChoice1");
	        //const choice1TextNextLine = Dom.element("br");
	        const choice2Text = Dom.element("label");
	        choice2Text.innerText = "Send Times";
	        choice2Text.setAttribute("class", "timeTriggerChoice2");
	        //add input for time delay tag
	        var foreignObjectTag = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject"); //Create a rect in SVG's namespace
	        foreignObjectTag.setAttribute("x", "0.5"); //Set rect data
	        foreignObjectTag.setAttribute("y", "32"); //Set rect data
	        foreignObjectTag.setAttribute("width", "258"); //Set rect data
	        foreignObjectTag.setAttribute("height", "128"); //Set rect data
	        //foreignObjectTag.setAttribute("class", "sqd-hidden");
	        var divTimeTriggerSendTimeTag = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
	        var divTimeTriggerSelectListTag = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
	        divTimeTriggerSelectListTag.setAttribute("class", "divTimeTriggerSelectListTag");
	        divTimeTriggerSendTimeTag.setAttribute("class", "divTimeTriggerSendTimeTag");
	        //divTagWaitTime.setAttribute("class", "sqd-hidden");
	        var collection = document.createElement("Form");
	        collection.setAttribute("class", "timeTriggercollection");
	        var selectListSelect = document.createElement("select");
	        selectListSelect.setAttribute("class", "timeTriggerSelectTimeselect");
	        let selectList = ["List A", "List B", "List C"];
	        for (var i = 0; i < 3; i++) {
	            var optional = Dom.element("option", {
	                value: i,
	            });
	            optional.innerText = selectList[i];
	            selectListSelect.appendChild(optional);
	        }
	        collection.appendChild(choice1Text);
	        collection.appendChild(selectListSelect);
	        var sendTimecollection = document.createElement("Form");
	        sendTimecollection.setAttribute("class", "timeTriggersendTimecollection");
	        let sendTimes = ["Once", "Recurring"];
	        var sendTimeSelect = document.createElement("select");
	        sendTimeSelect.setAttribute("class", "timeTriggerSendTimeselect");
	        for (var i = 0; i < 2; i++) {
	            var optional = Dom.element("option", {
	                value: sendTimes[i],
	            });
	            optional.innerText = sendTimes[i];
	            sendTimeSelect.appendChild(optional);
	        }
	        var divTagInput = document.createElement("INPUT");
	        divTagInput.setAttribute("class", "timeTriggerdivTagInput");
	        divTagInput.setAttribute("type", "datetime-local");
	        let week = [
	            "Monday",
	            "Tuesday",
	            "Wednesday",
	            " Thursday",
	            "friday",
	            "Saturday",
	            "Sunday",
	        ];
	        var weekSelect = document.createElement("select");
	        weekSelect.setAttribute("class", "weekSelect  sqd-hidden");
	        for (var i = 0; i < 7; i++) {
	            var optional = Dom.element("option", {
	                value: week[i],
	            });
	            optional.innerText = week[i];
	            weekSelect.appendChild(optional);
	        }
	        sendTimeSelect.addEventListener("change", function () {
	            if (sendTimeSelect.value == "Once") {
	                divTagInput.classList.remove("sqd-hidden");
	                weekSelect.classList.add("sqd-hidden");
	            }
	            else {
	                divTagInput.classList.add("sqd-hidden");
	                weekSelect.classList.remove("sqd-hidden");
	            }
	        });
	        sendTimecollection.appendChild(choice2Text);
	        sendTimecollection.appendChild(sendTimeSelect);
	        sendTimecollection.appendChild(weekSelect);
	        sendTimecollection.appendChild(divTagInput);
	        divTimeTriggerSelectListTag.appendChild(collection);
	        divTimeTriggerSendTimeTag.appendChild(sendTimecollection);
	        foreignObjectTag.appendChild(divTimeTriggerSelectListTag);
	        foreignObjectTag.appendChild(divTimeTriggerSendTimeTag);
	        gDropdown.appendChild(rect1);
	        gDropdown.appendChild(foreignObjectTag);
	        moreIcon.addEventListener("click", function () {
	            gRightPop3.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("click", function () {
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            gRightPop3.classList.toggle("sqd-hidden");
	            if (step.properties.list) {
	                const index = selectList.findIndex(a => a === step.properties.list.toString());
	                selectListSelect.selectedIndex = index;
	            }
	            if (step.properties.frequency) {
	                const index = sendTimes.findIndex(a => a === step.properties.frequency.toString());
	                sendTimeSelect.selectedIndex = index;
	            }
	            if (step.properties.frequency == "Once" && divTagInput.value) {
	                divTagInput.value = step.properties.send.toString();
	                divTagInput.classList.remove("sqd-hidden");
	                weekSelect.classList.add("sqd-hidden");
	            }
	            else if (step.properties.frequency == "Recurring" && weekSelect.value) {
	                const index = week.findIndex(a => a === step.properties.send.toString());
	                weekSelect.selectedIndex = index;
	                divTagInput.classList.add("sqd-hidden");
	                weekSelect.classList.remove("sqd-hidden");
	            }
	        });
	        upCheckIcon.addEventListener("click", function () {
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            if (sendTimeSelect.value == "Once" && divTagInput.value) {
	                step.properties.send = divTagInput.value;
	                textRight.textContent = divTagInput.value;
	                weekSelect.value = "";
	            }
	            else if (sendTimeSelect.value == "Recurring" && weekSelect.value) {
	                step.properties.send = weekSelect.value;
	                textRight.textContent = "Every " + weekSelect.value;
	                divTagInput.value = "";
	            }
	            step.properties.frequency = sendTimeSelect.value;
	            step.properties.list = selectList[parseInt(selectListSelect.value)];
	            step["updatedAt"] = new Date();
	        });
	        // Show hints
	        editIcon.addEventListener("mouseover", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mouseout", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        changeIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        changeIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        g.appendChild(moreIcon);
	        g.appendChild(gRightPop3);
	        g.appendChild(gDropdown);
	        g.appendChild(gRightPop3Reminder);
	        g.appendChild(gUpPop3);
	        g.appendChild(setUpReminder);
	        const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
	        const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
	        const validationErrorView = ValidationErrorView.create(g, boxWidth, 0);
	        return new TimeTriggerTaskStepComponentView(g, boxWidth, boxHeight, boxWidth / 2, rect, inputView, outputView, validationErrorView);
	    }
	    getClientPosition() {
	        const rect = this.rect.getBoundingClientRect();
	        return new Vector(rect.x, rect.y);
	    }
	    containsElement(element) {
	        return this.g.contains(element);
	    }
	    setIsDragging(isDragging) {
	        this.inputView.setIsHidden(isDragging);
	        this.outputView.setIsHidden(isDragging);
	    }
	    setIsDisabled(isDisabled) {
	        Dom.toggleClass(this.g, isDisabled, "sqd-disabled");
	    }
	    setIsSelected(isSelected) {
	        Dom.toggleClass(this.rect, isSelected, "sqd-selected");
	        Dom.toggleClass(this.g.children[1], isSelected, "sqd-selected");
	        Dom.toggleClass(this.g.children[6].children[0], isSelected, "sqd-selected");
	    }
	    setIsValid(isValid) {
	        this.validationErrorView.setIsHidden(isValid);
	    }
	}

	const PADDING_X = 12;
	const PADDING_Y = 10;
	const MIN_TEXT_WIDTH = 70;
	const ICON_SIZE$1 = 22;
	const RECT_RADIUS = 15;
	class EmailComponentView {
	    constructor(g, width, height, joinX, rect, inputView, outputView, validationErrorView) {
	        this.g = g;
	        this.width = width;
	        this.height = height;
	        this.joinX = joinX;
	        this.rect = rect;
	        this.inputView = inputView;
	        this.outputView = outputView;
	        this.validationErrorView = validationErrorView;
	    }
	    static create(parent, step, configuration) {
	        const g = Dom.svg("g", {
	            class: `sqd-task-group sqd-type-${step.type}`,
	            id: "sqd-task-email"
	        });
	        parent.appendChild(g);
	        const boxHeight = ICON_SIZE$1 + PADDING_Y;
	        const text = Dom.svg("text", {
	            x: PADDING_X / 2,
	            y: boxHeight / 1.7,
	            class: "sqd-task-text",
	        });
	        text.textContent = step.name;
	        g.appendChild(text);
	        const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH);
	        const boxWidth = ICON_SIZE$1 + 8 * PADDING_X + 2 * textWidth;
	        const rect = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: boxHeight,
	            rx: RECT_RADIUS,
	            ry: RECT_RADIUS,
	        });
	        g.insertBefore(rect, text);
	        const rectLeft = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: textWidth + 5,
	            height: boxHeight,
	            rx: RECT_RADIUS,
	            ry: RECT_RADIUS,
	        });
	        const textRight = Dom.svg("text", {
	            x: ICON_SIZE$1 + 3 * PADDING_X + textWidth - 10,
	            y: boxHeight / 1.7,
	            class: "sqd-task-text",
	        });
	        if (step.properties["subject"]) {
	            textRight.textContent = step.properties["subject"].toString();
	        }
	        else {
	            textRight.textContent = "Empty Subject";
	        }
	        g.appendChild(textRight);
	        g.insertBefore(rectLeft, text);
	        g.appendChild(textRight);
	        const textRightReminder = Dom.svg("text", {
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 132,
	            y: boxHeight / 2,
	            class: "sqd-task-text",
	        });
	        textRightReminder.textContent = "Please set up your filter";
	        const rectRight = Dom.svg("rect", {
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 80,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: boxWidth,
	            height: 2 * boxHeight,
	            rx: RECT_RADIUS,
	            ry: RECT_RADIUS,
	        });
	        const rectRightLine = Dom.svg("line", {
	            class: "sqd-join",
	            x1: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 50,
	            x2: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 81,
	            y1: 15,
	            y2: 15,
	        });
	        const clickOkBut = Dom.svg("rect", {
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 182,
	            y: 1.25 * boxHeight,
	            class: "sqd-task-rect",
	            width: 40,
	            height: 20,
	            rx: 5,
	            ry: 5,
	        });
	        const clickOkButCover = Dom.svg("rect", {
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 182,
	            y: 1.25 * boxHeight,
	            class: "option select-field choice",
	            width: 40,
	            height: 20,
	            rx: 5,
	            ry: 5,
	            id: `clickOkButCover${Date.now()}`,
	        });
	        Dom.attrs(clickOkButCover, {
	            opacity: 0.1,
	        });
	        const clickOkText = Dom.svg("text", {
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 192,
	            y: 1.55 * boxHeight,
	            class: "sqd-task-text",
	        });
	        clickOkText.textContent = "OK";
	        const setUpReminder = Dom.svg("g", {
	            class: `sqd-task-group setup-reminder sqd-hidden`,
	        });
	        setUpReminder.appendChild(rectRightLine);
	        setUpReminder.appendChild(textRightReminder);
	        setUpReminder.insertBefore(rectRight, textRightReminder);
	        setUpReminder.appendChild(clickOkText);
	        setUpReminder.insertBefore(clickOkBut, clickOkText);
	        setUpReminder.appendChild(clickOkButCover);
	        // Right side buttons
	        const magnidyIconUrl = "../assets/magnify.svg";
	        const magnidyIcon = Dom.svg("image", {
	                href: magnidyIconUrl,
	            })
	            ;
	        Dom.attrs(magnidyIcon, {
	            class: "magnidyIcon",
	            id: `magnidyIcon-${step.id}`,
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 90,
	            y: PADDING_Y,
	            width: ICON_SIZE$1,
	            height: ICON_SIZE$1,
	        });
	        const moreUrl = "../assets/send_more.svg";
	        const moreIcon = Dom.svg("image", {
	                href: moreUrl,
	            })
	            ;
	        Dom.attrs(moreIcon, {
	            class: "moreIcon",
	            // id: `tagMoreIcon`,
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 22,
	            y: 5,
	            width: ICON_SIZE$1,
	            height: ICON_SIZE$1,
	        });
	        const rightCopyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightCopyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 60,
	            y: PADDING_Y - 6,
	        });
	        Dom.attrs(rightCopyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const copyUrl = "../assets/copy.svg";
	        const copyIcon = Dom.svg("image", {
	                href: copyUrl,
	            })
	            ;
	        Dom.attrs(copyIcon, {
	            class: "moreicon",
	            id: `RightCopyIcon-${step.id}`,
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 64,
	            y: PADDING_Y - 2,
	            width: ICON_SIZE$1,
	            height: ICON_SIZE$1,
	        });
	        rightCopyImgContainer.appendChild(rightCopyImgContainerCircle);
	        rightCopyImgContainer.appendChild(copyIcon);
	        const rightDeleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightDeleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 46,
	            y: PADDING_Y + 27,
	        });
	        Dom.attrs(rightDeleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const deleteUrl = "../assets/delete.svg";
	        const deleteIcon = Dom.svg("image", {
	                href: deleteUrl,
	            })
	            ;
	        Dom.attrs(deleteIcon, {
	            class: "moreicon",
	            id: `RightDeleteIcon-${step.id}`,
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 50,
	            y: PADDING_Y + 30,
	            width: 22,
	            height: 22,
	        });
	        rightDeleteImgContainer.appendChild(rightDeleteImgContainerCircle);
	        rightDeleteImgContainer.appendChild(deleteIcon);
	        const rightEditImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightEditImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 50,
	            y: PADDING_Y - 40,
	        });
	        Dom.attrs(rightEditImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const editUrl = "../assets/edit.svg";
	        const editIcon = Dom.svg("image", {
	                href: editUrl,
	            })
	            ;
	        Dom.attrs(editIcon, {
	            class: "moreicon",
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 53,
	            y: PADDING_Y - 36,
	            width: ICON_SIZE$1,
	            height: ICON_SIZE$1,
	        });
	        rightEditImgContainer.appendChild(rightEditImgContainerCircle);
	        rightEditImgContainer.appendChild(editIcon);
	        const checkImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const checkImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$1 + textWidth / 2 + 2 * PADDING_X + 89,
	            y: PADDING_Y - 40,
	        });
	        Dom.attrs(checkImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCheckIconUrl = "../assets/check.svg";
	        const upCheckIcon = Dom.svg("image", {
	                href: upCheckIconUrl,
	            })
	            ;
	        Dom.attrs(upCheckIcon, {
	            class: "moreicon",
	            x: ICON_SIZE$1 + textWidth / 2 + 2 * PADDING_X + 93,
	            y: PADDING_Y - 37,
	            width: 22,
	            height: 22,
	        });
	        checkImgContainer.appendChild(checkImgContainerCircle);
	        checkImgContainer.appendChild(upCheckIcon);
	        const deleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const deleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$1 + textWidth / 2 + 2 * PADDING_X + 41 + 110,
	            y: PADDING_Y - 40,
	        });
	        Dom.attrs(deleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upDeleteIconUrl = "../assets/delete.svg";
	        const upDeleteIcon = Dom.svg("image", {
	                href: upDeleteIconUrl,
	            })
	            ;
	        Dom.attrs(upDeleteIcon, {
	            class: "moreicon",
	            id: `UpDeleteIcon-${step.id}`,
	            x: ICON_SIZE$1 + textWidth / 2 + 2 * PADDING_X + 44 + 110,
	            y: PADDING_Y - 37,
	            width: ICON_SIZE$1,
	            height: ICON_SIZE$1,
	        });
	        deleteImgContainer.appendChild(deleteImgContainerCircle);
	        deleteImgContainer.appendChild(upDeleteIcon);
	        const copyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const copyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: ICON_SIZE$1 + textWidth / 2 + 2 * PADDING_X + 22 + 98,
	            y: PADDING_Y - 40,
	        });
	        Dom.attrs(copyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCopyIconUrl = "../assets/copy.svg";
	        const upCopyIcon = Dom.svg("image", {
	                href: upCopyIconUrl,
	            })
	            ;
	        Dom.attrs(upCopyIcon, {
	            class: "moreicon",
	            id: `UpCopyIcon-${step.id}`,
	            x: ICON_SIZE$1 + textWidth / 2 + 2 * PADDING_X + 22 + 102,
	            y: PADDING_Y - 37,
	            width: ICON_SIZE$1,
	            height: ICON_SIZE$1,
	        });
	        copyImgContainer.appendChild(copyImgContainerCircle);
	        copyImgContainer.appendChild(upCopyIcon);
	        const gRightPop3 = Dom.svg("g", {
	            class: `sqd-task-group right-popup sqd-hidden Collapsed`,
	        });
	        const gUpPop3 = Dom.svg("g", {
	            class: `sqd-task-group up-popup sqd-hidden Collapsed`,
	        });
	        //add reminder prompt
	        const gRightPop3Reminder = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder`,
	        });
	        const gRightPop3Reminder1 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const gRightPop3Reminder2 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const gRightPop3Reminder3 = Dom.svg("g", {
	            class: `sqd-task-group right-popup-reminder sqd-hidden`,
	        });
	        const reminder1 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS,
	            ry: RECT_RADIUS,
	        });
	        Dom.attrs(reminder1, {
	            id: `reminder1${Date.now()}`,
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 82,
	            y: PADDING_Y - 35,
	        });
	        const reminderText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 22 + 72.5,
	            y: PADDING_Y - 23,
	        });
	        Dom.attrs(reminderText1, {
	            //class: 'sqd-hidden',
	            id: `reminderText${Date.now()}`,
	        });
	        reminderText1.textContent = "Edit";
	        const reminder2 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS,
	            ry: RECT_RADIUS,
	        });
	        Dom.attrs(reminder2, {
	            id: `reminder2${Date.now()}`,
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 22 + 75,
	            y: PADDING_Y,
	        });
	        const reminderText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 22 + 80,
	            y: PADDING_Y + 12,
	        });
	        Dom.attrs(reminderText2, {
	            //class: 'sqd-hidden',
	            id: `reminderText2${Date.now()}`,
	        });
	        reminderText2.textContent = "Copy";
	        const reminder3 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS,
	            ry: RECT_RADIUS,
	        });
	        Dom.attrs(reminder3, {
	            id: `reminder3${Date.now()}`,
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 82,
	            y: PADDING_Y + 35,
	        });
	        const reminderText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 22 + 67,
	            y: PADDING_Y + 47,
	        });
	        Dom.attrs(reminderText3, {
	            //class: 'sqd-hidden',
	            id: `reminderText3${Date.now()}`,
	        });
	        reminderText3.textContent = "Delete";
	        gRightPop3Reminder1.appendChild(reminderText1);
	        gRightPop3Reminder1.insertBefore(reminder1, reminderText1);
	        gRightPop3Reminder2.appendChild(reminderText2);
	        gRightPop3Reminder2.insertBefore(reminder2, reminderText2);
	        gRightPop3Reminder3.appendChild(reminderText3);
	        gRightPop3Reminder3.insertBefore(reminder3, reminderText3);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder1);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder2);
	        gRightPop3Reminder.appendChild(gRightPop3Reminder3);
	        gRightPop3.appendChild(rightCopyImgContainer);
	        gRightPop3.appendChild(rightDeleteImgContainer);
	        gRightPop3.appendChild(rightEditImgContainer);
	        gRightPop3.appendChild(magnidyIcon);
	        gUpPop3.appendChild(checkImgContainer);
	        gUpPop3.appendChild(deleteImgContainer);
	        gUpPop3.appendChild(copyImgContainer);
	        //add dropdown
	        //**************************************************//
	        //***********start with general node****************//
	        const gDropdown = Dom.svg("g", {
	            class: `sqd-task-group dropdown sqd-hidden Collapsed`
	        });
	        g.appendChild(moreIcon);
	        g.appendChild(gRightPop3);
	        g.appendChild(gDropdown);
	        // Send Email Drop Down Menu set up
	        const newSend = Dom.svg("text", { class: "sqd-task-text", });
	        const newSub = Dom.svg("text", { class: "sqd-task-text", });
	        Dom.svg("text", { class: "sqd-task-text", });
	        addDropDown(gDropdown, boxHeight, boxWidth, upCheckIcon, newSend, newSub);
	        g.appendChild(gRightPop3Reminder);
	        g.appendChild(gUpPop3);
	        g.appendChild(setUpReminder);
	        // Add EventListeners
	        moreIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gRightPop3.classList.toggle("sqd-hidden");
	            if (!gUpPop3.classList.contains("sqd-hidden")) {
	                gUpPop3.classList.toggle("sqd-hidden");
	            }
	            if (!gDropdown.classList.contains("sqd-hidden")) {
	                gDropdown.classList.toggle("sqd-hidden");
	            }
	        });
	        // Edit
	        editIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            gRightPop3.classList.toggle("sqd-hidden");
	            const elemt = document.getElementsByClassName("email-field");
	            if (step.properties.sender) {
	                Dom.attrs(elemt[0], { value: step.properties.sender.toString() });
	            }
	            if (step.properties.sender) {
	                Dom.attrs(elemt[1], { value: step.properties.subject.toString() });
	            }
	        });
	        // check button clicked
	        upCheckIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            if (newSend.textContent) {
	                step.properties.sender = newSend.textContent;
	            }
	            if (newSub.textContent) {
	                textRight.textContent = newSub.textContent;
	                step.properties.subject = textRight.textContent;
	            }
	            step["updatedAt"] = new Date();
	        });
	        // Show hints
	        editIcon.addEventListener("mouseover", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mouseout", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        copyIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        copyIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
	        const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
	        const validationErrorView = ValidationErrorView.create(g, boxWidth, 0);
	        return new EmailComponentView(g, boxWidth, boxHeight, boxWidth / 2, rect, inputView, outputView, validationErrorView);
	    }
	    getClientPosition() {
	        const rect = this.rect.getBoundingClientRect();
	        return new Vector(rect.x, rect.y);
	    }
	    containsElement(element) {
	        return this.g.contains(element);
	    }
	    setIsDragging(isDragging) {
	        this.inputView.setIsHidden(isDragging);
	        this.outputView.setIsHidden(isDragging);
	    }
	    setIsDisabled(isDisabled) {
	        Dom.toggleClass(this.g, isDisabled, "sqd-disabled");
	    }
	    setIsSelected(isSelected) {
	        Dom.toggleClass(this.rect, isSelected, "sqd-selected");
	        Dom.toggleClass(this.g.children[1], isSelected, "sqd-selected");
	        Dom.toggleClass(this.g.children[6].children[0], isSelected, "sqd-selected");
	    }
	    setIsValid(isValid) {
	        this.validationErrorView.setIsHidden(isValid);
	    }
	}
	function addTxt(txt, xVal, yVal, idVal) {
	    const nameText = Dom.svg("text", {
	        class: "sqd-task-text",
	        x: xVal,
	        y: yVal,
	    });
	    nameText.textContent = txt;
	    if (idVal) {
	        Dom.attrs(nameText, {
	            id: idVal
	        });
	    }
	    return nameText;
	}
	function createRect(className, xVal, yVal, w, h, id, radius) {
	    const rect = Dom.svg("rect", {
	        x: xVal,
	        y: yVal,
	        class: className,
	        width: w,
	        height: h,
	    });
	    if (id) {
	        Dom.attrs(rect, {
	            id: id
	        });
	    }
	    if (radius) {
	        Dom.attrs(rect, {
	            rx: radius,
	            ry: radius
	        });
	    }
	    return rect;
	}
	function addDropDown(dropdown, h, w, button, send, sub, cont) {
	    const gSubDropdownbox = Dom.svg("g", {
	        class: `sqd-task-group sub-dropdownbox`
	    });
	    dropdown.appendChild(gSubDropdownbox);
	    const rect1 = createRect("sqd-task-rect", 0.5, h, w, 4 * h + PADDING_Y, `dropdown${Date.now()}`, RECT_RADIUS);
	    gSubDropdownbox.appendChild(rect1);
	    let startX = rect1.getBBox().x;
	    let startY = rect1.getBBox().y;
	    let wid = rect1.getBBox().width;
	    // Field names
	    const sendTo = addTxt("Send from: ", startX + PADDING_X, startY + PADDING_Y);
	    gSubDropdownbox.appendChild(sendTo);
	    startX = sendTo.getBBox().x;
	    startY = sendTo.getBBox().y;
	    wid = sendTo.getBBox().width;
	    const subject = addTxt("Subject: ", startX, startY + h);
	    gSubDropdownbox.appendChild(subject);
	    startY = subject.getBBox().y;
	    const content = addTxt("Choose Content", startX, startY + h);
	    gSubDropdownbox.appendChild(content);
	    // add input fields
	    startY = sendTo.getBBox().y;
	    let height = sendTo.getBBox().height + PADDING_Y;
	    const sendWrapper = Dom.svg("foreignObject", {
	        x: startX + wid + PADDING_X,
	        y: startY,
	        width: 150,
	        height: height
	    });
	    const sendInput = Dom.element("input", {
	        class: "new-tag-input email-field",
	        name: "sender",
	        type: "text",
	        placeholder: "Send from",
	    });
	    if (send.textContent) {
	        Dom.attrs(sendInput, {
	            value: send.textContent
	        });
	    }
	    gSubDropdownbox.appendChild(sendWrapper);
	    sendWrapper.appendChild(sendInput);
	    startX = subject.getBBox().x;
	    startY = subject.getBBox().y;
	    const subjectWrapper = Dom.svg("foreignObject", {
	        x: startX + wid + PADDING_X,
	        y: startY,
	        width: 150,
	        height: height
	    });
	    const subjectInput = Dom.element("input", {
	        class: "new-tag-input email-field",
	        name: "subject",
	        type: "text",
	        placeholder: "Empty Subject"
	    });
	    if (sub.textContent) {
	        Dom.attrs(subjectInput, {
	            value: sub.textContent
	        });
	    }
	    gSubDropdownbox.appendChild(subjectWrapper);
	    subjectWrapper.appendChild(subjectInput);
	    // Add content option 1
	    startY = content.getBBox().y;
	    height = content.getBBox().height;
	    const tem = addTxt('Template', startX + 10, startY + PADDING_Y * 5);
	    gSubDropdownbox.appendChild(tem);
	    Dom.attrs(tem, { class: "content-text" });
	    const template = createRect("content-option", startX, startY + height + PADDING_Y / 2, 75, 60, "", RECT_RADIUS);
	    gSubDropdownbox.insertBefore(template, tem);
	    // Add content option 2
	    startX = template.getBBox().x + template.getBBox().width + PADDING_X;
	    const txt = addTxt('Text Only', startX + 3, startY + PADDING_Y * 5);
	    gSubDropdownbox.appendChild(txt);
	    Dom.attrs(txt, { class: "content-text" });
	    const txtWrapper = createRect("content-option", startX - PADDING_X / 2, startY + height + PADDING_Y / 2, 75, 60, "", RECT_RADIUS);
	    gSubDropdownbox.insertBefore(txtWrapper, txt);
	    // Add content option 3
	    startX = txtWrapper.getBBox().x + txtWrapper.getBBox().width + PADDING_X * 2;
	    const html = addTxt('HTML', startX, startY + PADDING_Y * 5);
	    gSubDropdownbox.appendChild(html);
	    Dom.attrs(html, { class: "content-text" });
	    const htmlWrapper = createRect("content-option", startX - 3 * PADDING_X / 2, startY + height + PADDING_Y / 2, 75, 60, "", RECT_RADIUS);
	    gSubDropdownbox.insertBefore(htmlWrapper, html);
	    // Add Event Listeners
	    button.addEventListener("click", function (e) {
	        e.stopPropagation();
	        if (subjectInput.value) {
	            sub.textContent = subjectInput.value;
	        }
	        if (sendInput.value) {
	            send.textContent = sendInput.value;
	        }
	    });
	}

	class TaskStepComponent {
	    constructor(view, step, parentSequence, configuration) {
	        this.view = view;
	        this.step = step;
	        this.parentSequence = parentSequence;
	        this.configuration = configuration;
	    }
	    static create(parent, step, parentSequence, configuration) {
	        let view;
	        if (step.name === "Time Delay") {
	            view = TimeDelayTaskStepComponentView.create(parent, step, configuration);
	        }
	        else if (step.name === "Add Tag" || step.name === "Remove Tag") {
	            view = TagComponentView.create(parent, step, configuration);
	        }
	        else if (step.name === "Time Trigger") {
	            view = TimeTriggerTaskStepComponentView.create(parent, step, configuration);
	        }
	        else if (step.name === "Send Email") {
	            view = EmailComponentView.create(parent, step, configuration);
	        }
	        else {
	            view = TriggerComponentView.create(parent, step, configuration);
	        }
	        return new TaskStepComponent(view, step, parentSequence, configuration);
	    }
	    findByElement(element) {
	        return this.view.containsElement(element) ? this : null;
	    }
	    findById(stepId) {
	        return this.step.id === stepId ? this : null;
	    }
	    getPlaceholders() {
	        // Nothing to do here.
	    }
	    setIsDragging(isDragging) {
	        this.view.setIsDragging(isDragging);
	    }
	    setState(state) {
	        switch (state) {
	            case StepComponentState.default:
	                this.view.setIsSelected(false);
	                this.view.setIsDisabled(false);
	                break;
	            case StepComponentState.selected:
	                this.view.setIsDisabled(false);
	                this.view.setIsSelected(true);
	                break;
	            case StepComponentState.dragging:
	                this.view.setIsDisabled(true);
	                this.view.setIsSelected(false);
	                break;
	        }
	    }
	    validate() {
	        const isValid = this.configuration.validator
	            ? this.configuration.validator(this.step)
	            : true;
	        this.view.setIsValid(isValid);
	        return isValid;
	    }
	}

	class StepComponentFactory {
	    static create(parent, step, parentSequence, configuration) {
	        switch (step.componentType) {
	            case ComponentType.task:
	                return TaskStepComponent.create(parent, step, parentSequence, configuration);
	            case ComponentType.switch:
	                return SwitchStepComponent.create(parent, step, parentSequence, configuration);
	            default:
	                throw new Error(`Unknown component type: ${step.componentType}`);
	        }
	    }
	}

	const SAFE_OFFSET = 10;
	class DragStepView {
	    constructor(width, height, layer) {
	        this.width = width;
	        this.height = height;
	        this.layer = layer;
	    }
	    static create(step, configuration) {
	        const theme = configuration.theme || 'light';
	        const layer = Dom.element('div', {
	            class: `sqd-drag sqd-theme-${theme}`
	        });
	        document.body.appendChild(layer);
	        const canvas = Dom.svg('svg');
	        layer.appendChild(canvas);
	        const fakeSequence = [];
	        const stepComponent = StepComponentFactory.create(canvas, step, fakeSequence, configuration.steps);
	        Dom.attrs(canvas, {
	            width: stepComponent.view.width + SAFE_OFFSET * 2,
	            height: stepComponent.view.height + SAFE_OFFSET * 2
	        });
	        Dom.translate(stepComponent.view.g, SAFE_OFFSET, SAFE_OFFSET);
	        return new DragStepView(stepComponent.view.width, stepComponent.view.height, layer);
	    }
	    setPosition(position) {
	        this.layer.style.top = position.y - SAFE_OFFSET + 'px';
	        this.layer.style.left = position.x - SAFE_OFFSET + 'px';
	    }
	    remove() {
	        document.body.removeChild(this.layer);
	    }
	}

	class PlaceholderFinder {
	    constructor(placeholders, context) {
	        this.placeholders = placeholders;
	        this.context = context;
	        this.clearCacheHandler = () => this.clearCache();
	    }
	    static create(placeholders, context) {
	        const checker = new PlaceholderFinder(placeholders, context);
	        context.onViewPortChanged.subscribe(checker.clearCacheHandler);
	        window.addEventListener('scroll', checker.clearCacheHandler, false);
	        return checker;
	    }
	    find(vLt, vWidth, vHeight) {
	        var _a;
	        if (!this.cache) {
	            this.cache = this.placeholders.map(placeholder => {
	                const rect = placeholder.element.getBoundingClientRect();
	                return {
	                    placeholder,
	                    lt: new Vector(rect.x, rect.y),
	                    br: new Vector(rect.x + rect.width, rect.y + rect.height)
	                };
	            });
	            this.cache.sort((a, b) => a.lt.y - b.lt.y);
	        }
	        const vR = vLt.x + vWidth;
	        const vB = vLt.y + vHeight;
	        return (_a = this.cache.find(p => {
	            return Math.max(vLt.x, p.lt.x) < Math.min(vR, p.br.x) && Math.max(vLt.y, p.lt.y) < Math.min(vB, p.br.y);
	        })) === null || _a === void 0 ? void 0 : _a.placeholder;
	    }
	    destroy() {
	        this.context.onViewPortChanged.unsubscribe(this.clearCacheHandler);
	        window.removeEventListener('scroll', this.clearCacheHandler, false);
	    }
	    clearCache() {
	        this.cache = undefined;
	    }
	}

	class DragStepBehavior {
	    constructor(view, context, step, movingStepComponent) {
	        this.view = view;
	        this.context = context;
	        this.step = step;
	        this.movingStepComponent = movingStepComponent;
	    }
	    static create(context, step, movingStepComponent) {
	        const view = DragStepView.create(step, context.configuration);
	        return new DragStepBehavior(view, context, step, movingStepComponent);
	    }
	    onStart(position) {
	        let offset;
	        this.step["createdAt"] = new Date();
	        this.step["createdBy"] = "userID";
	        this.step["updatedAt"] = new Date();
	        this.step["updatedBy"] = "userID";
	        if (this.movingStepComponent) {
	            this.movingStepComponent.setState(StepComponentState.dragging);
	            const clientPosition = this.movingStepComponent.view.getClientPosition();
	            offset = position.subtract(clientPosition);
	        }
	        else {
	            offset = new Vector(this.view.width / 2, this.view.height / 2);
	        }
	        this.view.setPosition(position.subtract(offset));
	        this.context.setIsDragging(true);
	        this.state = {
	            startPosition: position,
	            finder: PlaceholderFinder.create(this.context.getPlaceholders(), this.context),
	            offset,
	        };
	    }
	    onMove(delta) {
	        if (this.state) {
	            const newPosition = this.state.startPosition
	                .subtract(delta)
	                .subtract(this.state.offset);
	            this.view.setPosition(newPosition);
	            const placeholder = this.state.finder.find(newPosition, this.view.width, this.view.height);
	            if (this.currentPlaceholder !== placeholder) {
	                if (this.currentPlaceholder) {
	                    this.currentPlaceholder.setIsHover(false);
	                }
	                if (placeholder) {
	                    placeholder.setIsHover(true);
	                }
	                this.currentPlaceholder = placeholder;
	            }
	        }
	    }
	    onEnd(interrupt) {
	        if (!this.state) {
	            throw new Error("Invalid state");
	        }
	        this.state.finder.destroy();
	        this.state = undefined;
	        this.view.remove();
	        this.context.setIsDragging(false);
	        let modified = false;
	        if (!interrupt && this.currentPlaceholder) {
	            if (this.movingStepComponent) {
	                modified = this.context.tryMoveStep(this.movingStepComponent.parentSequence, this.movingStepComponent.step, this.currentPlaceholder.parentSequence, this.currentPlaceholder.index);
	            }
	            else {
	                modified = this.context.tryInsertStep(this.step, this.currentPlaceholder.parentSequence, this.currentPlaceholder.index);
	            }
	        }
	        else if (this.step.id.startsWith("copy-") && this.currentPlaceholder) {
	            modified = this.context.tryInsertStep(this.step, this.currentPlaceholder.parentSequence, this.currentPlaceholder.index);
	        }
	        if (!modified) {
	            if (this.movingStepComponent) {
	                this.movingStepComponent.setState(StepComponentState.default);
	            }
	            if (this.currentPlaceholder) {
	                this.currentPlaceholder.setIsHover(false);
	            }
	        }
	        this.currentPlaceholder = undefined;
	        if (this.context.provider != undefined) {
	            // console.log(this.context.provider);
	            this.context.provider.render();
	        }
	    }
	}

	const regexp = /^[a-zA-Z][a-zA-Z0-9_-]+$/;
	class TypeValidator {
	    static validate(type) {
	        if (!regexp.test(type)) {
	            throw new Error(`Step type "${type}" contains not allowed characters`);
	        }
	    }
	}

	class Uid {
	    static next() {
	        const bytes = new Uint8Array(16);
	        window.crypto.getRandomValues(bytes);
	        return Array.from(bytes, v => v.toString(16).padStart(2, '0')).join('');
	    }
	}

	class ToolboxItemView {
	    constructor(root) {
	        this.root = root;
	    }
	    static create(parent, step, configuration) {
	        const root = Dom.element('div', {
	            class: `sqd-toolbox-item sqd-type-${step.type}`,
	            title: step.name
	        });
	        const iconUrl = configuration.iconUrlProvider ? configuration.iconUrlProvider(step.componentType, step.type) : null;
	        const icon = Dom.element('div', {
	            class: 'sqd-toolbox-item-icon'
	        });
	        if (iconUrl) {
	            const iconImage = Dom.element('img', {
	                class: 'sqd-toolbox-item-icon-image',
	                src: iconUrl
	            });
	            icon.appendChild(iconImage);
	        }
	        else {
	            icon.classList.add('sqd-no-icon');
	        }
	        const text = Dom.element('div', {
	            class: 'sqd-toolbox-item-text'
	        });
	        text.textContent = step.name;
	        root.appendChild(icon);
	        root.appendChild(text);
	        parent.appendChild(root);
	        return new ToolboxItemView(root);
	    }
	    bindMousedown(handler) {
	        this.root.addEventListener('mousedown', handler, false);
	    }
	    bindTouchstart(handler) {
	        this.root.addEventListener('touchstart', handler, false);
	    }
	    bindContextMenu(handler) {
	        this.root.addEventListener('contextmenu', handler, false);
	    }
	}

	class ToolboxItem {
	    constructor(step, context) {
	        this.step = step;
	        this.context = context;
	    }
	    static create(parent, step, context) {
	        TypeValidator.validate(step.type);
	        const view = ToolboxItemView.create(parent, step, context.configuration.steps);
	        const item = new ToolboxItem(step, context);
	        view.bindMousedown(e => item.onMousedown(e));
	        view.bindTouchstart(e => item.onTouchstart(e));
	        view.bindContextMenu(e => item.onContextMenu(e));
	        return item;
	    }
	    onTouchstart(e) {
	        e.preventDefault();
	        if (e.touches.length === 1) {
	            e.stopPropagation();
	            this.startDrag(readTouchPosition(e));
	        }
	    }
	    onMousedown(e) {
	        e.stopPropagation();
	        const isPrimaryButton = e.button === 0;
	        if (isPrimaryButton) {
	            this.startDrag(readMousePosition(e));
	        }
	    }
	    onContextMenu(e) {
	        e.preventDefault();
	    }
	    startDrag(position) {
	        if (!this.context.isReadonly) {
	            const newStep = createStep$1(this.step);
	            this.context.behaviorController.start(position, DragStepBehavior.create(this.context, newStep));
	        }
	    }
	}
	function createStep$1(step) {
	    const newStep = ObjectCloner.deepClone(step);
	    newStep.id = Uid.next();
	    return newStep;
	}

	class ToolboxView {
	    constructor(header, headerToggleIcon, body, filterInput, scrollboxView1, scrollboxView2, context) {
	        this.header = header;
	        this.headerToggleIcon = headerToggleIcon;
	        this.body = body;
	        this.filterInput = filterInput;
	        this.scrollboxView1 = scrollboxView1;
	        this.scrollboxView2 = scrollboxView2;
	        this.context = context;
	    }
	    static create(parent, context) {
	        const root = Dom.element('div', {
	            class: 'sqd-toolbox'
	        });
	        const header = Dom.element('div', {
	            class: 'sqd-toolbox-header'
	        });
	        const headerTitle = Dom.element('div', {
	            class: 'sqd-toolbox-header-title'
	        });
	        headerTitle.innerText = 'Toolbox';
	        const headerToggleIcon = Icons.create('sqd-toolbox-toggle-icon');
	        const body = Dom.element('div', {
	            class: 'sqd-toolbox-body'
	        });
	        const filterInput = Dom.element('input', {
	            class: 'sqd-toolbox-filter',
	            type: 'text',
	            placeholder: 'Search...'
	        });
	        //root.appendChild(header);
	        root.appendChild(body);
	        //header.appendChild(headerTitle);
	        //header.appendChild(headerToggleIcon);
	        //body.appendChild(filterInput);
	        parent.appendChild(root);
	        const scrollboxView1 = ScrollBoxView.create(body, parent);
	        const scrollboxView2 = ScrollBoxView.create(body, parent);
	        return new ToolboxView(header, headerToggleIcon, body, filterInput, scrollboxView1, scrollboxView2, context);
	    }
	    bindToggleIsCollapsedClick(handler) {
	        function forward(e) {
	            e.preventDefault();
	            handler();
	        }
	        this.header.addEventListener('click', forward, false);
	    }
	    bindFilterInputChange(handler) {
	        function forward(e) {
	            handler(e.target.value);
	        }
	        this.filterInput.addEventListener('keyup', forward, false);
	        this.filterInput.addEventListener('blur', forward, false);
	    }
	    setIsCollapsed(isCollapsed) {
	        Dom.toggleClass(this.body, isCollapsed, 'sqd-hidden');
	        this.headerToggleIcon.innerHTML = isCollapsed ? Icons.arrowDown : Icons.close;
	        if (!isCollapsed) {
	            this.scrollboxView1.refresh();
	            this.scrollboxView2.refresh();
	        }
	    }
	    // public setGroups(groups: ToolboxGroupConfiguration[]) {
	    // 	const list = Dom.element('div');
	    // 	groups.forEach(group => {
	    // 		const groupTitle = Dom.element('div', {
	    // 			class: 'sqd-toolbox-group-title'
	    // 		});
	    // 		groupTitle.innerText = group.name;
	    // 		list.appendChild(groupTitle);
	    // 		group.steps.forEach(s => ToolboxItem.create(list, s, this.context));
	    // 	});
	    // 	this.scrollboxView1.setContent(list);
	    // }
	    setGroups(groups) {
	        const list1 = Dom.element('div');
	        const list2 = Dom.element('div');
	        //groups.forEach(group => {
	        const groupTitle1 = Dom.element('div', {
	            class: 'sqd-scrollbox-title-1'
	            //class: 'sqd-toolbox-group-title'
	        });
	        groupTitle1.innerText = "Filter";
	        const groupTitle2 = Dom.element('div', {
	            class: 'sqd-scrollbox-title-2'
	            //class: 'sqd-toolbox-group-title'
	        });
	        groupTitle1.innerText = "Filter";
	        groupTitle2.innerText = "Action";
	        list1.appendChild(groupTitle1);
	        list2.appendChild(groupTitle2);
	        //});
	        groups[0].steps.forEach(s => ToolboxItem.create(list1, s, this.context));
	        groups[1].steps.forEach(s => ToolboxItem.create(list2, s, this.context));
	        this.scrollboxView1.setContent(list1);
	        this.scrollboxView2.setContent(list2);
	    }
	    destroy() {
	        this.scrollboxView1.destroy();
	        this.scrollboxView2.destroy();
	    }
	}

	class Toolbox {
	    constructor(view, context) {
	        this.view = view;
	        this.context = context;
	    }
	    static create(parent, context) {
	        const view = ToolboxView.create(parent, context);
	        view.setIsCollapsed(context.isToolboxCollapsed);
	        const toolbox = new Toolbox(view, context);
	        toolbox.render();
	        context.onIsToolboxCollapsedChanged.subscribe(ic => toolbox.onIsToolboxCollapsedChanged(ic));
	        view.bindToggleIsCollapsedClick(() => toolbox.toggleIsCollapsedClick());
	        view.bindFilterInputChange(v => toolbox.onFilterInputChanged(v));
	        return toolbox;
	    }
	    destroy() {
	        this.view.destroy();
	    }
	    render() {
	        const groups = this.context.configuration.toolbox.groups
	            .map(g => {
	            return {
	                name: g.name,
	                steps: g.steps.filter(s => {
	                    return this.filter ? s.name.toLowerCase().includes(this.filter) : true;
	                })
	            };
	        })
	            .filter(g => g.steps.length > 0);
	        this.view.setGroups(groups);
	    }
	    toggleIsCollapsedClick() {
	        this.context.toggleIsToolboxCollapsed();
	    }
	    onIsToolboxCollapsedChanged(isCollapsed) {
	        this.view.setIsCollapsed(isCollapsed);
	    }
	    onFilterInputChanged(value) {
	        this.filter = value.toLowerCase();
	        this.render();
	    }
	}

	class MoveViewPortBehavior {
	    constructor(startPosition, context) {
	        this.startPosition = startPosition;
	        this.context = context;
	    }
	    static create(context) {
	        return new MoveViewPortBehavior(context.viewPort.position, context);
	    }
	    onStart() {
	        this.context.setSelectedStep(null);
	    }
	    onMove(delta) {
	        const newPosition = this.startPosition.subtract(delta);
	        this.context.setViewPort(newPosition, this.context.viewPort.scale);
	    }
	    onEnd() {
	        // Nothing to do.
	    }
	}

	class SelectStepBehavior {
	    constructor(pressedStepComponent, context) {
	        this.pressedStepComponent = pressedStepComponent;
	        this.context = context;
	    }
	    static create(pressedStepComponent, context) {
	        return new SelectStepBehavior(pressedStepComponent, context);
	    }
	    onStart() {
	        // Nothing to do.
	    }
	    onMove(delta) {
	        if (!this.context.isReadonly && delta.distance() > 2) {
	            this.context.setSelectedStep(null);
	            return DragStepBehavior.create(this.context, this.pressedStepComponent.step, this.pressedStepComponent);
	        }
	    }
	    onEnd(interrupt) {
	        if (!interrupt) {
	            this.context.setSelectedStep(this.pressedStepComponent.step);
	        }
	    }
	}

	function race(timeout, a, b) {
	    const value = [undefined, undefined];
	    const result = new SimpleEvent();
	    let scheduled = false;
	    function forward() {
	        if (scheduled) {
	            return;
	        }
	        scheduled = true;
	        setTimeout(() => {
	            try {
	                result.forward(value);
	            }
	            finally {
	                scheduled = false;
	                value.fill(undefined);
	            }
	        }, timeout);
	    }
	    [a, b]
	        .filter(e => e)
	        .forEach((e, index) => {
	        e.subscribe(v => {
	            value[index] = v;
	            forward();
	        });
	    });
	    return result;
	}

	const SIZE = 30;
	const LABEL_HEIGHT$1 = 40;
	const LABEL_PADDING_X$1 = 10;
	const MIN_LABEL_WIDTH = 50;
	class StartComponentView {
	    constructor(g, width, height, joinX, component) {
	        this.g = g;
	        this.width = width;
	        this.height = height;
	        this.joinX = joinX;
	        this.component = component;
	    }
	    static create(parent, sequence, configuration) {
	        const g = Dom.svg("g");
	        parent.appendChild(g);
	        const sequenceComponent = SequenceComponent.create(g, sequence, configuration);
	        const view = sequenceComponent.view;
	        let startCircle;
	        if (sequence.length == 0) {
	            startCircle = createCircle(g, view.joinX - SIZE / 3, 0, "Click here to choose your trigger");
	        }
	        else if (!sequence[0].id.startsWith("start-component")) {
	            startCircle = createCircle(g, view.joinX - SIZE / 3, 0, "Click here to choose your trigger");
	        }
	        else {
	            startCircle = createCircle(g, view.joinX - SIZE / 3, 0, " ");
	        }
	        // Dom.translate(startCircle, view.joinX - SIZE / 2, 0);
	        g.appendChild(startCircle);
	        Dom.translate(view.g, 0, SIZE);
	        return new StartComponentView(g, view.width, view.height + SIZE * 2, view.joinX, sequenceComponent);
	    }
	    getClientPosition() {
	        throw new Error("Not supported");
	    }
	    destroy() {
	        var _a;
	        (_a = this.g.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this.g);
	    }
	}
	function createCircle(parent, x, y, text) {
	    let g = Dom.svg("g", {
	        class: "sqd-start",
	        id: "start",
	    });
	    parent.appendChild(g);
	    if (text == " ") {
	        Dom.attrs(g, {
	            visibility: "hidden",
	        });
	        // return g;
	    }
	    const nameText = Dom.svg("text", {
	        class: "sqd-label-text",
	        x,
	        y: y + LABEL_HEIGHT$1 / 2,
	    });
	    nameText.textContent = text;
	    g.appendChild(nameText);
	    const nameWidth = Math.max(g.getBBox().width + LABEL_PADDING_X$1 * 2, MIN_LABEL_WIDTH);
	    const nameRect = Dom.svg("rect", {
	        class: "sqd-label-rect",
	        width: nameWidth,
	        height: LABEL_HEIGHT$1,
	        x: x - nameWidth / 2,
	        y,
	        rx: 10,
	        ry: 10,
	    });
	    g.insertBefore(nameRect, nameText);
	    return g;
	}

	class StartComponent {
	    constructor(view) {
	        this.view = view;
	    }
	    static create(parent, sequence, configuration) {
	        const view = StartComponentView.create(parent, sequence, configuration);
	        return new StartComponent(view);
	    }
	    findByElement(element) {
	        return this.view.component.findByElement(element);
	    }
	    findById(stepId) {
	        return this.view.component.findById(stepId);
	    }
	    getPlaceholders(result) {
	        this.view.component.getPlaceholders(result);
	    }
	    setIsDragging(isDragging) {
	        this.view.component.setIsDragging(isDragging);
	    }
	    validate() {
	        return this.view.component.validate();
	    }
	}

	const GRID_SIZE = 48;
	let lastGridPatternId = 0;
	class WorkspaceView {
	    constructor(workspace, canvas, gridPattern, gridPatternPath, foreground, configuration) {
	        this.workspace = workspace;
	        this.canvas = canvas;
	        this.gridPattern = gridPattern;
	        this.gridPatternPath = gridPatternPath;
	        this.foreground = foreground;
	        this.configuration = configuration;
	        this.onResizeHandler = () => this.onResize();
	    }
	    static create(parent, configuration) {
	        const defs = Dom.svg("defs");
	        const gridPatternId = "sqd-grid-pattern-" + lastGridPatternId++;
	        const gridPattern = Dom.svg("pattern", {
	            id: gridPatternId,
	            patternUnits: "userSpaceOnUse",
	        });
	        const gridPatternPath = Dom.svg("path", {
	            class: "sqd-grid-path",
	            fill: "none",
	        });
	        defs.appendChild(gridPattern);
	        gridPattern.appendChild(gridPatternPath);
	        const foreground = Dom.svg("g");
	        const workspace = Dom.element("div", {
	            class: "sqd-workspace",
	        });
	        const canvas = Dom.svg("svg", {
	            class: "sqd-workspace-canvas",
	        });
	        canvas.appendChild(defs);
	        canvas.appendChild(Dom.svg("rect", {
	            width: "100%",
	            height: "100%",
	            fill: `url(#${gridPatternId})`,
	        }));
	        canvas.appendChild(foreground);
	        workspace.appendChild(canvas);
	        parent.appendChild(workspace);
	        const view = new WorkspaceView(workspace, canvas, gridPattern, gridPatternPath, foreground, configuration);
	        window.addEventListener("resize", view.onResizeHandler, false);
	        return view;
	    }
	    editStartComp(sequence, journeyID) {
	        const start = document.getElementById("start");
	        const tempThis = this;
	        if (start != null) {
	            start.addEventListener("click", (e) => {
	                e.preventDefault();
	                const dialogBox = Dom.element("dialog", {
	                    class: "triggers-list",
	                });
	                const triggers = [
	                    "Subscribe",
	                    "Unsubscribe",
	                    "Place a Purchase",
	                    "Abandon Checkout",
	                    "Time Trigger",
	                ];
	                const dialogForm = Dom.element("form", {
	                    // class: 'triggers-list',
	                    method: "dialog",
	                });
	                for (let i = 0; i < triggers.length; i++) {
	                    const btn1 = Dom.element("button");
	                    Dom.attrs(btn1, {
	                        class: "triggers",
	                        type: "submit",
	                        name: "userChoice",
	                        value: i,
	                    });
	                    btn1.innerText = triggers[i];
	                    btn1.addEventListener("click", function (e) {
	                        e.preventDefault();
	                        const target = e.target;
	                        sequence.unshift({
	                            id: `start-component-${journeyID}`,
	                            componentType: ComponentType.task,
	                            type: "save",
	                            name: triggers[parseInt(target.value)],
	                            createdAt: new Date(),
	                            createdBy: "userID",
	                            updatedAt: new Date(),
	                            updatedBy: "userID",
	                            properties: {},
	                            branches: undefined,
	                        });
	                        console.log(3722, sequence);
	                        tempThis.render(sequence, journeyID);
	                        dialogBox.close();
	                    });
	                    dialogForm.appendChild(btn1);
	                    btn1.insertAdjacentHTML("afterend", "</br>");
	                }
	                dialogBox.appendChild(dialogForm);
	                // const root = document.getElementById("first-step");
	                start.appendChild(dialogBox);
	                try {
	                    dialogBox.showModal();
	                }
	                catch (error) {
	                    console.log(error);
	                }
	            });
	        }
	        // console.log(document.getElementsByClassName('start-component')[0])
	    }
	    render(sequence, journeyID) {
	        if (this.rootComponent) {
	            this.rootComponent.view.destroy();
	        }
	        this.rootComponent = StartComponent.create(this.foreground, sequence, this.configuration);
	        this.editStartComp(sequence, journeyID);
	        this.refreshSize();
	    }
	    setPositionAndScale(position, scale) {
	        const gridSize = GRID_SIZE * scale;
	        Dom.attrs(this.gridPattern, {
	            x: position.x,
	            y: position.y,
	            width: gridSize,
	            height: gridSize,
	        });
	        Dom.attrs(this.gridPatternPath, {
	            d: `M ${gridSize} 0 L 0 0 0 ${gridSize}`,
	        });
	        Dom.attrs(this.foreground, {
	            transform: `translate(${position.x}, ${position.y}) scale(${scale})`,
	        });
	    }
	    getClientPosition() {
	        const rect = this.canvas.getBoundingClientRect();
	        return new Vector(rect.x, rect.y);
	    }
	    getClientSize() {
	        return new Vector(this.canvas.clientWidth, this.canvas.clientHeight);
	    }
	    bindMouseDown(handler) {
	        this.canvas.addEventListener("mousedown", (e) => handler(readMousePosition(e), e.target, e.button), false);
	    }
	    bindTouchStart(handler) {
	        this.canvas.addEventListener("touchstart", (e) => {
	            e.preventDefault();
	            handler(readTouchPosition(e));
	        }, false);
	    }
	    bindContextMenu(handler) {
	        this.canvas.addEventListener("contextmenu", handler, false);
	    }
	    bindWheel(handler) {
	        this.canvas.addEventListener("wheel", handler, false);
	    }
	    destroy() {
	        window.removeEventListener("resize", this.onResizeHandler, false);
	    }
	    refreshSize() {
	        Dom.attrs(this.canvas, {
	            width: this.workspace.offsetWidth,
	            height: this.workspace.offsetHeight,
	        });
	    }
	    onResize() {
	        this.refreshSize();
	    }
	}

	const WHEEL_DELTA = 0.1;
	const ZOOM_DELTA = 0.2;
	class Workspace {
	    constructor(view, context) {
	        this.view = view;
	        this.context = context;
	        this.isValid = false;
	        this.selectedStepComponent = null;
	    }
	    static create(parent, context) {
	        const view = WorkspaceView.create(parent, context.configuration.steps);
	        const workspace = new Workspace(view, context);
	        setTimeout(() => {
	            workspace.render();
	            workspace.resetViewPort();
	        });
	        context.setProvider(workspace);
	        context.onViewPortChanged.subscribe((vp) => workspace.onViewPortChanged(vp));
	        context.onIsDraggingChanged.subscribe((i) => workspace.onIsDraggingChanged(i));
	        context.onIsSmartEditorCollapsedChanged.subscribe(() => workspace.onIsSmartEditorCollapsedChanged());
	        race(0, context.onDefinitionChanged, context.onSelectedStepChanged).subscribe((r) => {
	            const [defChangedDetails, selectedStep] = r;
	            if (defChangedDetails) {
	                if (defChangedDetails.rerender) {
	                    workspace.render();
	                }
	                else {
	                    workspace.revalidate();
	                }
	            }
	            else if (selectedStep !== undefined) {
	                workspace.onSelectedStepChanged(selectedStep);
	            }
	        });
	        view.bindMouseDown((p, t, b) => workspace.onMouseDown(p, t, b));
	        view.bindTouchStart((e) => workspace.onTouchStart(e));
	        view.bindContextMenu((e) => workspace.onContextMenu(e));
	        view.bindWheel((e) => workspace.onWheel(e));
	        return workspace;
	    }
	    render() {
	        this.view.render(this.context.definition.sequence, String(this.context.definition.properties.journeyId));
	        this.trySelectStep(this.context.selectedStep);
	        this.revalidate();
	    }
	    getPlaceholders() {
	        const result = [];
	        this.getRootComponent().getPlaceholders(result);
	        return result;
	    }
	    getSelectedStepComponent() {
	        if (this.selectedStepComponent) {
	            return this.selectedStepComponent;
	        }
	        throw new Error("Nothing selected");
	    }
	    getComponentByStepId(stepId) {
	        const component = this.getRootComponent().findById(stepId);
	        if (!component) {
	            throw new Error(`Cannot find component for step id: ${stepId}`);
	        }
	        return component;
	    }
	    resetViewPort() {
	        const rcv = this.getRootComponent().view;
	        const clientSize = this.view.getClientSize();
	        const x = Math.max(0, (clientSize.x - rcv.width) / 2);
	        const y = Math.max(0, (clientSize.y - rcv.height) / 2);
	        this.context.setViewPort(new Vector(x, y), 1);
	    }
	    zoom(direction) {
	        const delta = direction ? ZOOM_DELTA : -ZOOM_DELTA;
	        const scale = this.context.limitScale(this.context.viewPort.scale + delta);
	        this.context.setViewPort(this.context.viewPort.position, scale);
	    }
	    moveViewPortToStep(stepComponent) {
	        const vp = this.context.viewPort;
	        const componentPosition = stepComponent.view.getClientPosition();
	        const clientSize = this.view.getClientSize();
	        const realPos = vp.position
	            .divideByScalar(vp.scale)
	            .subtract(componentPosition.divideByScalar(vp.scale));
	        const componentOffset = new Vector(stepComponent.view.width, stepComponent.view.height).divideByScalar(2);
	        this.context.animateViewPort(realPos.add(clientSize.divideByScalar(2)).subtract(componentOffset), 1);
	    }
	    destroy() {
	        this.view.destroy();
	    }
	    revalidate() {
	        this.isValid = this.getRootComponent().validate();
	    }
	    onMouseDown(position, target, button) {
	        const isPrimaryButton = button === 0;
	        const isMiddleButton = button === 1;
	        if (isPrimaryButton || isMiddleButton) {
	            this.startBehavior(target, position, isMiddleButton);
	        }
	    }
	    onTouchStart(position) {
	        const element = document.elementFromPoint(position.x, position.y);
	        if (element) {
	            this.startBehavior(element, position, false);
	        }
	    }
	    onContextMenu(e) {
	        e.preventDefault();
	    }
	    startBehavior(target, position, forceMoveMode) {
	        const title = document.getElementsByClassName("info-box-title")[0];
	        this.context.definition.properties.journeyName = String(title.textContent);
	        const clickedStep = !forceMoveMode && !this.context.isMoveModeEnabled
	            ? this.getRootComponent().findByElement(target)
	            : null;
	        if (clickedStep) {
	            this.context.behaviorController.start(position, SelectStepBehavior.create(clickedStep, this.context));
	            const fakeThis = this.context;
	            if (clickedStep.step.componentType === ComponentType.switch) {
	                const copyButton = document.getElementById(`RightCopyIcon-${clickedStep.step.id}`);
	                copyButton === null || copyButton === void 0 ? void 0 : copyButton.addEventListener("click", function (e) {
	                    console.log("copy switch");
	                    promptChoices(fakeThis);
	                });
	                const deleteButton = document.getElementById(`RightDeleteIcon-${clickedStep.step.id}`);
	                if (deleteButton) {
	                    deleteButton.addEventListener("click", function (e) {
	                        console.log("trying to delete switch");
	                        fakeThis.tryDeleteStep(clickedStep.step);
	                    });
	                }
	            }
	            else if (clickedStep.step.componentType === ComponentType.task) {
	                // Copy buttons
	                const rightCopy = document.getElementById(`RightCopyIcon-${clickedStep.step.id}`);
	                if (rightCopy) {
	                    rightCopy.onclick = function (e) {
	                        e.preventDefault();
	                        e.stopPropagation();
	                        const duplicateStep = createStep(clickedStep.step);
	                        const pos = readMousePosition(e);
	                        console.log("button clicked", pos);
	                        console.log(duplicateStep);
	                        duplicateStep.id =
	                            "copy-" + clickedStep.step.id + "-at-" + Date.now();
	                        fakeThis.behaviorController.start(pos, DragStepBehavior.create(fakeThis, duplicateStep));
	                    };
	                }
	                const upCopy = document.getElementById(`UpCopyIcon-${clickedStep.step.id}`);
	                if (upCopy) {
	                    upCopy.onclick = function (e) {
	                        e.preventDefault();
	                        e.stopPropagation();
	                        const duplicateStep = createStep(clickedStep.step);
	                        const pos = readMousePosition(e);
	                        duplicateStep.id =
	                            "copy-" + clickedStep.step.id + "-at-" + Date.now();
	                        fakeThis.behaviorController.start(pos, DragStepBehavior.create(fakeThis, duplicateStep));
	                    };
	                }
	                // Delete Buttons
	                const rightDelete = document.getElementById(`RightDeleteIcon-${clickedStep.step.id}`);
	                if (rightDelete) {
	                    rightDelete.onclick = function (e) {
	                        e.preventDefault();
	                        e.stopPropagation();
	                        fakeThis.tryDeleteStep(clickedStep.step);
	                    };
	                }
	                const upDelete = document.getElementById(`UpDeleteIcon-${clickedStep.step.id}`);
	                if (upDelete) {
	                    upDelete.onclick = function (e) {
	                        e.preventDefault();
	                        e.stopPropagation();
	                        fakeThis.tryDeleteStep(clickedStep.step);
	                    };
	                }
	            }
	        }
	        else {
	            var but = document.querySelectorAll(".Collapsed");
	            if (but) {
	                but.forEach((e) => e.classList.add("sqd-hidden"));
	            }
	            this.context.behaviorController.start(position, MoveViewPortBehavior.create(this.context));
	        }
	    }
	    onWheel(e) {
	        const viewPort = this.context.viewPort;
	        const mousePoint = new Vector(e.pageX, e.pageY).subtract(this.view.getClientPosition());
	        // The real point is point on canvas with no scale.
	        const mouseRealPoint = mousePoint
	            .divideByScalar(viewPort.scale)
	            .subtract(viewPort.position.divideByScalar(viewPort.scale));
	        const wheelDelta = e.deltaY > 0 ? -WHEEL_DELTA : WHEEL_DELTA;
	        const newScale = this.context.limitScale(viewPort.scale + wheelDelta);
	        const position = mouseRealPoint.multiplyByScalar(-newScale).add(mousePoint);
	        const scale = newScale;
	        this.context.setViewPort(position, scale);
	    }
	    onIsDraggingChanged(isDragging) {
	        this.getRootComponent().setIsDragging(isDragging);
	    }
	    onIsSmartEditorCollapsedChanged() {
	        setTimeout(() => this.view.refreshSize());
	    }
	    onViewPortChanged(viewPort) {
	        this.view.setPositionAndScale(viewPort.position, viewPort.scale);
	    }
	    onSelectedStepChanged(step) {
	        this.trySelectStep(step);
	    }
	    trySelectStep(step) {
	        if (this.selectedStepComponent) {
	            this.selectedStepComponent.setState(StepComponentState.default);
	            this.selectedStepComponent = null;
	        }
	        if (step) {
	            this.selectedStepComponent = this.getRootComponent().findById(step.id);
	            if (!this.selectedStepComponent) {
	                throw new Error(`Cannot find a step component by id ${step.id}`);
	            }
	            this.selectedStepComponent.setState(StepComponentState.selected);
	        }
	    }
	    getRootComponent() {
	        if (this.view.rootComponent) {
	            return this.view.rootComponent;
	        }
	        throw new Error("Root component not found");
	    }
	}
	function promptChoices(tempContext) {
	    // Copy
	    // Create a dialog window
	    const dialogBox = Dom.element("dialog", {
	        class: "confirm-dialog",
	        id: "dialog-box",
	    });
	    const title = Dom.element("h3", {
	        class: "confirm-dialog-content",
	    });
	    let toDo = [
	        "Copy true path",
	        "Copy false path",
	        "Copy both",
	        "Copy condition only",
	    ];
	    title.innerText = "Which branch do you want to duplicate?";
	    const form = Dom.element("form", {
	        method: "dialog",
	        id: "dialog-form",
	    });
	    let output;
	    // Add options to dialog window
	    for (let i = 0; i < toDo.length; i++) {
	        const radio = Dom.element("input", {
	            type: "radio",
	            name: "choice",
	            value: i,
	        });
	        const choice = Dom.element("label");
	        choice.innerText = toDo[i];
	        form.appendChild(radio);
	        form.appendChild(choice);
	        choice.insertAdjacentHTML("afterend", "</br>");
	    }
	    // Buttons on window
	    dialogBox.appendChild(title);
	    const btn1 = Dom.element("button", {
	        type: "submit",
	    });
	    btn1.innerText = "Confirm";
	    form.appendChild(btn1);
	    const btn2 = Dom.element("button", {
	        type: "submit",
	    });
	    btn2.innerText = "Cancel";
	    btn2.addEventListener("click", function (e) {
	        e.preventDefault();
	        e.stopPropagation();
	        const designer = document.getElementById("designer");
	        console.log("remove dialog");
	        while (designer === null || designer === void 0 ? void 0 : designer.childNodes[1]) {
	            designer === null || designer === void 0 ? void 0 : designer.removeChild(designer.childNodes[1]);
	        }
	    });
	    form.appendChild(btn2);
	    dialogBox.appendChild(form);
	    tempContext.layoutController.parent.appendChild(dialogBox);
	    if (typeof dialogBox.showModal === "function") {
	        dialogBox.showModal();
	    }
	    else {
	        prompt("Wow from prompt window", "ok");
	    }
	    // Event Listener
	    btn1.addEventListener("click", function (e) {
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
	        // e.preventDefault();
	        e.stopPropagation();
	        var elem = document.getElementsByTagName("input");
	        for (let i = 0; i < elem.length; i++) {
	            if (elem[i].type == "radio" && elem[i].checked) {
	                output = elem[i].value;
	            }
	        }
	        if (tempContext.selectedStep) {
	            const duplicateStep = createStep(tempContext.selectedStep);
	            duplicateStep.branches.True = [];
	            duplicateStep.branches.False = [];
	            // Copy true branch
	            if (((_a = tempContext.selectedStep) === null || _a === void 0 ? void 0 : _a.branches.True.length) > 0 && (output == 0 || output == 2)) {
	                for (let i = 0; i < ((_b = tempContext.selectedStep) === null || _b === void 0 ? void 0 : _b.branches.True.length); i++) {
	                    const step = createStep((_c = tempContext.selectedStep) === null || _c === void 0 ? void 0 : _c.branches.True[i]);
	                    step.id =
	                        "copy-" +
	                            ((_d = tempContext.selectedStep) === null || _d === void 0 ? void 0 : _d.branches.True[i].id) +
	                            "-at-" +
	                            Date.now();
	                    duplicateStep.branches.True[i] = step;
	                }
	            }
	            // Copy false branch
	            if (((_e = tempContext.selectedStep) === null || _e === void 0 ? void 0 : _e.branches.False.length) > 0 && (output == 1 || output == 2)) {
	                for (let i = 0; i < ((_f = tempContext.selectedStep) === null || _f === void 0 ? void 0 : _f.branches.False.length); i++) {
	                    const step = createStep((_g = tempContext.selectedStep) === null || _g === void 0 ? void 0 : _g.branches.False[i]);
	                    step.id =
	                        "copy-" +
	                            ((_h = tempContext.selectedStep) === null || _h === void 0 ? void 0 : _h.branches.False[i].id) +
	                            "-at-" +
	                            Date.now();
	                    duplicateStep.branches.False[i] = step;
	                }
	            }
	            const pos = readMousePosition(e);
	            duplicateStep.id = "copy-" + ((_j = tempContext.selectedStep) === null || _j === void 0 ? void 0 : _j.id) + "-at-" + Date.now();
	            tempContext.behaviorController.start(pos, DragStepBehavior.create(tempContext, duplicateStep));
	            const designer = document.getElementById("designer");
	            while (designer === null || designer === void 0 ? void 0 : designer.childNodes[1]) {
	                designer === null || designer === void 0 ? void 0 : designer.removeChild(designer.childNodes[1]);
	            }
	        }
	    });
	}
	function createStep(step) {
	    const newStep = ObjectCloner.deepClone(step);
	    newStep.id = Uid.next();
	    return newStep;
	}

	const ICON_SIZE = 22;
	const LABEL_PADDING_X = 10;
	class DesignerView {
	    constructor(root, layoutController, workspace, toolbox) {
	        this.root = root;
	        this.layoutController = layoutController;
	        this.workspace = workspace;
	        this.toolbox = toolbox;
	        this.onResizeHandler = () => this.onResize();
	        this.onKeyUpHandlers = [];
	    }
	    static create(parent, context, configuration) {
	        const theme = configuration.theme || "light";
	        const root = Dom.element("div", {
	            class: `sqd-designer sqd-theme-${theme}`,
	        });
	        parent.appendChild(root);
	        const workspace = Workspace.create(root, context);
	        let toolbox = undefined;
	        if (!configuration.toolbox.isHidden) {
	            toolbox = Toolbox.create(root, context);
	        }
	        ControlBar.create(root, context);
	        if (!configuration.editors.isHidden) {
	            SmartEditor.create(root, context);
	        }
	        // Add title box
	        const info = Dom.svg("svg", {
	            class: "info-box",
	            width: 320,
	            height: 40,
	        });
	        const title = Dom.svg("text", {
	            x: 160,
	            y: 25,
	            class: "info-box-title",
	        });
	        title.textContent = String(context.definition.properties.journeyName);
	        info.appendChild(title);
	        const nameWidth = Math.max(info.getBBox().width + LABEL_PADDING_X * 2, 320);
	        console.log(info.getBBox());
	        const rect = Dom.svg("rect", {
	            class: "info-box-rect",
	            width: nameWidth,
	            height: 40,
	            rx: 20,
	            ry: 20,
	        });
	        info.insertBefore(rect, title);
	        // Expanded titlebox
	        const dialogBox = Dom.element("div", {
	            class: "info-box-prompt",
	        });
	        const dialogForm = Dom.element("form");
	        // console.log("In designer view, ", context.definition.properties.journeyName);
	        const txt = Dom.element("input", {
	            class: "info-box-prompt-input",
	            type: "text",
	            name: "title",
	            placeholder: title.textContent,
	            value: title.textContent,
	        });
	        dialogForm.appendChild(txt);
	        txt.insertAdjacentHTML("afterend", "</br>");
	        // More text contents
	        const column1 = Dom.element("div", {
	            class: "info-box-prompt-column",
	        });
	        const txt1 = Dom.element("p", { class: "info-box-prompt-column-text" });
	        txt1.textContent = "Owner";
	        column1.appendChild(txt1);
	        txt1.insertAdjacentHTML("afterend", "</br>");
	        const txt2 = Dom.element("p", { class: "info-box-prompt-column-text" });
	        txt2.textContent = "Location";
	        column1.appendChild(txt2);
	        txt2.insertAdjacentHTML("afterend", "</br>");
	        const txt3 = Dom.element("p", { class: "info-box-prompt-column-text" });
	        txt3.textContent = "Created";
	        column1.appendChild(txt3);
	        txt3.insertAdjacentHTML("afterend", "</br>");
	        const txt4 = Dom.element("p", { class: "info-box-prompt-column-text" });
	        txt4.textContent = "Last Modified";
	        column1.appendChild(txt4);
	        txt4.insertAdjacentHTML("afterend", "</br>");
	        const column2 = Dom.element("div", {
	            class: "info-box-prompt-column",
	        });
	        const txt5 = Dom.element("p", { class: "info-box-prompt-column-text" });
	        txt5.textContent = String(context.definition.properties.createdBy);
	        column2.appendChild(txt5);
	        txt5.insertAdjacentHTML("afterend", "</br>");
	        const txt6 = Dom.element("p", { class: "info-box-prompt-column-text" });
	        txt6.textContent = "Location";
	        column2.appendChild(txt6);
	        txt6.insertAdjacentHTML("afterend", "</br>");
	        const txt7 = Dom.element("p", { class: "info-box-prompt-column-text" });
	        let date = new Date(context.definition.properties.createdAt);
	        txt7.textContent =
	            date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
	        column2.appendChild(txt7);
	        txt7.insertAdjacentHTML("afterend", "</br>");
	        const txt8 = Dom.element("p", { class: "info-box-prompt-column-text" });
	        date = new Date(context.definition.properties.createdAt);
	        txt8.textContent =
	            date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
	        column2.appendChild(txt8);
	        txt8.insertAdjacentHTML("afterend", "</br>");
	        const column3 = Dom.element("div", {
	            class: "info-box-prompt-column",
	        });
	        const description = Dom.element("p", {
	            class: "info-box-prompt-column-text",
	        });
	        const descripArea = Dom.element("textarea", {
	            class: "input-box-prompt-textarea",
	            name: "description",
	            value: context.definition.properties.description,
	        });
	        description.textContent = "Description";
	        column3.appendChild(description);
	        column3.appendChild(descripArea);
	        // Buttons
	        const buttonDiv = Dom.element("div", {
	            class: "info-box-prompt-btn-div",
	        });
	        const btn1 = Dom.element("input", {
	            class: "info-box-prompt-btn",
	            type: "submit",
	            value: "Save",
	        });
	        btn1.addEventListener("click", function (e) {
	            e.preventDefault();
	            e.stopPropagation();
	            title.textContent = txt.value;
	            txt.placeholder = title.textContent;
	            txt.value = txt.placeholder;
	            context.definition.properties.journeyName = txt.value;
	            context.definition.properties.description = descripArea.value;
	            Dom.toggleClass(dialogBox, true, "sqd-hidden");
	        });
	        buttonDiv.appendChild(btn1);
	        const btn2 = Dom.element("button", {
	            class: "info-box-prompt-btn",
	        });
	        btn2.textContent = "Cancel";
	        btn2.addEventListener("click", function (e) {
	            e.stopPropagation();
	            e.preventDefault();
	            txt.value = "";
	            Dom.toggleClass(dialogBox, true, "sqd-hidden");
	        });
	        buttonDiv.appendChild(btn2);
	        // Export button
	        const btn3 = Dom.element("input", {
	            class: "info-box-prompt-btn",
	            type: "submit",
	            value: "Export",
	        });
	        btn3.addEventListener("click", function (e) {
	            e.preventDefault();
	            e.stopPropagation();
	            Dom.toggleClass(exportPanel, false, "sqd-hidden");
	        });
	        buttonDiv.appendChild(btn3);
	        const btn4 = Dom.element("button", {
	            class: "info-box-prompt-btn",
	        });
	        btn4.textContent = "Share";
	        btn4.addEventListener("click", function (e) {
	            e.stopPropagation();
	            Dom.toggleClass(dialogBox, false, "sqd-hidden");
	        });
	        buttonDiv.appendChild(btn4);
	        // Export panel view
	        const choices = [
	            "Small Jpg",
	            "Medium Jpg",
	            "Large Jpg",
	            "Smaller size",
	            "Better Quality",
	        ];
	        const exportPanel = Dom.element("div", {
	            class: "export-panel sqd-hidden",
	        });
	        const pdfForm = Dom.element("form");
	        for (let i = 3; i < choices.length; i++) {
	            const radio = Dom.element("input", {
	                type: "radio",
	                name: "pdfChoice",
	                value: i,
	            });
	            pdfForm.appendChild(radio);
	            const choice = Dom.element("label");
	            choice.innerText = choices[i];
	            pdfForm.appendChild(choice);
	            choice.insertAdjacentHTML("afterend", "</br>");
	        }
	        const exportBtnDiv = Dom.element("div", {
	            class: "info-box-prompt-btn-div",
	        });
	        const exportBtn = Dom.element("input", {
	            class: "info-box-prompt-btn",
	            type: "submit",
	            value: "Confirm",
	        });
	        exportBtn.addEventListener("click", function (e) {
	            e.preventDefault();
	            e.stopPropagation();
	            var elem = document.getElementsByTagName("input");
	            let output;
	            for (let i = 0; i < elem.length; i++) {
	                if (elem[i].type == "radio" && elem[i].checked) {
	                    output = parseInt(elem[i].value);
	                    console.log("Export pdf with: ", choices[output]);
	                }
	            }
	            Dom.toggleClass(exportPanel, true, "sqd-hidden");
	            Dom.toggleClass(dialogBox, true, "sqd-hidden");
	        });
	        exportBtnDiv.appendChild(exportBtn);
	        const exportBtn2 = Dom.element("button", {
	            class: "info-box-prompt-btn",
	        });
	        exportBtn2.innerText = "Cancel";
	        exportBtn2.addEventListener("click", function (e) {
	            e.preventDefault();
	            e.stopPropagation();
	            Dom.toggleClass(exportPanel, true, "sqd-hidden");
	        });
	        exportBtnDiv.appendChild(exportBtn2);
	        pdfForm.appendChild(exportBtnDiv);
	        exportPanel.appendChild(pdfForm);
	        dialogForm.appendChild(buttonDiv);
	        dialogBox.appendChild(dialogForm);
	        Dom.toggleClass(dialogBox, true, "sqd-hidden");
	        info.addEventListener("click", function () {
	            Dom.toggleClass(dialogBox, false, "sqd-hidden");
	        });
	        const avatarSvg = Dom.svg("svg", {
	            class: "avatar-box",
	            width: 80,
	            height: 80,
	        });
	        const avatarUrl = "../assets/avatar.svg";
	        const avatar = Dom.svg("image", {
	                href: avatarUrl,
	            })
	            ;
	        Dom.attrs(avatar, {
	            class: "avatar",
	            id: `avatar${Date.now()}`,
	            x: 20,
	            y: 15,
	            width: 3 * ICON_SIZE,
	            height: 3 * ICON_SIZE,
	        });
	        avatarSvg.appendChild(avatar);
	        root.appendChild(info);
	        root.appendChild(dialogBox);
	        root.appendChild(exportPanel);
	        root.appendChild(avatarSvg);
	        dialogForm.appendChild(column1);
	        dialogForm.appendChild(column2);
	        dialogForm.appendChild(column3);
	        const view = new DesignerView(root, context.layoutController, workspace, toolbox);
	        view.reloadLayout();
	        window.addEventListener("resize", view.onResizeHandler, false);
	        return view;
	    }
	    bindKeyUp(handler) {
	        document.addEventListener("keyup", handler, false);
	        this.onKeyUpHandlers.push(handler);
	    }
	    destroy() {
	        var _a, _b;
	        window.removeEventListener("resize", this.onResizeHandler, false);
	        this.onKeyUpHandlers.forEach((h) => document.removeEventListener("keyup", h, false));
	        this.workspace.destroy();
	        (_a = this.toolbox) === null || _a === void 0 ? void 0 : _a.destroy();
	        (_b = this.root.parentElement) === null || _b === void 0 ? void 0 : _b.removeChild(this.root);
	    }
	    onResize() {
	        this.reloadLayout();
	    }
	    reloadLayout() {
	        const isMobile = this.layoutController.isMobile();
	        Dom.toggleClass(this.root, !isMobile, "sqd-layout-desktop");
	        Dom.toggleClass(this.root, isMobile, "sqd-layout-mobile");
	    }
	}

	class LayoutController {
	    constructor(parent) {
	        this.parent = parent;
	    }
	    isMobile() {
	        return this.parent.clientWidth < 400; // TODO
	    }
	    getParent() {
	        return this.parent; // TODO
	    }
	}

	function find(sequence, needle, result) {
	    for (const step of sequence) {
	        switch (step.componentType) {
	            case ComponentType.task:
	                if (step === needle) {
	                    return true;
	                }
	                break;
	            case ComponentType.switch:
	                {
	                    if (step === needle) {
	                        result.push(step);
	                        return true;
	                    }
	                    const switchStep = step;
	                    const branchNames = Object.keys(switchStep.branches);
	                    for (const branchName of branchNames) {
	                        const branch = switchStep.branches[branchName];
	                        if (branch === needle || find(branch, needle, result)) {
	                            result.push(branchName);
	                            result.push(step);
	                            return true;
	                        }
	                    }
	                }
	                break;
	            default:
	                throw new Error(`Not supported type: ${step.componentType}`);
	        }
	    }
	    return false;
	}
	class StepsTranverser {
	    static getParents(definition, needle) {
	        const result = [];
	        find(definition.sequence, needle, result);
	        result.reverse();
	        return result;
	    }
	}

	class Utils {
	}
	Utils.nextId = Uid.next;
	Utils.getParents = StepsTranverser.getParents;

	class Designer {
	    constructor(view, context) {
	        this.view = view;
	        this.context = context;
	        this.onDefinitionChanged = new SimpleEvent();
	    }
	    static create(parent, startDefinition, configuration) {
	        if (startDefinition.properties.journeyId == "") {
	            startDefinition.properties.journeyId = Utils.nextId();
	        }
	        const definition = ObjectCloner.deepClone(startDefinition);
	        const behaviorController = new BehaviorController();
	        const layoutController = new LayoutController(parent);
	        const isMobile = layoutController.isMobile();
	        const context = new DesignerContext(definition, behaviorController, layoutController, configuration, isMobile, isMobile);
	        const view = DesignerView.create(parent, context, configuration);
	        const designer = new Designer(view, context);
	        view.bindKeyUp((e) => designer.onKeyUp(e));
	        context.onDefinitionChanged.subscribe(() => designer.onDefinitionChanged.forward(context.definition));
	        return designer;
	    }
	    getDefinition() {
	        return this.context.definition;
	    }
	    isValid() {
	        return this.view.workspace.isValid;
	    }
	    isReadonly() {
	        return this.context.isReadonly;
	    }
	    setIsReadonly(isReadonly) {
	        this.context.setIsReadonly(isReadonly);
	    }
	    getSelectedStepId() {
	        var _a;
	        return ((_a = this.context.selectedStep) === null || _a === void 0 ? void 0 : _a.id) || null;
	    }
	    selectStepById(stepId) {
	        this.context.selectStepById(stepId);
	    }
	    clearSelectedStep() {
	        this.context.setSelectedStep(null);
	    }
	    moveViewPortToStep(stepId) {
	        this.context.moveViewPortToStep(stepId);
	    }
	    destroy() {
	        this.view.destroy();
	    }
	    onKeyUp(e) {
	        const supportedKeys = ["Backspace", "Delete"];
	        if (!supportedKeys.includes(e.key)) {
	            return;
	        }
	        const ignoreTagNames = ["input", "textarea"];
	        if (document.activeElement &&
	            ignoreTagNames.includes(document.activeElement.tagName.toLowerCase())) {
	            return;
	        }
	        if (!this.context.selectedStep ||
	            this.context.isReadonly ||
	            this.context.isDragging) {
	            return;
	        }
	        e.preventDefault();
	        e.stopPropagation();
	        this.context.tryDeleteStep(this.context.selectedStep);
	    }
	}
	Designer.utils = Utils;

	return Designer;

}));
