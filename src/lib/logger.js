export class Logger {
  /** @type {callable[]} */
  writers = [];

  /** @type {import("..").NS} */
  ns;

  /** @param {string} name */
  name = "/log/logger.txt";

  /**
   * @param {import("..").NS } ns
   * @param {string} name
   */
  constructor(ns, name) {
    this.ns = ns;
    this.name = name;
    this.config();
  }

  config() {
    /**
     * @param {import("..").NS } ns
     * @param {string} message
     */
    this.writers.push(async function (ns, message, name) {
      await ns.print(message);
    });

    /**
     * @param {import("..").NS } ns
     * @param {string} message
     */
    this.writers.push(async function (ns, message, name) {
      await ns.tprint(message);
    });

    /**
     * @param {import("..").NS } ns
     * @param {string} message
     */
    this.writers.push(async function (ns, message, name) {
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
  async write(message) {
    for (let index = 0; index < this.writers.length; index++) {
      await this.writers[index](this.ns, message, this.name);
    }
  }
}
