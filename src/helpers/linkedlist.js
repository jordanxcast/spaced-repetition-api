const LanguageService = require('../language/language-service')

class _Node {
  constructor(value, next) {
    this.value=value,
    this.next=next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertFirst(item){
    this.head = new _Node(item, this.head);
  }
  insertLast(item){
    console.log('item in insert last', item);
    if(this.head === null){
      this.insertFirst(item);
    }
    else{
      let tempNode = this.head;
      while(tempNode.next !== null){
        tempNode = tempNode.next;
      }
      const insertedNode = new _Node(item, null);
      tempNode.value.next = insertedNode.value.id;
      tempNode.next = insertedNode;
    }
  }
  insertAt(nthPosition, itemToInsert) {
    if (nthPosition < 0) {
      throw new Error('Position error');
    }
    if (nthPosition === 0) {
      this.insertFirst(itemToInsert);
    }else {
      // Find the node which we want to insert after
      const node = this._findNthElement(nthPosition - 1);
      const newNode = new _Node(itemToInsert, null);
      newNode.next = node.next; 
      newNode.value.next = node.next.value.id,
      node.next = newNode;

      return newNode;
    }
  }
  
  _findNthElement(position) {
    let node = this.head;
    for (let i=0; i<position; i++) {
      node = node.next;
    }
    return node;
  }
}

module.exports = LinkedList;