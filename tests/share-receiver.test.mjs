import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Exercise the receiver across navigation and hydration without a live database.
function receiver() {
  const slots = [];
  let cursor = 0;
  let query = "";
  let effects = [];
  const calls = [];
  const historyState = { nextTree: "preserved" };
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const react = {
    useRef(value) {
      const index = cursor++;
      return slots[index] ??= { current: value };
    },
    useState(value) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = value;
      return [slots[index], next => { slots[index] = next; }];
    },
    useCallback(callback, deps) {
      const index = cursor++;
      if (!same(slots[index]?.deps, deps)) slots[index] = { deps, callback };
      return slots[index].callback;
    },
    useEffect(callback, deps) {
      const index = cursor++;
      if (!same(slots[index], deps)) effects.push(callback);
      slots[index] = deps;
    },
  };
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const dependencies = {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "next/link": { default: "a" },
    "next/navigation": { useSearchParams: () => new URLSearchParams(query) },
    "@/lib/share": { sharedUrl: (data) => {
      if (!data.url && !data.text && !data.title) throw new Error("Missing URL");
    } },
  };
  let response = { ok: true, json: async () => ({ _id: "saved" }) };
  const code = ts.transpileModule(readFileSync(new URL("../components/ShareReceiver.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    require: name => dependencies[name],
    fetch: async (url, options) => { calls.push({ url, body: JSON.parse(options.body) }); return response; },
    window: { history: {
      state: historyState,
      replaceState(state, title, url) {
        assert.equal(state, historyState);
        query = new URL(url, "https://linked.example").search.slice(1);
      },
    } },
  });
  return {
    calls,
    setResponse(next) { response = next; },
    navigate(next) { query = next; },
    render() {
      cursor = 0;
      effects = [];
      const tree = exports.default();
      for (const effect of effects) effect();
      return tree;
    },
    async settle() { await new Promise(resolve => setImmediate(resolve)); },
  };
}

const text = node => typeof node === "string" ? node : Array.isArray(node) ? node.map(text).join(" ") : node?.props ? text(node.props.children) : "";

test("a second Android share in the same window saves and history updates do not resubmit", async () => {
  const app = receiver();
  app.navigate("text=https%3A%2F%2Fexample.com%2Ffirst");
  app.render();
  await app.settle();
  assert.match(text(app.render()), /Link saved/);
  assert.equal(app.calls.length, 1);
  app.navigate("text=https%3A%2F%2Fexample.com%2Fsecond");
  app.render();
  await app.settle();
  assert.match(text(app.render()), /Link saved/);
  assert.equal(app.calls.length, 2);
  assert.equal(app.calls[1].body.text, "https://example.com/second");
});

test("an empty receiving page does not post or get stuck saving", () => {
  const app = receiver();
  assert.match(text(app.render()), /No link was shared/);
  assert.equal(app.calls.length, 0);
  app.navigate("saved=1");
  assert.match(text(app.render()), /Link saved/);
  assert.equal(app.calls.length, 0);
});

test("HTML server errors show a retryable save error instead of a JSON parsing error", async () => {
  const app = receiver();
  app.setResponse({ ok: false, json: async () => { throw new SyntaxError("Unexpected token <"); } });
  app.navigate("url=https%3A%2F%2Fexample.com");
  app.render();
  await app.settle();
  assert.match(text(app.render()), /Could not save this link/);
  assert.doesNotMatch(text(app.render()), /Unexpected token/);
});
