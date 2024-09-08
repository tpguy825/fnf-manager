import { useEffect, useState } from "preact/hooks";
import { type ProjectApi } from "../tools/zodjson";
import { json } from "../api";
import ItemView from "../components/ItemView";

export default function Item({ id }: { id: string }) {
	const [details, setDetails] = useState<ProjectApi | null>(null);

	useEffect(() => {
		// fetch the project details
		json<ProjectApi>("/" + id + "/index.json").then(setDetails);
	}, [id]);

	if (!details) {
		return <div>Loading...</div>;
	}

	return <ItemView project={details} />;
}
