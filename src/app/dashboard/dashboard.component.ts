import {Component, OnInit} from '@angular/core';
import {PoolsService} from "../pools.service";
import * as Capacity from '../../shared/capacity.es5';
import * as moment from "moment";
import {ApiGatewayService} from "../api-gateway.service";
import * as coinUtil from '../../shared/coin-util.es5';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  private apiGatewayService = new ApiGatewayService();

  constructor(private poolsService: PoolsService) {}

  async ngOnInit() {
    this.apiGatewayService.hostnames = this.pools.map((pool: any) => {
      pool.hostname = pool.url.replace('https://', '');

      return pool.hostname;
    });
    this.apiGatewayService.init();
  }

  get pools() {
    return this.poolsService.pools;
  }

  getMinersOfPool(pool) {
    const poolStatsSubject = this.apiGatewayService.getPoolStatsSubject(pool.hostname);
    if (!poolStatsSubject) {
      return 0;
    }

    return poolStatsSubject.getValue().minerCount;
  }

  getMachinesOfPool(pool) {
    const poolStatsSubject = this.apiGatewayService.getPoolStatsSubject(pool.hostname);
    if (!poolStatsSubject) {
      return 0;
    }

    const miners = poolStatsSubject.getValue().miners || [];

    return miners.reduce((acc, miner) => {
      return acc + miner.machines.length;
    }, 0);
  }

  getCapacityOfPool(pool) {
    const poolStatsSubject = this.apiGatewayService.getPoolStatsSubject(pool.hostname);
    if (!poolStatsSubject) {
      return 0;
    }

    return this.getFormattedCapacityFromGiB(poolStatsSubject.getValue().totalCapacity || 0);
  }

  getECOfPool(pool) {
    const poolStatsSubject = this.apiGatewayService.getPoolStatsSubject(pool.hostname);
    if (!poolStatsSubject) {
      return 0;
    }

    return this.getFormattedCapacityFromTiB(poolStatsSubject.getValue().ec || 0);
  }

  getRateOfPool(pool) {
    const poolStatsSubject = this.apiGatewayService.getPoolStatsSubject(pool.hostname);
    if (!poolStatsSubject) {
      return 0;
    }

    return (poolStatsSubject.getValue().rate || 0);
  }

  getDailyRewardOfPool(pool) {
    const poolStatsSubject = this.apiGatewayService.getPoolStatsSubject(pool.hostname);
    if (!poolStatsSubject) {
      return 0;
    }

    return (poolStatsSubject.getValue().dailyRewardPerPiB || 0);
  }

  getWonRoundsPerDayOfPool(pool) {
    const poolStatsSubject = this.apiGatewayService.getPoolStatsSubject(pool.hostname);
    if (!poolStatsSubject) {
      return 0;
    }

    const roundsWon = poolStatsSubject.getValue().roundsWon || [];

    return roundsWon.filter(round => moment(round.roundStart).isAfter(moment().subtract(1, 'day'))).length;
  }

  getNetDiffOfPool(pool) {
    const roundStatsSubject = this.apiGatewayService.getRoundStatsSubject(pool.hostname);
    if (!roundStatsSubject) {
      return 0;
    }

    const round = roundStatsSubject.getValue().round;
    if (!round) {
      return 0;
    }
    let netDiff = coinUtil.blockZeroBaseTarget(pool.coin) / round.baseTarget;
    netDiff = coinUtil.modifyNetDiff(netDiff, pool.coin);

    return this.getFormattedCapacityFromTiB(netDiff);
  }

  getFormattedCapacityFromGiB(capacityInGiB) {
    return (new Capacity(capacityInGiB)).toString();
  }

  getFormattedCapacityFromTiB(capacityInTiB) {
    return Capacity.fromTiB(capacityInTiB).toString();
  }
}
