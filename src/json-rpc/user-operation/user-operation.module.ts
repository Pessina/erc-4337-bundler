import { Module } from '@nestjs/common';
import { UserOperationService } from './user-operation.service';
import { AccountModule } from '../../account/account.module';
import { TransactionModule } from '../../transaction/transaction.module';

@Module({
  // TODO: Consider importing those modules on a higher level
  imports: [AccountModule, TransactionModule],
  providers: [UserOperationService],
  exports: [UserOperationService],
})
export class UserOperationModule {}
