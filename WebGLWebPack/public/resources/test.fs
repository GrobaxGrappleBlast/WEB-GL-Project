
			
			precision mediump float;

			varying vec2 fragTexCord;
			varying vec3 fragPosition;
			varying vec3 frag_normal;

			uniform samplerCube shadowTexture;
			uniform sampler2D base;
			uniform sampler2D normal;
			uniform samplerCube cubeTexture;
			uniform vec3 LightPosition;
			uniform vec2 shadowClipNearFar;
			
			uniform vec3 eyePosition;

			vec3 rotate_to_normal(vec3 n, vec3 v) { 
				v *= 0.5;
				float sgn_nz = sign(n.z + 1.0e-12); 
				float a = -1.0/(1.0 + abs(n.z)); 
				float b = n.x*n.y*a; 
				return vec3(1.0 + n.x*n.x*a, b, -sgn_nz*n.x)*v.x 
					 + vec3(sgn_nz*b, sgn_nz*(1.0 + n.y*n.y*a), -n.y)*v.y 
					 + n*v.z; 
	   		}

			// https://github.com/sessamekesh/IndigoCS-webgl-tutorials/blob/master/Shadow%20Mapping/shaders/Shadow.fs.glsl
			float Lightintencity(){
				vec3 toLightNormal = normalize(LightPosition - fragPosition);
				float fromLightToFrag =
					(length(fragPosition - LightPosition) - shadowClipNearFar.x)
					/
					(shadowClipNearFar.y - shadowClipNearFar.x);

				float shadowMapValue = textureCube(shadowTexture, -toLightNormal).r;

				float lightIntensity = 0.6;
				if ((shadowMapValue + 0.01) >= fromLightToFrag) {
					lightIntensity += 0.4 * max(dot(frag_normal, toLightNormal), 0.0);
				}
				return lightIntensity;
			}

			void main(){
				
				vec4 texBase    = texture2D( base 	, fragTexCord	);
				vec4 texNormal  = texture2D( normal , fragTexCord	);

				vec3 newNormal = rotate_to_normal( frag_normal , texNormal.xyz );
				vec3 incident =  eyePosition  - fragPosition   ;
				//gl_FragColor = vec4( test, 0.5 , 1.0 );

				vec3 ambINT   = vec3(0.4,0.4,0.4);	
				vec3 sunINT   = vec3(0.7,0.6,0.1);
				vec3 sunDIR   = normalize(vec3(1.0,-4.0,0.0));
				vec3 lightINT = ambINT + sunINT + Lightintencity() ;
				
				vec3 test =  reflect(incident,  newNormal);
				vec4 cubeTex    = textureCube( cubeTexture 	, frag_normal  ) + (0.0 * vec4(test,1.0) );  //normalize(frag_normal)	);

				//gl_FragColor = cubeTex; //vec4( texBase.rgb * lightINT , texBase.a ) + ;
				gl_FragColor = vec4(  Lightintencity(),Lightintencity(),Lightintencity()  , 1.0 ) +  ( 0.2 * cubeTex ) + (0.0 * vec4(texBase.rgb,1.0));
				
			}
