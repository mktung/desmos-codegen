import fetch from 'node-fetch';

// fetch a list of newline separated words
export async function fetchList(url: string): Promise<string[]> {
    const res = await fetch(url).catch(() => {
        throw new Error('Network or permission failure when fetching list');
    });
    if (!res.ok) {
        throw new Error('Fetching list: ' + res.statusText);
    }
    const text = await res.text();
    return text.split('\n');
}