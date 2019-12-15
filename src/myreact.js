const createTextElement = text => {
	return {
		type: "TEXT_ELEMENT",
		props: {
			nodeValue: text,
			children: []
		}
	};
};

const createElement = (type, props, ...children) => {
	return {
		type,
		props: {
			...props,
			children: children.map(child => {
				return typeof child === "object" ? child : createTextElement(child);
			})
		}
	};
};

const createDOM = fiber => {
	const dom = fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);

	Object.keys(fiber.props)
		.filter(key => key !== "children")
		.map(name => {
			dom[name] = fiber.props[name];
		});

	return dom;
};

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;
const render = (element, container) => {
	wipRoot = {
		dom: container,
		props: {
			children: [element]
		},
		alternate: currentRoot
	};
	nextUnitOfWork = wipRoot;
	deletions = [];
};

const isEvent = key => key.startsWith("on");

const addEvent = (props, dom) => {
	Object.keys(props)
		.filter(isEvent)
		.map(key => {
			const eventType = key.toLowerCase().substring(2);
			dom.addEventListener(eventType, props[key]);
		});
};

const updateDOM = (dom, prevProps, nextProps) => {
	const isProperty = key => key !== "children";
	const isNew = (prev, next) => key => prev[key] !== next[key];

	// Remove event listener
	Object.keys(prevProps)
		.filter(key => {
			return isEvent(key) && (!nextProps.hasOwnProperty(key) || isNew(prevProps, nextProps)(key));
		})
		.map(key => {
			const eventType = key.toLowerCase().substring(2);
			dom.removeEventListener(eventType, prevProps[key]);
		});

	// Delete old props
	Object.keys(prevProps)
		.filter(key => {
			return isProperty(key) && !nextProps.hasOwnProperty(key);
		})
		.map(key => {
			dom[key] = "";
		});

	// Add new props
	Object.keys(nextProps)
		.filter(key => {
			return isProperty(key) && isNew(prevProps, nextProps)(key);
		})
		.map(key => {
			dom[key] = nextProps[key];
		});

	addEvent(nextProps, dom);
};

const commitWork = fiber => {
	if (!fiber) {
		return;
	}

	let domParentFiber = fiber.parent;
	while (!domParentFiber.dom) {
		domParentFiber = domParentFiber.parent;
	}
	const domParent = domParentFiber.dom;

	if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
		addEvent(fiber.props, fiber.dom);
		domParent.appendChild(fiber.dom);
	} else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
		updateDOM(fiber.dom, fiber.alternate.props, fiber.props);
	} else if (fiber.effectTag === "DELETION") {
		domParent.removeChild(fiber.dom);
	}

	commitWork(fiber.child);
	commitWork(fiber.sibling);
};

const commitRoot = () => {
	deletions.forEach(commitWork);
	commitWork(wipRoot.child);
	currentRoot = wipRoot;
	wipRoot = null;
};

const workLoop = deadline => {
	let shouldYeild = false;
	while (nextUnitOfWork && !shouldYeild) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
		shouldYeild = deadline.timeRemaining() < 1;
	}

	if (!nextUnitOfWork && wipRoot) {
		commitRoot();
	}

	requestIdleCallback(workLoop);
};

const updateHostComponent = fiber => {
	if (!fiber.dom) {
		fiber.dom = createDOM(fiber);
	}

	const elements = fiber.props.children;
	reconcileChild(fiber, elements);
};

let wipFiber = null;
let hookIndex = null;
const updateFunctionComponent = fiber => {
	wipFiber = fiber;
	hookIndex = 0;
	wipFiber.hooks = [];
	const children = [fiber.type(fiber.props)];
	reconcileChild(fiber, children);
};

const useState = initial => {
	const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];

	const hook = {
		state: oldHook ? oldHook.state : initial,
		queue: []
	};

	const actions = oldHook ? oldHook.queue : [];
	actions.map(action => {
		hook.state = action instanceof Function ? action(hook.state) : action;
	});

	const setState = action => {
		hook.queue.push(action);
		wipRoot = {
			dom: currentRoot.dom,
			props: currentRoot.props,
			alternate: currentRoot
		};
		nextUnitOfWork = wipRoot;
		deletions = [];
	};

	wipFiber.hooks.push(hook);
	++hookIndex;

	return [hook.state, setState];
};

const performUnitOfWork = fiber => {
	if (fiber.type instanceof Function) {
		updateFunctionComponent(fiber);
	} else {
		updateHostComponent(fiber);
	}

	if (fiber.child) {
		return fiber.child;
	}

	let nextFiber = fiber;
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}

		nextFiber = nextFiber.parent;
	}
};

const reconcileChild = (wipFiber, elements) => {
	let index = 0;
	let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
	let prevSibling = null;

	while (index < elements.length || oldFiber != null) {
		const element = elements[index];
		const newFiber = null;

		const sameType = oldFiber && element && element.type === oldFiber.type;

		if (sameType) {
			newFiber = {
				type: oldFiber.type,
				props: element.props,
				dom: oldFiber.dom,
				parent: wipFiber,
				alternate: oldFiber,
				effectTag: "UPDATE"
			};
		}
		if (element && !sameType) {
			newFiber = {
				type: element.type,
				props: element.props,
				dom: null,
				parent: wipFiber,
				alternate: null,
				effectTag: "PLACEMENT"
			};
		}
		if (oldFiber && !sameType) {
			oldFiber.effectTag = "DELETION";
			deletions.push(oldFiber);
		}

		if (oldFiber) {
      oldFiber = oldFiber.sibling;
		}

		if (index === 0) {
			wipFiber.child = newFiber;
		} else if (element) {
			prevSibling.sibling = newFiber;
		}

		prevSibling = newFiber;
		index++;
	}
};

requestIdleCallback(workLoop);

export default {
	createElement,
	render,
	useState
};
