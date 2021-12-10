## HOW TO LAUNCH 

run commands 

npm install

npm run serve 


## note

note that in some of the weeks i use three.js to convert frmo quarternion rotation to euler. but nothing more than that 

## NOTES FOR QUESTIONS 

I part 1 i used orthegraphic view matrix in World.ts abstract AWorld
public projMatrix   : mat4 = mat4.orthographic(-10,10,-10,10,-10,10) //mat4.perspective( toRadians(45), ( gl.canvas.width / gl.canvas.height), 0.1,1000 );

part 2 i used 
mat4.perspective( toRadians(45), ( gl.canvas.width / gl.canvas.height), 0.1,1000 );

the formulae is  projMatrix * viewMatrix  * worldMatrix * VertexVector 