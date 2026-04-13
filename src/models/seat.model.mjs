import { store } from "../data/store.mjs";

function cloneSeat(seat) {
	return { ...seat };
}

export function listSeats() {
	return store.seats.map(cloneSeat);
}

export function findSeatById(id) {
	const numericId = Number(id);
	const seat = store.seats.find((s) => s.id === numericId) || null;
	return seat ? cloneSeat(seat) : null;
}

export function saveSeat(updatedSeat) {
	const seatIndex = store.seats.findIndex((s) => s.id === updatedSeat.id);

	if (seatIndex !== -1) {
		store.seats[seatIndex] = updatedSeat;
	}
	return updatedSeat;
}

export function listBookingByUserId(userId) {
	return store.seats.filter((seat) => seat.userId === userId).map(cloneSeat);
}

export function getSeatSummary() {
	const total = store.seats.length;
	const booked = store.seats.filter((seat) => seat.isBooked === 1).length;

	return {
		total,
		booked,
		available: total - booked,
	};
}
