attribute vec3 a_position;
attribute vec2 a_texCord;
attribute vec3 a_normal;

varying vec3 frag_normal;
varying vec2 fragTexCord;


uniform mat4 Ltransform;
uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 projMatrix;

void main(){
    fragTexCord = a_texCord;
    frag_normal = (worldMatrix * vec4(a_normal, 0.0)).xyz;
    vec4 vert = Ltransform * worldMatrix * vec4(a_position, 1.0);
    gl_Position = projMatrix * viewMatrix * worldMatrix * vert;
    
}