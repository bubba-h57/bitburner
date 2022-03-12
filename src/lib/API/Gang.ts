import { NS } from 'Bitburner';
import { exec } from '/lib/Helpers';

export class Gang {
  constructor() {}

  public async inGang() {
    return await exec('/opt/gang/bin/inGang');
  }
}
