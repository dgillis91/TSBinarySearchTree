/**Function interface for a function which compares
 * two generic elements and returns a number in 
 * (-1, 0, 1) as a subset of the integers.
 */
export interface Comparator<T> {
    (left: T, right: T): -1 | 0 | 1;
}

interface Container {
    isEmpty(): boolean;
    length: number;
}

interface SearchTree<T, U> {
    insert(key: T, payload: U): void;
    search(key: T): U;
    delete(key: T): U;
}

/**A generic node which is used as a tree element. The _key property
 * can be any element. This can be a complex type. We also house many
 * methods which help in the tree structure. This class isn't exposed
 * to the client.
 */
class TreeNode<T, U> {
    constructor(private _key: T,
                private _payload: U,
                private _parentNode: TreeNode<T, U> = null,
                private _leftNode: TreeNode<T, U> = null,
                private _rightNode: TreeNode<T, U> = null) {
    }

    toString() {
        return `Key: ${this.key}\nPayLoad: ${this.payload}\n`;
    }

    /**Returns true if this node is the root.*/
    isRoot(): boolean { return (this.parentNode === null); }
    /**Returns true if this is a left child.*/
    isLeftChild(): boolean { return (!this.isRoot() && this.parentNode.leftNode === this); }
    /**Returns true if this is a right child.*/
    isRightChild(): boolean { return (!this.isRoot() && this.parentNode.rightNode === this); }

    /**Finds the maximum child of this node. Returns the current node if there is no
     * right sub tree (this is a leaf).
    */
    public maximum(): TreeNode<T, U> {
        // Traverse the tree until there are no right nodes. This implies that there
        // is no node with a key value greater than the iterator node.
        let nodeIterator: TreeNode<T, U> = this;
        while (nodeIterator.rightNode !== null) nodeIterator = nodeIterator.rightNode;
        return nodeIterator;
    }

    /**Finds the minimum child of this node. Returns the current node if this is a leaf.*/
    public minimum(): TreeNode<T, U> {
        // Traverse the tree until there is no left node. This implies that there is no
        // node with a key value less than the iterator.
        let nodeIterator: TreeNode<T, U> = this;
        while (nodeIterator.leftNode !== null) nodeIterator = nodeIterator.leftNode;
        return nodeIterator;
    }

    /**Find the minumum node greater than this node.*/
    public successor(): TreeNode<T, U> {
        // If there is a right node, then the node which is greater than this
        // is the minimum in the right tree.
        if (this.rightNode !== null)
            return this.rightNode.minimum()

        // Otherwise, we move up the tree until we are the left child of the parent.
        // That is, the current node is less than the parent.
        let nodeIterator: TreeNode<T, U> = this;
        while (nodeIterator.isRightChild()) nodeIterator = nodeIterator.parentNode;
        return nodeIterator.parentNode;
    }

    /**Finds the maximum node less than this node.*/
    public predecessor(): TreeNode<T, U> {
        // If there is a left node, the node that comes before this one is in
        // that sub tree. We simply get the max. 
        if (this.leftNode !== null)
            return this.leftNode.maximum();

        // Otherwise, we move up the tree until we change directions.
        let nodeIterator: TreeNode<T, U> = this;
        while (nodeIterator.isLeftChild()) nodeIterator = nodeIterator.parentNode;
        return nodeIterator.parentNode;
    }

    get parentNode(): TreeNode<T, U> { return this._parentNode; }
    set parentNode(value) { this._parentNode = value; }
    get leftNode(): TreeNode<T, U> { return this._leftNode; }
    set leftNode(value) {this._leftNode = value; }
    get rightNode(): TreeNode<T, U> { return this._rightNode; }
    set rightNode(value) { this._rightNode = value; }
    get key(): T { return this._key; }
    set key(value) { this._key = value; }
    get payload() { return this._payload; }
}

export enum TreePrintMode {
    INORDER, PREORDER, POSTORDER
}

export class BinarySearchTree<T, U> implements Container, SearchTree<T, U> {
    private _length: number;
    private _comp: Comparator<T>;
    private _root: TreeNode<T, U>;
    private _treePrintMode: TreePrintMode;

    constructor(comp: Comparator<T>, printMode: TreePrintMode = TreePrintMode.INORDER) {
        this._length = 0;
        this._comp = comp;
        this._root = null;
        this._treePrintMode = printMode;
    }

    /**Number of elements in the tree.*/
    get length(): number { return this._length; }
    get treePrintMode(): TreePrintMode { return this._treePrintMode; }
    set treePrintMode(value: TreePrintMode) { this._treePrintMode = value; }

    /**Returns true if the length is 0.*/
    isEmpty(): boolean { return this.length === 0; }

    printInOrder(node: TreeNode<T, U> = null) {
        if (node !== null) {
            this.printInOrder(node.leftNode);
            console.log(node.toString());
            this.printInOrder(node.rightNode);
        }
    }

    printPreOrder(node: TreeNode<T, U> = null) {
        if (node !== null) {
            console.log(node.toString());
            this.printPreOrder(node.leftNode);
            this.printPreOrder(node.rightNode);
        }
    }

    printPostOrder(node: TreeNode<T, U> = null) {
        if (node !== null) {
            this.printPostOrder(node.leftNode);
            this.printPostOrder(node.rightNode);
            console.log(node.toString());
        }
    }

    print(printMode: TreePrintMode = TreePrintMode.PREORDER) {
        if (printMode === TreePrintMode.INORDER) 
            this.printInOrder(this._root);
        else if (printMode === TreePrintMode.PREORDER)
            this.printPreOrder(this._root);
        else this.printPostOrder(this._root);
    }

    /**Insert the `payload` into the tree with `key`.
     * @param key - to insert.
     * @param payload - the data to insert.
     */
    public insert(key: T, payload: U): void {
        /**To keep track of the previous node as we traverse the tree.*/
        let insertParent: TreeNode<T, U> = null;
        /**An iterator to traverse the tree.*/
        let insertIterator: TreeNode<T, U> = this._root;
        /**Value to be returned by the comparison function.*/
        let compareValue: number = 0;
        
        // Iterate through the tree until we pass a leaf.
        while (insertIterator !== null) {
            // Get the parent of the iterator.
            insertParent = insertIterator;
            // Get the comparison value.
            compareValue = this._comp(key, insertIterator.key);
            // If the data is less than the current node, go left.
            if (compareValue < 0)
                insertIterator = insertIterator.leftNode;
            // Otherwise, go right.
            else insertIterator = insertIterator.rightNode;
        }

        // Allocate the new node and set the parent. Note that this handles
        // the root if the tree was empty. In this case, we never enter the loop,
        // so the parent gets set to null.
        /**Node we insert into the tree.*/
        let newNode: TreeNode<T, U> = new TreeNode(key, payload, insertParent);

        // Handle assigning the parent's values. 
        // First, if we are adding to the root, we assign the tree's root node.
        if (insertParent === null)
            this._root = newNode;
        // If the new node is a left child.
        else if (compareValue < 0)
            insertParent.leftNode = newNode;
        // Otherwise, the new node is a right child.
        else insertParent.rightNode = newNode;

        ++this._length;
    }

    /**Return the payload associated with `key`.
     * @param key - the key to search for. 
     */
    public search(key: T): U {
        let foundNode: TreeNode<T, U> = this._nodeSearch(key);
        return (foundNode === null ? null : foundNode.payload);
    }

    /**Internal method used to search for a node, given `key`.
     * If `key` isn't found, null is returned.
     * @param key - the key to search for.
     */
    private _nodeSearch(key: T) {
        /**The node we use to traverse the tree.*/
        let nodeIterator: TreeNode<T, U> = this._root;
        /**Variable to hold the result of the comparison.*/
        let compareValue: number = 0;

        // Iterate over the tree until we pass a leaf.
        while (nodeIterator !== null) {
            // Get the comparison value.
            compareValue = this._comp(key, nodeIterator.key);
            // If we found the node, break out of the loop.
            if (compareValue === 0)
                break;
            // If the key is less than the iterator's key, go left.
            if (compareValue < 0)
                nodeIterator = nodeIterator.leftNode;
            // Otherwise, fo right.
            else nodeIterator = nodeIterator.rightNode;
        }

        // Return the node.
        return nodeIterator;
    }

    public delete(key: T): U {
        // Perform a search to find the node to delete.
        let nodeToDelete: TreeNode<T, U> = this._nodeSearch(key);

        // Keep track of the node we will actually remove from the tree,
        // and the node we will replace it with.
        let deleted: TreeNode<T, U>, replacement: TreeNode<T, U>;
        deleted = replacement = null;
        
        // If the search didn't yield results, return null.
        if (nodeToDelete === null)
            return null;

        // Get the node that we will delete.
        // If the node to delete has two children, we have to get a successor 
        // to replace it.
        if (nodeToDelete.leftNode !== null && nodeToDelete.rightNode !== null)
            deleted = nodeToDelete.successor();
        // Otherwise, we just use the node passed in, and replace this with its child.
        else deleted = nodeToDelete;

        // Find the node to replace it.
        // If use the left child, if it exists, otherwise use the right.
        replacement = deleted.leftNode === null ? deleted.rightNode : deleted.leftNode;

        // Set the parent of the replacement, to the parent of the node we are deleting.
        if (deleted.parentNode)
            replacement.parentNode = deleted.parentNode;

        // Set the root, if necessary. Handle setting the children of the deleted node's parent.
        if (deleted.isRoot())
            this._root = replacement;
        else if (deleted.isLeftChild())
            deleted.parentNode.leftNode = replacement;
        else deleted.parentNode.rightNode = replacement;

        if (deleted != nodeToDelete) {
            let temp: T = nodeToDelete.key;
            nodeToDelete.key = deleted.key;
        }

        --this._length;
        return deleted.payload;
    }
}

class Program {
    static main(): number {
        let values = ["cat", "dog", "chicken", "hen"];

        let bst = new BinarySearchTree<number, string>(function(a, b) {
            if (a < b) return -1;
            if (a === b) return 0;
            if (a > b) return 1;
        });

        for (let i = 0; i < values.length; ++i) {
            bst.insert(i, values[i]);
            console.log(`Length after insert of values[${i}]: ${bst.length}`);
        }

        bst.print(TreePrintMode.INORDER);
    
        return 0;
    }
}

Program.main();