import { NS } from "Bitburner";
const symbols = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "e33", "e36", "e39"];

/**
 * Return a formatted representation of the monetary amount using scale symbols (e.g. $6.50M)
**/
export function formatMoney(num: number, maxSignificantFigures: number = 6, maxDecimalPlaces: number = 3): string {
  let numberShort = formatNumberShort(num, maxSignificantFigures, maxDecimalPlaces);
  return num >= 0 ? "$" + numberShort : numberShort.replace("-", "-$");
}

/**
* Return a formatted representation of the monetary amount using scale sympols (e.g. 6.50M)
**/
export function formatNumberShort(num: number, maxSignificantFigures: number = 6, maxDecimalPlaces: number = 3): string {
  for (var i = 0, sign = Math.sign(num), num = Math.abs(num); num >= 1000 && i < symbols.length; i++) num /= 1000;
  return ((sign < 0) ? "-" : "") + num.toFixed(Math.max(0, Math.min(maxDecimalPlaces, maxSignificantFigures - Math.floor(1 + Math.log10(num))))) + symbols[i];
}

export function disableLogs(ns: NS, listOfLogs: string[]): void {
  ['disableLog'].concat(...listOfLogs).forEach(log => ns.disableLog(log));
}

/**
 * Formats a number.
 * @remarks
 *
 * Returns a human readable string representing the number.
 *
 * @param number num - Required. Number to format.
 * @param number decimalPoints - Optional. Number of digits after the decimal point.
 * @returns Returns a string.
 */
export function humanReadableNumbers(num: number, decimalPoints = 3) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });

  if (!item) {
    return "0".padStart(3, " ") + "." + "0".padEnd(decimalPoints, "0") + "  ";
  }

  let value = (num / item.value).toFixed(decimalPoints).toString();
  value = value.replace(rx, "$1");
  let values = value.split(".");
  values[1] = values[1] ?? "0";
  return (
    values[0].padStart(3, " ") +
    "." +
    values[1].padEnd(decimalPoints, "0") +
    " " +
    item.symbol
  );
}

/**
 * Formats a number.
 * @remarks
 *
 * Returns a human readable string representing the number of bytes.
 *
 * @param number bytes - Required. Number to format.
 * @param bool size - Optional. Use 1000 instead of 1024 for calculation
 * @param number dp - Optional. Number of digits after the decimalPoint
 * @returns Returns a string.
 */
export function humanReadableByteSize(
  bytes: number,
  size = false,
  decimalPoints = 1
) {
  const thresh = size ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = size
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** decimalPoints;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(decimalPoints) + " " + units[u];
}
