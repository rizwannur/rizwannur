const fs = require("node:fs");
const path = require("node:path");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function collectDeps(pkg) {
  return {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
    ...(pkg.optionalDependencies ?? {}),
  };
}

const packageJsonPath = path.join(process.cwd(), "package.json");
const pkg = readJson(packageJsonPath);
const deps = Object.keys(collectDeps(pkg));

const forbiddenMatchers = [
  /^@tailwindcss\/oxide-(win32|linux|darwin)-/i,
  /^lightningcss-(win32|linux|darwin)-/i,
];

const forbidden = deps.filter((name) => forbiddenMatchers.some((re) => re.test(name)));

if (forbidden.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    [
      "",
      "ERROR: Platform-specific native packages detected in package.json:",
      ...forbidden.map((d) => `  - ${d}`),
      "",
      "These break installs on other OSes (e.g. Vercel/Linux vs local/Windows).",
      "Remove them and depend on the cross-platform parent packages instead.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

