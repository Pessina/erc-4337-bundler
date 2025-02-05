import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  http,
  createTestClient,
  publicActions,
  walletActions,
  PrivateKeyAccount,
  parseEther,
} from 'viem';
import {
  createSmartAccountClient,
  type SupportedSigner,
} from '@biconomy/account';
import { AppModule } from '../src/app.module';
import { privateKeyToAccount } from 'viem/accounts';
import { getChain } from '../src/utils';

const ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const privateKeys: `0x${string}`[] = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
];

describe('UserOperation (e2e)', () => {
  let app: INestApplication;
  let accounts: PrivateKeyAccount[];

  // TODO: Define the testClient on the beforeAll?
  const getTestClient = (account: PrivateKeyAccount) =>
    createTestClient({
      account,
      chain: getChain(Number(process.env.CHAIN_ID)),
      transport: http(),
      mode: 'hardhat',
    })
      .extend(publicActions)
      .extend(walletActions);

  const configEnv = () => {
    process.env.ETH_PRIVATE_KEYS = privateKeys.join(',');
  };

  // Assert hardhat is running
  beforeAll(async () => {
    let connected = false;
    accounts = privateKeys.map((key) => privateKeyToAccount(key));

    configEnv();
    const testClient = getTestClient(accounts[0]);

    while (!connected) {
      const blockNumber = await testClient.getBlockNumber();

      if (blockNumber > 0) {
        connected = true;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should handle native transfer user operation', async () => {
    const testClient = getTestClient(accounts[0]);

    // Create smart account instance
    const smartAccount = await createSmartAccountClient({
      signer: testClient as SupportedSigner,
      bundlerUrl: process.env.BICONOMY_BUNDLER_URL as string,
      biconomyPaymasterApiKey: 'test-key',
    });
    // // Prepare transaction
    const txData = {
      to: '0x1234567890123456789012345678901234567890',
      value: parseEther('0.000001'),
    };
    const userOp = await smartAccount.buildUserOp([txData]);
    const signedUserOp = await smartAccount.signUserOp(userOp);

    const response = (await request(app.getHttpServer())
      .post('/rpc')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_sendUserOperation',
        params: [signedUserOp, ENTRY_POINT_ADDRESS],
      })) as {
      status: number;
      body: {
        result: string;
      };
    };

    expect(response.status).toBe(200);
    expect(response.body.result).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });
});
