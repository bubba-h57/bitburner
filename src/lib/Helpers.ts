import { NS, ProcessInfo, SourceFileLvl } from 'Bitburner';

export function formatMoney(num: number, maxSignificantFigures: number = 6, maxDecimalPlaces: number = 3): string {
  let numberShort: string = formatNumberShort(num, maxSignificantFigures, maxDecimalPlaces);
  return num >= 0 ? '$' + numberShort : numberShort.replace('-', '-$');
}

const symbols: string[] = ['', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S', 'o', 'n', 'e33', 'e36', 'e39'];

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

/**
 * Return a number formatted with the specified number of significatnt figures or decimal places, whichever is more limiting.
 **/
export function formatNumber(
  num: number,
  minSignificantFigures: number | undefined = 3,
  minDecimalPlaces: number | undefined = 1
) {
  return num == 0.0
    ? num
    : num.toFixed(Math.max(minDecimalPlaces, Math.max(0, minSignificantFigures - Math.ceil(Math.log10(num)))));
}

/** Formats some RAM amount as a round number of GB with thousands separators e.g. `1,028 GB` */
export function formatRam(num: number) {
  return `${Math.round(num).toLocaleString()} GB`;
}

/** Return a datatime in ISO format */
export function formatDateTime(datetime: { toISOString: () => any }) {
  return datetime.toISOString();
}

/** Format a duration (in milliseconds) as e.g. '1h 21m 6s' for big durations or e.g '12.5s' / '23ms' for small durations */
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

/** Generate a hashCode for a string that is pretty unique most of the time */
export function hashCode(s: string) {
  return s.split('').reduce(function (a: number, b: string) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
}

/** @param {NS} ns **/
export function disableLogs(ns: NS, listOfLogs: string[]) {
  ['disableLog'].concat(...listOfLogs).forEach((log) => checkNsInstance(ns, '"disableLogs"').disableLog(log));
}

/** Joins all arguments as components in a path, e.g. pathJoin("foo", "bar", "/baz") = "foo/bar/baz" **/
export function pathJoin(...args: string[]) {
  return args
    .filter((s) => !!s)
    .join('/')
    .replace(/\/\/+/g, '/');
}

/** Gets the path for the given local file, taking into account optional subfolder relocation via git-pull.js **/
export function getFilePath(file: string) {
  const subfolder = ''; // git-pull.js optionally modifies this when downloading
  return pathJoin(subfolder, file);
}

// FUNCTIONS THAT PROVIDE ALTERNATIVE IMPLEMENTATIONS TO EXPENSIVE NS FUNCTIONS
// VARIATIONS ON NS.RUN

/** @param {NS} ns
 *  Use where a function is required to run a script and you have already referenced ns.run in your script **/
export function getFnRunViaNsRun(ns: NS) {
  return checkNsInstance(ns, '"getFnRunViaNsRun"').run;
}

/** @param {NS} ns
 *  Use where a function is required to run a script and you have already referenced ns.exec in your script **/
export function getFnRunViaNsExec(ns: NS, host = 'home') {
  checkNsInstance(ns, '"getFnRunViaNsExec"');
  return function (scriptPath: any, ...args: any) {
    return ns.exec(scriptPath, host, ...args);
  };
}
// VARIATIONS ON NS.ISRUNNING

/** @param {NS} ns
 *  Use where a function is required to run a script and you have already referenced ns.run in your script  */
export function getFnIsAliveViaNsIsRunning(ns: NS) {
  return checkNsInstance(ns, '"getFnIsAliveViaNsIsRunning"').isRunning;
}

/** @param {NS} ns
 *  Use where a function is required to run a script and you have already referenced ns.exec in your script  */
export function getFnIsAliveViaNsPs(ns: NS) {
  checkNsInstance(ns, '"getFnIsAliveViaNsPs"');
  return function (pid: number, host: string) {
    return ns.ps(host).some((process: ProcessInfo) => process.pid === pid);
  };
}

/**
 * Retrieve the result of an ns command by executing it in a temporary .js script, writing the result to a file, then shuting it down
 * Importing incurs a maximum of 1.1 GB RAM (0 GB for ns.read, 1 GB for ns.run, 0.1 GB for ns.isRunning).
 * Has the capacity to retry if there is a failure (e.g. due to lack of RAM available). Not recommended for performance-critical code.
 **/
export async function getNsDataThroughFile(
  ns: NS,
  command: string,
  fName: string,
  verbose = false,
  maxRetries = 5,
  retryDelayMs = 50
) {
  checkNsInstance(ns, '"getNsDataThroughFile"');
  if (!verbose) disableLogs(ns, ['run', 'isRunning']);
  return await getNsDataThroughFile_Custom(ns, ns.run, ns.isRunning, command, fName, verbose, maxRetries, retryDelayMs);
}

/**
 * An advanced version of getNsDataThroughFile that lets you pass your own "fnRun" and "fnIsAlive" implementations to reduce RAM requirements
 * Importing incurs no RAM (now that ns.read is free) plus whatever fnRun / fnIsAlive you provide it
 * Has the capacity to retry if there is a failure (e.g. due to lack of RAM available). Not recommended for performance-critical code.
 **/
export async function getNsDataThroughFile_Custom(
  ns: NS,
  fnRun: Function,
  fnIsAlive: Function,
  command: string,
  fName: string,
  verbose = false,
  maxRetries = 5,
  retryDelayMs = 50
) {
  checkNsInstance(ns, '"getNsDataThroughFile_Custom"');
  if (!verbose) disableLogs(ns, ['read']);
  const commandHash = hashCode(command);
  fName = fName || `/Temp/${commandHash}-data.txt`;
  const fNameCommand = (fName || `/Temp/${commandHash}-command`) + '.js';
  // Prepare a command that will write out a new file containing the results of the command
  // unless it already exists with the same contents (saves time/ram to check first)
  // If an error occurs, it will write an empty file to avoid old results being misread.
  const commandToFile = `let result = ""; try { result = JSON.stringify(${command}); } catch { }
      if (ns.read("${fName}") != result) await ns.write("${fName}", result, 'w')`;
  // Run the command with auto-retries if it fails
  const pid = await runCommand_Custom(ns, fnRun, commandToFile, fNameCommand, false, maxRetries, retryDelayMs);
  // Wait for the process to complete
  await waitForProcessToComplete_Custom(ns, fnIsAlive, pid, verbose);
  if (verbose) ns.print(`Process ${pid} is done. Reading the contents of ${fName}...`);
  // Read the file, with auto-retries if it fails
  const fileData = await autoRetry(
    ns,
    () => ns.read(fName),
    (f: string | undefined) => f !== undefined && f !== '',
    () => `ns.read('${fName}') somehow returned undefined or an empty string`,
    maxRetries,
    retryDelayMs,
    undefined,
    verbose
  );
  if (verbose) ns.print(`Read the following data for command ${command}:\n${fileData}`);
  return JSON.parse(fileData); // Deserialize it back into an object/array and return
}

/** Evaluate an arbitrary ns command by writing it to a new script and then running or executing it.
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {string} command - The ns command that should be invoked to get the desired data (e.g. "ns.getServer('home')" )
 * @param {string=} fileName - (default "/Temp/{commandhash}-data.txt") The name of the file to which data will be written to disk by a temporary process
 * @param {bool=} verbose - (default false) If set to true, the evaluation result of the command is printed to the terminal
 * @param {...args} args - args to be passed in as arguments to command being run as a new script.
 */
export async function runCommand(
  ns: NS,
  command: string,
  fileName: string,
  verbose = false,
  maxRetries = 5,
  retryDelayMs = 50,
  ...args: undefined[]
) {
  checkNsInstance(ns, '"runCommand"');
  if (!verbose) disableLogs(ns, ['run', 'sleep']);
  return await runCommand_Custom(ns, ns.run, command, fileName, verbose, maxRetries, retryDelayMs, ...args);
}

/**
 * An advanced version of runCommand that lets you pass your own "isAlive" test to reduce RAM requirements (e.g. to avoid referencing ns.isRunning)
 * Importing incurs 0 GB RAM (assuming fnRun, fnWrite are implemented using another ns function you already reference elsewhere like ns.exec)
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {function} fnRun - A single-argument function used to start the new sript, e.g. `ns.run` or `(f,...args) => ns.exec(f, "home", ...args)`
 **/
export async function runCommand_Custom(
  ns: NS,
  fnRun: Function,
  command: string,
  fileName: string,
  verbose = false,
  maxRetries = 5,
  retryDelayMs = 50,
  ...args: undefined[]
) {
  checkNsInstance(ns, '"runCommand_Custom"');
  let script: string =
    `import { formatMoney, formatNumberShort, formatDuration, parseShortNumber, scanAllServers } fr` +
    `om '/lib/Helpers.js'\n` +
    `export async function main(ns) { try { ` +
    (verbose ? `let output = ${command}; ns.tprint(output)` : command) +
    `; } catch(err) { ns.tprint(String(err)); throw(err); } }`;
  fileName = fileName || `/Temp/${hashCode(command)}-command.js`;
  // To improve performance and save on garbage collection, we can skip writing this exact same script was previously written (common for repeatedly-queried data)
  if (ns.read(fileName) != script) await ns.write(fileName, [script], 'w');
  return await autoRetry(
    ns,
    () => fnRun(fileName, ...args),
    (temp_pid: number) => temp_pid !== 0,
    () =>
      `Run command returned no pid. Destination: ${fileName} Command: ${command}\nEnsure you have sufficient free RAM to run this temporary script.`,
    maxRetries,
    retryDelayMs,
    undefined,
    verbose
  );
}

/**
 * Wait for a process id to complete running
 * Importing incurs a maximum of 0.1 GB RAM (for ns.isRunning)
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {int} pid - The process id to monitor
 * @param {bool=} verbose - (default false) If set to true, pid and result of command are logged.
 **/
export async function waitForProcessToComplete(ns: NS, pid: any, verbose: any) {
  checkNsInstance(ns, '"waitForProcessToComplete"');
  if (!verbose) disableLogs(ns, ['isRunning']);
  return await waitForProcessToComplete_Custom(ns, ns.isRunning, pid, verbose);
}
/**
 * An advanced version of waitForProcessToComplete that lets you pass your own "isAlive" test to reduce RAM requirements (e.g. to avoid referencing ns.isRunning)
 * Importing incurs 0 GB RAM (assuming fnIsAlive is implemented using another ns function you already reference elsewhere like ns.ps)
 * @param {NS} ns - The nestcript instance passed to your script's main entry point
 * @param {function} fnIsAlive - A single-argument function used to start the new sript, e.g. `ns.isRunning` or `pid => ns.ps("home").some(process => process.pid === pid)`
 **/
export async function waitForProcessToComplete_Custom(ns: NS, fnIsAlive: Function, pid: any, verbose: boolean) {
  checkNsInstance(ns, '"waitForProcessToComplete_Custom"');
  if (!verbose) disableLogs(ns, ['sleep']);
  // Wait for the PID to stop running (cheaper than e.g. deleting (rm) a possibly pre-existing file and waiting for it to be recreated)
  for (var retries = 0; retries < 1000; retries++) {
    if (!fnIsAlive(pid)) break; // Script is done running
    if (verbose && retries % 100 === 0) ns.print(`Waiting for pid ${pid} to complete... (${retries})`);
    await ns.sleep(10);
  }
  // Make sure that the process has shut down and we haven't just stopped retrying
  if (fnIsAlive(pid)) {
    let errorMessage = `run-command pid ${pid} is running much longer than expected. Max retries exceeded.`;
    ns.print(errorMessage);
    throw errorMessage;
  }
}

/** Helper to retry something that failed temporarily (can happen when e.g. we temporarily don't have enough RAM to run)
 * @param {NS} ns - The nestcript instance passed to your script's main entry point */
export async function autoRetry(
  ns: NS,
  fnFunctionThatMayFail: Function,
  fnSuccessCondition: Function,
  errorContext: string | Function = 'Success condition not met',
  maxRetries = 5,
  initialRetryDelayMs = 50,
  backoffRate = 3,
  verbose = false
) {
  checkNsInstance(ns, '"autoRetry"');
  let retryDelayMs = initialRetryDelayMs;
  while (maxRetries-- > 0) {
    try {
      const result = await fnFunctionThatMayFail();
      if (!fnSuccessCondition(result)) throw typeof errorContext === 'string' ? errorContext : errorContext();
      return result;
    } catch (error) {
      const fatal = maxRetries === 0;
      const errorLog = `${fatal ? 'FAIL' : 'WARN'}: (${maxRetries} retries remaining): ${String(error)}`;
      log(ns, errorLog, fatal, !verbose ? undefined : fatal ? 'error' : 'warning');
      if (fatal) throw error;
      await ns.sleep(retryDelayMs);
      retryDelayMs *= backoffRate;
    }
  }
}

/** Helper to log a message, and optionally also tprint it and toast it
 * @param {NS} ns - The nestcript instance passed to your script's main entry point */
export function log(ns: NS, message = '', alsoPrintToTerminal = false, toastStyle = '', maxToastLength = 100) {
  checkNsInstance(ns, '"log"');
  ns.print(message);
  if (alsoPrintToTerminal) ns.tprint(message);
  if (toastStyle)
    ns.toast(message.length <= maxToastLength ? message : message.substring(0, maxToastLength - 3) + '...', toastStyle);
  return message;
}

/** Helper to get a list of all hostnames on the network
 * @param {NS} ns - The nestcript instance passed to your script's main entry point */
export function scanAllServers(ns: NS) {
  checkNsInstance(ns, '"scanAllServers"');
  let discoveredHosts: string[] = []; // Hosts (a.k.a. servers) we have scanned
  let hostsToScan: string[] = ['home']; // Hosts we know about, but have no yet scanned
  let infiniteLoopProtection = 9999; // In case you mess with this code, this should save you from getting stuck
  while (hostsToScan.length > 0 && infiniteLoopProtection-- > 0) {
    // Loop until the list of hosts to scan is empty
    let hostName: string = hostsToScan.pop() ?? ''; // Get the next host to be scanned
    for (const connectedHost of ns.scan(hostName)) // "scan" (list all hosts connected to this one)
      if (!discoveredHosts.includes(connectedHost))
        // If we haven't already scanned this host
        hostsToScan.push(connectedHost); // Add it to the queue of hosts to be scanned
    discoveredHosts.push(hostName); // Mark this host as "scanned"
  }
  return discoveredHosts; // The list of scanned hosts should now be the set of all hosts in the game!
}

/** @param {NS} ns
 * Get a dictionary of active source files, taking into account the current active bitnode as well. **/
export async function getActiveSourceFiles(ns: NS) {
  return await getActiveSourceFiles_Custom(ns, getNsDataThroughFile);
}

/** @param {NS} ns
 * getActiveSourceFiles Helper that allows the user to pass in their chosen implementation of getNsDataThroughFile to minimize RAM usage **/
export async function getActiveSourceFiles_Custom(ns: NS, fnGetNsDataThroughFile: Function) {
  checkNsInstance(ns, '"getActiveSourceFiles"');
  let tempFile = '/Temp/owned-source-files.txt';
  // Find out what source files the user has unlocked
  var dictSourceFiles: object = {};
  try {
    dictSourceFiles = await fnGetNsDataThroughFile(
      ns,
      `Object.fromEntries(ns.getOwnedSourceFiles().map(sf => [sf.n, sf.lvl]))`,
      tempFile
    );
  } catch {
    dictSourceFiles = JSON.parse(ns.read(tempFile)) ?? {};
  }

  if (!dictSourceFiles) {
    dictSourceFiles = JSON.parse(ns.read(tempFile)) ?? {};
  }

  ns.tprint(dictSourceFiles);
  let currentBn = await fnGetNsDataThroughFile(ns, 'ns.getPlayer()', '/Temp/player-info.txt').bitNodeN;
  dictSourceFiles[currentBn] = 3;
  return dictSourceFiles;
}

/** @param {NS} ns
 * Return bitnode multiplers, or null if they cannot be accessed. **/
export async function tryGetBitNodeMultipliers(ns: NS) {
  return await tryGetBitNodeMultipliers_Custom(ns, getNsDataThroughFile);
}

/** @param {NS} ns
 * tryGetBitNodeMultipliers Helper that allows the user to pass in their chosen implementation of getNsDataThroughFile to minimize RAM usage **/
export async function tryGetBitNodeMultipliers_Custom(
  ns: NS,
  fnGetNsDataThroughFile: {
    (ns: NS, command: any, fName: any, verbose?: boolean, maxRetries?: number, retryDelayMs?: number): Promise<any>;
    (arg0: any, arg1: string, arg2: string): any;
  }
) {
  checkNsInstance(ns, '"tryGetBitNodeMultipliers"');
  let canGetBitNodeMultipliers = false;
  try {
    canGetBitNodeMultipliers = 5 in (await getActiveSourceFiles_Custom(ns, fnGetNsDataThroughFile));
  } catch {}
  if (!canGetBitNodeMultipliers) return null;
  try {
    return await fnGetNsDataThroughFile(ns, 'ns.getBitNodeMultipliers()', '/Temp/bitnode-multipliers.txt');
  } catch {}
  return null;
}

/** @param {NS} ns
 * Returns a helpful error message if we forgot to pass the ns instance to a function */
export function checkNsInstance(ns: NS, fnName = 'this function'): NS {
  if (!ns.print) throw `The first argument to ${fnName} should be a 'ns' instance.`;
  return ns;
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
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });

  if (!item) {
    return '0'.padStart(3, ' ') + '.' + '0'.padEnd(decimalPoints, '0') + '  ';
  }

  let value = (num / item.value).toFixed(decimalPoints).toString();
  value = value.replace(rx, '$1');
  let values = value.split('.');
  values[1] = values[1] ?? '0';
  return values[0].padStart(3, ' ') + '.' + values[1].padEnd(decimalPoints, '0') + ' ' + item.symbol;
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

export function compare(left: string, right: string, noCase: boolean = true): boolean {
  return noCase ? left.toLowerCase() === right.toLowerCase() : left === right;
}
