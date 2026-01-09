const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 40; // pixel size

var game_state = "game_over";
var game_row = 15;
var game_score = 0;
var game_col = 10;
var game_time = 0;
var game_level = 1;
var animi = 0; // animation index
var banimi = 0; // bubblun index
var prevts = 0;
var prevts2 = 0;
var ag = 20; // sprite gaps
var af = 250; //animation frame
var current_level = [];
var mt = 30;
var bbf = 100; //bubblon frame

canvas.width = (grid * game_col) + 15;
canvas.height = grid * game_row;


// each even row is 8 bubbles long and each odd row is 7 bubbles long.
// the level consists of 4 rows of bubbles of 4 colors: red, orange,
// green, and yellow
// const level1 = [
//   ['R','R','Y','Y','B','B','G','G'],
//   ['R','R','Y','Y','B','B','G'],
//   ['B','B','G','G','R','R','Y','Y'],
//   ['B','G','G','R','R','Y','Y']
// ];

var p_sound = new Audio("audio/point.mp3");
var d_sound = new Audio("audio/die.mp3");
var fly_sound = new Audio("audio/vine.mp3");

var level1 = [];
var bubbleImage = new Image;
bubbleImage.onload = function() {
    // Do automation like show start button
}
bubbleImage.src = "images/bubbles.png";


var arrowImage = new Image;
arrowImage.onload = function() {
    // Do automation like show start button
}
arrowImage.src = "images/shooter.png";

var bubblunImage = new Image;
bubblunImage.onload = function() {
    // Do automation like show start button
    // x 49 y 50
}
bubblunImage.src = "images/bubblun.png";

// create a mapping between color short code (R, G, B, Y) and color name
const colorMap = {
    'B': 'blue',
    'R': 'red',
    'Y': 'yellow',
    'G': 'green',
    'V': 'violet',
    'O': 'orange',
    'P': 'black',
    'A': 'gray'
};

const colorMap2 = {
    'blue' : 'B',
    'red' : 'R',
    'yellow' : 'Y',
    'green' : 'G',
    'violet' : 'V',
    'orange' : 'O',
    'black' : 'P',
    'gray' : 'A'
};

const colors = Object.values(colorMap);
const colorV = Object.keys(colorMap);
// level1 = create_level();


// use a 1px gap between each bubble
const bubbleGap = 1;

// the size of the outer walls for the game
const wallSize = 4;
let bubbles = [];
let particles = [];

// check_game_access();
check_allow_config();

function start_game() {

    if (document.getElementById("player_name") && !document.getElementById("player_name").value) {
        alert("Enter Name");
        document.getElementById("player_name").focus();
        return;
    }

    if (game_state != "playing") {
        game_state = "playing";
        document.getElementById("game_start").style.display = "none";
        bubbles = [];
        particles = [];
        create_level();
        start_timer();
        check_remaining_bubbles();
    }
}



function restart_game() {
    window.location.reload();
}

function update_score(s) {

    if (document.getElementById("game_score")) { document.getElementById("game_score").value = game_score; }
    if (document.getElementById("game_level")) { document.getElementById("game_level").value = game_level; }

    if (!s) { return; }
    game_score = game_score + parseInt(s);

    if (document.getElementById("game_score")) { document.getElementById("game_score").value = game_score; }
    if (document.getElementById("game_level")) { document.getElementById("game_level").value = game_level; }

    // jquery to database

    let f_data = {};
    f_data['cmd'] = "update_score";
    f_data['score'] = game_score;
    f_data['name'] = document.getElementById("player_name").value;

    $.ajax({
        url : "api/world_fx.php",
        type : "post",
        data : f_data,
        success : (res) => {

        }
    })

}

// fill the grid with inactive bubbles
// for (let row = 0; row < 10; row++) {
//   for (let col = 0; col < (row % 2 === 0 ? 8 : 7); col++) {
// for (let row = 0; row < game_row; row++) {
//   for (let col = 0; col < game_col; col++) {
//     // if the level has a bubble at the location, create an active
//     // bubble rather than an inactive one
//     const color = level1[row]?.[col];
//     createBubble(col * grid, row * grid, colorMap[color]);
//   }
// }


// create level
function create_level() {
    level1 = [];
    bubbles = [];
    particles = [];
    for (let r = 0; r < (game_row / 2) - 2; r++) {

        let c = game_col;
        if (r % 2 != 0) {
            c = c - 1;
        }
        let tArr = [];
        for (let ci = 0; ci < c; ci++) {

            let rnd;
            if (game_level < 6) {
                rnd = getRandomInt(0, game_level + 1);
            } else {
                rnd = getRandomInt(0, colorV.length - 1);
            }
            
            tArr.push(colorV[rnd]);
        }

        level1.push(tArr);
    }

    for (let row = 0; row < game_row; row++) {
        for (let col = 0; col < game_col; col++) {
            // if the level has a bubble at the location, create an active
            // bubble rather than an inactive one
            const color = level1[row]?.[col];
            createBubble(col * grid, row * grid, colorMap[color]);
        }
    }

}

//Not implemented
function increase_level() {
    
    if (current_level.length) {
        bubbles = [];
        
        let c = game_col;
        if (current_level.length % 2 != 0) {
            c = c - 1;
        }

        let tArr = [];
        for (let ci = 0; ci < c; ci++) {

            let rnd;
            if (game_level < 5) {
                rnd = getRandomInt(0, game_level + 1);
            } else {
                rnd = getRandomInt(0, colorV.length - 1);
            }
            
            tArr.push(colorV[rnd]);
        }

        current_level.push(tArr);

        for (let row = 0; row < game_row; row++) {
            for (let col = 0; col < game_col; col++) {
                // if the level has a bubble at the location, create an active
                // bubble rather than an inactive one
                const color = current_level[row]?.[col];
                createBubble(col * grid, row * grid, colorMap[color]);
            }
        }

        if (current_level.length >= 12) {
            alert("Game Over");
            restart_game();
            return;
        }

    }
}

// helper function to convert deg to radians
function degToRad(deg) {
    return (deg * Math.PI) / 180;
}

// rotate a point by an angle
function rotatePoint(x, y, angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);

    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
    };
}

// get a random integer between the range of [min,max]
// @see https://stackoverflow.com/a/1527820/2124254
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// get the distance between two points
function getDistance(obj1, obj2) {
    const distX = obj1.x - obj2.x;
    const distY = obj1.y - obj2.y;
    return Math.sqrt(distX * distX + distY * distY);
}

// check for collision between two circles
function collides(obj1, obj2) {
    return getDistance(obj1, obj2) < obj1.radius + obj2.radius;
}

// find the closest bubbles that collide with the object
function getClosestBubble(obj, activeState = false) {
    const closestBubbles = bubbles
        .filter(bubble => bubble.active == activeState && collides(obj, bubble));

    if (!closestBubbles.length) {
        return;
    }

    return closestBubbles
        // turn the array of bubbles into an array of distances
        .map(bubble => {
        return {
            distance: getDistance(obj, bubble),
            bubble
        } })
        .sort((a, b) => a.distance - b.distance)[0].bubble;
}

// create the bubble grid bubble. passing a color will create
// an active bubble
function createBubble(x, y, color) {
    const row = Math.floor(y / grid);
    const col = Math.floor(x / grid);

    // bubbles on odd rows need to start half-way on the grid
    const startX = row % 2 === 0 ? 0 : 0.5 * grid;

    // because we are drawing circles we need the x/y position
    // to be the center of the circle instead of the top-left
    // corner like you would for a square
    const center = grid / 2;

    bubbles.push({
        x: wallSize + (grid + bubbleGap) * col + startX + center,

        // the bubbles are closer on the y axis so we subtract 4 on every
        // row
        y: wallSize + (grid + bubbleGap - 4) * row + center,

        radius: grid / 2,
        color: color,
        active: color ? true : false,
        anim_index: getRandomInt(0, 3)
        // anim_index: 0
    });
}

// get all bubbles that touch the passed in bubble
function getNeighbors(bubble) {
    const neighbors = [];

    // check each of the 6 directions by "moving" the bubble by a full
    // grid in each of the 6 directions (60 degree intervals)
    // @see https://www.redblobgames.com/grids/hexagons/#angles
    const dirs = [
        // right
        rotatePoint(grid, 0, 0),
        // up-right
        rotatePoint(grid, 0, degToRad(60)),
        // up-left
        rotatePoint(grid, 0, degToRad(120)),
        // left
        rotatePoint(grid, 0, degToRad(180)),
        // down-left
        rotatePoint(grid, 0, degToRad(240)),
        // down-right
        rotatePoint(grid, 0, degToRad(300))
    ];

    for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i];

        const newBubble = {
        x: bubble.x + dir.x,
        y: bubble.y + dir.y,
        radius: bubble.radius
        };
        const neighbor = getClosestBubble(newBubble, true);
        if (neighbor && neighbor !== bubble && !neighbors.includes(neighbor)) {
            neighbors.push(neighbor);
        }
    }

    

    return neighbors;
}

// remove bubbles that create a match of 3 colors
function removeMatch(targetBubble) {
    const matches = [targetBubble];
    bubbles.forEach(bubble => bubble.processed = false);
    targetBubble.processed = true;

    // loop over the neighbors of matching colors for more matches
    let neighbors = getNeighbors(targetBubble);
    for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];

        if (!neighbor.processed) {
            neighbor.processed = true;

            if (neighbor.color === targetBubble.color) {
                matches.push(neighbor);
                neighbors = neighbors.concat(getNeighbors(neighbor));
            }
        }
    }

    if (matches.length >= 3) {
        matches.forEach(bubble => {
            bubble.active = false;
        });

        if (matches.length >= 10) {
            update_score(((matches.length + 5) * 10) * game_level);
        } else {
            update_score((matches.length * 10) * game_level);
        }

    }
    
}

function check_remaining_bubbles() {
    let ctr = 0;
    
    current_level = [];
    let bc = 0;
    let tmpA = [];
    let t = 0;
    for (let b = 0; b < bubbles.length; b++) {


        /** NO Implemented more time needed */
        if ([19, 39, 59, 79, 99, 119, 139, 159].includes(b)) { continue; }

        if (current_level.length % 2 != 0) {
            if (bc > game_col - 2) { 
                bc = 0 
                if (t > 0) { current_level.push(tmpA); }
                t = 0;
                tmpA = [];
            }
        } else {
            if (bc > game_col - 1) { 
                bc = 0 
                if (t > 0) { current_level.push(tmpA); }
                t = 0;
                tmpA = [];
            }
        }

        if (bubbles[b]['active'] == true) {
            ctr++;
            t++;
            tmpA.push(colorMap2[bubbles[b]['color']]);
        } else {
            tmpA.push("");
        }
        bc++;

    }

    if (ctr <= 0) { 
        let gl = game_level;
        game_level = game_level + 1;
        // if (game_level > 10) { mt = 15; }
        update_score(gl * 100);
        create_level(); 
    }
}

// make any floating bubbles (bubbles that don't have a bubble chain
// that touch the ceiling) drop down the screen
function dropFloatingBubbles() {
    const activeBubbles = bubbles.filter(bubble => bubble.active);
    activeBubbles.forEach(bubble => bubble.processed = false);

    // start at the bubbles that touch the ceiling
    let neighbors = activeBubbles
        .filter(bubble => bubble.y - grid <= wallSize);

    // process all bubbles that form a chain with the ceiling bubbles
    for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];

        if (!neighbor.processed) {
        neighbor.processed = true;
        neighbors = neighbors.concat(getNeighbors(neighbor));
        }
    }

    // any bubble that is not processed doesn't touch the ceiling
    activeBubbles
    .filter(bubble => !bubble.processed)
    .forEach(bubble => {
        bubble.active = false;
        // create a particle bubble that falls down the screen
        particles.push({
            x: bubble.x,
            y: bubble.y,
            color: bubble.color,
            radius: bubble.radius,
            active: true,
            anim_index : getRandomInt(0, 3),
        });
    });
}



const curBubblePos = {
    // place the current bubble horizontally in the middle of the screen
    x: canvas.width / 2,
    y: canvas.height - grid * 1.5
};
const curBubble = {
    x: curBubblePos.x,
    y: curBubblePos.y,
    color: 'red',
    radius: grid / 2,  // a circles radius is half the width (diameter)

    // how fast the bubble should go in either the x or y direction
    speed: 8,

    // bubble velocity
    dx: 0,
    dy: 0,
    anim_index : 0
};

// angle (in radians) of the shooting arrow
let shootDeg = 0;

// min/max angle (in radians) of the shooting arrow
const minDeg = degToRad(-60);
const maxDeg = degToRad(60);

// the direction of movement for the arrow (-1 = left, 1 = right)
let shootDir = 0;

// reset the bubble to shoot to the bottom of the screen
function getNewBubble() {

    if (game_state != 'playing') { return; }

    curBubble.x = curBubblePos.x;
    curBubble.y = curBubblePos.y;
    curBubble.dx = curBubble.dy = 0;
    curBubble.anim_index = getRandomInt(0, 3);

    let tmpColors = [];

    for (let b = 0; b < bubbles.length; b++) {

        if (!bubbles[b]['color'] || !bubbles[b]['active']) { continue; }
        if (tmpColors.includes(bubbles[b]['color'])) {
            continue;
        }
        tmpColors.push(bubbles[b]['color']);
    }
    
    let rnd = getRandomInt(0, tmpColors.length - 1);
    // let rnd;
    // if (game_level < 5) {
    //     rnd = getRandomInt(0, game_level + 1);
    // } else {
    //     rnd = getRandomInt(0, colorV.length - 1);
    // }
    // const randInt = getRandomInt(0, colors.length - 1);
    // curBubble.color = colors[randInt];
    // curBubble.color = colors[rnd];
    curBubble.color = tmpColors[rnd];
}

// handle collision between the current bubble and another bubble
function handleCollision(bubble) {
    bubble.color = curBubble.color;
    bubble.active = true;
    removeMatch(bubble);
    dropFloatingBubbles();
    check_remaining_bubbles();
    getNewBubble();
    
}

// game loop
// gts is graphic timestamp


function loop(gts) {
    
    if (game_state === "game_over") {
        return requestAnimationFrame(loop);
    }
    
    context.clearRect(0,0,canvas.width,canvas.height);

    // move the shooting arrow
    shootDeg = shootDeg + degToRad(2) * shootDir;

    // prevent shooting arrow from going below/above min/max
    if (shootDeg < minDeg) {
        shootDeg = minDeg;
    }
    else if (shootDeg > maxDeg) {
        shootDeg = maxDeg
    }

    // move current bubble by it's velocity
    curBubble.x += curBubble.dx;
    curBubble.y += curBubble.dy;

    // prevent bubble from going through walls by changing its velocity
    if (curBubble.x - grid / 2 < wallSize) {
        curBubble.x = wallSize + grid / 2;
        curBubble.dx *= -1;
    }
    else if (curBubble.x + grid / 2 > canvas.width - wallSize) {
        curBubble.x = canvas.width - wallSize - grid / 2;
        curBubble.dx *= -1;
    }

    // check to see if bubble collides with the top wall
    if (curBubble.y - grid / 2 < wallSize) {
        // make the closest inactive bubble active
        const closestBubble = getClosestBubble(curBubble);
        handleCollision(closestBubble);
    }

  // check to see if bubble collides with another bubble
    for (let i = 0; i < bubbles.length; i++) {
        const bubble = bubbles[i];

        if (bubble.active && collides(curBubble, bubble)) {
            const closestBubble = getClosestBubble(curBubble);
            if (!closestBubble)  {
                window.alert('Game Over, Score will be recorded');
                // Record score on database jquery
                // window.location.reload();
                game_state = "game_over";
                restart_game();
                return requestAnimationFrame(loop);
            }

            if (closestBubble) {
                handleCollision(closestBubble);
            }
        }
    }

    // move bubble particles
    particles.forEach(particle => {
        particle.y += 8;
    });

    // remove particles that went off the screen
    particles = particles.filter(particles => particles.y < canvas.height - grid / 2);

    // draw walls
    // change color/design
    // context.fillStyle = 'lightgrey';
    // context.fillRect(0, 0, canvas.width, wallSize);
    // context.fillRect(0, 0, wallSize, canvas.height);
    // context.fillRect(canvas.width - wallSize, 0, wallSize, canvas.height);

    // draw bubbles and particles
    bubbles.concat(particles).forEach(bubble => {
        if (!bubble.active) return;
        context.fillStyle = bubble.color;

        // draw a circle
        // context.beginPath();
        // context.arc(bubble.x, bubble.y, bubble.radius, 0, 2 * Math.PI);
        // context.fill();

        let bx, by;

        if (gts - prevts >= af) {
            bubble.anim_index = bubble.anim_index + animi > 3 ? bubble.anim_index + animi - 3 : bubble.anim_index + animi;    
        }
        // bubble.anim_index = 0;

        switch (bubble.color) {
            case "blue":
                bx = 2 + (bubble.anim_index * ag);by = 4;
                break;
            case "red":
                bx = 2 + (bubble.anim_index * ag);by = 31;
                break;
            case "yellow":
                bx = 2 + (bubble.anim_index * ag);by = 58;
                break;
            case "green":
                bx = 2 + (bubble.anim_index * ag);by = 85;
                break;
            case "violet":
                bx = 2 + (bubble.anim_index * ag);by = 112;
                break;
            case "orange":
                bx = 2 + (bubble.anim_index * ag);by = 139;
                break;
            case "black":
                bx = 2 + (bubble.anim_index * ag);by = 166;
                break;
            case "gray":
                bx = 2 + (bubble.anim_index * ag);by = 193;
                break;
        }

        context.drawImage(bubbleImage, bx, by, 18, 18, bubble.x - bubble.radius, bubble.y - bubble.radius, grid, grid);

    });


    let bx, by;
    switch (curBubble.color) {
        case "blue":
            bx = 2 + (curBubble.anim_index * ag);by = 4;
            break;
        case "red":
            bx = 2 + (curBubble.anim_index * ag);by = 31;
            break;
        case "yellow":
            bx = 2 + (curBubble.anim_index * ag);by = 58;
            break;
        case "green":
            bx = 2 + (curBubble.anim_index * ag);by = 85;
            break;
        case "violet":
            bx = 2 + (curBubble.anim_index * ag);by = 112;
            break;
        case "orange":
            bx = 2 + (curBubble.anim_index * ag);by = 139;
            break;
        case "black":
            bx = 2 + (curBubble.anim_index * ag);by = 166;
            break;

    }

    
    context.drawImage(bubbleImage, bx, by, 18, 18, curBubble.x - curBubble.radius, curBubble.y - curBubble.radius, grid, grid);

    // draw fire arrow. since we're rotating the canvas we need to save
    // the state and restore it when we're done
    context.save();

    // move to the center of the rotation (the middle of the bubble)
    context.translate(curBubblePos.x, curBubblePos.y);
    context.rotate(shootDeg);

    // move to the top-left corner of or fire arrow
    context.translate(0, -grid / 2 * 4.5);

    context.drawImage(arrowImage, 0, 0, 40, 51, -57, 12, 110, 130);

    // draw arrow ↑
    // Change design
    // context.strokeStyle = 'Silver';
    // context.lineWidth = 4;
    // context.beginPath();
    // context.moveTo(0, 0);
    // context.lineTo(0, grid * 2);
    // context.moveTo(0, 0);
    // context.lineTo(-10, grid * 0.4);
    // context.moveTo(0, 0);
    // context.lineTo(10, grid * 0.4);
    // context.stroke();

    context.strokeStyle = 'gray';
    context.lineWidth = 1;
    context.lineJoin = 'round'; // Makes the arrow tip look cleaner
    context.beginPath();

    // Vertical segment
    let ptx = (grid * 1.5);
    let lh = 10;
    for (let lti = 0; lti < 24; lti++) {
        context.moveTo(0, ptx);
        context.lineTo(0, ptx - (lh / 1));
        ptx = ptx - lh;
    }

    // Determine rotation
    let nr = shootDeg / (Math.PI / 180);
    let na = (nr > 0) ? (Math.PI * 1.5) : (Math.PI * 0.5); // 270 or 90 degrees

    context.rotate(na); 
    


    context.stroke();
    context.restore();

    // draw current bubble
    // Change design add anmis

    
    // context.fillStyle = curBubble.color;
    // context.beginPath();
    // context.arc(curBubble.x, curBubble.y, curBubble.radius, 0, 2 * Math.PI);
    // context.fill();
    // if (gts - prevts >= af) {
    //     curBubble.anim_index = curBubble.anim_index + animi > 3 ? curBubble.anim_index + animi - 3 : curBubble.anim_index + animi;    
    // }
    // curBubble.anim_index = 0;
    
    context.drawImage(bubblunImage, banimi * 49, 0, 49, 49, canvas.width - 160, canvas.height - 110, 100, 100);

    if (gts - prevts >= af) {
        // if (animi + 1 > 9) { animi = 0; } else { animi++; }
        if (animi + 1 > 3) { animi = 0; } else { animi++; }
        prevts = gts;
    }

    if (gts - prevts2 >= bbf) {
        if (banimi + 1 > 18) { banimi = 0; } else { banimi++; }
        prevts2 = gts;
    }

    requestAnimationFrame(loop);

}

// listen for keyboard events to move the fire arrow
document.addEventListener('keydown', (e) => {

    if (game_state === 'playing') {
        if (e.code === 'ArrowLeft') { shootDir = -1; }
        else if (e.code === 'ArrowRight') { shootDir = 1; }

        // if the current bubble is not moving we can launch it
        if (e.code === 'Space' &&  curBubble.dx === 0 && curBubble.dy === 0) {
            // convert an angle to x/y
            curBubble.dx = Math.sin(shootDeg) * curBubble.speed;
            curBubble.dy = -Math.cos(shootDeg) * curBubble.speed;
        }
    }

    
});

// listen for keyboard events to stop moving the fire arrow if key is
// released
document.addEventListener('keyup', (e) => {
    if (
        // only reset shoot dir if the released key is also the current
        // direction of movement. otherwise if you press down both arrow
        // keys at the same time and then release one of them, the arrow
        // stops moving even though you are still pressing a key
        (e.code === 'ArrowLeft' && shootDir === -1) ||
        (e.code === 'ArrowRight' && shootDir === 1) &&
        game_state === 'playing'
    ) { shootDir = 0; }
});

function start_timer(t = 0) {

    if (t <= 0) {
        t = mt;
        increase_level();
    }

    if (document.getElementById("timer")) {
        document.getElementById("timer").innerText = t;
    }
    
    // check_game_access();
    setTimeout( () => {
        t--;
        return start_timer(t);
    }, 1000);
}


function check_game_access() {

    let f_data = {};
    f_data['cmd'] = "check_allow_config";

    $.ajax({
        url : "api/world_fx.php",
        type : "post",
        data : f_data,
        success : (res) => {
            if (res) {
                res = JSON.parse(res);
                
                if (res['sc_on'] != "1") {
                    alert("Game is not allowed");
                    document.body.innerHTML = "";
                }

            }
        }
    })


}

function check_allow_config() {
    console.log("jhere");
    let r_data = {};
    r_data['cmd'] = "check_allow_config";
    
    // Calling API's
    $.ajax({
        url : "api/world_fx.php",
        type : "post",
        data : r_data,
        success : (res) => {
            if (JSON.parse(res)['sc_on'] != 1) {
                alert("Game access not allowed");
                document.body.innerHTML = "";
            } else {
                setTimeout( () => {
                    check_allow_config();
                }, 5000);
            }
        }
    })

}

// start the game
requestAnimationFrame(loop);