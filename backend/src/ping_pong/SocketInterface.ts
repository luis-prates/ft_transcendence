export type gameRequest = {
	objectId: string;
	maxScore: number;
	table: string;
	tableSkin: string;
	bot: boolean;
};

export type playerInfo = {
	objectId: string;
	nickname: string;
	avatar: string;
	color: string;
	skin: string;
};

export type updatePlayer = {
	objectId: string;
	playerNumber: number;
	x: number;
	y: number;
	score: number;
	nickname: string;
	avatar: string;
	color: string;
};

export type updateBall = {
	objectId: string;
	x: number;
	y: number;
	angle: number;
	speed: number;
	dir: number;
};

export type gamePoint = {
	objectId: string;
	playerNumber: number;
	score: number;
};
