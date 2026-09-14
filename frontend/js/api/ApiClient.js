/**
 * Handles all HTTP communication with the Flask backend.
 */
export class ApiClient {

  /**
   * @param {string} baseUrl - Base URL of the backend API (no trailing slash).
   */
  constructor(baseUrl) {
    this._baseUrl = baseUrl;
  }


  /**
   * Fetch the genre list for the given media type.
   * @param {"movie"|"tv"} mediaType
   * @returns {Promise<Array<{id:number,name:string}>>}
   */
  async getGenres(mediaType) {
    const genres = await this._get("/api/genres", { type: mediaType });
    return genres;
  }


  /**
   * Fetch a random batch of titles matching the given filters.
   * @param {{mediaType:"movie"|"tv", country:string, genreId:number, provider:string}} filters
   * @returns {Promise<{titles:Array<object>, lowResults:boolean}>}
   */
  async getWheelTitles({ mediaType, country, genreId, provider }) {
    const data = await this._get("/api/wheel", {
      type: mediaType,
      country,
      genre: genreId,
      provider,
    });
    const result = { titles: data.titles, lowResults: data.lowResults };
    return result;
  }


  /**
   * Fetch the current total spin count.
   * @returns {Promise<number>}
   */
  async getSpinCount() {
    const data = await this._get("/api/stats/spins");
    const total = data.total;
    return total;
  }


  /**
   * Issue a GET request and parse the JSON response.
   * @param {string} path
   * @param {Object<string, string|number>} [params]
   * @returns {Promise<any>}
   */
  async _get(path, params = {}) {
    const url = new URL(this._baseUrl + path);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    const response = await fetch(url);
    if (!response.ok) {
      const body         = await response.json().catch(() => ({}));
      const errorMessage = body.error || `Request failed: ${response.status}`;
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  }
}