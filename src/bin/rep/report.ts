import { NS } from 'Bitburner';

export async function main(ns: NS) {
  let options = ns.flags([
    ['clear', false],
    ['position', 0],
  ]);

  var tempStatus: number[] = [];
  let cacheName: string = '/cache/factionReport.txt';

  if (ns.fileExists(cacheName, 'home')) {
    var temp = ns.read(cacheName);
    tempStatus = temp.split(',');
  } else {
    for (var i = 0; i < 31; i++) {
      tempStatus[i] = 0;
    }
  }

  if (options['position'] > 0 && options['position'] < 32) {
    if (tempStatus[options['position'] - 1] == 1) {
      tempStatus[options['position'] - 1] = 0;
    } else {
      tempStatus[options['position'] - 1] = 1;
    }
  }
  if (options['clear']) {
    for (var i = 0; i < 31; i++) {
      tempStatus[i] = 0;
    }
  }

  await ns.write(
    'gFactions.txt',
    tempStatus.map((n) => n.toString()),
    'w'
  );

  var doneStatus: string[] = [];
  for (var i = 0; i < 31; i++) {
    if (tempStatus[i] == 1) {
      doneStatus[i] = 'Done';
    } else {
      doneStatus[i] = ' No ';
    }
  }
  ns.tprint(
    '\n',
    '┌──────┬────┬────────────────────────┐\n',
    '| Done | ## | Faction Name:          | Requirements:\n',
    '├──────┼────┤            Early-game: |\n',
    '| ',
    doneStatus[0],
    ' | 01 | CyberSec               | Hack CSEC\n',
    '| ',
    doneStatus[1],
    ' | 02 | Tian Di Hui            | $1m, Hacking 50, Be in Chongquin, New Tokyo, or Ishima\n',
    '| ',
    doneStatus[2],
    ' | 03 | Netburners             | Hacking 80, Total Hacknet levels 100, RAM 8, Cores 4\n',
    '├──────┼────┤                  City: |\n',
    '| ',
    doneStatus[3],
    ' | 04 | Sector-12              | $15m, Be in Sector-12\n',
    '| ',
    doneStatus[4],
    ' | 05 | Chongquin              | $20m, Be in Chongquin, Not in faction Sector-12, Aevum, or Volhaven\n',
    '| ',
    doneStatus[5],
    ' | 06 | New Tokyo              | $20m, Be in New Tokyo, Not in faction Sector-12, Aevum, or Volhaven\n',
    '| ',
    doneStatus[6],
    ' | 07 | Ishima                 | $30m, Be in Ishima,    Not in faction Sector-12, Aevum, or Volhaven\n',
    '| ',
    doneStatus[7],
    ' | 08 | Aevum                  | $40m, Be in Aevum\n',
    '| ',
    doneStatus[8],
    ' | 09 | Volhaven               | $50m, Be in Volhaven,  Not in any other city faction\n',
    '├──────┼────┤                Hacker: |\n',
    '| ',
    doneStatus[9],
    ' | 10 | NiteSec                | Hack avmnite-02h, Home RAM at least 32\n',
    '| ',
    doneStatus[10],
    ' | 11 | The Black Hand         | Hack I.I.I.I, Home RAM of 64 GB\n',
    '| ',
    doneStatus[11],
    ' | 12 | BitRunners             | Hack run4theh111z, Home RAM of 128 GB\n',
    '├──────┼────┤      Megacorporations: |\n',
    '| ',
    doneStatus[12],
    ' | 13 | MegaCorp               | Work for MegaCorp, 200k reputation\n',
    '| ',
    doneStatus[13],
    ' | 14 | Blade Industries       | Work for Blade Industries, 200k reputation\n',
    '| ',
    doneStatus[14],
    ' | 15 | Four Sigma             | Work for Four Sigma, 200k reputation\n',
    '| ',
    doneStatus[15],
    ' | 16 | KuaiGong International | Work for KuaiGong International, 200k reputation\n',
    '| ',
    doneStatus[16],
    ' | 17 | NWO                    | Work for NWO, 200k reputation\n',
    '| ',
    doneStatus[17],
    ' | 18 | OmniTek Incorporated   | Work for OmniTek Incorporated, 200k reputation\n',
    '| ',
    doneStatus[18],
    ' | 19 | ECorp                  | Work for ECorp, 200k reputation\n',
    '| ',
    doneStatus[19],
    ' | 20 | Bachman & Associates   | Work for Backman & Associates, 200k reputation\n',
    '| ',
    doneStatus[20],
    ' | 21 | Clarke Incorporated    | Work for Clarke Incorporated, 200k reputation\n',
    '| ',
    doneStatus[21],
    ' | 22 | Fulcrum Secret Tech... | Hack fulcrumassets, Work for Fulcrum Technologies, 200k reputation\n',
    '├──────┼────┤              Criminal: |\n',
    '| ',
    doneStatus[22],
    ' | 23 | Slum Snakes            | $1m, All combat stats 30, -9 karma\n',
    '| ',
    doneStatus[23],
    ' | 24 | Tetrads                | Be in Chongquin, New Tokyo, or Ishima, All combat stats 75, -18 karma\n',
    '| ',
    doneStatus[24],
    ' | 25 | Silhouette             | $15m, CTO, CFO, or CEO at any company, -22 karma\n',
    '| ',
    doneStatus[25],
    ' | 26 | Speakers for the Dead  | Hacking 100, All combat stats 300, 30 people killed, -45 karma, NOT working for CIA or NSA\n',
    '| ',
    doneStatus[26],
    ' | 27 | The Dark Army          | Hacking 300, All combat stats 300, Be in Chongquin, 5 people killed, -45 karma, NOT working for CIA or NSA\n',
    '| ',
    doneStatus[27],
    ' | 28 | The Syndicate          | $10m, Hacking 200, All combat stats 200, Be in Aevum or Sector-12, -90 karma, NOT working for CIA or NSA\n',
    '├──────┼────┤               Endgame: |\n',
    '| ',
    doneStatus[28],
    ' | 29 | The Covenant           | $75b, 30 augmentations, Hacking 850, All combat stats 850\n',
    '| ',
    doneStatus[29],
    ' | 30 | Daedalus               | $100b, 30 augmentations, Hacking 2500 or all combat stats 1500\n',
    '| ',
    doneStatus[30],
    ' | 31 | Illuminati             | $150b, 30 augmentations, Hacking 1500, All combat stats 1200\n',
    '└──────┴────┴────────────────────────┘'
  );
  return;
}
