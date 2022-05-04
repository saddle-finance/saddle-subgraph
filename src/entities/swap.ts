import {
  Address,
  BigInt,
  DataSourceContext,
  dataSource,
  ethereum,
  log,
} from "@graphprotocol/graph-ts"

import { Pool } from "../../generated/PoolRegistry/Pool"
import { Pool as PoolDataSource } from "../../generated/templates"
import { PoolRegistry } from "../../generated/PoolRegistry/PoolRegistry"
import { Swap } from "../../generated/schema"
import { getOrCreateLpToken } from "./token"
import { getSystemInfo } from "./system"
import { saveCoins } from "./coins"

export function getOrCreateSwap(address: Address, event: ethereum.Event): Swap {
  let swap = Swap.load(address.toHexString())

  if (swap == null) {
    // TODO dataSource.address() only works when Registry fired the event
    let poolRegistryContract = PoolRegistry.bind(dataSource.address())
    let poolContract = Pool.bind(address)

    swap = new Swap(address.toHexString())

    // Addresses etc
    swap.address = poolContract._address
    swap.registryAddress = poolRegistryContract._address

    saveCoins(swap, event)

    let poolData = poolRegistryContract.try_getPoolData(address)
    if (!poolData.reverted) {
      swap.name = poolData.value.poolName.toString()
      // TODO replace with registry fn
      swap.isMeta = poolData.value.metaSwapDepositAddress != Address.zero()
      let lpToken = getOrCreateLpToken(poolData.value.lpToken)
      lpToken.swap = swap.id

      swap.lpToken = lpToken.id
      swap.depositAddress = poolData.value.metaSwapDepositAddress
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
    // TODO: see if it's possible to do this via registry
    let A = poolContract.try_getA()
    let paused = poolContract.try_paused()
    let virtualPrice = poolContract.try_getVirtualPrice()
    let swapStorage = poolContract.try_swapStorage()

    if (!A.reverted) {
      swap.A = A.value
    }
    if (!paused.reverted) {
      swap.paused = paused.value
    }
    if (!virtualPrice.reverted) {
      swap.virtualPrice = virtualPrice.value
    }
    if (!swapStorage.reverted) {
      swap.swapFee = swapStorage.value.value4
      swap.adminFee = swapStorage.value.value5
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
    log.info("Swap Created {} {}", [
      poolData.reverted ? "MISSING-NAME" : poolData.value.poolName.toString(),
      address.toHexString(),
    ])
  }

  return swap as Swap
}
