import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import fs from 'fs'
import Throttle from "throttle";
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

const fileStream = fs.createReadStream(process.cwd() + "/assets/songs/Fk.mp3");
const writableStreams: Response[] = [];

fileStream.pipe(new Throttle(320000 / 8)).on('data', (chunk: Buffer) => {
	for (const writableStream of writableStreams) {
		writableStream.write(chunk);
	}
})

app.get("/", (req: Request, res: Response) => {
	res.end("Hello word \n");
})

app.get("/api/audioStream", (req: Request, res: Response) => {

	res.setHeader("Content-Type","audio/mpeg");
	writableStreams.push(res);
})

app.listen(PORT, () => {
	console.log(`your app listening on port ${PORT}`);
})


