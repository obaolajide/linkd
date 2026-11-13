import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../lib/share.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2017 } }).outputText + "\n//# sourceURL=lib/share.ts";
const { sharedUrl, parseMessage, webUrl } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("accept Chrome URL, Android text, and title-only URL payloads", () => {
  assert.equal(sharedUrl({ url: "https://github.com/example/repo?tab=readme#intro" }), "https://github.com/example/repo?tab=readme#intro");
  assert.equal(sharedUrl({ text: "Read this: https://example.com/article." }), "https://example.com/article");
  assert.equal(sharedUrl({ title: "https://example.com" }), "https://example.com/");
  assert.equal(sharedUrl({ url: "bad", text: "https://example.com/path" }), "https://example.com/path");
  assert.equal(sharedUrl({ text: "https://example.com/path_(part)" }), "https://example.com/path_(part)");
});

test("reject missing, unsafe and credential-bearing links", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,hi", "ftp://example.com", "https://user:pass@example.com", ""]) {
    assert.equal(webUrl(url), null);
    assert.throws(() => sharedUrl({ url }));
  }
  assert.throws(() => sharedUrl({ text: "No webpage here" }));
});

test("validate share metadata while preserving manual text and links", () => {
  assert.deepEqual(parseMessage({ source: "share", text: "An article https://example.com/a", title: "Article" }), {
    text: "https://example.com/a", type: "link", title: "Article", sharedText: "An article https://example.com/a",
  });
  assert.deepEqual(parseMessage({ text: " hello ", type: "text" }), { text: "hello", type: "text" });
  assert.deepEqual(parseMessage({ text: "https://example.com", type: "link" }), { text: "https://example.com/", type: "link" });
  for (const value of [null, {}, { text: " ", type: "text" }, { text: "a", type: "other" }, { text: "javascript:alert(1)", type: "link" }, { source: "share", text: [] }, { source: "share", title: "a".repeat(16001) }]) {
    assert.throws(() => parseMessage(value));
  }
});

test("manifest routes all supported fields to the receiving page with install icons", () => {
  const manifest = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url)));
  assert.deepEqual(manifest.share_target, { action: "/share", method: "GET", enctype: "application/x-www-form-urlencoded", params: { title: "title", text: "text", url: "url" } });
  for (const size of [192, 512]) {
    const icon = manifest.icons.find(icon => icon.sizes === `${size}x${size}`);
    const png = readFileSync(new URL(`../public${icon.src}`, import.meta.url));
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
});

test("shared and manual links reuse storage, including legacy and concurrent duplicate saves", async () => {
  const records = [];
  const model = {
    async init() {},
    async findOne(query) { return records.find(row => Object.entries(query).every(([key, value]) => row[key] === value)); },
    async create(data) { records.push(data); return data; },
    async findOneAndUpdate(query, update) {
      const existing = await this.findOne(query);
      if (existing) return existing;
      // Simulate unique-index enforcement after simultaneous requests read no match.
      const duplicate = records.find(row => row.linkKey === query.linkKey);
      if (duplicate) throw Object.assign(new Error("duplicate"), { code: 11000 });
      return this.create(update.$setOnInsert);
    },
  };
  const exports = {};
  const crypto = await import("node:crypto");
  const dependencies = {
    "node:crypto": crypto, "@/lib/db": { connectDB: async () => {} },
    "@/models/Message": { default: model }, "@/lib/share": { parseMessage },
  };
  const code = ts.transpileModule(readFileSync(new URL("../lib/messages.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, esModuleInterop: false },
  }).outputText;
  vm.runInNewContext(code, { exports, require: name => dependencies[name] });
  const { saveMessage } = exports;
  await Promise.all(Array.from({ length: 5 }, () => saveMessage({ source: "share", url: "https://example.com/a" })));
  assert.equal(records.length, 1);
  await saveMessage({ text: "https://example.com/a", type: "link" });
  assert.equal(records.length, 1);
  records.push({ text: "https://example.com/legacy", type: "link" });
  await saveMessage({ source: "share", text: "https://example.com/legacy" });
  assert.equal(records.length, 2);
  await saveMessage({ text: "a note", type: "text" });
  assert.equal(records.length, 3);
});
