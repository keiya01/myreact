import MyReact from "./myreact";

/** @jsx MyReact.createElement */
const App = () => {
	return <h1>Hello World!!</h1>;
};

MyReact.render(<App />, document.getElementById("root"));
