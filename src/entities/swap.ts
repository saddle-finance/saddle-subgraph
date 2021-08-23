import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"

import { Swap } from "../../generated/schema"
import { SwapFlashLoan } from "../../generated/USDPool/SwapFlashLoan"
import { SwapFlashLoanNoWithdrawFee } from "../../generated/ALETHPool/SwapFlashLoanNoWithdrawFee"
import { getOrCreateToken } from "./token"
import { getSystemInfo } from "./system"
import { MetaSwap } from "../../generated/SUSDMetaPool/MetaSwap"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

class SwapInfo {
  tokens: Address[]
  balances: BigInt[]
  A: BigInt
  swapFee: BigInt
  adminFee: BigInt
  withdrawFee: BigInt
  virtualPrice: BigInt
  owner: Address
  lpToken: Address
}

export function getOrCreateSwap(
  address: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction,
): Swap {
  let swap = Swap.load(address.toHexString())

  if (swap == null) {
    let info = getSwapInfo(address)

    swap = new Swap(address.toHexString())
    swap.address = address
    swap.numTokens = info.tokens.length
    swap.tokens = registerTokens(info.tokens, block, tx)
    swap.balances = info.balances
    swap.lpToken = info.lpToken

    swap.A = info.A

    swap.swapFee = info.swapFee
    swap.adminFee = info.adminFee
    swap.withdrawFee = info.withdrawFee

    swap.virtualPrice = info.virtualPrice

    swap.owner = info.owner

    swap.save()

    let system = getSystemInfo(block, tx)
    system.swapCount = system.swapCount.plus(BigInt.fromI32(1))
    system.save()
  }

  return swap as Swap
}

// Gets poll info from swap contract
export function getSwapInfo(swap: Address): SwapInfo {
  let swapContract = SwapFlashLoan.bind(swap)

  let tokens: Address[] = []
  let balances: BigInt[] = []

  let t: ethereum.CallResult<Address>
  let b: ethereum.CallResult<BigInt>

  let i = 0

  do {
    t = swapContract.try_getToken(i)
    b = swapContract.try_getTokenBalance(i)

    if (!t.reverted && t.value.toHexString() != ZERO_ADDRESS) {
      tokens.push(t.value)
    }

    if (!b.reverted) {
      balances.push(b.value)
    }

    i++
  } while (!t.reverted && !b.reverted)

  return {
    tokens,
    balances,
    A: swapContract.getA(),
    swapFee: swapContract.swapStorage().value4,
    adminFee: swapContract.swapStorage().value5,
    withdrawFee: swapContract.swapStorage().value6,
    virtualPrice: swapContract.getVirtualPrice(),
    owner: swapContract.owner(),
    lpToken: swapContract.swapStorage().value7,
  }
}

export function getBalances(swap: Address, N_COINS: number): BigInt[] {
  let swapContract = SwapFlashLoan.bind(swap)
  let balances = new Array<BigInt>(<i32>N_COINS)

  for (let i = 0; i < N_COINS; ++i) {
    balances[i] = swapContract.getTokenBalance(i)
  }

  return balances
}

export function getOrCreateSwapNoWithdrawFee(
  address: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction,
): Swap {
  let swap = Swap.load(address.toHexString())

  if (swap == null) {
    let info = getSwapInfoNoWithdrawFee(address)

    swap = new Swap(address.toHexString())
    swap.address = address
    swap.numTokens = info.tokens.length
    swap.tokens = registerTokens(info.tokens, block, tx)
    swap.balances = info.balances
    swap.lpToken = info.lpToken

    swap.A = info.A

    swap.swapFee = info.swapFee
    swap.adminFee = info.adminFee
    swap.withdrawFee = info.withdrawFee

    swap.virtualPrice = info.virtualPrice

    swap.owner = info.owner

    swap.save()

    let system = getSystemInfo(block, tx)
    system.swapCount = system.swapCount.plus(BigInt.fromI32(1))
    system.save()
  }

  return swap as Swap
}

// Gets poll info from swap contract
export function getSwapInfoNoWithdrawFee(swap: Address): SwapInfo {
  let swapContract = SwapFlashLoanNoWithdrawFee.bind(swap)

  let tokens: Address[] = []
  let balances: BigInt[] = []

  let t: ethereum.CallResult<Address>
  let b: ethereum.CallResult<BigInt>

  let i = 0

  do {
    t = swapContract.try_getToken(i)
    b = swapContract.try_getTokenBalance(i)

    if (!t.reverted && t.value.toHexString() != ZERO_ADDRESS) {
      tokens.push(t.value)
    }

    if (!b.reverted) {
      balances.push(b.value)
    }

    i++
  } while (!t.reverted && !b.reverted)

  return {
    tokens,
    balances,
    A: swapContract.getA(),
    swapFee: swapContract.swapStorage().value4,
    adminFee: swapContract.swapStorage().value5,
    withdrawFee: BigInt.fromI32(0),
    virtualPrice: swapContract.getVirtualPrice(),
    owner: swapContract.owner(),
    lpToken: swapContract.swapStorage().value6,
  }
}

export function getBalancesNoWithdrawFee(
  swap: Address,
  N_COINS: number,
): BigInt[] {
  let swapContract = SwapFlashLoanNoWithdrawFee.bind(swap)
  let balances = new Array<BigInt>(<i32>N_COINS)

  for (let i = 0; i < N_COINS; ++i) {
    balances[i] = swapContract.getTokenBalance(i)
  }

  return balances
}

export function getOrCreateMetaSwap(
  address: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction,
): Swap {
  let swap = Swap.load(address.toHexString())

  if (swap == null) {
    let info = getMetaSwapInfo(address)

    swap = new Swap(address.toHexString())
    swap.address = address
    swap.numTokens = info.tokens.length
    swap.tokens = registerTokens(info.tokens, block, tx)
    swap.balances = info.balances
    swap.lpToken = info.lpToken

    swap.A = info.A

    swap.swapFee = info.swapFee
    swap.adminFee = info.adminFee
    swap.withdrawFee = info.withdrawFee

    swap.virtualPrice = info.virtualPrice

    swap.owner = info.owner

    swap.save()

    let system = getSystemInfo(block, tx)
    system.swapCount = system.swapCount.plus(BigInt.fromI32(1))
    system.save()
  }

  return swap as Swap
}

// Gets poll info from swap contract
export function getMetaSwapInfo(swap: Address): SwapInfo {
  let swapContract = MetaSwap.bind(swap)

  let tokens: Address[] = []
  let balances: BigInt[] = []

  let t: ethereum.CallResult<Address>
  let b: ethereum.CallResult<BigInt>

  let i = 0

  do {
    t = swapContract.try_getToken(i)
    b = swapContract.try_getTokenBalance(i)

    if (!t.reverted && t.value.toHexString() != ZERO_ADDRESS) {
      tokens.push(t.value)
    }

    if (!b.reverted) {
      balances.push(b.value)
    }

    i++
  } while (!t.reverted && !b.reverted)

  return {
    tokens,
    balances,
    A: swapContract.getA(),
    swapFee: swapContract.swapStorage().value4,
    adminFee: swapContract.swapStorage().value5,
    withdrawFee: BigInt.fromI32(0),
    virtualPrice: swapContract.getVirtualPrice(),
    owner: swapContract.owner(),
    lpToken: swapContract.swapStorage().value6,
  }
}

export function getBalancesMetaSwap(swap: Address, N_COINS: number): BigInt[] {
  let swapContract = MetaSwap.bind(swap)
  let balances = new Array<BigInt>(<i32>N_COINS)

  for (let i = 0; i < N_COINS; ++i) {
    balances[i] = swapContract.getTokenBalance(i)
  }

  return balances
}

function registerTokens(
  list: Address[],
  block: ethereum.Block,
  tx: ethereum.Transaction,
): string[] {
  let result: string[] = []

  for (let i = 0; i < list.length; ++i) {
    let current = list[i]

    if (current.toHexString() != ZERO_ADDRESS) {
      let token = getOrCreateToken(current, block, tx)

      result.push(token.id)
    }
  }

  return result
}
