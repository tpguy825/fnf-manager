export function input(prompt: string): Promise<string> {
	return new Promise((resolve) => {
		process.stdout.write(prompt);
		process.stdin.once("data", (data) => {
			resolve(data.toString().trim());
		});
	});
}

export function sha512(data: Bun.BlobOrStringOrBuffer): string {
	const hasher = new Bun.SHA512();
	hasher.update(data);
	return hasher.digest("hex");
}
