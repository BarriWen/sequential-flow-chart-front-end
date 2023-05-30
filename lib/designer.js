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
	            console.log(parentSequence.splice(index, 1));
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
	        x: 20,
	        y: 50,
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
	        title.innerHTML = "Are you sure you want to<br>&nbsp&nbsp&nbsp&nbsp&nbspdelete the trigger?";
	    }
	    dialogBox.appendChild(title);
	    const btn1 = Dom.element("button", {
	        type: "submit",
	        class: "popup-button",
	        height: 25,
	        width: 50
	    });
	    btn1.innerText = "Confirm";
	    form.appendChild(btn1);
	    const btn2 = Dom.element("button", {
	        type: "submit",
	        class: "popup-button2",
	        height: 25,
	        width: 50
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
	    // '<path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.26 4.25c.41.41 1.07.41 1.48 0l.01-.01c.41-.41.41-1.07 0-1.48L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm-2-5h4c.28 0 .5.22.5.5s-.22.5-.5.5h-4c-.28 0-.5-.22-.5-.5s.22-.5.5-.5z"/>';
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
	Icons.zoomIn = '<path d="M2.00488 11.9961H22.0049" stroke="#3498DB" stroke-width="3" stroke-linecap="round"/><path d="M12 22V2" stroke="#3498DB" stroke-width="3" stroke-linecap="round"/>';
	// '<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>';
	Icons.zoomOut = '<path d="M2 12H22" stroke="#3498DB" stroke-width="3" stroke-linecap="round"/>';

	class ControlBarView {
	    static create(parent) {
	        const root = Dom.element('div', {
	            class: 'sqd-control-bar'
	        });
	        // const deleteButton = createButton(Icons.delete, 'Delete selected step');
	        Dom.svg("image", {
	            href: "./assets/sum.svg",
	        });
	        Dom.svg("image", {
	            href: "./assets/minus.svg",
	        });
	        // Dom.attrs(zoomInButton, {
	        // })
	        // deleteButton.classList.add('sqd-hidden');
	        // const resetButton = createButton(Icons.center, 'Reset');
	        const zoomInButton = createButton(Icons.zoomIn, 'Zoom in');
	        const zoomOutButton = createButton(Icons.zoomOut, 'Zoom out');
	        // const moveButton = createButton(Icons.move, 'Turn on/off drag and drop');
	        // moveButton.classList.add('sqd-disabled');
	        // root.appendChild(resetButton);
	        root.appendChild(zoomInButton);
	        root.appendChild(zoomOutButton);
	        // root.appendChild(moveButton);
	        // root.appendChild(deleteButton);
	        parent.appendChild(root);
	        return new ControlBarView(zoomInButton, zoomOutButton);
	    }
	    constructor(
	    // private readonly resetButton: HTMLElement,
	    zoomInButton, zoomOutButton) {
	        this.zoomInButton = zoomInButton;
	        this.zoomOutButton = zoomOutButton;
	    }
	    // public bindResetButtonClick(handler: () => void) {
	    // 	bindClick(this.resetButton, handler);
	    // }
	    bindZoomInButtonClick(handler) {
	        bindClick(this.zoomInButton, handler);
	    }
	    bindZoomOutButtonClick(handler) {
	        bindClick(this.zoomOutButton, handler);
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
	    static create(parent, context) {
	        const view = ControlBarView.create(parent);
	        const bar = new ControlBar(view, context);
	        // view.bindResetButtonClick(() => bar.onResetButtonClicked());
	        view.bindZoomInButtonClick(() => bar.onZoomInButtonClicked());
	        view.bindZoomOutButtonClick(() => bar.onZoomOutButtonClicked());
	        // view.bindMoveButtonClick(() => bar.onMoveButtonClicked());
	        // view.bindDeleteButtonClick(() => bar.onDeleteButtonClicked());
	        // context.onIsReadonlyChanged.subscribe(() => bar.onIsReadonlyChanged());
	        // context.onSelectedStepChanged.subscribe(() => bar.onSelectedStepChanged());
	        // context.onIsMoveModeEnabledChanged.subscribe(i => bar.onIsMoveModeEnabledChanged(i));
	        return bar;
	    }
	    constructor(view, context) {
	        this.view = view;
	        this.context = context;
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
	}

	class GlobalEditorView {
	    static create(content) {
	        const se = Dom.element('div', {
	            class: 'sqd-global-editor'
	        });
	        se.appendChild(content);
	        return new GlobalEditorView(se);
	    }
	    constructor(root) {
	        this.root = root;
	    }
	}

	class GlobalEditor {
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
	    constructor(view) {
	        this.view = view;
	    }
	}

	class SmartEditorView {
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
	    constructor(root, toggle, toggleIcon) {
	        this.root = root;
	        this.toggle = toggle;
	        this.toggleIcon = toggleIcon;
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
	    static create(content) {
	        const root = Dom.element('div', {
	            class: 'sqd-step-editor'
	        });
	        root.appendChild(content);
	        return new StepEditorView(root);
	    }
	    constructor(root) {
	        this.root = root;
	    }
	}

	class StepEditor {
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
	    constructor(view) {
	        this.view = view;
	    }
	}

	class SmartEditor {
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
	    constructor(view, context) {
	        this.view = view;
	        this.context = context;
	        this.currentStep = undefined;
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
	    static create(parent, viewport) {
	        const root = Dom.element('div', {
	            class: 'sqd-scrollbox'
	        });
	        parent.appendChild(root);
	        const view = new ScrollBoxView(root, viewport);
	        window.addEventListener('resize', view.onResizeHandler, false);
	        window.addEventListener('resize', view.onResizeHandler, false);
	        // root.addEventListener('wheel', e => view.onWheel(e), false);
	        // root.addEventListener('touchstart', e => view.onTouchStart(e), false);
	        root.addEventListener('mousedown', e => view.onMouseDown(e), false);
	        return view;
	    }
	    constructor(root, viewport) {
	        this.root = root;
	        this.viewport = viewport;
	        this.onResizeHandler = () => this.onResize();
	        // private readonly onTouchMoveHandler = (e: TouchEvent) => this.onTouchMove(e);
	        // private readonly onMouseMoveHandler = (e: MouseEvent) => this.onMouseMove(e);
	        // private readonly onTouchEndHandler = (e: TouchEvent) => this.onTouchEnd(e);
	        this.onMouseUpHandler = (e) => this.onMouseUp(e);
	    }
	    setContent(element) {
	        // if (this.content) {
	        // 	this.root.removeChild(this.content.element);
	        // }
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
	        let height = 300; // Math.min(this.viewport.clientHeight * maxHeightPercent, element.clientHeight);
	        // height = Math.min(height, this.viewport.clientHeight - minDistance);
	        this.root.style.height = height + 'px';
	        // element.style.top = '0px';
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
	            // window.addEventListener('touchmove', this.onTouchMoveHandler, false);
	            // window.addEventListener('mousemove', this.onMouseMoveHandler, false);
	            // window.addEventListener('touchend', this.onTouchEndHandler, false);
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
	            // window.removeEventListener('touchmove', this.onTouchMoveHandler, false);
	            // window.removeEventListener('mousemove', this.onMouseMoveHandler, false);
	            // window.removeEventListener('touchend', this.onTouchEndHandler, false);
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

	class JoinView {
	    static createStraightJoin(parent, start, height) {
	        const join = Dom.svg('line', {
	            class: 'sqd-join',
	            x1: start.x,
	            y1: start.y,
	            x2: start.x,
	            y2: start.y + height,
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
	                // M 224 58 q -2.4 6.4 -8 8 l -96 0 q -5.6 1.6 -8 8
	                // "M 224 58 q 2.4 6.4 8 8 l 96 0 q 5.6 1.6 8 8"
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
	            x,
	            y: y + LABEL_HEIGHT$2 / 2,
	            class: "sqd-label-text"
	        });
	        nameText.textContent = text;
	        if (nameText.textContent == "YES") {
	            nameText.setAttribute("class", "sqd-label-text-yes sqd-label-text");
	        }
	        if (nameText.textContent == "NO") {
	            nameText.setAttribute("class", "sqd-label-text-no sqd-label-text");
	        }
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
	        // parent.insertBefore(nameRect, nameText);
	    }
	}

	class RegionView {
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
	    constructor(regions) {
	        this.regions = regions;
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
	    constructor(g) {
	        this.g = g;
	    }
	    setIsHidden(isHidden) {
	        Dom.toggleClass(this.g, isHidden, 'sqd-hidden');
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
	let component_length = 0;
	function addStop() {
	    //   const circle = Dom.svg("circle", {
	    //     class: "sqd-start-stop sqd-hidden",
	    //     cx: SIZE / 2,
	    //     cy: SIZE / 2,
	    //     r: SIZE / 2,
	    //   });
	    const g = Dom.svg("g", { class: "stop", id: "stop" });
	    //   g.appendChild(circle);
	    //   const stop = Dom.svg("rect", {
	    //     class: "sqd-start-stop-icon",
	    //     x: m,
	    //     y: m,
	    //     width: s,
	    //     height: s,
	    //     rx: 4,
	    //     ry: 4,
	    //   });
	    const endAuto = Dom.svg("image", {
	        class: "sqd-end-icon",
	        href: "./assets/end.svg",
	        width: 20,
	        height: 20,
	        x: 5,
	        y: 5,
	    });
	    const endText = Dom.svg("text", {
	        class: "sqd-end-text",
	        x: -43,
	        y: 40,
	    });
	    endText.textContent = "End this automation";
	    g.appendChild(endAuto);
	    g.appendChild(endText);
	    return g;
	}
	class SequenceComponentView {
	    static create(parent, sequence, configuration) {
	        const g = Dom.svg("g");
	        parent.appendChild(g);
	        // const gGroup = Dom.svg("g", {
	        //   class: "sqd-task-GGGroup"
	        // });
	        // g.appendChild(gGroup);
	        const components = sequence.map((s) => StepComponentFactory.create(g, s, sequence, configuration));
	        component_length = components.length;
	        // console.log(component_length);
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
	            g.insertBefore(stop, g.firstChild);
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
	            console.log("Component Length: " + components.length);
	            console.log(lines);
	            if (components.length == 1) {
	                parent.childNodes[0].removeChild(lines[1]);
	            }
	            else {
	                if (containsSwitch) {
	                    parent.childNodes[0].removeChild(lines[components.length]);
	                }
	                else {
	                    parent.childNodes[0].removeChild(lines[components.length + 1]);
	                }
	            }
	            document
	                .getElementsByClassName("sqd-input")[0]
	                .setAttribute("display", "none");
	        }
	        let holderElement = document.getElementsByClassName('sqd-placeholder');
	        Dom.attrs(holderElement[0], {
	            visibility: 'hidden'
	        });
	        let joinElement = document.getElementsByClassName('sqd-join');
	        if (joinElement.length >= 2) {
	            Dom.attrs(joinElement[0], {
	                visibility: 'hidden'
	            });
	        }
	        return new SequenceComponentView(g, maxWidth, offsetY, maxJoinX, placeholders, components);
	    }
	    constructor(g, width, height, joinX, placeholders, components) {
	        this.g = g;
	        this.width = width;
	        this.height = height;
	        this.joinX = joinX;
	        this.placeholders = placeholders;
	        this.components = components;
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
	    });
	    const circle = Dom.svg("circle", {
	        class: "sqd-placeholder-circle",
	        cx: x + PH_WIDTH / 2,
	        cy: y + PH_HEIGHT / 2,
	        r: SIZE$1 / 3 + 2,
	    });
	    const startX = x + PH_WIDTH / 2 - SIZE$1 / 8;
	    const startY = y + PH_HEIGHT / 2 - SIZE$1 / 8;
	    const endX = x + PH_WIDTH / 2 + SIZE$1 / 8;
	    const endY = y + PH_HEIGHT / 2 + SIZE$1 / 8;
	    const sign = Dom.svg("path", {
	        class: "sqd-placeholder-icon",
	        d: `M ${startX - 3.5} ${y + PH_HEIGHT / 2} H ${endX + 3.5} M ${x + PH_WIDTH / 2} ${startY - 3.5} V ${endY + 3.5}`,
	    });
	    // Outside circle
	    const outside = Dom.svg("circle", {
	        id: "outside-circle",
	        cx: x + PH_WIDTH / 2,
	        cy: y + PH_HEIGHT / 2,
	        r: 27,
	    });
	    Dom.toggleClass(outside, true, "sqd-hidden");
	    g1.appendChild(outside);
	    g1.appendChild(circle);
	    g1.appendChild(sign);
	    g.insertBefore(g1, g.children[component_length + 1]);
	    return g1;
	}

	class SequenceComponent {
	    static create(parent, sequence, configuration) {
	        const view = SequenceComponentView.create(parent, sequence, configuration);
	        return new SequenceComponent(view, sequence);
	    }
	    constructor(view, sequence) {
	        this.view = view;
	        this.sequence = sequence;
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

	// Lists of countries with ISO 3166 codes, presented in various formats.
	// Last Updated: July 30, 2020
	// If you're using PHP, I suggest checking out:
	// https://github.com/thephpleague/iso3166
	// or Laravel: https://github.com/squirephp/squire
	// 
	// JS developers can check out:
	// https://www.npmjs.com/package/iso3166-2-db
	//
	// License: CC0 1.0 Universal
	// https://creativecommons.org/publicdomain/zero/1.0/
	// List of all countries in a simple list / array.
	// Sorted alphabetical by country name (special characters on bottom)
	const usStateList = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California',
	    'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia',
	    'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
	    'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
	    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
	    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands',
	    'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
	    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island',
	    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
	const countryList = [
	    "Afghanistan",
	    "Albania",
	    "Algeria",
	    "American Samoa",
	    "Andorra",
	    "Angola",
	    "Anguilla",
	    "Antarctica",
	    "Antigua and Barbuda",
	    "Argentina",
	    "Armenia",
	    "Aruba",
	    "Australia",
	    "Austria",
	    "Azerbaijan",
	    "Bahamas (the)",
	    "Bahrain",
	    "Bangladesh",
	    "Barbados",
	    "Belarus",
	    "Belgium",
	    "Belize",
	    "Benin",
	    "Bermuda",
	    "Bhutan",
	    "Bolivia (Plurinational State of)",
	    "Bonaire, Sint Eustatius and Saba",
	    "Bosnia and Herzegovina",
	    "Botswana",
	    "Bouvet Island",
	    "Brazil",
	    "British Indian Ocean Territory (the)",
	    "Brunei Darussalam",
	    "Bulgaria",
	    "Burkina Faso",
	    "Burundi",
	    "Cabo Verde",
	    "Cambodia",
	    "Cameroon",
	    "Canada",
	    "Cayman Islands (the)",
	    "Central African Republic (the)",
	    "Chad",
	    "Chile",
	    "China",
	    "Christmas Island",
	    "Cocos (Keeling) Islands (the)",
	    "Colombia",
	    "Comoros (the)",
	    "Congo (the Democratic Republic of the)",
	    "Congo (the)",
	    "Cook Islands (the)",
	    "Costa Rica",
	    "Croatia",
	    "Cuba",
	    "Curaçao",
	    "Cyprus",
	    "Czechia",
	    "Côte d'Ivoire",
	    "Denmark",
	    "Djibouti",
	    "Dominica",
	    "Dominican Republic (the)",
	    "Ecuador",
	    "Egypt",
	    "El Salvador",
	    "Equatorial Guinea",
	    "Eritrea",
	    "Estonia",
	    "Eswatini",
	    "Ethiopia",
	    "Falkland Islands (the) [Malvinas]",
	    "Faroe Islands (the)",
	    "Fiji",
	    "Finland",
	    "France",
	    "French Guiana",
	    "French Polynesia",
	    "French Southern Territories (the)",
	    "Gabon",
	    "Gambia (the)",
	    "Georgia",
	    "Germany",
	    "Ghana",
	    "Gibraltar",
	    "Greece",
	    "Greenland",
	    "Grenada",
	    "Guadeloupe",
	    "Guam",
	    "Guatemala",
	    "Guernsey",
	    "Guinea",
	    "Guinea-Bissau",
	    "Guyana",
	    "Haiti",
	    "Heard Island and McDonald Islands",
	    "Holy See (the)",
	    "Honduras",
	    "Hong Kong",
	    "Hungary",
	    "Iceland",
	    "India",
	    "Indonesia",
	    "Iran (Islamic Republic of)",
	    "Iraq",
	    "Ireland",
	    "Isle of Man",
	    "Israel",
	    "Italy",
	    "Jamaica",
	    "Japan",
	    "Jersey",
	    "Jordan",
	    "Kazakhstan",
	    "Kenya",
	    "Kiribati",
	    "Korea (the Democratic People's Republic of)",
	    "Korea (the Republic of)",
	    "Kuwait",
	    "Kyrgyzstan",
	    "Lao People's Democratic Republic (the)",
	    "Latvia",
	    "Lebanon",
	    "Lesotho",
	    "Liberia",
	    "Libya",
	    "Liechtenstein",
	    "Lithuania",
	    "Luxembourg",
	    "Macao",
	    "Madagascar",
	    "Malawi",
	    "Malaysia",
	    "Maldives",
	    "Mali",
	    "Malta",
	    "Marshall Islands (the)",
	    "Martinique",
	    "Mauritania",
	    "Mauritius",
	    "Mayotte",
	    "Mexico",
	    "Micronesia (Federated States of)",
	    "Moldova (the Republic of)",
	    "Monaco",
	    "Mongolia",
	    "Montenegro",
	    "Montserrat",
	    "Morocco",
	    "Mozambique",
	    "Myanmar",
	    "Namibia",
	    "Nauru",
	    "Nepal",
	    "Netherlands (the)",
	    "New Caledonia",
	    "New Zealand",
	    "Nicaragua",
	    "Niger (the)",
	    "Nigeria",
	    "Niue",
	    "Norfolk Island",
	    "Northern Mariana Islands (the)",
	    "Norway",
	    "Oman",
	    "Pakistan",
	    "Palau",
	    "Palestine, State of",
	    "Panama",
	    "Papua New Guinea",
	    "Paraguay",
	    "Peru",
	    "Philippines (the)",
	    "Pitcairn",
	    "Poland",
	    "Portugal",
	    "Puerto Rico",
	    "Qatar",
	    "Republic of North Macedonia",
	    "Romania",
	    "Russian Federation (the)",
	    "Rwanda",
	    "Réunion",
	    "Saint Barthélemy",
	    "Saint Helena, Ascension and Tristan da Cunha",
	    "Saint Kitts and Nevis",
	    "Saint Lucia",
	    "Saint Martin (French part)",
	    "Saint Pierre and Miquelon",
	    "Saint Vincent and the Grenadines",
	    "Samoa",
	    "San Marino",
	    "Sao Tome and Principe",
	    "Saudi Arabia",
	    "Senegal",
	    "Serbia",
	    "Seychelles",
	    "Sierra Leone",
	    "Singapore",
	    "Sint Maarten (Dutch part)",
	    "Slovakia",
	    "Slovenia",
	    "Solomon Islands",
	    "Somalia",
	    "South Africa",
	    "South Georgia and the South Sandwich Islands",
	    "South Sudan",
	    "Spain",
	    "Sri Lanka",
	    "Sudan (the)",
	    "Suriname",
	    "Svalbard and Jan Mayen",
	    "Sweden",
	    "Switzerland",
	    "Syrian Arab Republic",
	    "Taiwan",
	    "Tajikistan",
	    "Tanzania, United Republic of",
	    "Thailand",
	    "Timor-Leste",
	    "Togo",
	    "Tokelau",
	    "Tonga",
	    "Trinidad and Tobago",
	    "Tunisia",
	    "Turkey",
	    "Turkmenistan",
	    "Turks and Caicos Islands (the)",
	    "Tuvalu",
	    "Uganda",
	    "Ukraine",
	    "United Arab Emirates (the)",
	    "United Kingdom of Great Britain and Northern Ireland (the)",
	    "United States Minor Outlying Islands (the)",
	    "United States of America (the)",
	    "Uruguay",
	    "Uzbekistan",
	    "Vanuatu",
	    "Venezuela (Bolivarian Republic of)",
	    "Viet Nam",
	    "Virgin Islands (British)",
	    "Virgin Islands (U.S.)",
	    "Wallis and Futuna",
	    "Western Sahara",
	    "Yemen",
	    "Zambia",
	    "Zimbabwe",
	    "Åland Islands"
	];

	class ScrollBoxViewCountry {
	    static create(parent, viewport) {
	        const root = Dom.svg('svg', {
	            class: 'sqd-scrollbox'
	        });
	        parent.appendChild(root);
	        const view = new ScrollBoxViewCountry(root, viewport);
	        window.addEventListener('resize', view.onResizeHandler, false);
	        window.addEventListener('resize', view.onResizeHandler, false);
	        root.addEventListener('wheel', e => view.onWheel(e), false);
	        root.addEventListener('touchstart', e => view.onTouchStart(e), false);
	        root.addEventListener('mousedown', e => view.onMouseDown(e), false);
	        return view;
	    }
	    constructor(root, viewport) {
	        this.root = root;
	        this.viewport = viewport;
	        this.onResizeHandler = () => this.onResize();
	        this.onTouchMoveHandler = (e) => this.onTouchMove(e);
	        this.onMouseMoveHandler = (e) => this.onMouseMove(e);
	        this.onTouchEndHandler = (e) => this.onTouchEnd(e);
	        this.onMouseUpHandler = (e) => this.onMouseUp(e);
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
	        // this.root.style.height = height + 'px';
	        this.root.setAttribute("height", `${7000}`);
	        element.setAttribute("y", "0");
	        // element.setAttribute("top", "0"); 
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
	        let posY;
	        if (this.content && this.content.element.hasAttribute("y")) {
	            posY = this.content.element.getAttribute("y");
	            console.log(posY);
	            return parseInt(posY);
	        }
	        return 0;
	    }
	    setScrollTop(scrollTop) {
	        if (this.content) {
	            const max = 6100;
	            const limited = Math.max(Math.min(scrollTop, 0), -max);
	            // this.content.element.style.top = limited + 'px';
	            this.content.element.setAttribute("y", `${limited}`);
	            console.log("limited" + limited);
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
	}

	class ScrollBoxViewLocation {
	    static create(parent, viewport) {
	        const root = Dom.svg('svg', {
	            class: 'sqd-scrollbox'
	        });
	        parent.appendChild(root);
	        const view = new ScrollBoxViewLocation(root, viewport);
	        window.addEventListener('resize', view.onResizeHandler, false);
	        window.addEventListener('resize', view.onResizeHandler, false);
	        root.addEventListener('wheel', e => view.onWheel(e), false);
	        root.addEventListener('touchstart', e => view.onTouchStart(e), false);
	        root.addEventListener('mousedown', e => view.onMouseDown(e), false);
	        return view;
	    }
	    constructor(root, viewport) {
	        this.root = root;
	        this.viewport = viewport;
	        this.onResizeHandler = () => this.onResize();
	        this.onTouchMoveHandler = (e) => this.onTouchMove(e);
	        this.onMouseMoveHandler = (e) => this.onMouseMove(e);
	        this.onTouchEndHandler = (e) => this.onTouchEnd(e);
	        this.onMouseUpHandler = (e) => this.onMouseUp(e);
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
	        // this.root.style.height = height + 'px';
	        this.root.setAttribute("height", `${1000}`);
	        element.setAttribute("y", "0");
	        // element.setAttribute("top", "0"); 
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
	        let posY;
	        if (this.content && this.content.element.hasAttribute("y")) {
	            posY = this.content.element.getAttribute("y");
	            console.log(posY);
	            return parseInt(posY);
	        }
	        return 0;
	    }
	    setScrollTop(scrollTop) {
	        if (this.content) {
	            const max = 500;
	            const limited = Math.max(Math.min(scrollTop, 0), -max);
	            // this.content.element.style.top = limited + 'px';
	            this.content.element.setAttribute("y", `${limited}`);
	            console.log("limited" + limited);
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
	}

	const MIN_CHILDREN_WIDTH = 200;
	const PADDING_X$5 = 12;
	const PADDING_TOP = 20;
	const LABEL_HEIGHT = 22;
	const CONNECTION_HEIGHT = 16;
	const RECT_RADIUS$5 = 15;
	const MIN_TEXT_WIDTH$5 = 98;
	const PADDING_Y$5 = 10;
	const ICON_SIZE$6 = 22;
	const DROPDOWN1_W = 120;
	const DROPDOWN2_W = 125;
	const DROPDOWN_H = 25;
	class SwitchStepComponentView {
	    constructor(g, width, height, joinX, sequenceComponents, regionView, scrollboxViewCountry, scrollboxViewLocation, validationErrorView) {
	        this.g = g;
	        this.width = width;
	        this.height = height;
	        this.joinX = joinX;
	        this.sequenceComponents = sequenceComponents;
	        this.regionView = regionView;
	        this.scrollboxViewCountry = scrollboxViewCountry;
	        this.scrollboxViewLocation = scrollboxViewLocation;
	        this.validationErrorView = validationErrorView;
	    }
	    static create(parent, step, configuration) {
	        const g = Dom.svg("g", {
	            class: `sqd-switch-group sqd-type-${step.type}`,
	        });
	        // parent.appendChild(g);
	        parent.insertBefore(g, parent.firstChild);
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
	        const DROPDOWN_Y = 80;
	        const DROPDOWN_X1 = containerWidths[0] - 190; // 
	        const DROPDOWN_X2 = containerWidths[0] - 62; // 
	        const DROPDOWN_X3 = containerWidths[0] + 70; // 
	        const g1 = Dom.svg("g");
	        const text = Dom.svg("text", {
	            x: ICON_SIZE$6 + containerWidths[0] - PADDING_X$5 * 17 + 69,
	            y: boxHeight / 2.0 + PADDING_TOP + 1,
	            class: "sqd-task-text sqd-switch-text encapsulated",
	        });
	        text.textContent = "If/Else";
	        const textMid = Dom.svg("text", {
	            x: ICON_SIZE$6 + containerWidths[0] - (PADDING_X$5 * 3) - 5,
	            y: boxHeight / 2.0 + PADDING_TOP + 1,
	            class: "sqd-task-text capsule sqd-hidden",
	        });
	        textMid.textContent = "If/Else";
	        g1.appendChild(text);
	        g1.appendChild(textMid);
	        const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH$5);
	        const boxWidth = ICON_SIZE$6 + 16 * PADDING_X$5 + 2 * textWidth;
	        const rectMid = Dom.svg("rect", {
	            x: containerWidths[0] - textWidth + 56,
	            y: PADDING_TOP,
	            class: "sqd-switch-rect capsule sqd-hidden",
	            width: 90,
	            height: boxHeight,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        g1.appendChild(rectMid);
	        const rect = Dom.svg("rect", {
	            x: containerWidths[0] - textWidth - 28,
	            y: PADDING_TOP,
	            class: "sqd-switch-rect encapsulated",
	            width: 258,
	            height: boxHeight,
	            rx: 15,
	            ry: 15,
	        });
	        g1.insertBefore(rect, text);
	        const rectLeft = Dom.svg("rect", {
	            x: containerWidths[0] - textWidth - 28,
	            y: PADDING_TOP,
	            class: "sqd-switch-rect-left encapsulated",
	            width: textWidth - 35,
	            height: boxHeight,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        const textRight = Dom.svg("text", {
	            x: ICON_SIZE$6 + containerWidths[0] - PADDING_X$5 * 6,
	            y: boxHeight / 2.0 + PADDING_TOP,
	            class: "task-title switch-title encapsulated",
	            width: 300,
	        });
	        textRight.textContent = "Condition Settings";
	        g1.appendChild(textRight);
	        g1.insertBefore(rectLeft, text);
	        g1.insertBefore(rectMid, textMid);
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
	        const moreUrl = "./assets/triDotIcon.svg";
	        const moreIcon = Dom.svg("image", {
	                href: moreUrl,
	            })
	            ;
	        Dom.attrs(moreIcon, {
	            class: "moreIcon encapsulated",
	            x: ICON_SIZE$6 + containerWidths[0] + PADDING_X$5 + textWidth - 27,
	            y: PADDING_TOP * 1.2,
	            width: ICON_SIZE$6,
	            height: ICON_SIZE$6,
	        });
	        // =========== More icons
	        // =========== COPY icon
	        const rightCopyImgContainer = Dom.svg("g", {
	            class: "sqd-task-copyImgContainer",
	        });
	        const rightCopyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 90 - 77,
	            y: PADDING_Y$5 + 10, // 
	        });
	        Dom.attrs(rightCopyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const changeUrl = "./assets/copy.svg";
	        const changeIcon = Dom.svg("image", {
	                href: changeUrl,
	            })
	            ;
	        Dom.attrs(changeIcon, {
	            class: "moreicon",
	            id: `RightCopyIcon-${step.id}`,
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 93 - 77,
	            y: PADDING_Y$5 + 14,
	            width: ICON_SIZE$6,
	            height: ICON_SIZE$6,
	        });
	        rightCopyImgContainer.appendChild(rightCopyImgContainerCircle);
	        rightCopyImgContainer.appendChild(changeIcon);
	        // ============= DELETE icon 
	        const rightDeleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightDeleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 70 - 74,
	            y: PADDING_Y$5 + 43,
	        });
	        Dom.attrs(rightDeleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const deleteUrl = "./assets/delete.svg";
	        const deleteIcon = Dom.svg("image", {
	                href: deleteUrl,
	            })
	            ;
	        Dom.attrs(deleteIcon, {
	            class: "moreicon",
	            id: `RightDeleteIcon-${step.id}`,
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 73 - 74,
	            y: PADDING_Y$5 + 46,
	            width: 22,
	            height: 22,
	        });
	        rightDeleteImgContainer.appendChild(rightDeleteImgContainerCircle);
	        rightDeleteImgContainer.appendChild(deleteIcon);
	        // ============ EDIT icon
	        const rightEditImgContainer = Dom.svg("g", {
	            class: "sqd-task-editImgContainer",
	        });
	        const rightEditImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 70 - 74,
	            y: PADDING_Y$5 - 23, // -30
	        });
	        Dom.attrs(rightEditImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const editUrl = "./assets/edit.svg";
	        const editIcon = Dom.svg("image", {
	                href: editUrl,
	            })
	            ;
	        Dom.attrs(editIcon, {
	            class: "moreicon",
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 73 - 74,
	            y: PADDING_Y$5 - 19,
	            width: ICON_SIZE$6,
	            height: ICON_SIZE$6,
	        });
	        rightEditImgContainer.appendChild(rightEditImgContainerCircle);
	        rightEditImgContainer.appendChild(editIcon);
	        // =============== Up more icons
	        const checkImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const checkImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-checkContainerCircle",
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 - 26,
	            y: PADDING_Y$5 - 30,
	        });
	        Dom.attrs(checkImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCheckIconUrl = "./assets/check-inside.svg";
	        const upCheckIcon = Dom.svg("image", {
	                href: upCheckIconUrl,
	            })
	            ;
	        Dom.attrs(upCheckIcon, {
	            class: "moreicon",
	            // id: `tagUpCheckIcon`,
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 - 22,
	            y: PADDING_Y$5 - 26,
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
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 44,
	            y: PADDING_Y$5 - 30,
	        });
	        Dom.attrs(deleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upDeleteIconUrl = "./assets/delete.svg";
	        const upDeleteIcon = Dom.svg("image", {
	                href: upDeleteIconUrl,
	            })
	            ;
	        Dom.attrs(upDeleteIcon, {
	            class: "moreicon",
	            id: `UpDeleteIcon-${step.id}`,
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 48,
	            y: PADDING_Y$5 - 26,
	            width: ICON_SIZE$6,
	            height: ICON_SIZE$6,
	        });
	        deleteImgContainer.appendChild(deleteImgContainerCircle);
	        deleteImgContainer.appendChild(upDeleteIcon);
	        upDeleteIcon.addEventListener("click", function (e) {
	            console.log("Up delete clicked");
	        });
	        const copyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const copyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 11,
	            y: PADDING_Y$5 - 30,
	        });
	        Dom.attrs(copyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upchangeUrl = "./assets/change.svg";
	        const upchangeIcon = Dom.svg("image", {
	                href: upchangeUrl,
	            })
	            ;
	        Dom.attrs(upchangeIcon, {
	            class: "moreicon",
	            id: `UpChangeIcon-${step.id}`,
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 16,
	            y: PADDING_Y$5 - 26,
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
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        Dom.attrs(reminder1, {
	            id: `reminder1${Date.now()}`,
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 107 - 74,
	            y: PADDING_Y$5 - 18, // -25 -> -8
	        });
	        const reminderText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 107 + 13 - 74,
	            y: PADDING_Y$5 - 6,
	        });
	        Dom.attrs(reminderText1, {
	            //class: 'sqd-hidden',
	            id: `reminderText${Date.now()}`,
	        });
	        reminderText1.textContent = "Edit";
	        const reminder2 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        Dom.attrs(reminder2, {
	            id: `reminder2${Date.now()}`,
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 127 - 77,
	            y: PADDING_Y$5 + 13,
	        });
	        const reminderText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 127 + 10 - 77,
	            y: PADDING_Y$5 + 13 + 12,
	        });
	        Dom.attrs(reminderText2, {
	            //class: 'sqd-hidden',
	            id: `reminderText2${Date.now()}`,
	        });
	        reminderText2.textContent = "Copy";
	        const reminder3 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        Dom.attrs(reminder3, {
	            id: `reminder3${Date.now()}`,
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 107 - 74,
	            y: PADDING_Y$5 + 43,
	        });
	        const reminderText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: containerWidths[0] + 5 * PADDING_X$5 + 3 * ICON_SIZE$6 + 107 + 6 - 74,
	            y: PADDING_Y$5 + 43 + 12,
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
	        // ============ Add dropdowns =============
	        // ======= Start with general node ========
	        const gDropdown = Dom.svg("g", {
	            class: `sqd-task-group dropdown sqd-hidden`, // Collapsed
	        });
	        const gDropdownbox = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox`
	        });
	        gDropdown.appendChild(gDropdownbox);
	        const rect1 = Dom.svg("rect", {
	            x: containerWidths[0] - textWidth - 107,
	            y: PADDING_TOP + 8,
	            class: "sqd-switch-rect sqd-shrinkable",
	            width: boxWidth,
	            height: 3 * boxHeight + 10,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        Dom.attrs(rect1, {
	            id: `dropdown${Date.now()}`,
	        });
	        gDropdownbox.appendChild(rect1);
	        const rectInnerBorder = Dom.svg("rect", {
	            x: containerWidths[0] - textWidth - 100,
	            y: PADDING_TOP + 47,
	            class: "sqd-switch-inner-rect",
	            width: boxWidth - 15,
	            height: boxHeight + 20,
	            rx: RECT_RADIUS$5,
	            ry: RECT_RADIUS$5,
	        });
	        const actConditonText = Dom.svg("text", {
	            x: 263,
	            y: DROPDOWN_Y + 12,
	            class: "sqd-task-text",
	        });
	        actConditonText.textContent = "In";
	        const addConditionText = Dom.svg("text", {
	            x: DROPDOWN_X1 + 3,
	            y: PADDING_TOP + 108,
	            class: "add-cond-text",
	        });
	        addConditionText.textContent = "+ Add another condition";
	        const addSegmentBtnClickArea = Dom.svg("rect", {
	            class: "sqd-add-seg-area",
	            x: containerWidths[0] - textWidth - 94,
	            y: PADDING_TOP + 145,
	            width: boxWidth - 25,
	            height: 33,
	            fill: "rgba(255, 255, 255, 0)"
	        });
	        const addSegBtnTitle = Dom.svg("text", {
	            class: "add-seg-btn-title",
	            x: containerWidths[0] - textWidth + 96,
	            y: PADDING_TOP + 167, // 270
	        });
	        addSegBtnTitle.textContent = "Add a new segment group";
	        // addSegmentBtnArea.appendChild(addSegBtnTitle); 
	        Dom.svg("rect", {
	            class: "sqd-add-seg-btn",
	            x: containerWidths[0] - textWidth - 94,
	            y: PADDING_TOP + 145,
	            width: boxWidth - 25,
	            height: 33,
	            rx: 17,
	            ry: 17,
	        });
	        // gDropdownbox.appendChild(rectInnerBorder);
	        gDropdownbox.appendChild(actConditonText);
	        // gDropdownbox.appendChild(addSegmentBtn);
	        // gDropdownbox.appendChild(addSegBtnTitle);
	        // gDropdownbox.appendChild(addSegmentBtnClickArea);
	        // gDropdownbox.appendChild(addConditionText);
	        addSegmentBtnClickArea.addEventListener("click", function (e) {
	            console.log("add seg clicked");
	        });
	        addConditionText.addEventListener("click", function (e) {
	            console.log("add cond clicked");
	        });
	        // =============== gSubDropdown
	        const gSubDropdown = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
	        });
	        const gSubDropdown1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
	        });
	        const gSubDropdown2 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
	        });
	        const gSubDropdownAct1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
	        });
	        const gSubDropdownAct2 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
	        });
	        const gSubDropdownMain1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
	        });
	        const gSubDropdownMain2 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
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
	        const gSubDropdownboxAct1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox`,
	        });
	        const gSubDropdownboxAct2 = Dom.svg("g", {
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
	            width: DROPDOWN1_W,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#bfbfbf",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y,
	            rx: 5,
	            ry: 5,
	        });
	        const dropdownBoxShape1 = Dom.svg("rect", {
	            width: DROPDOWN2_W,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#bfbfbf",
	            x: DROPDOWN_X2,
	            y: DROPDOWN_Y,
	            rx: 5,
	            ry: 5,
	        });
	        const dropdownBoxShape2 = Dom.svg("rect", {
	            width: DROPDOWN1_W,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#bfbfbf",
	            x: DROPDOWN_X3,
	            y: DROPDOWN_Y,
	            rx: 5,
	            ry: 5,
	        });
	        const dropdownBoxShapeAct1 = Dom.svg("rect", {
	            width: DROPDOWN2_W,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#bfbfbf",
	            x: DROPDOWN_X2 - 30,
	            y: DROPDOWN_Y,
	            rx: 5,
	            ry: 5,
	        });
	        const dropdownBoxShapeAct2 = Dom.svg("rect", {
	            width: 70,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#bfbfbf",
	            x: DROPDOWN_X3 + 50,
	            y: DROPDOWN_Y,
	            rx: 5,
	            ry: 5,
	        });
	        const dropdownBoxShapeMain1 = Dom.svg("rect", {
	            width: DROPDOWN1_W,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "rgba(255, 255, 255, 0)",
	            // stroke: "#a0a0a0",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y + DROPDOWN_H + 8,
	            rx: 5,
	            ry: 5,
	        });
	        const dropdownBoxShapeMain2 = Dom.svg("rect", {
	            width: DROPDOWN1_W,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "rgba(255, 255, 255, 0)",
	            // stroke: "#a0a0a0",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y + 2 * DROPDOWN_H + 1,
	            rx: 5,
	            ry: 5,
	        });
	        // ================= dropdownRightButton
	        const downArrowLink = "./assets/downArrow.svg";
	        const upArrowLink = "./assets/upArrow.svg";
	        const downArrowSubLink = "./assets/downArrowSub.svg";
	        const upArrowSubLink = "./assets/upArrowSub.svg";
	        const dropdownRightButtonDown = Dom.svg("image", {
	            class: "sqd-task-text select-field",
	            href: downArrowLink,
	            width: 12,
	            height: 12,
	            x: DROPDOWN_X1 + DROPDOWN1_W - 20,
	            y: DROPDOWN_Y + 7,
	        });
	        const dropdownRightButtonUp = Dom.svg("image", {
	            class: "sqd-task-text select-field sqd-hidden",
	            href: upArrowLink,
	            width: 12,
	            height: 12,
	            x: DROPDOWN_X1 + DROPDOWN1_W - 20,
	            y: DROPDOWN_Y + 7,
	        });
	        const dropdownRightButtonDown1 = Dom.svg("image", {
	            class: "sqd-task-text select-field",
	            href: downArrowLink,
	            width: 12,
	            height: 12,
	            x: DROPDOWN_X2 + DROPDOWN2_W - 20,
	            y: DROPDOWN_Y + 7,
	        });
	        const dropdownRightButtonUp1 = Dom.svg("image", {
	            class: "sqd-task-text select-field sqd-hidden",
	            href: upArrowLink,
	            width: 12,
	            height: 12,
	            x: DROPDOWN_X2 + DROPDOWN2_W - 20,
	            y: DROPDOWN_Y + 7,
	        });
	        const dropdownRightButtonDown2 = Dom.svg("image", {
	            class: "sqd-task-text select-field",
	            href: downArrowLink,
	            width: 12,
	            height: 12,
	            x: DROPDOWN_X3 + 100,
	            y: DROPDOWN_Y + 7,
	        });
	        const dropdownRightButtonUp2 = Dom.svg("image", {
	            class: "sqd-task-text select-field sqd-hidden",
	            href: upArrowLink,
	            width: 12,
	            height: 12,
	            x: DROPDOWN_X3 + 100,
	            y: DROPDOWN_Y + 7,
	        });
	        const dropdownRightButtonDownAct1 = Dom.svg("image", {
	            class: "sqd-task-text select-field",
	            href: downArrowLink,
	            width: 12,
	            height: 12,
	            x: DROPDOWN_X2 - 30 + DROPDOWN2_W - 20,
	            y: DROPDOWN_Y + 7,
	        });
	        const dropdownRightButtonUpAct1 = Dom.svg("image", {
	            class: "sqd-task-text select-field sqd-hidden",
	            href: upArrowLink,
	            width: 12,
	            height: 12,
	            x: DROPDOWN_X2 - 30 + DROPDOWN2_W - 20,
	            y: DROPDOWN_Y + 7,
	        });
	        const dropdownRightButtonDownAct2 = Dom.svg("image", {
	            class: "sqd-task-text select-field",
	            href: downArrowLink,
	            width: 12,
	            height: 12,
	            x: DROPDOWN_X3 + 103,
	            y: DROPDOWN_Y + 7,
	        });
	        const dropdownRightButtonUpAct2 = Dom.svg("image", {
	            class: "sqd-task-text select-field sqd-hidden",
	            href: upArrowLink,
	            width: 12,
	            height: 12,
	            x: DROPDOWN_X3 + 103,
	            y: DROPDOWN_Y + 7,
	        });
	        const dropdownRightButtonDownMain1 = Dom.svg("image", {
	            class: "sqd-task-text select-field",
	            href: downArrowSubLink,
	            width: 9,
	            height: 9,
	            x: DROPDOWN_X1 + 100,
	            y: DROPDOWN_Y + DROPDOWN_H + 16,
	        });
	        const dropdownRightButtonUpMain1 = Dom.svg("image", {
	            class: "sqd-task-text select-field sqd-hidden",
	            href: upArrowSubLink,
	            width: 9,
	            height: 9,
	            x: DROPDOWN_X1 + 100,
	            y: DROPDOWN_Y + DROPDOWN_H + 16,
	        });
	        const dropdownRightButtonDownMain2 = Dom.svg("image", {
	            class: "sqd-task-text select-field",
	            href: downArrowSubLink,
	            width: 9,
	            height: 9,
	            x: DROPDOWN_X1 + 100,
	            y: DROPDOWN_Y + 2 * DROPDOWN_H + 9,
	        });
	        const dropdownRightButtonUpMain2 = Dom.svg("image", {
	            class: "sqd-task-text select-field sqd-hidden",
	            href: upArrowSubLink,
	            width: 9,
	            height: 9,
	            x: DROPDOWN_X1 + 100,
	            y: DROPDOWN_Y + 2 * DROPDOWN_H + 9,
	        });
	        // ================= dropdownBoxInnerText
	        const dropdownBoxInnerText = Dom.svg("text", {
	            class: "sqd-task-text dropdown-inner-text",
	            x: DROPDOWN_X1 + 5,
	            y: DROPDOWN_Y + 12,
	        });
	        if (step.properties["property"]) {
	            let property = step.properties["property"];
	            dropdownBoxInnerText.textContent = property;
	        }
	        else {
	            dropdownBoxInnerText.textContent = "Select a condition";
	            dropdownBoxInnerText.setAttribute("style", "font-size: 8pt; fill: #bfbfbf");
	        }
	        const dropdownBoxInnerText1 = Dom.svg("text", {
	            class: "sqd-task-text dropdown-inner-text",
	            x: DROPDOWN_X2 + 3,
	            y: DROPDOWN_Y + 12,
	        });
	        if (step.properties["condition"]) {
	            let property = step.properties["condition"];
	            dropdownBoxInnerText1.textContent = property;
	        }
	        else {
	            dropdownBoxInnerText1.textContent = "Is";
	            dropdownBoxInnerText1.setAttribute("style", "fill: #bfbfbf");
	        }
	        const dropdownBoxInnerText2 = Dom.svg("text", {
	            class: "sqd-task-text dropdown-inner-text",
	            x: DROPDOWN_X3 + 3,
	            y: DROPDOWN_Y + 12,
	        });
	        dropdownBoxInnerText2.textContent = "";
	        const dropdownBoxInnerTextAct1 = Dom.svg("text", {
	            class: "sqd-task-text dropdown-inner-text",
	            x: DROPDOWN_X2 - 30 + 3,
	            y: DROPDOWN_Y + 12,
	        });
	        dropdownBoxInnerText2.textContent = "";
	        const dropdownBoxInnerTextAct2 = Dom.svg("text", {
	            class: "sqd-task-text dropdown-inner-text",
	            x: DROPDOWN_X3 + 50 + 3,
	            y: DROPDOWN_Y + 12,
	        });
	        dropdownBoxInnerText2.textContent = "";
	        const dropdownBoxInnerTextMain1 = Dom.svg("text", {
	            class: "sqd-task-text main-text",
	            x: DROPDOWN_X1 + 6,
	            y: DROPDOWN_Y + DROPDOWN_H + 13 + 8,
	        });
	        dropdownBoxInnerTextMain1.textContent = "CONTACT INFO";
	        const dropdownBoxInnerTextMain2 = Dom.svg("text", {
	            class: "sqd-task-text main-text",
	            x: DROPDOWN_X1 + 6,
	            y: DROPDOWN_Y + 2 * DROPDOWN_H + 13 + 1,
	        });
	        dropdownBoxInnerTextMain2.textContent = "ACTIONS";
	        // ================== dropdownBoxShapeAfter
	        const dropdownBoxShapeAfter = Dom.svg("rect", {
	            width: DROPDOWN1_W,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#bfbfbf",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y,
	            id: `dropdownBoxShape${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfter, {
	            opacity: 0,
	        });
	        const dropdownBoxShapeAfter1 = Dom.svg("rect", {
	            width: DROPDOWN2_W,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#bfbfbf",
	            x: DROPDOWN_X2,
	            y: DROPDOWN_Y,
	            id: `dropdownBoxShapeAfter1${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfter1, {
	            opacity: 0,
	        });
	        const dropdownBoxShapeAfter2 = Dom.svg("rect", {
	            width: DROPDOWN1_W,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#bfbfbf",
	            x: DROPDOWN_X3,
	            y: DROPDOWN_Y,
	            id: `dropdownBoxShapeAfter2${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfter2, {
	            opacity: 0,
	        });
	        const dropdownBoxShapeAfterAct1 = Dom.svg("rect", {
	            width: DROPDOWN2_W,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#bfbfbf",
	            x: DROPDOWN_X2 - 30,
	            y: DROPDOWN_Y,
	            id: `dropdownBoxShapeAfter2${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfterAct1, {
	            opacity: 0,
	        });
	        const dropdownBoxShapeAfterAct2 = Dom.svg("rect", {
	            width: 70,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#bfbfbf",
	            x: DROPDOWN_X3 + 50,
	            y: DROPDOWN_Y,
	            id: `dropdownBoxShapeAfter2${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfterAct2, {
	            opacity: 0,
	        });
	        const dropdownBoxShapeAfterMain1 = Dom.svg("rect", {
	            width: DROPDOWN1_W,
	            height: DROPDOWN_H,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#bfbfbf",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y + DROPDOWN_H + 5,
	            id: `dropdownBoxShapeMain1${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfterMain1, {
	            opacity: 0,
	        });
	        const dropdownBoxShapeAfterMain2 = Dom.svg("rect", {
	            width: DROPDOWN1_W,
	            height: DROPDOWN_H - 3,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#bfbfbf",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y + 2 * DROPDOWN_H + 10,
	            id: `dropdownBoxShapeMain2${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfterMain2, {
	            opacity: 0,
	        });
	        // =============== gSubDropdownboxPop
	        const gSubDropdownboxPop = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const gSubDropdownbox1Pop = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const gSubDropdownbox2Pop = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const gSubDropdownboxAct1Pop = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const gSubDropdownboxAct2Pop = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const gSubDropdownboxPopMain1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const gSubDropdownboxPopMain2 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const gSubDropdownboxPopMain2_1 = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	        });
	        const locInputPop = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox-pop`,
	        });
	        // ================ Text input
	        const inputArea = Dom.svg("foreignObject", {
	            class: "sqd-input-area sqd-hidden",
	            x: DROPDOWN_X3,
	            y: DROPDOWN_Y,
	            width: 130,
	            height: 30,
	        });
	        const textInput = Dom.element('input', {
	            class: `sqd-text-input`,
	            type: 'text',
	            // placeholder: 'Email...',
	            value: "",
	        });
	        inputArea.appendChild(textInput);
	        const datePrompt = Dom.svg("text", {
	            class: "sqd-date-prompt sqd-hidden",
	            fill: "#F00000",
	            x: DROPDOWN_X3 - 3,
	            y: DROPDOWN_Y + 40,
	        });
	        datePrompt.textContent = "Incorrect Date Format";
	        const locInputArea = Dom.svg("foreignObject", {
	            class: "location-input sqd-hidden",
	            id: 'searchbox',
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y + DROPDOWN_H + 10,
	            width: 400,
	            height: 30,
	        });
	        const locTextInput = Dom.element('input', {
	            class: `sqd-loc-input`,
	            type: 'text',
	            // placeholder: 'Email...',
	            value: "",
	        });
	        locInputArea.appendChild(locTextInput);
	        const searchPopSvg = Dom.svg("svg", {
	            class: "location-dropdown",
	        });
	        const searchPopBody = Dom.svg("svg", {
	            class: "location-dropdown-body"
	        });
	        const searchPopItemDiv = Dom.svg("svg", {
	            class: "location-scrollbox",
	        });
	        function performSearch(url) {
	            return __awaiter(this, void 0, void 0, function* () {
	                const response = yield fetch(url, {
	                    method: "GET",
	                    headers: {
	                        'X-RapidAPI-Key': '3d2638744emsh4c97887fda82d33p1fa914jsn36a686b5d460',
	                        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
	                    }
	                });
	                return response.json();
	            });
	        }
	        let delay;
	        locTextInput.addEventListener('input', function (e) {
	            clearTimeout(delay);
	            let url;
	            let city = locTextInput.value;
	            url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${city}&limit=10`;
	            delay = setTimeout(function (e) {
	                if (city.length < 5) {
	                    populateResults([]);
	                    return;
	                }
	                performSearch(url).then((data) => {
	                    let cities = '';
	                    let region = '';
	                    let country = '';
	                    let cityResp = data.data;
	                    let locList = [];
	                    for (let i = 0; i < cityResp.length; i++) {
	                        cities = JSON.stringify(cityResp[i].city).replace('\"', '').replace('\"', '');
	                        region = JSON.stringify(cityResp[i].region).replace('\"', '').replace('\"', '');
	                        country = JSON.stringify(cityResp[i].country).replace('\"', '').replace('\"', '');
	                        let location = cities + ", " + region + ", " + country;
	                        locList.push(location);
	                    }
	                    console.log(locList);
	                    populateResults(locList);
	                });
	            });
	        });
	        function populateResults(results) {
	            while (locInputPop.firstChild) {
	                locInputPop.removeChild(locInputPop.firstChild);
	            }
	            const locInputBottomShape = Dom.svg("rect", {
	                width: 374,
	                height: 5 * DROPDOWN_H + 10,
	                class: "option select-field",
	                fill: "#fff",
	                stroke: "#247d99",
	                x: DROPDOWN_X1,
	                y: DROPDOWN_Y + DROPDOWN_H + 40,
	                rx: 4,
	                ry: 4,
	            });
	            locInputPop.appendChild(locInputBottomShape);
	            if (locTextInput.value && results.length != 0) {
	                locInputPop.classList.remove("sqd-hidden");
	            }
	            else {
	                locInputPop.classList.add("sqd-hidden");
	            }
	            if (results.lengh == 0) {
	                locInputBottomShape.setAttribute("height", `${DROPDOWN_H}`);
	            }
	            for (let i = 1; i <= results.length; i++) {
	                const locInputBottomShapeText = Dom.svg("text", {
	                    class: "sqd-task-text",
	                    x: DROPDOWN_X1 + 12,
	                    y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 43,
	                });
	                locInputBottomShapeText.textContent = results[i - 1];
	                const locInputBottomShapeCover = Dom.svg("rect", {
	                    width: 364,
	                    height: DROPDOWN_H - 5,
	                    class: "option select-field choice",
	                    fill: "#fff",
	                    x: DROPDOWN_X1 + 7,
	                    y: DROPDOWN_Y + DROPDOWN_H * i + 45,
	                    rx: 4,
	                    ry: 4,
	                    id: `locInputBottomShapeCover${Date.now()}`,
	                });
	                Dom.attrs(locInputBottomShapeCover, {
	                    opacity: 0.3,
	                });
	                // Add event listners for ACTIONS 3rd dropdown 
	                locInputBottomShapeCover.addEventListener("click", function (e) {
	                    locInputPop.classList.toggle("sqd-hidden");
	                    let locInputValue = locInputBottomShapeText.textContent;
	                    locTextInput.value = locInputValue;
	                });
	                // Append Child ACTIONS 3rd 
	                searchPopItemDiv.appendChild(locInputBottomShapeText);
	                searchPopItemDiv.appendChild(locInputBottomShapeCover);
	            }
	            searchPopSvg.appendChild(searchPopBody);
	            locInputPop.appendChild(searchPopSvg);
	        }
	        const gValBtn = Dom.svg("g", {
	            class: `sqd-task-group sqd-hidden`,
	        });
	        const valBtnRect = Dom.svg("rect", {
	            width: DROPDOWN1_W,
	            height: DROPDOWN_H,
	            class: "option select-field choice",
	            fill: "#fff",
	            stroke: "#247d99",
	            x: DROPDOWN_X3,
	            y: DROPDOWN_Y + DROPDOWN_H + 10,
	            rx: 4,
	            ry: 4,
	        });
	        Dom.attrs(valBtnRect, {
	            opacity: 0.3,
	        });
	        const valBtnText = Dom.svg("text", {
	            x: DROPDOWN_X3 + 7,
	            y: DROPDOWN_Y + DROPDOWN_H + 22,
	            class: "switch-val-btn",
	            fill: "#146d89",
	        });
	        valBtnText.textContent = "Validate Location";
	        // gValBtn.appendChild(valBtnText);
	        // gValBtn.appendChild(valBtnRect);
	        const CHOICE_H = 20;
	        const dropdownPopSvg2 = Dom.svg("svg", {
	            class: "country-dropdown",
	        });
	        const dropdownPopBody2 = Dom.svg("svg", {
	            class: "country-dropdown-body"
	        });
	        const dropdownPopItemDiv2 = Dom.svg("svg", {
	            class: "country-scrollbox",
	        });
	        let contInfo = ['Tag', 'Email Address', 'Gender', 'First Name', 'Last Name', 'Full Name', 'Phone Number', 'Birthday', 'Location'];
	        let actions = ['Opened', 'Not Opened', 'Clicked', 'Not Clicked'];
	        let list2 = [''];
	        let list2Tag = ['Exists', 'Does Not Exist'];
	        let list2Gender = ['Is'];
	        let list2Bd = ['Month Is', 'Date Is', 'Is Before Date', 'Is After date', 'Is Blank'];
	        let list2Email = ['Contains', 'Does Not Contain', 'Is Blank'];
	        let list2Name = ["Is", "Is Not", "Contains", "Does Not Contain", "Blank"];
	        let list2Phone = ["Contains", "Does Not Contain", "Blank"];
	        let list2Loc = ['Is Within', 'Is Not Within', 'Is In Country', 'Is Not In Country', 'Is In US State', 'Is Not In US State'];
	        let list3 = [''];
	        let list3Tag = ['Tag A', 'Tag B'];
	        let list3Gender = ['Male', 'Female', 'Non-binary', 'Blank'];
	        let list3Bdm = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	        let list3LocWithin = [25, 50, 75, 100, 150, 200];
	        let list3Ctry = countryList;
	        let list3State = usStateList;
	        let choice1 = "";
	        let choice2 = "";
	        // ============ 1st dropdown
	        let shapeHeightContact = contInfo.length * CHOICE_H;
	        let shapeHeightActions = actions.length * CHOICE_H;
	        let shapeHeightCollapsed = 2 * DROPDOWN_H - 2;
	        const dropdownBoxBottomShape = Dom.svg("rect", {
	            width: DROPDOWN1_W,
	            height: shapeHeightCollapsed,
	            fill: "#fff",
	            stroke: "#247d99",
	            x: DROPDOWN_X1,
	            y: DROPDOWN_Y + DROPDOWN_H + 5,
	            rx: 4,
	            ry: 4
	        });
	        gSubDropdownboxPop.appendChild(dropdownBoxBottomShape);
	        gSubDropdownboxPop.appendChild(gSubDropdownMain2);
	        gSubDropdownboxPop.appendChild(gSubDropdownMain1);
	        // ================ CONTACT INFO dropdown
	        for (let i = 1; i <= contInfo.length; i++) {
	            const dropdownBoxBottomShapeTextMain1 = Dom.svg("text", {
	                class: "sqd-task-text",
	                x: DROPDOWN_X1 + 17,
	                y: DROPDOWN_Y + CHOICE_H + 11 + CHOICE_H * i + 13,
	            });
	            dropdownBoxBottomShapeTextMain1.textContent = contInfo[i - 1];
	            const dropdownBoxBottomShapecoverMain1 = Dom.svg("rect", {
	                width: DROPDOWN1_W - 20,
	                height: CHOICE_H - 3,
	                class: "option select-field choice",
	                fill: "#fff",
	                x: DROPDOWN_X1 + 10,
	                y: DROPDOWN_Y + CHOICE_H + CHOICE_H * i + 15,
	                rx: 4,
	                ry: 4,
	                id: `dropdownBoxBottomShapecoverMain1${Date.now()}`,
	            });
	            Dom.attrs(dropdownBoxBottomShapecoverMain1, {
	                opacity: 0.3,
	            });
	            dropdownBoxBottomShapecoverMain1.addEventListener("click", function (e) {
	                choice1 = dropdownBoxBottomShapeTextMain1.textContent;
	                gSubDropdownAct1.classList.add("sqd-hidden");
	                gSubDropdownAct2.classList.add("sqd-hidden");
	                dropdownBoxShape.setAttribute("width", `${DROPDOWN1_W}`);
	                dropdownBoxShape.setAttribute("stroke", "#bfbfbf");
	                dropdownBoxShapeAfter.setAttribute("width", `${DROPDOWN1_W}`);
	                dropdownBoxInnerText.setAttribute("style", "fill: #000000");
	                dropdownBoxInnerText1.setAttribute("style", "fill: #bfbfbf");
	                dropdownBoxInnerText1.textContent = "Is";
	                dropdownBoxInnerText2.textContent = "Nothing Selected";
	                dropdownBoxInnerText2.setAttribute("style", "fill: #bfbfbf");
	                dropdownRightButtonDown.setAttribute("x", `${DROPDOWN_X1 + DROPDOWN1_W - 20}`);
	                dropdownRightButtonUp.setAttribute("x", `${DROPDOWN_X1 + DROPDOWN1_W - 20}`);
	                dropdownRightButtonUp.classList.add("sqd-hidden");
	                dropdownRightButtonDown.classList.remove("sqd-hidden");
	                dropdownRightButtonUpMain1.classList.add("sqd-hidden");
	                dropdownRightButtonDownMain1.classList.remove("sqd-hidden");
	                gSubDropdownboxPopMain1.classList.toggle("sqd-hidden");
	                gSubDropdownboxPop.classList.toggle("sqd-hidden");
	                gSubDropdown1.classList.remove('sqd-hidden');
	                gSubDropdown2.classList.remove('sqd-hidden');
	                dropdownBoxBottomShape.setAttribute("height", `${shapeHeightCollapsed}`);
	                dropdownBoxShapeMain2.setAttribute("y", `${shapeMain2DefaultY}`);
	                dropdownRightButtonDownMain2.setAttribute("y", `${btnMain2DefaultY}`);
	                dropdownRightButtonUpMain2.setAttribute("y", `${btnMain2DefaultY}`);
	                dropdownBoxInnerTextMain2.setAttribute("y", `${innerTextMain2DefaultY}`);
	                dropdownBoxShapeAfterMain2.setAttribute("y", `${shapeAfterMain2DefaultY}`);
	                dropdownBoxInnerText.textContent = dropdownBoxBottomShapeTextMain1.textContent;
	                while (gSubDropdownbox1Pop.firstChild) {
	                    gSubDropdownbox1Pop.removeChild(gSubDropdownbox1Pop.firstChild);
	                }
	                if (choice1 == 'Tag') {
	                    list2 = list2Tag;
	                }
	                if (choice1 == 'Gender') {
	                    list2 = list2Gender;
	                    list3 = list3Gender;
	                    console.log(list3);
	                    dropdownBoxInnerText1.textContent = "Is";
	                    dropdownRightButtonDown1.classList.add("sqd-hidden");
	                    dropdownBoxShapeAfter1.classList.add("sqd-hidden");
	                    while (gSubDropdownbox2Pop.firstChild) {
	                        gSubDropdownbox2Pop.removeChild(gSubDropdownbox2Pop.firstChild);
	                    }
	                    // 3rd dropdown in 1st dropdown event listener
	                    const dropdownBoxBottomShape2 = Dom.svg("rect", {
	                        width: DROPDOWN1_W,
	                        height: list3.length * 25 + 10,
	                        fill: "#fff",
	                        stroke: "#247d99",
	                        x: DROPDOWN_X3,
	                        y: DROPDOWN_Y + DROPDOWN_H + 10,
	                        rx: 4,
	                        ry: 4,
	                    });
	                    gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2);
	                    for (let i = 1; i <= list3.length; i++) {
	                        const dropdownBoxBottomShape2Text = Dom.svg("text", {
	                            class: "sqd-task-text",
	                            x: DROPDOWN_X3 + 17,
	                            y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 13,
	                        });
	                        dropdownBoxBottomShape2Text.textContent = list3[i - 1];
	                        const dropdownBoxBottomShape2cover = Dom.svg("rect", {
	                            width: DROPDOWN1_W - 20,
	                            height: DROPDOWN_H - 5,
	                            class: "option select-field choice",
	                            fill: "#fff",
	                            x: DROPDOWN_X3 + 10,
	                            y: DROPDOWN_Y + DROPDOWN_H * i + 15,
	                            rx: 4,
	                            ry: 4,
	                            id: `dropdownBoxBottomShape2cover${Date.now()}`,
	                        });
	                        Dom.attrs(dropdownBoxBottomShape2cover, {
	                            opacity: 0.3,
	                        });
	                        // Add event listners for 3rd dropdown 
	                        dropdownBoxBottomShape2cover.addEventListener("click", function (e) {
	                            dropdownBoxShape2.setAttribute("stroke", "#bfbfbf");
	                            dropdownRightButtonUp2.classList.add("sqd-hidden");
	                            dropdownRightButtonDown2.classList.remove("sqd-hidden");
	                            dropdownBoxInnerText2.textContent = dropdownBoxBottomShape2Text.textContent;
	                            dropdownBoxInnerText2.setAttribute("style", "fill: #253947");
	                            gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
	                        });
	                        // Append Child 3rd 
	                        gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2Text);
	                        gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2cover);
	                    }
	                    // End 3rd dropdown in 1st dropdown event listener
	                }
	                else {
	                    dropdownRightButtonDown1.classList.remove("sqd-hidden");
	                    dropdownBoxShapeAfter1.classList.remove("sqd-hidden");
	                }
	                if (choice1 == 'Birthday') {
	                    list2 = list2Bd;
	                }
	                if (choice1 == 'Email Address') {
	                    list2 = list2Email;
	                    gSubDropdown2.classList.add("sqd-hidden");
	                    inputArea.classList.remove("sqd-hidden");
	                }
	                if (choice1 == "First Name" || choice1 == "Last Name" || choice1 == "Full Name") {
	                    list2 = list2Name;
	                    gSubDropdown2.classList.add("sqd-hidden");
	                    inputArea.classList.remove("sqd-hidden");
	                }
	                if (choice1 == "Phone Number") {
	                    list2 = list2Phone;
	                    gSubDropdown2.classList.add("sqd-hidden");
	                    inputArea.classList.remove("sqd-hidden");
	                }
	                if (choice1 == 'Location') {
	                    list2 = list2Loc;
	                }
	                else {
	                    locInputArea.classList.add("sqd-hidden");
	                    valBtnRect.classList.add("sqd-hidden");
	                    rect1.setAttribute("height", `${3 * boxHeight + 10}`);
	                    rectInnerBorder.setAttribute("height", `${boxHeight + 20}`);
	                    locInputArea.classList.add("sqd-hidden");
	                }
	                if (choice1 != 'Email Address' &&
	                    choice1 != "Birthday" &&
	                    choice1 != "First Name" &&
	                    choice1 != "Last Name" &&
	                    choice1 != "Full Name" &&
	                    choice1 != "Phone Number") {
	                    inputArea.classList.add("sqd-hidden");
	                    gSubDropdown2.classList.remove("sqd-hidden");
	                }
	                if (choice1 == "Birthday") {
	                    let dateformat = /^(0?[1-9]|1[0-2])[\/](0?[1-9]|[1-2][0-9]|3[01])$/;
	                    textInput.addEventListener("input", function (e) {
	                        if (!textInput.value.match(dateformat)) {
	                            console.log("wrong date format");
	                            datePrompt.classList.remove("sqd-hidden");
	                            textInput.setAttribute("style", "border-color: #FF0000");
	                        }
	                        else {
	                            datePrompt.classList.add("sqd-hidden");
	                            textInput.setAttribute("style", "border-color: #BFBFBF");
	                        }
	                    });
	                }
	                // ===================== 2nd dropdown
	                const dropdownBoxBottomShape1 = Dom.svg("rect", {
	                    width: DROPDOWN2_W,
	                    height: list2.length * 25 + 10,
	                    fill: "#fff",
	                    stroke: "#247d99",
	                    x: DROPDOWN_X2,
	                    y: DROPDOWN_Y + DROPDOWN_H + 5,
	                    rx: 4,
	                    ry: 4
	                });
	                gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1);
	                for (let i = 1; i <= list2.length; i++) {
	                    const dropdownBoxBottomShape1Text = Dom.svg("text", {
	                        class: "sqd-task-text",
	                        x: DROPDOWN_X2 + 12,
	                        y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 8,
	                    });
	                    dropdownBoxBottomShape1Text.textContent = list2[i - 1];
	                    const dropdownBoxBottomShape1cover = Dom.svg("rect", {
	                        width: DROPDOWN2_W - 15,
	                        height: DROPDOWN_H - 5,
	                        class: "option select-field choice",
	                        fill: "#fff",
	                        x: DROPDOWN_X2 + 7,
	                        y: DROPDOWN_Y + DROPDOWN_H * i + 10,
	                        rx: 4,
	                        ry: 4,
	                        id: `dropdownBoxBottomShape1cover${Date.now()}`,
	                    });
	                    Dom.attrs(dropdownBoxBottomShape1cover, {
	                        opacity: 0.3,
	                    });
	                    // Add event listners for 2nd dropdowns 
	                    dropdownBoxBottomShape1cover.addEventListener("click", function (e) {
	                        dropdownRightButtonUp1.classList.add("sqd-hidden");
	                        dropdownRightButtonDown1.classList.remove("sqd-hidden");
	                        dropdownBoxInnerText1.textContent = dropdownBoxBottomShape1Text.textContent;
	                        dropdownBoxInnerText1.setAttribute("style", "fill: #253947");
	                        dropdownBoxShape1.setAttribute("stroke", "#bfbfbf");
	                        gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
	                        choice2 = dropdownBoxInnerText1.textContent;
	                        while (gSubDropdownbox2Pop.firstChild) {
	                            gSubDropdownbox2Pop.removeChild(gSubDropdownbox2Pop.firstChild);
	                        }
	                        if (choice2 == 'Exists' || choice2 == 'Does Not Exist') {
	                            list3 = list3Tag;
	                        }
	                        else if (choice2 == 'Month Is') {
	                            list3 = list3Bdm;
	                            inputArea.classList.add("sqd-hidden");
	                        }
	                        else if (choice2 == 'Date Is') {
	                            gSubDropdown2.classList.add("sqd-hidden");
	                            inputArea.classList.remove("sqd-hidden");
	                            // textInput.setAttribute("placeholder", "Enter Month/Day");
	                        }
	                        if (choice2 == 'Is Within' || choice2 == 'Is Not Within') {
	                            list3 = list3LocWithin;
	                            rect1.setAttribute("height", "140");
	                            rectInnerBorder.setAttribute("height", "90");
	                            locInputArea.classList.remove("sqd-hidden");
	                            // gValBtn.classList.remove("sqd-hidden");
	                            // if (locTextInput.value) {
	                            //     valBtnRect.setAttribute("stroke", "#247d99");
	                            //     valBtnText.setAttribute("fill", "#247d99");
	                            // } else {
	                            //     valBtnRect.setAttribute("stroke", "#a0a0a0");
	                            //     valBtnText.setAttribute("fill", "#a0a0a0");
	                            // }
	                        } //else {
	                        // rect1.setAttribute("height", `${3 * boxHeight + 10}`);
	                        // rectInnerBorder.setAttribute("height", `${boxHeight + 20}`);
	                        // locInputArea.classList.add("sqd-hidden");
	                        // } 
	                        if (choice2 == 'Is In Country' || choice2 == 'Is Not In Country') {
	                            list3 = list3Ctry;
	                        }
	                        else if (choice2 == "Is In US State" || choice2 == "Is Not In US State") {
	                            list3 = list3State;
	                        }
	                        if (choice2 == "Is Blank" || choice2 == "Blank") {
	                            dropdownBoxInnerText2.textContent = "Nothing Selected";
	                            dropdownBoxInnerText2.setAttribute("style", "fill: #BFBFBF; font-size: 8pt");
	                            inputArea.setAttribute("value", "Blank");
	                        }
	                        // ======================== 3rd dropdowns 
	                        const dropdownBoxBottomShape2 = Dom.svg("rect", {
	                            width: DROPDOWN1_W,
	                            height: 120,
	                            fill: "#fff",
	                            stroke: "#247d99",
	                            x: DROPDOWN_X3,
	                            y: DROPDOWN_Y + DROPDOWN_H + 5,
	                            rx: 4,
	                            ry: 4,
	                        });
	                        gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2);
	                        // dropdownPopItemDiv2.appendChild(dropdownBoxBottomShape2); 
	                        for (let i = 1; i <= list3.length; i++) {
	                            const dropdownBoxBottomShape2Text = Dom.svg("text", {
	                                class: "sqd-task-text",
	                                x: DROPDOWN_X3 + 17,
	                                y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 13,
	                            });
	                            dropdownBoxBottomShape2Text.textContent = list3[i - 1];
	                            const dropdownBoxBottomShape2cover = Dom.svg("rect", {
	                                width: DROPDOWN1_W - 20,
	                                height: DROPDOWN_H - 5,
	                                class: "option select-field choice",
	                                fill: "#fff",
	                                x: DROPDOWN_X3 + 10,
	                                y: DROPDOWN_Y + DROPDOWN_H * i + 15,
	                                rx: 4,
	                                ry: 4,
	                                id: `dropdownBoxBottomShape2cover${Date.now()}`,
	                            });
	                            Dom.attrs(dropdownBoxBottomShape2cover, {
	                                opacity: 0.3,
	                            });
	                            // Add event listners for 3rd dropdown 
	                            dropdownBoxBottomShape2cover.addEventListener("click", function (e) {
	                                dropdownBoxShape2.setAttribute("stroke", "#bfbfbf");
	                                dropdownRightButtonUp2.classList.add("sqd-hidden");
	                                dropdownRightButtonDown2.classList.remove("sqd-hidden");
	                                dropdownBoxInnerText2.textContent = dropdownBoxBottomShape2Text.textContent;
	                                dropdownBoxInnerText2.setAttribute("style", "fill: #253947");
	                                gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
	                            });
	                            // Append Child 3rd 
	                            if (choice2 == "Is In Country" || choice2 == "Is Not In Country") {
	                                dropdownPopItemDiv2.appendChild(dropdownBoxBottomShape2Text);
	                                dropdownPopItemDiv2.appendChild(dropdownBoxBottomShape2cover);
	                            }
	                            else {
	                                gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2Text);
	                                gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2cover);
	                            }
	                        }
	                        if (choice2 == "Is In Country" || choice2 == "Is Not In Country") {
	                            dropdownPopSvg2.appendChild(dropdownPopBody2);
	                            gSubDropdownbox2Pop.appendChild(dropdownPopSvg2);
	                            dropdownBoxBottomShape2.setAttribute("height", "120");
	                        }
	                        else {
	                            dropdownBoxBottomShape2.setAttribute("height", `${list3.length * 25 + 10}`);
	                        }
	                    });
	                    // Append Child 2nd 
	                    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text);
	                    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1cover);
	                }
	            });
	            // Append Child CONTACT INFO  
	            gSubDropdownboxPopMain1.appendChild(dropdownBoxBottomShapeTextMain1);
	            gSubDropdownboxPopMain1.appendChild(dropdownBoxBottomShapecoverMain1);
	        }
	        // ================ ACTIONS dropdown
	        for (let i = 1; i <= actions.length; i++) {
	            const dropdownBoxBottomShapeTextMain2 = Dom.svg("text", {
	                class: "sqd-task-text",
	                x: DROPDOWN_X1 + 17,
	                y: DROPDOWN_Y + 2 * CHOICE_H + 11 + CHOICE_H * i + 9,
	            });
	            dropdownBoxBottomShapeTextMain2.textContent = actions[i - 1];
	            const dropdownBoxBottomShapecoverMain2 = Dom.svg("rect", {
	                width: DROPDOWN1_W - 20,
	                height: CHOICE_H - 5,
	                class: "option select-field choice",
	                fill: "#fff",
	                // stroke: "#a0a0a0",
	                x: DROPDOWN_X1 + 10,
	                y: DROPDOWN_Y + 2 * CHOICE_H + CHOICE_H * i + 12,
	                rx: 4,
	                ry: 4,
	                id: `dropdownBoxBottomShapecoverMain2${Date.now()}`,
	            });
	            Dom.attrs(dropdownBoxBottomShapecoverMain2, {
	                opacity: 0.3,
	            });
	            const dropdownBoxBottomShapeTextMain2_1 = Dom.svg("text", {
	                class: "sqd-task-text",
	                x: DROPDOWN_X1 + 17,
	                y: DROPDOWN_Y + 10 * CHOICE_H + 11 + CHOICE_H * i + 28,
	            });
	            dropdownBoxBottomShapeTextMain2_1.textContent = actions[i - 1];
	            const dropdownBoxBottomShapecoverMain2_1 = Dom.svg("rect", {
	                width: DROPDOWN1_W - 20,
	                height: CHOICE_H - 5,
	                class: "option select-field choice",
	                fill: "#fff",
	                // stroke: "#a0a0a0",
	                x: DROPDOWN_X1 + 10,
	                y: DROPDOWN_Y + 10 * CHOICE_H + CHOICE_H * i + 31,
	                rx: 4,
	                ry: 4,
	                id: `dropdownBoxBottomShapecoverMain2_1${Date.now()}`,
	            });
	            Dom.attrs(dropdownBoxBottomShapecoverMain2_1, {
	                opacity: 0.3,
	            });
	            dropdownBoxBottomShapecoverMain2.addEventListener("click", function (e) {
	                choice1 = dropdownBoxBottomShapeTextMain2.textContent;
	                dropdownRightButtonUp.classList.add("sqd-hidden");
	                dropdownRightButtonDown.classList.remove("sqd-hidden");
	                dropdownRightButtonUpMain2.classList.add("sqd-hidden");
	                dropdownRightButtonDownMain2.classList.remove("sqd-hidden");
	                gSubDropdownboxPopMain2.classList.add("sqd-hidden");
	                gSubDropdownboxPop.classList.add("sqd-hidden");
	                dropdownBoxInnerText.textContent = dropdownBoxBottomShapeTextMain2.textContent;
	                dropdownBoxInnerText.setAttribute("style", "fill: #000000; font-size: 9pt");
	                gSubDropdown1.classList.add('sqd-hidden');
	                gSubDropdown2.classList.add('sqd-hidden');
	                dropdownBoxShape.setAttribute("width", `90`);
	                dropdownRightButtonDown.setAttribute("x", `${DROPDOWN_X1 + 70}`);
	                dropdownRightButtonUp.setAttribute("x", `${DROPDOWN_X1 + 70}`);
	                gSubDropdownAct1.classList.remove("sqd-hidden");
	                gSubDropdownAct2.classList.remove("sqd-hidden");
	                inputArea.classList.remove("sqd-hidden");
	                inputArea.setAttribute("x", `${280}`);
	                inputArea.setAttribute("width", `${65}`);
	                textInput.setAttribute("style", "width: 50px");
	            });
	            dropdownBoxBottomShapecoverMain2_1.addEventListener("click", function (e) {
	                choice1 = dropdownBoxBottomShapeTextMain2.textContent;
	                dropdownRightButtonUp.classList.add("sqd-hidden");
	                dropdownRightButtonDown.classList.remove("sqd-hidden");
	                dropdownRightButtonUpMain2.classList.add("sqd-hidden");
	                dropdownRightButtonDownMain2.classList.remove("sqd-hidden");
	                gSubDropdownboxPopMain2_1.classList.add("sqd-hidden");
	                gSubDropdownboxPop.classList.add("sqd-hidden");
	                dropdownBoxInnerText.textContent = dropdownBoxBottomShapeTextMain2_1.textContent;
	                dropdownBoxInnerText.setAttribute("style", "fill: #000000; font-size: 9pt");
	                gSubDropdown1.classList.add('sqd-hidden');
	                gSubDropdown2.classList.add('sqd-hidden');
	                dropdownBoxShape.setAttribute("width", `90`);
	                dropdownRightButtonDown.setAttribute("x", `${DROPDOWN_X1 + 70}`);
	                dropdownRightButtonUp.setAttribute("x", `${DROPDOWN_X1 + 70}`);
	                gSubDropdownAct1.classList.remove("sqd-hidden");
	                gSubDropdownAct2.classList.remove("sqd-hidden");
	                inputArea.classList.remove("sqd-hidden");
	                inputArea.setAttribute("x", `${280}`);
	                inputArea.setAttribute("width", `${65}`);
	                textInput.setAttribute("style", "width: 50px");
	            });
	            // Append Child ACTIONS
	            gSubDropdownboxPopMain2.appendChild(dropdownBoxBottomShapeTextMain2);
	            gSubDropdownboxPopMain2.appendChild(dropdownBoxBottomShapecoverMain2);
	            gSubDropdownboxPopMain2_1.appendChild(dropdownBoxBottomShapeTextMain2_1);
	            gSubDropdownboxPopMain2_1.appendChild(dropdownBoxBottomShapecoverMain2_1);
	        }
	        // ================= ACTIONS 2nd dropdown 
	        let listAct2 = ["Campaign 1", "Campaign 2", "Campaign 3"];
	        const dropdownBoxBottomShapeAct2 = Dom.svg("rect", {
	            width: DROPDOWN2_W,
	            height: listAct2.length * DROPDOWN_H + 10,
	            fill: "#fff",
	            stroke: "#247d99",
	            x: DROPDOWN_X2 - 30,
	            y: DROPDOWN_Y + DROPDOWN_H + 10,
	            rx: 4,
	            ry: 4,
	        });
	        gSubDropdownboxAct1Pop.appendChild(dropdownBoxBottomShapeAct2);
	        for (let i = 1; i <= listAct2.length; i++) {
	            const dropdownBoxBottomShapeAct2Text = Dom.svg("text", {
	                class: "sqd-task-text",
	                x: DROPDOWN_X2 - 30 + 17,
	                y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 13,
	            });
	            dropdownBoxBottomShapeAct2Text.textContent = listAct2[i - 1];
	            const dropdownBoxBottomShapeAct2cover = Dom.svg("rect", {
	                width: DROPDOWN2_W - 20,
	                height: DROPDOWN_H - 5,
	                class: "option select-field choice",
	                fill: "#fff",
	                x: DROPDOWN_X2 - 30 + 10,
	                y: DROPDOWN_Y + DROPDOWN_H * i + 15,
	                rx: 4,
	                ry: 4,
	                id: `dropdownBoxBottomShapeAct2cover${Date.now()}`,
	            });
	            Dom.attrs(dropdownBoxBottomShapeAct2cover, {
	                opacity: 0.3,
	            });
	            // Add event listners for Action 2nd dropdown 
	            dropdownBoxBottomShapeAct2cover.addEventListener("click", function (e) {
	                dropdownBoxInnerTextAct1.textContent = dropdownBoxBottomShapeAct2Text.textContent;
	                gSubDropdownboxAct1Pop.classList.toggle("sqd-hidden");
	                dropdownBoxInnerTextAct1.setAttribute("style", "fill: #000000; font-size: 9pt");
	            });
	            // Append Child Action 2nd 
	            gSubDropdownboxAct1Pop.appendChild(dropdownBoxBottomShapeAct2Text);
	            gSubDropdownboxAct1Pop.appendChild(dropdownBoxBottomShapeAct2cover);
	        }
	        // ======================== ACTIONS 3rd dropdowns 
	        let list3Actions = ["Hour (s)", "Day (s)", "Month (s)", "Year (s)"];
	        const dropdownBoxBottomShape2 = Dom.svg("rect", {
	            width: 70,
	            height: list3Actions.length * DROPDOWN_H + 10,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#247d99",
	            x: DROPDOWN_X3 + 50,
	            y: DROPDOWN_Y + DROPDOWN_H + 10,
	            rx: 4,
	            ry: 4,
	        });
	        gSubDropdownboxAct2Pop.appendChild(dropdownBoxBottomShape2);
	        for (let i = 1; i <= list3Actions.length; i++) {
	            const dropdownBoxBottomShapeAct2Text = Dom.svg("text", {
	                class: "sqd-task-text",
	                x: DROPDOWN_X3 + 50 + 7,
	                y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 13,
	            });
	            dropdownBoxBottomShapeAct2Text.textContent = list3Actions[i - 1];
	            const dropdownBoxBottomShape2cover = Dom.svg("rect", {
	                width: 60,
	                height: DROPDOWN_H - 5,
	                class: "option select-field choice",
	                fill: "#fff",
	                x: DROPDOWN_X3 + 50 + 5,
	                y: DROPDOWN_Y + DROPDOWN_H * i + 22,
	                rx: 4,
	                ry: 4,
	                id: `dropdownBoxBottomShape2cover${Date.now()}`,
	            });
	            Dom.attrs(dropdownBoxBottomShape2cover, {
	                opacity: 0.3,
	            });
	            // Add event listners for ACTIONS 3rd dropdown 
	            dropdownBoxBottomShape2cover.addEventListener("click", function (e) {
	                dropdownBoxInnerTextAct2.textContent = dropdownBoxBottomShapeAct2Text.textContent;
	                gSubDropdownboxAct2Pop.classList.toggle("sqd-hidden");
	                dropdownBoxInnerTextAct2.setAttribute("style", "fill: #000000; font-size: 9pt");
	            });
	            // Append Child ACTIONS 3rd 
	            gSubDropdownboxAct2Pop.appendChild(dropdownBoxBottomShapeAct2Text);
	            gSubDropdownboxAct2Pop.appendChild(dropdownBoxBottomShape2cover);
	        }
	        // =================== Append dropdowns
	        // Right buttons
	        gSubDropdownbox.appendChild(dropdownRightButtonDown);
	        gSubDropdownbox.appendChild(dropdownRightButtonUp);
	        gSubDropdownbox1.appendChild(dropdownRightButtonDown1);
	        gSubDropdownbox1.appendChild(dropdownRightButtonUp1);
	        gSubDropdownbox2.appendChild(dropdownRightButtonDown2);
	        gSubDropdownbox2.appendChild(dropdownRightButtonUp2);
	        gSubDropdownboxAct1.appendChild(dropdownRightButtonDownAct1);
	        gSubDropdownboxAct1.appendChild(dropdownRightButtonUpAct1);
	        gSubDropdownboxAct2.appendChild(dropdownRightButtonDownAct2);
	        gSubDropdownboxAct2.appendChild(dropdownRightButtonUpAct2);
	        gSubDropdownboxMain1.appendChild(dropdownRightButtonDownMain1);
	        gSubDropdownboxMain1.appendChild(dropdownRightButtonUpMain1);
	        gSubDropdownboxMain2.appendChild(dropdownRightButtonDownMain2);
	        gSubDropdownboxMain2.appendChild(dropdownRightButtonUpMain2);
	        // Insert before 
	        gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownRightButtonDown);
	        gSubDropdownbox1.insertBefore(dropdownBoxShape1, dropdownRightButtonDown1);
	        gSubDropdownbox2.insertBefore(dropdownBoxShape2, dropdownRightButtonDown2);
	        gSubDropdownboxAct1.insertBefore(dropdownBoxShapeAct1, dropdownRightButtonDownAct1);
	        gSubDropdownboxAct2.insertBefore(dropdownBoxShapeAct2, dropdownRightButtonDownAct2);
	        gSubDropdownboxMain1.insertBefore(dropdownBoxShapeMain1, dropdownRightButtonDownMain1);
	        gSubDropdownboxMain2.insertBefore(dropdownBoxShapeMain2, dropdownRightButtonDownMain2);
	        // Inner text
	        gSubDropdownbox.appendChild(dropdownBoxInnerText);
	        gSubDropdownbox1.appendChild(dropdownBoxInnerText1);
	        gSubDropdownbox2.appendChild(dropdownBoxInnerText2);
	        gSubDropdownboxAct1.appendChild(dropdownBoxInnerTextAct1);
	        gSubDropdownboxAct2.appendChild(dropdownBoxInnerTextAct2);
	        gSubDropdownboxMain1.appendChild(dropdownBoxInnerTextMain1);
	        gSubDropdownboxMain2.appendChild(dropdownBoxInnerTextMain2);
	        // Shape after
	        gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
	        gSubDropdownbox1.appendChild(dropdownBoxShapeAfter1);
	        gSubDropdownbox2.appendChild(dropdownBoxShapeAfter2);
	        gSubDropdownboxAct1.appendChild(dropdownBoxShapeAfterAct1);
	        gSubDropdownboxAct2.appendChild(dropdownBoxShapeAfterAct2);
	        gSubDropdownboxMain1.appendChild(dropdownBoxShapeAfterMain1);
	        gSubDropdownboxMain2.appendChild(dropdownBoxShapeAfterMain2);
	        // Dropdown box & pop
	        gSubDropdown.appendChild(gSubDropdownbox);
	        gSubDropdown.appendChild(gSubDropdownboxPop);
	        gSubDropdown1.appendChild(gSubDropdownbox1);
	        gSubDropdown1.appendChild(gSubDropdownbox1Pop);
	        gSubDropdown2.appendChild(gSubDropdownbox2);
	        gSubDropdown2.appendChild(gSubDropdownbox2Pop);
	        gSubDropdownAct1.appendChild(gSubDropdownboxAct1);
	        gSubDropdownAct1.appendChild(gSubDropdownboxAct1Pop);
	        gSubDropdownAct2.appendChild(gSubDropdownboxAct2);
	        gSubDropdownAct2.appendChild(gSubDropdownboxAct2Pop);
	        gSubDropdownMain1.appendChild(gSubDropdownboxMain1);
	        gSubDropdownMain1.appendChild(gSubDropdownboxPopMain1);
	        gSubDropdownMain2.appendChild(gSubDropdownboxMain2);
	        gSubDropdownMain2.appendChild(gSubDropdownboxPopMain2);
	        gSubDropdownMain2.appendChild(gSubDropdownboxPopMain2_1);
	        gDropdown.appendChild(inputArea);
	        gDropdown.appendChild(datePrompt);
	        gDropdown.appendChild(locInputArea);
	        gDropdown.appendChild(locInputPop);
	        gDropdown.appendChild(gValBtn);
	        gDropdown.appendChild(gSubDropdownAct2);
	        gDropdown.appendChild(gSubDropdownAct1);
	        gDropdown.appendChild(gSubDropdown2);
	        gDropdown.appendChild(gSubDropdown1);
	        gDropdown.appendChild(gSubDropdown);
	        g1.appendChild(moreIcon);
	        g.appendChild(gRightPop3);
	        g.appendChild(gDropdown);
	        g.appendChild(g1);
	        g.appendChild(gRightPop3Reminder);
	        g.appendChild(gUpPop3);
	        g.appendChild(setUpReminder);
	        // ========== Add EventListeners for "More" icon 
	        moreIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            if (rect1.classList.contains("sqd-hidden")) {
	                console.log("Not permitted");
	            }
	            else {
	                gRightPop3.classList.toggle("sqd-hidden");
	            }
	        });
	        // ========================= More icons event listener 
	        editIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            rect.setAttribute("width", `${boxWidth}`);
	            rect.setAttribute("x", `${containerWidths[0] - textWidth - 107}`);
	            rectLeft.setAttribute("x", `${containerWidths[0] - textWidth - 107}`);
	            text.setAttribute("x", `${ICON_SIZE$6 + containerWidths[0] - PADDING_X$5 * 17 - 10}`);
	            moreIcon.setAttribute("x", `${ICON_SIZE$6 + containerWidths[0] + PADDING_X$5 + textWidth + 45}`);
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            gRightPop3.classList.toggle("sqd-hidden");
	            gSubDropdown.classList.toggle("sqd-hidden");
	            gSubDropdown1.classList.toggle("sqd-hidden");
	            gSubDropdown2.classList.toggle("sqd-hidden");
	            gSubDropdownMain1.classList.toggle("sqd-hidden");
	            gSubDropdownMain2.classList.toggle("sqd-hidden");
	            if (choice1 != 'Email Address' &&
	                choice1 != "Birthday" &&
	                choice1 != "First Name" &&
	                choice1 != "Last Name" &&
	                choice1 != "Full Name" &&
	                choice1 != "Phone Number") {
	                inputArea.classList.add("sqd-hidden");
	                gSubDropdown2.classList.remove("sqd-hidden");
	            }
	            else {
	                inputArea.classList.remove("sqd-hidden");
	                gSubDropdown2.classList.add("sqd-hidden");
	            }
	        });
	        let shapeMain2DefaultY = DROPDOWN_Y + 2 * DROPDOWN_H + 1;
	        let btnMain2DefaultY = DROPDOWN_Y + 2 * DROPDOWN_H + 9;
	        let innerTextMain2DefaultY = DROPDOWN_Y + 2 * DROPDOWN_H + 13 + 1;
	        let shapeAfterMain2DefaultY = DROPDOWN_Y + 2 * DROPDOWN_H - 2;
	        upCheckIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            rect.setAttribute("width", `258`);
	            rect.setAttribute("x", `${containerWidths[0] - textWidth - 28}`);
	            rectLeft.setAttribute("x", `${containerWidths[0] - textWidth - 28}`);
	            text.setAttribute("x", `${ICON_SIZE$6 + containerWidths[0] - PADDING_X$5 * 17 + 69}`);
	            moreIcon.setAttribute("x", `${ICON_SIZE$6 + containerWidths[0] + PADDING_X$5 + textWidth - 27}`);
	            gDropdown.classList.add("sqd-hidden");
	            gSubDropdown.classList.add("sqd-hidden");
	            gSubDropdown1.classList.add("sqd-hidden");
	            gSubDropdown2.classList.add("sqd-hidden");
	            gSubDropdownMain1.classList.add("sqd-hidden");
	            gSubDropdownMain2.classList.add("sqd-hidden");
	            gSubDropdownboxPopMain1.classList.add("sqd-hidden");
	            gSubDropdownboxPopMain2.classList.add("sqd-hidden");
	            gSubDropdownboxPopMain2_1.classList.add("sqd-hidden");
	            dropdownRightButtonDownMain1.classList.remove("sqd-hidden");
	            dropdownRightButtonDownMain2.classList.remove("sqd-hidden");
	            dropdownRightButtonUpMain1.classList.add("sqd-hidden");
	            dropdownRightButtonUpMain2.classList.add("sqd-hidden");
	            dropdownBoxBottomShape.setAttribute("height", `${shapeHeightCollapsed}`);
	            dropdownBoxShapeMain2.setAttribute("y", `${shapeMain2DefaultY}`);
	            dropdownRightButtonDownMain2.setAttribute("y", `${btnMain2DefaultY}`);
	            dropdownRightButtonUpMain2.setAttribute("y", `${btnMain2DefaultY}`);
	            dropdownBoxInnerTextMain2.setAttribute("y", `${innerTextMain2DefaultY}`);
	            dropdownBoxShapeAfterMain2.setAttribute("y", `${shapeAfterMain2DefaultY}`);
	            gUpPop3.classList.add("sqd-hidden");
	            // =============== Add properties
	            if (dropdownBoxInnerText.textContent == "Tag" ||
	                dropdownBoxInnerText.textContent == "Gender" ||
	                dropdownBoxInnerText.textContent == "Email" ||
	                dropdownBoxInnerText.textContent == "Full Name" ||
	                dropdownBoxInnerText.textContent == "First Name" ||
	                dropdownBoxInnerText.textContent == "Last Name" ||
	                dropdownBoxInnerText.textContent == "Phone Number" ||
	                dropdownBoxInnerText.textContent == "Birthday" ||
	                dropdownBoxInnerText.textContent == "Location") {
	                step.properties["type"] = "Contact Info";
	            }
	            if (dropdownBoxInnerText.textContent == "Opend" ||
	                dropdownBoxInnerText.textContent == "Not Opend" ||
	                dropdownBoxInnerText.textContent == "Clicked" ||
	                dropdownBoxInnerText.textContent == "Not Clicked") {
	                step.properties["type"] = "Actions";
	            }
	            if (dropdownBoxInnerText.textContent && dropdownBoxInnerText.textContent != "Select a condition") {
	                // textRight.textContent = dropdownBoxInnerText.textContent;
	                step.properties["property"] = dropdownBoxInnerText.textContent;
	            }
	            if (dropdownBoxInnerText1.textContent && dropdownBoxInnerText1.textContent != "") {
	                // textRight.textContent = dropdownBoxInnerText.textContent;
	                step.properties["condition"] = dropdownBoxInnerText1.textContent;
	            }
	            if (locTextInput.value != "") {
	                // textRight.textContent = dropdownBoxInnerText2.textContent;
	                let value;
	                value = dropdownBoxInnerText2.textContent + ", " + locTextInput.value;
	                step.properties["value"] = value;
	            }
	            if (choice1 == "Email Address" || choice1 == "Full Name" || choice1 == "First Name" || choice1 == "Last Name" || choice1 == "Phone Number") {
	                let value = textInput.value;
	                step.properties["value"] = value;
	            }
	            if (choice1 == "Birthday" && choice2 == "Date Is") {
	                step.properties["value"] = textInput.value;
	            }
	            else {
	                let value = dropdownBoxInnerText2.textContent;
	                step.properties["value"] = value;
	            }
	            if (choice1 == "Tag" || choice1 == "Gender") {
	                if (dropdownBoxInnerText2.textContent) {
	                    step.properties["value"] = dropdownBoxInnerText2.textContent;
	                }
	            }
	            // =================== Title 
	            if (step.properties["property"].toString() == "Tag") {
	                textRight.textContent = "If " + step.properties["value"].toString() + " " +
	                    step.properties["condition"].toString() + " in the " +
	                    step.properties["property"].toString() + "s";
	            }
	            if (step.properties["property"].toString() == "Location") {
	                if (step.properties["condition"].toString() == ("Is In Country" )) {
	                    textRight.textContent = "If " + step.properties["property"].toString() + " Is In The " +
	                        step.properties["value"].toString();
	                }
	                else if (step.properties["condition"].toString() == ("Is Not In Country" )) {
	                    textRight.textContent = "If " + step.properties["property"].toString() + " Is Not In The " +
	                        step.properties["value"].toString();
	                }
	                else {
	                    textRight.textContent = "If " + step.properties["property"].toString() + " " +
	                        step.properties["condition"].toString() + " " +
	                        dropdownBoxInnerText2.textContent + " Miles";
	                }
	            }
	            else {
	                textRight.textContent = "If " + step.properties["property"].toString() + " " +
	                    step.properties["condition"].toString() + " " +
	                    step.properties["value"].toString();
	            }
	        });
	        upchangeIcon.addEventListener("click", function (e) {
	            step.properties = {};
	            textRight.textContent = "Choose Condition";
	            dropdownBoxInnerText.textContent = "Select a condition";
	            dropdownBoxInnerText1.textContent = "Is";
	            dropdownBoxInnerText2.textContent = "";
	            dropdownBoxInnerTextMain1.textContent = "CONTACT INFO";
	            dropdownBoxInnerTextMain2.textContent = "ACTIONS";
	            gSubDropdown.classList.remove("sqd-hidden");
	            gSubDropdown1.classList.remove("sqd-hidden");
	            gSubDropdown2.classList.remove("sqd-hidden");
	            gSubDropdownMain1.classList.add("sqd-hidden");
	            gSubDropdownMain2.classList.add("sqd-hidden");
	            locInputArea.classList.add("sqd-hidden");
	            inputArea.classList.add("sqd-hidden");
	            locInputPop.classList.add("sqd-hidden");
	            rect1.setAttribute("height", `${3 * boxHeight + 10}`);
	            rectInnerBorder.setAttribute("height", `${boxHeight + 20}`);
	        });
	        // edit button hover
	        editIcon.addEventListener("mouseover", function (e) {
	            rightEditImgContainerCircle.setAttribute("style", "fill: #2488cb");
	        });
	        editIcon.addEventListener("mouseout", function (e) {
	            rightEditImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
	        });
	        // copy hover
	        changeIcon.addEventListener("mouseover", function (e) {
	            rightCopyImgContainerCircle.setAttribute("style", "fill: #3498db");
	            // upCopyIcon.setAttribute("style", "color: #FFFFFF"); 
	        });
	        changeIcon.addEventListener("mouseout", function (e) {
	            rightCopyImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
	            // upCopyIcon.setAttribute("style", "color: #FFFFFF"); 
	        });
	        // delete hover
	        deleteIcon.addEventListener("mouseover", function (e) {
	            rightDeleteImgContainerCircle.setAttribute("style", "fill: #3498db");
	        });
	        deleteIcon.addEventListener("mouseout", function (e) {
	            rightDeleteImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
	        });
	        // check button hover
	        upCheckIcon.addEventListener("mouseover", function (e) {
	            checkImgContainerCircle.setAttribute("style", "fill: #2488cb");
	        });
	        upCheckIcon.addEventListener("mouseout", function (e) {
	            checkImgContainerCircle.setAttribute("style", "fill: #3498db");
	        });
	        // copy button hover
	        upchangeIcon.addEventListener("mouseover", function (e) {
	            copyImgContainerCircle.setAttribute("style", "fill: #3498db");
	            // upchangeIcon.setAttribute("style", "color: #FFFFFF"); 
	        });
	        upchangeIcon.addEventListener("mouseout", function (e) {
	            copyImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
	            // upCopyIcon.setAttribute("style", "color: #FFFFFF"); 
	        });
	        // delete button hover
	        upDeleteIcon.addEventListener("mouseover", function (e) {
	            deleteImgContainerCircle.setAttribute("style", "fill: #3498db");
	        });
	        upDeleteIcon.addEventListener("mouseout", function (e) {
	            deleteImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
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
	            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
	                dropdownRightButtonUp.classList.remove("sqd-hidden");
	                dropdownRightButtonDown.classList.add("sqd-hidden");
	                dropdownBoxShape.setAttribute("stroke", "#247d99");
	            }
	            else {
	                dropdownRightButtonUp.classList.add("sqd-hidden");
	                dropdownRightButtonDown.classList.remove("sqd-hidden");
	                dropdownBoxShape.setAttribute("stroke", "#bfbfbf");
	            }
	        });
	        dropdownBoxShapeAfter1.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
	            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPop.classList.remove("sqd-hidden");
	            }
	            if (gSubDropdownbox1Pop.classList.contains("sqd-hidden")) {
	                dropdownRightButtonUp1.classList.add("sqd-hidden");
	                dropdownRightButtonDown1.classList.remove("sqd-hidden");
	                dropdownBoxShape1.setAttribute("stroke", "#bfbfbf");
	            }
	            else {
	                dropdownRightButtonUp1.classList.remove("sqd-hidden");
	                dropdownRightButtonDown1.classList.add("sqd-hidden");
	                dropdownBoxShape1.setAttribute("stroke", "#247d99");
	            }
	        });
	        dropdownBoxShapeAfter2.addEventListener("click", function (e) {
	            e.stopPropagation();
	            dropdownRightButtonUp2.classList.toggle("sqd-hidden");
	            dropdownRightButtonDown2.classList.toggle("sqd-hidden");
	            gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
	            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPop.classList.remove("sqd-hidden");
	            }
	            if (gSubDropdownbox2Pop.classList.contains("sqd-hidden")) {
	                dropdownRightButtonUp2.classList.add("sqd-hidden");
	                dropdownRightButtonDown2.classList.remove("sqd-hidden");
	                dropdownBoxShape2.setAttribute("stroke", "#bfbfbf");
	            }
	            else {
	                dropdownRightButtonUp2.classList.remove("sqd-hidden");
	                dropdownRightButtonDown2.classList.add("sqd-hidden");
	                dropdownBoxShape2.setAttribute("stroke", "#247d99");
	            }
	        });
	        dropdownBoxShapeAfterAct1.addEventListener("click", function (e) {
	            e.stopPropagation();
	            dropdownRightButtonUpAct1.classList.toggle("sqd-hidden");
	            dropdownRightButtonDownAct1.classList.toggle("sqd-hidden");
	            gSubDropdownboxAct1Pop.classList.toggle("sqd-hidden");
	            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPop.classList.remove("sqd-hidden");
	            }
	            if (gSubDropdownboxAct1Pop.classList.contains("sqd-hidden")) {
	                dropdownRightButtonUpAct1.classList.add("sqd-hidden");
	                dropdownRightButtonDownAct1.classList.remove("sqd-hidden");
	            }
	            else {
	                dropdownRightButtonUpAct1.classList.remove("sqd-hidden");
	                dropdownRightButtonDownAct1.classList.add("sqd-hidden");
	            }
	        });
	        dropdownBoxShapeAfterAct2.addEventListener("click", function (e) {
	            e.stopPropagation();
	            dropdownRightButtonUpAct2.classList.toggle("sqd-hidden");
	            dropdownRightButtonDownAct2.classList.toggle("sqd-hidden");
	            gSubDropdownboxAct2Pop.classList.toggle("sqd-hidden");
	            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPop.classList.remove("sqd-hidden");
	            }
	            if (gSubDropdownboxAct2Pop.classList.contains("sqd-hidden")) {
	                dropdownRightButtonUpAct2.classList.add("sqd-hidden");
	                dropdownRightButtonDownAct2.classList.remove("sqd-hidden");
	            }
	            else {
	                dropdownRightButtonUpAct2.classList.remove("sqd-hidden");
	                dropdownRightButtonDownAct2.classList.add("sqd-hidden");
	            }
	        });
	        dropdownBoxShapeAfterMain1.addEventListener("click", function (e) {
	            e.stopPropagation();
	            let shapeHeight;
	            gSubDropdownboxPopMain1.classList.toggle("sqd-hidden");
	            if (!gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPopMain1.classList.remove("sqd-hidden");
	            }
	            if (gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
	                dropdownRightButtonUpMain1.classList.add("sqd-hidden");
	                dropdownRightButtonDownMain1.classList.remove("sqd-hidden");
	            }
	            else {
	                dropdownRightButtonUpMain1.classList.remove("sqd-hidden");
	                dropdownRightButtonDownMain1.classList.add("sqd-hidden");
	            }
	            // CI expanded
	            if (!gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
	                shapeHeight = shapeHeightContact + 2 * CHOICE_H + 5;
	                // CI expanded and actions expanded
	                if (gSubDropdownboxPopMain2_1.classList.contains("sqd-hidden")) {
	                    dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
	                    dropdownBoxShapeMain2.setAttribute("y", `${DROPDOWN_Y + shapeHeight - 2}`);
	                    dropdownRightButtonDownMain2.setAttribute("y", `${DROPDOWN_Y + shapeHeight + 10}`);
	                    dropdownRightButtonUpMain2.setAttribute("y", `${DROPDOWN_Y + shapeHeight + 10}`);
	                    dropdownBoxInnerTextMain2.setAttribute("y", `${DROPDOWN_Y + shapeHeight + 18}`);
	                    dropdownBoxShapeAfterMain2.setAttribute("y", `${DROPDOWN_Y + shapeHeight + 5}`);
	                }
	                else {
	                    shapeHeight = shapeHeightContact + 2 * CHOICE_H + 3 + shapeHeightActions;
	                    dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
	                }
	            }
	            // CI collapsed and actions collapsed 
	            if (gSubDropdownboxPopMain1.classList.contains("sqd-hidden") &&
	                gSubDropdownboxPopMain2.classList.contains("sqd-hidden")) {
	                dropdownBoxBottomShape.setAttribute("height", `${shapeHeightCollapsed}`);
	                dropdownBoxShapeMain2.setAttribute("y", `${shapeMain2DefaultY}`);
	                dropdownRightButtonDownMain2.setAttribute("y", `${btnMain2DefaultY}`);
	                dropdownRightButtonUpMain2.setAttribute("y", `${btnMain2DefaultY}`);
	                dropdownBoxInnerTextMain2.setAttribute("y", `${innerTextMain2DefaultY}`);
	                dropdownBoxShapeAfterMain2.setAttribute("y", `${shapeAfterMain2DefaultY}`);
	            }
	            // CI expanded and actions expanded 
	            if (!gSubDropdownboxPopMain2.classList.contains("sqd-hidden") &&
	                !gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
	                shapeHeight = shapeHeightContact + 2 * CHOICE_H + 3 + shapeHeightActions;
	                dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
	                gSubDropdownboxPopMain2.classList.add("sqd-hidden");
	                gSubDropdownboxPopMain2_1.classList.remove("sqd-hidden");
	            }
	            // CI collapsed and actions expanded 
	            else if (!gSubDropdownboxPopMain2_1.classList.contains("sqd-hidden") &&
	                gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
	                shapeHeight = 2 * CHOICE_H + 7 + shapeHeightActions;
	                dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
	                gSubDropdownboxPopMain2.classList.remove("sqd-hidden");
	                gSubDropdownboxPopMain2_1.classList.add("sqd-hidden");
	            }
	        });
	        dropdownBoxShapeAfterMain2.addEventListener("click", function (e) {
	            e.stopPropagation();
	            if (gSubDropdownboxPopMain2.classList.contains("sqd-hidden") &&
	                gSubDropdownboxPopMain2_1.classList.contains("sqd-hidden")) {
	                dropdownRightButtonUpMain2.classList.remove("sqd-hidden");
	                dropdownRightButtonDownMain2.classList.add("sqd-hidden");
	            }
	            else {
	                dropdownRightButtonUpMain2.classList.add("sqd-hidden");
	                dropdownRightButtonDownMain2.classList.remove("sqd-hidden");
	            }
	            let shapeHeight;
	            // CI collapsed 
	            if (gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPopMain2_1.classList.add("sqd-hidden");
	                gSubDropdownboxPopMain2.classList.toggle("sqd-hidden");
	                // Actions collapsed 
	                if (gSubDropdownboxPopMain2.classList.contains("sqd-hidden")) {
	                    dropdownBoxBottomShape.setAttribute("height", `${shapeHeightCollapsed}`);
	                }
	                else {
	                    shapeHeight = 2 * CHOICE_H + 7 + shapeHeightActions;
	                    dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
	                }
	            }
	            // CI expanded 
	            if (!gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPopMain2.classList.add("sqd-hidden");
	                gSubDropdownboxPopMain2_1.classList.toggle("sqd-hidden");
	                // Actions collapsed
	                if (gSubDropdownboxPopMain2_1.classList.contains("sqd-hidden")) {
	                    shapeHeight = shapeHeightContact + 2 * CHOICE_H + 5;
	                    dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
	                }
	                else {
	                    shapeHeight = shapeHeightContact + 2 * CHOICE_H + 3 + shapeHeightActions;
	                    dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
	                }
	            }
	        });
	        JoinView.createStraightJoin(g, new Vector(containerWidths[0], 0), PADDING_TOP + boxHeight);
	        JoinView.createJoins(g, new Vector(containerWidths[0], PADDING_TOP + LABEL_HEIGHT + boxHeight / 2), containerOffsets.map((o, i) => new Vector(o + joinXs[i] + PADDING_X$5, PADDING_TOP + LABEL_HEIGHT + CONNECTION_HEIGHT + boxHeight / 2)));
	        const scrollboxViewCountry = ScrollBoxViewCountry.create(dropdownPopBody2, gSubDropdownbox2Pop);
	        scrollboxViewCountry.setContent(dropdownPopItemDiv2);
	        const scrollboxViewLocation = ScrollBoxViewLocation.create(searchPopBody, locInputPop);
	        scrollboxViewLocation.setContent(searchPopItemDiv);
	        const regionView = RegionView.create(g, containerWidths, containerHeight);
	        const validationErrorView = ValidationErrorView.create(g, containersWidth, 0);
	        return new SwitchStepComponentView(g, containersWidth, containerHeight, containerWidths[0], sequenceComponents, regionView, scrollboxViewCountry, scrollboxViewLocation, validationErrorView);
	    }
	    getClientPosition() {
	        return this.regionView.getClientPosition();
	    }
	    containsElement(element) {
	        return this.g.contains(element);
	    }
	    setIsDragging(isDragging) {
	        // this.inputView.setIsHidden(isDragging);
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

	class SwitchStepComponent {
	    static create(parent, step, parentSequence, configuration) {
	        const view = SwitchStepComponentView.create(parent, step, configuration);
	        return new SwitchStepComponent(view, step, parentSequence, configuration);
	    }
	    constructor(view, step, parentSequence, configuration) {
	        this.view = view;
	        this.step = step;
	        this.parentSequence = parentSequence;
	        this.configuration = configuration;
	        this.currentState = StepComponentState.default;
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

	const RECT_INPUT_SIZE = 18;
	const RECT_INPUT_ICON_SIZE = 14;
	const ROUND_INPUT_SIZE = 7;
	class InputView {
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
	    constructor(root) {
	        this.root = root;
	    }
	    setIsHidden(isHidden) {
	        Dom.attrs(this.root, {
	            visibility: isHidden ? 'hidden' : 'visible'
	        });
	    }
	}

	const OUTPUT_SIZE = 5;
	class OutputView {
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
	    constructor(root) {
	        this.root = root;
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
	        var addon = 0;
	        switch (step.name) {
	            case "Subscribe":
	                addon = 0;
	                break;
	            case "Unsubscribe":
	                addon = 14.383;
	                break;
	            case "Place a Purchase":
	                addon = 44.2115;
	                break;
	            case "Abandon Checkout":
	                addon = 54.8755;
	                break;
	        }
	        const g = Dom.svg("g", {
	            class: `sqd-task-group sqd-type-${step.type}`,
	        });
	        parent.insertBefore(g, parent.firstChild);
	        const boxHeight = ICON_SIZE$5 + PADDING_Y$4;
	        const text = Dom.svg("text", {
	            x: PADDING_X$4 / 1.5 + 4 + addon,
	            y: boxHeight / 1.7 - 3,
	            class: "sqd-task-text",
	        });
	        text.textContent = step.name;
	        g.appendChild(text);
	        const textWidth = Math.max(text.getBBox().width + 16, MIN_TEXT_WIDTH$4);
	        const boxWidth = ICON_SIZE$5 + 8 * PADDING_X$4 + 2 * textWidth;
	        const gTriggerHint = Dom.svg("g", {
	            class: "sqd-task-group-pop",
	        });
	        const join = Dom.svg('line', {
	            class: 'sqd-join-pop',
	            x1: 241.953 + addon,
	            y1: 16,
	            x2: 274.953 + addon,
	            y2: 16
	        });
	        const triggerHint = Dom.svg("rect", {
	            class: "sqd-task-rect-triggerhint",
	            x: 266.953 + addon,
	            y: 0.5 - 3,
	            height: boxHeight + 6,
	            width: 175,
	            rx: 9,
	            ry: 9
	        });
	        const hint_text = Dom.svg("text", {
	            x: 276.953 + addon,
	            y: 17,
	            class: "sqd-task-text",
	        });
	        hint_text.textContent = "Please set up your trigger";
	        gTriggerHint.appendChild(join);
	        gTriggerHint.appendChild(triggerHint);
	        gTriggerHint.appendChild(hint_text);
	        const rect = Dom.svg("rect", {
	            x: 0.5 + addon,
	            y: 0.5,
	            class: `sqd-task-rect-${step.name}`,
	            width: 258,
	            height: boxHeight,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        g.insertBefore(rect, text);
	        const rectLeft = Dom.svg("rect", {
	            x: 0.5 + addon,
	            y: 0.5,
	            class: `sqd-task-rect-${step.name}`,
	            width: textWidth + 5,
	            height: boxHeight,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        const textRight = Dom.svg("text", {
	            // x: ICON_SIZE + 3 * PADDING_X + textWidth - 10,
	            x: (textWidth / MIN_TEXT_WIDTH$4) * 48.5 + MIN_TEXT_WIDTH$4 + addon,
	            y: boxHeight / 1.7 + 1,
	            class: "sqd-task-text_2",
	        });
	        if (step.properties["Select List"]) {
	            textRight.textContent = step.properties["Select List"].toString();
	        }
	        else {
	            textRight.textContent = "To Any List";
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
	        var moreUrl;
	        const moreDotUrl = "./assets/more-dot.svg";
	        if (step.name == "Subscribe" || step.name == "Unsubscribe") {
	            moreUrl = "./assets/more2.svg";
	        }
	        else {
	            moreUrl = "./assets/more3.svg";
	        }
	        const gmoreIcon = Dom.svg("g", {
	            class: "moreIcon-group"
	        });
	        const moreIcon = moreUrl
	            ? Dom.svg("image", {
	                href: moreUrl,
	            })
	            : Dom.svg("rect", {
	                class: "sqd-task-empty-icon",
	                rx: 4,
	                ry: 4,
	            });
	        Dom.attrs(moreIcon, {
	            class: "moreIcon",
	            x: 232 + addon,
	            y: 5,
	            width: ICON_SIZE$5,
	            height: ICON_SIZE$5,
	        });
	        const moreIconDot = Dom.svg("image", {
	                href: moreDotUrl,
	            })
	            ;
	        Dom.attrs(moreIconDot, {
	            class: "moreIconDot",
	            x: 236 + addon,
	            y: 8,
	            width: ICON_SIZE$5,
	            height: ICON_SIZE$5,
	        });
	        gmoreIcon.appendChild(moreIcon);
	        gmoreIcon.appendChild(moreIconDot);
	        const rightCopyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightCopyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 60,
	            x: 270 + addon,
	            y: PADDING_Y$4 - 6,
	        });
	        Dom.attrs(rightCopyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const changeUrl = "./assets/change.svg";
	        const changeIcon = Dom.svg("image", {
	                href: changeUrl,
	            })
	            ;
	        Dom.attrs(changeIcon, {
	            class: "moreicon",
	            id: `RightChangeIcon-${step.id}`,
	            // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 64,
	            x: 274 + addon,
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
	            // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 46,
	            x: 256 + addon,
	            y: PADDING_Y$4 + 27,
	        });
	        Dom.attrs(rightDeleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const deleteUrl = "./assets/delete.svg";
	        const deleteIcon = Dom.svg("image", {
	                href: deleteUrl,
	            })
	            ;
	        Dom.attrs(deleteIcon, {
	            class: "moreicon",
	            id: `RightDeleteIcon-${step.id}`,
	            // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 50,
	            x: 260 + addon,
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
	            // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 50,
	            x: 260 + addon,
	            y: PADDING_Y$4 - 40,
	        });
	        Dom.attrs(rightEditImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const editUrl = "./assets/edit.svg";
	        const editIcon = Dom.svg("image", {
	                href: editUrl,
	            })
	            ;
	        Dom.attrs(editIcon, {
	            class: "moreicon",
	            // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 53,
	            x: 263 + addon,
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
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 89,
	            x: 170 + addon,
	            y: PADDING_Y$4 - 40,
	            style: "fill:#3498DB"
	        });
	        Dom.attrs(checkImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCheckIconUrl = "./assets/check-inside.svg";
	        const upCheckIcon = Dom.svg("image", {
	                href: upCheckIconUrl,
	            })
	            ;
	        Dom.attrs(upCheckIcon, {
	            class: "checkIcon-inside",
	            // id: `tagUpCheckIcon`,
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 93,
	            x: 177.4 + addon,
	            y: PADDING_Y$4 - 33,
	            width: 18,
	            height: 18,
	        });
	        checkImgContainer.appendChild(checkImgContainerCircle);
	        checkImgContainer.appendChild(upCheckIcon);
	        const deleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const deleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 41 + 110,
	            x: 232 + addon,
	            y: PADDING_Y$4 - 40,
	        });
	        Dom.attrs(deleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upDeleteIconUrl = "./assets/delete.svg";
	        const upDeleteIcon = Dom.svg("image", {
	                href: upDeleteIconUrl,
	            })
	            ;
	        Dom.attrs(upDeleteIcon, {
	            class: "moreicon",
	            id: `UpDeleteIcon-${step.id}`,
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 44 + 110,
	            x: 235 + addon,
	            y: PADDING_Y$4 - 37,
	            width: ICON_SIZE$5,
	            height: ICON_SIZE$5,
	        });
	        deleteImgContainer.appendChild(deleteImgContainerCircle);
	        deleteImgContainer.appendChild(upDeleteIcon);
	        upDeleteIcon.addEventListener("mousedown", function () {
	            deleteImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            upDeleteIcon.setAttribute("href", "./assets/delete-inside.svg");
	        });
	        upDeleteIcon.addEventListener("mouseup", function () {
	            deleteImgContainerCircle.setAttribute("style", "fill:white");
	            upDeleteIcon.setAttribute("href", "./assets/delete.svg");
	        });
	        const copyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const copyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 98,
	            x: 201 + addon,
	            y: PADDING_Y$4 - 40,
	        });
	        Dom.attrs(copyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upchangeUrl = "./assets/change.svg";
	        const upchangeIcon = Dom.svg("image", {
	                href: upchangeUrl,
	            })
	            ;
	        Dom.attrs(upchangeIcon, {
	            class: "moreicon",
	            id: `UpChangeIcon-${step.id}`,
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 102,
	            x: 205 + addon,
	            y: PADDING_Y$4 - 37,
	            width: ICON_SIZE$5,
	            height: ICON_SIZE$5,
	        });
	        copyImgContainer.appendChild(copyImgContainerCircle);
	        copyImgContainer.appendChild(upchangeIcon);
	        //Zi:dropdown_img
	        const downImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const downUrl = "./assets/list_down.svg";
	        const downIcon = Dom.svg("image", {
	                href: downUrl,
	            })
	            ;
	        Dom.attrs(downIcon, {
	            x: 181 + addon,
	            y: PADDING_Y$4 + 50,
	        });
	        downImgContainer.appendChild(downIcon);
	        const downImgContainer1 = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const downIcon1 = Dom.svg("image", {
	                href: downUrl,
	            })
	            ;
	        Dom.attrs(downIcon1, {
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 78,
	            x: 181 + addon,
	            y: PADDING_Y$4 + 85,
	        });
	        downImgContainer1.appendChild(downIcon1);
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
	            x: 0.5 + addon,
	            y: 0.5,
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        Dom.attrs(reminder1, {
	            id: `reminder1${Date.now()}`,
	            x: 300.95 + addon,
	            y: PADDING_Y$4 - 35,
	        });
	        const reminderText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 313.45 + addon,
	            y: PADDING_Y$4 - 23,
	        });
	        Dom.attrs(reminderText1, {
	            //class: 'sqd-hidden',
	            id: `reminderText${Date.now()}`,
	        });
	        reminderText1.textContent = "Edit";
	        const reminder2 = Dom.svg("rect", {
	            x: 0.5 + addon,
	            y: 0.5,
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        Dom.attrs(reminder2, {
	            id: `reminder2${Date.now()}`,
	            x: 310.95 + addon,
	            y: PADDING_Y$4,
	        });
	        const reminderText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 320.95 + addon,
	            y: PADDING_Y$4 + 12,
	        });
	        Dom.attrs(reminderText2, {
	            //class: 'sqd-hidden',
	            id: `reminderText2${Date.now()}`,
	        });
	        reminderText2.textContent = "Reset";
	        const reminder3 = Dom.svg("rect", {
	            x: 0.5 + addon,
	            y: 0.5,
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        Dom.attrs(reminder3, {
	            id: `reminder3${Date.now()}`,
	            x: 300.95 + addon,
	            y: PADDING_Y$4 + 35,
	        });
	        const reminderText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 307.45 + addon,
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
	            x: 0.5 + addon,
	            y: 0.5,
	            class: `sqd-task-rect-${step.name}`,
	            width: 258,
	            height: 3.5 * boxHeight + 23,
	            rx: RECT_RADIUS$4,
	            ry: RECT_RADIUS$4,
	        });
	        Dom.attrs(rect1, {
	            id: `dropdown${Date.now()}`,
	        });
	        const nameText = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: PADDING_X$4 + 10 + addon,
	            y: 1.5 * boxHeight + 15,
	        });
	        Dom.attrs(nameText, {
	            //class: 'sqd-hidden',
	            id: `dropdownword1${Date.now()}`,
	        });
	        const nameText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: PADDING_X$4 + 10 + addon,
	            y: 2 * boxHeight + 35,
	        });
	        Dom.attrs(nameText1, {
	            //class: 'sqd-hidden',
	            id: `dropdownword2${Date.now()}`,
	        });
	        nameText.textContent = "Select List";
	        nameText1.textContent = "Runs";
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
	            width: 100,
	            height: 20,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#BFBFBF",
	            rx: "4",
	            ry: "4",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4 + 17 + addon,
	            y: 1.2 * boxHeight + 15,
	        });
	        const dropdownBoxShape1 = Dom.svg("rect", {
	            width: 100,
	            height: 20,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#BFBFBF",
	            rx: "4",
	            ry: "4",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4 + 17 + addon,
	            y: 1.75 * boxHeight + 32,
	        });
	        const dropdownRightButton = Dom.svg("text", {
	            class: "sqd-task-text select-field",
	            x: ICON_SIZE$5 + 9 * PADDING_X$4 + addon,
	            y: 1.35 * boxHeight,
	        });
	        const dropdownRightButton1 = Dom.svg("text", {
	            class: "sqd-task-text select-field",
	            x: ICON_SIZE$5 + 9 * PADDING_X$4 + addon,
	            y: 1.9 * boxHeight,
	        });
	        const dropdownBoxInnerText = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4 + 25 + addon,
	            y: 1.4 * boxHeight + 18,
	        });
	        if (step.properties["Select List"]) {
	            dropdownBoxInnerText.textContent = step.properties["Select List"].toString();
	        }
	        else {
	            dropdownBoxInnerText.textContent = "Any list";
	        }
	        dropdownBoxInnerText.style.fill = "#BFBFBF";
	        const dropdownBoxInnerText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4 + 25 + addon,
	            y: 1.95 * boxHeight + 34.5,
	        });
	        if (step.properties["Run"]) {
	            dropdownBoxInnerText1.textContent = step.properties["Run"].toString();
	        }
	        else {
	            dropdownBoxInnerText1.textContent = "Once";
	        }
	        dropdownBoxInnerText1.style.fill = "#BFBFBF";
	        const dropdownBoxShapeAfter = Dom.svg("rect", {
	            width: 100,
	            height: 20,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4 + 17 + addon,
	            y: 1.2 * boxHeight + 15,
	            id: `dropdownBoxShape${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfter, {
	            opacity: 0,
	        });
	        const dropdownBoxShape1After = Dom.svg("rect", {
	            width: 100,
	            height: 20,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4 + 17 + addon,
	            y: 1.75 * boxHeight + 32,
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
	        // Fetch audience list from backend
	        const userID = 123; //Need to be changed to current user
	        const request = new Request(`http://localhost:8080/dashboard/getAudiencelist/${userID}`, { method: 'GET' });
	        let list = [];
	        // Async way to fetch audience list
	        const getlist = () => __awaiter(this, void 0, void 0, function* () {
	            const response = yield fetch(request);
	            if (response.ok) {
	                const val = yield response.json();
	                modifyDropdown(val);
	            }
	        });
	        getlist();
	        // Options
	        const modifyDropdown = function (list) {
	            const dropdownBoxBottomShaperec = Dom.svg("rect", {
	                width: 100,
	                height: list.length * 25,
	                fill: "#fff",
	                stroke: "#4FCCFC",
	                x: ICON_SIZE$5 + 5 * PADDING_X$4 + 17 + addon,
	                y: 1.75 * boxHeight + 22,
	                rx: 4,
	                ry: 4
	            });
	            gSubDropdownboxPop.appendChild(dropdownBoxBottomShaperec);
	            for (let i = 1; i <= list.length; i++) {
	                const dropdownBoxBottomShapeText = Dom.svg("text", {
	                    class: "sqd-task-text",
	                    x: ICON_SIZE$5 + 5 * PADDING_X$4 + 25 + addon,
	                    y: 1.4 * boxHeight + 22 * i + 27,
	                });
	                dropdownBoxBottomShapeText.textContent = list[i - 1];
	                const dropdownBoxBottomShapecover = Dom.svg("rect", {
	                    width: 90,
	                    height: 20,
	                    class: "option select-field choice",
	                    fill: "#fff",
	                    stroke: "none",
	                    x: ICON_SIZE$5 + 5 * PADDING_X$4 + 22 + addon,
	                    y: 1.2 * boxHeight + 22 * i + 25,
	                    id: `dropdownBoxBottomShapecover${Date.now()}`,
	                    rx: 4,
	                    ry: 4,
	                });
	                Dom.attrs(dropdownBoxBottomShapecover, {
	                    opacity: 0.07,
	                });
	                // Add event listners
	                dropdownBoxBottomShapecover.addEventListener("click", function (e) {
	                    dropdownBoxInnerText.textContent = dropdownBoxBottomShapeText.textContent;
	                    gSubDropdownboxPop.classList.toggle("sqd-hidden");
	                    dropdownBoxShape.style.stroke = "#BFBFBF";
	                    dropdownBoxInnerText.style.fill = "#BFBFBF";
	                    downIcon.setAttribute("href", "./assets/list_down.svg");
	                });
	                gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeText);
	                // gSubDropdownboxPop.insertBefore(
	                //    dropdownBoxBottomShape,
	                //   dropdownBoxBottomShapeText
	                // );
	                gSubDropdownboxPop.appendChild(dropdownBoxBottomShapecover);
	            }
	        };
	        // Run time choices
	        list = ['Once', 'Multiple'];
	        const dropdownBoxBottomShape1rec = Dom.svg("rect", {
	            width: 100,
	            height: list.length * 25,
	            fill: "#fff",
	            stroke: "#4FCCFC",
	            x: ICON_SIZE$5 + 5 * PADDING_X$4 + 17 + addon,
	            y: 1.75 * boxHeight + 57,
	            rx: 4,
	            ry: 4
	        });
	        gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1rec);
	        // Options
	        for (let i = 1; i <= list.length; i++) {
	            // const dropdownBoxBottomShape1 = Dom.svg("rect", {
	            //   width: 100,
	            //   height: 20,
	            //   class: "option select-field",
	            //   fill: "#fff",
	            //   stroke: "#a0a0a0",
	            //   x: ICON_SIZE + 5 * PADDING_X+17,
	            //   y: 1.75 * boxHeight + 15 * i+32,
	            // });
	            const dropdownBoxBottomShape1Text = Dom.svg("text", {
	                class: "sqd-task-text",
	                x: ICON_SIZE$5 + 5 * PADDING_X$4 + 25 + addon,
	                y: 1.95 * boxHeight + 20 * i + 45,
	            });
	            dropdownBoxBottomShape1Text.textContent = list[i - 1];
	            const dropdownBoxBottomShape1cover = Dom.svg("rect", {
	                width: 90,
	                height: 20,
	                class: "option select-field choice",
	                fill: "#fff",
	                stroke: "none",
	                x: ICON_SIZE$5 + 5 * PADDING_X$4 + 22 + addon,
	                y: 1.75 * boxHeight + 20 * i + 42,
	                id: `dropdownBoxBottomShape1cover${Date.now()}`,
	                rx: 4,
	                ry: 4,
	            });
	            Dom.attrs(dropdownBoxBottomShape1cover, {
	                opacity: 0.07,
	            });
	            // Add event listners
	            dropdownBoxBottomShape1cover.addEventListener("click", function (e) {
	                dropdownBoxInnerText1.textContent = dropdownBoxBottomShape1Text.textContent;
	                gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
	                dropdownBoxShape1.style.stroke = "#BFBFBF";
	                dropdownBoxInnerText1.style.fill = "#BFBFBF";
	                downIcon1.setAttribute("href", "./assets/list_down.svg");
	            });
	            // Append Child
	            gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text);
	            // gSubDropdownbox1Pop.insertBefore(
	            //   dropdownBoxBottomShape1,
	            //   dropdownBoxBottomShape1Text
	            // );
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
	        gSubDropdown.appendChild(downImgContainer);
	        gSubDropdown.appendChild(gSubDropdownboxPop);
	        gSubDropdown1.appendChild(gSubDropdownbox1);
	        gSubDropdown1.appendChild(gSubDropdownbox1Pop);
	        gSubDropdown1.appendChild(downImgContainer1);
	        gDropdown.appendChild(gSubDropdown1);
	        gDropdown.appendChild(gSubDropdown);
	        g.appendChild(gTriggerHint);
	        g.appendChild(gmoreIcon);
	        g.appendChild(gRightPop3);
	        g.appendChild(gDropdown);
	        g.insertBefore(gDropdown, rect);
	        g.appendChild(gRightPop3Reminder);
	        g.appendChild(gUpPop3);
	        g.appendChild(setUpReminder);
	        var if_hintpop = true;
	        // Add EventListeners
	        gmoreIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            if (gDropdown.classList.contains("sqd-hidden")) {
	                gRightPop3.classList.toggle("sqd-hidden");
	            }
	            else {
	                gDropdown.classList.toggle("sqd-hidden");
	                gUpPop3.classList.toggle("sqd-hidden");
	                gRightPop3.classList.toggle("sqd-hidden");
	            }
	            gTriggerHint.setAttribute("visibility", "hidden");
	            if_hintpop = false;
	        });
	        gmoreIcon.addEventListener("mouseover", function () {
	            if (if_hintpop) {
	                gTriggerHint.setAttribute("visibility", "hidden");
	            }
	        });
	        gmoreIcon.addEventListener("mouseout", function () {
	            if (if_hintpop) {
	                gTriggerHint.setAttribute("visibility", "visible");
	            }
	        });
	        // Edit
	        editIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            gRightPop3.classList.toggle("sqd-hidden");
	            gSubDropdown.classList.remove("sqd-hidden");
	            gSubDropdown1.classList.remove("sqd-hidden");
	        });
	        upCheckIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gDropdown.classList.toggle("sqd-hidden");
	            gSubDropdown.classList.toggle("sqd-hidden");
	            gSubDropdown1.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            if (dropdownBoxInnerText.textContent && dropdownBoxInnerText.textContent != "Select") {
	                textRight.textContent = dropdownBoxInnerText.textContent;
	                step.properties["Select List"] = dropdownBoxInnerText.textContent;
	            }
	            if (dropdownBoxInnerText1.textContent && dropdownBoxInnerText1.textContent != "Select") {
	                step.properties["Run"] = dropdownBoxInnerText1.textContent;
	            }
	            step.updatedAt = new Date();
	        });
	        upCheckIcon.addEventListener("mousedown", function () {
	            checkImgContainerCircle.setAttribute("style", "fill:#0C67A5");
	        });
	        upCheckIcon.addEventListener("mouseup", function () {
	            checkImgContainerCircle.setAttribute("style", "fill:#3498DB");
	        });
	        upchangeIcon.addEventListener("mousedown", function () {
	            copyImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            upchangeIcon.setAttribute("href", "./assets/chang-inside.svg");
	        });
	        upchangeIcon.addEventListener("mouseup", function () {
	            copyImgContainerCircle.setAttribute("style", "fill:white");
	            upchangeIcon.setAttribute("href", "./assets/change.svg");
	        });
	        upchangeIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            // if_hintpop = true;
	            // gTriggerHint.setAttribute("visibility", "visible");
	            const dialogBox = Dom.element("dialog", {
	                class: "confirm-dialog",
	                id: "dialog-box",
	            });
	            const title = Dom.element("h3", {
	                class: "confirm-dialog-content",
	            });
	            const title2 = Dom.element("h3", {
	                class: "confirm-dialog-content-warning",
	            });
	            const form = Dom.element("form", {
	                method: "dialog",
	                id: "dialog-form",
	            });
	            title.innerHTML = "Are you sure you want to<br>&nbsp&nbsp&nbsp&nbsp&nbspchange the trigger?";
	            title2.innerHTML = "This will clear all your settings";
	            dialogBox.appendChild(title);
	            dialogBox.appendChild(title2);
	            const btn1 = Dom.element("button", {
	                type: "submit",
	                class: "popup-button"
	            });
	            btn1.innerText = "Cancel";
	            form.appendChild(btn1);
	            const btn2 = Dom.element("button", {
	                type: "submit",
	                class: "popup-button2"
	            });
	            btn2.innerText = "Confirm";
	            form.appendChild(btn2);
	            const designer = document.getElementById("designer");
	            designer === null || designer === void 0 ? void 0 : designer.appendChild(dialogBox);
	            dialogBox.appendChild(form);
	            if (typeof dialogBox.showModal === "function") {
	                dialogBox.showModal();
	            }
	            else {
	                prompt("Wrong window", "ok");
	            }
	            btn1.addEventListener("click", function (e) {
	                e.preventDefault();
	                e.stopPropagation();
	                const designer = document.getElementById("designer");
	                while (designer === null || designer === void 0 ? void 0 : designer.childNodes[1]) {
	                    designer === null || designer === void 0 ? void 0 : designer.removeChild(designer.childNodes[1]);
	                }
	            });
	            btn2.addEventListener("click", function (e) {
	                e.preventDefault();
	                e.stopPropagation();
	                textRight.textContent = "To Any List";
	                dropdownBoxInnerText.textContent = "Any list";
	                dropdownBoxInnerText1.textContent = "Once";
	                const designer = document.getElementById("designer");
	                while (designer === null || designer === void 0 ? void 0 : designer.childNodes[1]) {
	                    designer === null || designer === void 0 ? void 0 : designer.removeChild(designer.childNodes[1]);
	                }
	            });
	        });
	        changeIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            const dialogBox = Dom.element("dialog", {
	                class: "confirm-dialog",
	                id: "dialog-box",
	            });
	            const title = Dom.element("h3", {
	                class: "confirm-dialog-content",
	            });
	            const title2 = Dom.element("h3", {
	                class: "confirm-dialog-content-warning",
	            });
	            const form = Dom.element("form", {
	                method: "dialog",
	                id: "dialog-form",
	            });
	            title.innerHTML = "Are you sure you want to<br>&nbsp&nbsp&nbsp&nbsp&nbspchange the trigger?";
	            title2.innerHTML = "This will clear all your settings";
	            dialogBox.appendChild(title);
	            dialogBox.appendChild(title2);
	            const btn1 = Dom.element("button", {
	                type: "submit",
	                class: "popup-button"
	            });
	            btn1.innerText = "Confirm";
	            form.appendChild(btn1);
	            const btn2 = Dom.element("button", {
	                type: "submit",
	                class: "popup-button2"
	            });
	            btn2.innerText = "Cancel";
	            form.appendChild(btn2);
	            const designer = document.getElementById("designer");
	            designer === null || designer === void 0 ? void 0 : designer.appendChild(dialogBox);
	            dialogBox.appendChild(form);
	            if (typeof dialogBox.showModal === "function") {
	                dialogBox.showModal();
	            }
	            else {
	                prompt("Wrong window", "ok");
	            }
	            btn2.addEventListener("click", function (e) {
	                e.preventDefault();
	                e.stopPropagation();
	                const designer = document.getElementById("designer");
	                while (designer === null || designer === void 0 ? void 0 : designer.childNodes[1]) {
	                    designer === null || designer === void 0 ? void 0 : designer.removeChild(designer.childNodes[1]);
	                }
	            });
	            btn1.addEventListener("click", function (e) {
	                e.preventDefault();
	                e.stopPropagation();
	                textRight.textContent = "To Any List";
	                dropdownBoxInnerText.textContent = "Any list";
	                dropdownBoxInnerText1.textContent = "Once";
	                const designer = document.getElementById("designer");
	                while (designer === null || designer === void 0 ? void 0 : designer.childNodes[1]) {
	                    designer === null || designer === void 0 ? void 0 : designer.removeChild(designer.childNodes[1]);
	                }
	            });
	        });
	        // Show hints
	        editIcon.addEventListener("mouseover", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mouseout", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mousedown", function () {
	            rightEditImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            editIcon.setAttribute("href", "./assets/edit2.svg");
	        });
	        editIcon.addEventListener("mouseup", function () {
	            rightEditImgContainerCircle.setAttribute("style", "fill:white");
	            editIcon.setAttribute("href", "./assets/edit.svg");
	        });
	        changeIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        changeIcon.addEventListener("mousedown", function () {
	            rightCopyImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            changeIcon.setAttribute("href", "./assets/chang-inside.svg");
	        });
	        changeIcon.addEventListener("mouseup", function () {
	            rightCopyImgContainerCircle.setAttribute("style", "fill:white");
	            changeIcon.setAttribute("href", "./assets/change.svg");
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
	        deleteIcon.addEventListener("mousedown", function () {
	            rightDeleteImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            deleteIcon.setAttribute("href", "./assets/delete-inside.svg");
	        });
	        deleteIcon.addEventListener("mouseup", function () {
	            rightDeleteImgContainerCircle.setAttribute("style", "fill:white");
	            deleteIcon.setAttribute("href", "./assets/delete.svg");
	        });
	        // Event listeners in Dropdown
	        dropdownBoxShapeAfter.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gSubDropdownboxPop.classList.toggle("sqd-hidden");
	            if (!gSubDropdownbox1Pop.classList.contains("sqd-hidden")) {
	                gSubDropdownbox1Pop.classList.remove("sqd-hidden");
	            }
	            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
	                dropdownBoxShape.style.stroke = "#4FCCFC";
	                downIcon.setAttribute("href", "./assets/list_up.svg");
	                dropdownBoxInnerText.style.fill = "#43A2E3";
	            }
	            else {
	                dropdownBoxShape.style.stroke = "#BFBFBF";
	                downIcon.setAttribute("href", "./assets/list_down.svg");
	                dropdownBoxInnerText.style.fill = "#BFBFBF";
	            }
	        });
	        dropdownBoxShape1After.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
	            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPop.classList.remove("sqd-hidden");
	            }
	            if (!gSubDropdownbox1Pop.classList.contains("sqd-hidden")) {
	                dropdownBoxShape1.style.stroke = "#4FCCFC";
	                downIcon1.setAttribute("href", "./assets/list_up.svg");
	                dropdownBoxInnerText1.style.fill = "#43A2E3";
	            }
	            else {
	                dropdownBoxShape1.style.stroke = "#BFBFBF";
	                downIcon1.setAttribute("href", "./assets/list_down.svg");
	                dropdownBoxInnerText1.style.fill = "#BFBFBF";
	            }
	        });
	        const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
	        inputView.setIsHidden(true);
	        const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
	        outputView.setIsHidden(true);
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
	        parent.insertBefore(g, parent.firstChild);
	        const boxHeight = ICON_SIZE$4 + PADDING_Y$3;
	        const text = Dom.svg("text", {
	            x: PADDING_X$3 / 2 - 0.5,
	            y: boxHeight / 1.7 - 2,
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
	            y: boxHeight / 1.7 + 1,
	            class: "sqd-task-text_2",
	        });
	        if (step.properties["date"]) {
	            textRight.textContent = step.properties["date"].toString();
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
	        const moreUrl = "./assets/moreDelay.svg";
	        const moreIcon = Dom.svg("image", {
	                href: moreUrl,
	            })
	            ;
	        const moreDotUrl = "./assets/more-dot.svg";
	        const moreIconDot = Dom.svg("image", {
	                href: moreDotUrl,
	            })
	            ;
	        Dom.attrs(moreIconDot, {
	            class: "moreIconDot",
	            x: 236,
	            y: 8,
	            width: ICON_SIZE$4,
	            height: ICON_SIZE$4,
	        });
	        Dom.attrs(moreIcon, {
	            class: "moreIcon",
	            // id: `tagMoreIcon`,
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
	        const copyUrl = "./assets/copy.svg";
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
	        const deleteUrl = "./assets/delete.svg";
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
	        const editUrl = "./assets/edit.svg";
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
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 89,
	            x: 170,
	            y: PADDING_Y$3 - 40,
	            style: "fill:#3498DB"
	        });
	        Dom.attrs(checkImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCheckIconUrl = "./assets/check-inside.svg";
	        const upCheckIcon = Dom.svg("image", {
	                href: upCheckIconUrl,
	            })
	            ;
	        Dom.attrs(upCheckIcon, {
	            class: "checkIcon-inside",
	            // id: `tagUpCheckIcon`,
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 93,
	            x: 177.4,
	            y: PADDING_Y$3 - 33,
	            width: 18,
	            height: 18,
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
	        const upDeleteIconUrl = "./assets/delete.svg";
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
	        const upCopyIconUrl = "./assets/copy.svg";
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
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$3,
	            ry: RECT_RADIUS$3,
	        });
	        Dom.attrs(reminder1, {
	            id: `reminder1${Date.now()}`,
	            x: 300.95,
	            y: PADDING_Y$3 - 35,
	        });
	        const reminderText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 313.45,
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
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$3,
	            ry: RECT_RADIUS$3,
	        });
	        Dom.attrs(reminder2, {
	            id: `reminder2${Date.now()}`,
	            x: 310.95,
	            y: PADDING_Y$3,
	        });
	        const reminderText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 320.95,
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
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$3,
	            ry: RECT_RADIUS$3,
	        });
	        Dom.attrs(reminder3, {
	            id: `reminder3${Date.now()}`,
	            x: 300.95,
	            y: PADDING_Y$3 + 35,
	        });
	        const reminderText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 307.45,
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
	            y: 0.5,
	            class: `sqd-task-rect`,
	            width: 258,
	            height: 150,
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
	        choice1.style.marginLeft = "32px";
	        choice1.style.marginTop = "25px";
	        const choice1Text = Dom.element("label", {
	            class: "sqd-delay-label"
	        });
	        choice1Text.innerText = "Wait until a specific date";
	        const choice1TextNextLine = Dom.element("br");
	        const choice2 = Dom.element("input", {
	            type: "radio",
	            name: "choice",
	            value: 2,
	        });
	        choice2.style.marginLeft = "32px";
	        choice2.style.marginTop = "25px";
	        const choice2Text = Dom.element("label", {
	            class: "sqd-delay-label"
	        });
	        choice2Text.innerText = "Wait for a duration of time";
	        //add input for time delay tag
	        var foreignObjectTag = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject"); //Create a rect in SVG's namespace
	        foreignObjectTag.setAttribute("x", "3"); //Set rect data
	        foreignObjectTag.setAttribute("y", "32"); //Set rect data
	        foreignObjectTag.setAttribute("width", "250"); //Set rect data
	        foreignObjectTag.setAttribute("height", "400"); //Set rect data
	        //foreignObjectTag.setAttribute("class", "sqd-hidden");
	        let databefore;
	        const divTagPickTime = Dom.element("div", {
	            id: "calendar",
	            class: "sqd-hidden"
	        });
	        let OnceDates;
	        //@ts-ignore
	        let calendar = new VanillaCalendar(divTagPickTime, {
	            settings: {
	                range: {
	                    disablePast: true,
	                },
	                visibility: {
	                    weekend: false,
	                },
	                iso8601: false,
	            },
	            actions: {
	                //@ts-ignore
	                clickDay(event, dates) {
	                    OnceDates = dates;
	                },
	            },
	        });
	        if (step.properties["date"] && !step.properties["date"].toString().includes(" ")) {
	            databefore = step.properties["date"].toString().split(" ");
	        }
	        if (step.properties["date"] && !step.properties["date"].toString().includes(" ")) {
	            //@ts-ignore
	            calendar = new VanillaCalendar(divTagPickTime, {
	                settings: {
	                    range: {
	                        disablePast: true,
	                    },
	                    selected: {
	                        dates: databefore,
	                        month: parseInt(databefore[0].split('')[6]) - 1
	                    },
	                    visibility: {
	                        weekend: false,
	                    },
	                    iso8601: false,
	                },
	                actions: {
	                    //@ts-ignore
	                    clickDay(event, dates) {
	                        OnceDates = dates;
	                    },
	                },
	            });
	        }
	        calendar.init();
	        const divTagWaitTime = Dom.element("div", {
	            class: "sqd-delay-time sqd-hidden"
	        });
	        const waitTimeInput = Dom.element("input", {
	            class: "delay-input",
	            type: "number",
	            placeholder: "Enter",
	            x: 0.5,
	            y: 0.5,
	            // maxlength: 3,
	        });
	        divTagWaitTime.appendChild(waitTimeInput);
	        const gSubDropdown = Dom.svg("g", {
	            class: `sqd-task-group sub-dropdown sqd-hidden`,
	        });
	        if (step.properties["date"]) {
	            if (!step.properties["date"].toString().includes(" ")) {
	                databefore = step.properties["date"].toString().split(" ");
	                choice1.click();
	                rect1.setAttribute("height", "410");
	                divTagPickTime.classList.remove("sqd-hidden");
	                divTagWaitTime.classList.add("sqd-hidden");
	                gSubDropdown.classList.add("sqd-hidden");
	            }
	            else {
	                databefore = step.properties["date"].toString().split(" ");
	                choice2.click();
	                rect1.setAttribute("height", "200");
	                divTagPickTime.classList.add("sqd-hidden");
	                divTagWaitTime.classList.remove("sqd-hidden");
	                gSubDropdown.classList.remove("sqd-hidden");
	            }
	        }
	        if (databefore && databefore.length != 1) {
	            waitTimeInput.value = databefore[0];
	        }
	        const dropdownBoxShape = Dom.svg("rect", {
	            width: 100,
	            height: 24,
	            class: "delay-box option select-field",
	            fill: "#fff",
	            stroke: "#BFBFBF",
	            rx: "3",
	            ry: "3",
	            x: ICON_SIZE$4 + 5 * PADDING_X$3 + 42,
	            y: 1.2 * boxHeight + 102,
	        });
	        const dropdownBoxInnerText = Dom.svg("text", {
	            class: "sqd-task-text_2",
	            x: ICON_SIZE$4 + 5 * PADDING_X$3 + 52,
	            y: 1.2 * boxHeight + 117,
	        });
	        if (databefore && databefore.length != 1) {
	            dropdownBoxInnerText.textContent = databefore[1].slice(0, -1);
	        }
	        else {
	            dropdownBoxInnerText.textContent = "Hour";
	        }
	        const downUrl = "./assets/list_down.svg";
	        const downIcon = Dom.svg("image", {
	                href: downUrl,
	            })
	            ;
	        Dom.attrs(downIcon, {
	            x: ICON_SIZE$4 + 5 * PADDING_X$3 + 126,
	            y: 1.2 * boxHeight + 111,
	        });
	        const dropdownBoxShapeAfter = Dom.svg("rect", {
	            width: 100,
	            height: 24,
	            class: "delay-box-shape option select-field",
	            fill: "#fff",
	            stroke: "#BFBFBF",
	            rx: "3",
	            ry: "3",
	            x: ICON_SIZE$4 + 5 * PADDING_X$3 + 42,
	            y: 1.2 * boxHeight + 102,
	            opacity: 0
	        });
	        const gSubDropdownList = Dom.svg("g", {
	            class: "sqd-hidden"
	        });
	        const gSubDropdownListRect = Dom.svg("rect", {
	            width: 100,
	            height: 27 * 4,
	            class: "delay-box",
	            fill: "#fff",
	            stroke: "#4FCCFC",
	            rx: "3",
	            ry: "3",
	            x: ICON_SIZE$4 + 5 * PADDING_X$3 + 42,
	            y: 1.2 * boxHeight + 131,
	        });
	        gSubDropdownList.appendChild(gSubDropdownListRect);
	        for (let i = 0; i < 4; i++) {
	            const gSubDropdownEachRect = Dom.svg("rect", {
	                width: 96,
	                height: 26,
	                class: "delay-list-option",
	                fill: "white",
	                rx: "3",
	                ry: "3",
	                x: ICON_SIZE$4 + 5 * PADDING_X$3 + 44,
	                y: 1.2 * boxHeight + 133 + i * 26,
	            });
	            const gSubDropdownEachText = Dom.svg("text", {
	                x: ICON_SIZE$4 + 5 * PADDING_X$3 + 52,
	                y: 1.2 * boxHeight + 150 + i * 26,
	            });
	            if (i == 0) {
	                gSubDropdownEachText.textContent = "Hour";
	            }
	            else if (i == 1) {
	                gSubDropdownEachText.textContent = "Day";
	            }
	            else if (i == 2) {
	                gSubDropdownEachText.textContent = "Week";
	            }
	            else if (i == 3) {
	                gSubDropdownEachText.textContent = "Month";
	            }
	            const gSubDropdownEachRectShape = Dom.svg("rect", {
	                width: 96,
	                height: 26,
	                rx: "3",
	                ry: "3",
	                x: ICON_SIZE$4 + 5 * PADDING_X$3 + 44,
	                y: 1.2 * boxHeight + 133 + i * 26,
	                opacity: 0,
	                class: "delay-box-shape"
	            });
	            gSubDropdownEachRectShape.addEventListener("mouseover", function () {
	                gSubDropdownEachRect.setAttribute("fill", "#EDF5FF");
	            });
	            gSubDropdownEachRectShape.addEventListener("mouseout", function () {
	                gSubDropdownEachRect.setAttribute("fill", "white");
	            });
	            gSubDropdownEachRectShape.addEventListener("click", function () {
	                gSubDropdownList.classList.toggle("sqd-hidden");
	                dropdownBoxShape.setAttribute("stroke", "#BFBFBF");
	                dropdownBoxInnerText.textContent = gSubDropdownEachText.textContent;
	                downIcon.setAttribute("href", "./assets/list_down.svg");
	                dropdownBoxInnerText.setAttribute("style", "fill:#949CA0");
	            });
	            gSubDropdownList.appendChild(gSubDropdownEachRect);
	            gSubDropdownList.appendChild(gSubDropdownEachText);
	            gSubDropdownList.appendChild(gSubDropdownEachRectShape);
	        }
	        dropdownBoxShapeAfter.addEventListener("click", function () {
	            gSubDropdownList.classList.toggle("sqd-hidden");
	            if (!gSubDropdownList.classList.contains("sqd-hidden")) {
	                downIcon.setAttribute("href", "./assets/list_up.svg");
	                dropdownBoxInnerText.setAttribute("style", "fill:#000");
	                dropdownBoxShape.setAttribute("stroke", "#4FCCFC");
	            }
	            else {
	                downIcon.setAttribute("href", "./assets/list_down.svg");
	                dropdownBoxInnerText.setAttribute("style", "fill:#949CA0");
	                dropdownBoxShape.setAttribute("stroke", "#BFBFBF");
	            }
	        });
	        gSubDropdown.appendChild(dropdownBoxShape);
	        gSubDropdown.appendChild(dropdownBoxInnerText);
	        gSubDropdown.appendChild(downIcon);
	        gSubDropdown.appendChild(dropdownBoxShapeAfter);
	        gSubDropdown.appendChild(gSubDropdownList);
	        foreignObjectTag.appendChild(choice1);
	        foreignObjectTag.appendChild(choice1Text);
	        foreignObjectTag.appendChild(choice1TextNextLine);
	        foreignObjectTag.appendChild(choice2);
	        foreignObjectTag.appendChild(choice2Text);
	        foreignObjectTag.appendChild(divTagPickTime);
	        foreignObjectTag.appendChild(divTagWaitTime);
	        gDropdown.appendChild(rect1);
	        gDropdown.appendChild(foreignObjectTag);
	        gDropdown.appendChild(gSubDropdown);
	        choice1.addEventListener("click", function () {
	            rect1.setAttribute("height", "410");
	            divTagPickTime.classList.remove("sqd-hidden");
	            gSubDropdown.classList.add("sqd-hidden");
	            divTagWaitTime.classList.add("sqd-hidden");
	        });
	        choice2.addEventListener("click", function () {
	            rect1.setAttribute("height", "200");
	            divTagPickTime.classList.add("sqd-hidden");
	            divTagWaitTime.classList.remove("sqd-hidden");
	            gSubDropdown.classList.remove("sqd-hidden");
	        });
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
	        moreIconDot.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gRightPop3.classList.toggle("sqd-hidden");
	            if (!gUpPop3.classList.contains("sqd-hidden")) {
	                gUpPop3.classList.toggle("sqd-hidden");
	            }
	            if (!gDropdown.classList.contains("sqd-hidden")) {
	                gDropdown.classList.toggle("sqd-hidden");
	            }
	        });
	        editIcon.addEventListener("click", function () {
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            gRightPop3.classList.toggle("sqd-hidden");
	        });
	        upCheckIcon.addEventListener("click", function () {
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            if (choice1.checked) {
	                step.properties["date"] = OnceDates[0];
	                textRight.textContent = OnceDates[0];
	            }
	            else if (choice2.checked) {
	                step.properties["date"] = waitTimeInput.value + ' ' + dropdownBoxInnerText.textContent + 's';
	                textRight.textContent = waitTimeInput.value + ' ' + dropdownBoxInnerText.textContent + 's';
	            }
	        });
	        upCheckIcon.addEventListener("mousedown", function () {
	            checkImgContainerCircle.setAttribute("style", "fill:#0C67A5");
	        });
	        upCheckIcon.addEventListener("mouseup", function () {
	            checkImgContainerCircle.setAttribute("style", "fill:#3498DB");
	        });
	        // Show hints
	        editIcon.addEventListener("mouseover", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mouseout", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mousedown", function () {
	            rightEditImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            editIcon.setAttribute("href", "./assets/edit2.svg");
	        });
	        editIcon.addEventListener("mouseup", function () {
	            rightEditImgContainerCircle.setAttribute("style", "fill:white");
	            editIcon.setAttribute("href", "./assets/edit.svg");
	        });
	        copyIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        copyIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        copyIcon.addEventListener("mousedown", function () {
	            rightCopyImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            copyIcon.setAttribute("href", "./assets/copy2.svg");
	        });
	        copyIcon.addEventListener("mouseup", function () {
	            rightCopyImgContainerCircle.setAttribute("style", "fill:white");
	            copyIcon.setAttribute("href", "./assets/copy.svg");
	        });
	        upCopyIcon.addEventListener("mousedown", function () {
	            copyImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            upCopyIcon.setAttribute("href", "./assets/copy2.svg");
	        });
	        upCopyIcon.addEventListener("mouseup", function () {
	            copyImgContainerCircle.setAttribute("style", "fill:white");
	            upCopyIcon.setAttribute("href", "./assets/copy.svg");
	        });
	        deleteIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mousedown", function () {
	            rightDeleteImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            deleteIcon.setAttribute("href", "./assets/delete-inside.svg");
	        });
	        deleteIcon.addEventListener("mouseup", function () {
	            rightDeleteImgContainerCircle.setAttribute("style", "fill:white");
	            deleteIcon.setAttribute("href", "./assets/delete.svg");
	        });
	        upDeleteIcon.addEventListener("mousedown", function () {
	            deleteImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            upDeleteIcon.setAttribute("href", "./assets/delete-inside.svg");
	        });
	        upDeleteIcon.addEventListener("mouseup", function () {
	            deleteImgContainerCircle.setAttribute("style", "fill:white");
	            upDeleteIcon.setAttribute("href", "./assets/delete.svg");
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
	        g.appendChild(moreIconDot);
	        g.appendChild(gRightPop3);
	        g.appendChild(gDropdown);
	        g.insertBefore(gDropdown, rect);
	        g.appendChild(gRightPop3Reminder);
	        g.appendChild(gUpPop3);
	        g.appendChild(setUpReminder);
	        const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
	        inputView.setIsHidden(true);
	        const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
	        outputView.setIsHidden(true);
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
	        // Dom.toggleClass(this.g.children[6].children[0], isSelected, "sqd-selected");
	    }
	    setIsValid(isValid) {
	        this.validationErrorView.setIsHidden(isValid);
	    }
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
	        parent.insertBefore(g, parent.firstChild);
	        const boxHeight = ICON_SIZE$3 + PADDING_Y$2;
	        const text = Dom.svg("text", {
	            x: PADDING_X$2 / 2 + 7,
	            y: boxHeight / 1.7 - 2,
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
	        if (step.name == "Remove Tag") {
	            rectLeft.setAttribute("width", "95");
	        }
	        const textRight = Dom.svg("text", {
	            x: ICON_SIZE$3 + 3 * PADDING_X$2 + textWidth - 5,
	            y: boxHeight / 1.7 + 1,
	            class: "sqd-task-text_2",
	        });
	        if (step.properties["tag"]) {
	            textRight.textContent = step.properties["tag"].toString();
	        }
	        else {
	            textRight.textContent = "Select Tag";
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
	        const moreUrl = "./assets/moreTag.svg";
	        const moreIcon = Dom.svg("image", {
	                href: moreUrl,
	            })
	            ;
	        const moreDotUrl = "./assets/more-dot.svg";
	        const moreIconDot = Dom.svg("image", {
	                href: moreDotUrl,
	            })
	            ;
	        Dom.attrs(moreIconDot, {
	            class: "moreIconDot",
	            x: 236,
	            y: 8,
	            width: ICON_SIZE$3,
	            height: ICON_SIZE$3,
	        });
	        if (step.name == "Remove Tag") {
	            moreIconDot.setAttribute("x", "242");
	        }
	        Dom.attrs(moreIcon, {
	            class: "moreIcon",
	            // id: `tagMoreIcon`,
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
	        const copyUrl = "./assets/copy.svg";
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
	        const deleteUrl = "./assets/delete.svg";
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
	        const editUrl = "./assets/edit.svg";
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
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 89,
	            x: 170,
	            y: PADDING_Y$2 - 40,
	            style: "fill:#3498DB"
	        });
	        Dom.attrs(checkImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCheckIconUrl = "./assets/check-inside.svg";
	        const upCheckIcon = Dom.svg("image", {
	                href: upCheckIconUrl,
	            })
	            ;
	        Dom.attrs(upCheckIcon, {
	            class: "checkIcon-inside",
	            x: 177.4,
	            y: PADDING_Y$2 - 33,
	            width: 18,
	            height: 18,
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
	        const upDeleteIconUrl = "./assets/delete.svg";
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
	        const upCopyIconUrl = "./assets/copy.svg";
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
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$2,
	            ry: RECT_RADIUS$2,
	        });
	        Dom.attrs(reminder1, {
	            id: `reminder1${Date.now()}`,
	            x: 300.95,
	            y: PADDING_Y$2 - 35,
	        });
	        const reminderText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 313.45,
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
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$2,
	            ry: RECT_RADIUS$2,
	        });
	        Dom.attrs(reminder2, {
	            id: `reminder2${Date.now()}`,
	            x: 310.95,
	            y: PADDING_Y$2,
	        });
	        const reminderText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 320.95,
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
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$2,
	            ry: RECT_RADIUS$2,
	        });
	        Dom.attrs(reminder3, {
	            id: `reminder3${Date.now()}`,
	            x: 300.95,
	            y: PADDING_Y$2 + 35,
	        });
	        const reminderText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 307.45,
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
	        Dom.svg("g", {
	            class: `sqd-task-group sub-dropdownbox`
	        });
	        g.appendChild(moreIcon);
	        g.appendChild(moreIconDot);
	        g.appendChild(gRightPop3);
	        g.insertBefore(gDropdown, rect);
	        const newTag = Dom.svg("text", {
	            class: "sqd-task-text",
	        });
	        let temp = '';
	        if (step.properties["tag"]) {
	            temp = step.properties["tag"].toString();
	        }
	        tagDropDown(gDropdown, boxHeight, boxWidth, newTag, temp, step.name);
	        if (step.name === "Add Tag") {
	            addNewTag(gDropdown, boxHeight, boxWidth, upCheckIcon, newTag);
	        }
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
	        moreIconDot.addEventListener("click", function (e) {
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
	        });
	        upCheckIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            if (g.children[0].children[3]) {
	                if (g.children[0].children[3].classList.contains("sqd-hidden")) {
	                    textRight.textContent = tempText;
	                    step.properties["tag"] = textRight.textContent;
	                    step["updatedAt"] = new Date();
	                }
	            }
	            else {
	                textRight.textContent = tempText;
	                step.properties["tag"] = textRight.textContent;
	                step["updatedAt"] = new Date();
	            }
	        });
	        upCheckIcon.addEventListener("mousedown", function () {
	            checkImgContainerCircle.setAttribute("style", "fill:#0C67A5");
	        });
	        upCheckIcon.addEventListener("mouseup", function () {
	            checkImgContainerCircle.setAttribute("style", "fill:#3498DB");
	        });
	        // Show hints
	        editIcon.addEventListener("mouseover", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mouseout", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mousedown", function () {
	            rightEditImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            editIcon.setAttribute("href", "./assets/edit2.svg");
	        });
	        editIcon.addEventListener("mouseup", function () {
	            rightEditImgContainerCircle.setAttribute("style", "fill:white");
	            editIcon.setAttribute("href", "./assets/edit.svg");
	        });
	        copyIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        copyIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        copyIcon.addEventListener("mousedown", function () {
	            rightCopyImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            copyIcon.setAttribute("href", "./assets/copy2.svg");
	        });
	        copyIcon.addEventListener("mouseup", function () {
	            rightCopyImgContainerCircle.setAttribute("style", "fill:white");
	            copyIcon.setAttribute("href", "./assets/copy.svg");
	        });
	        upCopyIcon.addEventListener("mousedown", function () {
	            copyImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            upCopyIcon.setAttribute("href", "./assets/copy2.svg");
	        });
	        upCopyIcon.addEventListener("mouseup", function () {
	            copyImgContainerCircle.setAttribute("style", "fill:white");
	            upCopyIcon.setAttribute("href", "./assets/copy.svg");
	        });
	        deleteIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mouseout", () => {
	            gRightPop3Reminder3.classList.toggle("sqd-hidden");
	        });
	        deleteIcon.addEventListener("mousedown", function () {
	            rightDeleteImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            deleteIcon.setAttribute("href", "./assets/delete-inside.svg");
	        });
	        deleteIcon.addEventListener("mouseup", function () {
	            rightDeleteImgContainerCircle.setAttribute("style", "fill:white");
	            deleteIcon.setAttribute("href", "./assets/delete.svg");
	        });
	        upDeleteIcon.addEventListener("mousedown", function () {
	            deleteImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            upDeleteIcon.setAttribute("href", "./assets/delete-inside.svg");
	        });
	        upDeleteIcon.addEventListener("mouseup", function () {
	            deleteImgContainerCircle.setAttribute("style", "fill:white");
	            upDeleteIcon.setAttribute("href", "./assets/delete.svg");
	        });
	        const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
	        inputView.setIsHidden(true);
	        const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
	        outputView.setIsHidden(true);
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
	        // Dom.toggleClass(this.g.children[6].children[0], isSelected, "sqd-selected");
	    }
	    setIsValid(isValid) {
	        this.validationErrorView.setIsHidden(isValid);
	    }
	}
	function addTxt$1(txt, xVal, yVal, idVal) {
	    const nameText = Dom.svg("text", {
	        x: xVal + 15,
	        y: yVal + 15,
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
	function tagDropDown(dropdown, h, w, textToChange, temp, step) {
	    const gSubDropdownbox = Dom.svg("g", {
	        class: `sqd-task-group `,
	    });
	    dropdown.appendChild(gSubDropdownbox);
	    // Field names
	    let hei = 50;
	    if (step == "Remove Tag") {
	        hei = 20;
	    }
	    const rect1 = createRect$1("sqd-task-rect", 0.5, 0.5, w, 2.5 * h + hei, `dropdown${Date.now()}`, RECT_RADIUS$2);
	    const nameText = addTxt$1("Select tag: ", PADDING_X$2 + 6, 1.5 * h);
	    gSubDropdownbox.appendChild(nameText);
	    gSubDropdownbox.insertBefore(rect1, nameText);
	    let startX = nameText.getBBox().x;
	    let startY = nameText.getBBox().y;
	    let wid = nameText.getBBox().width;
	    const dropdownBoxShape = createRect$1("option select-field", startX + wid + PADDING_X$2 + 15, startY - 4, 100, 21);
	    Dom.attrs(dropdownBoxShape, {
	        fill: "#fff",
	        stroke: "#a0a0a0",
	        class: "delay-box",
	        rx: 3,
	        ry: 3
	    });
	    const dropdownBoxShapeAfter = createRect$1("option select-field", startX + wid + PADDING_X$2 + 15, startY - 4, 100, 21, `dropdownBoxShape${Date.now()}`);
	    Dom.attrs(dropdownBoxShapeAfter, {
	        fill: "#fff",
	        stroke: "#a0a0a0",
	        opacity: 0,
	        rx: 3,
	        ry: 3,
	        class: 'set-time-shape'
	    });
	    const downUrl = "./assets/list_down.svg";
	    const downIcon = Dom.svg("image", {
	            href: downUrl,
	        })
	        ;
	    Dom.attrs(downIcon, {
	        x: 207,
	        y: 56,
	    });
	    // Default value
	    let teeext = 'Any Tag';
	    if (temp != '') {
	        teeext = temp;
	    }
	    const dropdownBoxInnerText = addTxt$1(teeext, startX + wid + PADDING_X$2 + PADDING_X$2 / 2 + 1, startY - 5);
	    Dom.attrs(dropdownBoxInnerText, {
	        fill: "#a0a0a0",
	    });
	    gSubDropdownbox.appendChild(dropdownBoxInnerText);
	    wid = wid + dropdownBoxInnerText.getBBox().width;
	    // const dropdownRightButton = addTxt("▼ ", startX + wid + PADDING_X * 9, startY + 6.5);
	    startX = dropdownBoxInnerText.getBBox().x;
	    // gSubDropdownbox.appendChild(dropdownRightButton);
	    gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownBoxInnerText);
	    gSubDropdownbox.appendChild(downIcon);
	    gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
	    // Selection list field
	    const gSubDropdownboxPop = Dom.svg("g", {
	        class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
	    });
	    dropdown.appendChild(gSubDropdownboxPop);
	    dropdownBoxShapeAfter.addEventListener("click", function (e) {
	        gDropdownList.classList.toggle("sqd-hidden");
	        if (!gDropdownList.classList.contains("sqd-hidden")) {
	            downIcon.setAttribute("href", "./assets/list_up.svg");
	            dropdownBoxShape.setAttribute("stroke", "#4FCCFC");
	            dropdownBoxInnerText.setAttribute("fill", "#4FCCFC");
	        }
	        else {
	            downIcon.setAttribute("href", "./assets/list_down.svg");
	            dropdownBoxShape.setAttribute("stroke", "#a0a0a0");
	            dropdownBoxInnerText.setAttribute("fill", "#a0a0a0");
	        }
	    });
	    const gDropdownList = Dom.svg("g", {
	        class: "sqd-task-group sqd-hidden"
	    });
	    // Fetch tags from backend
	    const userID = 1; //Need to be changed to current user
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
	    gSubDropdownboxPop.classList.toggle("sqd-hidden");
	    getTags().then(tags => {
	        console.log("Fetching", tags);
	        if (typeof (tags) !== 'number') {
	            editTags(tags);
	        }
	    }).catch(console.log);
	    // const tags = ["Food", "Electronics", "Clothes"];
	    const editTags = function (tags) {
	        const dropDownRect = Dom.svg("rect", {
	            x: 122.6875,
	            y: 74,
	            class: "sqd-task-rect-inner_2",
	            width: 100,
	            height: 24 * tags.length,
	            rx: 3,
	            ry: 3
	        });
	        gDropdownList.appendChild(dropDownRect);
	        for (let i = 0; i < tags.length; i++) {
	            const DropDownEachRect = Dom.svg("rect", {
	                x: 124.6875,
	                y: 77 + i * 23,
	                width: 96,
	                height: 21,
	                rx: 3,
	                ry: 3,
	                fill: "white",
	                stroke: "none"
	            });
	            const DropdownEachText = Dom.svg("text", {
	                x: 129.6875,
	                y: 91 + i * 23,
	            });
	            DropdownEachText.textContent = tags[i];
	            const DropDownEachRectShape = Dom.svg("rect", {
	                x: 124.6875,
	                y: 77 + i * 23,
	                width: 96,
	                height: 21,
	                rx: 3,
	                ry: 3,
	                opacity: 0,
	                class: "delay-box-shape"
	            });
	            DropDownEachRectShape.addEventListener("mouseover", function () {
	                DropDownEachRect.setAttribute("fill", "#EDF5FF");
	            });
	            DropDownEachRectShape.addEventListener("mouseout", function () {
	                DropDownEachRect.setAttribute("fill", "white");
	            });
	            DropDownEachRectShape.addEventListener("click", function () {
	                gDropdownList.classList.add("sqd-hidden");
	                dropdownBoxInnerText.textContent = tags[i];
	                tempText = dropdownBoxInnerText.textContent;
	                downIcon.setAttribute("href", "./assets/list_down.svg");
	                dropdownBoxShape.setAttribute("stroke", "#a0a0a0");
	                dropdownBoxInnerText.setAttribute("fill", "#a0a0a0");
	            });
	            gDropdownList.appendChild(DropDownEachRect);
	            gDropdownList.appendChild(DropdownEachText);
	            gDropdownList.appendChild(DropDownEachRectShape);
	        }
	        //@ts-ignore
	        gSubDropdownbox.parentElement.appendChild(gDropdownList);
	    };
	}
	let tempText;
	function addNewTag(parent, h, w, upCheckBut, textToChange) {
	    const g = Dom.svg("g", {
	        class: `create-tag`,
	    });
	    parent.insertBefore(g, parent.lastChild);
	    const nameText = Dom.svg("text", {
	        class: "new-tag-text",
	        x: w / 4 + PADDING_X$2 - 6,
	        y: h + 5 * PADDING_Y$2 + 20,
	    });
	    nameText.textContent = "+Create a New Tag";
	    nameText.addEventListener("mouseover", function () {
	        nameText.setAttribute("style", "fill:#5495d4;stroke:#5495d4");
	    });
	    nameText.addEventListener("mouseout", function () {
	        nameText.setAttribute("style", "fill:#67b1e3;stroke:#67b1e3");
	    });
	    g.insertBefore(nameText, g.firstChild);
	    // Text wrapper
	    const rect = createRect$1("create-tag", nameText.getBBox().x - 8, nameText.getBBox().y + 28, nameText.getBBox().width, nameText.getBBox().height, `newTag${Date.now()}`);
	    g.insertBefore(rect, nameText);
	    // Page to input new tag
	    const container = Dom.svg("g", {
	        class: `sqd-task-group sub-dropdownbox sqd-hidden`,
	    });
	    parent.appendChild(container);
	    const rect1 = createRect$1("sqd-task-rect", 0.5, 0.5, w, 2.5 * h + 50, `dropdown${Date.now()}`, RECT_RADIUS$2);
	    container.appendChild(rect1);
	    const inputArea = Dom.svg("foreignObject", {
	        x: 1 + 2 * PADDING_X$2 + 8,
	        y: h + 2 * PADDING_Y$2,
	        width: 220,
	        height: 30
	    });
	    const input = Dom.element("input", {
	        class: "new-tag-input",
	        name: "newTag",
	        type: "text",
	        placeholder: "Name your new tag",
	        value: "",
	    });
	    inputArea.appendChild(input);
	    container.appendChild(inputArea);
	    const backText = Dom.svg("text", {
	        class: "new-tag-text",
	        x: w / 4 + PADDING_X$2 - 6,
	        y: h + 6 * PADDING_Y$2 + 10,
	    });
	    backText.textContent = "< Back to Selection";
	    backText.addEventListener("mouseover", function () {
	        backText.setAttribute("style", "fill:#5495d4;stroke:#5495d4");
	    });
	    backText.addEventListener("mouseout", function () {
	        backText.setAttribute("style", "fill:#67b1e3;stroke:#67b1e3");
	    });
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
	            const data = { "tag_name": `${input.value}` };
	            const request = new Request(`/AddTag`, {
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

	// import VanillaCalendar from "@uvarov.frontend/vanilla-calendar/src/index";
	// import '@uvarov.frontend/vanilla-calendar/build/vanilla-calendar.min.css';
	// import '@uvarov.frontend/vanilla-calendar/build/themes/light.min.css';
	// import '@uvarov.frontend/vanilla-calendar/build/themes/dark.min.css';
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
	        var addon = 18;
	        const g = Dom.svg("g", {
	            class: `sqd-task-group sqd-type-${step.type}`,
	            id: "sqd-task-timetrigger"
	        });
	        parent.insertBefore(g, parent.firstChild);
	        const boxHeight = ICON_SIZE$2 + PADDING_Y$1;
	        const text = Dom.svg("text", {
	            x: PADDING_X$1 / 1.5 + addon + 4,
	            y: boxHeight / 1.7 - 3,
	            class: "sqd-task-text",
	        });
	        text.textContent = step.name;
	        g.appendChild(text);
	        const textWidth = Math.max(text.getBBox().width + 16, MIN_TEXT_WIDTH$1);
	        const boxWidth = ICON_SIZE$2 + 8 * PADDING_X$1 + 2 * textWidth;
	        const gTriggerHint = Dom.svg("g", {
	            class: "sqd-task-group-pop",
	        });
	        const join = Dom.svg('line', {
	            class: 'sqd-join-pop',
	            x1: 241.953 + addon,
	            y1: 16,
	            x2: 274.953 + addon,
	            y2: 16
	        });
	        const triggerHint = Dom.svg("rect", {
	            class: "sqd-task-rect-triggerhint",
	            x: 266.953 + addon,
	            y: 0.5 - 3,
	            height: boxHeight + 6,
	            width: 175,
	            rx: 9,
	            ry: 9
	        });
	        const hint_text = Dom.svg("text", {
	            x: 276.953 + addon,
	            y: 17,
	            class: "sqd-task-text",
	        });
	        hint_text.textContent = "Please set up your trigger";
	        gTriggerHint.appendChild(join);
	        gTriggerHint.appendChild(triggerHint);
	        gTriggerHint.appendChild(hint_text);
	        const rect = Dom.svg("rect", {
	            x: 0.5 + addon,
	            y: 0.5,
	            class: `sqd-task-rect-${step.name}`,
	            width: 258,
	            height: boxHeight,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        g.insertBefore(rect, text);
	        const rectLeft = Dom.svg("rect", {
	            x: 0.5 + addon,
	            y: 0.5,
	            class: `sqd-task-rect-${step.name}`,
	            width: textWidth + 5,
	            height: boxHeight,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        const textRight = Dom.svg("text", {
	            // x: ICON_SIZE + 3 * PADDING_X + textWidth - 10,
	            x: (textWidth / MIN_TEXT_WIDTH$1) * 48.5 + MIN_TEXT_WIDTH$1 + addon,
	            y: boxHeight / 1.7 + 1,
	            class: "sqd-task-text_2",
	        });
	        if (step.properties["list"]) {
	            textRight.textContent = step.properties["list"].toString();
	        }
	        else {
	            textRight.textContent = "To Any List";
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
	        var moreUrl;
	        const moreDotUrl = "./assets/more-dot.svg";
	        if (step.name == "Subscribe" || step.name == "Unsubscribe") {
	            moreUrl = "./assets/more2.svg";
	        }
	        else {
	            moreUrl = "./assets/more4.svg";
	        }
	        const gmoreIcon = Dom.svg("g", {
	            class: "moreIcon-group"
	        });
	        const moreIcon = moreUrl
	            ? Dom.svg("image", {
	                href: moreUrl,
	            })
	            : Dom.svg("rect", {
	                class: "sqd-task-empty-icon",
	                rx: 4,
	                ry: 4,
	            });
	        Dom.attrs(moreIcon, {
	            class: "moreIcon",
	            x: 232 + addon,
	            y: 5,
	            width: ICON_SIZE$2,
	            height: ICON_SIZE$2,
	        });
	        const moreIconDot = Dom.svg("image", {
	                href: moreDotUrl,
	            })
	            ;
	        Dom.attrs(moreIconDot, {
	            class: "moreIconDot",
	            x: 236 + addon,
	            y: 8,
	            width: ICON_SIZE$2,
	            height: ICON_SIZE$2,
	        });
	        gmoreIcon.appendChild(moreIcon);
	        gmoreIcon.appendChild(moreIconDot);
	        const rightCopyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const rightCopyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 60,
	            x: 270 + addon,
	            y: PADDING_Y$1 - 6,
	        });
	        Dom.attrs(rightCopyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const changeUrl = "./assets/change.svg";
	        const changeIcon = Dom.svg("image", {
	                href: changeUrl,
	            })
	            ;
	        Dom.attrs(changeIcon, {
	            class: "moreicon",
	            id: `RightChangeIcon-${step.id}`,
	            // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 64,
	            x: 274 + addon,
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
	            // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 46,
	            x: 256 + addon,
	            y: PADDING_Y$1 + 27,
	        });
	        Dom.attrs(rightDeleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const deleteUrl = "./assets/delete.svg";
	        const deleteIcon = Dom.svg("image", {
	                href: deleteUrl,
	            })
	            ;
	        Dom.attrs(deleteIcon, {
	            class: "moreicon",
	            id: `RightDeleteIcon-${step.id}`,
	            // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 50,
	            x: 260 + addon,
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
	            // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 50,
	            x: 260 + addon,
	            y: PADDING_Y$1 - 40,
	        });
	        Dom.attrs(rightEditImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const editUrl = "./assets/edit.svg";
	        const editIcon = Dom.svg("image", {
	                href: editUrl,
	            })
	            ;
	        Dom.attrs(editIcon, {
	            class: "moreicon",
	            // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 53,
	            x: 263 + addon,
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
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 89,
	            x: 170 + addon,
	            y: PADDING_Y$1 - 40,
	            style: "fill:#3498DB"
	        });
	        Dom.attrs(checkImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upCheckIconUrl = "./assets/check-inside.svg";
	        const upCheckIcon = Dom.svg("image", {
	                href: upCheckIconUrl,
	            })
	            ;
	        Dom.attrs(upCheckIcon, {
	            class: "checkIcon-inside",
	            // id: `tagUpCheckIcon`,
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 93,
	            x: 177.4 + addon,
	            y: PADDING_Y$1 - 33,
	            width: 18,
	            height: 18,
	        });
	        checkImgContainer.appendChild(checkImgContainerCircle);
	        checkImgContainer.appendChild(upCheckIcon);
	        const deleteImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const deleteImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 41 + 110,
	            x: 232 + addon,
	            y: PADDING_Y$1 - 40,
	        });
	        Dom.attrs(deleteImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upDeleteIconUrl = "./assets/delete.svg";
	        const upDeleteIcon = Dom.svg("image", {
	                href: upDeleteIconUrl,
	            })
	            ;
	        Dom.attrs(upDeleteIcon, {
	            class: "moreicon",
	            id: `UpDeleteIcon-${step.id}`,
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 44 + 110,
	            x: 235 + addon,
	            y: PADDING_Y$1 - 37,
	            width: ICON_SIZE$2,
	            height: ICON_SIZE$2,
	        });
	        deleteImgContainer.appendChild(deleteImgContainerCircle);
	        deleteImgContainer.appendChild(upDeleteIcon);
	        upDeleteIcon.addEventListener("mousedown", function () {
	            deleteImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            upDeleteIcon.setAttribute("href", "./assets/delete-inside.svg");
	        });
	        upDeleteIcon.addEventListener("mouseup", function () {
	            deleteImgContainerCircle.setAttribute("style", "fill:white");
	            upDeleteIcon.setAttribute("href", "./assets/delete.svg");
	        });
	        const copyImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const copyImgContainerCircle = Dom.svg("rect", {
	            class: "sqd-task-ImgContainerCircle",
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 98,
	            x: 201 + addon,
	            y: PADDING_Y$1 - 40,
	        });
	        Dom.attrs(copyImgContainerCircle, {
	            width: 30,
	            height: 30,
	            rx: 50,
	            ry: 50,
	        });
	        const upchangeUrl = "./assets/change.svg";
	        const upchangeIcon = Dom.svg("image", {
	                href: upchangeUrl,
	            })
	            ;
	        Dom.attrs(upchangeIcon, {
	            class: "moreicon",
	            id: `UpChangeIcon-${step.id}`,
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 102,
	            x: 205 + addon,
	            y: PADDING_Y$1 - 37,
	            width: ICON_SIZE$2,
	            height: ICON_SIZE$2,
	        });
	        copyImgContainer.appendChild(copyImgContainerCircle);
	        copyImgContainer.appendChild(upchangeIcon);
	        //Zi:dropdown_img
	        const downImgContainer = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const downUrl = "./assets/list_down.png";
	        const downIcon = Dom.svg("image", {
	                href: downUrl,
	            })
	            ;
	        Dom.attrs(downIcon, {
	            x: 181 + addon,
	            y: PADDING_Y$1 + 50,
	        });
	        downImgContainer.appendChild(downIcon);
	        const downImgContainer1 = Dom.svg("g", {
	            class: "sqd-task-deleteImgContainer",
	        });
	        const downIcon1 = Dom.svg("image", {
	                href: downUrl,
	            })
	            ;
	        Dom.attrs(downIcon1, {
	            // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 78,
	            x: 181 + addon,
	            y: PADDING_Y$1 + 85,
	        });
	        downImgContainer1.appendChild(downIcon1);
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
	            x: 0.5 + addon,
	            y: 0.5,
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        Dom.attrs(reminder1, {
	            id: `reminder1${Date.now()}`,
	            x: 300.95 + addon,
	            y: PADDING_Y$1 - 35,
	        });
	        const reminderText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 313.45 + addon,
	            y: PADDING_Y$1 - 23,
	        });
	        Dom.attrs(reminderText1, {
	            //class: 'sqd-hidden',
	            id: `reminderText${Date.now()}`,
	        });
	        reminderText1.textContent = "Edit";
	        const reminder2 = Dom.svg("rect", {
	            x: 0.5 + addon,
	            y: 0.5,
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        Dom.attrs(reminder2, {
	            id: `reminder2${Date.now()}`,
	            x: 310.95 + addon,
	            y: PADDING_Y$1,
	        });
	        const reminderText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 320.95 + addon,
	            y: PADDING_Y$1 + 12,
	        });
	        Dom.attrs(reminderText2, {
	            //class: 'sqd-hidden',
	            id: `reminderText2${Date.now()}`,
	        });
	        reminderText2.textContent = "Reset";
	        const reminder3 = Dom.svg("rect", {
	            x: 0.5 + addon,
	            y: 0.5,
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        Dom.attrs(reminder3, {
	            id: `reminder3${Date.now()}`,
	            x: 300.95 + addon,
	            y: PADDING_Y$1 + 35,
	        });
	        const reminderText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: 307.45 + addon,
	            y: PADDING_Y$1 + 47,
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
	            x: 0.5 + addon,
	            y: 0.5,
	            class: `sqd-task-rect-${step.name}`,
	            width: 258,
	            height: 460,
	            rx: RECT_RADIUS$1,
	            ry: RECT_RADIUS$1,
	        });
	        Dom.attrs(rect1, {
	            id: `dropdown${Date.now()}`,
	        });
	        const nameText = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: PADDING_X$1 + 10 + addon,
	            y: 1.5 * boxHeight + 15,
	        });
	        Dom.attrs(nameText, {
	            //class: 'sqd-hidden',
	            id: `dropdownword1${Date.now()}`,
	        });
	        const nameText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: PADDING_X$1 + 10 + addon,
	            y: 2 * boxHeight + 35,
	        });
	        Dom.attrs(nameText1, {
	            //class: 'sqd-hidden',
	            id: `dropdownword2${Date.now()}`,
	        });
	        nameText.textContent = "Select List";
	        nameText1.textContent = "Runs";
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
	            width: 100,
	            height: 20,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#BFBFBF",
	            rx: "4",
	            ry: "4",
	            x: ICON_SIZE$2 + 5 * PADDING_X$1 + 17 + addon,
	            y: 1.2 * boxHeight + 15,
	        });
	        const dropdownBoxShape1 = Dom.svg("rect", {
	            width: 100,
	            height: 20,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#BFBFBF",
	            rx: "4",
	            ry: "4",
	            x: ICON_SIZE$2 + 5 * PADDING_X$1 + 17 + addon,
	            y: 1.75 * boxHeight + 32,
	        });
	        const dropdownRightButton = Dom.svg("text", {
	            class: "sqd-task-text select-field",
	            x: ICON_SIZE$2 + 9 * PADDING_X$1 + addon,
	            y: 1.35 * boxHeight,
	        });
	        const dropdownRightButton1 = Dom.svg("text", {
	            class: "sqd-task-text select-field",
	            x: ICON_SIZE$2 + 9 * PADDING_X$1 + addon,
	            y: 1.9 * boxHeight,
	        });
	        const dropdownBoxInnerText = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$2 + 5 * PADDING_X$1 + 25 + addon,
	            y: 1.4 * boxHeight + 18,
	        });
	        if (step.properties["list"]) {
	            dropdownBoxInnerText.textContent = step.properties["list"].toString();
	        }
	        else {
	            dropdownBoxInnerText.textContent = "Any list";
	        }
	        dropdownBoxInnerText.style.fill = "#BFBFBF";
	        const dropdownBoxInnerText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$2 + 5 * PADDING_X$1 + 25 + addon,
	            y: 1.95 * boxHeight + 34.5,
	        });
	        if (step.properties["frequency"]) {
	            dropdownBoxInnerText1.textContent = step.properties["frequency"].toString();
	        }
	        else {
	            dropdownBoxInnerText1.textContent = "Once";
	        }
	        dropdownBoxInnerText1.style.fill = "#BFBFBF";
	        const dropdownBoxShapeAfter = Dom.svg("rect", {
	            width: 100,
	            height: 20,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: ICON_SIZE$2 + 5 * PADDING_X$1 + 17 + addon,
	            y: 1.2 * boxHeight + 15,
	            id: `dropdownBoxShape${Date.now()}`,
	        });
	        Dom.attrs(dropdownBoxShapeAfter, {
	            opacity: 0,
	        });
	        const dropdownBoxShape1After = Dom.svg("rect", {
	            width: 100,
	            height: 20,
	            class: "option select-field",
	            fill: "#fff",
	            stroke: "#a0a0a0",
	            x: ICON_SIZE$2 + 5 * PADDING_X$1 + 17 + addon,
	            y: 1.75 * boxHeight + 32,
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
	        // Fetch audience list from backend
	        const userID = 123; //Need to be changed to current user
	        const request = new Request(`http://localhost:8080/dashboard/getAudiencelist/${userID}`, { method: 'GET' });
	        let list = [];
	        // Async way to fetch audience list
	        const getlist = () => __awaiter(this, void 0, void 0, function* () {
	            const response = yield fetch(request);
	            if (response.ok) {
	                const val = yield response.json();
	                modifyDropdown(val);
	            }
	        });
	        getlist();
	        // Options
	        const modifyDropdown = function (list) {
	            const dropdownBoxBottomShaperec = Dom.svg("rect", {
	                width: 100,
	                height: list.length * 25,
	                fill: "#fff",
	                stroke: "#4FCCFC",
	                x: ICON_SIZE$2 + 5 * PADDING_X$1 + 17 + addon,
	                y: 1.75 * boxHeight + 22,
	                rx: 4,
	                ry: 4
	            });
	            gSubDropdownboxPop.appendChild(dropdownBoxBottomShaperec);
	            for (let i = 1; i <= list.length; i++) {
	                const dropdownBoxBottomShapeText = Dom.svg("text", {
	                    class: "sqd-task-text",
	                    x: ICON_SIZE$2 + 5 * PADDING_X$1 + 25 + addon,
	                    y: 1.4 * boxHeight + 22 * i + 27,
	                });
	                dropdownBoxBottomShapeText.textContent = list[i - 1];
	                const dropdownBoxBottomShapecover = Dom.svg("rect", {
	                    width: 90,
	                    height: 20,
	                    class: "option select-field choice",
	                    fill: "#fff",
	                    stroke: "none",
	                    x: ICON_SIZE$2 + 5 * PADDING_X$1 + 22 + addon,
	                    y: 1.2 * boxHeight + 22 * i + 25,
	                    id: `dropdownBoxBottomShapecover${Date.now()}`,
	                    rx: 4,
	                    ry: 4,
	                });
	                Dom.attrs(dropdownBoxBottomShapecover, {
	                    opacity: 0.07,
	                });
	                // Add event listners
	                dropdownBoxBottomShapecover.addEventListener("click", function (e) {
	                    dropdownBoxInnerText.textContent = dropdownBoxBottomShapeText.textContent;
	                    gSubDropdownboxPop.classList.toggle("sqd-hidden");
	                    dropdownBoxShape.style.stroke = "#BFBFBF";
	                    dropdownBoxInnerText.style.fill = "#BFBFBF";
	                    downIcon.setAttribute("href", "./assets/list_down.png");
	                });
	                gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeText);
	                // gSubDropdownboxPop.insertBefore(
	                //    dropdownBoxBottomShape,
	                //   dropdownBoxBottomShapeText
	                // );
	                gSubDropdownboxPop.appendChild(dropdownBoxBottomShapecover);
	            }
	        };
	        // Run time choices
	        list = ['Once', 'Recurring'];
	        const dropdownBoxBottomShape1rec = Dom.svg("rect", {
	            width: 100,
	            height: list.length * 25,
	            fill: "#fff",
	            stroke: "#4FCCFC",
	            x: ICON_SIZE$2 + 5 * PADDING_X$1 + 17 + addon,
	            y: 1.75 * boxHeight + 57,
	            rx: 4,
	            ry: 4
	        });
	        gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1rec);
	        // Options
	        for (let i = 1; i <= list.length; i++) {
	            // const dropdownBoxBottomShape1 = Dom.svg("rect", {
	            //   width: 100,
	            //   height: 20,
	            //   class: "option select-field",
	            //   fill: "#fff",
	            //   stroke: "#a0a0a0",
	            //   x: ICON_SIZE + 5 * PADDING_X+17,
	            //   y: 1.75 * boxHeight + 15 * i+32,
	            // });
	            const dropdownBoxBottomShape1Text = Dom.svg("text", {
	                class: "sqd-task-text",
	                x: ICON_SIZE$2 + 5 * PADDING_X$1 + 25 + addon,
	                y: 1.95 * boxHeight + 20 * i + 45,
	            });
	            dropdownBoxBottomShape1Text.textContent = list[i - 1];
	            const dropdownBoxBottomShape1cover = Dom.svg("rect", {
	                width: 90,
	                height: 20,
	                class: "option select-field choice",
	                fill: "#fff",
	                stroke: "none",
	                x: ICON_SIZE$2 + 5 * PADDING_X$1 + 22 + addon,
	                y: 1.75 * boxHeight + 20 * i + 42,
	                id: `dropdownBoxBottomShape1cover${Date.now()}`,
	                rx: 4,
	                ry: 4,
	            });
	            Dom.attrs(dropdownBoxBottomShape1cover, {
	                opacity: 0.07,
	            });
	            // Add event listners
	            dropdownBoxBottomShape1cover.addEventListener("click", function (e) {
	                dropdownBoxInnerText1.textContent = dropdownBoxBottomShape1Text.textContent;
	                gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
	                dropdownBoxShape1.style.stroke = "#BFBFBF";
	                dropdownBoxInnerText1.style.fill = "#BFBFBF";
	                downIcon1.setAttribute("href", "./assets/list_down.png");
	                if (dropdownBoxInnerText1.textContent == "Once") {
	                    gWeeks.classList.add("sqd-hidden");
	                    gOnce.classList.remove("sqd-hidden");
	                    rect1.setAttribute("height", "460");
	                }
	                else {
	                    gOnce.classList.add("sqd-hidden");
	                    gWeeks.classList.remove("sqd-hidden");
	                    rect1.setAttribute("height", "440");
	                }
	            });
	            // Append Child
	            gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text);
	            // gSubDropdownbox1Pop.insertBefore(
	            //   dropdownBoxBottomShape1,
	            //   dropdownBoxBottomShape1Text
	            // );
	            gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1cover);
	        }
	        //implement the once choice of time-trigger
	        //   let today = new Date();
	        //   let yyyy = today.getFullYear();
	        //   let dd = today.getDate();
	        //   let ddd ='';
	        //   let mm = today.getMonth()+1;
	        //   let mmm = '';
	        //   let hh = today.getHours();
	        //   let hhh = '';
	        //   let nn = today.getMinutes();
	        //   let nnn = '';
	        //   if (dd < 10) {
	        //     ddd = '0' + dd;
	        //   }else{
	        //     ddd = dd.toString();
	        //   }
	        //   if (mm < 10) {
	        //     mmm = '0' + mm;
	        //   }else{
	        //     mmm = mm.toString();
	        //   }
	        //   if (hh < 10) {
	        //    hhh = '0' + hh;
	        //   } else{
	        //    hhh = hh.toString();
	        //   }
	        //   if (nn < 10) {
	        //     nnn = '0' + nn;
	        //    } else{
	        //     nnn = nn.toString();
	        //    }
	        //  let todayStr = yyyy + '-' + mmm + '-' + ddd + 'T' + hhh + ':' + nnn;
	        //   console.log(todayStr);
	        const gOnce = Dom.svg("g", {
	            class: "sqd-task-group-once",
	        });
	        const calendarWrapper = Dom.svg("foreignObject", {
	            x: 3 + addon,
	            y: 2 * boxHeight + 40,
	            height: 320,
	            width: 250,
	        });
	        const calendarDiv = Dom.element("div", {
	            id: 'calendar',
	        });
	        calendarWrapper.appendChild(calendarDiv);
	        let databefore;
	        if (step.properties["send"]) {
	            databefore = step.properties["send"].toString().split('T');
	        }
	        let OnceDates;
	        //@ts-ignore
	        let calendar = new VanillaCalendar(calendarDiv, {
	            settings: {
	                selection: {
	                    day: 'multiple',
	                },
	                range: {
	                    disablePast: true,
	                },
	                visibility: {
	                    weekend: false,
	                },
	                iso8601: false,
	            },
	            actions: {
	                //@ts-ignore
	                clickDay(event, dates) {
	                    OnceDates = dates;
	                },
	            },
	        });
	        if (databefore && databefore.length != 0 && dropdownBoxInnerText1.textContent == "Once") {
	            let temp = [...databefore];
	            temp.pop();
	            OnceDates = temp;
	            //@ts-ignore
	            calendar = new VanillaCalendar(calendarDiv, {
	                settings: {
	                    selection: {
	                        day: 'multiple',
	                    },
	                    range: {
	                        disablePast: true,
	                    },
	                    selected: {
	                        dates: temp,
	                    },
	                    visibility: {
	                        weekend: false,
	                    },
	                    iso8601: false,
	                },
	                actions: {
	                    //@ts-ignore
	                    clickDay(event, dates) {
	                        OnceDates = dates;
	                    },
	                },
	            });
	        }
	        calendar.init();
	        const calendarBr = Dom.svg("line", {
	            x1: addon,
	            y1: 2 * boxHeight + 327,
	            x2: 258 + addon,
	            y2: 2 * boxHeight + 327,
	            stroke: "#3FC8FA",
	            class: "sqd-calendar-line"
	        });
	        //implement the set time feature
	        const gSetTime = Dom.svg("g", {
	            class: "sqd-task-group",
	        });
	        const setTimeText = Dom.svg("text", {
	            class: "sqd-task-text-settime",
	            x: PADDING_X$1 + 10 + addon,
	            y: 2 * boxHeight + 350,
	        });
	        setTimeText.textContent = "Set time(hour)";
	        const setTimeWrapper = Dom.svg("foreignObject", {
	            x: PADDING_X$1 + 114 + addon,
	            y: 2 * boxHeight + 340,
	            height: 30,
	            width: 40,
	        });
	        const setTimeInput = Dom.element("input", {
	            class: "settime-input",
	            type: "text",
	            placeholder: "00",
	            maxlength: 2,
	        });
	        if (databefore && databefore.length != 0 && dropdownBoxInnerText1.textContent == "Once") {
	            console.log(databefore);
	            setTimeInput.value = databefore[databefore.length - 1].slice(0, 2);
	        }
	        setTimeWrapper.appendChild(setTimeInput);
	        const setTimeBr = Dom.svg("line", {
	            x1: PADDING_X$1 + 121 + addon,
	            y1: 2 * boxHeight + 354,
	            x2: PADDING_X$1 + 141 + addon,
	            y2: 2 * boxHeight + 354,
	            stroke: "#3FC8FA",
	            class: "sqd-calendar-line"
	        });
	        const setTimeRangeRect = Dom.svg("rect", {
	            class: "set-time-rect",
	            x: PADDING_X$1 + 147 + addon,
	            y: 2 * boxHeight + 338,
	            rx: 10,
	            ry: 10,
	            width: 74,
	            height: 20
	        });
	        const setTimeAmText = Dom.svg("text", {
	            class: "sqd-task-text-settime-am",
	            x: PADDING_X$1 + 159 + addon,
	            y: 2 * boxHeight + 351,
	        });
	        setTimeAmText.textContent = "AM";
	        const setTimeAmRect = Dom.svg("rect", {
	            class: "set-time-rect-m selected",
	            x: PADDING_X$1 + 150 + addon,
	            y: 2 * boxHeight + 340,
	            rx: 9,
	            ry: 9,
	            width: 37,
	            height: 15.5,
	            fill: "#5495d4"
	        });
	        const setTimePmText = Dom.svg("text", {
	            class: "sqd-task-text-settime-pm",
	            x: PADDING_X$1 + 191 + addon,
	            y: 2 * boxHeight + 351,
	        });
	        setTimePmText.textContent = "PM";
	        const setTimePmRect = Dom.svg("rect", {
	            class: "set-time-rect-m",
	            x: PADDING_X$1 + 181 + addon,
	            y: 2 * boxHeight + 340,
	            rx: 9,
	            ry: 9,
	            width: 37,
	            height: 15.5,
	            fill: "white"
	        });
	        const setTimeAmRectShape = Dom.svg("rect", {
	            class: "set-time-shape",
	            x: PADDING_X$1 + 150 + addon,
	            y: 2 * boxHeight + 340,
	            rx: 9,
	            ry: 9,
	            width: 37,
	            height: 15.5,
	            opacity: 0
	        });
	        const setTimePmRectShape = Dom.svg("rect", {
	            class: "set-time-shape",
	            x: PADDING_X$1 + 181 + addon,
	            y: 2 * boxHeight + 340,
	            rx: 9,
	            ry: 9,
	            width: 37,
	            height: 15.5,
	            opacity: 0
	        });
	        const setTimeTimeZone = Dom.svg("text", {
	            class: "sqd-task-text_3",
	            x: PADDING_X$1 + 10 + addon,
	            y: 2 * boxHeight + 377,
	        });
	        setTimeTimeZone.textContent = "Based on your timezone(PST)";
	        setTimeInput.addEventListener("change", function () {
	            if (parseInt(setTimeInput.value) < 10) {
	                setTimeInput.value = '0' + setTimeInput.value;
	            }
	        });
	        setTimePmRectShape.addEventListener("click", function () {
	            if (!setTimePmRect.classList.contains("selected")) {
	                setTimePmRect.classList.toggle("selected");
	                setTimeAmRect.classList.toggle("selected");
	                setTimePmText.setAttribute("style", "fill:white");
	                setTimePmRect.setAttribute("fill", "#5495d4");
	                setTimeAmText.setAttribute("style", "fill:rgb(191, 191, 191)");
	                setTimeAmRect.setAttribute("fill", "white");
	                gSetTime.insertBefore(setTimeAmRect, setTimePmRect);
	            }
	        });
	        setTimeAmRectShape.addEventListener("click", function () {
	            if (!setTimeAmRect.classList.contains("selected")) {
	                setTimePmRect.classList.toggle("selected");
	                setTimeAmRect.classList.toggle("selected");
	                setTimeAmText.setAttribute("style", "fill:white");
	                setTimeAmRect.setAttribute("fill", "#5495d4");
	                setTimePmText.setAttribute("style", "fill:rgb(191, 191, 191)");
	                setTimePmRect.setAttribute("fill", "white");
	                gSetTime.insertBefore(setTimePmRect, setTimeAmRect);
	            }
	        });
	        gSetTime.appendChild(setTimeText);
	        gSetTime.appendChild(setTimeWrapper);
	        gSetTime.appendChild(setTimeBr);
	        gSetTime.appendChild(setTimeRangeRect);
	        gSetTime.appendChild(setTimePmRect);
	        gSetTime.appendChild(setTimeAmRect);
	        gSetTime.appendChild(setTimePmText);
	        gSetTime.appendChild(setTimeAmText);
	        gSetTime.appendChild(setTimeAmRectShape);
	        gSetTime.appendChild(setTimePmRectShape);
	        gSetTime.appendChild(setTimeTimeZone);
	        if (databefore && databefore[databefore.length - 1].toString().slice(2) == "PM" && dropdownBoxInnerText1.textContent == "Once") {
	            setTimePmRect.classList.toggle("selected");
	            setTimeAmRect.classList.toggle("selected");
	            setTimePmText.setAttribute("style", "fill:white");
	            setTimePmRect.setAttribute("fill", "#5495d4");
	            setTimeAmText.setAttribute("style", "fill:rgb(191, 191, 191)");
	            setTimeAmRect.setAttribute("fill", "white");
	            gSetTime.insertBefore(setTimeAmRect, setTimePmRect);
	        }
	        gOnce.appendChild(calendarWrapper);
	        gOnce.appendChild(calendarBr);
	        gOnce.appendChild(gSetTime);
	        //implement the recurring choice of time-trigger
	        const gWeeks = Dom.svg("g", {
	            class: "sqd-task-group-week sqd-hidden"
	        });
	        const week_text = Dom.svg("text", {
	            x: PADDING_X$1 + 10 + addon,
	            y: 2 * boxHeight + 85,
	            class: "sqd-task-text_3",
	        });
	        week_text.textContent = "Set your delieverable dates:";
	        gWeeks.appendChild(week_text);
	        for (let i = 1; i < 8; i++) {
	            var week = "";
	            switch (i) {
	                case 1:
	                    week = "Monday";
	                    break;
	                case 2:
	                    week = "Tuesday";
	                    break;
	                case 3:
	                    week = "Wednesday";
	                    break;
	                case 4:
	                    week = "Thursday";
	                    break;
	                case 5:
	                    week = "Friday";
	                    break;
	                case 6:
	                    week = "Saturday";
	                    break;
	                case 7:
	                    week = "Sunday";
	                    break;
	            }
	            const gEachWeek = Dom.svg("g", {
	                class: `sqd-week-${i}`
	            });
	            const checkbox = Dom.svg("rect", {
	                class: "sqd-week-checkbox",
	                x: PADDING_X$1 + 10 + addon,
	                y: 2 * boxHeight + 75 + i * 28,
	                height: 13,
	                width: 13,
	                rx: 5,
	                ry: 5
	            });
	            const weekName = Dom.svg("text", {
	                x: PADDING_X$1 + 35 + addon,
	                y: 2 * boxHeight + 85 + i * 28,
	                class: "sqd-task-text-week",
	            });
	            weekName.textContent = week;
	            const checkbox_img_url = "./assets/check-inside.svg";
	            const checkbox_img = Dom.svg("image", {
	                href: checkbox_img_url,
	            });
	            Dom.attrs(checkbox_img, {
	                height: 8,
	                width: 8,
	                x: PADDING_X$1 + 10 + addon + 2.4,
	                y: 2 * boxHeight + 78 + i * 28,
	                class: "week-checkbox-img"
	            });
	            const checkboxShape = Dom.svg("rect", {
	                x: PADDING_X$1 + 10 + addon,
	                y: 2 * boxHeight + 75 + i * 28,
	                height: 13,
	                width: 13,
	                rx: 5,
	                ry: 5,
	                opacity: 0,
	                class: "checkbox-shape"
	            });
	            checkboxShape.addEventListener("click", function (e) {
	                if (!gEachWeek.classList.contains("selected")) {
	                    gEachWeek.classList.add("selected");
	                    Dom.attrs(checkbox, {
	                        style: "stroke:#5495d4;fill:#5495d4",
	                    });
	                    Dom.attrs(weekName, {
	                        style: "fill:#5495d4"
	                    });
	                }
	                else {
	                    gEachWeek.classList.remove("selected");
	                    Dom.attrs(checkbox, {
	                        style: "stroke:#949CA0;fill:white",
	                    });
	                    Dom.attrs(weekName, {
	                        style: "fill:#949CA0"
	                    });
	                }
	            });
	            const gTime = Dom.svg("g", {
	                class: "sqd-task-group"
	            });
	            const timeBox = Dom.svg("rect", {
	                x: PADDING_X$1 + 120 + addon,
	                y: 2 * boxHeight + 75 + i * 28,
	                height: 14,
	                width: 40,
	                class: "time-box",
	                rx: 3,
	                ry: 3
	            });
	            const timeBoxShape = Dom.svg("rect", {
	                x: PADDING_X$1 + 120 + addon,
	                y: 2 * boxHeight + 75 + i * 28,
	                height: 14,
	                width: 40,
	                rx: 3,
	                ry: 3,
	                opacity: 0,
	                class: "checkbox-shape"
	            });
	            const timeText = Dom.svg("text", {
	                x: PADDING_X$1 + 132 + addon,
	                y: 2 * boxHeight + 85.5 + i * 28,
	                class: "sqd-task-text-week2"
	            });
	            timeText.textContent = "12";
	            const time_box_url = "./assets/down.svg";
	            const timeicon = Dom.svg("image", {
	                x: PADDING_X$1 + 150 + addon,
	                y: 2 * boxHeight + 79 + i * 28,
	                class: "week-drop-icon",
	                href: time_box_url,
	                height: 7,
	                width: 7
	            });
	            gTime.appendChild(timeBox);
	            gTime.appendChild(timeText);
	            gTime.appendChild(timeicon);
	            gTime.appendChild(timeBoxShape);
	            const gTimeRange = Dom.svg("g", {
	                class: "sqd-task-group"
	            });
	            const RangeBox = Dom.svg("rect", {
	                x: PADDING_X$1 + 170 + addon,
	                y: 2 * boxHeight + 75 + i * 28,
	                height: 14,
	                width: 40,
	                class: "time-box",
	                rx: 3,
	                ry: 3
	            });
	            const RangeBoxShape = Dom.svg("rect", {
	                x: PADDING_X$1 + 170 + addon,
	                y: 2 * boxHeight + 75 + i * 28,
	                height: 14,
	                width: 40,
	                rx: 3,
	                ry: 3,
	                opacity: 0,
	                class: "checkbox-shape"
	            });
	            const rangeText = Dom.svg("text", {
	                x: PADDING_X$1 + 177 + addon,
	                y: 2 * boxHeight + 85.5 + i * 28,
	                class: "sqd-task-text-week3"
	            });
	            rangeText.textContent = "AM";
	            const range_box_url = "./assets/down.svg";
	            const rangeicon = Dom.svg("image", {
	                x: PADDING_X$1 + 200 + addon,
	                y: 2 * boxHeight + 79 + i * 28,
	                class: "week-drop-icon",
	                href: range_box_url,
	                height: 7,
	                width: 7
	            });
	            let weekTemp = '';
	            if (databefore) {
	                for (let h = 0; h < databefore.length; h++) {
	                    if (databefore[h].includes(week)) {
	                        weekTemp = databefore[h];
	                        gEachWeek.classList.add("selected");
	                        Dom.attrs(checkbox, {
	                            style: "stroke:#5495d4;fill:#5495d4",
	                        });
	                        Dom.attrs(weekName, {
	                            style: "fill:#5495d4"
	                        });
	                        timeText.textContent = weekTemp.slice(-4, -2);
	                        rangeText.textContent = weekTemp.slice(-2);
	                    }
	                }
	            }
	            gTimeRange.appendChild(RangeBox);
	            gTimeRange.appendChild(rangeText);
	            gTimeRange.appendChild(rangeicon);
	            gTimeRange.appendChild(RangeBoxShape);
	            //implement the dropdown menu for time
	            const gTimeDropdow = Dom.svg("g", {
	                class: "sqd-task-group sqd-hidden"
	            });
	            const timeDropRect = Dom.svg("rect", {
	                x: PADDING_X$1 + 120 + addon,
	                y: 2 * boxHeight + 93 + i * 28,
	                height: 173,
	                width: 40,
	                rx: 3,
	                ry: 3,
	                class: "time-drop-rect"
	            });
	            gTimeDropdow.appendChild(timeDropRect);
	            for (let k = 1; k < 13; k++) {
	                const timeSelectBox = Dom.svg("rect", {
	                    x: PADDING_X$1 + 122 + addon,
	                    y: 2 * boxHeight + 81 + i * 28 + k * 14,
	                    height: 14,
	                    width: 36,
	                    class: "week-time-drop-rect",
	                    rx: 2,
	                    ry: 2
	                });
	                const timeSelectBoxShape = Dom.svg("rect", {
	                    x: PADDING_X$1 + 122 + addon,
	                    y: 2 * boxHeight + 82 + i * 28 + k * 14,
	                    height: 12,
	                    width: 36,
	                    class: "week-time-drop-rect",
	                    rx: 3,
	                    ry: 3,
	                    opacity: 0
	                });
	                const timeSelectText = Dom.svg("text", {
	                    x: PADDING_X$1 + 135 + addon,
	                    y: 2 * boxHeight + 92.5 + i * 28 + k * 14,
	                    class: "sqd-task-text-week4",
	                });
	                timeSelectText.textContent = `${k}`;
	                if (k > 9) {
	                    Dom.attrs(timeSelectText, {
	                        x: PADDING_X$1 + 133 + addon
	                    });
	                }
	                timeSelectBoxShape.addEventListener("mouseover", function () {
	                    timeSelectBox.setAttribute("style", "fill:#EDF5FF");
	                });
	                timeSelectBoxShape.addEventListener("mouseout", function () {
	                    timeSelectBox.setAttribute("style", "fill:white");
	                });
	                timeSelectBoxShape.addEventListener("click", function () {
	                    gTimeDropdow.classList.add("sqd-hidden");
	                    Dom.attrs(timeBox, {
	                        style: "stroke:#949CA0"
	                    });
	                    Dom.attrs(timeText, {
	                        style: "fill:#949CA0"
	                    });
	                    timeicon.setAttribute("href", "./assets/down.svg");
	                    if (k < 10) {
	                        timeText.textContent = `0${k}`;
	                    }
	                    else {
	                        timeText.textContent = `${k}`;
	                    }
	                });
	                gTimeDropdow.appendChild(timeSelectBox);
	                gTimeDropdow.appendChild(timeSelectText);
	                gTimeDropdow.appendChild(timeSelectBoxShape);
	            }
	            //implement the dropdown for time range
	            const gRangeDropdow = Dom.svg("g", {
	                class: "sqd-task-group sqd-hidden"
	            });
	            const RangeDropRect = Dom.svg("rect", {
	                x: PADDING_X$1 + 170 + addon,
	                y: 2 * boxHeight + 93 + i * 28,
	                height: 33,
	                width: 40,
	                rx: 3,
	                ry: 3,
	                class: "time-drop-rect"
	            });
	            gRangeDropdow.appendChild(RangeDropRect);
	            for (let m = 1; m < 3; m++) {
	                const rangeSelectBox = Dom.svg("rect", {
	                    x: PADDING_X$1 + 172 + addon,
	                    y: 2 * boxHeight + 81 + i * 28 + m * 14,
	                    height: 14,
	                    width: 36,
	                    class: "week-time-drop-rect",
	                    rx: 2,
	                    ry: 2
	                });
	                const rangeSelectBoxShape = Dom.svg("rect", {
	                    x: PADDING_X$1 + 172 + addon,
	                    y: 2 * boxHeight + 82 + i * 28 + m * 14,
	                    height: 12,
	                    width: 36,
	                    class: "week-time-drop-rect",
	                    rx: 3,
	                    ry: 3,
	                    opacity: 0
	                });
	                const rangeSelectText = Dom.svg("text", {
	                    x: PADDING_X$1 + 177 + addon,
	                    y: 2 * boxHeight + 92.5 + i * 28 + m * 14,
	                    class: "sqd-task-text-week5",
	                });
	                if (m == 1) {
	                    rangeSelectText.textContent = "AM";
	                }
	                else {
	                    rangeSelectText.textContent = "PM";
	                }
	                rangeSelectBoxShape.addEventListener("mouseover", function () {
	                    rangeSelectBox.setAttribute("style", "fill:#EDF5FF");
	                });
	                rangeSelectBoxShape.addEventListener("mouseout", function () {
	                    rangeSelectBox.setAttribute("style", "fill:white");
	                });
	                rangeSelectBoxShape.addEventListener("click", function () {
	                    gRangeDropdow.classList.add("sqd-hidden");
	                    Dom.attrs(RangeBox, {
	                        style: "stroke:#949CA0"
	                    });
	                    Dom.attrs(rangeText, {
	                        style: "fill:#949CA0"
	                    });
	                    rangeicon.setAttribute("href", "./assets/down.svg");
	                    if (m == 1) {
	                        rangeText.textContent = "AM";
	                    }
	                    else {
	                        rangeText.textContent = "PM";
	                    }
	                });
	                gRangeDropdow.appendChild(rangeSelectBox);
	                gRangeDropdow.appendChild(rangeSelectText);
	                gRangeDropdow.appendChild(rangeSelectBoxShape);
	            }
	            timeBoxShape.addEventListener("click", function () {
	                gTimeDropdow.classList.toggle("sqd-hidden");
	                if (!gTimeDropdow.classList.contains("sqd-hidden")) {
	                    Dom.attrs(timeBox, {
	                        style: "stroke:#5495d4"
	                    });
	                    Dom.attrs(timeText, {
	                        style: "fill:#000"
	                    });
	                    timeicon.setAttribute("href", "./assets/up.svg");
	                }
	                else {
	                    Dom.attrs(timeBox, {
	                        style: "stroke:#949CA0"
	                    });
	                    Dom.attrs(timeText, {
	                        style: "fill:#949CA0"
	                    });
	                    timeicon.setAttribute("href", "./assets/down.svg");
	                }
	            });
	            RangeBoxShape.addEventListener("click", function () {
	                gRangeDropdow.classList.toggle("sqd-hidden");
	                if (!gRangeDropdow.classList.contains("sqd-hidden")) {
	                    Dom.attrs(RangeBox, {
	                        style: "stroke:#5495d4"
	                    });
	                    Dom.attrs(rangeText, {
	                        style: "fill:#000"
	                    });
	                    rangeicon.setAttribute("href", "./assets/up.svg");
	                }
	                else {
	                    Dom.attrs(RangeBox, {
	                        style: "stroke:#949CA0"
	                    });
	                    Dom.attrs(rangeText, {
	                        style: "fill:#949CA0"
	                    });
	                    rangeicon.setAttribute("href", "./assets/down.svg");
	                }
	            });
	            gEachWeek.appendChild(gTime);
	            gEachWeek.appendChild(gTimeRange);
	            gEachWeek.appendChild(checkbox);
	            gEachWeek.appendChild(checkbox_img);
	            gEachWeek.appendChild(checkboxShape);
	            gEachWeek.appendChild(weekName);
	            gEachWeek.appendChild(gTimeDropdow);
	            gEachWeek.appendChild(gRangeDropdow);
	            gWeeks.appendChild(gEachWeek);
	            gWeeks.insertBefore(gEachWeek, gWeeks.firstChild);
	        }
	        //implement of end date section
	        const gEndDate = Dom.svg("g", {
	            class: "sqd-task-group"
	        });
	        const endDateText = Dom.svg("text", {
	            x: PADDING_X$1 + 10 + addon,
	            y: 2 * boxHeight + 316,
	        });
	        endDateText.textContent = "End Date";
	        const monthWrapper = Dom.svg("foreignObject", {
	            x: PADDING_X$1 + 80 + addon,
	            y: 2 * boxHeight + 300,
	            height: 27,
	            width: 35,
	        });
	        const monthInput = Dom.element("input", {
	            class: "date-input",
	            type: "text",
	            placeholder: "MM",
	            x: 0.5,
	            y: 0.5,
	            maxlength: 2,
	        });
	        monthWrapper.appendChild(monthInput);
	        const dateWrapper = Dom.svg("foreignObject", {
	            x: PADDING_X$1 + 120 + addon,
	            y: 2 * boxHeight + 300,
	            height: 27,
	            width: 35,
	        });
	        const dateInput = Dom.element("input", {
	            class: "date-input",
	            type: "text",
	            placeholder: "DD",
	            x: 0.5,
	            y: 0.5,
	            maxlength: 2,
	        });
	        dateWrapper.appendChild(dateInput);
	        const yearWrapper = Dom.svg("foreignObject", {
	            x: PADDING_X$1 + 160 + addon,
	            y: 2 * boxHeight + 300,
	            height: 27,
	            width: 55,
	        });
	        const yearInput = Dom.element("input", {
	            class: "date-input-year",
	            type: "text",
	            placeholder: "YYYY",
	            x: 0.5,
	            y: 0.5,
	            maxlength: 4,
	        });
	        yearWrapper.appendChild(yearInput);
	        if (databefore && dropdownBoxInnerText1.textContent == "Recurring") {
	            if (databefore.length != 0) {
	                const databeforeEndDate = databefore[databefore.length - 1].split(':')[1].split('/');
	                monthInput.value = databeforeEndDate[0];
	                dateInput.value = databeforeEndDate[1];
	                yearInput.value = databeforeEndDate[2];
	            }
	        }
	        gEndDate.appendChild(endDateText);
	        gEndDate.appendChild(monthWrapper);
	        gEndDate.appendChild(dateWrapper);
	        gEndDate.appendChild(yearWrapper);
	        const timezone = Dom.svg("text", {
	            x: PADDING_X$1 + 10 + addon,
	            y: 2 * boxHeight + 345,
	            class: "sqd-task-text_3"
	        });
	        timezone.textContent = "Based on your timezone(PST)";
	        gWeeks.insertBefore(gEndDate, gWeeks.firstChild);
	        gWeeks.insertBefore(timezone, gWeeks.firstChild);
	        if (step.properties["frequency"] == "Once") {
	            gOnce.classList.remove("sqd-hidden");
	            if (!gWeeks.classList.contains("sqd-hidden")) {
	                gWeeks.classList.add("sqd-hidden");
	                rect1.setAttribute("height", "460");
	            }
	        }
	        else if (step.properties["frequency"] == "Recurring") {
	            gWeeks.classList.remove("sqd-hidden");
	            if (!gOnce.classList.contains("sqd-hidden")) {
	                gOnce.classList.add("sqd-hidden");
	            }
	            rect1.setAttribute("height", "440");
	        }
	        gDropdown.appendChild(gOnce);
	        gDropdown.appendChild(gWeeks);
	        gSubDropdownbox.appendChild(dropdownRightButton);
	        gSubDropdownbox1.appendChild(dropdownRightButton1);
	        gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownRightButton);
	        gSubDropdownbox1.insertBefore(dropdownBoxShape1, dropdownRightButton1);
	        gSubDropdownbox.appendChild(dropdownBoxInnerText);
	        gSubDropdownbox1.appendChild(dropdownBoxInnerText1);
	        gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
	        gSubDropdownbox1.appendChild(dropdownBoxShape1After);
	        gSubDropdown.appendChild(gSubDropdownbox);
	        gSubDropdown.appendChild(downImgContainer);
	        gSubDropdown.appendChild(gSubDropdownboxPop);
	        gSubDropdown1.appendChild(gSubDropdownbox1);
	        gSubDropdown1.appendChild(gSubDropdownbox1Pop);
	        gSubDropdown1.appendChild(downImgContainer1);
	        gDropdown.appendChild(gSubDropdown1);
	        gDropdown.appendChild(gSubDropdown);
	        g.appendChild(gTriggerHint);
	        g.appendChild(gmoreIcon);
	        g.appendChild(gRightPop3);
	        g.appendChild(gDropdown);
	        g.insertBefore(gDropdown, rect);
	        g.appendChild(gRightPop3Reminder);
	        g.appendChild(gUpPop3);
	        g.appendChild(setUpReminder);
	        let if_hintpop = true;
	        if (Object.keys(step.properties).length == 0) {
	            if_hintpop = true;
	        }
	        else {
	            if_hintpop = false;
	            gTriggerHint.classList.toggle("sqd-hidden");
	        }
	        // Add EventListeners
	        gmoreIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            if (gDropdown.classList.contains("sqd-hidden")) {
	                gRightPop3.classList.toggle("sqd-hidden");
	            }
	            else {
	                gDropdown.classList.toggle("sqd-hidden");
	                gUpPop3.classList.toggle("sqd-hidden");
	                gRightPop3.classList.toggle("sqd-hidden");
	            }
	            gTriggerHint.classList.add("sqd-hidden");
	            if_hintpop = false;
	        });
	        gmoreIcon.addEventListener("mouseover", function () {
	            if (if_hintpop) {
	                gTriggerHint.classList.remove("sqd-hidden");
	            }
	        });
	        gmoreIcon.addEventListener("mouseout", function () {
	            if (if_hintpop) {
	                gTriggerHint.classList.add("sqd-hidden");
	            }
	        });
	        // Edit
	        editIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            gRightPop3.classList.toggle("sqd-hidden");
	            gSubDropdown.classList.remove("sqd-hidden");
	            gSubDropdown1.classList.remove("sqd-hidden");
	        });
	        upCheckIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            let ifselected = false;
	            let weekAndTime = '';
	            if (dropdownBoxInnerText1.textContent == "Recurring") {
	                for (let i = 2; i < 9; i++) {
	                    if (gWeeks.children[i].classList.contains("selected")) {
	                        weekAndTime += `${gWeeks.children[i].children[5].textContent}` + `${gWeeks.children[i].children[0].children[1].textContent}` + `${gWeeks.children[i].children[1].children[1].textContent},`;
	                        ifselected = true;
	                    }
	                }
	                if (ifselected == false) {
	                    alert("please select at least one weekday");
	                    return;
	                }
	                const d = new Date();
	                let todayMonth = d.getMonth() + 1;
	                let todayYear = d.getFullYear();
	                let todayDate = d.getDate();
	                //@ts-ignore
	                let inputMonth = parseInt(document.getElementsByClassName("date-input")[0].value);
	                //@ts-ignore
	                let inputDate = parseInt(document.getElementsByClassName("date-input")[1].value);
	                //@ts-ignore
	                let inputYear = parseInt(document.getElementsByClassName("date-input-year")[0].value);
	                if (inputYear < todayYear || isNaN(inputYear)) {
	                    alert("please input right year of end date");
	                    return;
	                }
	                if ((inputMonth < todayMonth && inputYear == todayYear) || inputMonth > 12 || inputMonth < 1 || isNaN(inputMonth)) {
	                    alert("please input right month of end date");
	                    return;
	                }
	                //@ts-ignore
	                if (isNaN(inputDate) || (inputDate < todayDate && inputMonth == todayMonth && inputYear == todayYear)) {
	                    alert("please input right date of end date");
	                    return;
	                }
	                let lastDayOfMonth = new Date(inputYear, inputMonth, 0);
	                if (inputDate > lastDayOfMonth.getDate()) {
	                    alert("please input right date of end date");
	                    return;
	                }
	                //@ts-ignore
	                step.properties["send"] = weekAndTime + 'End date:' + `${document.getElementsByClassName("date-input")[0].value}` + '/' + `${document.getElementsByClassName("date-input")[1].value}` + '/' + `${document.getElementsByClassName("date-input-year")[0].value}`;
	            }
	            else {
	                if ((OnceDates && OnceDates.length == 0) || !OnceDates) {
	                    alert("please select a day");
	                    return;
	                }
	                else {
	                    step.properties["send"] = '';
	                    for (let k = 0; k < OnceDates.length; k++) {
	                        step.properties["send"] += OnceDates[k] + "T";
	                    }
	                    if (parseInt(setTimeInput.value) > 0 && parseInt(setTimeInput.value) < 13 && Number.isInteger(parseInt(setTimeInput.value))) {
	                        step.properties["send"] += setTimeInput.value + ':00';
	                        if (setTimeAmRect.classList.contains("selected")) {
	                            step.properties["send"] += "AM";
	                        }
	                        else {
	                            step.properties["send"] += "PM";
	                        }
	                    }
	                    else {
	                        alert("please enter correct hour");
	                        return;
	                    }
	                }
	            }
	            gDropdown.classList.toggle("sqd-hidden");
	            gUpPop3.classList.toggle("sqd-hidden");
	            //@ts-ignore
	            step.properties["list"] = dropdownBoxInnerText.textContent;
	            textRight.textContent = dropdownBoxInnerText.textContent;
	            //@ts-ignore
	            step.properties["frequency"] = dropdownBoxInnerText1.textContent;
	            step.updatedAt = new Date();
	        });
	        upCheckIcon.addEventListener("mousedown", function (e) {
	            e.stopPropagation();
	            checkImgContainerCircle.setAttribute("style", "fill:#0C67A5");
	        });
	        upCheckIcon.addEventListener("mouseup", function (e) {
	            e.stopPropagation();
	            checkImgContainerCircle.setAttribute("style", "fill:#3498DB");
	        });
	        upchangeIcon.addEventListener("mousedown", function () {
	            copyImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            upchangeIcon.setAttribute("href", "./assets/chang-inside.svg");
	        });
	        upchangeIcon.addEventListener("mouseup", function () {
	            copyImgContainerCircle.setAttribute("style", "fill:white");
	            upchangeIcon.setAttribute("href", "./assets/change.svg");
	        });
	        upchangeIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            // if_hintpop = true;
	            // gTriggerHint.setAttribute("visibility", "visible");
	            const dialogBox = Dom.element("dialog", {
	                class: "confirm-dialog",
	                id: "dialog-box",
	            });
	            const title = Dom.element("h3", {
	                class: "confirm-dialog-content",
	            });
	            const title2 = Dom.element("h3", {
	                class: "confirm-dialog-content-warning",
	            });
	            const form = Dom.element("form", {
	                method: "dialog",
	                id: "dialog-form",
	            });
	            title.innerHTML = "Are you sure you want to<br>&nbsp&nbsp&nbsp&nbsp&nbspchange the trigger?";
	            title2.innerHTML = "This will clear all your settings";
	            dialogBox.appendChild(title);
	            dialogBox.appendChild(title2);
	            const btn1 = Dom.element("button", {
	                type: "submit",
	                class: "popup-button"
	            });
	            btn1.innerText = "Confirm";
	            form.appendChild(btn1);
	            const btn2 = Dom.element("button", {
	                type: "submit",
	                class: "popup-button2"
	            });
	            btn2.innerText = "Cancel";
	            form.appendChild(btn2);
	            const designer = document.getElementById("designer");
	            designer === null || designer === void 0 ? void 0 : designer.appendChild(dialogBox);
	            dialogBox.appendChild(form);
	            if (typeof dialogBox.showModal === "function") {
	                dialogBox.showModal();
	            }
	            else {
	                prompt("Wrong window", "ok");
	            }
	            btn2.addEventListener("click", function (e) {
	                e.preventDefault();
	                e.stopPropagation();
	                const designer = document.getElementById("designer");
	                while (designer === null || designer === void 0 ? void 0 : designer.childNodes[1]) {
	                    designer === null || designer === void 0 ? void 0 : designer.removeChild(designer.childNodes[1]);
	                }
	            });
	            btn1.addEventListener("click", function (e) {
	                e.preventDefault();
	                e.stopPropagation();
	                textRight.textContent = "To Any List";
	                dropdownBoxInnerText.textContent = "Any list";
	                calendar.settings.selected.dates = '';
	                calendar.update();
	                setTimeInput.value = '';
	                dateInput.value = '';
	                monthInput.value = '';
	                yearInput.value = '';
	                for (let i = 1; i < 8; i++) {
	                    let checkWeek = document.getElementsByClassName(`sqd-week-${i}`);
	                    if (checkWeek[0].classList.contains('selected')) {
	                        checkWeek[0].children[0].children[1].textContent = '12';
	                        checkWeek[0].children[1].children[1].textContent = 'AM';
	                        checkWeek[0].children[5].setAttribute("style", "color:#949CA0");
	                        checkWeek[0].children[2].setAttribute("style", "fill:white;stroke:#949CA0");
	                    }
	                }
	                step.properties["send"] = '';
	                const designer = document.getElementById("designer");
	                while (designer === null || designer === void 0 ? void 0 : designer.childNodes[1]) {
	                    designer === null || designer === void 0 ? void 0 : designer.removeChild(designer.childNodes[1]);
	                }
	            });
	        });
	        changeIcon.addEventListener("click", function (e) {
	            e.stopPropagation();
	            const dialogBox = Dom.element("dialog", {
	                class: "confirm-dialog",
	                id: "dialog-box",
	            });
	            const title = Dom.element("h3", {
	                class: "confirm-dialog-content",
	            });
	            const title2 = Dom.element("h3", {
	                class: "confirm-dialog-content-warning",
	            });
	            const form = Dom.element("form", {
	                method: "dialog",
	                id: "dialog-form",
	            });
	            title.innerHTML = "Are you sure you want to<br>&nbsp&nbsp&nbsp&nbsp&nbspchange the trigger?";
	            title2.innerHTML = "This will clear all your settings";
	            dialogBox.appendChild(title);
	            dialogBox.appendChild(title2);
	            const btn1 = Dom.element("button", {
	                type: "submit",
	                class: "popup-button"
	            });
	            btn1.innerText = "Confirm";
	            form.appendChild(btn1);
	            const btn2 = Dom.element("button", {
	                type: "submit",
	                class: "popup-button2"
	            });
	            btn2.innerText = "Cancel";
	            form.appendChild(btn2);
	            const designer = document.getElementById("designer");
	            designer === null || designer === void 0 ? void 0 : designer.appendChild(dialogBox);
	            dialogBox.appendChild(form);
	            if (typeof dialogBox.showModal === "function") {
	                dialogBox.showModal();
	            }
	            else {
	                prompt("Wrong window", "ok");
	            }
	            btn2.addEventListener("click", function (e) {
	                e.preventDefault();
	                e.stopPropagation();
	                const designer = document.getElementById("designer");
	                while (designer === null || designer === void 0 ? void 0 : designer.childNodes[1]) {
	                    designer === null || designer === void 0 ? void 0 : designer.removeChild(designer.childNodes[1]);
	                }
	            });
	            btn1.addEventListener("click", function (e) {
	                e.preventDefault();
	                e.stopPropagation();
	                textRight.textContent = "To Any List";
	                dropdownBoxInnerText.textContent = "Any list";
	                calendar.settings.selected.dates = '';
	                calendar.update();
	                setTimeInput.value = '';
	                dateInput.value = '';
	                monthInput.value = '';
	                yearInput.value = '';
	                for (let i = 1; i < 8; i++) {
	                    let checkWeek = document.getElementsByClassName(`sqd-week-${i}`);
	                    if (checkWeek[0].classList.contains('selected')) {
	                        checkWeek[0].children[0].children[1].textContent = '12';
	                        checkWeek[0].children[1].children[1].textContent = 'AM';
	                        checkWeek[0].children[5].setAttribute("style", "color:#949CA0");
	                        checkWeek[0].children[2].setAttribute("style", "fill:white;stroke:#949CA0");
	                    }
	                }
	                step.properties["send"] = '';
	                const designer = document.getElementById("designer");
	                while (designer === null || designer === void 0 ? void 0 : designer.childNodes[1]) {
	                    designer === null || designer === void 0 ? void 0 : designer.removeChild(designer.childNodes[1]);
	                }
	            });
	        });
	        // Show hints
	        editIcon.addEventListener("mouseover", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mouseout", function () {
	            gRightPop3Reminder1.classList.toggle("sqd-hidden");
	        });
	        editIcon.addEventListener("mousedown", function () {
	            rightEditImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            editIcon.setAttribute("href", "./assets/edit2.svg");
	        });
	        editIcon.addEventListener("mouseup", function () {
	            rightEditImgContainerCircle.setAttribute("style", "fill:white");
	            editIcon.setAttribute("href", "./assets/edit.svg");
	        });
	        changeIcon.addEventListener("mouseover", () => {
	            gRightPop3Reminder2.classList.toggle("sqd-hidden");
	        });
	        changeIcon.addEventListener("mousedown", function () {
	            rightCopyImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            changeIcon.setAttribute("href", "./assets/chang-inside.svg");
	        });
	        changeIcon.addEventListener("mouseup", function () {
	            rightCopyImgContainerCircle.setAttribute("style", "fill:white");
	            changeIcon.setAttribute("href", "./assets/change.svg");
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
	        deleteIcon.addEventListener("mousedown", function () {
	            rightDeleteImgContainerCircle.setAttribute("style", "fill:#5495d4");
	            deleteIcon.setAttribute("href", "./assets/delete-inside.svg");
	        });
	        deleteIcon.addEventListener("mouseup", function () {
	            rightDeleteImgContainerCircle.setAttribute("style", "fill:white");
	            deleteIcon.setAttribute("href", "./assets/delete.svg");
	        });
	        // Event listeners in Dropdown
	        dropdownBoxShapeAfter.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gSubDropdownboxPop.classList.toggle("sqd-hidden");
	            if (!gSubDropdownbox1Pop.classList.contains("sqd-hidden")) {
	                gSubDropdownbox1Pop.classList.remove("sqd-hidden");
	            }
	            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
	                dropdownBoxShape.style.stroke = "#4FCCFC";
	                downIcon.setAttribute("href", "./assets/list_up.png");
	                dropdownBoxInnerText.style.fill = "#43A2E3";
	            }
	            else {
	                dropdownBoxShape.style.stroke = "#BFBFBF";
	                downIcon.setAttribute("href", "./assets/list_down.png");
	                dropdownBoxInnerText.style.fill = "#BFBFBF";
	            }
	        });
	        dropdownBoxShape1After.addEventListener("click", function (e) {
	            e.stopPropagation();
	            gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
	            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
	                gSubDropdownboxPop.classList.remove("sqd-hidden");
	            }
	            if (!gSubDropdownbox1Pop.classList.contains("sqd-hidden")) {
	                dropdownBoxShape1.style.stroke = "#4FCCFC";
	                downIcon1.setAttribute("href", "./assets/list_up.png");
	                dropdownBoxInnerText1.style.fill = "#43A2E3";
	            }
	            else {
	                dropdownBoxShape1.style.stroke = "#BFBFBF";
	                downIcon1.setAttribute("href", "./assets/list_down.png");
	                dropdownBoxInnerText1.style.fill = "#BFBFBF";
	            }
	        });
	        const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
	        inputView.setIsHidden(true);
	        const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
	        outputView.setIsHidden(true);
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
	        parent.insertBefore(g, parent.firstChild);
	        const boxHeight = ICON_SIZE$1 + PADDING_Y;
	        const text = Dom.svg("text", {
	            x: PADDING_X / 2,
	            y: boxHeight / 1.7 - 3,
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
	            x: ICON_SIZE$1 + 3 * PADDING_X + textWidth - 14,
	            y: boxHeight / 1.7 + 1,
	            class: "sqd-task-text_2",
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
	        const magnidyIconUrl = "./assets/magnify.svg";
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
	        const moreUrl = "./assets/emailMore.svg";
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
	        const copyUrl = "./assets/copy.svg";
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
	        const deleteUrl = "./assets/delete.svg";
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
	        const editUrl = "./assets/edit.svg";
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
	        const upCheckIconUrl = "./assets/check.svg";
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
	        const upDeleteIconUrl = "./assets/delete.svg";
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
	        const upCopyIconUrl = "./assets/copy.svg";
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
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS,
	            ry: RECT_RADIUS,
	        });
	        Dom.attrs(reminder1, {
	            id: `reminder1${Date.now()}`,
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 90,
	            y: PADDING_Y - 40,
	        });
	        const reminderText1 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 22 + 78.5,
	            y: PADDING_Y - 26,
	        });
	        Dom.attrs(reminderText1, {
	            //class: 'sqd-hidden',
	            id: `reminderText${Date.now()}`,
	        });
	        reminderText1.textContent = "Edit";
	        const reminder2 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS,
	            ry: RECT_RADIUS,
	        });
	        Dom.attrs(reminder2, {
	            id: `reminder2${Date.now()}`,
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 22 + 75,
	            y: PADDING_Y - 5,
	        });
	        const reminderText2 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 22 + 80,
	            y: PADDING_Y + 7,
	        });
	        Dom.attrs(reminderText2, {
	            //class: 'sqd-hidden',
	            id: `reminderText2${Date.now()}`,
	        });
	        reminderText2.textContent = "Copy";
	        const reminder3 = Dom.svg("rect", {
	            x: 0.5,
	            y: 0.5,
	            class: "sqd-task-rect-pop",
	            width: 50,
	            height: 25,
	            rx: RECT_RADIUS,
	            ry: RECT_RADIUS,
	        });
	        Dom.attrs(reminder3, {
	            id: `reminder3${Date.now()}`,
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 82,
	            y: PADDING_Y + 30,
	        });
	        const reminderText3 = Dom.svg("text", {
	            class: "sqd-task-text",
	            x: ICON_SIZE$1 + 4 * PADDING_X + 2 * textWidth + 22 + 67,
	            y: PADDING_Y + 42,
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
	        g.insertBefore(gDropdown, rect);
	        // Send Email Drop Down Menu set up
	        const newSend = Dom.svg("text", { class: "sqd-task-text", });
	        const newSub = Dom.svg("text", { class: "sqd-task-text", });
	        const newAddress = Dom.svg("text", { class: "sqd-task-text", });
	        const newCont = Dom.svg("text", { class: "sqd-task-text", });
	        //@ts-ignore
	        addDropDown(gDropdown, boxHeight, boxWidth, upCheckIcon, newSend, newSub, newAddress, newCont);
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
	            if (newCont.textContent) {
	                step.properties.content = newCont.textContent;
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
	        inputView.setIsHidden(true);
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
	function addDropDown(dropdown, h, w, button, send, sub, addr, cont) {
	    const gSubDropdownbox = Dom.svg("g", {
	        class: `sqd-task-group`
	    });
	    dropdown.appendChild(gSubDropdownbox);
	    const rect1 = createRect("sqd-task-rect", 0.5, 0.5, w, 9 * h + PADDING_Y, `dropdown${Date.now()}`, RECT_RADIUS);
	    gSubDropdownbox.appendChild(rect1);
	    let startX = rect1.getBBox().x + 5;
	    let startY = rect1.getBBox().y;
	    rect1.getBBox().width;
	    // Field names
	    const subject = addTxt("Subject title", startX + PADDING_X, startY + PADDING_Y + 45);
	    gSubDropdownbox.appendChild(subject);
	    startX = subject.getBBox().x;
	    startY = subject.getBBox().y;
	    subject.getBBox().width;
	    const sender = addTxt("Sender name", startX, startY + 1.7 * h);
	    gSubDropdownbox.appendChild(sender);
	    startY = sender.getBBox().y;
	    const address = addTxt("Sender email address", startX, startY + 1.7 * h);
	    gSubDropdownbox.appendChild(address);
	    startY = address.getBBox().y;
	    const content = addTxt("Choose your template", startX, startY + 1.8 * h);
	    gSubDropdownbox.appendChild(content);
	    // add input fields
	    startY = subject.getBBox().y;
	    let height = subject.getBBox().height + PADDING_Y;
	    const sendWrapper = Dom.svg("foreignObject", {
	        x: startX,
	        y: startY + 60,
	        width: 220,
	        height: height
	    });
	    const sendInput = Dom.element("input", {
	        class: "new-tag-input email-field",
	        name: "sender",
	        type: "text",
	        placeholder: "Enter name",
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
	        x: startX,
	        y: startY + 15,
	        width: 220,
	        height: height
	    });
	    const subjectInput = Dom.element("input", {
	        class: "new-tag-input email-field",
	        name: "subject",
	        type: "text",
	        placeholder: "Enter #1 Subject"
	    });
	    if (sub.textContent) {
	        Dom.attrs(subjectInput, {
	            value: sub.textContent
	        });
	    }
	    gSubDropdownbox.appendChild(subjectWrapper);
	    subjectWrapper.appendChild(subjectInput);
	    const addressWrapper = Dom.svg("foreignObject", {
	        x: startX,
	        y: startY + 110,
	        width: 220,
	        height: height
	    });
	    const addressInput = Dom.element("input", {
	        class: "new-tag-input email-field",
	        name: "address",
	        type: "text",
	        placeholder: "Enter email address"
	    });
	    // if (addr.textContent) {
	    //   Dom.attrs(addressInput, {
	    //     value: addr.textContent
	    //   });
	    // }
	    gSubDropdownbox.appendChild(addressWrapper);
	    addressWrapper.appendChild(addressInput);
	    // Add content option 1
	    startY = content.getBBox().y;
	    height = content.getBBox().height;
	    const tem = addTxt('Template', startX + 5, startY + PADDING_Y * 5);
	    gSubDropdownbox.appendChild(tem);
	    Dom.attrs(tem, { class: "content-text" });
	    const template = createRect("content-option", startX, startY + height + PADDING_Y / 2, 65, 60, "", RECT_RADIUS);
	    gSubDropdownbox.insertBefore(template, tem);
	    // Add content option 2
	    startX = template.getBBox().x + template.getBBox().width + PADDING_X;
	    const txt = addTxt('Text Only', startX + 3 - 5, startY + PADDING_Y * 5);
	    gSubDropdownbox.appendChild(txt);
	    Dom.attrs(txt, { class: "content-text" });
	    const txtWrapper = createRect("content-option", startX - PADDING_X / 2, startY + height + PADDING_Y / 2, 65, 60, "", RECT_RADIUS);
	    gSubDropdownbox.insertBefore(txtWrapper, txt);
	    const dropdownBoxShapeAfter = Dom.svg("rect", {
	        width: 65,
	        height: 60,
	        class: "option select-field",
	        fill: "#fff",
	        stroke: "#a0a0a0",
	        x: startX - PADDING_X / 2,
	        y: startY + height + PADDING_Y / 2,
	    });
	    Dom.attrs(dropdownBoxShapeAfter, {
	        opacity: 0,
	    });
	    dropdownBoxShapeAfter.setAttribute("cursor", "pointer");
	    gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
	    // Add content option 3
	    startX = txtWrapper.getBBox().x + txtWrapper.getBBox().width + PADDING_X * 2;
	    const html = addTxt('HTML', startX - 5, startY + PADDING_Y * 5);
	    gSubDropdownbox.appendChild(html);
	    Dom.attrs(html, { class: "content-text" });
	    const htmlWrapper = createRect("content-option", startX - 3 * PADDING_X / 2, startY + height + PADDING_Y / 2, 65, 60, "", RECT_RADIUS);
	    gSubDropdownbox.insertBefore(htmlWrapper, html);
	    //text-test field
	    const textWrapper = Dom.svg("foreignObject", {
	        x: 17.5,
	        y: startY + 70,
	        width: 220,
	        height: height + 20
	    });
	    const textInput = Dom.element("input", {
	        class: "new-tag-input email-field sqd-hidden",
	        name: "subject",
	        type: "text",
	        placeholder: "text"
	    });
	    if (cont.textContent) {
	        Dom.attrs(textInput, {
	            value: cont.textContent
	        });
	    }
	    gSubDropdownbox.appendChild(textWrapper);
	    textWrapper.appendChild(textInput);
	    dropdownBoxShapeAfter.addEventListener("click", function (e) {
	        e.stopPropagation();
	        textInput.classList.toggle("sqd-hidden");
	    });
	    // Add Event Listeners
	    button.addEventListener("click", function (e) {
	        e.stopPropagation();
	        if (subjectInput.value) {
	            sub.textContent = subjectInput.value;
	        }
	        if (sendInput.value) {
	            send.textContent = sendInput.value;
	        }
	        if (textInput.value) {
	            cont.textContent = textInput.value;
	        }
	    });
	    console.log(cont.textContent);
	}

	class TaskStepComponent {
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
	    constructor(view, step, parentSequence, configuration) {
	        this.view = view;
	        this.step = step;
	        this.parentSequence = parentSequence;
	        this.configuration = configuration;
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
	    constructor(width, height, layer) {
	        this.width = width;
	        this.height = height;
	        this.layer = layer;
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
	    static create(placeholders, context) {
	        const checker = new PlaceholderFinder(placeholders, context);
	        context.onViewPortChanged.subscribe(checker.clearCacheHandler);
	        window.addEventListener('scroll', checker.clearCacheHandler, false);
	        return checker;
	    }
	    constructor(placeholders, context) {
	        this.placeholders = placeholders;
	        this.context = context;
	        this.clearCacheHandler = () => this.clearCache();
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
	    static create(context, step, movingStepComponent) {
	        const view = DragStepView.create(step, context.configuration);
	        return new DragStepBehavior(view, context, step, movingStepComponent);
	    }
	    constructor(view, context, step, movingStepComponent) {
	        this.view = view;
	        this.context = context;
	        this.step = step;
	        this.movingStepComponent = movingStepComponent;
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
	    constructor(root) {
	        this.root = root;
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
	    static create(parent, step, context) {
	        TypeValidator.validate(step.type);
	        const view = ToolboxItemView.create(parent, step, context.configuration.steps);
	        const item = new ToolboxItem(step, context);
	        view.bindMousedown(e => item.onMousedown(e));
	        view.bindTouchstart(e => item.onTouchstart(e));
	        view.bindContextMenu(e => item.onContextMenu(e));
	        return item;
	    }
	    constructor(step, context) {
	        this.step = step;
	        this.context = context;
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
	        // root.appendChild(header);
	        root.appendChild(body);
	        // header.appendChild(headerTitle);
	        // header.appendChild(headerToggleIcon);
	        // body.appendChild(filterInput);
	        parent.appendChild(root);
	        const scrollboxView = ScrollBoxView.create(body, parent);
	        return new ToolboxView(header, headerToggleIcon, body, filterInput, scrollboxView, context);
	    }
	    constructor(header, headerToggleIcon, body, filterInput, scrollboxView, context) {
	        this.header = header;
	        this.headerToggleIcon = headerToggleIcon;
	        this.body = body;
	        this.filterInput = filterInput;
	        this.scrollboxView = scrollboxView;
	        this.context = context;
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
	            this.scrollboxView.refresh();
	        }
	    }
	    setGroups(groups) {
	        const listFilter = Dom.element('div');
	        const groupTitleFilter = Dom.element('div', {
	            class: 'sqd-toolbox-filter-title'
	        });
	        groupTitleFilter.innerText = groups[0].name;
	        listFilter.appendChild(groupTitleFilter);
	        groups[0].steps.forEach(s => ToolboxItem.create(listFilter, s, this.context));
	        listFilter.setAttribute("class", "group-filter");
	        this.scrollboxView.setContent(listFilter);
	        const listAction = Dom.element('div');
	        const groupTitleAction = Dom.element('div', {
	            class: 'sqd-toolbox-action-title'
	        });
	        groupTitleAction.innerText = groups[1].name;
	        listAction.appendChild(groupTitleAction);
	        groups[1].steps.forEach(s => ToolboxItem.create(listAction, s, this.context));
	        listAction.setAttribute("class", "group-action");
	        this.scrollboxView.setContent(listAction);
	    }
	    destroy() {
	        this.scrollboxView.destroy();
	    }
	}

	class Toolbox {
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
	    constructor(view, context) {
	        this.view = view;
	        this.context = context;
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
	    static create(context) {
	        return new MoveViewPortBehavior(context.viewPort.position, context);
	    }
	    constructor(startPosition, context) {
	        this.startPosition = startPosition;
	        this.context = context;
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
	    static create(pressedStepComponent, context) {
	        return new SelectStepBehavior(pressedStepComponent, context);
	    }
	    constructor(pressedStepComponent, context) {
	        this.pressedStepComponent = pressedStepComponent;
	        this.context = context;
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
	    static create(parent, sequence, configuration) {
	        const g = Dom.svg("g");
	        parent.appendChild(g);
	        const sequenceComponent = SequenceComponent.create(g, sequence, configuration);
	        const view = sequenceComponent.view;
	        let startCircle;
	        if (sequence.length == 0) {
	            startCircle = createCircle(g, view.joinX - SIZE / 3, 0, "     Set up the trigger     ");
	        }
	        else if (!sequence[0].id.startsWith("start-component")) {
	            startCircle = createCircle(g, view.joinX - SIZE / 3, 0, "     Set up the trigger     ");
	        }
	        else {
	            startCircle = createCircle(g, view.joinX - SIZE / 3, 0, " ");
	        }
	        // Dom.translate(startCircle, view.joinX - SIZE / 2, 0);
	        g.appendChild(startCircle);
	        Dom.translate(view.g, 100, SIZE);
	        return new StartComponentView(g, view.width, view.height + SIZE * 2, view.joinX, sequenceComponent);
	    }
	    constructor(g, width, height, joinX, component) {
	        this.g = g;
	        this.width = width;
	        this.height = height;
	        this.joinX = joinX;
	        this.component = component;
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
	        x: x + 100,
	        y: y + LABEL_HEIGHT$1 / 2,
	    });
	    nameText.textContent = text;
	    g.appendChild(nameText);
	    const nameWidth = Math.max(g.getBBox().width + LABEL_PADDING_X$1 * 2, MIN_LABEL_WIDTH);
	    const nameRect = Dom.svg("rect", {
	        class: "sqd-label-rect",
	        width: nameWidth * 2,
	        height: LABEL_HEIGHT$1,
	        x: x - nameWidth / 2 + 42,
	        y,
	        rx: 20,
	        ry: 20,
	    });
	    g.insertBefore(nameRect, nameText);
	    return g;
	}

	class StartComponent {
	    static create(parent, sequence, configuration) {
	        const view = StartComponentView.create(parent, sequence, configuration);
	        return new StartComponent(view);
	    }
	    constructor(view) {
	        this.view = view;
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
	        canvas.addEventListener("click", function () {
	            document.getElementsByClassName("sqd-task-rect-Subscribe");
	            // Dom.attrs(test[0], {y: 50})
	        });
	        canvas.appendChild(foreground);
	        workspace.appendChild(canvas);
	        parent.appendChild(workspace);
	        const view = new WorkspaceView(workspace, canvas, gridPattern, gridPatternPath, foreground, configuration);
	        window.addEventListener("resize", view.onResizeHandler, false);
	        return view;
	    }
	    constructor(workspace, canvas, gridPattern, gridPatternPath, foreground, configuration) {
	        this.workspace = workspace;
	        this.canvas = canvas;
	        this.gridPattern = gridPattern;
	        this.gridPatternPath = gridPatternPath;
	        this.foreground = foreground;
	        this.configuration = configuration;
	        this.onResizeHandler = () => this.onResize();
	    }
	    editStartComp(sequence, journeyID) {
	        const start = document.getElementById("start");
	        const tempThis = this;
	        if (start != null) {
	            start.addEventListener("click", (e) => {
	                e.preventDefault();
	                const dialogBox = Dom.element("dialog", {
	                    class: "triggers-list",
	                    autofocus: "false"
	                });
	                const triggers = [
	                    "Subscribe",
	                    "Unsubscribe",
	                    "Place a Purchase",
	                    "Abandon Checkout",
	                    "Time Trigger"
	                ];
	                const triggers_content = [
	                    "The automation begins when a contact subscribes to a list.",
	                    "The automation begins when a contact unsubscribes from a list.",
	                    "The automation begins when a contact makes a purchase.",
	                    "The automaiton begins when a contact abandons a cart.",
	                    "The automation begins when a contact schedules a specific date."
	                ];
	                const triggers_img = [
	                    "../assets/subscribe.png",
	                    "../assets/unsubscribe.png",
	                    "../assets/purchase.png",
	                    "../assets/abandon.png",
	                    "../assets/time-trigger.png"
	                ];
	                const dialogForm = Dom.element("form", {
	                    // class: 'triggers-list',
	                    method: "dialog",
	                    autofocus: "false"
	                });
	                const prompt = Dom.element("p");
	                Dom.attrs(prompt, {
	                    class: "prompt",
	                });
	                prompt.innerHTML = "Please Select the Trigger";
	                dialogForm.appendChild(prompt);
	                for (let i = 0; i < triggers.length; i++) {
	                    const btn1 = Dom.element("button");
	                    Dom.attrs(btn1, {
	                        class: "triggers",
	                        type: "submit",
	                        name: "userChoice",
	                        value: i,
	                    });
	                    btn1.innerHTML = `<span style="font-size:16px">${triggers[i]}</span><br/>${triggers_content[i]}`;
	                    btn1.style.backgroundImage = `url("${triggers_img[i]}")`;
	                    btn1.addEventListener("click", function (e) {
	                        e.preventDefault();
	                        e.target;
	                        sequence.unshift({
	                            id: `start-component-${journeyID}`,
	                            componentType: ComponentType.task,
	                            type: "save",
	                            name: triggers[i],
	                            createdAt: new Date(),
	                            createdBy: "userID",
	                            updatedAt: new Date(),
	                            updatedBy: "userID",
	                            properties: {},
	                            branches: undefined,
	                        });
	                        // console.log(3722, sequence);
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
	                dialogBox.addEventListener("click", onClick);
	                function onClick(event) {
	                    dialogBox.close();
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
	    bindMouseOver(handler) {
	        this.canvas.addEventListener("mouseover", (e) => handler(readMousePosition(e), e.target, e.button), false);
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
	        view.bindMouseOver((p, t, b) => workspace.onMouseOver(p, t, b));
	        view.bindTouchStart((e) => workspace.onTouchStart(e));
	        view.bindContextMenu((e) => workspace.onContextMenu(e));
	        view.bindWheel((e) => workspace.onWheel(e));
	        return workspace;
	    }
	    constructor(view, context) {
	        this.view = view;
	        this.context = context;
	        this.isValid = false;
	        this.selectedStepComponent = null;
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
	    onMouseOver(position, target, button) {
	        // this.startBehavior(target, position, isMiddleButton);
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
	                const RightDeleteButton = document.getElementById(`RightDeleteIcon-${clickedStep.step.id}`);
	                if (RightDeleteButton) {
	                    RightDeleteButton.addEventListener("click", function (e) {
	                        console.log("trying to delete switch");
	                        fakeThis.tryDeleteStep(clickedStep.step);
	                    });
	                }
	                const UpDeleteButton = document.getElementById(`UpDeleteIcon-${clickedStep.step.id}`);
	                if (UpDeleteButton) {
	                    UpDeleteButton.addEventListener("click", function (e) {
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
	            document.getElementsByClassName("sqd-switch-rect");
	            document.getElementsByClassName("sqd-switch-rect-left");
	            document.getElementsByClassName("sqd-switch-text");
	            document.getElementsByClassName("sqd-task-more-icon");
	            if (but) {
	                but.forEach((e) => e.classList.add("sqd-hidden"));
	                /* rect.setAttribute("width", `258`);
	            rect.setAttribute("x", `${containerWidths[0] - textWidth - 28}`);
	            rectLeft.setAttribute("x", `${containerWidths[0] - textWidth - 28}`);
	            text.setAttribute("x", `${ICON_SIZE + containerWidths[0] - PADDING_X * 17 + 69}`);
	            moreIcon.setAttribute("x", `${ICON_SIZE + containerWidths[0] + PADDING_X + textWidth - 27}`); */
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
	        var _a;
	        this.getRootComponent().setIsDragging(isDragging);
	        if (((_a = this.selectedStepComponent) === null || _a === void 0 ? void 0 : _a.step.componentType) != ComponentType.switch) {
	            var encapedComponents = document.querySelectorAll(".encapsulated");
	            if (encapedComponents) {
	                encapedComponents.forEach((e) => e.classList.add("sqd-hidden"));
	            }
	            var joins = document.querySelectorAll(".sqd-join");
	            if (joins) {
	                joins.forEach((e) => e.classList.add("sqd-hidden"));
	            }
	            var labelText = document.querySelectorAll(".sqd-label-text");
	            if (labelText) {
	                labelText.forEach((e) => e.classList.add("sqd-hidden"));
	            }
	            var joinCir = document.querySelectorAll(".sqd-placeholder-circle");
	            if (joinCir) {
	                joinCir.forEach((e) => e.classList.add("sqd-hidden"));
	            }
	            var capsules = document.querySelectorAll(".capsule");
	            if (capsules) {
	                capsules.forEach((e) => e.classList.remove("sqd-hidden"));
	            }
	        }
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
	        class: "popup-button"
	    });
	    btn1.innerText = "Confirm";
	    form.appendChild(btn1);
	    const btn2 = Dom.element("button", {
	        type: "submit",
	    });
	    btn2.innerText = "Cancel";
	    btn1.addEventListener("click", function (e) {
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
	    btn2.addEventListener("click", function (e) {
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
	            width: 340,
	            height: 60,
	        });
	        const title = Dom.svg("text", {
	            x: 160,
	            y: 25,
	            class: "info-box-title",
	        });
	        title.textContent = String(context.definition.properties.journeyName);
	        info.appendChild(title);
	        const nameWidth = Math.max(info.getBBox().width + LABEL_PADDING_X * 2, 320);
	        // console.log(info.getBBox());
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
	        const avatarUrl = "./assets/avatar.svg";
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
	        // Left Toolbox
	        const emailyToolbox = Dom.element("div", {
	            class: "emaily-toolbox",
	        });
	        const toolboxBody = Dom.element("div", {
	            class: "toolbox-body",
	        });
	        const dashboardIcon = Dom.element("img", {
	            src: "./assets/dashboard.svg",
	            class: "dashboard-icon emaily-toolbox-icon",
	            height: 20,
	            width: 20,
	        });
	        const flowIcon = Dom.element("img", {
	            src: "./assets/flow.svg",
	            class: "flow-icon emaily-toolbox-icon",
	            height: 20,
	            width: 20,
	        });
	        const usersIcon = Dom.element("img", {
	            src: "./assets/users.svg",
	            class: "users-icon emaily-toolbox-icon",
	            height: 20,
	            width: 20,
	        });
	        const fileIcon = Dom.element("img", {
	            src: "./assets/file.svg",
	            class: "file-icon emaily-toolbox-icon",
	            height: 20,
	            width: 20,
	        });
	        const lineDivider = Dom.element("img", {
	            src: "./assets/lineDivider.svg",
	            class: "line-divider emaily-toolbox-icon",
	            height: 25,
	            width: 25,
	        });
	        const settingsIcon = Dom.element("img", {
	            src: "./assets/settings.svg",
	            class: "settings-icon emaily-toolbox-icon",
	            height: 20,
	            width: 20,
	        });
	        toolboxBody.appendChild(dashboardIcon);
	        toolboxBody.appendChild(flowIcon);
	        toolboxBody.appendChild(usersIcon);
	        toolboxBody.appendChild(fileIcon);
	        toolboxBody.appendChild(lineDivider);
	        toolboxBody.appendChild(settingsIcon);
	        emailyToolbox.appendChild(toolboxBody);
	        root.appendChild(emailyToolbox);
	        const view = new DesignerView(root, context.layoutController, workspace, toolbox);
	        view.reloadLayout();
	        window.addEventListener("resize", view.onResizeHandler, false);
	        return view;
	    }
	    constructor(root, layoutController, workspace, toolbox) {
	        this.root = root;
	        this.layoutController = layoutController;
	        this.workspace = workspace;
	        this.toolbox = toolbox;
	        this.onResizeHandler = () => this.onResize();
	        this.onKeyUpHandlers = [];
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
	    constructor(view, context) {
	        this.view = view;
	        this.context = context;
	        this.onDefinitionChanged = new SimpleEvent();
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
