
import fs from 'fs'

export function getSongs(path: string): string[] {
	let allowedExtensions = ["mp3","wav"]
	let songsPath: string[] = [];
	const files = fs.readdirSync(path);
	for (const file of files) {
		let extension = file.split('.')?.pop();
		if (extension && allowedExtensions.includes(extension))
			songsPath.push(path + "/" + file);

	}
	console.log(songsPath);
	return songsPath;
}
