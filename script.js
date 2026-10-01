const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;


/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const WORLD_WIDTH = 3600;

const WORLD_HEIGHT = 700;

const GRAVITY = 1300;

const SPEED = 250;

const JUMP = 530;

let running = false;

let gameOver = false;

let lastTime = performance.now();

const keys = {};


/* =====================================================
   TECLADO
===================================================== */

window.addEventListener("keydown", e => {

    keys[e.code] = true;

    if (
        [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Space"
        ].includes(e.code)
    ) {
        e.preventDefault();
    }
});

window.addEventListener("keyup", e => {

    keys[e.code] = false;

});


/* =====================================================
   CÂMERA
===================================================== */

const camera = {
    x: 0
};


/* =====================================================
   PLATAFORMAS
===================================================== */

const platforms = [

    {
        x: 0,
        y: 610,
        width: 700,
        height: 90
    },

    {
        x: 850,
        y: 610,
        width: 500,
        height: 90
    },

    {
        x: 1500,
        y: 610,
        width: 550,
        height: 90
    },

    {
        x: 2200,
        y: 610,
        width: 500,
        height: 90
    },

    {
        x: 2850,
        y: 610,
        width: 750,
        height: 90
    },

    /* plataformas superiores */

    {
        x: 300,
        y: 470,
        width: 220,
        height: 25
    },

    {
        x: 590,
        y: 380,
        width: 180,
        height: 25
    },

    {
        x: 960,
        y: 450,
        width: 220,
        height: 25
    },

    {
        x: 1250,
        y: 340,
        width: 180,
        height: 25
    },

    {
        x: 1580,
        y: 460,
        width: 220,
        height: 25
    },

    {
        x: 1850,
        y: 360,
        width: 200,
        height: 25
    },

    {
        x: 2320,
        y: 440,
        width: 230,
        height: 25
    },

    {
        x: 2600,
        y: 330,
        width: 180,
        height: 25
    },

    {
        x: 3000,
        y: 460,
        width: 200,
        height: 25
    }

];


/* =====================================================
   JOGADORES
===================================================== */

function createPlayer(
    x,
    color,
    name
) {

    return {

        x,
        y: 500,

        width: 30,
        height: 48,

        vx: 0,
        vy: 0,

        color,

        name,

        hp: 3,

        energy: 0,

        grounded: false,

        direction: 1,

        attackTime: 0,

        attackCooldown: 0,

        invulnerable: 0

    };

}

const p1 =
    createPlayer(
        120,
        "#00aaff",
        "P1"
    );

const p2 =
    createPlayer(
        175,
        "#ff315d",
        "P2"
    );


/* =====================================================
   GERADORES
===================================================== */

const generators = [

    {
        x: 700,
        y: 510,
        active: false
    },

    {
        x: 1400,
        y: 510,
        active: false
    },

    {
        x: 2150,
        y: 510,
        active: false
    }

];


/* =====================================================
   PORTAL
===================================================== */

const portal = {

    x: 3380,

    y: 460,

    width: 100,

    height: 150

};


/* =====================================================
   INIMIGOS
===================================================== */

const enemies = [

    {
        x: 400,
        y: 560,
        width: 35,
        height: 45,
        speed: 70,
        direction: 1,
        alive: true
    },

    {
        x: 1050,
        y: 560,
        width: 35,
        height: 45,
        speed: 80,
        direction: -1,
        alive: true
    },

    {
        x: 1700,
        y: 560,
        width: 35,
        height: 45,
        speed: 90,
        direction: 1,
        alive: true
    },

    {
        x: 2400,
        y: 560,
        width: 35,
        height: 45,
        speed: 85,
        direction: -1,
        alive: true
    },

    {
        x: 3100,
        y: 560,
        width: 35,
        height: 45,
        speed: 100,
        direction: 1,
        alive: true
    }

];


/* =====================================================
   PARTÍCULAS
===================================================== */

const particles = [];

function particle(
    x,
    y,
    color
) {

    particles.push({

        x,
        y,

        vx:
            (Math.random() - .5)
            * 180,

        vy:
            (Math.random() - .5)
            * 180,

        life: .5,

        color

    });

}


/* =====================================================
   COLISÃO
===================================================== */

function intersects(
    a,
    b
) {

    return (

        a.x < b.x + b.width &&

        a.x + a.width > b.x &&

        a.y < b.y + b.height &&

        a.y + a.height > b.y

    );

}


function worldCollision(
    player,
    nextX,
    nextY
) {

    const box = {

        x: nextX,

        y: nextY,

        width: player.width,

        height: player.height

    };

    for (
        const platform of platforms
    ) {

        if (
            intersects(
                box,
                platform
            )
        ) {

            return platform;

        }

    }

    return null;

}


/* =====================================================
   PLAYER UPDATE
===================================================== */

function updatePlayer(
    player,
    dt,
    control
) {

    player.vx = 0;

    if (
        keys[control.left]
    ) {

        player.vx =
            -SPEED;

        player.direction =
            -1;

    }

    if (
        keys[control.right]
    ) {

        player.vx =
            SPEED;

        player.direction =
            1;

    }

    /*
       Gravidade
    */

    player.vy +=
        GRAVITY * dt;

    /*
       Pulo
    */

    if (
        keys[control.jump] &&
        player.grounded
    ) {

        player.vy =
            -JUMP;

        player.grounded =
            false;

        for (
            let i = 0;
            i < 8;
            i++
        ) {

            particle(
                player.x + 15,
                player.y + 48,
                "#00d9ff"
            );

        }

    }

    /*
       Movimento horizontal
    */

    let nextX =
        player.x +
        player.vx * dt;

    if (
        !worldCollision(
            player,
            nextX,
            player.y
        )
    ) {

        player.x =
            nextX;

    }

    /*
       Movimento vertical
    */

    let nextY =
        player.y +
        player.vy * dt;

    const collision =
        worldCollision(
            player,
            player.x,
            nextY
        );

    if (!collision) {

        player.y =
            nextY;

        player.grounded =
            false;

    } else {

        if (
            player.vy > 0
        ) {

            player.y =
                collision.y -
                player.height;

            player.grounded =
                true;

        }

        player.vy = 0;

    }

    /*
       Ataque
    */

    player.attackCooldown -= dt;

    player.invulnerable -= dt;

    if (
        player.attackTime > 0
    ) {

        player.attackTime -= dt;

    }

    /*
       Energia
    */

    if (
        player.energy < 100
    ) {

        player.energy +=
            dt * 1.5;

    }

    /*
       Cair do mapa
    */

    if (
        player.y > WORLD_HEIGHT
    ) {

        damagePlayer(
            player
        );

    }

}


/* =====================================================
   ATAQUE
===================================================== */

function attack(
    player
) {

    if (
        player.attackCooldown > 0
    ) {

        return;

    }

    player.attackCooldown =
        .45;

    player.attackTime =
        .18;

    const hitbox = {

        x:
            player.x +
            (
                player.direction === 1
                    ? player.width
                    : -55
            ),

        y:
            player.y + 10,

        width: 55,

        height: 35

    };

    for (
        const enemy of enemies
    ) {

        if (
            !enemy.alive
        ) continue;

        if (
            intersects(
                hitbox,
                enemy
            )
        ) {

            enemy.alive =
                false;

            player.energy +=
                15;

            for (
                let i = 0;
                i < 15;
                i++
            ) {

                particle(
                    enemy.x + 15,
                    enemy.y + 20,
                    "#ff3c76"
                );

            }

        }

    }

}


/* =====================================================
   DANO
===================================================== */

function damagePlayer(
    player
) {

    if (
        player.invulnerable > 0
    ) {

        return;

    }

    player.hp--;

    player.invulnerable =
        1.5;

    player.x =
        player.name === "P1"
            ? 120
            : 175;

    player.y =
        450;

    player.vy = 0;

    if (
        player.hp <= 0
    ) {

        if (
            p1.hp <= 0 &&
            p2.hp <= 0
        ) {

            loseGame();

        }

    }

}


/* =====================================================
   INIMIGOS
===================================================== */

function updateEnemies(dt) {

    for (
        const enemy of enemies
    ) {

        if (
            !enemy.alive
        ) continue;

        enemy.x +=
            enemy.direction *
            enemy.speed *
            dt;

        /*
           Limites simples
        */

        if (
            enemy.x < 100
        ) {

            enemy.direction = 1;

        }

        if (
            enemy.x > WORLD_WIDTH - 100
        ) {

            enemy.direction = -1;

        }

        /*
           Perseguir jogadores
        */

        const distance1 =
            Math.abs(
                enemy.x - p1.x
            );

        const distance2 =
            Math.abs(
                enemy.x - p2.x
            );

        const target =
            distance1 < distance2
                ? p1
                : p2;

        if (
            Math.min(
                distance1,
                distance2
            ) < 250
        ) {

            enemy.direction =
                target.x >
                enemy.x
                    ? 1
                    : -1;

        }

        /*
           Ataque
        */

        if (
            Math.abs(
                enemy.x - p1.x
            ) < 35 &&
            Math.abs(
                enemy.y - p1.y
            ) < 60
        ) {

            damagePlayer(p1);

        }

        if (
            Math.abs(
                enemy.x - p2.x
            ) < 35 &&
            Math.abs(
                enemy.y - p2.y
            ) < 60
        ) {

            damagePlayer(p2);

        }

    }

}


/* =====================================================
   GERADORES
===================================================== */

function updateGenerators() {

    for (
        const generator of generators
    ) {

        if (
            generator.active
        ) continue;

        const nearP1 =
            Math.abs(
                p1.x -
                generator.x
            ) < 60;

        const nearP2 =
            Math.abs(
                p2.x -
                generator.x
            ) < 60;

        if (
            nearP1 ||
            nearP2
        ) {

            generator.active =
                true;

            for (
                let i = 0;
                i < 30;
                i++
            ) {

                particle(
                    generator.x,
                    generator.y,
                    "#00ffff"
                );

            }

        }

    }

}


/* =====================================================
   OBJETIVO
===================================================== */

function updateGoal() {

    const active =
        generators.filter(
            g => g.active
        ).length;

    document.getElementById(
        "objective"
    ).textContent =
        `GERADORES: ${active}/3  •  ${
            active === 3
                ? "PORTAL ATIVADO!"
                : "ATIVE OS GERADORES"
        }`;

    if (
        active < 3
    ) return;

    const p1Inside =
        p1.x >
        portal.x - 60;

    const p2Inside =
        p2.x >
        portal.x - 60;

    if (
        p1Inside &&
        p2Inside
    ) {

        winGame();

    }

}


/* =====================================================
   PARTÍCULAS
===================================================== */

function updateParticles(dt) {

    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];

        p.x +=
            p.vx * dt;

        p.y +=
            p.vy * dt;

        p.life -= dt;

        if (
            p.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }

}


/* =====================================================
   CÂMERA
===================================================== */

function updateCamera() {

    const center =
        (
            p1.x +
            p2.x
        ) / 2;

    camera.x =
        center -
        canvas.width / 2;

    camera.x =
        Math.max(
            0,

            Math.min(
                WORLD_WIDTH -
                canvas.width,

                camera.x
            )
        );

}


/* =====================================================
   FUNDO
===================================================== */

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    gradient.addColorStop(
        0,
        "#050719"
    );

    gradient.addColorStop(
        .5,
        "#101b3b"
    );

    gradient.addColorStop(
        1,
        "#090d22"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
       Lua
    */

    ctx.fillStyle =
        "#d9f5ff";

    ctx.shadowColor =
        "#66ddff";

    ctx.shadowBlur =
        35;

    ctx.beginPath();

    ctx.arc(
        1000,
        120,
        55,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;


    /*
       Estrelas
    */

    for (
        let i = 0;
        i < 90;
        i++
    ) {

        const x =
            (
                i * 137
            ) %
            canvas.width;

        const y =
            (
                i * 71
            ) %
            350;

        ctx.fillStyle =
            i % 4 === 0
                ? "#55eaff"
                : "#ffffff";

        ctx.fillRect(
            x,
            y,
            2,
            2
        );

    }

}


/* =====================================================
   CIDADE AO FUNDO
===================================================== */

function drawCity() {

    const offset =
        camera.x * .25;

    for (
        let i = 0;
        i < 30;
        i++
    ) {

        const width =
            60 +
            (i % 5) * 25;

        const height =
            100 +
            (i % 7) * 30;

        const x =
            i * 150 -
            offset;

        const y =
            610 -
            height;

        ctx.fillStyle =
            "#0b1430";

        ctx.fillRect(
            x,
            y,
            width,
            height
        );

        /*
           Janelas
        */

        for (
            let wx = x + 12;
            wx < x + width - 5;
            wx += 20
        ) {

            for (
                let wy = y + 15;
                wy < 600;
                wy += 25
            ) {

                if (
                    (
                        wx +
                        wy +
                        i
                    ) % 3 !== 0
                ) {

                    ctx.fillStyle =
                        "#14b9d8";

                    ctx.globalAlpha =
                        .35;

                    ctx.fillRect(
                        wx,
                        wy,
                        6,
                        8
                    );

                    ctx.globalAlpha =
                        1;

                }

            }

        }

    }

}


/* =====================================================
   PLATAFORMAS
===================================================== */

function drawPlatforms() {

    for (
        const platform of platforms
    ) {

        const x =
            platform.x -
            camera.x;

        if (
            x + platform.width < 0 ||
            x > canvas.width
        ) {

            continue;

        }

        /*
           metal
        */

        const gradient =
            ctx.createLinearGradient(
                0,
                platform.y,
                0,
                platform.y +
                platform.height
            );

        gradient.addColorStop(
            0,
            "#263d6c"
        );

        gradient.addColorStop(
            1,
            "#101a36"
        );

        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            platform.height
        );

        /*
           neon
        */

        ctx.fillStyle =
            "#00d9ff";

        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            4
        );

        /*
           detalhes
        */

        for (
            let i = x + 20;
            i < x + platform.width;
            i += 50
        ) {

            ctx.fillStyle =
                "#19294e";

            ctx.fillRect(
                i,
                platform.y + 12,
                22,
                4
            );

        }

    }

}


/* =====================================================
   GERADORES
===================================================== */

function drawGenerators() {

    for (
        const generator of generators
    ) {

        const x =
            generator.x -
            camera.x;

        /*
           base
        */

        ctx.fillStyle =
            "#172746";

        ctx.fillRect(
            x - 25,
            generator.y - 70,
            50,
            70
        );

        /*
           núcleo
        */

        ctx.fillStyle =
            generator.active
                ? "#00ffff"
                : "#ff315d";

        ctx.shadowColor =
            generator.active
                ? "#00ffff"
                : "#ff315d";

        ctx.shadowBlur =
            generator.active
                ? 25
                : 10;

        ctx.beginPath();

        ctx.arc(
            x,
            generator.y - 38,
            13,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        /*
           antena
        */

        ctx.strokeStyle =
            "#5c79b5";

        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.moveTo(
            x,
            generator.y - 70
        );

        ctx.lineTo(
            x,
            generator.y - 95
        );

        ctx.stroke();

    }

}


/* =====================================================
   PORTAL
===================================================== */

function drawPortal() {

    const x =
        portal.x -
        camera.x;

    const active =
        generators.every(
            g => g.active
        );

    ctx.strokeStyle =
        active
            ? "#00ffff"
            : "#444b6b";

    ctx.lineWidth = 8;

    ctx.shadowColor =
        active
            ? "#00ffff"
            : "transparent";

    ctx.shadowBlur =
        active
            ? 30
            : 0;

    ctx.beginPath();

    ctx.ellipse(
        x + 50,
        portal.y + 75,
        45,
        70,
        0,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.shadowBlur = 0;

    if (active) {

        ctx.fillStyle =
            "rgba(0,220,255,.12)";

        ctx.beginPath();

        ctx.ellipse(
            x + 50,
            portal.y + 75,
            38,
            63,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}


/* =====================================================
   INIMIGOS
===================================================== */

function drawEnemies() {

    for (
        const enemy of enemies
    ) {

        if (
            !enemy.alive
        ) continue;

        const x =
            enemy.x -
            camera.x;

        const y =
            enemy.y;

        /*
           sombra
        */

        ctx.fillStyle =
            "rgba(0,0,0,.4)";

        ctx.fillRect(
            x - 4,
            y + 42,
            44,
            5
        );

        /*
           corpo
        */

        ctx.fillStyle =
            "#d8205b";

        ctx.fillRect(
            x,
            y,
            enemy.width,
            enemy.height
        );

        /*
           cabeça
        */

        ctx.fillStyle =
            "#ff426f";

        ctx.fillRect(
            x + 4,
            y + 5,
            27,
            17
        );

        /*
           olho
        */

        ctx.fillStyle =
            "#fff";

        ctx.fillRect(
            x + (
                enemy.direction === 1
                    ? 21
                    : 7
            ),
            y + 10,
            6,
            4
        );

        /*
           antena
        */

        ctx.strokeStyle =
            "#ff315d";

        ctx.beginPath();

        ctx.moveTo(
            x + 17,
            y
        );

        ctx.lineTo(
            x + 17,
            y - 10
        );

        ctx.stroke();

    }

}


/* =====================================================
   JOGADORES
===================================================== */

function drawPlayer(
    player
) {

    const x =
        player.x -
        camera.x;

    const y =
        player.y;

    if (
        player.invulnerable > 0 &&
        Math.floor(
            performance.now() / 100
        ) % 2 === 0
    ) {

        return;

    }

    /*
       Aura
    */

    ctx.shadowColor =
        player.color;

    ctx.shadowBlur = 15;

    /*
       corpo
    */

    ctx.fillStyle =
        player.color;

    ctx.fillRect(
        x,
        y + 15,
        30,
        30
    );

    /*
       cabeça
    */

    ctx.fillStyle =
        "#dcefff";

    ctx.fillRect(
        x + 4,
        y,
        22,
        20
    );

    /*
       visor
    */

    ctx.fillStyle =
        "#07152e";

    ctx.fillRect(
        x + 7,
        y + 6,
        16,
        7
    );

    ctx.fillStyle =
        player.color;

    ctx.fillRect(
        x + 9,
        y + 8,
        12,
        3
    );

    /*
       pernas
    */

    ctx.fillStyle =
        "#273b68";

    ctx.fillRect(
        x + 3,
        y + 42,
        9,
        6
    );

    ctx.fillRect(
        x + 18,
        y + 42,
        9,
        6
    );

    ctx.shadowBlur = 0;

    /*
       nome
    */

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 11px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        player.name,
        x + 15,
        y - 8
    );

    /*
       ataque
    */

    if (
        player.attackTime > 0
    ) {

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 5;

        ctx.shadowColor =
            player.color;

        ctx.shadowBlur = 15;

        ctx.beginPath();

        ctx.arc(
            x +
            (
                player.direction === 1
                    ? 40
                    : -10
            ),
            y + 25,
            25,
            player.direction === 1
                ? -1.3
                : 2,
            player.direction === 1
                ? 1.3
                : 4.2
        );

        ctx.stroke();

        ctx.shadowBlur = 0;

    }

}


/* =====================================================
   PARTÍCULAS
===================================================== */

function drawParticles() {

    for (
        const p of particles
    ) {

        ctx.globalAlpha =
            Math.max(
                0,
                p.life * 2
            );

        ctx.fillStyle =
            p.color;

        ctx.fillRect(
            p.x -
            camera.x,
            p.y,
            4,
            4
        );

    }

    ctx.globalAlpha = 1;

}


/* =====================================================
   HUD
===================================================== */

function updateHUD() {

    document.getElementById(
        "hp1"
    ).textContent =
        p1.hp;

    document.getElementById(
        "hp2"
    ).textContent =
        p2.hp;

    document.getElementById(
        "energy1"
    ).textContent =
        Math.floor(
            p1.energy
        );

    document.getElementById(
        "energy2"
    ).textContent =
        Math.floor(
            p2.energy
        );

}


/* =====================================================
   UPDATE
===================================================== */

function update(dt) {

    updatePlayer(
        p1,
        dt,
        {
            left: "KeyA",
            right: "KeyD",
            jump: "KeyW"
        }
    );

    updatePlayer(
        p2,
        dt,
        {
            left: "ArrowLeft",
            right: "ArrowRight",
            jump: "ArrowUp"
        }
    );

    updateEnemies(dt);

    updateGenerators();

    updateGoal();

    updateParticles(dt);

    updateCamera();

    updateHUD();

}


/* =====================================================
   DRAW
===================================================== */

function draw() {

    drawBackground();

    drawCity();

    drawPlatforms();

    drawGenerators();

    drawPortal();

    drawEnemies();

    drawPlayer(p1);

    drawPlayer(p2);

    drawParticles();

}


/* =====================================================
   GAME LOOP
===================================================== */

function loop(now) {

    const dt =
        Math.min(
            .05,
            (now - lastTime) / 1000
        );

    lastTime = now;

    if (
        running &&
        !gameOver
    ) {

        update(dt);

    }

    draw();

    requestAnimationFrame(loop);

}

requestAnimationFrame(loop);


/* =====================================================
   ATAQUES
===================================================== */

window.addEventListener(
    "keydown",
    e => {

        if (
            !running ||
            gameOver
        ) return;

        if (
            e.code === "KeyF"
        ) {

            attack(p1);

        }

        if (
            e.code === "ShiftLeft" ||
            e.code === "ShiftRight"
        ) {

            attack(p2);

        }

    }
);


/* =====================================================
   VITÓRIA
===================================================== */

function winGame() {

    gameOver = true;

    document
        .getElementById(
            "winScreen"
        )
        .classList
        .remove("hidden");

}


/* =====================================================
   DERROTA
===================================================== */

function loseGame() {

    gameOver = true;

    document
        .getElementById(
            "loseScreen"
        )
        .classList
        .remove("hidden");

}


/* =====================================================
   START
===================================================== */

document
    .getElementById(
        "startButton"
    )
    .addEventListener(
        "click",
        () => {

            running = true;

            document
                .getElementById(
                    "startScreen"
                )
                .classList
                .add("hidden");

        }
    );