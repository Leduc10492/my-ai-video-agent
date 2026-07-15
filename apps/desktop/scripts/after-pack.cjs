const { execFileSync } = require("node:child_process");
const { renameSync, rmSync } = require("node:fs");
const { join } = require("node:path");

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;
  const appPath = join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  const plist = join(appPath, "Contents", "Info.plist");
  const plistBuddy = "/usr/libexec/PlistBuddy";
  const unusedPrivacyKeys = [
    "NSAudioCaptureUsageDescription",
    "NSBluetoothAlwaysUsageDescription",
    "NSBluetoothPeripheralUsageDescription",
    "NSCameraUsageDescription",
    "NSMicrophoneUsageDescription"
  ];
  for (const key of unusedPrivacyKeys) {
    try {
      execFileSync(plistBuddy, ["-c", `Delete :${key}`, plist], { stdio: "ignore" });
    } catch {
      // A missing optional key is already the desired state.
    }
  }
  for (const command of [
    "Delete :NSAppTransportSecurity:NSAllowsLocalNetworking",
    "Delete :NSAppTransportSecurity:NSExceptionDomains"
  ]) {
    try {
      execFileSync(plistBuddy, ["-c", command, plist], { stdio: "ignore" });
    } catch {
      // A missing development-only transport exception is already the desired state.
    }
  }
  execFileSync(plistBuddy, ["-c", "Set :NSAppTransportSecurity:NSAllowsArbitraryLoads false", plist]);
  const cleanAppPath = `${appPath}.clean-${process.pid}`;
  rmSync(cleanAppPath, { recursive: true, force: true });
  execFileSync("/usr/bin/ditto", ["--norsrc", "--noextattr", appPath, cleanAppPath]);
  rmSync(appPath, { recursive: true, force: true });
  renameSync(cleanAppPath, appPath);
};
