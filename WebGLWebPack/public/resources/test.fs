	precision mediump float;

			varying vec2 fragTexCord;
			varying vec3 fragPosition;
			varying vec3 frag_normal;

			uniform sampler2D base;
			uniform sampler2D normal;
			uniform samplerCube cubeTexture;

			uniform vec3 eyePosition;

			vec3 rotate_to_normal(vec3 n, vec3 v) { 
				float sgn_nz = sign(n.z + 1.0e-12); 
				float a = -1.0/(1.0 + abs(n.z)); 
				float b = n.x*n.y*a; 
				return vec3(1.0 + n.x*n.x*a, b, -sgn_nz*n.x)*v.x 
					 + vec3(sgn_nz*b, sgn_nz*(1.0 + n.y*n.y*a), -n.y)*v.y 
					 + n*v.z; 
	   		}

			void main(){
				
				
				vec3 incident = ( eyePosition - fragPosition ) ;
				//gl_FragColor = vec4( test, 0.5 , 1.0 );

				vec3 ambINT   = vec3(0.4,0.4,0.4);	
				vec3 sunINT   = vec3(0.7,0.6,0.1);
				vec3 sunDIR   = normalize(vec3(1.0,-4.0,0.0));
				vec3 lightINT = ambINT + sunINT + dot( frag_normal , sunDIR ) ;

				vec4 texBase    = texture2D( base 	, fragTexCord	);
				vec4 texNormal  = texture2D( normal , fragTexCord	);

				
				vec4 cubeTex    = textureCube( cubeTexture 	,  reflect(incident,  frag_normal)  ); //normalize(frag_normal)	);

				
				//gl_FragColor = textureCube(cubeTexture, normalize(v_normal));
				//gl_FragColor = cubeTex; //vec4( texBase.rgb * lightINT , texBase.a ) + ;
				gl_FragColor = vec4( texBase.rgb * lightINT , texBase.a ) + ( 0.2 * cubeTex );
				
			}