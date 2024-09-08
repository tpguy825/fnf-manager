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
					<div class="m-auto mt-56 h-40 w-full bg-black bg-opacity-80 text-white backdrop-blur sm:rounded-xl md:h-32 md:max-w-[45rem]">
						<div class="grid h-full w-full grid-cols-4">
							<div class="flex">
								<img src={iconimageurl} class="h-24 w-24 m-auto" />
								<div class="col-span-3 my-auto ml-8 grid">
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
			<div class="grid grid-cols-2">
				<div>{description}</div>
				<div>
					authors:
					<ul>
						{authors.map((a, i) => (
							<li key={i}>
								{a.name} - {a.role}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
