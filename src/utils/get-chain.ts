// Copied from: https://github.com/bcnmy/sdk-examples/blob/64030b723156e1e320af3492728385d893934bee/scripts/utils/getChain.ts#L1

import * as chains from 'viem/chains';
import type { Chain } from 'viem/chains';

export const getChain = (chainId: number): Chain => {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain;
    }
  }
  throw new Error('Chain not found');
};
