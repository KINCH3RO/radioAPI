import { Song } from "./types/song";
import Throttle from "throttle";
import { Response } from "express";
import audioMeta from 'audio-meta'

import fs, { ReadStream } from 'fs'
export class Radio {

	selectedindex: number = 0;
	writableStreams: Response[] = [];
	fileStream: ReadStream;
	songs: Song[];
	radioName :string;

	constructor(songs: Song[],radioName: string) {
		this.radioName = radioName;
		this.songs = songs;
		this.fileStream = fs.createReadStream(this.songs[this.selectedindex].path);
		this.initStream(this.fileStream, this.songs[this.selectedindex].metaData.bitRate);
	}

	addListener(userRes: Response) {
		this.writableStreams.push(userRes);
	}

	getCurrentSong(): Song {
		return this.songs[this.selectedindex];
	}

	getSongsList(): Song[] {
		return this.songs;
	}

	getCurrentSongIndex(): number {
		return this.selectedindex;
	}



	initStream(readStream: ReadStream, bitrate: number) {
		readStream.pipe(new Throttle((bitrate - 1) / 8)).on('data', (chunk: Buffer) => {
			this.writableStreams = this.writableStreams.filter(x => x.closed == false);
			console.log(`number of listners on ${this.radioName}  :  ${this.writableStreams.length}`);
			for (const writableStream of this.writableStreams)
				writableStream.write(chunk);
			this.songs[this.selectedindex].metaData.bufferSize += chunk.length;
			this.songs[this.selectedindex].metaData.currentSec = this.songs[this.selectedindex].metaData.bufferSize / (this.songs[this.selectedindex].metaData.bitRate / 8);
			console.log(`radio ${this.radioName} is streaming ${this.songs[this.selectedindex].name}`);

		})
		readStream.on('end', () => {
			console.log(`song ${this.songs[this.selectedindex].name} has finished`)
			let nextIndex = this.selectedindex + 1 >= this.songs.length ? 0 : this.selectedindex + 1;
			this.fileStream = fs.createReadStream(this.songs[nextIndex].path);
			audioMeta
				.meta(this.songs[nextIndex].path)
				.then((resp: any) => {
					this.initStream(this.fileStream, resp.bitrate);
				})
			this.selectedindex = nextIndex;

		})
	}
}
