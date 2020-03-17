
var canvas;
var ctx;

var targetDT = 1 / 60;
var globalDT;
var time = 0,
    FPS  = 0,
    frames    = 0,
    acumDelta = 0;

window.requestAnimationFrame = (function (evt) {
    return window.requestAnimationFrame ||
    	window.mozRequestAnimationFrame    ||
    	window.webkitRequestAnimationFrame ||
    	window.msRequestAnimationFrame     ||
    	function (callback) {
        	window.setTimeout(callback, targetDT * 1000);
    	};
}) ();

window.onload = BodyLoaded;

// graphic assets references
var graphicAssets = {}

// audio assets references
var audioAssets = {}

// game objects
var player = {
    position: {
        x: 39,
        y: 120
    },
    rotation: 0
}

/*var world = [
    ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
    ['X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'],
    ['X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'],
    ['X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'],
    ['X', ' ', ' ', 'X', 'X', 'X', 'X', 'X', ' ', 'X'],
    ['X', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', 'X'],
    ['X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'],
    ['X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'],
    ['X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X'],
    ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X']
];*/
var world = [
    [' ', ' ', ' ', 'A', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'M'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'M'],
    [' ', ' ', ' ', ' ', ' ', ' ', 'A', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', 'X', 'X', 'X', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', 'M', ' ', ' ', ' ', ' '],
    ['X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', 'A', 'A', ' ', ' ', ' ', ' ', ' ', ' ']
];
/*var world = [
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', 'A', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
];*/
var obstacles = [];

var boxSize = 20;

var pathLength = 100;
var fov = 60 * degToRad;
var fovHalf = fov / 2;

var rays = [];
var rayCounter = 0;

var heightAux = 30;

function LoadImages(assets, onloaded)
{
    if (Object.keys(graphicAssets).length < 1)
        onloaded();

    let imagesToLoad = 0;
    
    const onload = () => --imagesToLoad === 0 && onloaded();

    // iterate through the object of assets and load every image
    for (let asset in assets)
    {
        if (assets.hasOwnProperty(asset))
        {
            imagesToLoad++; // one more image to load

            // create the new image and set its path and onload event
            const img = assets[asset].image = new Image;
            img.src = assets[asset].path;
            img.onload = onload;
        }
    }
    return assets;
}

function BodyLoaded()
{
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    SetupKeyboardEvents();
    SetupMouseEvents();

    LoadImages(graphicAssets, function() {
        Start();

        // first call to the game loop
        Loop();
    })
}

function Start()
{
    // initialize the array of rays
    rayCounter = canvas.width;
    for (let i = 0; i < rayCounter; i++)
    {
        let newRay = {
            collisionPos: null,
            collisionDist: Infinity,
            angle: 0,
            color: ' '
        };
        rays.push(newRay);
    }
}

function Loop()
{
    //deltaTime
    let now = Date.now();
    let deltaTime = now - time;
    globalDT = deltaTime;
    
    if (deltaTime > 1000)
        deltaTime = 0;
    
    time = now;

    // frames counter
    frames++;
    acumDelta += deltaTime;

    if (acumDelta > 1000)
    {
        FPS = frames;
        frames = 0;
        acumDelta -= acumDelta;
    }

    requestAnimationFrame(Loop);

    Input.Update();
    
    // Game logic -------------------
    Update(deltaTime / 1000);
    
    // Draw the game ----------------
    Draw(ctx);
    
    // reset input data
    Input.PostUpdate();
}

function Update(deltaTime)
{
    DoRayCast();

    if (Input.IsKeyPressed(KEY_W))
    {
        player.position.x += Math.cos(player.rotation) * 50 * deltaTime;
        player.position.y += Math.sin(player.rotation) * 50 * deltaTime;
    }
    if (Input.IsKeyPressed(KEY_S))
    {
        player.position.x -= Math.cos(player.rotation) * 50 * deltaTime;
        player.position.y -= Math.sin(player.rotation) * 50 * deltaTime;
    }
    if (Input.IsKeyPressed(KEY_A))
    {
        player.position.x += Math.cos(player.rotation - PIH) * 50 * deltaTime;
        player.position.y += Math.sin(player.rotation - PIH) * 50 * deltaTime;
    }
    if (Input.IsKeyPressed(KEY_D))
    {
        player.position.x += Math.cos(player.rotation + PIH) * 50 * deltaTime;
        player.position.y += Math.sin(player.rotation + PIH) * 50 * deltaTime;
    }

    // rotation
    if (Input.IsKeyPressed(KEY_Q))
        player.rotation -= 1 * deltaTime;
    if (Input.IsKeyPressed(KEY_E))
        player.rotation += 1 * deltaTime;
}

function Draw(ctx)
{
    const halfHeight = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // prepare the sky background gradient
    const grd1 = ctx.createLinearGradient(0, 0, 0, halfHeight);
    grd1.addColorStop(0, "black");
    grd1.addColorStop(0.05, "black");
    grd1.addColorStop(0.25, "#3d2c1e");
    grd1.addColorStop(1, "#1c6ac9");

    // draw the sky background
    ctx.fillStyle = grd1;
    ctx.fillRect(0, 0, canvas.width, halfHeight);

    // prepare the floor background gradient
    const grd2 = ctx.createLinearGradient(0, halfHeight, 0, canvas.height);
    grd2.addColorStop(0, "#9d7231");
    grd2.addColorStop(1, "#4b2a0a");

    // draw the floor background
    ctx.fillStyle = grd2;
    ctx.fillRect(0, halfHeight, canvas.width, canvas.height);

    // draw the raycasting result

    ctx.fillStyle = "darkred";
    const pixelWidth = canvas.width / rays.length;
    for (let i = 0; i < rays.length; i++)
    {
        if (rays[i].collisionPos != null)
        {
            const dark = Math.round(Math.abs(rays[i].collisionPos.inclination * 10));
            switch(rays[i].color)
            {
                case "X": ctx.fillStyle = "rgb(" + dark + ",0,0)";   break;
                case "A": ctx.fillStyle = "rgb(0," + dark + ",0)";  break;
                case "M": ctx.fillStyle = "rgb(0,0," + dark + ")"; break;
            }
            const hHeight = ((canvas.height / rays[i].collisionDist) * heightAux) / 2;
            ctx.fillRect(i * pixelWidth, halfHeight - hHeight, pixelWidth, hHeight * 2);
        }
    }

    Draw2dWorld(ctx);

    // draw the FPS
    ctx.fillStyle = "white";
    ctx.font = "10px Comic Sans MS";
    ctx.fillText('FPS: ' + FPS, 10, 16);
    ctx.fillText('DT: ' + Math.round(1000 / globalDT), 10, 28);
}

function Draw2dWorld(ctx)
{
    let cellSize = boxSize;
    let playerRotationRadHalf = player.rotation / 2;
    let minAngle = player.rotation - fovHalf;
    let maxAngle = player.rotation + fovHalf;

    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'grey';

    ctx.save();
    ctx.translate(8600 / boxSize, 5400 / boxSize);

    for (let y = 0; y < world.length; y++)
    {
        for (let x = 0; x < world[y].length; x++)
        {
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            if (world[y][x] != ' ')
            {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(player.position.x - 2, player.position.y - 2, 4, 4);

    ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
    ctx.beginPath();
    ctx.arc(player.position.x, player.position.y, pathLength, minAngle, maxAngle, false);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(player.position.x, player.position.y);
    ctx.lineTo(player.position.x + Math.cos(minAngle) * pathLength, player.position.y + Math.sin(minAngle) * pathLength);
    ctx.lineTo(player.position.x + Math.cos(maxAngle) * pathLength, player.position.y + Math.sin(maxAngle) * pathLength);
    ctx.lineTo(player.position.x, player.position.y);
    ctx.closePath();
    ctx.fill();

    // draw the rays
    ctx.strokeStyle = "lightgreen";

    for (let ray of rays)
    {
        ctx.beginPath();
        ctx.moveTo(player.position.x, player.position.y);

        if (ray.collisionPos != null)
        {
            ctx.strokeStyle = "red";
            ctx.lineTo(ray.collisionPos.x, ray.collisionPos.y);
        }
        else
        {
            ctx.strokeStyle = "lightgreen";
            ctx.lineTo(player.position.x + Math.cos(ray.angle) * pathLength, player.position.y + Math.sin(ray.angle) * pathLength);
        }

        ctx.closePath();
        ctx.stroke();
    }

    ctx.restore();
}

function DoRayCast()
{
    const minAngle = player.rotation - fovHalf;

    const angleStep = fov / rayCounter;
    //const angleStep = PI2 / rayCounter;
    for (let i = 0, currentAngle = minAngle; i < rayCounter; i++, currentAngle += angleStep)
    {
        rays[i] = RayCast(player.position, currentAngle);
    }
}

function RayCast(originPoint, direction)
{
    // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
    let x1 = 0;
    let y1 = 0;
    let x2 = 0;
    let y2 = 0;

    let x3 = originPoint.x;
    let y3 = originPoint.y;
    let x4 = originPoint.x + Math.cos(direction);
    let y4 = originPoint.y + Math.sin(direction);

    let rayObject = {};
    let closestCollision = null;
    let minDist = Infinity;
    let closestColor = "";

    for (let y = 0; y < world.length; y++)
    {
        for (let x = 0; x < world[y].length; x++)
        {
            if (world[y][x] != ' ')
            {
                if (originPoint.x < x * boxSize)
                {
                    // box is on the right side of the ray
                    // check collision with the left side of the box
                    x1 = x * boxSize;
                    y1 = y * boxSize;
                    x2 = x * boxSize;
                    y2 = (y * boxSize) + boxSize;
                }
                else
                {
                    // box is on the left side of the ray
                    // check collision with the right side of the box
                    x1 = (x * boxSize) + boxSize;
                    y1 = y * boxSize;
                    x2 = (x * boxSize) + boxSize;
                    y2 = (y * boxSize) + boxSize;
                }

                let coll = RayCastAux(x1, y1, x2, y2, x3, y3, x4, y4);
                if (!coll)
                {
                    if (originPoint.y < y * boxSize)
                    {
                        // box is on the down side of the ray
                        // check collision with the top side of the box
                        x1 = x * boxSize;
                        y1 = y * boxSize;
                        x2 = (x * boxSize) + boxSize;
                        y2 = y * boxSize;
                    }
                    else
                    {
                        // box is on the top side of the ray
                        // check collision with the down side of the box
                        x1 = x * boxSize;
                        y1 = (y * boxSize) + boxSize;
                        x2 = (x * boxSize) + boxSize;
                        y2 = (y * boxSize) + boxSize;
                    }
                    coll = RayCastAux(x1, y1, x2, y2, x3, y3, x4, y4);
                }

                if (coll != null)
                {
                    const dist = Distance(originPoint, coll);
                    if (dist < minDist)
                    {
                        minDist = dist;
                        closestCollision = coll;
                        closestColor = world[y][x];
                    }
                }
            } // if (world[y][x] == 'X')
        }
    }

    rayObject.collisionPos = closestCollision;
    rayObject.collisionDist = minDist;
    rayObject.color = closestColor;

    return rayObject;
}

function RayCastAux(x1, y1, x2, y2, x3, y3, x4, y4)
{
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den != 0)
    {
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

        if (t > 0 && t < 1 && u > 0)
        {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1),
                inclination: den
            };
        }
    }
    return null;
}
