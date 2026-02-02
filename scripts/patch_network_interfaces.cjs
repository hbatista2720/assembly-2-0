const os = require("os");

try {
  os.networkInterfaces = () => ({});
} catch (error) {
  // No-op: fallback for restricted environments.
}
