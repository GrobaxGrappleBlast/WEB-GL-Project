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
            this.handler.onFileRecieved(message.context );
            console.log(" ON MESSAGE ");
            //MessageBus.removeSubscription(MESSAGE_ASSET_LOADER_ASSET_LOADED +  this.requestStr, this);
        }
        
    }

