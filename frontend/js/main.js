import { ApiClient } from "./api/ApiClient.js";
import { FilterPanel } from "./components/FilterPanel.js";
import { Wheel } from "./components/Wheel.js";
import { ResultModal } from "./components/ResultModal.js";
import { FeedbackModal } from "./components/FeedbackModal.js";
import { StatsDisplay } from "./components/StatsDisplay.js";
import { COUNTRIES } from "./constants/countries.js";
import { PROVIDERS } from "./constants/providers.js";

const API_BASE = "http://127.0.0.1:5000";

const apiClient = new ApiClient(API_BASE);

const filterPanel = new FilterPanel(
  {
    mediaSwitch: document.getElementById("media-type-switch"),
    providerSelect: document.getElementById("provider-select"),
    countrySelect: document.getElementById("country-select"),
    genreSelect: document.getElementById("genre-select"),
    resetBtn: document.getElementById("reset-btn"),
  },
  COUNTRIES,
  PROVIDERS
);

const wheel = new Wheel(document.getElementById("wheel-canvas"));

const resultModal = new ResultModal({
  modal: document.getElementById("result-modal"),
  poster: document.getElementById("result-poster"),
  title: document.getElementById("result-title"),
  meta: document.getElementById("result-meta"),
  overview: document.getElementById("result-overview"),
  closeBtn: document.getElementById("modal-close-btn"),
  rerollBtn: document.getElementById("modal-reroll-btn"),
});

new FeedbackModal({
  fab: document.getElementById("feedback-fab"),
  modal: document.getElementById("feedback-modal"),
  textarea: document.getElementById("feedback-textarea"),
  honeypot: document.getElementById("feedback-honeypot"),
  sendBtn: document.getElementById("feedback-send-btn"),
  closeBtn: document.getElementById("feedback-close-btn"),
  status: document.getElementById("feedback-status"),
});

const statsDisplay = new StatsDisplay(document.getElementById("spin-count"), apiClient);

const wheelArea = document.getElementById("wheel-area");
const centerBtn = document.getElementById("center-spin-btn");
const lowResultsHint = document.getElementById("low-results-hint");

// Tracks whether the center button should say "Spin the Wheel" (nothing
// spun yet for the current filter selection) or "Reroll" (already spun).
let hasSpunOnce = false;

/** Load the genre dropdown for the currently selected media type. */
async function loadGenres() {
  const genres = await apiClient.getGenres(filterPanel.getMediaType());
  filterPanel.setGenres(genres);
}

/**
 * Fetch a fresh batch of titles and draw the wheel at rest (no spin
 * yet) — this is what runs the moment all filters become complete.
 * @param {object} selection
 */
async function loadWheel(selection) {
  const { titles, lowResults } = await apiClient.getWheelTitles(selection);
  lowResultsHint.hidden = !lowResults;
  wheel.load(titles);
  hasSpunOnce = false;
  centerBtn.textContent = "Spin the Wheel";
  centerBtn.disabled = false;
  wheelArea.hidden = false;
}

/** Fetch a fresh batch of titles and immediately spin (used by Reroll). */
async function rerollAndSpin() {
  const { titles, lowResults } = await apiClient.getWheelTitles(filterPanel.getSelection());
  lowResultsHint.hidden = !lowResults;
  wheel.load(titles);
  wheel.spin();
}

/** Hide the wheel and reset the center button, e.g. before a fresh selection. */
function hideWheel() {
  wheelArea.hidden = true;
  lowResultsHint.hidden = true;
  resultModal.close();
  hasSpunOnce = false;
  centerBtn.textContent = "Spin the Wheel";
}

filterPanel.onMediaTypeChange(() => {
  hideWheel();
  loadGenres();
});

filterPanel.onSelectionReady((selection) => loadWheel(selection));

filterPanel.onReset(() => hideWheel());

wheel.onResult((titleData) => {
  hasSpunOnce = true;
  centerBtn.textContent = "Reroll";
  centerBtn.disabled = false;
  statsDisplay.refresh();
  resultModal.show(titleData);
});

resultModal.onReroll(() => centerBtn.click());

centerBtn.addEventListener("click", () => {
  centerBtn.disabled = true;
  if (hasSpunOnce) {
    rerollAndSpin();
  } else {
    wheel.spin();
  }
});

loadGenres();
statsDisplay.refresh();
