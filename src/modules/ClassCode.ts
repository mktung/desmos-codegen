// helper structure that is initialized once on ClassCode construction 
interface RecursiveMap<T> extends Map<T, RecursiveMap<T>> {}
    
// generates class codes with newCode(), initialized with an array of forbidden strings
// forbidden words will not be in a generated code consecutively or nonconsecutively
export class ClassCode {

    // all codes are 6 characters long
    private static code_length: number = 6;

    // codes use [A-Z] and [0-9], excluding ambiguous characters [I,L,1,0,O]
    private static all_valid_chars: string[] = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'.split('');
    
    // tree representation of a list of forbidden strings
    // directly subsequent characters map to parent and children nodes, e.g. "XY" -> X is the parent of Y
    // nonconsecutive forbidden words are represented with wildcard nodes, having the name 'wildcard'
    private forbidden_tree: RecursiveMap<string>;

    // the most recently generated code
    private code: string;

    // initialize the forbidden_tree and set a new code 
    constructor(forbidden_words: string[]) {
        this.forbidden_tree = this.loadForbiddenTree(forbidden_words);
        this.code = this.newCode();
    }

    // generate a new tree based on the list of forbidden words
    private loadForbiddenTree(forbidden_words: string[]): RecursiveMap<string> {          
        this.forbidden_tree = new Map();
        forbidden_words.forEach(str => {
            this.addToForbiddenTree(str);
        });
        return this.forbidden_tree;
    }

    // add an new word to this.forbidden_tree, defaulting as nonconsecutive 
    private addToForbiddenTree(word: string, consecutive: boolean = false): boolean {
        // the empty string is a subset of all strings, making all strings invalid if it's forbidden 
        if (word == '') {
            throw new Error('Cannot add the empty string to the list of forbidden words');
        }

        // adding forbidden words is case insensitive, only uppercase are valid chars
        word = word.toUpperCase();

        // remove forbidden words that are too long to fit in a code or contain invalid chars
        if (word.length > ClassCode.code_length || 
            word.split('').some(char => !ClassCode.all_valid_chars.includes(char))) {
                return false;
        }

        // move a pointer along the tree as each char is added, so words can share nodes
        let ptr: RecursiveMap<string> = this.forbidden_tree;
        let arr: string[] = word.split('');

        // if the word is forbidden nonconsecutively, add a wildcard node every other char 
        if (!consecutive) {
            let arr_with_wildcard: string[] = [];
            arr.forEach((char: string) => {
                arr_with_wildcard.push('wildcard');
                arr_with_wildcard.push(char);
            })
            arr = arr_with_wildcard;
        }

        // enter each char into the tree
        while (arr.length > 0) {
            const char: string = arr[0];
            // if the word has a new character at this position, create a new map nod for it
            // OR if a forbidden word is the direct subset of another, overwrite with the subset
            if (!ptr.has(char) || arr.length == 1) {
                ptr.set(char, new Map());
            }
            ptr = ptr.get(char)!;
            arr = arr.slice(1, arr.length);
        }

        if (this.isDeadend(this.forbidden_tree)) {
            throw new Error('The set of forbidden words does not allow any valid codes');
        }

        return true;
    }

    // if every valid character is a leaf node to the root, it is a deadend
    private isDeadend(node: RecursiveMap<string>): boolean {
        // if the node is a leaf
        if (!node.size) return true;

        // find every child leaf or wildcard's child leaf
        let invalid_chars: Set<string> = new Set();
        node.forEach((child: RecursiveMap<string>, child_name: string) => {
            if (!child.size) invalid_chars.add(child_name); 
            if (child_name == 'wildcard') {
                child.forEach((child2: RecursiveMap<string>, child2_name: string) => {
                    if (!child2.size) invalid_chars.add(child2_name); 
                });
            }
        });

        return (invalid_chars.size == ClassCode.all_valid_chars.length);
    }

    // generate new code
    public newCode(): string {
        let new_code: string = '';

        // have pointers step through the forbidden tree, following each generated character
        let forbidden_ptrs: RecursiveMap<string>[] = [this.forbidden_tree];

        // separately track wildcard pointers, as they should be checked at every step of generation
        let wildcard_ptrs: RecursiveMap<string>[] = [];
        if (this.forbidden_tree.has('wildcard')) {
            wildcard_ptrs.push(this.forbidden_tree.get('wildcard')!);
        }

        // generate each character sequentially
        for (let i=0; i<ClassCode.code_length; i++) {
            let valid_chars: string[] = ClassCode.all_valid_chars.slice();
            let invalid_chars: string[] = [];

            // mark all dead end children on the pointers as invalid chars
            forbidden_ptrs.concat(wildcard_ptrs).forEach(node => {
                node.forEach((child: RecursiveMap<string>, child_name: string) => {
                    if (this.isDeadend(child)) {
                        invalid_chars.push(child_name);
                    }
                });
            });

            // remove invalid characters from a list of valid possibilities
            valid_chars = valid_chars.filter(char => !invalid_chars.includes(char));

            // if the current code leads to a nontrivial deadend, add it to the forbidden tree and try again 
            if (!valid_chars.length) {
                this.addToForbiddenTree(new_code, true);
                return this.newCode();
            }
            
            // append a random char from the possible valid chars
            let next_char: string = valid_chars[Math.floor(Math.random()*valid_chars.length)];
            new_code += next_char;

            // shift pointers to the latest added char 
            let new_forbidden_ptrs: RecursiveMap<string>[] = [];
            forbidden_ptrs.concat(wildcard_ptrs).forEach((node: RecursiveMap<string>) => {
                if (node.has(next_char)) new_forbidden_ptrs.push(node.get(next_char)!);
            });
            forbidden_ptrs = new_forbidden_ptrs;

            // get new wildcard pointers
            forbidden_ptrs.forEach(ptr => {
                ptr.forEach((child: RecursiveMap<string>, child_name: string) => {
                    if (child_name == 'wildcard') {
                        wildcard_ptrs.push(child);
                    }
                });
            });
        }   

        this.code = new_code;
        return this.code;
    }

    // return the last generated code
    public getCode(): string {
        return this.code;
    }
}