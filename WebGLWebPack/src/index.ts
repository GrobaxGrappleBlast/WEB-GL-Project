
import { startClass } from './WEBGL/src/main';
import { gl, WebGLUtil } from './WEBGL/src/BaseObject/GL/webGlUtil';
import { AssetManager } from './WEBGL/src/Loader/Assets/AssetManager';
import { GLShader } from './WEBGL/src/BaseObject/GL/GLShader';
import { mat4 } from './WEBGL/src/Math/TSM_Library/mat4';
import { vec3 } from './WEBGL/src/Math/TSM_Library/vec3';
import { toRadians } from './WEBGL/src/Math/TSM_Library/constants';
/// <reference lib="dom" />


var start : startClass;
window.onload = ()=>{
    
    document.querySelector('#C_FILTERID').addEventListener("change", function() {
        changeFilterMethod(this);
    });

    document.querySelector('#C_OTHERID').addEventListener("change", function() {
        changeOtherMethod(this);
    });

    start = new startClass();
}


export function changeFilterMethod( e ){
    console.log("CALLED" + e.value );
    switch(e.value){
        case "0":
            start.updateFilter( gl.LINEAR )
        break;    
        case "1":
            start.updateFilter( gl.NEAREST )
        break;
        case "2":
            start.updateFilter( gl.LINEAR_MIPMAP_LINEAR )
        break;  
    } 
}

export function changeOtherMethod( e ){
    console.log("CALLED");
    switch(e.value){
        case "0":
            start.updateOther( gl.CLAMP_TO_EDGE )
        break;    
        case "1":
            start.updateOther( gl.REPEAT )
        break;
    } 
}


/*
window.onload = ()=>{
"use strict";

var a = AssetManager.initialize();
var b = WebGLUtil.initialize("canvas");
var shader: GLShader;

var camPos      = new vec3([10,10,10]);
var lookAt      = new vec3([ 0,0,0]);
var zDirection  = new vec3([ 0,1,0]);
var worldMatrix  : mat4 = mat4.getIdentity(); 
var viewMatrix   : mat4 = mat4.lookAt( camPos, lookAt, zDirection);
var projMatrix   : mat4 = mat4.perspective( toRadians(45), ( gl.canvas.width / gl.canvas.height), 0.1,1000 );


function main() {
  
    shader = new DefaultShader2("GLSHADER");
    var positionLocation = shader.getAttributeLocation("a_position");
    var textureLocation = shader.getUniformLocation("u_texture");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl);

    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    
// ### ### ### ### ### ### ### ### ### ### ### ### ### ### ### ### ### ### 

    const ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = 128;
    ctx.canvas.height = 128;

    const faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, faceColor: '#F00', textColor: '#0FF', text: '+X' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, faceColor: '#FF0', textColor: '#00F', text: '-X' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, faceColor: '#0F0', textColor: '#F0F', text: '+Y' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, faceColor: '#0FF', textColor: '#F00', text: '-Y' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, faceColor: '#00F', textColor: '#FF0', text: '+Z' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, faceColor: '#F0F', textColor: '#0F0', text: '-Z' },
    ];

    faceInfos.forEach((faceInfo) => {
        const {target, faceColor, textColor, text} = faceInfo;
        generateFace(ctx, faceColor, textColor, text);
        gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
    });
    
    gl.generateMipmap(  gl.TEXTURE_CUBE_MAP );
    gl.texParameteri(   gl.TEXTURE_CUBE_MAP , gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

//    ### ###  ### ###  ### ###  ### ###  ### ###  ### ###  ### ###  ### ###  ### ### 
  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene() {
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    shader.use();

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


    gl.vertexAttribPointer( positionLocation, 3,  gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(  shader.getUniformLocation(       "worldMatrix"  )    , false, worldMatrix.values );
    gl.uniformMatrix4fv(  shader.getUniformLocation(       "viewMatrix"   )    , false, viewMatrix.values );
    gl.uniformMatrix4fv(  shader.getUniformLocation(       "projMatrix"   )    , false, projMatrix.values );
    
    gl.uniform1i(textureLocation, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);

    requestAnimationFrame(drawScene);
  }
}

function generateFace(ctx, faceColor, textColor, text) {
  const {width, height} = ctx.canvas;
  ctx.fillStyle = faceColor;
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${width * 0.7}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;
  ctx.fillText(text, width / 2, height / 2);
}

// Fill the buffer with the values that define a cube.
function setGeometry(gl) {
  var positions = new Float32Array(
    [
    -0.5, -0.5,  -0.5,
    -0.5,  0.5,  -0.5,
     0.5, -0.5,  -0.5,
    -0.5,  0.5,  -0.5,
     0.5,  0.5,  -0.5,
     0.5, -0.5,  -0.5,

    -0.5, -0.5,   0.5,
     0.5, -0.5,   0.5,
    -0.5,  0.5,   0.5,
    -0.5,  0.5,   0.5,
     0.5, -0.5,   0.5,
     0.5,  0.5,   0.5,

    -0.5,   0.5, -0.5,
    -0.5,   0.5,  0.5,
     0.5,   0.5, -0.5,
    -0.5,   0.5,  0.5,
     0.5,   0.5,  0.5,
     0.5,   0.5, -0.5,

    -0.5,  -0.5, -0.5,
     0.5,  -0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,  -0.5,  0.5,
     0.5,  -0.5, -0.5,
     0.5,  -0.5,  0.5,

    -0.5,  -0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,   0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,   0.5,  0.5,
    -0.5,   0.5, -0.5,

     0.5,  -0.5, -0.5,
     0.5,   0.5, -0.5,
     0.5,  -0.5,  0.5,
     0.5,  -0.5,  0.5,
     0.5,   0.5, -0.5,
     0.5,   0.5,  0.5,

    ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

main();


}
*/