// SOURCE https://www.youtube.com/watch?v=HQbzO0xDuX8

import { gl } from "./webGlUtil";
import { HashArray } from '../HashArray';



	export class GLShader {

		public _name: string;
		private _program: WebGLProgram;

		private _attributes: { [name: string]: number } = {};
		private _uniforms: { [name: string]: WebGLUniformLocation } = {}
		private attrNames : string[] = [];
		private uniNames : string[]  = [];

		public ShaderTextureData :HashArray<GlTexData> = new HashArray<GlTexData>();
		public getTextures() : GlTexData[]{
			return this.ShaderTextureData.getElemList();
		}

		/**
		 * Creates a new Shader Object, that contains vertex shader and fragment shader
		 * And a name for identification.
		 * @param name
		 * @param VertexSRC
		 * @param FragmentSRC
		 */
		public constructor(name: string, VertexSRC: string, FragmentSRC: string) {
			this._name = name;

			let vShader = this.loadShader(VertexSRC, gl.VERTEX_SHADER);

			let fShader = this.loadShader(FragmentSRC, gl.FRAGMENT_SHADER);
			this.createProgram(vShader, fShader);

			this.detectAttributes();
			this.detectUniforms();
		}

		public use(): void {
			gl.useProgram(this._program);
			this.checkForErrors();
		}

		public isInUse():boolean{
			return gl.isProgram(this._program);
		}

		private loadShader(src: string, shaderType: number): WebGLShader {

			let shader: WebGLShader = gl.createShader(shaderType);

			gl.shaderSource(shader, src);
			gl.compileShader(shader);

			let err = gl.getShaderInfoLog(shader);
			if (err !== "") {
				throw new Error("error compiling shader \n" + this._name + " " + err);
			}

			return shader;
		}

		private createProgram(vShader: WebGLShader, fShader: WebGLShader): void {

			this._program = gl.createProgram();
			gl.attachShader(this._program, vShader);
			gl.attachShader(this._program, fShader);
			gl.linkProgram(this._program);

			gl.linkProgram(this._program)
			if(!gl.getProgramParameter(this._program, gl.LINK_STATUS)){
				console.error("Error in Linking Program", gl.getProgramInfoLog(this._program));
				return;
			}
			this.checkForErrors();
		}

		private detectAttributes(): void {
			let aCount = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);
			for (let i = 0; i < aCount; i++) {
				let aInfo: WebGLActiveInfo = gl.getActiveAttrib(this._program, i);
				if (!aInfo) {
					break;
				}
				this._attributes[aInfo.name] = gl.getAttribLocation(this._program, aInfo.name);
				this.attrNames.push(aInfo.name);
			}

		}

		private detectUniforms(): void {
			let uCount = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
			for (let i = 0; i < uCount; i++) {
				let uInfo: WebGLActiveInfo = gl.getActiveUniform(this._program, i);
				if (!uInfo) {
					break;
				}
				this._uniforms[uInfo.name] = gl.getUniformLocation(this._program, uInfo.name);
				this.uniNames.push(uInfo.name);
			}
		}

		public getAttributeLocation(name: string): number {
			if (this._attributes[name] === undefined) {
				var a = this._attributes[name];
				var b = name;
				throw new Error("unable to find shader " + name + " in shader " + this._name);
			}
			return this._attributes[name];
		}

		public getUniformLocation(name: string): WebGLUniformLocation {
			if (this._uniforms[name] === undefined) {
				var a = this._uniforms[name];
				var b = name;
				throw new Error("unable to find uniform " + name + " in shader " + this._name);
			}
			return this._uniforms[name];
		}

		private checkForErrors():void{
			gl.validateProgram(this._program);
			if(!gl.getProgramParameter(this._program, gl.VALIDATE_STATUS)){
				console.error("Error in Validating Program", gl.getProgramInfoLog(this._program));
				return;
			}
			
			
			let err = gl.getProgramInfoLog(this._program);
			if (err !== "") {
				throw new Error("error Linking shader " + this._name + "\n" + err);
			}
		}
	}

	export class GlTexData{
		role:string;
		index:number;
		GLTexNum:number;
		public constructor(
			role  :string,
			index :number,
			GLTexNum:number
		){
			this.role  = role  ;
			this.index = index ;
			this.GLTexNum = GLTexNum;
		}
	}
	export class DefaultShader extends GLShader{

		public constructor(name : string){
			
			let  _vShaderSource : string = `
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

				gl_Position = (projMatrix * viewMatrix * worldMatrix * reflectionMatrix * vec4(a_position, 1.0))  ;
			}
			`;

			let _fShaderSource : string = `

			precision mediump float;

			varying vec2 fragTexCord;
			varying vec3 fragPosition;
			varying vec3 frag_normal;

			uniform sampler2D base;
			uniform sampler2D normal;
			uniform samplerCube cubeTexture;

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

		
			void main(){
				
				vec4 texBase    = texture2D( base 	, fragTexCord	);
				vec4 texNormal  = texture2D( normal , fragTexCord	);

				vec3 newNormal = rotate_to_normal( frag_normal , texNormal.xyz );
				vec3 incident =  eyePosition  - fragPosition   ;
				//gl_FragColor = vec4( test, 0.5 , 1.0 );

				vec3 ambINT   = vec3(0.4,0.4,0.4);	
				vec3 sunINT   = vec3(0.7,0.6,0.1);
				vec3 sunDIR   = normalize(vec3(1.0,-4.0,0.0));
				vec3 lightINT = ambINT + sunINT + dot( newNormal , sunDIR ) ;
				
				vec3 test =  reflect(incident,  newNormal);
				vec4 cubeTex    = textureCube( cubeTexture 	, frag_normal  ) + (0.0 * vec4(test,1.0) );  //normalize(frag_normal)	);

				//gl_FragColor = cubeTex; //vec4( texBase.rgb * lightINT , texBase.a ) + ;
				gl_FragColor = vec4( texBase.rgb * lightINT , 1.0 ) +  ( 0.2 * cubeTex );
				
			}


			`;

			super("DEFAULT_"+name, _vShaderSource, _fShaderSource);
			this.ShaderTextureData.add(new GlTexData("base"         ,0, gl.TEXTURE0),"diffuse"	);
			this.ShaderTextureData.add(new GlTexData("normal"  		,1, gl.TEXTURE1),"normal"	);
			this.ShaderTextureData.add(new GlTexData("cubeTexture"  ,2, gl.TEXTURE2),"reflection");
		}

	}

	export class ShaderBackground extends GLShader{
		public constructor(name : string){
			let  _vShaderSource : string = `
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
				frag_normal = normalize(a_position);//(worldMatrix *  vec4(a_normal, 0.0)).xyz;

				
                mat4 test = projMatrix * viewMatrix *worldMatrix ;
				gl_Position = (projMatrix *reflectionMatrix* viewMatrix   *  worldMatrix * vec4(a_position, 1.0)   );
			}
			
			`;
			let _fShaderSource : string = `
			precision mediump float;

			varying vec2 fragTexCord;
			varying vec3 fragPosition;
			varying vec3 frag_normal;

			uniform sampler2D base;
			uniform samplerCube cubeTexture;
			uniform vec3 eyePosition;
			uniform mat4 reflectionMatrix;

			void main(){
				
				
				vec3 incident = ( eyePosition - fragPosition ) ;
				//gl_FragColor = vec4( test, 0.5 , 1.0 );

				vec3 ambINT   = vec3(0.4,0.4,0.4);	
				vec3 sunINT   = vec3(0.7,0.6,0.1);
				vec3 sunDIR   = normalize(vec3(1.0,-4.0,0.0));
				vec3 lightINT = ambINT + sunINT + dot( frag_normal , sunDIR ) ;

				vec4 texBase    = texture2D( base 	, fragTexCord	);
				vec4 cubeTex    = textureCube( cubeTexture 	,  reflect(incident,  frag_normal)  ); //normalize(frag_normal)	);

				//gl_FragColor = textureCube(cubeTexture, normalize(v_normal));
				//gl_FragColor = cubeTex; //vec4( texBase.rgb * lightINT , texBase.a ) ;
				gl_FragColor =  (  textureCube( cubeTexture ,  frag_normal ) );
				
			}
			`;
			super("BACKGROUND_", _vShaderSource, _fShaderSource);
			this.ShaderTextureData.add(new GlTexData("base"         ,0, gl.TEXTURE0),"diffuse");
			this.ShaderTextureData.add(new GlTexData("cubeTexture"  ,1, gl.TEXTURE1),"reflection");
		}
	}
	

	export class DefaultShadowShader extends GLShader{

		public constructor(name : string){
			
			let  _vShaderSource : string = `
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

				gl_Position = (projMatrix * viewMatrix * worldMatrix * reflectionMatrix * vec4(a_position, 1.0))  ;
			}
			`;

			let _fShaderSource : string = `

			
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
				vec3 lightINT = ambINT + sunINT + Lightintencity() ;
				
				vec3 test =  reflect(incident,  newNormal);
				vec4 cubeTex    = textureCube( cubeTexture 	, frag_normal  ) + (0.0 * vec4(test,1.0) );  //normalize(frag_normal)	);

				//gl_FragColor = cubeTex; //vec4( texBase.rgb * lightINT , texBase.a ) + ;
				gl_FragColor = vec4(  Lightintencity(),Lightintencity(),Lightintencity()  , 1.0 ) +  ( 0.2 * cubeTex ) + (0.0 * vec4(texBase.rgb,1.0));
				
			}


			`;

			super("SHADOW_"+name, _vShaderSource, _fShaderSource);
			this.ShaderTextureData.add(new GlTexData("base"         	,1, gl.TEXTURE1),"diffuse"	);
			this.ShaderTextureData.add(new GlTexData("normal"  			,2, gl.TEXTURE2),"normal"	);
			this.ShaderTextureData.add(new GlTexData("cubeTexture"  	,3, gl.TEXTURE3),"reflection");
			this.ShaderTextureData.add(new GlTexData("shadowTexture"  	,0, gl.TEXTURE0),"shadowTexture");
			
			// uniform vec3 LightPosition;
			// uniform vec2 shadowClipNearFar;
		}

	}
