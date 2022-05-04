var fs = require("fs")

const paths = [
  "./abis/MetaSwap.json",
  "./abis/SwapFlashLoan.json",
  "./abis/SwapFlashLoanNoWithdrawFee.json",
]

const mergeSet = new Set()
paths.forEach((path) => {
  const json = require(path)
  json.forEach((x) => {
    mergeSet.add(JSON.stringify(x))
  })
})

const resultData = [...mergeSet]
  .map(JSON.parse)
  .sort((a, b) => (a.name < b.name ? -1 : 1))
  .filter(({ name }) => {
    const isEvent = name[0] < name[0].toLowerCase()
    const isGetter = name.slice(0, 3) === "get"
    return isEvent || isGetter
  })

fs.writeFile("merged.json", JSON.stringify(resultData), "utf8", console.log)
