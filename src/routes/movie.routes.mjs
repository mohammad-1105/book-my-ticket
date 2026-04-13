import { Router } from "express";
import { getMovieById, listMovies } from "../models/movie.model.mjs";

export const createMovieRouter = () => {
	const router = Router();

	router.get("/movies", (_req, res) => {
		res.json({ movies: listMovies() });
	});

	router.get("/movies/:movieId", (req, res) => {
		const movie = getMovieById(req.params.movieId);

		if (!movie) {
			return res.status(404).json({ error: "Movie not found." });
		}

		res.json({ movie });
	});

	router.get("/shows/current", (_req, res) => {
		res.json({ movie: listMovies()[0] });
	});

	return router;
};
