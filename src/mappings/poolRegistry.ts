import {
  AddPool,
  RemovePool,
  UpdatePool,
} from "../../generated/PoolRegistry/PoolRegistry"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"

import { Swap } from "../../generated/schema"
import { getOrCreateSwap } from "../entities/swap"
import { getSystemInfo } from "../entities/system"

export function handleAddPool(event: AddPool): void {
  getOrCreateSwap(event.params.poolAddress, event)
}

export function handleRemovePool(event: RemovePool): void {
  removePool(event.params.poolAddress, event)
}

export function handleUpdatePool(event: UpdatePool): void {
  // TODO event: UpdatePool
}

function removePool(address: Address, event: ethereum.Event): Swap | null {
  let swap = Swap.load(address.toHexString())

  if (swap != null) {
    swap.removedAt = event.block.timestamp
    swap.removedAtBlock = event.block.number
    swap.removedAtTransaction = event.transaction.hash
    swap.save()

    // Count pools
    let state = getSystemInfo(event.block, event.transaction)
    state.swapCount = state.swapCount.plus(BigInt.fromI32(1))
    state.save()

    // TODO: Stop indexing pool events (not yet supported)
  }

  return swap
}
