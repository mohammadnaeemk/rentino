import { Module } from "@nestjs/common";
import { AdminGearController } from "./admin-gear.controller";
import { GearController } from "./gear.controller";
import { GearService } from "./gear.service";
import { ProviderGearController } from "./provider-gear.controller";

@Module({
  controllers: [GearController, ProviderGearController, AdminGearController],
  providers: [GearService],
  exports: [GearService],
})
export class GearModule {}
