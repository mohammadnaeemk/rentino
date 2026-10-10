import { Module } from "@nestjs/common";
import { AdminRentalsController } from "./admin-rentals.controller";
import { ProviderOrdersController } from "./provider-orders.controller";
import { RentalsController } from "./rentals.controller";
import { RentalsService } from "./rentals.service";

@Module({
  controllers: [
    RentalsController,
    ProviderOrdersController,
    AdminRentalsController,
  ],
  providers: [RentalsService],
  exports: [RentalsService],
})
export class RentalsModule {}
