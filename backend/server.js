require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const port = 4000;

mongoose.connect(process.env.MONGO, () => {
	app.listen(port, () => {
		console.log(`Listening at ${port}`);
	});
});
