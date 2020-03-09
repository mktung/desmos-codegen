import {ClassCode} from '../modules/ClassCode';

describe('class code generator', () => {

    let math_random_spy: jest.SpyInstance<number, []>;
    const alpha_num = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    const alpha_num_without_a = alpha_num.slice(1);
    const alpha_num_without_abc = alpha_num.slice(3);

    // mock random to always return 0.5 at the start of each test
    beforeEach(() => {
        math_random_spy = jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
        math_random_spy.mockRestore();
    });
    
    test('generates 6 char uppercase alphanumeric code', () => {    
        let code_gen: ClassCode = new ClassCode([]);
        expect(code_gen.getCode()).toHaveLength(6);
        expect(code_gen.getCode()).toMatch(/[A-Z0-9]/);
    });

    test('different random values result in different codes', () => {
        let code_gen: ClassCode = new ClassCode([]);
        let code: string = code_gen.getCode();
        math_random_spy = jest.spyOn(global.Math, 'random').mockReturnValue(0);
        expect(code).not.toMatch(code_gen.newCode());
    });
    
    test('fails with forbidden empty string', () => {
        // jest requires throwing functions to be wrapped to test
        expect(() => {
            new ClassCode([''])
        }).toThrow(new Error('Cannot add the empty string to the list of forbidden words')); 
    });

    test('fails with no valid words', () => {
        expect(() => {
            new ClassCode(alpha_num); 
        }).toThrow(new Error('The set of forbidden words does not allow any valid codes'));
    });

    test('interprets forbidden words as case insensitive', () => {
        expect(() => {
            new ClassCode(alpha_num_without_a.concat(['a'])); 
        }).toThrow(Error);
    });

    test('will not generate codes with ambiguous chars', () => {
        expect(() => {
            new ClassCode(alpha_num.filter(char => {
                return (char != 'I' && char != 'L' && char != '1' && char != '0' && char != 'O')
            }));
        }).toThrow(Error);
    });

    test('finds code with a single valid char', () => {
        let code_gen: ClassCode = new ClassCode(alpha_num_without_a); 
        expect(code_gen.getCode()).toMatch('AAAAAA');
    });

    test('ignores invalid forbidden words', () => {
        let code_gen: ClassCode = new ClassCode(alpha_num_without_a.concat(['AAAAAAA', 'A!'])); 
        expect(code_gen.getCode()).toMatch('AAAAAA');
    });

    test('combine multiple forbidden words to find a single answer', () => {
        let code_gen: ClassCode = new ClassCode(alpha_num_without_abc.concat(['AA', 'BA', 'BBBBB', 'CB', 'CC'])); 
        expect(code_gen.getCode()).toMatch('ABBBBC');
    });

});