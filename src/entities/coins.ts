import { Address, ethereum } from "@graphprotocol/graph-ts"
import { Coin, Swap, UnderlyingCoin } from "../../generated/schema"
import {
  PoolRegistry,
  PoolRegistry__getBalancesResult,
  PoolRegistry__getUnderlyingBalancesResult,
} from "../../generated/PoolRegistry/PoolRegistry"

import { Pool } from "../../generated/templates/Pool/Pool"
import { decimal } from "@protofire/subgraph-toolkit"
import { getOrCreateToken } from "./token"
import { getOrNull } from "../utils"

export function saveCoins(pool: Swap, event: ethereum.Event): void {
  let registryContract = PoolRegistry.bind(pool.registryAddress as Address)
  let poolContract = Pool.bind(pool.address as Address)

  let coinsAndBalances = getOrNull<PoolRegistry__getBalancesResult>(
    registryContract.try_getBalances(poolContract._address),
  )
  let underlyingCoinsAndBalances =
    getOrNull<PoolRegistry__getUnderlyingBalancesResult>(
      registryContract.try_getUnderlyingBalances(poolContract._address),
    )

  if (coinsAndBalances) {
    let coins = coinsAndBalances.value0
    let balances = coinsAndBalances.value1
    for (let i = 0; i < coins.length; ++i) {
      let token = getOrCreateToken(coins[i], event)

      let coin = new Coin(pool.id + "-" + i.toString())
      coin.index = i
      coin.swap = pool.id
      coin.token = token.id
      coin.underlying = coin.id
      coin.balance = balances
        ? decimal.fromBigInt(balances[i], token.decimals.toI32())
        : decimal.ZERO
      coin.updated = event.block.timestamp
      coin.updatedAtBlock = event.block.number
      coin.updatedAtTransaction = event.transaction.hash
      coin.save()
    }
  }

  if (underlyingCoinsAndBalances) {
    let coins = underlyingCoinsAndBalances.value0
    let balances = underlyingCoinsAndBalances.value1
    for (let i = 0; i < coins.length; ++i) {
      let token = getOrCreateToken(coins[i], event)

      let coin = new UnderlyingCoin(pool.id + "-" + i.toString())
      coin.index = i
      coin.swap = pool.id
      coin.token = token.id
      coin.balance = balances
        ? decimal.fromBigInt(balances[i], token.decimals.toI32())
        : decimal.ZERO
      coin.updated = event.block.timestamp
      coin.updatedAtBlock = event.block.number
      coin.updatedAtTransaction = event.transaction.hash
      coin.save()
    }
  }
}
