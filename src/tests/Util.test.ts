import {fetchList} from '../modules/Util';

describe('fetch list', () => {

    test('throws on network based fetch failure', async () => {
        await expect(fetchList('not a url')).rejects.toThrow(Error);
    });

    test('throws on fetch not ok', async () => {
        // provided url should return 404
        await expect(fetchList('https://google.com/404')).rejects.toThrow(Error);
    });

    test('resolves for a real url', async () => {
        const url = 'https://gist.githubusercontent.com/ahamburger/8f609c3a57aee907bd426ef66cd6fb1a/raw/1bef175bfa7da130f0f1ea723b625f0f9a0ce5cb/desmos_distracting_words';
        let forbidden: string[] = await fetchList(url);
        expect(forbidden).toBeDefined();
    });

});