import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import fs, { read } from 'fs'
import Throttle from "throttle";
import { readJSON } from "./utils";
import audioMeta from 'audio-meta';
import { exit } from "process";
import { Song } from "./types/song";
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;


//global state
// readJSON(process.cwd() + "/songs.json");

// exit();


readJSON(process.cwd() + "/songs.json").then((songs: Song[]) => {
	let writableStreams: Response[] = [];
	let selelectedIdx = 0;
	let fileStream = fs.createReadStream(songs[selelectedIdx].path);
	initStream(fileStream, songs[selelectedIdx].metaData.bitRate);



	function initStream(readStream: fs.ReadStream, bitrate: number) {
		readStream.pipe(new Throttle((bitrate -1)/ 8)).on('data', (chunk: Buffer) => {
			writableStreams =  writableStreams.filter(x=>x.closed == false);
			console.log("number of listners :" writableStreams.length);
			for (const writableStream of writableStreams)
				writableStream.write(chunk);
			songs[selelectedIdx].metaData.bufferSize += chunk.length;
			songs[selelectedIdx].metaData.currentSec = songs[selelectedIdx].metaData.bufferSize / (songs[selelectedIdx].metaData.bitRate / 8);
			// console.log(`streaming ${songs[selelectedIdx].name}`);

		})
		readStream.on('end', () => {
			console.log(`song ${songs[selelectedIdx].name} has finished`)
			let nextIndex = selelectedIdx + 1 >= songs.length ? 0 : selelectedIdx + 1;
			fileStream = fs.createReadStream(songs[nextIndex].path);
			audioMeta
				.meta(songs[nextIndex].path)
				.then((resp: any) => {
					initStream(fileStream, resp.bitrate);
				})
			selelectedIdx = nextIndex;

		})
	}

	app.get("/", (req: Request, res: Response) => {
		res.end("Hello word \n");
	})

	app.get("/api/currentSong", (req: Request, res: Response) => {
		res.json(songs[selelectedIdx])
	});

	app.get("/api/audioStream", (req: Request, res: Response) => {

		res.setHeader("Content-Type", "audio/mpeg");

		writableStreams.push(res);
	})

	app.listen(PORT, () => {
		console.log(`your app listening on port ${PORT}`);
	})

});











