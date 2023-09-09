import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { readJSON } from "./utils";
import { Song } from "./types/song";
import { Radio } from "./Radio";
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;



readJSON(process.cwd() + "/songs.json").then((songs: Song[]) => {



	let futureGarageRadio = new Radio(songs,"Future Garage");


	app.get("/", (req: Request, res: Response) => {
		res.end("Hello word \n");
	})

	app.get("/api/currentSong", (req: Request, res: Response) => {
		res.json(futureGarageRadio.getCurrentSong())
	});

	app.get("/api/audioStream", (req: Request, res: Response) => {

		res.setHeader("Content-Type", "audio/mpeg");

		futureGarageRadio.addListener(res);
	})

	app.listen(PORT, () => {
		console.log(`your app listening on port ${PORT}`);
	})

});











