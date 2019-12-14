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
const render = (element, container) => {
	nextUnitOfWork = {
		dom: container,
		props: {
			children: [element]
		}
	};
};

const workLoop = deadline => {
	let shouldYeild = false;
	while (nextUnitOfWork && !shouldYeild) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
		shouldYeild = deadline.timeRemaining() < 1;
	}
	requestIdleCallback(workLoop);
};

const performUnitOfWork = fiber => {
	if (!fiber.dom) {
		fiber.dom = createDOM(fiber);
	}

	if (fiber.parent) {
		fiber.parent.dom.appendChild(fiber.dom);
	}

	const elements = fiber.props.children;
	let index = 0;
	let prevSibling = null;

	while (index < elements.length) {
		const element = elements[index];
		const newFiber = {
			type: element.type,
			props: element.props,
			parent: fiber,
			dom: null
		};

		if (index === 0) {
			fiber.child = newFiber;
		} else {
			prevSibling.sibling = newFiber;
		}

		prevSibling = newFiber;
		index++;

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
	}
};

requestIdleCallback(workLoop);

export default {
	createElement,
	render
};
