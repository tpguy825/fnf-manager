import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const DBSchema = z
	.object({
		projects: z.array(
			z.object({
				name: z.string({ message: "Name is required" }),
				description: z.string({ message: "Description is required" }),
				subtitle: z.string({ message: "Subtitle is required" }),
				versions: z.array(
					z.object(
						{
							v: z.string({ message: "Version is required" }),
							download: z.string({ message: "Download URL is required" }).url("Invalid URL"),
							changes: z.string({ message: "Changelist must be a string" }).optional(),
							modified: z
								.string({ message: "Modified date is required" })
								.datetime("Modified date must be a valid date"),
						},
						{
							message: "Version object is required",
						},
					),
					{ message: "Versions must be an array" },
				),
				id: z.string({ message: "ID is required" }).ulid("Invalid ID"),
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
			}, {
				message: "Project object is required",
			}),
			{ message: "Projects must be an array" },
		),
		updated: z.string({ message: "Updated date is required" }).datetime("Updated date must be a valid date"),
	})
	.describe("fnf-manager db schema");

const jsonSchema = zodToJsonSchema(DBSchema, "DBSchema");
await Bun.write("fnf-manager-assets/db-schema.json", JSON.stringify(jsonSchema, null, 2));

// Check current db passes
const db = await fetch("https://raw.githubusercontent.com/tpguy825/fnf-manager-assets/main/db.json").then((r) =>
	r.json(),
);
DBSchema.parse(db);
console.log("DB passes, last updated", new Date(db.updated));

