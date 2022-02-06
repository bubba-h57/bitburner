import {NS} from "Bitburner";

export class Logger {
  /** @type {CallableFunction[]} */
  writers: CallableFunction[] = [];

  /** @type {NS} */
  ns: NS;

  /** @param {string} name */
  name = "/log/logger.txt";

  /**
   * @param {NS } ns
   * @param {string} name
   */
  constructor(ns: NS, name: string) {
    this.ns = ns;
    this.name = name;
    this.config();
  }

  config() {
    /**
     * @param {NS } ns
     * @param {string} message
     */
    this.writers.push(async function (ns: { print: (arg0: any) => any; }, message: any, name: any) {
      await ns.print(message);
    });

    /**
     * @param {NS } ns
     * @param {string} message
     */
    this.writers.push(async function (ns: { tprint: (arg0: any) => any; }, message: any, name: any) {
      await ns.tprint(message);
    });

    /**
     * @param {NS } ns
     * @param {string} message
     */
    this.writers.push(async function (ns: { write: (arg0: any, arg1: string, arg2: string) => any; }, message: string, name: any) {
      await ns.write(
        name,
        new Date().toISOString() + "   " + message + "\n",
        "a"
      );
    });
  }

  /**
   *
   * @param {string} message
   */
  async write(message: string) {
    for (let index = 0; index < this.writers.length; index++) {
      await this.writers[index](this.ns, message, this.name);
    }
  }
}
