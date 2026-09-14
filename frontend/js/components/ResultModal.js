/**
 * Renders the "you got X" popup shown after a spin, and offers a
 * quick Close/Reroll shortcut.
 */
export class ResultModal {
  /**
   * @param {Object} elements
   * @param {HTMLElement} elements.modal
   * @param {HTMLImageElement} elements.poster
   * @param {HTMLElement} elements.title
   * @param {HTMLElement} elements.meta
   * @param {HTMLElement} elements.overview
   * @param {HTMLButtonElement} elements.closeBtn
   * @param {HTMLButtonElement} elements.rerollBtn
   */
  constructor(elements) {
    this._el = elements;
    this._onReroll = null;

    this._el.closeBtn.addEventListener("click", () => this.close());
    this._el.rerollBtn.addEventListener("click", () => {
      this.close();
      if (this._onReroll) this._onReroll();
    });
  }

  /** @param {() => void} callback */
  onReroll(callback) {
    this._onReroll = callback;
  }

  /**
   * Show the popup populated with one title's details.
   * @param {{title:string, year:string, rating:number, posterUrl:string, overview:string}} titleData
   */
  show(titleData) {
    this._el.poster.src = titleData.posterUrl;
    this._el.poster.alt = `${titleData.title} poster`;
    this._el.title.textContent = titleData.title;
    this._el.meta.textContent = `${titleData.year || "—"} · ★ ${titleData.rating}`;
    this._el.overview.textContent = titleData.overview;
    this._el.modal.hidden = false;
  }

  /** Hide the popup. */
  close() {
    this._el.modal.hidden = true;
  }
}
