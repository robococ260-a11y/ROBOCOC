/* =====================================================
   VARIABLES
===================================================== */

let currentSpeed = 70;
let currentMode = "manual";

let lightsOn = false;
let emergencyOn = false;

let leftSignalOn = false;
let rightSignalOn = false;


/* =====================================================
   MOVIMIENTO
===================================================== */

function move(direction) {

    const status =
        document.getElementById("vehicleStatus");


    const names = {

        forward: "AVANZANDO",

        backward: "RETROCEDIENDO",

        left: "GIRANDO IZQUIERDA",

        right: "GIRANDO DERECHA"

    };


    status.textContent =
        names[direction] || "EN MOVIMIENTO";


    console.log(
        "Movimiento:",
        direction
    );


    console.log(
        "Velocidad:",
        currentSpeed + "%"
    );

}


/* =====================================================
   DETENER
===================================================== */

function stopCar() {

    document.getElementById(
        "vehicleStatus"
    ).textContent = "DETENIDO";


    console.log(
        "Vehículo detenido"
    );

}


/* =====================================================
   VELOCIDAD
===================================================== */

function changeSpeed(value) {

    currentSpeed = value;


    document.getElementById(
        "speedLabel"
    ).textContent = value + "%";


    document.getElementById(
        "speedValue"
    ).textContent = value + "%";

}


/* =====================================================
   LUCES
===================================================== */

function toggleLights() {

    lightsOn = !lightsOn;


    const state =
        document.getElementById(
            "lightsState"
        );


    const button =
        document.getElementById(
            "lightsBtn"
        );


    if (lightsOn) {

        state.textContent =
            "ENCENDIDAS";


        button.style.background =
            "#dce8f1";

    } else {

        state.textContent =
            "APAGADAS";


        button.style.background =
            "";

    }


    console.log(
        "Luces:",
        lightsOn ? "ON" : "OFF"
    );

}


/* =====================================================
   BOCINA
===================================================== */

function horn() {

    console.log(
        "Bocina activada"
    );


    const status =
        document.getElementById(
            "vehicleStatus"
        );


    status.textContent =
        "BOCINA";


    setTimeout(() => {

        if (
            status.textContent ===
            "BOCINA"
        ) {

            status.textContent =
                "DETENIDO";

        }

    }, 700);

}


/* =====================================================
   DIRECCIONALES
===================================================== */

function toggleSignal(side) {


    if (side === "left") {

        leftSignalOn =
            !leftSignalOn;


        const button =
            document.getElementById(
                "leftSignalBtn"
            );


        button.style.background =
            leftSignalOn
                ? "#dce8f1"
                : "";


        console.log(
            "Direccional izquierda:",
            leftSignalOn
                ? "ON"
                : "OFF"
        );

    }


    if (side === "right") {

        rightSignalOn =
            !rightSignalOn;


        const button =
            document.getElementById(
                "rightSignalBtn"
            );


        button.style.background =
            rightSignalOn
                ? "#dce8f1"
                : "";


        console.log(
            "Direccional derecha:",
            rightSignalOn
                ? "ON"
                : "OFF"
        );

    }

}


/* =====================================================
   EMERGENCIA
===================================================== */

function toggleEmergency() {

    emergencyOn =
        !emergencyOn;


    const button =
        document.getElementById(
            "emergencyBtn"
        );


    const small =
        button.querySelector(
            "small"
        );


    if (emergencyOn) {

        small.textContent =
            "ACTIVADA";


        button.style.background =
            "#dce8f1";

    } else {

        small.textContent =
            "APAGADA";


        button.style.background =
            "";

    }


    console.log(
        "Emergencia:",
        emergencyOn
            ? "ON"
            : "OFF"
    );

}


/* =====================================================
   MODO DE CONDUCCIÓN
===================================================== */

function setMode(mode) {

    currentMode = mode;


    const manual =
        document.getElementById(
            "manualMode"
        );


    const automatic =
        document.getElementById(
            "autoMode"
        );


    manual.classList.remove(
        "active"
    );


    automatic.classList.remove(
        "active"
    );


    if (mode === "manual") {

        manual.classList.add(
            "active"
        );

    } else {

        automatic.classList.add(
            "active"
        );

    }


    console.log(
        "Modo:",
        mode
    );

}


/* =====================================================
   TECLADO
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();


        if (
            key === "w" ||
            key === "arrowup"
        ) {

            event.preventDefault();

            move("forward");

        }


        if (
            key === "s" ||
            key === "arrowdown"
        ) {

            event.preventDefault();

            move("backward");

        }


        if (
            key === "a" ||
            key === "arrowleft"
        ) {

            event.preventDefault();

            move("left");

        }


        if (
            key === "d" ||
            key === "arrowright"
        ) {

            event.preventDefault();

            move("right");

        }


        if (key === " ") {

            event.preventDefault();

            stopCar();

        }

    }
);


/* =====================================================
   SENSORES DEMO
===================================================== */

function demoSensors() {


    const front =
        Math.floor(
            Math.random() * 101
        );


    const rear =
        Math.floor(
            Math.random() * 101
        );


    document.getElementById(
        "frontDistance"
    ).textContent =
        front + " cm";


    document.getElementById(
        "rearDistance"
    ).textContent =
        rear + " cm";


    document.getElementById(
        "sensorFrontBig"
    ).textContent =
        front;


    document.getElementById(
        "sensorRearBig"
    ).textContent =
        rear;


    document.getElementById(
        "frontBar"
    ).style.width =
        front + "%";


    document.getElementById(
        "rearBar"
    ).style.width =
        rear + "%";

}


/* =====================================================
   BATERÍA DEMO
===================================================== */

function demoBattery() {


    const battery =
        Math.floor(
            Math.random() * 21
        ) + 75;


    document.getElementById(
        "batteryValue"
    ).textContent =
        battery + " %";

}


/* =====================================================
   INICIO
===================================================== */

window.addEventListener(
    "load",
    function() {

        changeSpeed(70);

        demoSensors();

        demoBattery();

    }
);