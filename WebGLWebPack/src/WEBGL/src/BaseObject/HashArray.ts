export class HashArray<T>{

    private hashList : { [hash:string]:number } = {}
    private keyList : string[] = [];
    private elemList : T[] = []; 
    public length = 0;

    public a : Array<T> = new Array<T>()

    // ADD THINGS
    public add(element : T, hash :string){
        let h = hash.trim();
        if( !(this.hasIndex(h)) ){
            this.hashList[h] = this.length;
            this.elemList.push(element);
            this.keyList.push(h);
            this.length++;
        }
    }

    public addMKeys(element : T, hash :string[] ){
        this.add( element , hash[0]);
        this.applyKeysForindex( hash , this.getIndex(hash[0]) );
    }

    public GenerateCheckList<A>( value : A ){
        let arr :HashArray<A> = new HashArray<A>();
        this.keyList.forEach( n => {
            arr[n] = value;
        });
        return arr;
    }

    public applyKeysForindex( keys:string[] , index : number){
        if( !(this.elemList.length - 1 < index) ) // index is not larger than the length of the list
            if( !(index < 0)  ) // cannot be a negative index
                keys.forEach( key => {
                    let k : string = key.trim();
                    if( !this.hasIndex(k) ){
                        this.keyList.push(k);
                        this.hashList[k] = index;
                    }
                })
    }

    // CHANGETHINGS
    public change( element : T , i : number){
        this.elemList[i] = element;
    }
    
    public changeHash( element : T , hash:string){
        this.change( element, this.getIndex(hash.trim()) );
    }

    // GET THINGS 
    public get(i : number): T{
        if(i > this.length -1)
            return null;
        
        if(i < 0)
            return null;
        

        return this.elemList[i];
    }

    public getHash(hash:string): T{
        return this.elemList[  this.hashList[hash.trim()]  ];
    }

    public getIndex(hash:string):number{
        return this.hashList[hash.trim()];
    }

    public hasIndex(hash:string):boolean{
        if(this.length== 0)
            return false;

        if( this.hashList[hash.trim()] != null )
            return true;
        return false;
    }

    public forEach( callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void{
        for (let i = 0; i < this.elemList.length; i++) {
            callbackfn(this.get(i), i , this.elemList );
        }
    }

    // for removing this as a dependency
    public getElemList() : T[]{
        return this.elemList;
    }

    public getNameList():  { [hash:string]:number} {
        return this.hashList;
    }

    public getKeys(){
        return this.keyList;
    }

    public GetDiferences( newArr : HashArray<T> ){
        
        var used = new HashArray<number>();
        var diff = new HashArray<number>();

        this.keyList.forEach( k => {
            // for each key in the lsit 
            if( newArr.hasIndex(k) )
            {    // if the new array has this Aswell  

                if( used.get(this.getIndex(k)) == -1 ) 
                {// if the resulting index doesnot Already exists 
                    used.add( this.getIndex(k) , ""+this.getIndex(k) );
                }
                
            }else{  // if the index DOES NOT exist in the other list
                diff.add( this.getIndex(k), ""+this.getIndex(k) );
            }
        });
        return diff.elemList;
    }

}