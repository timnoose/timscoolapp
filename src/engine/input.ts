/**
 * Unified input: keyboard + on-screen touch buttons.
 * Logical keys: up/down/left/right/a/b/menu. `consume` returns true once per press.
 */
export type Key = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'menu';

const KEYMAP: Record<string, Key> = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  Space: 'a', Enter: 'a', KeyZ: 'a', KeyE: 'a',
  Escape: 'b', KeyX: 'b', Backspace: 'b', KeyQ: 'b',
  Tab: 'menu', KeyM: 'menu', KeyI: 'menu',
};

class InputManager {
  private down = new Set<Key>();
  private pressed = new Set<Key>();
  private downTime = new Map<Key, number>();
  isTouch = false;
  onAnyInput: (() => void)[] = [];

  init(): void {
    window.addEventListener('keydown', (e) => {
      const k = KEYMAP[e.code];
      if (!k) return;
      if (e.code === 'Tab' || e.code === 'Space' || e.code.startsWith('Arrow') || e.code === 'Backspace') e.preventDefault();
      if (e.repeat) return;
      this.press(k);
    });
    window.addEventListener('keyup', (e) => {
      const k = KEYMAP[e.code];
      if (k) this.release(k);
    });
    window.addEventListener('blur', () => { this.down.clear(); });
    // touch buttons
    const buttons = document.querySelectorAll<HTMLElement>('.tbtn');
    buttons.forEach((el) => {
      const k = el.dataset.key as Key;
      const start = (e: Event) => { e.preventDefault(); el.classList.add('on'); this.press(k); };
      const end = (e: Event) => { e.preventDefault(); el.classList.remove('on'); this.release(k); };
      el.addEventListener('pointerdown', start);
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
      el.addEventListener('pointerleave', end);
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    });
    // detect touch devices to show controls
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (coarse || 'ontouchstart' in window) this.enableTouch();
    window.addEventListener('touchstart', () => this.enableTouch(), { once: true, passive: true });
  }

  enableTouch(): void {
    this.isTouch = true;
    document.body.classList.add('touch');
  }

  private press(k: Key): void {
    if (!this.down.has(k)) {
      this.down.add(k);
      this.pressed.add(k);
      this.downTime.set(k, performance.now());
    }
    this.onAnyInput.forEach((f) => f());
  }
  private release(k: Key): void { this.down.delete(k); }

  isDown(k: Key): boolean { return this.down.has(k); }
  /** True once per press. Consumed by the first caller. */
  consume(k: Key): boolean {
    if (this.pressed.has(k)) { this.pressed.delete(k); return true; }
    return false;
  }
  /** Held long enough to auto-repeat (for menus). */
  repeat(k: Key, initial = 350, every = 90): boolean {
    if (!this.down.has(k)) return false;
    const t = this.downTime.get(k) ?? 0;
    const held = performance.now() - t;
    if (held < initial) return false;
    const steps = Math.floor((held - initial) / every);
    const key = `${k}-rep`;
    const last = this.repeatCount.get(key) ?? -1;
    if (steps > last) { this.repeatCount.set(key, steps); return true; }
    return false;
  }
  private repeatCount = new Map<string, number>();
  /** Call at the end of each frame. */
  endFrame(): void {
    this.pressed.clear();
    for (const [k] of this.repeatCount) {
      const key = k.replace('-rep', '') as Key;
      if (!this.down.has(key)) this.repeatCount.delete(k);
    }
  }
  /** Synthetic press (used by tests / touch). */
  simulate(k: Key, ms = 60): void {
    this.press(k);
    setTimeout(() => this.release(k), ms);
  }
  clear(): void { this.pressed.clear(); }
}

export const input = new InputManager();
