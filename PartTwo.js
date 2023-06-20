var canvas;
var gl;

var numTimesToSubdivide = 5;

var index = 0;

var pointsArray = [];
var normalsArray = [];


var near = -10;
var far = 10;

var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;

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

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
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
                    render(program, diffuseProduct, specularProduct, ambientProduct);
                    break;
                }
            case 'E':
                if(numTimesToSubdivide<5) {
                    numTimesToSubdivide += 1;
                    pointsArray = [];
                    normalsArray = [];
                    cube(va, vb, vc, vd, ve, vf, vg, vh, numTimesToSubdivide);
                    render(program, diffuseProduct, specularProduct, ambientProduct);
                    break;
                }
        }
    }

    render(program, diffuseProduct, specularProduct, ambientProduct);
}


function render(program, diffuseProduct, specularProduct, ambientProduct) {

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

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(0, 0, 1.5);

    modelViewMatrix = lookAt(eye, at , up);
    //let rTransormationMatrix = rotate(25, [10,0,1]);
    //modelViewMatrix = mult(modelViewMatrix, rTransormationMatrix);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);


    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );
}