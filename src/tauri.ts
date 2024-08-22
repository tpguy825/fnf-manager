import { invoke } from "@tauri-apps/api"

export async function run<Name extends keyof RustFunctions>(name: Name, params: RustFunctions[Name][0]): Promise<RustFunctions[Name][1]> {
	return invoke(name, params);
}

interface RustFunctions {
	greet: [{name: string}, string]
}