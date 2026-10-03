import { invoke, isTauri } from "@tauri-apps/api/core";

export enum DesktopOs {
  Mac = "macos",
  Windows = "windows",
  Linux = "linux",
  Unknown = "unknown",
}

let desktopOsPromise: Promise<DesktopOs> | null = null;

function osFromUserAgent(): DesktopOs {
  if (typeof navigator === "undefined") return DesktopOs.Unknown;
  if (/Windows/i.test(navigator.userAgent)) return DesktopOs.Windows;
  if (/Mac/i.test(navigator.userAgent)) return DesktopOs.Mac;
  if (/Linux/i.test(navigator.userAgent)) return DesktopOs.Linux;
  return DesktopOs.Unknown;
}

export async function getDesktopOs() {
  if (!desktopOsPromise) {
    desktopOsPromise = isTauri()
      ? invoke<DesktopOs>("get_desktop_os").catch(osFromUserAgent)
      : Promise.resolve(osFromUserAgent());
  }

  return desktopOsPromise;
}
