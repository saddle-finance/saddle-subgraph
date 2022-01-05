# saddle-subgraph

[Saddle](https://saddle.finance/) is an automated market maker for pegged value crypto assets.

This subgraph provides information about Saddle liquidity pools.

## Usage

### Build

```bash
npm run prepare:[networkName]
npm run codegen
npm run build
```

### Deploy

```bash
graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>
npm run deploy [subgraph-name] # saddle-finance/saddle or saddle-finance/saddle-arbitrum
```

### Example Queries

For example queries, please reference the [Saddle Playground](https://thegraph.com/explorer/subgraph/saddle-finance/saddle?selected=playground).
