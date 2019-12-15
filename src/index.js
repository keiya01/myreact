import MyReact from "./myreact";

/** @jsx MyReact.createElement */
const App = () => {
	const [count, setCount] = MyReact.useState(0);
	const handleOnClick = () => {
		setCount(count + 1);
	};
	return (
		<div>
			<h1 onClick={e => console.log(e.target.innerText)}>Hello World!!</h1>
			<button onClick={handleOnClick}>count: {count}</button>
		</div>
	);
};

MyReact.render(<App />, document.getElementById("root"));
