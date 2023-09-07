import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import fs from 'fs'
import Throttle from "throttle";
import { getSongs } from "./utils";
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const writableStreams: Response[] = [];

//global state
let selelectedIdx = 0;
let songs: string[] = getSongs(process.cwd() + "/assets/songs");
let fileStream = fs.createReadStream(songs[selelectedIdx]);

initStream(fileStream);

function initStream(readStream: fs.ReadStream) {
	readStream.pipe(new Throttle(13320000 / 8)).on('data', (chunk: Buffer) => {
		for (const writableStream of writableStreams) {
			writableStream.write(chunk);
		}

	})
	readStream.on('end', () => {
		console.log(`song ${songs[selelectedIdx]} has finished`)
		let nextIndex = selelectedIdx + 1 >= songs.length ? 0 : selelectedIdx + 1;
		fileStream = fs.createReadStream(songs[nextIndex]);
		initStream(fileStream);
		selelectedIdx = nextIndex;

	})
}





app.get("/", (req: Request, res: Response) => {
	res.end("Hello word \n");
})

app.get("/api/currentSong", (req: Request, res: Response) => {
	res.end(songs[selelectedIdx].split("/").pop());
});

app.get("/api/audioStream", (req: Request, res: Response) => {

	res.setHeader("Content-Type", "audio/mpeg");
	writableStreams.push(res);
})

app.listen(PORT, () => {
	console.log(`your app listening on port ${PORT}`);
})


