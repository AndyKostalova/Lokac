// Minimal browser test harness. No dependencies.
const __suites = [];
let __current = null;

export function describe(name, fn) {
  __current = { name, tests: [] };
  __suites.push(__current);
  fn();
  __current = null;
}
export function it(name, fn) {
  __current.tests.push({ name, fn });
}
export function expect(actual) {
  return {
    toBe(exp) { if (actual !== exp) throw new Error(`expected ${JSON.stringify(actual)} to be ${JSON.stringify(exp)}`); },
    toEqual(exp) {
      const a = JSON.stringify(actual), b = JSON.stringify(exp);
      if (a !== b) throw new Error(`expected ${a} to equal ${b}`);
    },
    toBeTruthy() { if (!actual) throw new Error(`expected ${JSON.stringify(actual)} to be truthy`); },
    toBeFalsy() { if (actual) throw new Error(`expected ${JSON.stringify(actual)} to be falsy`); },
    toBeGreaterThanOrEqual(n) { if (!(actual >= n)) throw new Error(`expected ${actual} >= ${n}`); },
  };
}
export async function run(rootEl) {
  let passed = 0, failed = 0; const failures = [];
  for (const suite of __suites) {
    const sEl = document.createElement('div');
    sEl.innerHTML = `<h3>${suite.name}</h3>`;
    for (const t of suite.tests) {
      const line = document.createElement('div');
      try {
        await t.fn();
        passed++; line.textContent = `  ✅ ${t.name}`; line.style.color = 'green';
      } catch (e) {
        failed++; failures.push(`${suite.name} › ${t.name}: ${e.message}`);
        line.textContent = `  ❌ ${t.name} — ${e.message}`; line.style.color = 'red';
      }
      sEl.appendChild(line);
    }
    rootEl.appendChild(sEl);
  }
  const summary = document.createElement('h2');
  summary.textContent = `${passed} passed, ${failed} failed`;
  summary.style.color = failed ? 'red' : 'green';
  rootEl.prepend(summary);
  window.__TESTS__ = { passed, failed, failures };
}
