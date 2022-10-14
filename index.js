require('dotenv').config();

const fs = require("fs");
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const https = require('https')
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
			username: username,
			vet: json.vet,
			suiker: json.suiker,
			koolhydraten: json.koolhydraten,
			eiwitten: json.eiwitten,
		})
	})
});

app.get("/ean/:ean", (req, res) => {
	const ean = req.params.ean

	const options = {
		hostname: 'world-zh.openfoodfacts.org',
		port: 443,
		path: '/api/v0/product/' + ean + '.json',
		method: 'GET',
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36',
		}
	}
	
	const request = https.request(options, response => {
		let data = '';
	
		response.on('data', (chunk) => {
			data += chunk;
		});
	
		response.on('end', () => {
			var json = JSON.parse(data);

			var products = json.product.nutriments

			products.image = json.product.image_url
			res.send(products)
		});
	})
	
	request.on('error', error => {
		console.error(error)
	})
	
	request.end()

})


fs.readdirSync('./routes').forEach(file => {
    app.use(`/${file}/`, require(`./routes/${file}/${file}.controller`));
});

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected', () => console.log('Server is connected to the database.'));