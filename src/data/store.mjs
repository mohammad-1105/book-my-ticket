const movie = {
	id: 1,
	slug: "avengers-endgame",
	title: "Avengers: Endgame",
	tagline: "Part of the journey is the end.",
	language: "English",
	genre: ["Action", "Adventure", "Sci-Fi"],
	durationMinutes: 181,
	rating: "PG-13",
	showTime: "7:30 PM",
	auditorium: "Audi 03",
};
const rowLabels = ["A", "B", "C", "D"];
const seatsPerRow = 5;

const seats = Array.from(
	{ length: rowLabels.length * seatsPerRow },
	(_, index) => {
		const rowIndex = Math.floor(index / seatsPerRow);
		const seatNumber = (index % seatsPerRow) + 1;

		return {
			id: index + 1,
			movieId: movie.id,
			label: `${rowLabels[rowIndex]}${seatNumber}`,
			row: rowLabels[rowIndex],
			number: seatNumber,
			name: null,
			isBooked: false,
			userId: null,
			bookedByUsername: null,
			bookedAt: null,
		};
	},
);

export const store = {
	movie,
	seats,
	users: [],
	counters: {
		nextUserId: 1,
	},
};
