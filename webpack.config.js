const path = require("path");

module.exports = {
	entry: "./src",
	devtool: "inline-source-map",
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: ["@babel/preset-env", "@babel/react"]
						}
					}
				]
			}
		]
	},
	resolve: {
		extensions: [".js", ".jsx", ".json"]
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "public")
	},
	devServer: {
		contentBase: path.join(__dirname, "public"),
		inline: true,
		compress: true,
		port: 9000
	}
};
