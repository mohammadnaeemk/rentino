import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { GearQueryDto } from "./dto/gear.dto";
import { GearService } from "./gear.service";

@ApiTags("gear")
@Controller("gear")
export class GearController {
  constructor(private readonly gearService: GearService) {}

  @Get()
  @ApiOperation({
    summary: "Search/filter/paginate active listings (public)",
    description:
      "Supports `category` (slug or id), `search`/`q`, `brand`, `minPrice`, `maxPrice`, `sort` and pagination.",
  })
  findAll(@Query() query: GearQueryDto) {
    return this.gearService.findPublic(query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get a listing by id or slug, with reviews and related items",
  })
  findOne(@Param("id") id: string) {
    return this.gearService.findOne(id);
  }
}
