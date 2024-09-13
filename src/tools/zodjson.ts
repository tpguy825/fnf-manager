import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const DBSchema = z
	.object({
		$schema: z.string().optional(), // raaaaaa
		projects: z.array(
			z.object(
				{
					name: z.string({ message: "Name is required" }),
					subtitle: z.string({ message: "Subtitle is required" }),
					id: z.string({ message: "ID is required" }).ulid("Invalid ID"),
					platforms: z.enum(["linux", "windows", "both"], {
						message: "Platform must be 'linux', 'windows' or 'both'",
					}),
					images: z.object(
						{
							icon: z
								.string({ message: "Icon image is required" })
								.url({ message: "Icon image must be a valid URL" }),
							banner: z
								.string({ message: "Banner image is required" })
								.url({ message: "Banner image must be a valid URL" }),
						},
						{ message: "Images are required" },
					),
					authors: z.array(
						z.object(
							{
								name: z.string({ message: "Author name is required" }),
								main: z.boolean({ message: "Author main is required" }).optional(),
								role: z.string({ message: "Author role is required" }),

								// should this person be hidden on the left on itemview?
								sidehide: z.boolean({ message: "Author sidehide must be boolean" }).optional(),
							},
							{
								message: "Author object is required",
							},
						),
						{ message: "Authors must be an array" },
					),
					url: z.string({ message: "URL is required" }).url("Invalid URL"),
				},
				{
					message: "Project object is required",
				},
			),
			{ message: "Projects must be an array" },
		),
		updated: z.string({ message: "Updated date is required" }).datetime("Updated date must be a valid date"),
	})
	.describe("fnf-manager db schema");

export const projectSchema = z
	.object({
		$schema: z.string().optional(), // raaaaaa
		name: z.string({ message: "Name is required" }),
		description: z.string({ message: "Description is required" }),
		subtitle: z.string({ message: "Subtitle is required" }),
		authors: z.array(
			z.object(
				{
					name: z.string({ message: "Author name is required" }),
					main: z.boolean({ message: "Author main is required" }).optional(),
					role: z.string({ message: "Author role is required" }),

					// should this person be hidden on the left on itemview?
					sidehide: z.boolean({ message: "Author sidehide must be boolean" }).optional(),
				},
				{
					message: "Author object is required",
				},
			),
			{ message: "Authors must be an array" },
		),
		platforms: z.enum(["linux", "windows", "both"], { message: "Platform must be 'linux', 'windows' or 'both'" }),
		versions: z.array(
			z.object(
				{
					v: z.string({ message: "Version is required" }),
					win: z
						.object({
							url: z.string({ message: "Download URL is required" }).url("Invalid URL"),
							filename: z.string({ message: "Filename is required" }),
							hash: z
								.string({ message: "Download hash is required" })
								.regex(/^[a-f0-9]{128}$/, "Download hash must be a valid sha512 hash"),
						})
						.optional(),
					linux: z
						.object({
							url: z.string({ message: "Download URL is required" }).url("Invalid URL"),
							filename: z.string({ message: "Filename is required" }),
							hash: z
								.string({ message: "Download hash is required" })
								.regex(/^[a-f0-9]{128}$/, "Download hash must be a valid sha512 hash"),
						})
						.optional(),
					changes: z.string({ message: "Changelist must be a string" }).optional(),
					default: z.boolean({ message: "is default version must be a boolean" }).optional().default(false),
					modified: z
						.string({ message: "Modified date is required" })
						.datetime("Modified date must be a valid date"),

					// platform this version is for
					// windows = windows only (can be run with wine though??? TODO???)
					// linux = linux native only
					// both = both windows and linux native
					platform: z.enum(["linux", "windows", "both"], {
						message: "Platform must be 'linux', 'windows' or 'both'",
					}),
					notes: z.string({ message: "Platform notes must be a string" }).optional(),
				},
				{
					message: "Version object is required",
				},
			),
			{ message: "Versions must be an array" },
		),
		id: z.string({ message: "ID is required" }).ulid("Invalid ID"),
		url: z.string({ message: "URL is required" }).url("Invalid URL"),
		images: z.object(
			{
				icon: z
					.string({ message: "Icon image is required" })
					.url({ message: "Icon image must be a valid URL" }),
				banner: z
					.string({ message: "Banner image is required" })
					.url({ message: "Banner image must be a valid URL" }),
			},
			{ message: "Images are required" },
		),
		updated: z.string({ message: "Updated date is required" }).datetime("Updated date must be a valid date"),
	})
	.describe("fnf-manager project schema");

export type DBApi = z.infer<typeof DBSchema>;
export type ProjectApi = z.infer<typeof projectSchema>;

const dbjsonSchema = zodToJsonSchema(DBSchema, "DBSchema");
await Bun.write("fnf-manager-assets/db-schema.json", JSON.stringify(dbjsonSchema, null, 2));
const projectjsonSchema = zodToJsonSchema(projectSchema, "projectSchema");
await Bun.write("fnf-manager-assets/project-schema.json", JSON.stringify(projectjsonSchema, null, 2));

export async function check(): Promise<DBApi | false> {
	// Check current db passes
	let db: null | DBApi = null;
	try {
		db = DBSchema.parse(await Bun.file("./fnf-manager-assets/db.json").json());
		console.log("DB passes, last updated", new Date(db.updated));
	} catch (e) {
		console.error("DB failed", e);
		return false;
	}

	// Check all projects pass
	const glob = new Bun.Glob("./fnf-manager-assets/*/index.json");
	let passed = 0,
		total = 0;
	for await (const file of glob.scan()) {
		try {
			const project: ProjectApi = projectSchema.parse(await Bun.file(file).json());
			let defaults = 0;
			for (const version of project.versions) {
				if (version.default) defaults++;
				if ((version.platform === "linux" || version.platform === "both") && !version.linux)
					throw new Error("Linux version missing, but platform is linux");
				if ((version.platform === "windows" || version.platform === "both") && !version.win)
					throw new Error("Windows version missing, but platform is windows");
			}
			if (defaults !== 1) throw new Error("Project must have exactly one default version, has " + defaults);

			console.log("Project passes", project.name, project.id, "last updated", new Date(project.updated));
			passed++;
		} catch (e) {
			console.error("Project failed", file, e);
		}
		total++;
	}
	console.log("Projects passed", passed, "out of", total, "(" + Math.round((passed / total) * 10000) / 100 + "%)");
	if (passed !== total) return false;

	return db;
}

// if running as a script, check the files
if (import.meta.main) {
	await check();
}
