// input.js — keyboard and mouse state, shared by the game loop. The ship is
// steered with WASD or the arrow keys, the mouse aims the harpoon, and a click
// (or Space) fires. P pauses, R restarts, M mutes, Enter starts.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseInside = false;
    this.clicked = false; // consumed by the loop once per press
    this.mouseDown = false;
    this.pressed = new Set(); // edge-triggered keys, consumed once per press

    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        e.preventDefault();
      }
      if (!this.keys.has(k)) this.pressed.add(k);
      this.keys.add(k);
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouseDown = false;
    });
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouseY = (e.clientY - r.top) * (canvas.height / r.height);
      this.mouseInside = true;
    });
    canvas.addEventListener('mouseleave', () => { this.mouseInside = false; });
    canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.mouseDown = true;
      this.clicked = true;
    });
    window.addEventListener('mouseup', () => { this.mouseDown = false; });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  axis() {
    let x = 0;
    let y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }
    return { x, y };
  }

  firing() {
    return this.mouseDown || this.keys.has(' ');
  }

  takePressed(key) {
    const k = key.toLowerCase();
    if (this.pressed.has(k)) {
      this.pressed.delete(k);
      return true;
    }
    return false;
  }

  takeClick() {
    if (this.clicked) {
      this.clicked = false;
      return true;
    }
    return false;
  }

  endFrame() {
    this.pressed.clear();
    this.clicked = false;
  }
}
