import { GangOtherInfo, NS, } from "Bitburner";
import { Mafia } from "/lib/Mafia.js";
import { formatNumberShort } from "/lib/Helpers.js";

export class Territory {
    protected ns: NS;
    protected mafia: Mafia;
    protected warTickInterval: number = 20000;
    public nextWarTick: number;
    protected currentPower: number;
    protected mostRecentPower!: number;
    protected warTickDetected: boolean = false;
    protected priorEnemyInfo!: GangOtherInfo;
    protected preparedForNextWarTick: boolean = false;
    protected allYourBasesAreBelongToUs: boolean = false;

    constructor(ns: NS, mafia: Mafia) {
        this.ns = ns;
        this.mafia = mafia;
        this.nextWarTick = Date.now() + this.warTickInterval;
        this.currentPower = this.mafia.info().power;
        this.updatePriorEnemyInfo();
    }

    public isNotPreparedForNextWarTick(): boolean {
        return !this.preparedForNextWarTick;
    }
    public isPreparedForNextWarTick(): boolean {
        return this.preparedForNextWarTick;
    }
    protected setNextWarTick(): void {
        this.nextWarTick = Date.now() - this.mafia.updateInterval + this.warTickInterval;
    }

    protected updatePower(): void {
        this.mostRecentPower = this.currentPower;
        this.currentPower = this.mafia.info().power;
    }

    public detectWarTick(): boolean {
        if (this.hasOtherGangPowerChanged()) {
            this.nextWarTick = Date.now() - this.mafia.updateInterval;
            this.warTickDetected = true;
        }
        this.updatePriorEnemyInfo();
        return this.warTickDetected;
    }

    public warTickHasBeenDetected(): boolean {
        return this.warTickDetected;
    }
    public warTickHasNotBeenDetected(): boolean {
        return !this.warTickDetected;
    }
    protected updatePriorEnemyInfo(): void {
        this.priorEnemyInfo = this.ns.gang.getOtherGangInformation();
    }

    protected hasOtherGangPowerChanged(): boolean {
        let gangs: string[] = Object.keys(this.priorEnemyInfo);
        let enemyGangCurrentInfo: GangOtherInfo = this.ns.gang.getOtherGangInformation();
        return gangs.some(gang => enemyGangCurrentInfo[gang].power != this.priorEnemyInfo[gang].power)
    }

    public nextTickMeansWar(): boolean {
        return (Date.now() + this.mafia.updateInterval >= this.nextWarTick);
    }

    public prepareForWar(): void {
        this.mafia.mobsters().forEach(mobster => mobster.setTask("Territory Warfare"));
    }

    public warfare(): boolean {
        /** Short circuit if we own everything. */
        if (this.allYourBasesAreBelongToUs) {
            this.preparedForNextWarTick = false;
            return false;
        }
        /** Detect initial war tick if we haven't yet. */
        if (this.warTickHasNotBeenDetected()) {
            this.detectWarTick();
            this.preparedForNextWarTick = false;
        }

        /** If the next tick is a war tick, prepare for war **/
        if (this.nextTickMeansWar()) {
            this.ns.print(`${new Date().toISOString()} WARN Next Tick means war.`);
            this.prepareForWar();
            this.preparedForNextWarTick = true;
            this.setNextWarTick();
            return true;
        }

        if (this.preparedForNextWarTick && this.meansWar()) {
            this.ns.print(`${new Date().toISOString()} WARN We did a war.`);
            this.didAWar();
            this.preparedForNextWarTick = false;
            return false;
        }
        this.preparedForNextWarTick = false;
        return false;

    }

    protected myPowerChanged(): boolean {
        return this.mafia.info().power != this.mostRecentPower;
    }

    protected meansWar(): boolean {
        return (this.isPreparedForNextWarTick() && this.myPowerChanged()) ||
            (Date.now() > this.nextWarTick + 5 * this.mafia.updateInterval);
    }

    public didAWar(): void {

        if (this.myPowerChanged()) {
            this.ns.print(`${new Date().toISOString()} ERROR: Territory power updated from ${formatNumberShort(this.mostRecentPower)} to ${formatNumberShort(this.mafia.info().power)}.`);
        }
        if (this.isNotPreparedForNextWarTick()) {
            this.ns.print(`${new Date().toISOString()} WARNING: Territory tick happend before we were ready!.`);
        }
        this.updatePower();

    }
}
