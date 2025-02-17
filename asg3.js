// Vertex shader program
var VS = `
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform float u_Size;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectMatrix;
    void main(){
        gl_Position = u_ProjectMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        gl_PointSize = u_Size;
        v_UV = a_UV;
    }`;

// Fragment shader program
var FS = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture;
    void main(){
        if(u_whichTexture == -2){
            gl_FragColor = u_FragColor;                   //use color
        } else if(u_whichTexture == -1){
            gl_FragColor = vec4(v_UV, 1.0, 1.0);          //use uv debug color
        } else if(u_whichTexture == 0){
            gl_FragColor = texture2D(u_Sampler0, v_UV);   //use texture0
        } else if(u_whichTexture == 1){
            gl_FragColor = texture2D(u_Sampler1, v_UV);   //use texture1
        } else if(u_whichTexture == 2){
            gl_FragColor = texture2D(u_Sampler2, v_UV);   //use texture2 
        } else {
            gl_FragColor = vec4(1,.2,.2,1);               //error, red
        }             
    }`;


// Global vars
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectMatrix;
let u_ViewMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;

//set up
function setUpWegGL(){
    canvas = document.getElementById('webgl');
  
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
    gl.enable(gl.DEPTH_TEST);
}

//connect global vars
function connectVariablesToGLSL(){
    if(!initShaders(gl, VS, FS)){
        console.log("Failed to load/compile shaders");
        return;
        }
    
    a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if(a_Position < 0){
        console.log("Failed to get the storage location of a_Position");
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, "a_UV");
    if(a_UV < 0){
        console.log("Failed to get the storage location of a_UV");
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if(!u_FragColor){
        console.log("Failed to get the storage location of u_FragColor");
        return;
    }

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if(!u_Size){
        console.log("Failed to get the storage location of u_Size");
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if(!u_ModelMatrix){
        console.log("Failed to get the storage location of u_ModelMatrix");
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if(!u_GlobalRotateMatrix){
        console.log("Failed to get the storage location of u_GlobalRotateMatrix");
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix){
        console.log("Failed to get the storage location of u_ViewMatrix");
        return;
    }

    u_ProjectMatrix = gl.getUniformLocation(gl.program, 'u_ProjectMatrix');
    if(!u_ProjectMatrix){
        console.log("Failed to get the storage location of u_ProjectMatrix");
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
      console.log('Failed to get the storage location of u_Sampler1');
      return false;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
      console.log('Failed to get the storage location of u_Sampler2');
      return false;
    }


    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

//button and slider vars
let g_globalCamAngle = 0;
let g_globalAngleY = 0; 
let g_globalAngleX = 0; 
let g_camera;

let isDragging = false;
let g_mouseR = true;

//connect html to actions
function addActionsForHtmlUI(){
    document.getElementById('mouseROff').onclick = function(){g_mouseR=false;};
    document.getElementById('mouseROn').onclick = function(){g_mouseR=true;};
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;
function tick(){
    g_seconds = performance.now()/1000.0 - g_startTime;

    //updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

function keydown(ev){
    const speed = 0.2
    const degrees = 1;
    if (ev.keyCode == 87){ //w
        g_camera.moveForward(speed);
    } else if (ev.keyCode == 83) {
        g_camera.moveBackwards(speed);
    } else if (ev.keyCode == 65) {
        g_camera.moveLeft(speed);
    } else if (ev.keyCode == 68) {
        g_camera.moveRight(speed);
    } else if (ev.keyCode == 81) {
        g_camera.panLeft(degrees);
    } else if (ev.keyCode == 69) {
        g_camera.panRight(degrees);
    } else if (ev.keyCode == 70){
        addBlock();
    } else if (ev.keyCode == 71){
        deleteBlock();
    }

    renderAllShapes();
    console.log(ev.keyCode);
}

let textures = [];

function initTextures() {
    const textureFiles = [
        'textures/starrySky.jpg',
        'textures/grass.jpg', 
        'textures/stonewall.jpg',
        // Add as more textures
    ];

    textureFiles.forEach((file, index) => {
        let image = new Image();
        image.onload = function() {
            textures[index] = sendImageToTexture(image, index);
        };
        image.src = file;
    });
}

function sendImageToTexture(image, textureUnit) {
    let texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler0, 0); 
    gl.uniform1i(u_Sampler1, 1);
    gl.uniform1i(u_Sampler2, 2);

    console.log("Texture loaded at unit:", textureUnit);
    return texture;
}

function main() {
    setUpWegGL();

    connectVariablesToGLSL();

    addActionsForHtmlUI();

    g_camera = new Camera();

    document.onkeydown = keydown;

    initTextures();
    
    canvas.onmousedown = function(ev) {
        if (ev.shiftKey) {
            g_pokeActive = true;
            addRandomSpheres();
            
            setTimeout(() => { g_pokeActive = false; }, 1000);
        } else {
            isDragging = true;
            lastMouseX = ev.clientX;
            lastMouseY = ev.clientY;
        }
    };

    canvas.onmousemove = function(ev) {
        if (isDragging) {
            const deltaX = ev.clientX - lastMouseX;
            const deltaY = ev.clientY - lastMouseY;

            g_globalAngleY += deltaX * 0.5;
            g_globalAngleX -= deltaY * 0.5; 

            g_globalAngleX = Math.max(-90, Math.min(90, g_globalAngleX));

            lastMouseX = ev.clientX;
            lastMouseY = ev.clientY;
            renderAllShapes();
        }
    };

    canvas.onmouseup = canvas.onmouseleave = function() {
        isDragging = false;
    };
  
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
    //renderAllShapes();
    requestAnimationFrame(tick);
}

var g_map = [
    [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2],
    [5, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2],
    [5, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 3, 2, 2, 0, 2],
    [5, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 3, 0, 0, 0, 2],
    [5, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 2],
    [5, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2],
    [5, 0, 0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 3, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 2],
    [5, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 3, 3, 0, 0, 2, 0, 0, 0, 2, 2, 2, 0, 2],
    [5, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0, 2, 3, 0, 0, 0, 0, 3, 0, 2],
    [5, 0, 0, 3, 3, 3, 3, 0, 2, 2, 2, 3, 0, 0, 2, 0, 0, 0, 0, 2, 0, 3, 3, 0, 3, 0, 0, 0, 0, 3, 0, 2],
    [5, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 2, 0, 3, 0, 2, 2, 2, 2, 0, 2],
    [5, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 2, 2, 2, 0, 0, 0, 0, 2],
    [5, 0, 0, 3, 3, 3, 3, 0, 3, 3, 0, 0, 0, 0, 0, 0, 2, 2, 2, 3, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 2],
    [5, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 0, 2, 0, 0, 0, 0, 0, 2],
    [5, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [5, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 3, 0, 3, 0, 0, 0, 0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [5, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 0, 0, 0, 2, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [5, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [5, 0, 0, 2, 3, 3, 3, 3, 2, 0, 0, 2, 0, 0, 0, 0, 0, 2, 2, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [5, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [5, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [5, 0, 3, 3, 2, 3, 3, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 3, 3, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [5, 0, 2, 0, 0, 0, 0, 0, 3, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [5, 0, 0, 0, 3, 3, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 3, 3, 3, 2, 0, 0, 0, 0, 0, 2],
    [5, 0, 2, 3, 3, 3, 0, 0, 0, 0, 0, 2, 3, 3, 3, 0, 0, 0, 0, 2, 0, 0, 3, 0, 0, 2, 0, 0, 0, 2, 2, 2],
    [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 0, 3, 3, 0, 3, 3, 2, 2, 0, 0, 3, 3, 0, 2, 0, 3, 3, 3, 0, 2],
    [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 3, 0, 0, 0, 0, 0, 2, 0, 2, 3, 3, 0, 3, 0, 2],
    [5, 0, 0, 3, 3, 3, 3, 3, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 2, 0, 0, 0, 3, 0, 2],
    [5, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2],
    [5, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
];

function drawMap() {
    const BASE_Y = -0.75; // Floor level
    const MAP_CENTER = 16; // Center offset for 32x32 grid

    for (let x = 0; x < 32; x++) {
        for (let z = 0; z < 32; z++) {
            const height = g_map[x][z];
            if (height > 0) {
                // Stack cubes vertically based on height value
                for (let h = 0; h < height; h++) {
                    const block = new Cube();
                    block.textureNum = 2; // Use solid color
                    block.matrix.translate(
                        x - MAP_CENTER,  // X position
                        BASE_Y + h,      // Y position (stacked)
                        z - MAP_CENTER   // Z position
                    );
                    block.renderFast([0.8, 0.2, 0.2, 1]); // Red color
                }
            }
        }
    }
}

function getBlockInFront() {
    const cameraX = g_camera.eye.elements[0];
    const cameraZ = g_camera.eye.elements[2];
    const forwardX = g_camera.at.elements[0] - g_camera.eye.elements[0];
    const forwardZ = g_camera.at.elements[2] - g_camera.eye.elements[2];
    const length = Math.sqrt(forwardX * forwardX + forwardZ * forwardZ);
    const normForwardX = forwardX / length;
    const normForwardZ = forwardZ / length;
    const blockX = Math.floor(cameraX + normForwardX * 2);
    const blockZ = Math.floor(cameraZ + normForwardZ * 2);
    const mapX = blockX + 16; // Offset to center the map
    const mapZ = blockZ + 16;
    return { x: mapX, z: mapZ };
}

function addBlock() {
    const block = getBlockInFront();
    const x = block.x;
    const z = block.z;

    if (x >= 0 && x < 32 && z >= 0 && z < 32) {
        g_map[x][z] += 1;
        console.log(`Added block at (${x}, ${z})`);
    } else {
        console.log("Out of map bounds");
    }
    renderAllShapes();
}

function deleteBlock() {
    const block = getBlockInFront();
    const x = block.x;
    const z = block.z;

    if (x >= 0 && x < 32 && z >= 0 && z < 32) {
        if (g_map[x][z] > 0) {
            g_map[x][z] -= 1;
            console.log(`Deleted block at (${x}, ${z})`);
        } else {
            console.log("No block to delete at this location");
        }
    } else {
        console.log("Out of map bounds");
    }
    renderAllShapes();
}

function renderAllShapes(){

    var startTime = performance.now();

    g_camera.updateProjectionMatrix(canvas.width / canvas.height);
    gl.uniformMatrix4fv(u_ProjectMatrix, false, g_camera.projectionMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

    var identityRotMat = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityRotMat.elements);

    if (g_mouseR){
        const globalRotMat = new Matrix4()
        .rotate(g_globalAngleY, 0, 1, 0) // Y-axis rotation
        .rotate(g_globalAngleX, 1, 0, 0); // X-axis rotation

        gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    } else {
        var globalRotMat= new Matrix4().rotate(g_globalCamAngle,0,1,0);
        gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    }
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

    drawMap();
    var floor = new Cube();
    floor.textureNum = 1;
    floor.matrix.translate(-16, -0.75, -16);
    floor.matrix.scale(32,0, 32);
    //floor.matrix.translate(-.12, 0, -.1);
    floor.render([0.439, 0.231, 0.055, 1]);

    var sky = new Cube();
    sky.textureNum = 0;
    sky.matrix.scale(1000,1000,1000);
    sky.matrix.translate(-.5, -.5, -0.5);
    sky.render();

    // Place the entire shape near (20, 28) on the map
    const MAP_CENTER = 16; // Center offset for 32x32 grid
    const targetX = 20 - MAP_CENTER; // Convert map coordinate to world space
    const targetZ = 28 - MAP_CENTER;

    var head = new Cube();
    head.color = [0.0, 1.0, 0.0, 1.0];
    head.textureNum = -2;
    head.matrix.translate(targetX+ 0.4, 0.03, targetZ); // Position at (20, 28)
    head.matrix.rotate(0, 0, 0, 1);
    var headCoord1 = new Matrix4(head.matrix);
    var headCoord2 = new Matrix4(head.matrix);
    var headCoord3 = new Matrix4(head.matrix);
    head.matrix.scale(0.4, 0.4, 0.4);
    head.render([0.6, 0.25, 0.035, 1]);

    var ear1 = new Pyramid();
    ear1.color = [0.439, 0.231, 0.055, 1];
    ear1.matrix = headCoord1;
    ear1.matrix.translate(.05, .35, 0.15);
    ear1.matrix.rotate(-90, 0, 0, 1);
    ear1.matrix.scale(0.6, 0.1, .2);
    ear1.render();

    var ear2 = new Pyramid();
    ear2.color = [0.439, 0.231, 0.055, 1];
    ear2.matrix = headCoord2;
    ear2.matrix.translate(.35, .35, 0.15);
    ear2.matrix.rotate(90, 0, 0, 1);
    ear2.matrix.scale(0.6, 0.1, .2);
    ear2.render();

    var body = new Cube();
    body.matrix.translate(targetX + 0.4, -0.4, targetZ - 0.1); // Position slightly offset from head
    body.matrix.rotate(90, 0, 0, 1);
    body.matrix.scale(0.5, 1, 0.6);
    body.render([0.6, 0.25, 0.035, 1]);

    var nose = new Pyramid();
    nose.color = [0.0, 0.0, 0.0, 1.0];
    nose.matrix = headCoord3;
    nose.matrix.translate(.21, .17, -0.001);
    nose.matrix.rotate(180, 0, 0, 1);
    nose.matrix.scale(.1, .1, .1);
    nose.render();

    var leftFront1 = new Cube();
    leftFront1.matrix.setTranslate(targetX + 0.3, -0.25, targetZ);
    leftFront1.matrix.rotate(210, 0, 0, 1);
    var leftFCoord = new Matrix4(leftFront1.matrix);
    leftFront1.matrix.scale(0.1, 0.3, 0.1);
    leftFront1.render([0.471, 0.31, 0.176, 1]);

    var leftFront2 = new Cube();
    leftFront2.matrix = leftFCoord;
    leftFront2.matrix.translate(0, 0.3, 0.001);
    leftFront2.matrix.rotate(0, 0, 0, 1);
    leftFront2.matrix.scale(0.1, 0.2, 0.1);
    leftFront2.render([0.922, 0.871, 0.827, 1]);

    var leftFPaw = new Cylinder();
    leftFPaw.color = [0.341, 0.173, 0.035, 1.0];
    leftFPaw.matrix = leftFCoord;
    leftFPaw.matrix.translate(0, 0.99, 0.7);
    leftFPaw.matrix.rotate(90, 90, 0, 1);
    leftFPaw.matrix.scale(2, 1, 0.4);
    leftFPaw.render();

    var leftBack1 = new Cube();
    leftBack1.matrix.setTranslate(targetX - 0.4, -0.25, targetZ);
    leftBack1.matrix.rotate(210, 0, 0, 1);
    var leftBCoord = new Matrix4(leftBack1.matrix);
    leftBack1.matrix.scale(0.1, 0.3, 0.1);
    leftBack1.render([0.471, 0.31, 0.176, 1]);

    var leftBack2 = new Cube();
    leftBack2.matrix = leftBCoord;
    leftBack2.matrix.translate(0, 0.3, 0.001);
    leftBack2.matrix.rotate(0, 0, 0, 1);
    leftBack2.matrix.scale(0.1, 0.2, 0.1);
    leftBack2.render([0.922, 0.871, 0.827, 1]);

    var leftBPaw = new Cylinder();
    leftBPaw.color = [0.341, 0.173, 0.035, 1.0];
    leftBPaw.matrix = leftBCoord;
    leftBPaw.matrix.translate(0, 0.99, 0.7);
    leftBPaw.matrix.rotate(90, 90, 0, 1);
    leftBPaw.matrix.scale(2, 1, 0.4);
    leftBPaw.render();

    // right
    var rightFront1 = new Cube();
    rightFront1.matrix.setTranslate(targetX + 0.3, -0.25, targetZ + 0.5);
    rightFront1.matrix.rotate(180, 0, 0, 1);
    var rightFCoord = new Matrix4(rightFront1.matrix);
    rightFront1.matrix.scale(0.1, 0.3, 0.1);
    rightFront1.render([0.471, 0.31, 0.176, 1]);

    var rightFront2 = new Cube();
    rightFront2.matrix = rightFCoord;
    rightFront2.matrix.translate(0, 0.3, 0.001);
    rightFront2.matrix.rotate(0, 0, 0, 1);
    rightFront2.matrix.scale(0.1, 0.2, 0.1);
    rightFront2.render([0.922, 0.871, 0.827, 1]);

    var rightFPaw = new Cylinder();
    rightFPaw.color = [0.341, 0.173, 0.035, 1.0];
    rightFPaw.matrix = rightFCoord;
    rightFPaw.matrix.translate(0, 0.99, 0.7);
    rightFPaw.matrix.rotate(90, 90, 0, 1);
    rightFPaw.matrix.scale(2, 1, 0.4);
    rightFPaw.render();

    var rightBack1 = new Cube();
    rightBack1.matrix.setTranslate(targetX - 0.4, -0.25, targetZ + 0.5);
    rightBack1.matrix.rotate(180, 0, 0, 1);
    var rightBCoord = new Matrix4(rightBack1.matrix);
    rightBack1.matrix.scale(0.1, 0.3, 0.1);
    rightBack1.render([0.471, 0.31, 0.176, 1]);

    var rightBack2 = new Cube();
    rightBack2.matrix = rightBCoord;
    rightBack2.matrix.translate(0, 0.3, 0.001);
    rightBack2.matrix.rotate(0, 0, 0, 1);
    rightBack2.matrix.scale(0.1, 0.2, 0.1);
    rightBack2.render([0.922, 0.871, 0.827, 1]);

    var rightBPaw = new Cylinder();
    rightBPaw.color = [0.341, 0.173, 0.035, 1.0];
    rightBPaw.matrix = rightBCoord;
    rightBPaw.matrix.translate(0, 0.99, 0.7);
    rightBPaw.matrix.rotate(90, 90, 0, 1);
    rightBPaw.matrix.scale(2, 1, 0.4);
    rightBPaw.render();

    var tail = new Pyramid();
    tail.color = [0.439, 0.231, 0.055, 1];
    tail.matrix.setTranslate(targetX - 0.7, -0.1, targetZ + 0.2);
    tail.matrix.rotate(115, 0, 0, 1);
    tail.matrix.scale(0.15, 0.6, 0.3);
    tail.render();
    
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps:  " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

