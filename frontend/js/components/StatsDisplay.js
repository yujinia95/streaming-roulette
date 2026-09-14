/**
 * Renders and refreshes the "N spins so far" counter.
 */
export class StatsDisplay {
  /**
   * @param {HTMLElement} element - Element the count text is written into.
   * @param {import("../api/ApiClient.js").ApiClient} apiClient
   */
  constructor(element, apiClient) {
    this._el = element;
    this._apiClient = apiClient;
  }

  /** Fetch and render the current total spin count. */
  async refresh() {
    try {
      const total = await this._apiClient.getSpinCount();
      this._el.textContent = `${total.toLocaleString()} spins so far`;
    } catch {
      this._el.textContent = "";
    }
  }
}
