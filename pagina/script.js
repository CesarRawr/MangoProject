
Push.Permission.get();

var doc = new jsPDF();

var humedad = document.querySelector('.hum-container > span.hum');
var clientName = `Cliente#${ Math.floor(Math.random() * 99999999) + 1 }`;

// Create a cliente instance
cliente = new Paho.MQTT.Client("broker.emqx.io", 8084, clientName);

// set callback handlers
cliente.onConnectionLost = onConnectionLost;
cliente.onMessageArrived = onMessageArrived;

// connect the cliente
cliente.connect({useSSL: true, onSuccess:onConnect});


// called when the cliente connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  cliente.subscribe("MangoProject");
}

// called when the cliente loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
    cliente.connect({useSSL: true, onSuccess:onConnect});
  }
}

// called when a message arrives
function onMessageArrived(message) {
    try {
        var json = JSON.parse(message.payloadString);
        console.log("Humedad: " + json.humedad);
        if(json.humedad >= 90) {
          sendNotification();
        }
        humedad.textContent = json.humedad.toString();
    }
    catch(error) {
        console.log(error);
        alert("algo salió mal");
    }
}

function sendNotification() {
    Push.create('¡Oye!', {
      body: 'Parece que tus manguitos están listos :)',
      icon: '/images/Mango.png',
      timeout: 8000,               // Timeout before notification closes automatically.
      vibrate: [100, 100, 100],    // An array of vibration pulses for mobile devices.
      onClick: function() {
          // Callback for when the notification is clicked. 
          console.log(this);
      }  
  });
}

// Boton para jsPDF
var boton = document.querySelector('.btn');
boton.addEventListener('click', () => {
  fetch('/obtenerHumedad')
  .then((res) => res.json())
  .then((json) => {
    for (var i = 0; i < json.length; i++) {
      
      var y = (i + 1) * 10;
      
      if (y >= doc.internal.pageSize.height()) {
        doc.addPage();
      }

      doc.text(20, y, `${json[i].nombre} humedad: ${json[i].humedad} el ${json[i].fecha}`);
    }
    doc.save('reporte.pdf');
  })
  .catch((e) => {console.log(e)});
});