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

const render = (element, container) => {
	const dom = element.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type);

	Object.keys(element.props)
		.filter(key => key !== "children")
		.map(name => (dom[name] = element.props[name]));

	element.props.children.map(child => {
		render(child, dom);
	});

	container.appendChild(dom);
};

export default {
	createElement,
	render
};
