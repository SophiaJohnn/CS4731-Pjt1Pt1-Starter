let gl = null;
let program = null;
let canvas;
let matrixDrawn;
let matrixDrawnLocation;
let ctMatrix;
let modelMatrix;

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
    const view = xmlGetViewbox(xmlDoc, 70);
    // Get the lines & colors
    let [lines, colors] = xmlGetLines(xmlDoc, defaultColor);

    // create the vertices
    let points = [];
    for (let i = 0; i < lines.length; ++i) {
        points.push(lines[i][0]);
        points.push(lines[i][1]);
    }

    console.log("hello");

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

    console.log(view);


    matrixDrawnLocation = gl.getUniformLocation(program, 'matrixDrawn');
    gl.uniformMatrix4fv(matrixDrawnLocation, false, flatten(matrixDrawn));

    // var ctMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    //
    // modelMatrix = mat4();
    //
    // modelMatrix = mult(modelMatrix, scalem(1,-1,1));
    //
    // gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(modelMatrix));

    // Create an empty buffer object to store the vertex buffer
    var vertex_buffer = gl.createBuffer();

    //Bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    // Pass the vertex data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);    // BEFORE I USED new Float32Array(points)
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