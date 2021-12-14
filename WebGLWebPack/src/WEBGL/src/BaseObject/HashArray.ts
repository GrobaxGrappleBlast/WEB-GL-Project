export class HashArray<T>{

    private hashList : { [hash:string]:number } = {}
    private keyList : string[] = [];
    private elemList : T[] = []; 
    public length = 0;

    public a : Array<T> = new Array<T>()


    // ADD THINGS
    public add(element : T, hash :string){
        if( !(this.hasIndex(hash)) ){
            this.hashList[hash] = this.length;
            this.elemList.push(element);
            this.keyList.push(hash);
            this.length++;
        }
    }
    


    public GenerateCheckList<A>( value : A ){
        let arr :HashArray<A> = new HashArray<A>();
        this.keyList.forEach( n => {
            arr[n] = value;
        });
        return arr;
    }

    // CHANGETHINGS
    public change( element : T , i : number){
        this.elemList[i] = element;
    }
    
    public changeHash( element : T , hash:string){
        this.change( element, this.getIndex(hash) );
    }

    // GET THINGS 
    public get(i : number): T{
        return this.elemList[i];
    }

    public getHash(hash:string): T{
        return this.elemList[  this.hashList[hash]  ];
    }

    public getIndex(hash:string):number{
        return this.hashList[hash];
    }

    public hasIndex(hash:string):boolean{
        if( this.hashList[hash] != null )
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
}