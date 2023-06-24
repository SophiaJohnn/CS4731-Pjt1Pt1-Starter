var canvas;
var gl;

var numTimesToSubdivide = 0;

var index = 0;

var pointsArray = [];
var normalsArray = [];

var near = -10;
var far = 10;

var left = -5.0;
var right = 5.0;
var ytop = 5.0;
var bottom = -5.0;

// All the vertices in the cube
var va = vec4( -0.5, -0.5,  0.5, 1.0 );
var vb = vec4( -0.5,  0.5,  0.5, 1.0 );
var vc = vec4(  0.5,  0.5,  0.5, 1.0 );
var vd = vec4(  0.5, -0.5,  0.5, 1.0 );
var ve = vec4( -0.5, -0.5, -0.5, 1.0 );
var vf = vec4( -0.5,  0.5, -0.5, 1.0 );
var vg = vec4(  0.5,  0.5, -0.5, 1.0 );
var vh = vec4(  0.5, -0.5, -0.5, 1.0 );

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var program;

// Control vertices for line
let lineControlPoints = [
    vec4(-1, -1, 0.0, 1.0),
    vec4(-1.5, -1.5, 0.0, 1.0),
    vec4(-1.5, 1.5, 0.0, 1.0),
    vec4(5, 1.5, 0.0, 1.0),
    vec4(5, -1.5, 0.0, 1.0),
    vec4(1, -1, 0.0, 1.0),
    vec4(-1, -2, 0.0, 1.0)
];
var dragX = 0;
var dragY = 0;
var dragZ = 0;

// Keyboard control info
let lineSubdivisions = 0;

let animation = false;

let linePoints = [];
let i = 0;
let increment = 0.5;
let FieldOfView =  60;
let Aspect = 1;
let NearPlane = 1;
let FarPlane = 2000;

function triangle(a, b, c) {
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    // normals are vectors
    normalsArray.push(a[0],a[1], a[2], 0.0);
    normalsArray.push(b[0],b[1], b[2], 0.0);
    normalsArray.push(c[0],c[1], c[2], 0.0);

    index += 3;
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}

function cube(a, b, c, d, e, f, g, h, n) {
    divideTriangle(b, c, a, n);
    divideTriangle(c, a, d, n);
    divideTriangle(f, g, e, n);
    divideTriangle(g, e, h, n);
    divideTriangle(c, d, g, n);
    divideTriangle(d, g, h, n);
    divideTriangle(b, a, f, n);
    divideTriangle(a, f, e, n);
    divideTriangle(b, c, f, n);
    divideTriangle(c, f, g, n);
    divideTriangle(a, d, e, n);
    divideTriangle(d, e, h, n);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    var ambientProduct = mult(lightAmbient, materialAmbient);

    // rotate(0, 0, 0);
    cube(va, vb, vc, vd, ve, vf, vg, vh, numTimesToSubdivide);

    window.onkeypress = function(event) {
        var key = event.key;
        switch(key) {
            case 'Q':
                if(numTimesToSubdivide === 0)
                {
                    break;
                }
                if(numTimesToSubdivide>0) {
                    numTimesToSubdivide -= 1;
                    pointsArray = [];
                    normalsArray = [];
                    cube(va, vb, vc, vd, ve, vf, vg, vh, numTimesToSubdivide);
                    render(diffuseProduct, specularProduct, ambientProduct);
                    break;
                }
            case 'E':
                if(numTimesToSubdivide<5) {
                    numTimesToSubdivide += 1;
                    pointsArray = [];
                    normalsArray = [];
                    cube(va, vb, vc, vd, ve, vf, vg, vh, numTimesToSubdivide);
                    render(diffuseProduct, specularProduct, ambientProduct);
                    break;
                }
            case 'A':
                animation = !animation;
                if(animation === true)
                {
                    animate();
                }
                break;
            case 'I':
                if(lineSubdivisions === 0)
                {
                    break;
                }
                if(lineSubdivisions>0)
                {
                    lineSubdivisions -= 1;
                    render(diffuseProduct, specularProduct, ambientProduct);

                    break;
                }
            case 'J':
                if(lineSubdivisions<7)
                {
                    lineSubdivisions += 1;
                    render(diffuseProduct, specularProduct, ambientProduct);

                    break;
                }
        }
    }

    render(diffuseProduct, specularProduct, ambientProduct);
}

function animate()
{
    if(linePoints.length > i) {
        let drag = mix(linePoints[i], linePoints[i+1], increment);
        dragX = drag[0];
        dragY = drag[1];
        dragZ = drag[2];
        increment+=0.1
        drawSphere(dragX, dragY, 0);
        if(animation===true)
        {
            requestAnimationFrame(animate);
        }
    }

}

function render(diffuseProduct, specularProduct, ambientProduct) {
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(4, 2, 10);

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(FieldOfView, Aspect, NearPlane, FarPlane);


    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    drawSphere(dragX,dragY,dragZ);
}


function drawSphere(x, y, z){
    const dTranslateMatrix = translate(x, y, z);
    const modelMatrix = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(modelMatrix, false, flatten(dTranslateMatrix));

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    var vNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormalPosition = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition);

    pointsArray =[];
    normalsArray = [];
    cube(va, vb, vc, vd, ve, vf, vg, vh, numTimesToSubdivide);

    for(let i=0; i<index; i+=3) {
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }

    linePoints = chaikin(lineControlPoints, lineSubdivisions);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(linePoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Draw line (loop to close the end)
    gl.drawArrays(gl.LINE_LOOP, 0, linePoints.length);
}






// chaikin() recursively subdivides a line using Chaikin's corner cutting algorithm
function chaikin(vertices, iterations) {
    // Recursive end condition
    if (iterations === 0) {
        return vertices;
    }

    // New vertices after corner-cutting
    var newVertices = [];

    // Constant corner cutting ratio of 1/4
    var ratio = 0.25;

    for (let i = 0; i < vertices.length - 1; i++) {
        // Get starting and ending vertices of line segment to cut
        var v0 = vertices[i];
        var v1 = vertices[i + 1];

        // Cut vertices and add to list
        // Calculate first new point
        var p0 = mix(v0, v1, ratio);

        // Calculate second new point
        var p1 = mix(v0, v1, (1.0 - ratio));
        newVertices.push(p0, p1);
    }

    // Recursively call to subdivide
    return chaikin(newVertices, iterations - 1);
}

