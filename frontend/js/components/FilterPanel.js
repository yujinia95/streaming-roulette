/**
 * Owns the Movie/TV switch, Provider/Country/Genre selects, and the
 * Reset button. Reports the selection whenever it becomes complete.
 */
export class FilterPanel {
  /**
   * @param {Object} elements - DOM elements this panel controls.
   * @param {Array<{code:string,name:string}>} countries
   * @param {Array<{id:string,label:string}>} providers
   */
  constructor(elements, countries, providers) {
    this._el = elements;
    this._onSelectionReady = null;
    this._onReset = null;
    this._onMediaTypeChange = null;

    this._populateSelect(this._el.countrySelect, countries, (c) => c.code, (c) => c.name, "Select country");
    this._populateSelect(this._el.providerSelect, providers, (p) => p.id, (p) => p.label, "Select provider");

    this._el.mediaSwitch.addEventListener("change", () => {
      if (this._onMediaTypeChange) this._onMediaTypeChange(this.getMediaType());
    });
    [this._el.providerSelect, this._el.countrySelect, this._el.genreSelect].forEach((select) =>
      select.addEventListener("change", () => this._notifyIfReady())
    );
    this._el.resetBtn.addEventListener("click", () => this.reset());
  }

  /**
   * Fires every time the selection becomes complete (initially, or
   * after any filter changes while already complete).
   * @param {(selection: object) => void} callback
   */
  onSelectionReady(callback) {
    this._onSelectionReady = callback;
  }

  /** @param {() => void} callback */
  onReset(callback) {
    this._onReset = callback;
  }

  /** @param {(mediaType: "movie"|"tv") => void} callback */
  onMediaTypeChange(callback) {
    this._onMediaTypeChange = callback;
  }

  /** @param {Array<{id:number,name:string}>} genres */
  setGenres(genres) {
    this._populateSelect(this._el.genreSelect, genres, (g) => g.id, (g) => g.name, "Select genre");
  }

  /** @returns {"movie"|"tv"} */
  getMediaType() {
    const mediaType = this._el.mediaSwitch.checked ? "tv" : "movie";
    return mediaType;
  }

  /** @returns {{mediaType:string, provider:string, country:string, genreId:string}} */
  getSelection() {
    const selection = {
      mediaType: this.getMediaType(),
      provider: this._el.providerSelect.value,
      country: this._el.countrySelect.value,
      genreId: this._el.genreSelect.value,
    };
    return selection;
  }

  /** Reset every control to its unselected default. */
  reset() {
    this._el.mediaSwitch.checked = false;
    this._el.providerSelect.selectedIndex = 0;
    this._el.countrySelect.selectedIndex = 0;
    this._el.genreSelect.innerHTML = '<option value="" selected disabled>Select genre</option>';
    if (this._onReset) this._onReset();
  }

  /** Notify the listener once every field has a real value. */
  _notifyIfReady() {
    const selection = this.getSelection();
    const isComplete = Boolean(selection.provider && selection.country && selection.genreId);
    if (isComplete && this._onSelectionReady) {
      this._onSelectionReady(selection);
    }
  }

  _populateSelect(select, items, getValue, getLabel, placeholderText) {
    select.innerHTML = "";
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    placeholderOption.textContent = placeholderText;
    select.appendChild(placeholderOption);

    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = getValue(item);
      option.textContent = getLabel(item);
      select.appendChild(option);
    });
  }
}
