import { BigInt, ethereum } from "@graphprotocol/graph-ts"

import { SystemInfo } from "../../generated/schema"

export function getSystemInfo(
  block: ethereum.Block,
  tx: ethereum.Transaction,
): SystemInfo {
  let state = SystemInfo.load("current")

  if (state == null) {
    state = new SystemInfo("current")

    state.exchangeCount = BigInt.fromI32(0)
    state.swapCount = BigInt.fromI32(0)
    state.tokenCount = BigInt.fromI32(0)
  }

  state.updated = block.timestamp
  state.updatedAtBlock = block.number
  state.updatedAtTransaction = tx.hash

  return state as SystemInfo
}
