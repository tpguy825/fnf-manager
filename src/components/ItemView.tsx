import { type ProjectApi } from "../tools/zodjson";

export default function ItemView({
	project: {
		name,
		subtitle,
		description,
		authors,
		versions,
		images: { banner: bannerimageurl, icon: iconimageurl },
	},
}: {
	project: ProjectApi;
}) {
	return (
		<div>
			<div
				class="h-96 w-full bg-cover bg-center bg-no-repeat"
				style={{ backgroundImage: `url("${bannerimageurl}")` }}>
				<div class="absolute h-full w-full">
					<div class="m-auto mt-56 h-40 w-full bg-black bg-opacity-80 text-white backdrop-blur sm:rounded-xl md:h-32 md:max-w-[50rem]">
						<div class="grid h-full w-full grid-cols-4">
							<div class="flex col-span-3">
								<img src={iconimageurl} class="h-24 w-24 ml-8 my-auto" />
								<div class="my-auto ml-8 grid">
									<div class="text-2xl font-extrabold">{name}</div>
									<div>{subtitle}</div>
								</div>
							</div>
							<div class="ml-auto mr-4 grid grid-cols-1 gap-2 py-4 bg-transparent">
								<div class="relative">
									<select
										class="w-32 rounded-lg border-2 border-gray-400 bg-opacity-20 bg-black text-green p-2 cursor-pointer"
										placeholder={versions.find((v) => Boolean(v.default))?.v}>
										{versions.map((v, i) => (
											<option selected={v.default} value={v.v} key={i} class="bg-transparent">
												v{v.v}
											</option>
										))}
									</select>
									<div class="absolute top-4 right-4 pointer-events-none">
										<svg
											fill="currentColor"
											class="w-4 h-4 pointer-events-none"
											version="1.1"
											id="Layer_1"
											viewBox="0 0 330 330">
											<path
												id="XMLID_225_"
												d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393
												c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393
												s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"
											/>
										</svg>
									</div>
								</div>
								<button class="w-32 rounded-lg bg-blue-600 p-2">Download</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="mx-auto justify-center mt-8 grid w-full grid-cols-1 sm:flex sm:max-w-[48rem] md:max-w-[56rem] lg:max-w-[64rem] sm:px-0 px-4">
				<div class="rounded-lg border sm:w-56">
					<div class="border-b p-3 text-xl font-bold">Authors</div>
					<ul>
						{authors.map((a, i) => (
							<li key={i} class={i === authors.length - 1 ? "p-3" : "border-b p-3"}>
								<div class="text-xl">{a.name}</div>
								<div class="text-sm">{a.role}</div>
							</li>
						))}
					</ul>
				</div>
				<div
					class="mt-4 rounded-lg border p-3 sm:ml-4 sm:mt-0 sm:w-[24rem] md:w-[32rem] lg:w-[44rem]"
					style={{ overflowWrap: "break-word" }}>
					{/* markdown when???????? (tpguy825 - 02:23AM 08/09/2024) */}
					{description}
				</div>
			</div>
		</div>
	);
}
