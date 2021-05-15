Push.Permission.get();

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
    }
    catch(error) {
        console.log(error);
        alert("algo salió mal");
    }
}

function sendNotification() {
    Push.create('Hi there!', {
      body: 'This is a notification.',
      icon: '/images/Mango.png',
      timeout: 8000,               // Timeout before notification closes automatically.
      vibrate: [100, 100, 100],    // An array of vibration pulses for mobile devices.
      onClick: function() {
          // Callback for when the notification is clicked. 
          console.log(this);
      }  
  });
}