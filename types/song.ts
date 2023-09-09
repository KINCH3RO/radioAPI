export interface SongMetaData {
	bufferSize: number,
	size: number,
	duration: number,
	currentSec: number,
	bitRate: number,
}

export interface Song {
	name: string,
	path: string,
	genre: string,
	artist: string,
	imageUrl: string,
	metaData: SongMetaData

}
