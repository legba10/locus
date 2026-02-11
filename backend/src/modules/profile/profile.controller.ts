import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { SupabaseAuthService } from "../auth/supabase-auth.service";
import { NeonUserService } from "../users/neon-user.service";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

const NAME_CHANGES_PER_DAY = 3;
const NAME_CHANGES_PER_MONTH = 6;

@ApiTags("profile")
@Controller("profile")
export class ProfileController {
  constructor(
    private readonly supabaseAuth: SupabaseAuthService,
    private readonly prisma: PrismaService,
    private readonly neonUser: NeonUserService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Patch()
  @HttpCode(HttpStatus.OK)
  async update(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const fullName = dto.full_name ?? dto.name ?? undefined;
    const phone = dto.phone ?? undefined;
    const role = dto.role ?? undefined;
    const avatarUrl = dto.avatar_url ?? undefined;

    if (fullName === undefined && phone === undefined && role === undefined && avatarUrl === undefined) {
      throw new BadRequestException("No profile fields provided");
    }

    const userId = req.user.id;

    if (fullName !== undefined) {
      await this.neonUser.ensureUserExists(userId, req.user?.email ?? null);
      const now = new Date();
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const existing = await this.prisma.profile.findUnique({
        where: { userId },
        select: {
          nameChangeCountDay: true,
          nameChangeCountMonth: true,
          lastDayResetAt: true,
          lastMonthResetAt: true,
        },
      });

      let countDay = existing?.nameChangeCountDay ?? 0;
      let countMonth = existing?.nameChangeCountMonth ?? 0;
      let lastDay = existing?.lastDayResetAt ?? null;
      let lastMonth = existing?.lastMonthResetAt ?? null;

      if (lastDay == null || lastDay < dayStart) {
        countDay = 0;
        lastDay = now;
      }
      if (lastMonth == null || lastMonth < monthStart) {
        countMonth = 0;
        lastMonth = now;
      }

      if (countDay >= NAME_CHANGES_PER_DAY) {
        throw new BadRequestException(
          `Лимит смены имени: не более ${NAME_CHANGES_PER_DAY} раз в день`,
        );
      }
      if (countMonth >= NAME_CHANGES_PER_MONTH) {
        throw new BadRequestException(
          `Лимит смены имени: не более ${NAME_CHANGES_PER_MONTH} раз в месяц`,
        );
      }

      await this.prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          name: fullName.trim(),
          nameChangedAt: now,
          nameChangeCountDay: 1,
          nameChangeCountMonth: 1,
          lastDayResetAt: now,
          lastMonthResetAt: now,
        },
        update: {
          name: fullName.trim(),
          nameChangedAt: now,
          nameChangeCountDay: countDay + 1,
          nameChangeCountMonth: countMonth + 1,
          lastDayResetAt: lastDay,
          lastMonthResetAt: lastMonth,
        },
      });
    }

    const profile = await this.supabaseAuth.updateProfile(userId, {
      full_name: fullName,
      phone,
      role,
      avatar_url: avatarUrl,
    });

    if (!profile) {
      throw new InternalServerErrorException("Failed to update profile");
    }

    const email = profile?.email ?? req.user?.email ?? null;
    return {
      id: userId,
      name: (profile?.full_name ?? "").trim() || "",
      avatar: (profile as any)?.avatar_url ?? null,
      email: email ?? "",
      phone: (profile?.phone ?? "").trim() || "",
    };
  }
}
