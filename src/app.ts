import {fetchList} from './modules/Util';
import {ClassCode} from './modules/ClassCode';

async function setCode() {
    const url = 'https://gist.githubusercontent.com/ahamburger/8f609c3a57aee907bd426ef66cd6fb1a/raw/1bef175bfa7da130f0f1ea723b625f0f9a0ce5cb/desmos_distracting_words';
    let forbidden_words: string[] = await fetchList(url);
    let code_gen: ClassCode = new ClassCode(forbidden_words); 
    let el = document.getElementById('app');
    if (el) {
        el.innerText = code_gen.getCode();
    }
}

setCode();