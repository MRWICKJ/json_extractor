const fs = require("fs");

// Test 1: Normal parse of question.json (should work)
const data = fs.readFileSync("question.json", "utf8");
const parsed = JSON.parse(data);
const q = parsed[0].content.question_text;
console.log("Test 1 - Normal parse:", q.includes("\\sqrt") ? "PASS (double backslash preserved)" : "FAIL");

// Test 2: Simulate user pasting JSON with bare backslashes like \vec
const badJson = '{"latex":"\\vec{v} = \\text{velocity}"}';
try {
  const r = JSON.parse(badJson);
  console.log("Test 2 - Bare \\vec parse: FAIL (silent corruption? got:", JSON.stringify(r), ")");
} catch {
  console.log("Test 2 - Bare \\vec parse: correctly throws");
}

// Test 3: Recovery regex on bare backslash input
const badJson2 = '{"latex":"\\vec{v} = \\text{velocity}"}';
const fixed = badJson2
  .replace(/(?<!\\)\\([a-zA-Z])/g, "\\\\$1")
  .replace(/(?<!\\)\\(?![\\"\/bfnrtu])/g, "\\\\")
  .replace(/\t/g, "\\t")
  .replace(/\r/g, "\\r");
console.log("Test 3 - Fixed JSON:", fixed);
const r2 = JSON.parse(fixed);
console.log("Test 3 - Recovery parse:", r2.latex === "\\vec{v} = \\text{velocity}" ? "PASS" : "FAIL got: " + r2.latex);

// Test 4: Silent corruption case (\text gets parsed as tab+"ext")
const corruptJson = '{"latex":"\\text{hello}"}';
const r3 = JSON.parse(corruptJson);
console.log("Test 4 - Silent corruption:", r3.latex.includes("\t") ? "DETECTED (contains tab)" : "CLEAN got: " + JSON.stringify(r3.latex));

// Test 5: deep sanitize fixes silent corruption
function sanitizeLatex(s) {
  return s.replace(/\t/g, "\\t").replace(/\r/g, "\\r");
}
function deepSanitizeLatex(obj) {
  if (typeof obj === "string") return sanitizeLatex(obj);
  if (Array.isArray(obj)) return obj.map(deepSanitizeLatex);
  if (obj && typeof obj === "object") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = deepSanitizeLatex(value);
    }
    return result;
  }
  return obj;
}
const fixed3 = deepSanitizeLatex(r3);
console.log("Test 5 - Deep sanitize fixes corruption:", fixed3.latex === "\\text{hello}" ? "PASS" : "FAIL got: " + JSON.stringify(fixed3.latex));

// Test 6: Real question.json content with bare backslashes
const qJson = JSON.stringify(parsed);
// Turn \\ into \ to simulate bad input
const bareQJson = qJson.replace(/\\\\/g, "\\");

// Check for non-letter chars after backslash that would survive the fix
const remainingIssues = bareQJson.match(/\\(?![a-zA-Z"\\/bfnrtu])/g);
if (remainingIssues) {
  console.log("Test 6 - Remaining bare backslashes before non-letters:", remainingIssues.slice(0, 5).join(", "), "...");
} else {
  console.log("Test 6 - No bare backslashes before non-letters");
}

try {
  JSON.parse(bareQJson);
  console.log("Test 6b - question.json with bare backslashes: parsed (may be corrupted)");
} catch (e) {
  console.log("Test 6b - question.json with bare backslashes: threw as expected");
  const fixed4 = bareQJson
    .replace(/(?<!\\)\\([a-zA-Z])/g, "\\\\$1")
    .replace(/(?<!\\)\\(?![\\"\/bfnrtu])/g, "\\\\")
    .replace(/\t/g, "\\t")
    .replace(/\r/g, "\\r");
  try {
    const r4 = JSON.parse(fixed4);
    const ok = r4[0].content.question_text.includes("\\sqrt");
    console.log("Test 7 - Recovery on question.json:", ok ? "PASS" : "FAIL");
  } catch (e2) {
    // Find the problematic position
    const pos = +e2.message.match(/position (\d+)/)?.[1] || 0;
    const ctx = fixed4.slice(Math.max(0, pos - 10), pos + 10);
    console.log("Test 7 - Recovery FAILED at position", pos, "context:", JSON.stringify(ctx));
    console.log("Test 7 - Char at position:", JSON.stringify(fixed4[pos]), "prev:", JSON.stringify(fixed4[pos - 1]));
  }
}
