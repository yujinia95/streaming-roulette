const FORMSPREE_ENDPOINT = "https://formspree.io/f/xzeblovq";
const RECAPTCHA_SITE_KEY = "6LfQyrotAAAAAIPjwOIvB2RM3O8_uBAm7FA1bOct";
const MAX_LENGTH = 500;
const COOLDOWN_SECONDS = 60;

/**
 * Controls the feedback icon and its popup: a single free-text field
 * that posts straight to Formspree, isolated from the rest of the app.
 */
export class FeedbackModal {
  /**
   * @param {Object} elements
   * @param {HTMLButtonElement} elements.fab
   * @param {HTMLElement} elements.modal
   * @param {HTMLTextAreaElement} elements.textarea
   * @param {HTMLInputElement} elements.honeypot
   * @param {HTMLButtonElement} elements.sendBtn
   * @param {HTMLButtonElement} elements.closeBtn
   * @param {HTMLElement} elements.status
   */
  constructor(elements) {
    this._el = elements;
    this._el.textarea.maxLength = MAX_LENGTH;

    this._el.fab.addEventListener("click", () => this._open());
    this._el.closeBtn.addEventListener("click", () => this._close());
    this._el.sendBtn.addEventListener("click", () => this._submit());
  }

  _open() {
    this._el.status.textContent = "";
    this._el.modal.hidden = false;
  }

  _close() {
    this._el.modal.hidden = true;
    this._el.textarea.value = "";
  }

  /** Validate and send the feedback message to Formspree. */
  async _submit() {
    const message = this._el.textarea.value.trim();

    if (this._el.honeypot.value) return;
    if (!message) {
      this._el.status.textContent = "Please write something first.";
      return;
    }
    if (message.length > MAX_LENGTH) {
      this._el.status.textContent = `Please keep it under ${MAX_LENGTH} characters.`;
      return;
    }

    this._el.sendBtn.disabled = true;
    this._el.status.textContent = "Sending…";

    try {
      const captchaToken = await this._getCaptchaToken();

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ message, "g-recaptcha-response": captchaToken }),
      });

      if (!response.ok) throw new Error("Send failed");

      this._el.status.textContent = "Thanks for the feedback!";
      this._el.textarea.value = "";
      setTimeout(() => this._close(), 1200);
      this._startCooldown();
    } catch {
      this._el.status.textContent = "Something went wrong. Please try again later.";
      this._el.sendBtn.disabled = false;
    }
  }

  /**
   * Get a fresh reCAPTCHA v3 token. v3 is invisible — there's no
   * checkbox to click, a new token is generated automatically on
   * each call, scored by Google, and checked by Formspree.
   * @returns {Promise<string>}
   */
  _getCaptchaToken() {
    return new Promise((resolve) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "submit" }).then(resolve);
      });
    });
  }

  /** Disable the send button for COOLDOWN_SECONDS to stop rapid-fire submissions. */
  _startCooldown() {
    let secondsLeft = COOLDOWN_SECONDS;
    this._el.sendBtn.disabled = true;
    this._el.sendBtn.textContent = `Wait ${secondsLeft}s`;

    const intervalId = setInterval(() => {
      secondsLeft -= 1;

      if (secondsLeft <= 0) {
        clearInterval(intervalId);
        this._el.sendBtn.disabled = false;
        this._el.sendBtn.textContent = "Send";
        return;
      }

      this._el.sendBtn.textContent = `Wait ${secondsLeft}s`;
    }, 1000);
  }
}
