const state = {
	token: localStorage.getItem("token"),
	user: null,
	seats: [],
	bookings: [],
	movie: null,
	selectedSeatId: null,
};

const elements = {
	sessionPill: document.getElementById("session-pill"),
	movieTitle: document.getElementById("movie-title"),
	movieTagline: document.getElementById("movie-tagline"),
	movieRuntime: document.getElementById("movie-runtime"),
	movieLanguage: document.getElementById("movie-language"),
	movieShowtime: document.getElementById("movie-showtime"),
	availableCount: document.getElementById("available-count"),
	bookedCount: document.getElementById("booked-count"),
	myCount: document.getElementById("my-count"),
	seatGrid: document.getElementById("seat-grid"),
	authPanel: document.getElementById("auth-panel"),
	accountPanel: document.getElementById("account-panel"),
	usernameInput: document.getElementById("username-input"),
	passwordInput: document.getElementById("password-input"),
	passengerInput: document.getElementById("passenger-input"),
	loginButton: document.getElementById("login-btn"),
	registerButton: document.getElementById("register-btn"),
	logoutButton: document.getElementById("logout-btn"),
	bookButton: document.getElementById("book-btn"),
	selectedSeatLabel: document.getElementById("selected-seat-label"),
	bookingList: document.getElementById("booking-list"),
	accountName: document.getElementById("account-name"),
	toast: document.getElementById("toast"),
};

let toastTimer = null;

function isSeatBooked(seat) {
	return Boolean(seat?.isBooked);
}

function getErrorMessage(
	error,
	fallback = "Something went wrong. Please try again.",
) {
	if (error instanceof Error && error.message) {
		return error.message;
	}

	return fallback;
}

function getApiErrorMessage(payload, response) {
	if (Array.isArray(payload?.details) && payload.details.length > 0) {
		return payload.details.join(" ");
	}

	if (typeof payload?.error === "string" && payload.error.trim()) {
		return payload.error;
	}

	if (typeof payload?.message === "string" && payload.message.trim()) {
		return payload.message;
	}

	return `Request failed with status ${response.status}.`;
}

function validateCredentials(mode) {
	const username = elements.usernameInput.value.trim();
	const password = elements.passwordInput.value.trim();

	if (!username && !password) {
		showToast(`Enter a username and password to ${mode}.`, "error");
		elements.usernameInput.focus();
		return null;
	}

	if (!username) {
		showToast("Username is required.", "error");
		elements.usernameInput.focus();
		return null;
	}

	if (username.length < 3) {
		showToast("Username must be at least 3 characters long.", "error");
		elements.usernameInput.focus();
		return null;
	}

	if (!password) {
		showToast("Password is required.", "error");
		elements.passwordInput.focus();
		return null;
	}

	if (password.length < 6) {
		showToast("Password must be at least 6 characters long.", "error");
		elements.passwordInput.focus();
		return null;
	}

	return { username, password };
}

function showToast(message, type = "info") {
	elements.toast.textContent = message;
	elements.toast.dataset.type = type;
	elements.toast.classList.add("is-visible");

	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		elements.toast.classList.remove("is-visible");
	}, 2800);
}

async function request(url, options = {}) {
	const headers = new Headers(options.headers || {});

	if (state.token) {
		headers.set("Authorization", `Bearer ${state.token}`);
	}

	if (options.body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	let response;

	try {
		response = await fetch(url, {
			...options,
			headers,
		});
	} catch (_error) {
		throw new Error("Unable to reach the server right now. Please try again.");
	}

	const payload = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(getApiErrorMessage(payload, response));
	}

	return payload;
}

function getSelectedSeat() {
	return state.seats.find((seat) => seat.id === state.selectedSeatId) || null;
}

function updateStats() {
	const booked = state.seats.filter((seat) => isSeatBooked(seat)).length;
	const available = state.seats.length - booked;

	elements.availableCount.textContent = String(available);
	elements.bookedCount.textContent = String(booked);
	elements.myCount.textContent = String(state.bookings.length);
}

function renderMovie() {
	if (!state.movie) {
		return;
	}

	elements.movieTitle.textContent = state.movie.title;
	elements.movieTagline.textContent = state.movie.tagline;
	elements.movieRuntime.textContent = `${state.movie.durationMinutes} mins`;
	elements.movieLanguage.textContent = `${state.movie.language} • ${state.movie.rating}`;
	elements.movieShowtime.textContent = `${state.movie.showTime} • ${state.movie.auditorium}`;
}

function renderSession() {
	if (state.user) {
		elements.sessionPill.textContent = `${state.user.username} is ready to book`;
		elements.authPanel.classList.add("hidden");
		elements.accountPanel.classList.remove("hidden");
		elements.accountName.textContent = `Hi, ${state.user.username}`;
		if (!elements.passengerInput.value.trim()) {
			elements.passengerInput.value = state.user.username;
		}
	} else {
		elements.sessionPill.textContent = "Guest mode";
		elements.authPanel.classList.remove("hidden");
		elements.accountPanel.classList.add("hidden");
		elements.passengerInput.value = "";
	}
}

function renderSeatSelection() {
	const seat = getSelectedSeat();
	if (!seat) {
		elements.selectedSeatLabel.textContent = "No seat selected";
		return;
	}

	elements.selectedSeatLabel.textContent = `${seat.label} · Seat #${seat.id}`;
}

function renderBookings() {
	if (!state.user) {
		elements.bookingList.innerHTML = `<p class="empty-state">Log in to view your bookings.</p>`;
		return;
	}

	if (!state.bookings.length) {
		elements.bookingList.innerHTML = `<p class="empty-state">No bookings yet. Pick an available seat to get started.</p>`;
		return;
	}

	elements.bookingList.innerHTML = state.bookings
		.map(
			(booking) => `
        <article class="booking-chip">
          <strong>${booking.label} · ${booking.name}</strong>
          <p>Booked at ${new Date(booking.bookedAt).toLocaleString()}</p>
          <button data-seat-id="${booking.id}" type="button">Cancel booking</button>
        </article>
      `,
		)
		.join("");

	elements.bookingList.querySelectorAll("button").forEach((button) => {
		button.addEventListener("click", async () => {
			const seatId = button.dataset.seatId;
			await cancelBooking(seatId);
		});
	});
}

function renderSeats() {
	elements.seatGrid.innerHTML = "";

	state.seats.forEach((seat) => {
		const button = document.createElement("button");
		const isMine = state.user && seat.userId === state.user.id;
		const isSelected = seat.id === state.selectedSeatId;
		const booked = isSeatBooked(seat);

		button.className = "seat";
		button.textContent = seat.label;
		button.title = booked
			? `Booked by ${seat.name}`
			: `Available seat ${seat.label}`;

		if (booked) {
			button.classList.add(isMine ? "seat-owned" : "seat-booked");
		} else {
			button.classList.add("seat-open");
		}

		if (isSelected) {
			button.classList.add("seat-selected");
		}

		button.disabled = booked && !isMine;
		button.addEventListener("click", () => {
			if (booked) {
				state.selectedSeatId = seat.id;
				renderSeatSelection();
				renderSeats();
				return;
			}

			state.selectedSeatId = seat.id;
			renderSeatSelection();
			renderSeats();
		});

		elements.seatGrid.appendChild(button);
	});
}

async function loadMovie() {
	const data = await request("/api/shows/current");
	state.movie = data.movie;
	renderMovie();
}

async function loadSeats() {
	const data = await request("/api/seats");
	state.seats = data.seats;
	updateStats();
	renderSeats();
	renderSeatSelection();
}

async function loadBookings() {
	if (!state.token) {
		state.bookings = [];
		renderBookings();
		updateStats();
		return;
	}

	const data = await request("/api/bookings/me");
	state.bookings = data.bookings;
	renderBookings();
	updateStats();
}

async function loadMe() {
	if (!state.token) {
		state.user = null;
		renderSession();
		return;
	}

	try {
		const data = await request("/api/auth/me");
		state.user = data.user;
	} catch (_error) {
		state.token = null;
		state.user = null;
		localStorage.removeItem("token");
		showToast("Session expired. Please log in again.", "error");
	}

	renderSession();
}

async function register() {
	const credentials = validateCredentials("register");
	if (!credentials) {
		return;
	}

	const user = await request("/api/auth/register", {
		method: "POST",
		body: JSON.stringify(credentials),
	});

	showToast(`Account created for ${user.username}. You can log in now.`);
}

async function login() {
	const credentials = validateCredentials("log in");
	if (!credentials) {
		return;
	}

	const session = await request("/api/auth/login", {
		method: "POST",
		body: JSON.stringify(credentials),
	});

	state.token = session.token;
	state.user = session.user;
	localStorage.setItem("token", session.token);
	elements.passwordInput.value = "";
	renderSession();
	await loadBookings();
	await loadSeats();
	showToast(`Welcome back, ${session.user.username}.`);
}

async function logout() {
	state.token = null;
	state.user = null;
	state.bookings = [];
	state.selectedSeatId = null;
	localStorage.removeItem("token");
	renderSession();
	renderBookings();
	renderSeatSelection();
	await loadSeats();
	showToast("Logged out successfully.");
}

async function bookSelectedSeat() {
	if (!state.user) {
		showToast("Please log in before booking a seat.", "error");
		return;
	}

	const selectedSeat = getSelectedSeat();
	if (!selectedSeat) {
		showToast("Select a seat first.", "error");
		return;
	}

	if (isSeatBooked(selectedSeat) && selectedSeat.userId !== state.user.id) {
		showToast("That seat is already booked.", "error");
		return;
	}

	const name = elements.passengerInput.value.trim();
	if (!name) {
		showToast("Passenger name is required.", "error");
		return;
	}

	await request("/api/bookings", {
		method: "POST",
		body: JSON.stringify({
			seatId: selectedSeat.id,
			name,
		}),
	});

	state.selectedSeatId = selectedSeat.id;
	await Promise.all([loadSeats(), loadBookings()]);
	showToast(`Seat ${selectedSeat.label} booked successfully.`);
}

async function cancelBooking(seatId) {
	await request(`/api/bookings/${seatId}`, {
		method: "DELETE",
	});

	if (state.selectedSeatId === Number(seatId)) {
		state.selectedSeatId = null;
	}

	await Promise.all([loadSeats(), loadBookings()]);
	showToast("Booking cancelled.");
}

async function init() {
	try {
		await Promise.all([loadMovie(), loadMe()]);
		await Promise.all([loadSeats(), loadBookings()]);
	} catch (error) {
		showToast(error.message, "error");
	}
}

elements.registerButton.addEventListener("click", async () => {
	try {
		await register();
	} catch (error) {
		showToast(getErrorMessage(error), "error");
	}
});

elements.loginButton.addEventListener("click", async () => {
	try {
		await login();
	} catch (error) {
		showToast(getErrorMessage(error), "error");
	}
});

elements.logoutButton.addEventListener("click", async () => {
	await logout();
});

elements.bookButton.addEventListener("click", async () => {
	try {
		await bookSelectedSeat();
	} catch (error) {
		showToast(getErrorMessage(error), "error");
	}
});

init();
