import { Module } from '@nestjs/common';
import { UserOperationService } from './user-operation.service';
import { AccountModule } from '../../account/account.module';

@Module({
  imports: [AccountModule],
  providers: [UserOperationService],
  exports: [UserOperationService],
})
export class UserOperationModule {}
