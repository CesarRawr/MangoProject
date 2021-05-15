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
            Notification.requestPermission().then(function(result) {
                if(result === 'granted') {
                    sendNotification();
                }
            });
        }
    }
    catch(error) {
        console.log(error);
        alert("algo salió mal");
    }
}

function sendNotification() {
    var randomItem = Math.floor(Math.random()* 9999);
    var notifTitle = 'Mangos listos';
    var notifBody = '¡Parece ser que tus mangos ya están maduros! Corre a probarlos :)';
    var notifImg = '/images/Mango.png';
    var options = {
        body: notifBody,
        icon: notifImg
    }
    var notif = new Notification(notifTitle, options);
}