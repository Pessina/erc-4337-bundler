import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  http,
  parseEther,
  createWalletClient,
  PrivateKeyAccount,
  WalletClient,
} from 'viem';
import {
  createSmartAccountClient,
  type SupportedSigner,
} from '@biconomy/account';
import { AppModule } from '../src/app.module';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { config } from 'dotenv';
import { App } from 'supertest/types';

config();

const ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

// TODO: Ideally it should be tested against a test network like hardhat
describe('UserOperation (e2e)', () => {
  let app: INestApplication<App>;
  let testingModule: TestingModule;
  let walletClient: WalletClient;
  let account: PrivateKeyAccount;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    account = privateKeyToAccount(
      (process.env.ETH_PRIVATE_KEYS as string).split(',')[0] as `0x${string}`,
    );

    walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(),
    });

    app = testingModule.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should handle native transfer user operation', async () => {
    jest.setTimeout(10000);

    const smartAccount = await createSmartAccountClient({
      signer: walletClient as SupportedSigner,
      bundlerUrl:
        'https://bundler.biconomy.io/api/v2/11155111/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',
    });

    const txData = {
      to: '0x1234567890123456789012345678901234567890',
      value: parseEther('0.000001'),
    };

    const userOp = await smartAccount.buildUserOp([txData]);
    const signedUserOp = await smartAccount.signUserOp(userOp);

    return request(app.getHttpServer())
      .post('/rpc')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_sendUserOperation',
        params: [signedUserOp, ENTRY_POINT_ADDRESS],
      })
      .expect(200)
      .expect((res: { body: { result: string } }) => {
        expect(res.body.result).toMatch(/^0x[a-fA-F0-9]{64}$/);
      });
  });

  // TODO: Include more tests
  // - Test with a contract call
  // - Incorrect Nonce
  // - Incorrect Gas
  // - Incorrect JSON RPC Request
});
