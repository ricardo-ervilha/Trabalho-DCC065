export class Queue{
    constructor(){
        this.count = 0; //tamanho da fila
        this.lowestCount = 0; //Variável para controlar o primeiro elemento
        this.items = {}; //objeto para armazenar os elementos
    }

    //Método para adicionar um elemento no fim da fila
    enqueue(element){
        this.items[this.count] = element;
        this.count++;
    }

    //Método para remover e retornar o elemento no início da fila
    dequeue(){
        if(!this.is_empty()){
            const aux = this.items[this.lowestCount];
            delete this.items[this.lowestCount];
            this.lowestCount++;
            return aux;
        }else{
            return undefined;
        }
    }

    //Devolve o primeiro elemento da fila.
    peek(){
        if(!this.is_empty()){
            return this.items[this.lowestCount];
        }
        return undefined;
    }

    //Retorna o total de elementos na fila
    size(){
        return this.count - this.lowestCount;
    }

    //Verifica se a pilha está vazia.
    is_empty(){
        return this.size() == 0;
    }

    //Limpa a fila
    clear(){
        this.items = {};
        this.count = 0;
        this.lowestCount = 0;
    }

    toString(){
        for(var i = this.lowestCount; i < this.count; i++){
            console.log(`${this.items[i]}`);
        }
    }
}