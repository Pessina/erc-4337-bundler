// TODO: Do not disable eslint for the whole file
/* eslint-disable */
// @ts-nocheck

import { z } from 'zod';

export const envSchema = z.object({
  ETH_PRIVATE_KEY: z
    .string({
      required_error: 'ETH_PRIVATE_KEY is required',
      invalid_type_error: 'ETH_PRIVATE_KEY must be a string',
    })
    .regex(/^0x[a-fA-F0-9]{64}$/, {
      message: 'ETH_PRIVATE_KEY must be a valid hex string starting with 0x',
    }),
});

export type Env = z.infer<typeof envSchema>;
