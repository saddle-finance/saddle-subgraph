import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Coin, Swap, UnderlyingCoin } from "../../generated/schema"

import { Pool } from "../../generated/templates/Pool/Pool"
import { PoolRegistry } from "../../generated/PoolRegistry/PoolRegistry"
import { decimal } from "@protofire/subgraph-toolkit"
import { getOrCreateToken } from "./token"
import { getOrNull } from "../utils"

export function saveCoins(pool: Swap, event: ethereum.Event): void {
  let registryContract = PoolRegistry.bind(
    changetype<Address>(pool.registryAddress),
  )
  let poolContract = Pool.bind(changetype<Address>(pool.address))

  let coins = getOrNull<Address[]>(
    registryContract.try_getTokens(poolContract._address),
  )
  let balances = getOrNull<BigInt[]>(
    registryContract.try_getTokenBalances(poolContract._address),
  )

  if (coins && balances) {
    for (let i = 0; i < coins.length; ++i) {
      let token = getOrCreateToken(coins[i], event)

      let coin = new Coin(pool.id + "-" + i.toString())
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

  let underlyingCoins = getOrNull<Address[]>(
    registryContract.try_getUnderlyingTokens(poolContract._address),
  )
  let underlyingBalances = getOrNull<BigInt[]>(
    registryContract.try_getUnderlyingTokenBalances(poolContract._address),
  )
  if (underlyingCoins && underlyingBalances) {
    for (let i = 0; i < underlyingCoins.length; ++i) {
      let token = getOrCreateToken(underlyingCoins[i], event)

      let coin = new UnderlyingCoin(pool.id + "-" + i.toString())
      coin.index = i
      coin.swap = pool.id
      coin.token = token.id
      coin.balance = underlyingBalances
        ? decimal.fromBigInt(underlyingBalances[i], token.decimals.toI32())
        : decimal.ZERO
      coin.updated = event.block.timestamp
      coin.updatedAtBlock = event.block.number
      coin.updatedAtTransaction = event.transaction.hash
      coin.save()
    }
  }
}
