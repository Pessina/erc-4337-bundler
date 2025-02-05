import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-viem';

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    hardhat: {
      forking: {
        url: 'https://sepolia.infura.io/v3/6df51ccaa17f4e078325b5050da5a2dd',
      },
    },
  },
};

export default config;
