import assert from "node:assert/strict";
import test from "node:test";
import {
  isSameCategoryName,
  normalizeCategoryName,
  preserveUnchangedTicketCategory,
} from "../src/utils/categoryName.js";

test("category comparison normalizes case and all whitespace formatting", () => {
  const expected = "Suporte Técnico";
  for (const variant of [
    "  suporte técnico  ",
    "Suporte\tTécnico",
    "SUPORTE\nTÉCNICO",
    "Suporte\r\nTécnico",
    "Suporte   Técnico",
  ]) {
    assert.equal(isSameCategoryName(variant, expected), true, JSON.stringify(variant));
  }
  assert.equal(normalizeCategoryName("  A\t\nB  "), "a b");
});

test("duplicate and linked-name comparisons use the same normalization key", () => {
  assert.equal(isSameCategoryName("Rede\t e Sistemas", " rede E   sistemas "), true);
  assert.equal(isSameCategoryName("Suporte", "Suporte N2"), false);
});

test("format-only ticket category updates preserve the exact historical value", () => {
  const historical = "  Categoria\tAntiga\r\n";
  const result = preserveUnchangedTicketCategory(historical, "categoria antiga");
  assert.deepEqual(result, { changed: false, value: historical });
});

test("a genuinely changed ticket category is identified for active-category validation", () => {
  assert.deepEqual(
    preserveUnchangedTicketCategory("Categoria removida", "Categoria atual"),
    { changed: true, value: "Categoria atual" },
  );
  assert.deepEqual(
    preserveUnchangedTicketCategory(undefined, " Nova categoria "),
    { changed: true, value: "Nova categoria" },
  );
});
