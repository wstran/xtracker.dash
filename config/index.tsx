import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { cookieStorage, createStorage } from 'wagmi'
import { mainnet } from 'wagmi/chains'

export const projectId = 'bd824649b2b0830297c7cfadb18e339e'

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Alysi AI',
  description: '',
  url: '',
  icons: [], 
}

// Create wagmiConfig
export const config = defaultWagmiConfig({
  chains: [mainnet], // required
  projectId, // required
  metadata, // required
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  enableWalletConnect: true, // Optional - true by default
  enableInjected: true, // Optional - true by default
  enableEIP6963: true, // Optional - true by default
  enableCoinbase: true, // Optional - true by default
//   ...wagmiOptions // Optional - Override createConfig parameters
})