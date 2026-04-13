import {
	findSeatById,
	getSeatSummary,
	listBookingByUserId,
	listSeats,
	saveSeat,
} from "../models/seat.model.mjs";
import { createHttpError } from "../utils/http-error.mjs";

function normalizeName(name) {
	return name?.trim();
}

export function getSeatInventory() {
	return listSeats();
}

export function getInventorySummary() {
	return getSeatSummary();
}

export function getBookingsForUser(userId) {
	return listBookingByUserId(userId);
}

export function bookSeat({ seatId, name, user }) {
	const seat = findSeatById(seatId);

	if (!seat) {
		throw createHttpError(404, "Seat not found");
	}

	const normalizedName = normalizeName(name);

	if (!normalizedName) {
		throw createHttpError(400, "Name is required");
	}

	if (seat.isBooked === 1) {
		throw createHttpError(409, "Seat already booked");
	}

	const bookedSeat = {
		...seat,
		name: normalizedName,
		isBooked: 1,
		userId: user.id,
		bookedByUsername: user.username,
		bookedAt: new Date().toISOString(),
	};

	return saveSeat(bookedSeat);
}

export function cancelBooking({ seatId, user }) {
	const seat = findSeatById(seatId);

	if (!seat) {
		throw createHttpError(404, "Seat not found");
	}

	if (seat.isBooked === 0) {
		throw createHttpError(400, "Seat is not booked");
	}

	if (seat.userId !== user.id) {
		throw createHttpError(403, "You can only cancel your own bookings");
	}

	const canceledSeat = {
		...seat,
		name: null,
		isBooked: 0,
		userId: null,
		bookedByUsername: null,
		bookedAt: null,
	};

	return saveSeat(canceledSeat);
}
