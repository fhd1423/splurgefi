import { createPublicClient, http } from 'viem';
import { polygonMumbai } from 'viem/chains';

export const viemClient = createPublicClient({
  chain: polygonMumbai,
  transport: http(),
});
