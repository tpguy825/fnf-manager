// we dont talk about this
export const apibaseurl = "https://raw.githubusercontent.com/tpguy825/fnf-manager-assets/main/" as const;
export const apiurl = `${apibaseurl}db.json` as const;

/* [expiry date, response] */
const cache = new Map<string, [number, string]>();

export async function get(url: string): Promise<string> {
	if (url.startsWith("/")) {
		url = apibaseurl + url.slice(1);
	}
	if (!cache.has(url) || cache.get(url)![0] < Date.now()) {
		const response = await fetch(url);
		const body = await response.text();
		cache.set(url, [
			// Date.now() + 1000 * 60 * 20, // 20 minutes
			Date.now() + 1, // 1ms testing
			body,
		]);
	}
	return cache.get(url)![1];
}

export async function json<T>(url: string): Promise<T> {
	const body = await get(url);
	console.log(body);
	return JSON.parse(body);
}
