# saddle-subgraph

[Saddle](https://saddle.finance/) is an automated market maker for pegged value crypto assets.

This subgraph provides information about Saddle liquidity pools.

## Usage

### Build

```bash
npm run prepare --network=mainnet
npm run codegen
npm run build
```

### Deploy

```bash
graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>
npm run deploy [subgraph-name] # see supported names below
```

### Chains

Mainnet: `saddle-finance/saddle`

Arbitrum: `saddle-finance/saddle-arbitrum`

Optimism: TBD

Fantom: TBD

### Example Queries

For example queries, please reference the [Saddle Playground](https://thegraph.com/explorer/subgraph/saddle-finance/saddle?selected=playground).

### Helpful commands

```bash
# convert existing yaml to new config format
cat config/mainnet.subgraph.yaml | yq '.dataSources[]|{name:.name,address:.source.address,startBlock:.source.startBlock}' > results.json

# in the saddle-contract repo
node scripts/print-addresses.js --network=fantom_mainnet --graph-config | jq .data > results.json
```
