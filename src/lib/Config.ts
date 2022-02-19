import { gyms } from '/etc/Gyms.js';
import { factions } from '/etc/Factions.js';
import { mafia } from '/etc/Mafia.js';
import { crime } from '/etc/Crime.js';
import { purchased_servers } from '/etc/PurchasedServers.js';

export function config(key: string, alternative: any = null): any | null {
  return Config.get(key, alternative);
}

class Config {
  static configs = {
    gyms: gyms,
    factions: factions,
    mafia: mafia,
    crime: crime,
    purchased_servers: purchased_servers,
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
