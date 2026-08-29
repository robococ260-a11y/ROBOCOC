/* =========================================
   ESTADO DEL VEHÍCULO
========================================= */

let speed = 70;
let currentMovement = "DETENIDO";

let lightsOn = false;
let leftSignalOn = false;
let rightSignalOn = false;
let emergencyOn = false;


/* =========================================
   MOVIMIENTO
========================================= */

function move(direction) {

    const names = {
        forward: "AVANZANDO",
        backward: "RETROCEDIENDO",
        left: "GIRO IZQUIERDA",
        right: "GIRO DERECHA"
    };

    currentMovement = names[direction] || "DETENIDO";

    updateVehicleStatus();

    /*
        AQUÍ POSTERIORMENTE PUEDES ENVIAR
        EL COMANDO AL ESP32.

        Ejemplo:

        sendToESP32({
            command: direction,
            speed: speed
        });
    */
}


/* =========================================
   DETENER
========================================= */

function stopCar() {

    currentMovement = "DETENIDO";

    updateVehicleStatus();

    /*
        Posteriormente:

        sendToESP32({
            command: "stop"
        });
    */
}


/* =========================================
   ESTADO
========================================= */

function updateVehicleStatus() {

    const status = document.getElementById("vehicleStatus");
    const dot = document.getElementById("vehicleStatusDot");

    status.textContent = currentMovement;

    if (currentMovement === "DETENIDO") {

        dot.style.background = "#5f6976";
        dot.style.boxShadow = "0 0 10px #5f6976";

    } else {

        dot.style.background = "#258be8";
        dot.style.boxShadow = "0 0 15px #258be8";
    }
}


/* =========================================
   VELOCIDAD
========================================= */

function changeSpeed(value) {

    speed = value;

    document.getElementById("speedLabel").textContent =
        value + "%";

    document.getElementById("speedValue").textContent =
        value + "%";

    /*
        Posteriormente:

        sendToESP32({
            command: "speed",
            value: value
        });
    */
}


/* =========================================
   LUCES
========================================= */

function toggleLights() {

    lightsOn = !lightsOn;

    const state = document.getElementById("lightsState");
    const button = document.getElementById("lightsBtn");

    if (lightsOn) {

        state.textContent = "ENCENDIDAS";

        button.style.borderColor = "#258be8";
        button.style.background = "#132b45";

    } else {

        state.textContent = "APAGADAS";

        button.style.borderColor = "";
        button.style.background = "";
    }

    /*
        Posteriormente:

        sendToESP32({
            command: "lights",
            value: lightsOn
        });
    */
}


/* =========================================
   BOCINA
========================================= */

function horn() {

    /*
        Posteriormente:

        sendToESP32({
            command: "horn"
        });
    */

    const originalTitle = document.title;

    document.title = "🔊 BOCINA · ROBO-COC";

    setTimeout(() => {
        document.title = originalTitle;
    }, 700);
}


/* =========================================
   DIRECCIONALES
========================================= */

function toggleSignal(side) {

    if (side === "left") {

        leftSignalOn = !leftSignalOn;

        const button =
            document.getElementById("leftSignalBtn");

        button.style.borderColor =
            leftSignalOn ? "#258be8" : "";

    }

    if (side === "right") {

        rightSignalOn = !rightSignalOn;

        const button =
            document.getElementById("rightSignalBtn");

        button.style.borderColor =
            rightSignalOn ? "#258be8" : "";

    }

    /*
        Posteriormente:

        sendToESP32({
            command: "signal",
            side: side
        });
    */
}


/* =========================================
   EMERGENCIA
========================================= */

function toggleEmergency() {

    emergencyOn = !emergencyOn;

    const button =
        document.getElementById("emergencyBtn");

    if (emergencyOn) {

        button.style.borderColor = "#258be8";
        button.style.background = "#132b45";

    } else {

        button.style.borderColor = "";
        button.style.background = "";
    }

    /*
        Posteriormente:

        sendToESP32({
            command: "emergency",
            value: emergencyOn
        });
    */
}


/* =========================================
   MODO DE CONDUCCIÓN
========================================= */

function setMode(mode) {

    const manual =
        document.getElementById("manualMode");

    const automatic =
        document.getElementById("autoMode");

    if (mode === "manual") {

        manual.classList.add("active");
        automatic.classList.remove("active");

    } else {

        automatic.classList.add("active");
        manual.classList.remove("active");
    }

    /*
        Posteriormente:

        sendToESP32({
            command: "mode",
            value: mode
        });
    */
}


/* =========================================
   TECLADO
========================================= */

document.addEventListener("keydown", function(event) {

    const key = event.key.toLowerCase();

    if (
        key === "w" ||
        key === "a" ||
        key === "s" ||
        key === "d" ||
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright"
    ) {

        event.preventDefault();
    }

    switch (key) {

        case "w":
        case "arrowup":
            move("forward");
            break;

        case "s":
        case "arrowdown":
            move("backward");
            break;

        case "a":
        case "arrowleft":
            move("left");
            break;

        case "d":
        case "arrowright":
            move("right");
            break;

        case " ":
            stopCar();
            break;
    }

});


/* =========================================
   SOLTAR TECLA
========================================= */

document.addEventListener("keyup", function(event) {

    const key = event.key.toLowerCase();

    if (
        key === "w" ||
        key === "a" ||
        key === "s" ||
        key === "d" ||
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright"
    ) {

        stopCar();
    }

});


/* =========================================
   FUNCIÓN PREPARADA PARA ESP32
========================================= */

function sendToESP32(data) {

    /*
        ESTA FUNCIÓN ESTÁ PREPARADA PARA
        LA FUTURA CONEXIÓN CON EL ESP32.

        Por ejemplo, cuando el ESP32 tenga
        una IP como:

        http://192.168.4.1

        podremos hacer:

        fetch("http://192.168.4.1/control", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        NO SE ACTIVA TODAVÍA porque primero
        necesitamos definir el código del ESP32.
    */

    console.log("Comando para ESP32:", data);
}