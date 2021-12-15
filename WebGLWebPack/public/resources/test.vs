        precision mediump float;

            attribute vec3 a_position;
            attribute vec2 a_texCord;
			attribute vec3 a_normal;

            uniform mat4 worldMatrix;
            uniform mat4 viewMatrix;
            uniform mat4 projMatrix;
            

            varying vec3 fragmentPosition;
            void main(){
                vec4 test = vec4(a_normal + vec3(a_texCord, 1.0),0.0);
                fragmentPosition = ( worldMatrix * vec4(a_position,1.0) ).xyz ; 

				vec4 p = vec4(fragmentPosition,1.0) + (0.0 * test) ;
                gl_Position = projMatrix * viewMatrix * p;
            }