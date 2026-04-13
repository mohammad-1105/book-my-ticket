import { store } from "../data/store.mjs";

function normalizeUsername(username) {
	return username.trim().toLowerCase();
}

export function sanitizeUser(user) {
	if (!user) {
		return null;
	}

	const { password, normalizedUsername, ...safeUser } = user;

	return safeUser;
}

export function findUserByUsername(username) {
	const normalized = normalizeUsername(username);
	return (
		store.users.find((user) => user.normalizedUsername === normalized) || null
	);
}

export function findUserById(id) {
	return store.users.find((user) => user.id === id) || null;
}

export function createUser(username, password) {
	const trimmedUsername = username.trim();

	const user = {
		id: store.counters.nextUserId++,
		username: trimmedUsername,
		normalizedUsername: normalizeUsername(trimmedUsername),
		password,
		createdAt: new Date().toISOString(),
	};

	store.users.push(user);
	return user;
}
