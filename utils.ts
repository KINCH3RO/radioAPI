
import fs, { read, readFileSync } from 'fs';
import { Song } from './types/song';
import audioMeta from 'audio-meta';
import { exit } from 'process';



export async function readJSON(path: string): Promise<Song[]> {

	let songs: Song[] = JSON.parse(readFileSync(path, { encoding: 'utf-8' }));


	for (let index = 0; index < songs.length; index++) {

		let resp = await audioMeta.meta(process.cwd() + "/" + songs[index].path);
		songs[index].path = process.cwd() + "/" + songs[index].path;
		songs[index].metaData = {
			size: resp.size,
			bitRate: resp.bitrate,
			bufferSize: 0,
			duration: resp.size / (resp.bitrate / 8),
			currentSec: 0
		};
	}

	return songs;
}


