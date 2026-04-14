import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const templatePath = path.join(
  __dirname,
  "launchd",
  "com.orenivo.prospecting.plist.template",
);

const launchAgentsDir = path.join(os.homedir(), "Library", "LaunchAgents");
const destinationPath = path.join(launchAgentsDir, "com.orenivo.prospecting.plist");
const logsDir = path.join(repoRoot, "reports", "prospecting", "logs");
const stdoutPath = path.join(logsDir, "stdout.log");
const stderrPath = path.join(logsDir, "stderr.log");

await mkdir(launchAgentsDir, { recursive: true });
await mkdir(logsDir, { recursive: true });

const template = await readFile(templatePath, "utf8");
const rendered = template
  .replaceAll("__REPO_ROOT__", xmlEscape(repoRoot))
  .replaceAll("__WORKDIR__", xmlEscape(repoRoot))
  .replaceAll("__STDOUT_PATH__", xmlEscape(stdoutPath))
  .replaceAll("__STDERR_PATH__", xmlEscape(stderrPath));

await writeFile(destinationPath, rendered, "utf8");

console.log(`LaunchAgent written to ${destinationPath}`);
console.log("Next step:");
console.log(`launchctl unload ${destinationPath} 2>/dev/null || true`);
console.log(`launchctl load ${destinationPath}`);
console.log("Then inspect:");
console.log(path.join(repoRoot, "reports", "prospecting", "latest.md"));

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}
