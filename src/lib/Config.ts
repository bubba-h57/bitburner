import { gyms } from '/etc/Gyms';
import { factions } from '/etc/Factions';
import { mafia } from '/etc/Mafia';
import { crime } from '/etc/Crime';
import { purchased_servers } from '/etc/PurchasedServers';
import { hack_net } from '/etc/HackNet';
import { universities } from '/etc/Universities';

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
    hack_net: hack_net,
    universities: universities,
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
