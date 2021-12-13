import { AssetManager, MESSAGE_ASSET_LOADER_ASSET_LOADED } from "./Assets/AssetManager";
import { IAsset } from "./Assets/IAsset";
import { IFileRequestResponse } from "./IFileRequestResponse";
import { IMessageHandler } from "./Message/IMessageHandler";
import { Message } from "./Message/Message";
import { MessageBus } from "./Message/MessageBus";


    export class FileRequest implements IMessageHandler{
        
        content : IAsset ;
        handler : IFileRequestResponse 
        requestStr : String;

        public constructor( requestString : string , handler : IFileRequestResponse ){

            this.requestStr = requestString;
            this.handler = handler;

            MessageBus.addSubscription(MESSAGE_ASSET_LOADER_ASSET_LOADED +  requestString, this);   
            this.content = AssetManager.getAsset(requestString);
            if( this.content != undefined || this.content != null){
                MessageBus.removeSubscription(MESSAGE_ASSET_LOADER_ASSET_LOADED +  requestString, this);        
                this.handler.onFileRecieved(this.content.data);
            }
        }
    
        onMessage(message : Message){
            this.handler.onFileRecieved( message.context );
            //MessageBus.removeSubscription(MESSAGE_ASSET_LOADER_ASSET_LOADED +  this.requestStr, this);
        }
    }

    export class FileRequestBundle implements IMessageHandler{
        
        
        private requestIndicies : number [] = [];
        private requests : string[] = [];
        private responses: IAsset[];
        private respCounter: boolean[];
        
        private handler : IFileRequestResponse ;

        public constructor( requests : string[] , handler : IFileRequestResponse ){

            this.handler = handler;
            this.responses = Array<IAsset>(requests.length);
            this.respCounter = Array<boolean>(requests.length).fill(false);

            requests.forEach( (req,i) => {
                this.requestIndicies.push(i);
                this.requests.push(req);
            });
            
            requests.forEach( (req,i) => {

                MessageBus.addSubscription(MESSAGE_ASSET_LOADER_ASSET_LOADED +  req, this);        
                this.responses[i] = AssetManager.getAsset(req);
                if( this.responses[i] != undefined || this.responses[i] != null){
                    MessageBus.removeSubscription(MESSAGE_ASSET_LOADER_ASSET_LOADED +  req, this);        
                    this.handler.onFileRecieved(this.responses[i].data);
                    this.respCounter[i] = true;
                }
            });
        }

        private matchesRequest( val : string ): number{
            for (let i = 0; i < this.requests.length; i++) {
                var req = this.requests[i];
                if( req == val )
                    return i
            }
            return -1;
        }

        public onMessage(message : Message){
            
            var match = this.matchesRequest(message.context.name);
            if(match < 0 )
                console.warn("MESSAGE NAME HAD NO MATCH IN REQUEST");

            this.responses[match] = message.context;
            this.respCounter[match] = true;
            
            var resp = true;
            this.respCounter.forEach( respBool => {
                if(!respBool)
                    resp = false;
            });

            if(resp)
                this.handler.onFileRecieved(  this.responses );
        }



    }

