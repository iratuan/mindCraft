'use strict';
/* Pomodoro integrado: timer de foco (25 min) com pausa (5 min) e pausa longa (15 min a cada 4 ciclos).
   Persiste o estado em localStorage para sobreviver a fechamentos. */
(function () {
  const WORK = 25 * 60, SHORT = 5 * 60, LONG = 15 * 60, CYCLES = 4;
  const KEY = 'mc-pomodoro';
  let state = { phase: 'work', remaining: WORK, cycles: 0, running: false, lastTick: null };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) state = { ...state, ...s }; } catch { /* ignora */ }

  // reconstrói o tempo restante se estava rodando
  if (state.running && state.lastTick) {
    const elapsed = Math.floor((Date.now() - state.lastTick) / 1000);
    state.remaining = Math.max(0, state.remaining - elapsed);
    if (state.remaining === 0) advance();
  }

  const $ = (s) => document.querySelector(s);
  let timer = null;

  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignora */ } }
  function fmt(s) { const m = Math.floor(s / 60), sec = s % 60; return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; }
  function phaseLabel() { return state.phase === 'work' ? 'Foco' : state.phase === 'short' ? 'Pausa curta' : 'Pausa longa'; }
  function phaseColor() { return state.phase === 'work' ? '#e34850' : '#52c07a'; }

  function advance() {
    if (state.phase === 'work') {
      state.cycles++;
      state.phase = (state.cycles % CYCLES === 0) ? 'long' : 'short';
      state.remaining = (state.phase === 'long') ? LONG : SHORT;
    } else {
      state.phase = 'work';
      state.remaining = WORK;
    }
    save();
  }

  function tick() {
    if (!state.running) return;
    state.remaining--;
    if (state.remaining <= 0) { state.remaining = 0; advance(); if (state.running) { /* continua */ } }
    state.lastTick = Date.now();
    save();
    render();
  }

  function start() { state.running = true; state.lastTick = Date.now(); save(); if (!timer) timer = setInterval(tick, 1000); render(); }
  function pause() { state.running = false; state.lastTick = null; save(); if (timer) { clearInterval(timer); timer = null; } render(); }
  function reset() { state = { phase: 'work', remaining: WORK, cycles: 0, running: false, lastTick: null }; save(); if (timer) { clearInterval(timer); timer = null; } render(); }
  function toggle() { state.running ? pause() : start(); }

  function render() {
    const el = $('#pomodoroWidget');
    if (!el) return;
    el.querySelector('.pomo-time').textContent = fmt(state.remaining);
    el.querySelector('.pomo-phase').textContent = phaseLabel();
    el.querySelector('.pomo-phase').style.color = phaseColor();
    el.querySelector('.pomo-btn').textContent = state.running ? '⏸' : '▶';
    el.querySelector('.pomo-cycles').textContent = `Ciclo ${Math.min(state.cycles + 1, CYCLES)}/${CYCLES}`;
  }

  function buildWidget() {
    const w = document.createElement('div');
    w.id = 'pomodoroWidget';
    w.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:10;display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--bg-panel);border:1px solid var(--line);border-radius:10px;font-size:12px;color:var(--text);user-select:none;';
    w.innerHTML = '<span class="pomo-phase" style="font-weight:600;">Foco</span><span class="pomo-time" style="font-variant-numeric:tabular-nums;font-weight:700;min-width:42px;text-align:center;">25:00</span><button class="pomo-btn btn small" style="width:28px;height:28px;padding:0;">▶</button><span class="pomo-cycles" style="color:var(--text-dim);font-size:10px;">Ciclo 1/4</span>';
    w.querySelector('.pomo-btn').addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    w.addEventListener('dblclick', (e) => { e.stopPropagation(); if (confirm('Resetar Pomodoro?')) reset(); });
    document.body.appendChild(w);
    render();
  }

  if (state.running) { timer = setInterval(tick, 1000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildWidget);
  else buildWidget();
})();
