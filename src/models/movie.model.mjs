import { store } from "../data/store.mjs";

export function listMovies() {
	return [store.movie];
}

export function getMovieById(id) {
	return store.movie.id === Number(id) ? store.movie : null;
}
