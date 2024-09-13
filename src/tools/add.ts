import { ulid } from "ulid";
import { check, ProjectApi, type DBApi } from "./zodjson";
import DOMPurify from "isomorphic-dompurify";
import { input } from "./shared";

const db: false | DBApi = await check();

if (!db) {
	console.error("DB is invalid");
	process.exit(1);
}

const isbanana = (await input("Is this project on GameBanana? (Y/n): ")).toLowerCase().trim();

if (["y", "", "yes"].includes(isbanana)) {
	const gamebanana = await input("GameBanana URL: ");
	if (!gamebanana) {
		console.error("GameBanana URL is required");
		process.exit(1);
	}

	const gbid = gamebanana.split("/").map(Number).filter(Number.isInteger).pop();
	if (!gbid) {
		console.error("Invalid GameBanana URL");
		process.exit(1);
	}

	const response = await fetch(`https://gamebanana.com/apiv11/Mod/${gbid}/ProfilePage`).then(
		(r) => r.json() as Promise<RootObject>,
	);

	let i = 0;
	for (let c of response._aCredits) {
		console.log("[" + i + "]", c._sGroupName);
		for (let a of c._aAuthors) {
			console.log("  - ", a._sName, a._sRole);
		}
		i++;
	}
	const group = Number(await input("Select the group with the main authors [0-" + (i - 1) + "]: "));
	if (!(group in response._aCredits)) {
		console.error("Invalid group");
		process.exit(1);
	}
	const allauthors: ProjectApi["authors"] = response._aCredits
		.reduce((acc, c) => acc.concat(c._aAuthors), [] as AAuthor[])
		.map((a) => ({ name: a._sName, role: a._sRole, main: undefined }));

	i = 0;
	for (let a of response._aCredits[group]._aAuthors) {
		console.log("[" + i + "]", a._sName);
		i++;
	}
	const author = await input(
		"Select the main author [0-" + (i - 1) + " or csv for multiple or custom author name]: ",
	);
	let multiple: number[];
	if (Number.isInteger(author) && Number(author) in response._aCredits[group]._aAuthors) {
		allauthors.find((a) => a.name === response._aCredits[group]._aAuthors[Number(author)]._sName)!.main = true;
	} else if (author === "") {
		console.error("Author is required");
		process.exit(1);
	} else if ((multiple = author.split(",").map(Number).filter(Number.isInteger)) && multiple.length) {
		for (let m of multiple) {
			allauthors.find((a) => a.name === response._aCredits[group]._aAuthors[m]._sName)!.main = true;
		}
	} else {
		// e.g. Funkin Crew on preview, actual people on itemview
		allauthors.push({ name: author, role: "_special", sidehide: true, main: true });
	}
	const id = ulid();

	// download files
	console.log("Now, the files... you're gonna have to do this part maunally.");
	console.log("1. download these files:");
	for (let f of response._aFiles) {
		console.log("  -", f._sFile, "from", f._sDownloadUrl);
	}
	console.log("2. Run 'bun src/tools/version.ts' to add the files to the project");
	console.log("3. Follow the steps there (version is", response._sVersion + ", project ID is", id + ")");
	const versionres: { versions: ProjectApi["versions"]; platform: ProjectApi["platforms"] } = JSON.parse(
		await input("3. Come back here and paste the result: "),
	);

	const projectentry: ProjectApi = {
		name: response._sName,
		id,
		url: gamebanana,
		subtitle: response._sDescription,
		description: DOMPurify.sanitize(response._sText),

		images: {
			banner: response._aPreviewMedia._aImages[0]._sBaseUrl + response._aPreviewMedia._aImages[0]._sFile100,
			icon: response._aGame._sIconUrl,
		},
		updated: new Date(response._tsDateUpdated * 1000).toISOString(),
		versions: versionres.versions,
		platforms: versionres.platform,
		authors: allauthors,
	};

	const dbentry: DBApi["projects"][number] = {
		name: response._sName,
		id,
		subtitle: response._sDescription,
		platforms: projectentry.platforms,
		authors: projectentry.authors,
		images: projectentry.images,
		url: gamebanana,
	};

	console.log(
		`=== DB entry ===\n${JSON.stringify(dbentry, null, 4)}\n=== project entry ===\n${JSON.stringify(projectentry, null, 2)}`,
	);

	const finalise = ["y", "yes"].includes(await input("Is this correct? [y/N]"));
	if (!finalise) {
		console.error("Aborted");
		process.exit(1);
	}

	db.projects.push(dbentry);
	await Bun.write("./fnf-manager-assets/db.json", JSON.stringify(db, null, 4));
	await Bun.write("./fnf-manager-assets/" + id + "/index.json", JSON.stringify(projectentry, null, 2));

	console.log("Done!");
}

process.exit(0);

interface RootObject {
	_aPreviewMedia: APreviewMedia;
	_sName: string;
	_nUpdatesCount: number;
	_bHasUpdates: boolean;
	_tsDateUpdated: number;
	_aAttributes: AAttributes;
	_sDownloadUrl: string;
	_nDownloadCount: number;
	_aFiles: AFile[];
	_sDescription: string;
	_sText: string;
	_nLikeCount: number;
	_nViewCount: number;
	_sVersion: string;
	_aGame: AGame;
	_aCategory: ACategory;
	_aCredits: ACredit[];
	_aEmbeddedMedia: string[];
}

interface ACredit {
	_sGroupName: string;
	_aAuthors: AAuthor[];
}

interface AAuthor {
	_sRole: string;
	_idRow?: string;
	_sName: string;
	_sProfileUrl?: string;
	_bIsOnline?: boolean;
	_sUrl?: string;
	_sUpicUrl?: string;
}

interface ACategory {
	_idRow: number;
	_sName: string;
	_sModelName: string;
	_sProfileUrl: string;
	_sIconUrl: string;
}

interface AGame {
	_idRow: number;
	_sName: string;
	_sAbbreviation: string;
	_sProfileUrl: string;
	_sIconUrl: string;
	_sBannerUrl: string;
	_nSubscriberCount: number;
	_bHasSubmissionQueue: boolean;
	_bAccessorIsSubscribed: boolean;
}

interface AFile {
	_idRow: number;
	_sFile: string;
	_nFilesize: number;
	_sDescription: string;
	_tsDateAdded: number;
	_nDownloadCount: number;
	_sAnalysisState: string;
	_sAnalysisResultCode: string;
	_sAnalysisResult: string;
	_bContainsExe: boolean;
	_sDownloadUrl: string;
	_sMd5Checksum: string;
	_sClamAvResult: string;
	_sAvastAvResult: string;
}

interface AAttributes {
	"Software Used": string[];
}

interface APreviewMedia {
	_aImages: AImage[];
}

interface AImage {
	_sType: string;
	_sBaseUrl: string;
	_sFile: string;
	_sFile220?: string;
	_hFile220?: number;
	_wFile220?: number;
	_sFile530?: string;
	_hFile530?: number;
	_wFile530?: number;
	_sFile100: string;
	_hFile100: number;
	_wFile100: number;
}
