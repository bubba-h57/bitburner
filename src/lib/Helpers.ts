import { NS } from 'Bitburner';

const symbols: string[] = ['', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S', 'o', 'n', 'e33', 'e36', 'e39'];

/**
 * Formats a number.
 * @remarks
 *
 * Returns a human readable string representing the number.
 *
 * @param {number} num - Number to format.
 * @param {number} decimalPoints - Number of digits after the decimal point.
 * @returns Returns a string.
 */
export function humanReadable(num: number, maxDecimalPlaces: number = 3, maxSignificantFigures: number = 6) {
  return formatNumberShort(num, maxSignificantFigures, maxDecimalPlaces);
}

/**
 * Formats a number.
 * @remarks
 *
 * Returns a human readable string representing the number of bytes.
 *
 * @param {number} bytes - Required. Number to format.
 * @param {boolean} size - Optional. Use 1000 instead of 1024 for calculation
 * @param {number} dp - Optional. Number of digits after the decimalPoint
 * @returns Returns a string.
 */
export function humanReadableByteSize(bytes: number, size = false, decimalPoints = 1) {
  const thresh = size ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = size
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** decimalPoints;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(decimalPoints) + ' ' + units[u];
}

/**
 *
 * @param {string}  left    The left string
 * @param {string}  right   The right string
 * @param {boolean} noCase  Defaults to {true} case-insensitive, pass in false for case sensitive.
 * @returns {boolean}
 */
export function compare(left: string, right: string, noCase: boolean = true): boolean {
  return noCase ? left.toLowerCase() === right.toLowerCase() : left === right;
}

/**
 * Provide a raw number, get a dollar formated number back.
 * @param num
 * @param maxSignificantFigures
 * @param maxDecimalPlaces
 * @returns {string}
 */
export function formatMoney(num: number, maxSignificantFigures: number = 6, maxDecimalPlaces: number = 3): string {
  let numberShort: string = formatNumberShort(num, maxSignificantFigures, maxDecimalPlaces);
  return num >= 0 ? '$' + numberShort : numberShort.replace('-', '-$');
}

/**
 * Provide a raw number, and get it clean up before you get it back.
 *
 * @param num The number to work on
 * @param maxSignificantFigures How many significant digits you want.
 * @param maxDecimalPlaces How many decimal places you want.
 * @returns
 */
export function formatNumberShort(
  num: number,
  maxSignificantFigures: number = 6,
  maxDecimalPlaces: number = 3
): string {
  for (var i = 0, sign = Math.sign(num), num = Math.abs(num); num >= 1000 && i < symbols.length; i++) {
    num /= 1000;
  }
  return (
    (sign < 0 ? '-' : '') +
    num.toFixed(Math.max(0, Math.min(maxDecimalPlaces, maxSignificantFigures - Math.floor(1 + Math.log10(num))))) +
    symbols[i]
  );
}

/**
 * Reverse a short number from formatNumberShort().
 *
 * @param text The short number
 * @returns
 */
export function parseShortNumber(text: string = '0'): number {
  let parsed = Number(text);
  if (!isNaN(parsed)) {
    return parsed;
  }
  for (const sym of symbols.slice(1))
    if (text.toLowerCase().endsWith(sym))
      return Number.parseFloat(text.slice(0, text.length - sym.length)) * Math.pow(10, 3 * symbols.indexOf(sym));
  return Number.NaN;
}

/** Formats some RAM amount as a round number of GB with thousands separators e.g. `1,028 GB` */
export function formatRam(num: number) {
  return `${Math.round(num).toLocaleString()} GB`;
}

/** Return a datatime in ISO format */
export function formatDateTime(datetime: { toISOString: () => any }) {
  return datetime.toISOString();
}

/** Format a duration (in milliseconds)  */
export function formatDuration(duration: number) {
  if (duration < 1000) return `${duration.toFixed(0)}ms`;
  const portions: string[] = [];
  const msInHour = 1000 * 60 * 60;
  const hours: number = Math.trunc(duration / msInHour);
  if (hours > 0) {
    portions.push(hours.toString() + 'h');
    duration -= hours * msInHour;
  }
  const msInMinute = 1000 * 60;
  const minutes = Math.trunc(duration / msInMinute);
  if (minutes > 0) {
    portions.push(minutes + 'm');
    duration -= minutes * msInMinute;
  }
  let seconds: number = duration / 1000.0;
  // Include millisecond precision if we're on the order of seconds
  let secondsText: string = hours == 0 && minutes == 0 ? seconds.toPrecision(3) : seconds.toFixed(0);
  if (seconds > 0) {
    portions.push(secondsText + 's');
    duration -= minutes * 1000;
  }
  return portions.join(' ');
}

export function getServerNames(ns: NS): string[] {
  return getServers(ns).map((s) => {
    return s.hostname;
  });
}

export function getServers(ns: NS): iServerPath[] {
  return [...recurseServers()].filter((s) => {
    return s.hostname != 'darkweb';
  });

  /**
   * @generator Traverses the connection tree in pre-order
   * @param fn Function called on each server
   * @param current Starting point default to home
   * @param {string[]} visited Array of already visited servers
   * @param depth The current depth in traversal
   */
  function* recurseServers(
    fn = () => {},
    current = 'home',
    visited: string[] = [],
    depth = 0
  ): IterableIterator<iServerPath> {
    if (!visited.includes(current)) {
      yield { hostname: current, depth: depth, path: [...visited.slice().reverse(), current] };
      let next = ns.scan(current);
      for (let n of next) {
        yield* recurseServers(fn, n, [current, ...visited], depth + 1);
      }
    }
  }
}

interface iServerPath {
  hostname: string;
  depth: number;
  path: string[];
}

const secondsPerYear = 31536000;
const secondsPerDay = 86400;
const secondsPerHour = 3600;
const secondsPerMinute = 60;

export function millisecondsToString(milliseconds) {
  const secs = milliseconds / 1000; // convert to seconds
  var years = Math.floor(secs / secondsPerYear);
  var days = Math.floor((secs % secondsPerYear) / secondsPerDay);
  var hours = Math.floor(((secs % secondsPerYear) % secondsPerDay) / secondsPerHour);
  var minutes = Math.floor((((secs % secondsPerYear) % secondsPerDay) % secondsPerHour) / secondsPerMinute);
  var seconds = (((secs % secondsPerYear) % secondsPerDay) % secondsPerHour) % secondsPerMinute;

  let str = '';
  if (years > 0) {
    str += years + ' years ';
  }
  if (days > 0) {
    str += days + ' days ';
  }
  if (hours > 0) {
    str += hours + ' hours ';
  }
  if (hours > 0) {
    str += hours + ' hours ';
  }
  if (minutes > 0) {
    str += minutes + ' minutes ';
  }
  return str + seconds + ' seconds';
}
