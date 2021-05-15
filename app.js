var fs = require('fs');
var mqtt = require('mqtt');
var path = require('path');
var https = require('https');
var assert = require('assert');
var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

(async function() {
	var httpPort = 80;
	var httpsPort = 443;
	var key = fs.readFileSync('./pagina/privateKey.key');
	var cert = fs.readFileSync('./pagina/certificate.crt');

	var app = express();
	var server = https.createServer({key: key, cert: cert }, app);
	app.use(bodyParser.json());
	app.use(express.static("pagina"));
	app.use(bodyParser.urlencoded({ extended: true }));

	app.use((req, res, next) => {
		if (!req.secure) {
		    return res.redirect('https://' + req.headers.host + req.url);
		}
		next();
	})

	// Conexion mongo
	var uri = "mongodb+srv://Roberto:Robert060500@$@cluster0.vradk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
	var client = MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	await client.connect();
	var collection = client.db('MangoProject').collection('Humedad');

	// Rutas
	app.get('/', function(request, response) {
  		response.sendFile('index.html');
	});
	app.get('/obtenerHumedad', (request, response) => {
		collection.find({}).toArray((err, docs) => {
			assert.equal(null, err);
			response.status(200).json(docs);
		});
	});

	// Conexion mqtt
	var client = mqtt.connect('mqtt://broker.emqx.io', { clientId: "Servidor1" });
	client.on('message', (topic, message, packet) => {
		collection.insertOne(JSON.parse(message), (err, r) => {
			assert.equal(null, err);
			console.log(r.insertedCount);
		});
	});

	client.on("error", (error) => {console.log(error);});
	client.on("connect", () => { console.log("Connected");});
	client.subscribe("getOutOfMyTopicBtch", { qos:1 });

	app.listen(httpPort, function () {
	  console.log(`Listening on port ${httpPort}!`)
	})

	server.listen(httpsPort, function () {
	  console.log(`Listening on port ${httpsPort}!`)
	})
})();