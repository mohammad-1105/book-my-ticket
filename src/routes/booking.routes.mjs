import { Router } from "express";

import { authenticateToken } from "../middlewares/authenticate-token.mjs";
import {
	bookSeat,
	cancelBooking,
	getBookingsForUser,
} from "../services/booking.services.mjs";

export const createBookingRouter = ({ legacy = false } = {}) => {
	const router = Router();

	if (legacy) {
		router.put("/:id/:name", authenticateToken, (req, res) => {
			try {
				const seat = bookSeat({
					seatId: req.params.id,
					name: req.params.name,
					user: req.user,
				});

				res.status(200).json({
					success: true,
					seat,
				});
			} catch (error) {
				if (error.status === 409) {
					res.status(409).json({ error: "Seat already booked" });
				}
				throw error;
			}
		});
		return router;
	}

	router.post("/bookings", authenticateToken, (req, res) => {
		const seat = bookSeat({
			seatId: req.body.seatId,
			name: req.body.name,
			user: req.user,
		});

		res.status(200).json({
			message: "Seat booked successfully",
			seat,
		});
	});

	router.get("/bookings/me", authenticateToken, (req, res) => {
		const bookings = getBookingsForUser(req.user.id);
		res.status(200).json({ bookings });
	});

	router.delete("/bookings/:seatId", authenticateToken, (req, res) => {
		const seat = cancelBooking({
			seatId: req.params.seatId,
			user: req.user,
		});
		res.status(200).json({ message: "Booking cancelled successfully", seat });
	});

	return router;
};
