import { JSX } from "preact/jsx-runtime";
import { type ProjectApi } from "../tools/zodjson";
import DOMPurify from "isomorphic-dompurify";

export default function ItemView({ project }: { project: ProjectApi }) {
	const {
		name,
		subtitle,
		description,
		authors,
		versions,
		images: { banner: bannerimageurl, icon: iconimageurl },
	} = project;
	return (
		<div>
			<div
				class="h-96 w-full bg-cover bg-center bg-no-repeat"
				style={{ backgroundImage: `url("${bannerimageurl}")` }}>
				<div class="absolute h-full w-full">
					<div class="m-auto mt-56 h-40 w-full bg-black bg-opacity-80 text-white backdrop-blur sm:rounded-t-xl md:h-32 md:max-w-[50rem] md:rounded-xl">
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
										class="w-32 rounded-lg border-2 border-zinc-600 bg-opacity-20 bg-black text-green p-2 cursor-pointer"
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
			<div class="mx-auto justify-center mt-4 grid w-full grid-cols-1 sm:flex sm:max-w-[48rem] md:max-w-[50rem] lg:max-w-[64rem] md:px-0 px-4 mb-4">
				<div class="rounded-lg border dark:border-zinc-600 sm:w-56">
					<div class="border-b dark:border-zinc-600 p-3 text-xl font-bold">Authors</div>
					<ul>
						{authors
							.filter((e) => !e.sidehide)
							// first 5 elements, if more than 5 are main then show all main
							.slice(0, Math.min(5, authors.filter((e) => e.main).length))
							.map((a, i) => (
								<li key={i} class="border-b dark:border-zinc-600 p-3">
									<div class="text-xl">{a.name}</div>
									<div class="text-sm">{a.role}</div>
								</li>
							))}
						<li class="p-3">
							<div class="text-xl font-bold">Share</div>
							<Share item={project} />
						</li>
					</ul>
				</div>
				<div
					class="mt-4 rounded-lg border dark:border-zinc-600 p-3 sm:ml-4 sm:mt-0 sm:w-[24rem] md:w-[32rem] lg:w-[44rem]"
					style={{ overflowWrap: "break-word" }}
					dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}>
					{/* markdown when???????? (tpguy825 - 02:23 08/09/2024) */}
					{/* okay gamebanana uses html instead (tpguy825 - 00:36 14/09/2024) */}
				</div>
			</div>
		</div>
	);
}

const shareicons: Record<string, (wh: number) => JSX.Element> = {
	twitter: (wh) => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={wh}
			height={wh}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-twitter">
			<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
		</svg>
	),
	mastodon: (wh) => (
		<svg xmlns="http://www.w3.org/2000/svg" width={wh} height={wh} viewBox="0 0 79 75">
			<path
				d="M74.7135 16.6043C73.6199 8.54587 66.5351 2.19527 58.1366 0.964691C56.7196 0.756754 51.351 0 38.9148 0H38.822C26.3824 0 23.7135 0.756754 22.2966 0.964691C14.1319 2.16118 6.67571 7.86752 4.86669 16.0214C3.99657 20.0369 3.90371 24.4888 4.06535 28.5726C4.29578 34.4289 4.34049 40.275 4.877 46.1075C5.24791 49.9817 5.89495 53.8251 6.81328 57.6088C8.53288 64.5968 15.4938 70.4122 22.3138 72.7848C29.6155 75.259 37.468 75.6697 44.9919 73.971C45.8196 73.7801 46.6381 73.5586 47.4475 73.3063C49.2737 72.7302 51.4164 72.086 52.9915 70.9542C53.0131 70.9384 53.0308 70.9178 53.0433 70.8942C53.0558 70.8706 53.0628 70.8445 53.0637 70.8179V65.1661C53.0634 65.1412 53.0574 65.1167 53.0462 65.0944C53.035 65.0721 53.0189 65.0525 52.9992 65.0371C52.9794 65.0218 52.9564 65.011 52.9318 65.0056C52.9073 65.0002 52.8819 65.0003 52.8574 65.0059C48.0369 66.1472 43.0971 66.7193 38.141 66.7103C29.6118 66.7103 27.3178 62.6981 26.6609 61.0278C26.1329 59.5842 25.7976 58.0784 25.6636 56.5486C25.6622 56.5229 25.667 56.4973 25.6775 56.4738C25.688 56.4502 25.7039 56.4295 25.724 56.4132C25.7441 56.397 25.7678 56.3856 25.7931 56.3801C25.8185 56.3746 25.8448 56.3751 25.8699 56.3816C30.6101 57.5151 35.4693 58.0873 40.3455 58.086C41.5183 58.086 42.6876 58.086 43.8604 58.0553C48.7647 57.919 53.9339 57.6701 58.7591 56.7361C58.8794 56.7123 58.9998 56.6918 59.103 56.6611C66.7139 55.2124 73.9569 50.665 74.6929 39.1501C74.7204 38.6967 74.7892 34.4016 74.7892 33.9312C74.7926 32.3325 75.3085 22.5901 74.7135 16.6043ZM62.9996 45.3371H54.9966V25.9069C54.9966 21.8163 53.277 19.7302 49.7793 19.7302C45.9343 19.7302 44.0083 22.1981 44.0083 27.0727V37.7082H36.0534V27.0727C36.0534 22.1981 34.124 19.7302 30.279 19.7302C26.8019 19.7302 25.0651 21.8163 25.0617 25.9069V45.3371H17.0656V25.3172C17.0656 21.2266 18.1191 17.9769 20.2262 15.568C22.3998 13.1648 25.2509 11.9308 28.7898 11.9308C32.8859 11.9308 35.9812 13.492 38.0447 16.6111L40.036 19.9245L42.0308 16.6111C44.0943 13.492 47.1896 11.9308 51.2788 11.9308C54.8143 11.9308 57.6654 13.1648 59.8459 15.568C61.9529 17.9746 63.0065 21.2243 63.0065 25.3172L62.9996 45.3371Z"
				fill="currentColor"
			/>
		</svg>
	),
};

function Share({ item }: { item: ProjectApi }) {
	const { name, url } = item;
	const text = `Check out ${name}!`;
	return (
		<div class="flex">
			<a
				href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
				target="_blank"
				rel="noreferrer"
				class="mr-2 cursor-pointer">
				{shareicons.twitter(24)}
			</a>
			<a
				href={`https://mastodon.social/share?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
				target="_blank"
				rel="noreferrer"
				class=" cursor-pointer">
				{shareicons.mastodon(24)}
			</a>
		</div>
	);
}
