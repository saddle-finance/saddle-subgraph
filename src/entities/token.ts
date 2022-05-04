import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { LpToken, Token } from "../../generated/schema"

import { ERC20 } from "../../generated/PoolRegistry/ERC20"
import { getSystemInfo } from "./system"

class TokenInfo {
  constructor(
    readonly name: string | null,
    readonly symbol: string | null,
    readonly decimals: i32,
  ) {}
}

export function getOrCreateToken(
  address: Address,
  event: ethereum.Event,
): Token {
  let token = Token.load(address.toHexString())

  if (token == null) {
    let erc20 = ERC20.bind(address)

    let name = erc20.try_name()
    let symbol = erc20.try_symbol()
    let decimals = erc20.try_decimals()

    token = new Token(address.toHexString())
    token.address = address
    token.name = name.reverted ? null : name.value.toString()
    token.symbol = symbol.reverted ? null : symbol.value.toString()
    token.decimals = BigInt.fromI32(decimals.reverted ? 18 : decimals.value)
    token.save()

    let system = getSystemInfo(event.block, event.transaction)
    system.tokenCount = system.tokenCount.plus(BigInt.fromI32(1))
    system.save()
    log.info("Token Created {} {}", [
      name.reverted ? "MISSING-NAME" : name.value.toString(),
      token.address.toHexString(),
    ])
  }

  return token as Token
}

export function getOrCreateLpToken(address: Address): LpToken {
  let token = LpToken.load(address.toHexString())

  if (token == null) {
    let info = getTokenInfo(address)

    token = new LpToken(address.toHexString())
    token.address = address
    token.name = info.name
    token.symbol = info.symbol
    token.decimals = BigInt.fromI32(info.decimals)

    token.save()
  }

  return token
}

function getTokenInfo(address: Address): TokenInfo {
  let erc20 = ERC20.bind(address)

  let name = erc20.try_name()
  let symbol = erc20.try_symbol()
  let decimals = erc20.try_decimals()

  return new TokenInfo(
    name.reverted ? "" : name.value.toString(),
    symbol.reverted ? "" : symbol.value.toString(),
    decimals.reverted ? 18 : decimals.value,
  )
}
