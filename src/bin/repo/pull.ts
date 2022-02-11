import type {NS} from "Bitburner";

export async function main(ns: NS) {
    const initRepo = new RepoInit(ns);
    await initRepo.pullScripts();
}

interface RepoSettings {
    baseUrl: string;
    manifestPath: string;
    manifestFile: string;
  }

  const repoSettings: RepoSettings = {
    baseUrl: "http://localhost:9182",
    manifestPath: "/resources/manifest.json",
    manifestFile: "/resources/manifest.json.txt"
  };

  const DownloadFiles = {
    async getfileToHome(ns: NS, source: string, dest: string) {
        ns.tprint(`Downloading ${source} -> ${dest}`);

        if (!(await ns.wget(source, dest, "home"))) {
            ns.tprint(`\tFailed retrieving ${source} -> ${dest}`);
        }
    },
  };


  class RepoInit {
    ns: NS;

    constructor(ns: NS) {
        this.ns = ns;
    }

    async pullScripts() {
        await this.getManifest();
        await this.downloadAllFiles();
    }

    async getManifest() {
        const manifestUrl = `${repoSettings.baseUrl}${repoSettings.manifestPath}`;
        this.ns.tprint(`Getting manifest...`);
        await this.ns.wget(manifestUrl, repoSettings.manifestFile, "home")
    }

    async downloadAllFiles() {
        var content = await this.ns.read(repoSettings.manifestFile);
        const manifest = JSON.parse(content);
        for (let script of manifest) {
            let url = `${repoSettings.baseUrl}${script.sourceFile}`;
            await DownloadFiles.getfileToHome(this.ns, url, script.destFile);
        }
    }
  }
