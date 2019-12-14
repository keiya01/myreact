module.exports = {
	roots: ["<rootDir>/src"],
	transform: {
		"^.+\\.jsx?$": "babel-loader"
	},
	testRegex: "/__tests__/.+\\.test\\.jsx?$",
	moduleFileExtensions: ["js", "jsx"]
};
