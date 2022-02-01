import {
  Address,
  BigInt,
  DataSourceContext,
  dataSource,
  ethereum,
} from "@graphprotocol/graph-ts"

import { Pool } from "../../generated/PoolRegistry/Pool"
import { Pool as PoolDataSource } from "../../generated/templates"
import { PoolRegistry } from "../../generated/PoolRegistry/PoolRegistry"
import { Swap } from "../../generated/schema"
import { getSystemInfo } from "./system"
import { saveCoins } from "./coins"

export function getOrCreateSwap(address: Address, event: ethereum.Event): Swap {
  let swap = Swap.load(address.toHexString())

  if (swap == null) {
    let poolRegistryContract = PoolRegistry.bind(dataSource.address())
    let poolContract = Pool.bind(address)

    // Addresses etc
    swap = new Swap(address.toHexString())
    swap.address = poolContract._address
    swap.registryAddress = poolRegistryContract._address

    saveCoins(swap, event)

    let poolData = poolRegistryContract.try_getPoolData(address)
    if (!poolData.reverted) {
      swap.name = poolData.value.poolName.toString()
      // TODO replace with registry fn
      swap.isMeta = poolData.value.metaSwapDepositAddress != Address.zero()
      swap.lpToken = poolData.value.lpToken
      let assetType = poolData.value.typeOfAsset
      if (assetType === 0) {
        swap.assetType = "BTC"
      } else if (assetType === 1) {
        swap.assetType = "ETH"
      } else if (assetType === 2) {
        swap.assetType = "USD"
      } else {
        swap.assetType = "OTHER"
      }
    }

    // Derived values
    if (swap.coins != null) {
      swap.coinCount = BigInt.fromI32((swap.coins as string[]).length)
    }
    if (swap.underlyingCoins != null) {
      swap.underlyingCount = BigInt.fromI32(
        (swap.underlyingCoins as string[]).length,
      )
    }

    // Pool parameters
    let A = poolRegistryContract.try_getA(address)
    let swapFee = poolRegistryContract.try_getSwapFee(address)
    let adminFee = poolRegistryContract.try_getAdminFee(address)
    let paused = poolRegistryContract.try_getPaused(address)
    let virtualPrice = poolRegistryContract.try_getVirtualPrice(address)
    if (!A.reverted) {
      swap.A = A.value
    }
    if (!swapFee.reverted) {
      swap.swapFee = swapFee.value
    }
    if (!adminFee.reverted) {
      swap.adminFee = adminFee.value
    }
    if (!paused.reverted) {
      swap.paused = paused.value
    }
    if (!virtualPrice.reverted) {
      swap.virtualPrice = virtualPrice.value
    }

    // Save new pool entity
    swap.addedAt = event.block.timestamp
    swap.addedAtBlock = event.block.number
    swap.addedAtTransaction = event.transaction.hash

    swap.save()

    let system = getSystemInfo(event.block, event.transaction)
    system.swapCount = system.swapCount.plus(BigInt.fromI32(1))
    system.save()

    // Start indexing events from new pool
    let context = new DataSourceContext()
    context.setBytes("registry", poolRegistryContract._address)

    PoolDataSource.createWithContext(address, context)
  }

  return swap as Swap
}
