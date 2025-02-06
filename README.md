# ERC-4337 Bundler

A NestJS implementation of an ERC-4337 bundler that processes `eth_sendUserOperation` JSON RPC requests.

## Overview

This bundler provides a server endpoint for handling ERC-4337 user operations. It includes:

- Account selection using a points-based system based on mempool state
- Basic retry mechanism with exponential backoff
- Single RPC endpoint (`/rpc`) supporting the `eth_sendUserOperation` method

## Prerequisites

- Node.js
- pnpm package manager

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Add your private keys and chain IDs to the `.env` file. You can include multiple configurations.

Note: This implementation has been tested with two keys on the Sepolia testnet.

## Running the Server

Start the development server:

```bash
pnpm start:dev
```

The server runs on port 3000 by default.

## Testing

### Using cURL

Test the RPC endpoint with this example request:

```bash
curl 'http://localhost:3000/rpc' \
  -H 'Content-Type: application/json' \
  -d '{
    "method": "eth_sendUserOperation",
    "params": [{
        "sender": "0x2E766363F2efD99631755dcE69806Bd113B41565",
        "nonce": "0x2e",
        "initCode": "0x",
        "callData": "0x0000189a0000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000009184e72a00000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "signature": "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000001c5b32f37f5bea87bdd5374eb2ac54ea8e0000000000000000000000000000000000000000000000000000000000000041ff62bdda96b0698d8440f3932d44e8d15a24bd27f3fc78c390ac3350f0419cc63e9979012d664e233d18237f28f49c81025571be3140ee112070ddd1205dc1601b00000000000000000000000000000000000000000000000000000000000000",
        "paymasterAndData": "0x",
        "maxFeePerGas": "0x2b8501eae2",
        "maxPriorityFeePerGas": "0x338ae9c1",
        "verificationGasLimit": "0x113f9",
        "callGasLimit": "0x3c6a",
        "preVerificationGas": "0xe339"
    },
    "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789"],
    "id": 1,
    "jsonrpc": "2.0"
  }'
```

### End-to-End Testing

Run the E2E test suite:

```bash
pnpm test:e2e
```

The test suite includes a single test that uses the Biconomy SDK to create a Sepolia UserOp and submit it to the server.
