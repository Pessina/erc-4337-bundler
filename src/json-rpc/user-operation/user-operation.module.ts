import { Module } from '@nestjs/common';
import { UserOperationService } from './user-operation.service';

@Module({
  providers: [UserOperationService],
  exports: [UserOperationService],
})
export class UserOperationModule {}
