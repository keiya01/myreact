import ReactDOM from "react-dom";

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

const MyReact = {
	createElement
};

/** @jsx MyReact.createElement */
const element = <h1>Hello World!!</h1>;

ReactDOM.render(element, document.getElementById("root"));
