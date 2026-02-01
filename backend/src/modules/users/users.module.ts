import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { NeonUserService } from "./neon-user.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService, NeonUserService],
  exports: [UsersService, NeonUserService],
})
export class UsersModule {}
