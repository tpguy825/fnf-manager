import "./App.css";
import ItemView from "./components/ItemView";

function App() {
	const details: Parameters<typeof ItemView>[0] = {
		title: "test title",
		subtitle: "stupid subtitle thing below the title",
		imageurl:
			"/peopledontevensayblessyouanymoretheyjuststareatyoulikethis.png",
		versions: [
			{ optiontext: "v1", optionvalue: "1" },
			{ optiontext: "v1.1", optionvalue: "1.1" },
		],
		description: "long blah blah description :yawn:",
		authors: [
			{ name: "me", role: "what i contributed" },
			{ name: "someotherguy", role: "helped with nothing lmao" },
		],
	};

	return <ItemView {...details} />;
}

export default App;

