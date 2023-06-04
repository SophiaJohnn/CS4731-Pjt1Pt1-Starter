// Retrieve <canvas> element
let canvas = document.getElementById('webgl');

// Get the rendering context for WebGL
let gl = WebGLUtils.setupWebGL(canvas, undefined);
function main()
{
    //Check that the return value is not null.
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    let program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    //Set up the viewport
    gl.viewport( 0, 0, 400, 400);

    var points = [];
    // var points = partOne();
    points.push(vec4(-0.5, -0.5, 0.0, 1.0));
    points.push(vec4(0.5, -0.5, 0.0, 1.0));
    points.push(vec4(0.0, 0.5, 0.0, 1.0));

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, points.length)

    // partOne();
    // use an event listener and a button and u call a fucntion that takes in the file
}
function partOne() // (like void) set an array of points that is from -1 to 1 like i have from lines 24-26
{
    document.getElementById("files").addEventListener(
        'change', function partTwo(event) {
            let reader = readTextFile(event);
            reader.onload = function(){
                gl.clear(gl.COLOR_BUFFER_BIT);
                let parser  = new DOMParser();
                let xmlDoc = parser.parseFromString(reader.result, "image/svg+xml");
                let dimension = xmlGetViewbox(xmlDoc, DEF_VIEWBOX);
                let lines = xmlGetLines(xmlDoc, DEF_LINECOLOR); // do the right scaling from -1 to 1 using viewbox, then pass it to the webgl
                lines.





            }
            console.log("hello");
        }
    );
    //when that is clicked partTwo is called
}
// function partThree() // converts the file from an svg file to an  xml file (look at the faq to see more)
//
// function partFour () // take the xml and call the read get lines and viewbox to see the data?

