	precision mediump float; 	

			attribute vec3 a_position;
			attribute vec2 a_texCord;
			attribute vec3 a_normal;

			varying vec3 frag_normal;
			varying vec2 fragTexCord;
			varying vec3 fragPosition;

			uniform mat4 Ltransform;
			uniform mat4 worldMatrix;
			uniform mat4 viewMatrix;
			uniform mat4 projMatrix;
			uniform mat4 reflectionMatrix;

			void main(){
				fragPosition = vec3( vec4(a_position,1.0) * worldMatrix );
				fragTexCord = a_texCord;
				frag_normal = a_normal;
				frag_normal = normalize(a_position);//(worldMatrix * vec4(a_normal, 0.0)).xyz;


                mat4 r = projMatrix ;//.inverse();
				gl_Position = (projMatrix * viewMatrix * worldMatrix* vec4(a_position, 1.0))  ;//+ (vec4(0,0,0,0)*test) ;
			}