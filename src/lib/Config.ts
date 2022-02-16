import { config as gyms } from '/etc/Gyms.js';

export function config(key: string, alternative: any = null): any | null {
  return Config.get(key, alternative);
}

class Config {
  static configs = {
    gyms: gyms,
  };

  public static get(key: string, alternative: any = null): any | null {
    let keys: string[] = key.split('.').reverse();
    let result = Config.configs[keys.pop() ?? ''];

    while (result !== undefined && result !== null && keys.length > 0) {
      result = result[keys.pop() ?? ''];
    }
    if (result === undefined) {
      result = alternative;
    }

    return result;
  }
}
