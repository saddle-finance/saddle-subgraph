import {
  AddLiquidity,
  FlashLoan,
  NewAdminFee,
  NewSwapFee,
  OwnershipTransferred,
  Paused,
  RampA,
  RemoveLiquidity,
  RemoveLiquidityImbalance,
  RemoveLiquidityOne,
  StopRampA,
  TokenSwap,
  TokenSwapUnderlying,
  Unpaused,
} from "../../generated/templates/Pool/Pool"
import {
  AddLiquidityEvent,
  Coin,
  FlashLoanEvent,
  NewAdminFeeEvent,
  NewSwapFeeEvent,
  OwnershipTransferredEvent,
  PausedEvent,
  RampAEvent,
  RemoveLiquidityEvent,
  StopRampAEvent,
  Swap,
  Token,
  TokenExchange,
  TokenExchangeUnderlying,
  UnderlyingCoin,
  UnpausedEvent,
} from "../../generated/schema"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { decimal, integer } from "@protofire/subgraph-toolkit"
import {
  getDailyTradeVolume,
  getHourlyTradeVolume,
  getWeeklyTradeVolume,
} from "../entities/volume"

import { Pool } from "../../generated/PoolRegistry/Pool"
import { getSystemInfo } from "../entities/system"
import { saveCoins } from "../entities/coins"

export function handleNewAdminFee(event: NewAdminFee): void {
  let swap = Swap.load(event.address.toHexString())
  if (swap != null) {
    swap.adminFee = event.params.newAdminFee
    swap.save()

    let log = new NewAdminFeeEvent("new_admin_fee-" + getEventId(event))

    log.swap = swap.id
    log.newFee = event.params.newAdminFee

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
  }
}

export function handleNewSwapFee(event: NewSwapFee): void {
  let swap = Swap.load(event.address.toHexString())
  if (swap != null) {
    swap.swapFee = event.params.newSwapFee
    swap.save()

    let log = new NewSwapFeeEvent("new_swap_fee-" + getEventId(event))

    log.swap = swap.id
    log.newFee = event.params.newSwapFee

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
  }
}

export function handleRampA(event: RampA): void {
  let swap = Swap.load(event.address.toHexString())
  if (swap != null) {
    let log = new RampAEvent("ramp_A-" + getEventId(event))

    log.swap = swap.id
    log.oldA = event.params.oldA
    log.newA = event.params.newA
    log.initialTime = event.params.initialTime
    log.futureTime = event.params.futureTime

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
  }
}

export function handleStopRampA(event: StopRampA): void {
  let swap = Swap.load(event.address.toHexString())
  if (swap != null) {
    swap.A = event.params.currentA
    swap.save()

    let log = new StopRampAEvent("stop_ramp_A-" + getEventId(event))

    log.swap = swap.id
    log.currentA = event.params.currentA
    log.time = event.params.time

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
  }
}

export function handlePaused(event: Paused): void {
  let swap = Swap.load(event.address.toHexString())
  if (swap != null) {
    swap.paused = true
    swap.save()

    let log = new PausedEvent("pause-" + getEventId(event))

    log.swap = swap.id

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
  }
}

export function handleUnpaused(event: Unpaused): void {
  let swap = Swap.load(event.address.toHexString())
  if (swap != null) {
    swap.paused = false
    swap.save()

    let log = new UnpausedEvent("unpause-" + getEventId(event))

    log.swap = swap.id

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
  }
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let swap = Swap.load(event.address.toHexString())
  if (swap != null) {
    swap.owner = event.params.newOwner
    swap.save()

    let log = new OwnershipTransferredEvent(
      "ownership_transferred-" + getEventId(event),
    )

    log.swap = swap.id
    log.newOwner = event.params.newOwner
    log.previousOwner = event.params.previousOwner

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
  }
}

export function handleFlashLoan(event: FlashLoan): void {
  let swap = Swap.load(event.address.toHexString())
  if (swap != null) {
    swap = getPoolSnapshot(swap, event)

    let log = new FlashLoanEvent("flash_loan-" + getEventId(event))

    log.swap = swap.id
    log.receiver = event.params.receiver
    log.tokenIndex = event.params.tokenIndex
    log.amount = event.params.amount
    log.amountFee = event.params.amountFee
    log.protocolFee = event.params.protocolFee

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
    swap.save()
  }
}

export function handleAddLiquidity(event: AddLiquidity): void {
  let swap = Swap.load(event.address.toHexString())

  if (swap != null) {
    swap = getPoolSnapshot(swap, event)

    let log = new AddLiquidityEvent("add_liquidity-" + getEventId(event))

    log.swap = swap.id
    log.provider = event.params.provider
    log.tokenAmounts = event.params.tokenAmounts
    log.lpTokenSupply = event.params.lpTokenSupply

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
    swap.save()
  }
}

export function handleRemoveLiquidity(event: RemoveLiquidity): void {
  let swap = Swap.load(event.address.toHexString())

  if (swap != null) {
    swap = getPoolSnapshot(swap, event)

    let log = new RemoveLiquidityEvent("remove_liquidity-" + getEventId(event))

    log.swap = swap.id
    log.provider = event.params.provider
    log.tokenAmounts = event.params.tokenAmounts
    log.lpTokenSupply = event.params.lpTokenSupply

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
    swap.save()
  }
}

export function handleRemoveLiquidityOne(event: RemoveLiquidityOne): void {
  let swap = Swap.load(event.address.toHexString())
  if (swap != null) {
    swap = getPoolSnapshot(swap, event)

    let log = new RemoveLiquidityEvent(
      "remove_liquidity_one-" + getEventId(event),
    )
    const coins = swap.coins!
    let tokenAmounts: BigInt[] = []
    for (let i = 0; i < coins.length; i++) {
      if (i === parseInt(event.params.boughtId.toString())) {
        tokenAmounts.push(event.params.tokensBought)
      } else {
        tokenAmounts.push(BigInt.fromI32(0))
      }
    }

    log.swap = swap.id
    log.provider = event.params.provider
    log.lpTokenSupply = event.params.lpTokenSupply

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
    swap.save()
  }
}

export function handleRemoveLiquidityImbalance(
  event: RemoveLiquidityImbalance,
): void {
  let swap = Swap.load(event.address.toHexString())

  if (swap != null) {
    swap = getPoolSnapshot(swap, event)

    let log = new RemoveLiquidityEvent(
      "remove_liquidity_imbalance-" + getEventId(event),
    )

    log.swap = swap.id
    log.provider = event.params.provider
    log.tokenAmounts = event.params.tokenAmounts
    log.fees = event.params.fees
    log.invariant = event.params.invariant
    log.lpTokenSupply = event.params.lpTokenSupply

    log.block = event.block.number
    log.timestamp = event.block.timestamp
    log.transaction = event.transaction.hash

    log.save()
    swap.save()
  }
}

export function handleTokenSwap(event: TokenSwap): void {
  let swap = Swap.load(event.address.toHexString())

  if (swap != null) {
    swap = getPoolSnapshot(swap, event)

    let coinSold = Coin.load(
      swap.id + "-" + event.params.soldId.toString(),
    ) as Coin
    let tokenSold = Token.load(coinSold.token) as Token
    let amountSold = decimal.fromBigInt(
      event.params.tokensSold,
      tokenSold.decimals.toI32(),
    )

    let coinBought = Coin.load(
      swap.id + "-" + event.params.boughtId.toString(),
    ) as Coin
    let tokenBought = Token.load(coinBought.token) as Token
    let amountBought = decimal.fromBigInt(
      event.params.tokensBought,
      tokenBought.decimals.toI32(),
    )

    let exchange = new TokenExchange("token_exchange-" + getEventId(event))

    exchange.swap = swap.id
    exchange.buyer = event.params.buyer
    exchange.tokenSold = tokenSold.id
    exchange.tokenBought = tokenBought.id
    exchange.amountSold = amountSold
    exchange.amountBought = amountBought
    exchange.block = event.block.number
    exchange.timestamp = event.block.timestamp
    exchange.transaction = event.transaction.hash

    exchange.save()

    // save trade volume
    let volume = exchange.amountSold
      .plus(exchange.amountBought)
      .div(decimal.TWO)

    let hourlyVolume = getHourlyTradeVolume(swap, event.block.timestamp)
    hourlyVolume.volume = hourlyVolume.volume.plus(volume)
    hourlyVolume.save()

    let dailyVolume = getDailyTradeVolume(swap, event.block.timestamp)
    dailyVolume.volume = dailyVolume.volume.plus(volume)
    dailyVolume.save()

    let weeklyVolume = getWeeklyTradeVolume(swap, event.block.timestamp)
    weeklyVolume.volume = weeklyVolume.volume.plus(volume)
    weeklyVolume.save()

    // update system
    let system = getSystemInfo(event.block, event.transaction)
    system.exchangeCount = integer.increment(system.exchangeCount)
    system.save()

    swap.exchangeCount = integer.increment(swap.exchangeCount as BigInt)
    swap.save()
  }
}

export function handleTokenSwapUnderlying(event: TokenSwapUnderlying): void {
  let swap = Swap.load(event.address.toHexString())

  if (swap != null) {
    swap = getPoolSnapshot(swap, event)

    let coinSold = UnderlyingCoin.load(
      swap.id + "-" + event.params.soldId.toString(),
    ) as UnderlyingCoin
    let tokenSold = Token.load(coinSold.token) as Token
    let amountSold = decimal.fromBigInt(
      event.params.tokensSold,
      tokenSold.decimals.toI32(),
    )

    let coinBought = UnderlyingCoin.load(
      swap.id + "-" + event.params.boughtId.toString(),
    ) as UnderlyingCoin
    let tokenBought = Token.load(coinBought.token) as Token
    let amountBought = decimal.fromBigInt(
      event.params.tokensBought,
      tokenBought.decimals.toI32(),
    )

    // intnentially using same event name as token swap
    let exchange = new TokenExchangeUnderlying(
      "token_exchange_underlying-" + getEventId(event),
    )

    exchange.swap = swap.id
    exchange.buyer = event.params.buyer
    exchange.tokenSold = tokenSold.id
    exchange.tokenBought = tokenBought.id
    exchange.amountSold = amountSold
    exchange.amountBought = amountBought
    exchange.block = event.block.number
    exchange.timestamp = event.block.timestamp
    exchange.transaction = event.transaction.hash

    exchange.save()

    // save trade volume
    let volume = exchange.amountSold
      .plus(exchange.amountBought)
      .div(decimal.TWO)

    let hourlyVolume = getHourlyTradeVolume(swap, event.block.timestamp)
    hourlyVolume.volume = hourlyVolume.volume.plus(volume)
    hourlyVolume.save()

    let dailyVolume = getDailyTradeVolume(swap, event.block.timestamp)
    dailyVolume.volume = dailyVolume.volume.plus(volume)
    dailyVolume.save()

    let weeklyVolume = getWeeklyTradeVolume(swap, event.block.timestamp)
    weeklyVolume.volume = weeklyVolume.volume.plus(volume)
    weeklyVolume.save()

    // update system
    let system = getSystemInfo(event.block, event.transaction)
    system.exchangeCount = integer.increment(system.exchangeCount)
    system.save()

    swap.exchangeCount = integer.increment(swap.exchangeCount as BigInt)
    swap.save()
  }
}

function getEventId(event: ethereum.Event): string {
  return event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
}

function getPoolSnapshot(pool: Swap, event: ethereum.Event): Swap {
  if (pool != null) {
    let poolContract = Pool.bind(pool.address as Address)

    // Update coin balances and underlying coin balances/rates
    saveCoins(pool, event)

    // Save current virtual price
    let virtualPrice = poolContract.try_getVirtualPrice()

    if (!virtualPrice.reverted) {
      pool.virtualPrice = virtualPrice.value
    }
  }

  return pool
}
