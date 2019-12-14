import MyReact from "./myreact";

/** @jsx MyReact.createElement */
const element = <h1>Hello World!!</h1>;

MyReact.render(element, document.getElementById("root"));
