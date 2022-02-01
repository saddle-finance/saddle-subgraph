import { AddRegistry } from '../../generated/MasterRegistry/MasterRegistry'
import { getSystemInfo } from '../entities/system'

export function handleAddRegistry(event: AddRegistry): void {
    let state = getSystemInfo(event.block, event.transaction)
    const contractName = event.params.name.toString()

    // TODO: Create entity for non-Pool Registry contracts
    
    if (contractName === "Pool Registry") {
        state.poolRegistryContract = event.params.registryAddress
    }
    state.save()
}