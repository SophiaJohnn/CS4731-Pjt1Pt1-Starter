let gl = null;
let program = null;
let canvas;
let matrixDrawn;
let matrixDrawnLocation;
let ctMatrix;
let modelMatrix;
let dragX = null;
let dragY = null;
let startingPoint = 0;
let theta = 0;
let sf = 1;
let finalRendition;
let view = [];

function main()
{
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas, undefined);

    //Check that the return value is not null.
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    //Set up the viewport
    gl.viewport( 0, 0, 400, 400);

    // Listen to the file upload event
    const input = document.querySelector("input");
    input.addEventListener("input", fileUpload)

}
function processFile(f) {
    const defaultColor = 0x000000; // makes the default color black (change it to a color picker or rainbow get extra credit)
    // convert the svg string to XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(f.target.result, 'image/svg+xml');
    // Compute the viewbox
    view = xmlGetViewbox(xmlDoc, [0,0,1,1]);
    // Get the lines & colors
    let [lines, colors] = xmlGetLines(xmlDoc, defaultColor);

    // create the vertices
    let points = [];
    for (let i = 0; i < lines.length; ++i) {
        points.push(lines[i][0]);
        points.push(lines[i][1]);
    }

    //Fixing the sizing issue
    if(view[2] > view[3]) {
        gl.viewport(0,0, canvas.width, canvas.height * (view[3]/view[2]));
    }
    else if (view[3] > view[2]) {
        gl.viewport(0,0, canvas.width * (view[2]/view[3]), canvas.height);
    }
    else {
        gl.viewport(0,0, canvas.width, canvas.height);
    }
    // gl.viewport(0,0, canvas.width, canvas.height);

    // Creating the window correctly
    matrixDrawn = ortho(view[0], view[0] + view[2],
        view[1] + view [3], view[1], -1, 1);

    //
    // matrixDrawn = ortho(-1, 1, -1, 1, 0.1, 100);

    ctMatrix = mult(scalem(1, -1, 1), matrixDrawn);

    matrixDrawnLocation = gl.getUniformLocation(program, 'matrixDrawn');
    gl.uniformMatrix4fv(matrixDrawnLocation, false, flatten(matrixDrawn));

    // For dragging image
    canvas.addEventListener("mousedown", function (e){
        startingPoint = {x: e.clientX, y: e.clientY};
    });
    canvas.addEventListener ("mousemove", function(e) {
        if(e.buttons === 1) {
            const current = {x: e.clientX, y: e.clientY};
            dragX = ((current.x-startingPoint.x) * view[2])/canvas.width;
            dragY = ((current.y-startingPoint.y) * view[3])/canvas.height;
            // clears buffer/canvas
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.clearColor(255, 255, 255, 255);
            render(points, colors);
        }
    })
    canvas.addEventListener("onwheel" in document ? "wheel" : "mousewheel", function(evt) {
        console.log("hi");
        if (evt.deltaY > 0) {
            if (theta === 360) {
                theta = 0;
            } else {
                theta += 1;
            }
        } else {
            if (theta === -360) {
                theta = 0;
            } else {
                theta -= 1;
            }
        }
        if (evt.shiftKey === true) {
        //SCALE - how do i check if shift key is pressed
            if (evt.deltaY > 0 && sf < 10) {
                sf += 0.1;
            } else if (evt.deltaY < 0 && sf > 0.1) {
            sf -= 0.1;
        }
    }
        render(points, colors);
    });
    //Resets it back to the original picture
    window.onkeypress = function(event) {
        var key = event.key;
        switch(key) {
            case 'r':
                gl.clearColor(255, 255, 255, 255);
                gl.clear(gl.COLOR_BUFFER_BIT);
                console.log(points);
                console.log(colors);
                dragX=0;
                dragY=0;
                theta = 0;
                sf=1;
                render(points, colors);
        }

    }

    // console.log(points, colors);

    render(points, colors);

}
function render(points, colors){
    var tempMatrix = mat4();
    var translateMatrix = translate(dragX, dragY, 0);

    var rotateMatrix = rotate(theta, [0, 0, 1]);
    var scaleMatrix = scalem(sf, sf, 1);
    var centerTMatrix = translate(view[2]/2 + view[0], view[3]/2 + view[1], 0);
    console.log(view);
    var backTMatrix = translate(-(view[2]/2+view[0]), -(view[3]/2+view[1]), 0);

    finalRendition = mult(centerTMatrix, scaleMatrix);
    finalRendition = mult(finalRendition, rotateMatrix);
    finalRendition = mult(finalRendition, translateMatrix);
    finalRendition = mult(finalRendition, backTMatrix);

    var modelMatrix = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(modelMatrix, false, flatten(finalRendition));


    var vertex_buffer = gl.createBuffer();

    //Bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    // Pass the vertex data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    // Unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    // Get the attribute location
    var coord = gl.getAttribLocation(program, "vPosition");
    // Point an attribute to the currently bound buffer
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    // Enable the attribute
    gl.enableVertexAttribArray(coord);

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor")
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vColor);

    // Draw the svg

    // Clear the canvas
    gl.clearColor(255, 255, 255, 255);
    // Draw the triangle
    gl.drawArrays(gl.LINES, 0, points.length/2);
}

function fileUpload(evt) {
    // read the file
    const file = readTextFile(evt);
    // Process when the file changes
    file.addEventListener("load", processFile);
}
