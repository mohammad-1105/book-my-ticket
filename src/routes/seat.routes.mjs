import { Router } from "express";
import { findSeatById, getSeatSummary } from "../models/seat.model.mjs";
import {
	getInventorySummary,
	getSeatInventory,
} from "../services/booking.services.mjs";

export const createSeatRouter = ({ legacy = false } = {}) => {
	const router = Router();

	router.get("/seats", (_req, res) => {
		const seats = getSeatInventory();
		if (legacy) {
			return res.status(200).json(seats);
		}

		return res.status(200).json({
			seats,
			summary: getSeatSummary(),
		});
	});

	if (!legacy) {
		router.get("/seats/summary", (_req, res) => {
			res.status(200).json(getInventorySummary());
		});

		router.get("/seats/:seatId", (req, res) => {
			const seat = findSeatById(req.params.seatId);
			if (!seat) {
				return res.status(404).json({ message: "Seat not found" });
			}
			res.status(200).json(seat);
		});
	}

	return router;
};
