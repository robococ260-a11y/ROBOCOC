/* =========================================================
   ROBO-COC
   CONEXIÓN REAL ENTRE PAGINA WEB Y ESP32
   ========================================================= */


// =========================================================
// VARIABLES
// =========================================================

let speed = 70;

let currentMovement = "DETENIDO";

let currentCommand = "S";

let movementTimer = null;

let lightsOn = false;

let leftSignalOn = false;

let rightSignalOn = false;

let emergencyOn = false;

let currentMode = "manual";


// =========================================================
// COMANDOS
// =========================================================

const COMMANDS = {

    forward: "F",

    backward: "B",

    left: "L",

    right: "R"

};


const MOVEMENT_NAMES = {

    F: "AVANZANDO",

    B: "RETROCEDIENDO",

    L: "GIRO IZQUIERDA",

    R: "GIRO DERECHA",

    S: "DETENIDO",

    BR: "FRENANDO"

};


// =========================================================
// PETICIONES AL ESP32
// =========================================================

async function esp32Request(path) {

    try {

        const response =
            await fetch(
                path,
                {
                    method: "GET",

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }


        setConnection(true);


        return response;

    }

    catch (error) {

        setConnection(false);


        console.error(
            "Error ESP32:",
            error
        );


        throw error;
    }
}


// =========================================================
// CONEXION
// =========================================================

function setConnection(connected) {

    const text =
        document.getElementById(
            "connectionText"
        );


    const dot =
        document.getElementById(
            "connectionDot"
        );


    if (!text || !dot) {

        return;
    }


    if (connected) {

        text.textContent =
            "CONECTADO";


        dot.style.background =
            "#22c55e";


        dot.style.boxShadow =
            "0 0 12px #22c55e";

    }

    else {

        text.textContent =
            "DESCONECTADO";


        dot.style.background =
            "#ef4444";


        dot.style.boxShadow =
            "0 0 12px #ef4444";
    }
}


// =========================================================
// MOVIMIENTO
// =========================================================

function move(direction) {

    const command =
        COMMANDS[direction];


    if (!command) {

        return;
    }


    startMove(command);
}


// =========================================================
// INICIAR MOVIMIENTO
// =========================================================

function startMove(command) {

    if (
        currentMode !== "manual"
        ||
        emergencyOn
    ) {

        return;
    }


    stopMove(false);


    currentCommand =
        command;


    currentMovement =
        MOVEMENT_NAMES[command]
        ||
        "DETENIDO";


    updateVehicleStatus();


    esp32Request(
        "/cmd?m=" +
        encodeURIComponent(command)
    ).catch(() => {});


    /*
       Se vuelve a mandar el comando
       mientras mantienes presionado
       el botón.
    */

    movementTimer =
        setInterval(
            function () {

                esp32Request(
                    "/cmd?m=" +
                    encodeURIComponent(command)
                ).catch(() => {});

            },
            250
        );
}


// =========================================================
// DETENER MOVIMIENTO
// =========================================================

function stopMove(
    sendStop = true
) {

    if (movementTimer) {

        clearInterval(
            movementTimer
        );


        movementTimer = null;
    }


    currentCommand = "S";

    currentMovement =
        "DETENIDO";


    updateVehicleStatus();


    if (sendStop) {

        esp32Request(
            "/cmd?m=S"
        ).catch(() => {});
    }
}


// =========================================================
// BOTON STOP
// =========================================================

function stopCar() {

    stopMove(true);
}


// =========================================================
// FRENO
// =========================================================

function brake() {

    stopMove(false);


    currentCommand =
        "BR";


    currentMovement =
        "FRENANDO";


    updateVehicleStatus();


    esp32Request(
        "/cmd?m=BR"
    ).catch(() => {});
}


// =========================================================
// ESTADO VISUAL
// =========================================================

function updateVehicleStatus() {

    const status =
        document.getElementById(
            "vehicleStatus"
        );


    const dot =
        document.getElementById(
            "vehicleStatusDot"
        );


    if (!status || !dot) {

        return;
    }


    // EMERGENCIA

    if (emergencyOn) {

        status.textContent =
            "EMERGENCIA";


        dot.style.background =
            "#ef4444";


        dot.style.boxShadow =
            "0 0 15px #ef4444";


        return;
    }


    // AUTOMATICO

    if (
        currentMode !== "manual"
    ) {

        status.textContent =
            "MODO AUTOMÁTICO";


        dot.style.background =
            "#f59e0b";


        dot.style.boxShadow =
            "0 0 15px #f59e0b";


        return;
    }


    status.textContent =
        currentMovement;


    if (
        currentMovement ===
        "DETENIDO"
    ) {

        dot.style.background =
            "#5f6976";


        dot.style.boxShadow =
            "0 0 10px #5f6976";

    }

    else {

        dot.style.background =
            "#258be8";


        dot.style.boxShadow =
            "0 0 15px #258be8";
    }
}


// =========================================================
// VELOCIDAD
// =========================================================

function changeSpeed(value) {

    speed =
        Number(value);


    const label =
        document.getElementById(
            "speedLabel"
        );


    const valueBox =
        document.getElementById(
            "speedValue"
        );


    if (label) {

        label.textContent =
            speed + "%";
    }


    if (valueBox) {

        valueBox.textContent =
            speed + "%";
    }


    esp32Request(
        "/speed?v=" +
        encodeURIComponent(speed)
    ).catch(() => {});
}


// =========================================================
// LUCES
// =========================================================

async function toggleLights() {

    try {

        const response =
            await esp32Request(
                "/light?toggle=1"
            );


        const state =
            (
                await response.text()
            )
            .trim()
            .toUpperCase();


        lightsOn =
            state === "ON";


        updateLightsUI();

    }

    catch (error) {

    }
}


// =========================================================
// ACTUALIZAR LUCES
// =========================================================

function updateLightsUI() {

    const state =
        document.getElementById(
            "lightsState"
        );


    const button =
        document.getElementById(
            "lightsBtn"
        );


    if (!state || !button) {

        return;
    }


    state.textContent =
        lightsOn
        ? "ENCENDIDAS"
        : "APAGADAS";


    button.style.borderColor =
        lightsOn
        ? "#258be8"
        : "";


    button.style.background =
        lightsOn
        ? "#132b45"
        : "";
}


// =========================================================
// BOCINA
// =========================================================

function horn() {

    hornOn();


    setTimeout(
        function () {

            hornOff();

        },
        400
    );
}


function hornOn() {

    esp32Request(
        "/horn?state=on"
    ).catch(() => {});
}


function hornOff() {

    esp32Request(
        "/horn?state=off"
    ).catch(() => {});
}


// =========================================================
// DIRECCIONALES
// =========================================================

function toggleSignal(side) {

    let nextSignal =
        "off";


    if (
        side === "left"
    ) {

        nextSignal =
            leftSignalOn
            ? "off"
            : "left";
    }


    else if (
        side === "right"
    ) {

        nextSignal =
            rightSignalOn
            ? "off"
            : "right";
    }


    esp32Request(
        "/signal?s=" +
        encodeURIComponent(
            nextSignal
        )
    )

    .then(
        function () {

            leftSignalOn =
                nextSignal ===
                "left";


            rightSignalOn =
                nextSignal ===
                "right";


            updateSignalUI();
        }
    )

    .catch(() => {});
}


// =========================================================
// INTERFAZ DIRECCIONALES
// =========================================================

function updateSignalUI() {

    const leftBtn =
        document.getElementById(
            "leftSignalBtn"
        );


    const rightBtn =
        document.getElementById(
            "rightSignalBtn"
        );


    if (leftBtn) {

        leftBtn.style.borderColor =
            leftSignalOn
            ? "#258be8"
            : "";


        const small =
            leftBtn.querySelector(
                "small"
            );


        if (small) {

            small.textContent =
                leftSignalOn
                ? "ENCENDIDA"
                : "APAGADA";
        }
    }


    if (rightBtn) {

        rightBtn.style.borderColor =
            rightSignalOn
            ? "#258be8"
            : "";


        const small =
            rightBtn.querySelector(
                "small"
            );


        if (small) {

            small.textContent =
                rightSignalOn
                ? "ENCENDIDA"
                : "APAGADA";
        }
    }
}


// =========================================================
// EMERGENCIA
// =========================================================

function toggleEmergency() {

    const newState =
        !emergencyOn;


    if (newState) {

        stopMove(false);
    }


    esp32Request(

        "/emergency?state=" +
        (
            newState
            ? "on"
            : "off"
        )

    )

    .then(
        function () {

            emergencyOn =
                newState;


            updateEmergencyUI();


            updateVehicleStatus();
        }
    )

    .catch(() => {});
}


// =========================================================
// INTERFAZ EMERGENCIA
// =========================================================

function updateEmergencyUI() {

    const button =
        document.getElementById(
            "emergencyBtn"
        );


    if (!button) {

        return;
    }


    button.style.borderColor =
        emergencyOn
        ? "#ef4444"
        : "";


    button.style.background =
        emergencyOn
        ? "#3b1118"
        : "";


    const small =
        button.querySelector(
            "small"
        );


    if (small) {

        small.textContent =
            emergencyOn
            ? "ACTIVADA"
            : "APAGADA";
    }
}


// =========================================================
// MODO MANUAL / AUTOMATICO
// =========================================================

function setMode(mode) {

    const wantedMode =

        (
            mode === "automatic"
            ||
            mode === "auto"
        )

        ? "automatic"
        : "manual";


    stopMove(true);


    esp32Request(

        "/mode?m=" +

        (
            wantedMode ===
            "automatic"

            ? "auto"
            : "manual"
        )

    )

    .then(
        function () {

            currentMode =
                wantedMode;


            updateModeUI();


            updateVehicleStatus();
        }
    )

    .catch(() => {});
}


// =========================================================
// INTERFAZ MODO
// =========================================================

function updateModeUI() {

    const manual =
        document.getElementById(
            "manualMode"
        );


    const automatic =
        document.getElementById(
            "autoMode"
        );


    if (
        !manual ||
        !automatic
    ) {

        return;
    }


    if (
        currentMode ===
        "manual"
    ) {

        manual.classList.add(
            "active"
        );


        automatic.classList.remove(
            "active"
        );

    }

    else {

        automatic.classList.add(
            "active"
        );


        manual.classList.remove(
            "active"
        );
    }
}


// =========================================================
// DISTANCIAS
// =========================================================

function setDistance(
    prefix,
    value
) {

    const valid =

        typeof value ===
        "number"

        &&
        value >= 0;


    const text =

        valid

        ? value.toFixed(1) +
          " cm"

        : "-- cm";


    const number =

        valid

        ? value.toFixed(1)

        : "--";


    const telemetry =
        document.getElementById(

            prefix === "front"

            ? "frontDistance"

            : "rearDistance"
        );


    const big =
        document.getElementById(

            prefix === "front"

            ? "sensorFrontBig"

            : "sensorRearBig"
        );


    const bar =
        document.getElementById(

            prefix === "front"

            ? "frontBar"

            : "rearBar"
        );


    if (telemetry) {

        telemetry.textContent =
            text;
    }


    if (big) {

        big.textContent =
            number;
    }


    if (bar) {

        const percent =

            valid

            ? Math.max(
                0,
                Math.min(
                    value,
                    100
                )
            )

            : 0;


        bar.style.width =
            percent + "%";
    }
}


// =========================================================
// ACTUALIZAR DATOS ESP32
// =========================================================

async function updateStatus() {

    try {

        const response =
            await esp32Request(
                "/status"
            );


        const data =
            await response.json();


        // VELOCIDAD

        speed =
            Number(
                data.speed ??
                speed
            );


        const slider =
            document.getElementById(
                "speedSlider"
            );


        const speedLabel =
            document.getElementById(
                "speedLabel"
            );


        const speedValue =
            document.getElementById(
                "speedValue"
            );


        if (slider) {

            slider.value =
                speed;
        }


        if (speedLabel) {

            speedLabel.textContent =
                speed + "%";
        }


        if (speedValue) {

            speedValue.textContent =
                speed + "%";
        }


        // SENSORES

        setDistance(
            "front",
            Number(
                data.front
            )
        );


        setDistance(
            "rear",
            Number(
                data.rear
            )
        );


        // LUCES

        lightsOn =
            Boolean(
                data.lights
            );


        // EMERGENCIA

        emergencyOn =
            Boolean(
                data.emergency
            );


        // MODO

        const modeText =
            String(
                data.mode || ""
            )
            .toLowerCase();


        currentMode =

            modeText.includes(
                "auto"
            )

            ? "automatic"

            : "manual";


        // DIRECCIONALES

        const signal =

            String(
                data.signal ||
                "off"
            )

            .toLowerCase();


        leftSignalOn =
            signal ===
            "left";


        rightSignalOn =
            signal ===
            "right";


        // ACTUALIZAR PANTALLA

        updateLightsUI();

        updateSignalUI();

        updateEmergencyUI();

        updateModeUI();

        updateVehicleStatus();

    }

    catch (error) {

    }
}


// =========================================================
// TECLADO
// =========================================================

const KEY_COMMANDS = {

    "w": "F",

    "arrowup": "F",

    "s": "B",

    "arrowdown": "B",

    "a": "L",

    "arrowleft": "L",

    "d": "R",

    "arrowright": "R"
};


// =========================================================
// TECLA PRESIONADA
// =========================================================

document.addEventListener(

    "keydown",

    function (event) {

        const key =
            event.key.toLowerCase();


        const command =
            KEY_COMMANDS[key];


        if (command) {

            event.preventDefault();


            if (
                currentCommand !==
                command
            ) {

                startMove(
                    command
                );
            }


            return;
        }


        // ESPACIO = STOP

        if (
            key === " "
        ) {

            event.preventDefault();


            stopCar();
        }
    }
);


// =========================================================
// SOLTAR TECLA
// =========================================================

document.addEventListener(

    "keyup",

    function (event) {

        const key =
            event.key.toLowerCase();


        const command =
            KEY_COMMANDS[key];


        if (command) {

            event.preventDefault();


            if (
                currentCommand ===
                command
            ) {

                stopMove(true);
            }
        }
    }
);


// =========================================================
// CONFIGURAR BOTONES DE MOVIMIENTO
// =========================================================

function configureMovementButtons() {

    const buttons = [

        {
            selector:
                ".direction.up",

            command:
                "F"
        },

        {
            selector:
                ".direction.down",

            command:
                "B"
        },

        {
            selector:
                ".direction.left",

            command:
                "L"
        },

        {
            selector:
                ".direction.right",

            command:
                "R"
        }

    ];


    buttons.forEach(
        function (item) {

            const button =
                document.querySelector(
                    item.selector
                );


            if (!button) {

                return;
            }


            // Quitar onclick anterior

            button.onclick =
                null;


            button.removeAttribute(
                "onclick"
            );


            button.style.touchAction =
                "none";


            // PRESIONAR

            button.addEventListener(

                "pointerdown",

                function (event) {

                    event.preventDefault();


                    startMove(
                        item.command
                    );
                }
            );


            // SOLTAR

            button.addEventListener(

                "pointerup",

                function () {

                    stopMove(true);
                }
            );


            // SALIR DEL BOTON

            button.addEventListener(

                "pointerleave",

                function () {

                    if (
                        currentCommand ===
                        item.command
                    ) {

                        stopMove(true);
                    }
                }
            );


            // CANCELAR

            button.addEventListener(

                "pointercancel",

                function () {

                    stopMove(true);
                }
            );
        }
    );
}


// =========================================================
// CONFIGURAR BOCINA
// =========================================================

function configureHornButton() {

    const button =
        document.querySelector(
            'button[onclick="horn()"]'
        );


    if (!button) {

        return;
    }


    button.onclick =
        null;


    button.removeAttribute(
        "onclick"
    );


    button.style.touchAction =
        "none";


    button.addEventListener(

        "pointerdown",

        function (event) {

            event.preventDefault();

            hornOn();
        }
    );


    button.addEventListener(

        "pointerup",

        hornOff
    );


    button.addEventListener(

        "pointerleave",

        hornOff
    );


    button.addEventListener(

        "pointercancel",

        hornOff
    );
}


// =========================================================
// CONFIGURAR FRENO
// =========================================================

function configureBrakeButton() {

    const button =
        document.querySelector(
            ".brake-button"
        );


    if (!button) {

        return;
    }


    button.onclick =
        null;


    button.removeAttribute(
        "onclick"
    );


    button.style.touchAction =
        "none";


    button.addEventListener(

        "pointerdown",

        function (event) {

            event.preventDefault();

            brake();
        }
    );


    button.addEventListener(

        "pointerup",

        stopCar
    );


    button.addEventListener(

        "pointerleave",

        stopCar
    );


    button.addEventListener(

        "pointercancel",

        stopCar
    );
}


// =========================================================
// SEGURIDAD
// =========================================================

window.addEventListener(

    "blur",

    function () {

        if (
            currentCommand !==
            "S"
        ) {

            stopMove(true);
        }


        hornOff();
    }
);


document.addEventListener(

    "visibilitychange",

    function () {

        if (
            document.hidden
        ) {

            if (
                currentCommand !==
                "S"
            ) {

                stopMove(true);
            }


            hornOff();
        }
    }
);


// =========================================================
// INICIO
// =========================================================

document.addEventListener(

    "DOMContentLoaded",

    function () {

        configureMovementButtons();

        configureHornButton();

        configureBrakeButton();


        updateVehicleStatus();

        updateLightsUI();

        updateSignalUI();

        updateEmergencyUI();

        updateModeUI();


        updateStatus();


        // ACTUALIZAR ESP32
        // CADA MEDIO SEGUNDO

        setInterval(
            updateStatus,
            500
        );
    }
);