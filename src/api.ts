// we dont talk about this
const apiurl = "https://gist.githubusercontent.com/tpguy825/53b22abc92b34033271d43763aaa551f/raw/fnf-manager.json";

/* [expiry date, response] */
const cache = new Map<string, [number, string]>();

export async function get(url: string): Promise<string> {
	if (!cache.has(url) || cache.get(url)![0] < Date.now()) {
		const response = await fetch(url);
		const body = await response.text();
		cache.set(url, [
			Date.now() + 1000 * 60 * 20, // 20 minutes
			body,
		]);
	}
	return cache.get(url)![1];
}

export async function json<T>(url: string): Promise<T> {
	const body = await get(url);
	return JSON.parse(body);
}

type DBApi = {

}
