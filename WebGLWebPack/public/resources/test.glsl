
            precision mediump float;
			varying vec2 fragTexCord;
			varying vec3 frag_normal;
			uniform sampler2D base;

			void main(){
				vec3 ambINT   = vec3(0.4,0.4,0.4);	
				vec3 sunINT   = vec3(0.7,0.6,0.1);
				vec3 sunDIR   = normalize(vec3(1.0,-4.0,0.0));
				vec3 lightINT = ambINT + sunINT + dot( frag_normal , sunDIR ) ;
				mat4 texBase  = texture2D( base 	,fragTexCord	);
				gl_FragColor  = vec4( texBase.rgb * lightINT , texBase.a );// + texEmit ;
				
			}