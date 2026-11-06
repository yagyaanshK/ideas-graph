// Integrity check for the data embedded in index.html.
// Run from anywhere:  node tools/validate.js   (exits non-zero on any problem)
var fs = require("fs"), vm = require("vm"), path = require("path");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var start = html.indexOf("var GROUPS"), end = html.indexOf("// ----------------------------------------------------------- setup");
if (start < 0 || end < 0) throw new Error("data block markers not found");
var ctx = {}; vm.runInNewContext(html.slice(start, end), ctx);
var G = ctx.GROUPS, GORDER = ctx.GORDER, TALKS = ctx.TALKS, WSRC = ctx.WSRC, WORLD = ctx.WORLD, NODES = ctx.NODES, EDGES = ctx.EDGES;

var all = NODES.map(function (n) { if (!n.k) n.k = "idea"; return n; }).concat(WORLD);
var SRC = Object.assign({}, TALKS, WSRC), ids = {}, errs = [];
var KINDS = { idea: 1, pattern: 1, product: 1, opp: 1 }, EK = { reinforce: 1, relate: 1, tension: 1, evidence: 1 };
var ST = { announced: 1, shipping: 1, dead: 1, acquired: 1, idea: 1, exploring: 1, building: 1, dropped: 1 };
var RC = { working: 1, early: 1, mixed: 1, unproven: 1, hype: 1, dead: 1 };
var DATE = /^\d{4}-\d{2}(-\d{2})?$/;

GORDER.forEach(function (g) { if (!G[g]) errs.push("GORDER group missing in GROUPS: " + g); });
all.forEach(function (n) {
  if (ids[n.id]) errs.push("dup id " + n.id); ids[n.id] = 1;
  if (!G[n.g]) errs.push(n.id + ": unknown group " + n.g);
  if (!KINDS[n.k]) errs.push(n.id + ": bad kind " + n.k);
  if (n.k === "idea" && n.g === "world") errs.push(n.id + ": idea node in world group");
  if (n.k !== "idea" && n.g !== "world") errs.push(n.id + ": world node not in world group");
  if (/^(PAT|PROD|OPP)-/.test(n.id) !== (n.k !== "idea")) errs.push(n.id + ": id prefix / kind mismatch");
  if (n.s !== n.p.length) errs.push(n.id + ": s=" + n.s + " but p has " + n.p.length);
  if (!n.src || !n.src.length) errs.push(n.id + ": no src");
  (n.src || []).forEach(function (k) {
    if (!SRC[k]) errs.push(n.id + ": unknown src " + k);
    if (n.k === "idea" && !/^S/.test(k)) errs.push(n.id + ": idea with non-S src " + k);
    if (n.k !== "idea" && !/^W/.test(k)) errs.push(n.id + ": world node with non-W src " + k);
  });
  if (!n.ad || !DATE.test(n.ad)) errs.push(n.id + ": missing/bad ad (added) date");
  if (n.up && !DATE.test(n.up)) errs.push(n.id + ": bad up (updated) date");
  if (n.k === "product" || n.k === "opp") {
    if (!n.st || !ST[n.st]) errs.push(n.id + ": missing/bad status " + n.st);
    if (!n.asof || !DATE.test(n.asof)) errs.push(n.id + ": missing/bad asof");
    if (n.k === "product" && (!n.rc || !RC[n.rc])) errs.push(n.id + ": missing/bad reality check rc=" + n.rc);
  }
  if (!n.b || n.b.length < 20) errs.push(n.id + ": blurb too short");
  if (!n.t || n.t.length < 6) errs.push(n.id + ": missing short title t");
});
Object.keys(SRC).forEach(function (k) {
  var t = SRC[k];
  if (!t.d) errs.push("source " + k + ": missing d (date)");
  if (/^W/.test(k) && !t.type) errs.push("source " + k + ": missing type");
});
var seen = {};
EDGES.forEach(function (e) {
  if (!ids[e[0]]) errs.push("dangling edge from " + e[0]);
  if (!ids[e[1]]) errs.push("dangling edge to " + e[1]);
  if (!EK[e[2]]) errs.push("bad edge kind " + e[2] + " on " + e[0] + "->" + e[1]);
  if (e[0] === e[1]) errs.push("self edge " + e[0]);
  var key = e[0] + "|" + e[1]; if (seen[key]) errs.push("duplicate edge " + key); seen[key] = 1;
});

var cons = all.filter(function (n) { return n.s >= 2; }).map(function (n) { return n.id + "=" + n.s; });
console.log("ideas:", NODES.length, "world:", WORLD.length, "edges:", EDGES.length, "talks:", Object.keys(TALKS).length, "wsrc:", Object.keys(WSRC).length);
console.log("consensus:", cons.join(" "));
if (errs.length) { console.error("\nPROBLEMS (" + errs.length + "):\n  " + errs.join("\n  ")); process.exit(1); }
console.log("OK - no problems");
