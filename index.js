require('dotenv').config();

const fs = require("fs");
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('./routes/user/user.model');

app.engine('html', require('ejs').renderFile);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(require('./middleware/sanitize.middleware'))
app.use(cookieParser());

app.get('/', (req, res) => {
	try {
		const token = req.cookies[process.env.JWT_NAME];
		const username = jwt.verify(token, process.env.JWT_SECRET).username

		User.findOne({username}).then(json=>{
			res.redirect('/dashboard')
		})
		
	// If we dont have a JWT token/logged in sesssion
	} catch (e) { res.render('index.html') }
});

app.get('/register', (req, res) => {
    res.render('register.html');
});

app.get('/logout', (req, res) => {
	res.clearCookie(process.env.JWT_NAME)
    res.redirect('/')
});

app.get('/dashboard', require('./middleware/jwt.middleware'), (req, res) => {
	const username = req.userData.username
	User.findOne({username}).then(json=>{
		res.render('dashboard.html',  {
			username: username
		})
	})
});

fs.readdirSync('./routes').forEach(file => {
    app.use(`/${file}/`, require(`./routes/${file}/${file}.controller`));
});

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected', () => console.log('Server is connected to the database.'));