const COLORS = ["#5b7c99", "#7c9473", "#b98a8a", "#c9a877", "#6f9e97", "#9b8aa3"];

/**
 * Draws the spinning wheel on a <canvas> and runs the spin animation.
 */
export class Wheel {

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this._canvas               = canvas;
    this._ctx                  = canvas.getContext("2d");
    this._titles               = [];
    this._rotation             = 0;
    this._onResult             = null;
    this._pendingWinner        = null;
    this._boundOnTransitionEnd = this._onTransitionEnd.bind(this);
  }

  /** @param {(title: object) => void} callback */
  onResult(callback) {
    this._onResult = callback;
  }

  /**
   * Load a new batch of titles and draw the wheel at rest (no spin).
   * @param {Array<object>} titles
   */
  load(titles) {
    this._titles = titles;
    this._canvas.style.transition = "none";
    this._rotation = 0;
    this._canvas.style.transform = "rotate(0deg)";
    this._draw();
  }

  /** Spin the wheel and land on a randomly chosen title. */
  spin() {
    if (this._titles.length === 0) return;

    const winnerIndex = Math.floor(Math.random() * this._titles.length);
    const sliceAngle = 360 / this._titles.length;
    const targetAngle = 360 * 6 - (winnerIndex * sliceAngle + sliceAngle / 2);

    this._pendingWinner = this._titles[winnerIndex];
    this._canvas.removeEventListener("transitionend", this._boundOnTransitionEnd);
    this._canvas.addEventListener("transitionend", this._boundOnTransitionEnd, { once: true });

    this._rotation = targetAngle;
    this._canvas.style.transition = "transform 5s cubic-bezier(0.12, 0.67, 0.15, 1)";
    void this._canvas.offsetHeight;
    this._canvas.style.transform = `rotate(${this._rotation}deg)`;
  }


  _onTransitionEnd() {
    if (this._onResult && this._pendingWinner) {
      this._onResult(this._pendingWinner);
    }
  }


  _draw() {
    const { width, height } = this._canvas;
    const ctx = this._ctx;
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const sliceAngle = (2 * Math.PI) / this._titles.length;

    ctx.clearRect(0, 0, width, height);

    this._titles.forEach((title, index) => {
      const startAngle = index * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.fill();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#111";
      ctx.font = "600 14px system-ui, sans-serif";
      ctx.fillText(this._truncate(title.title, 18), radius - 12, 0);
      ctx.restore();
    });
  }

  
  _truncate(text, maxLength) {
    const isTooLong = text.length > maxLength;
    const truncatedText = isTooLong ? `${text.slice(0, maxLength - 1)}…` : text;
    return truncatedText;
  }
}