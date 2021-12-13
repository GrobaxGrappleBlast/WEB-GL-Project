// SOURCE https://www.youtube.com/watch?v=HQbzO0xDuX8

import { gl } from "./webGlUtil";



	export class GLShader {

		public _name: string;
		private _program: WebGLProgram;

		private _attributes: { [name: string]: number } = {};
		private _uniforms: { [name: string]: WebGLUniformLocation } = {}
		private attrNames : string[] = [];
		private uniNames : string[]  = [];
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

	export class DefaultShader extends GLShader{

		public constructor(name : string){
	
			let  _vShaderSource : string = `
			precision mediump float; 	

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
				frag_normal = a_normal;
				frag_normal = normalize(a_position);//(worldMatrix * vec4(a_normal, 0.0)).xyz;

				gl_Position = (projMatrix * viewMatrix * worldMatrix *  vec4(a_position, 1.0))  ;
			}
			
			`;

			let _fShaderSource : string = `
			precision mediump float;

			varying vec2 fragTexCord;
			varying vec3 frag_normal;

			uniform sampler2D base;
			uniform samplerCube cubeTexture;

			void main(){
				
				//gl_FragColor = vec4( test, 0.5 , 1.0 );

				vec3 ambINT   = vec3(0.4,0.4,0.4);	
				vec3 sunINT   = vec3(0.7,0.6,0.1);
				vec3 sunDIR   = normalize(vec3(1.0,-4.0,0.0));
				vec3 lightINT = ambINT + sunINT + dot( frag_normal , sunDIR ) ;

				vec4 texBase    = texture2D( base 	, fragTexCord	);
				vec4 cubeTex    = textureCube( cubeTexture 	,  frag_normal  ); //normalize(frag_normal)	);

				//gl_FragColor = textureCube(cubeTexture, normalize(v_normal));
				//gl_FragColor = cubeTex; //vec4( texBase.rgb * lightINT , texBase.a ) + ;
				gl_FragColor = vec4( texBase.rgb * lightINT , texBase.a ) + ( 0.2* textureCube(cubeTexture,frag_normal));
				
			}
			`;
			super("GL SHADER ", _vShaderSource, _fShaderSource);
			
		}
	}

	export class DefaultShader2 extends GLShader{
		public constructor(name : string){
			let  _vShaderSource : string = `
			attribute vec3 a_position;
			attribute vec2 a_texCord;
			attribute vec3 a_normal;

			varying vec3 frag_normal;
			varying vec2 fragTexCord;
			varying vec3 v_normal;

			uniform mat4 worldMatrix;
			uniform mat4 viewMatrix;
			uniform mat4 projMatrix;
			
			void main() {

				fragTexCord = a_texCord;
				frag_normal = (worldMatrix * vec4(a_normal, 0.0)).xyz;
				gl_Position = (projMatrix * viewMatrix * worldMatrix) * vec4(a_position, 1.0);
				v_normal = normalize(a_position);
			}
			`;
			let _fShaderSource : string = `
			precision mediump float;

			varying vec3 v_normal;
			varying vec3 frag_normal;
			varying vec2 fragTexCord;

			uniform samplerCube u_texture;
			
			void main() {
			   gl_FragColor = textureCube(u_texture, normalize(v_normal));
			}
			`;
			super("DEFAULT SHADER 2", _vShaderSource, _fShaderSource);
		}
	}
	

