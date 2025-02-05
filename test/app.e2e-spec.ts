import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  http,
  PrivateKeyAccount,
  parseEther,
  createWalletClient,
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
config();

const ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

// TODO: Ideally it should be tested against a test network like hardhat
describe('UserOperation (e2e)', () => {
  let app: INestApplication;
  let account: PrivateKeyAccount;
  let walletClient: WalletClient;

  beforeEach(async () => {
    account = privateKeyToAccount(
      (process.env.ETH_PRIVATE_KEYS as string).split(',')[0] as `0x${string}`,
    );

    walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(),
    });

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
