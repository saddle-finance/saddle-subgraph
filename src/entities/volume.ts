import {
  DailyVolume,
  HourlyVolume,
  Swap,
  WeeklyVolume,
} from "../../generated/schema"

import { BigInt } from "@graphprotocol/graph-ts"
import { decimal } from "@protofire/subgraph-toolkit"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function getHourlyTradeVolume(
  swap: Swap,
  timestamp: BigInt,
): HourlyVolume {
  let interval = BigInt.fromI32(60 * 60)
  let hour = timestamp.div(interval).times(interval)
  let id = swap.id + "-hour-" + hour.toString()

  let volume = HourlyVolume.load(id)

  if (volume == null) {
    volume = new HourlyVolume(id)
    volume.swap = swap.id
    volume.timestamp = hour
    volume.volume = decimal.ZERO
  }

  return volume!
}

export function getDailyTradeVolume(
  swap: Swap,
  timestamp: BigInt,
): DailyVolume {
  let interval = BigInt.fromI32(60 * 60 * 24)
  let day = timestamp.div(interval).times(interval)
  let id = swap.id + "-day-" + day.toString()

  let volume = DailyVolume.load(id)

  if (volume == null) {
    volume = new DailyVolume(id)
    volume.swap = swap.id
    volume.timestamp = day
    volume.volume = decimal.ZERO
  }

  return volume!
}

export function getWeeklyTradeVolume(
  swap: Swap,
  timestamp: BigInt,
): WeeklyVolume {
  let interval = BigInt.fromI32(60 * 60 * 24 * 7)
  let week = timestamp.div(interval).times(interval)
  let id = swap.id + "-week-" + week.toString()

  let volume = WeeklyVolume.load(id)

  if (volume == null) {
    volume = new WeeklyVolume(id)
    volume.swap = swap.id
    volume.timestamp = week
    volume.volume = decimal.ZERO
  }

  return volume!
}
