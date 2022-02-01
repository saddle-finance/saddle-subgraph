import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"

import { ERC20 } from "../../generated/PoolRegistry/ERC20"
import { Token } from "../../generated/schema"
import { getSystemInfo } from "./system"

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
  }

  return token as Token
}
