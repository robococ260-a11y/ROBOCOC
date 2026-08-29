/* ==========================================
   CONFIGURACIÓN ESP32
========================================== */

// Cuando conectemos el ESP32,
// cambiaremos esta dirección por la IP real.
//
// Ejemplo:
// const ESP32_IP = "192.168.4.1";

const ESP32_IP = "";

let esp32Connected = false;


/* ==========================================
   ESTADOS
========================================== */

let speed = 70;

let lights = false;
let leftSignal = false;
let rightSignal = false;
let emergency = false;

let currentMode = "manual";


/* ==========================================
   CONEXIÓN CON ESP32
========================================== */

async function sendCommand(command) {

    console.log("Comando:", command);

    /*
        FUTURA CONEXIÓN ESP32

        Cuando tengamos la IP del ESP32,
        podremos utilizar algo como:

        fetch(`http://${ESP32_IP}/${command}`)
            .then(response => response.text())
            .then(data => console.log(data))
            .catch(error => console.log(error));
    */

    if (!ESP32_IP) {
        return;
    }

    try {

        const response = await fetch(
            `http://${ESP32_IP}/${command}`
        );

        const data = await response.text();

        console.log("ESP32:", data);

        setConnection(true);

    } catch (error) {

        console.error("Error ESP32:", error);

        setConnection(false);

    }
}


/* ==========================================
   ESTADO ESP32
========================================== */

function setConnection(status) {

    esp32Connected = status;

    const dot = document.getElementById("connectionDot");
    const text = document.getElementById("connectionText");

    if (status) {

        dot.style.background = "#6f879b";
        text.textContent = "CONECTADO";

    } else {

        dot.style.background = "#77818a";
        text.textContent = "DESCONECTADO";

    }
}


/* ==========================================
   MOVIMIENTO
========================================== */

function move(direction) {

    const vehicleStatus =
        document.getElementById("vehicleStatus");

    if (vehicleStatus) {
        vehicleStatus.textContent =
            direction.toUpperCase();
    }

    console.log("Movimiento:", direction);

    sendCommand(`move?direction=${direction}&speed=${speed}`);
}


function stopCar() {

    const vehicleStatus =
        document.getElementById("vehicleStatus");

    if (vehicleStatus) {
        vehicleStatus.textContent = "DETENIDO";
    }

    console.log("STOP");

    sendCommand("stop");
}


/* ==========================================
   VELOCIDAD
========================================== */

function changeSpeed(value) {

    speed = Number(value);

    document.getElementById("speedValue")
        .textContent = `${speed}%`;

    document.getElementById("speedLabel")
        .textContent = `${speed}%`;

    sendCommand(`speed?value=${speed}`);
}


/* ==========================================
   LUCES
========================================== */

function toggleLights() {

    lights = !lights;

    const state =
        document.getElementById("lightsState");

    state.textContent =
        lights ? "ENCENDIDAS" : "APAGADAS";

    sendCommand(
        `lights?state=${lights ? 1 : 0}`
    );
}


/* ==========================================
   BOCINA
========================================== */

function horn() {

    console.log("Bocina");

    sendCommand("horn");

}


/* ==========================================
   DIRECCIONALES
========================================== */

function toggleSignal(side) {

    if (side === "left") {

        leftSignal = !leftSignal;

        sendCommand(
            `signal?side=left&state=${leftSignal ? 1 : 0}`
        );

    }

    if (side === "right") {

        rightSignal = !rightSignal;

        sendCommand(
            `signal?side=right&state=${rightSignal ? 1 : 0}`
        );

    }

}


/* ==========================================
   EMERGENCIA
========================================== */

function toggleEmergency() {

    emergency = !emergency;

    console.log(
        "Emergencia:",
        emergency
    );

    sendCommand(
        `emergency?state=${emergency ? 1 : 0}`
    );

}


/* ==========================================
   MODO
========================================== */

function setMode(mode) {

    currentMode = mode;

    const manual =
        document.getElementById("manualMode");

    const automatic =
        document.getElementById("autoMode");

    manual.classList.remove("active");
    automatic.classList.remove("active");

    if (mode === "manual") {

        manual.classList.add("active");

    } else {

        automatic.classList.add("active");

    }

    console.log("Modo:", mode);

    sendCommand(`mode?type=${mode}`);

}


/* ==========================================
   SENSORES
========================================== */

function updateFrontSensor(distance) {

    document.getElementById("frontDistance")
        .textContent = `${distance} cm`;

    document.getElementById("sensorFrontBig")
        .textContent = distance;

    let percentage =
        Math.min(Math.max(distance, 0), 100);

    document.getElementById("frontBar")
        .style.width = `${percentage}%`;

}


function updateRearSensor(distance) {

    document.getElementById("rearDistance")
        .textContent = `${distance} cm`;

    document.getElementById("sensorRearBig")
        .textContent = distance;

    let percentage =
        Math.min(Math.max(distance, 0), 100);

    document.getElementById("rearBar")
        .style.width = `${percentage}%`;

}


/* ==========================================
   TECLADO
========================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA"
        ) {
            return;
        }

        switch (event.key.toLowerCase()) {

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

    }
);


/* ==========================================
   DATOS DE PRUEBA
========================================== */

// Estos valores son solamente para comprobar
// visualmente el funcionamiento de la página.
// Cuando conectemos el ESP32 serán sustituidos
// por datos reales.

function demoSensors() {

    const front =
        Math.floor(Math.random() * 80) + 20;

    const rear =
        Math.floor(Math.random() * 80) + 20;

    updateFrontSensor(front);

    updateRearSensor(rear);

}


setInterval(demoSensors, 3000);


/* ==========================================
   INICIO
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        changeSpeed(70);

        setConnection(false);

        console.log(
            "ROBO-COC iniciado correctamente."
        );

        console.log(
            "Sistema preparado para ESP32 + L298N."
        );

    }
);