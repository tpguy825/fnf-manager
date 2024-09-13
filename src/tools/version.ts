import { type ProjectApi } from "./zodjson";
import { input, sha512 } from "./shared";
import { apibaseurl } from "../api";
import path from "path";

const results: ProjectApi["versions"] = [];

const id = await input("Project ID: ");
const platform = (await input("Overall platform [linux/windows/both]: ")) as "linux" | "windows" | "both";
let shouldcontinue = true;
while (shouldcontinue) {
	const v = await input("Version: v");
	const platform = (await input("Platform [linux/windows/both]: ")) as "linux" | "windows" | "both";
	const changes = (await input("Changelist [use \\n for newline]: ")).replaceAll("\\n", "\n");
	if (!["linux", "windows", "both"].includes(platform)) {
		console.error("Invalid platform");
		process.exit(1);
	}
	let win: undefined | { url: string; hash: string; filename: string };
	if (platform === "both" || platform === "windows") {
		const url = await input("Windows download URL: ");
		const filename = await input("Filename (as given by add.ts): ");

		const file = await fetch(url).then(async (r) => {
			// progress
			const reader = r.body?.getReader();
			if (!reader) {
				throw new Error("No reader");
			}
			const chunks = [];
			let loading = true;

			// Declare received as 0 initially
			let received = 0,
				total = Number(r.headers.get("content-length")),
				start = performance.now();

			// Loop through the response stream and extract data chunks
			while (loading) {
				const { done, value } = await reader.read();
				if (done) {
					// Finish loading
					loading = false;
				} else {
					// Push values to the chunk array
					chunks.push(value);
					received += value.length;
					process.stdout.write(
						"\rProgress: " +
							((received / total) * 100).toFixed(2) +
							"% downloaded (" +
							((received / 1024 / (performance.now() - start)) * 1000).toFixed(2) +
							"KB/s avg)",
					);
				}
			}

			// Concat the chinks into a single array
			let body = new Uint8Array(received);
			let position = 0;

			// Order the chunks by their respective position
			for (let chunk of chunks) {
				body.set(chunk, position);
				position += chunk.length;
			}

			return Buffer.from(body).buffer;
		});
		const hash = sha512(file);
		console.log("\n\nHash:", hash);
		const fullpath = `${id}/${v}-${filename}`;
		let fullurl = apibaseurl + fullpath;
		const suitable = ["", "y", "yes"].includes(
			(await input("Is the file alright for direct client download? [Y/n]: ")).toLowerCase().trim(),
		);
		if (!suitable) {
			console.log("Hosted url:", fullurl);
			console.log("Local path:", path.join("./fnf-manager-assets/", fullpath));
			await Bun.write(path.join("./fnf-manager-assets/", fullpath), file);
		} else {
			fullurl = url;
			console.log("Hosted url:", fullurl);
		}

		win = { url: fullurl, hash, filename };
	}

	let linux: undefined | { url: string; hash: string; filename: string };
	if (platform === "both" || platform === "linux") {
		const url = await input("Linux download URL: ");
		const filename = await input("Filename (as given by add.ts): ");

		const file = await fetch(url).then(async (r) => {
			// progress
			const reader = r.body?.getReader();
			if (!reader) {
				throw new Error("No reader");
			}
			const chunks = [];
			let loading = true;

			// Declare received as 0 initially
			let received = 0,
				total = Number(r.headers.get("content-length")),
				start = performance.now();

			// Loop through the response stream and extract data chunks
			while (loading) {
				const { done, value } = await reader.read();
				if (done) {
					// Finish loading
					loading = false;
				} else {
					// Push values to the chunk array
					chunks.push(value);
					received += value.length;
					process.stdout.write(
						"\rProgress: " +
							((received / total) * 100).toFixed(2) +
							"% downloaded (" +
							((received / 1024 / (performance.now() - start)) * 1000).toFixed(2) +
							"KB/s avg)",
					);
				}
			}

			// Concat the chinks into a single array
			let body = new Uint8Array(received);
			let position = 0;

			// Order the chunks by their respective position
			for (let chunk of chunks) {
				body.set(chunk, position);
				position += chunk.length;
			}

			return Buffer.from(body).buffer;
		});
		const hash = sha512(file);
		console.log("\n\nHash:", hash);
		const fullpath = `${id}/${v}-${filename}`;
		let fullurl = apibaseurl + fullpath;
		const suitable = ["", "y", "yes"].includes(
			(await input("Is the file alright for direct client download? [Y/n]: ")).toLowerCase().trim(),
		);
		if (!suitable) {
			console.log("Hosted url:", fullurl);
			console.log("Local path:", path.join("./fnf-manager-assets/", fullpath));
			await Bun.write(path.join("./fnf-manager-assets/", fullpath), file);
		} else {
			fullurl = url;
			console.log("Hosted url:", fullurl);
		}

		linux = { url: fullurl, hash, filename };
	}

	const modified = new Date().toISOString();
	const isdefault = ["", "y", "yes"].includes(
		(await input("Is this the default version? [Y/n]: ")).toLowerCase().trim(),
	);

	results.push({ v, win, linux, changes, platform, modified, default: isdefault });

	if (!["y", "yes", ""].includes(await input("Add another? [Y/n]: "))) {
		shouldcontinue = false;
	}
}

console.log("\n\n", JSON.stringify({ platform, versions: results }));
process.exit(0);

('{platform: "windows",versions: [{v: "1.5",win: {url: "https://raw.githubusercontent.com/01J7PRCTE19HSPV2TKGAMCGP42/1.5-vsibbv15.zip",hash: "36901c3fc106e09136a065ca9456fb7a36fc5883faf77f4ecf65b05fb4b1128f67a677dc15c0dec33883f604020777e30365f44724df153bfa56af468e38ebfd",filename: "vsibbv15.zip",},linux: undefined,changes: "",platform: "windows",modified: "2024-09-13T22:45:43.896Z",default: true,}],}');
