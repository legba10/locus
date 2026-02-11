import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NeonUserService } from "../users/neon-user.service";
import { SupabaseAuthService } from "../auth/supabase-auth.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

const NAME_CHANGES_PER_DAY = 10;
const NAME_CHANGES_PER_MONTH = 6;

export type ProfileResponse = {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
  phone: string;
};

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly neonUser: NeonUserService,
    private readonly supabaseAuth: SupabaseAuthService,
  ) {}

  /**
   * Update profile: always save to Neon first, then try Supabase sync (errors logged, not thrown).
   * Returns profile from Neon.
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    userEmail?: string | null,
  ): Promise<ProfileResponse> {
    const fullName = dto.full_name ?? dto.name ?? undefined;
    const phone = dto.phone ?? undefined;
    const role = dto.role ?? undefined;
    const avatarUrl = dto.avatar_url ?? undefined;

    await this.neonUser.ensureUserExists(userId, userEmail ?? null);

    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let nameUpdate: { name: string; nameChangedAt: Date; nameChangeCountDay: number; nameChangeCountMonth: number; lastDayResetAt: Date; lastMonthResetAt: Date } | undefined;
    if (fullName !== undefined) {
      const existing = await this.prisma.profile.findUnique({
        where: { userId },
        select: {
          name: true,
          nameChangeCountDay: true,
          nameChangeCountMonth: true,
          lastDayResetAt: true,
          lastMonthResetAt: true,
        },
      });

      const newName = fullName.trim();
      const oldName = (existing?.name ?? "").trim();
      const nameActuallyChanged = newName !== oldName;

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

      if (nameActuallyChanged) {
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
      }

      const incrementDay = nameActuallyChanged ? 1 : 0;
      const incrementMonth = nameActuallyChanged ? 1 : 0;
      nameUpdate = {
        name: newName,
        nameChangedAt: now,
        nameChangeCountDay: countDay + incrementDay,
        nameChangeCountMonth: countMonth + incrementMonth,
        lastDayResetAt: lastDay,
        lastMonthResetAt: lastMonth,
      };
    }

    const createData: Record<string, unknown> = { userId };
    const updateData: Record<string, unknown> = {};
    if (nameUpdate) {
      createData.name = nameUpdate.name;
      createData.nameChangedAt = nameUpdate.nameChangedAt;
      createData.nameChangeCountDay = nameUpdate.nameChangeCountDay;
      createData.nameChangeCountMonth = nameUpdate.nameChangeCountMonth;
      createData.lastDayResetAt = nameUpdate.lastDayResetAt;
      createData.lastMonthResetAt = nameUpdate.lastMonthResetAt;
      updateData.name = nameUpdate.name;
      updateData.nameChangedAt = nameUpdate.nameChangedAt;
      updateData.nameChangeCountDay = nameUpdate.nameChangeCountDay;
      updateData.nameChangeCountMonth = nameUpdate.nameChangeCountMonth;
      updateData.lastDayResetAt = nameUpdate.lastDayResetAt;
      updateData.lastMonthResetAt = nameUpdate.lastMonthResetAt;
    }
    if (phone !== undefined) {
      createData.phone = phone;
      updateData.phone = phone;
    }
    if (avatarUrl !== undefined) {
      createData.avatarUrl = avatarUrl;
      updateData.avatarUrl = avatarUrl;
    }

    await this.prisma.profile.upsert({
      where: { userId },
      create: createData as any,
      update: Object.keys(updateData).length > 0 ? (updateData as any) : { updatedAt: now },
    });

    try {
      await this.supabaseAuth.updateProfile(userId, {
        full_name: fullName ?? null,
        phone: phone ?? null,
        role: role ?? null,
        avatar_url: avatarUrl ?? null,
      });
    } catch (e) {
      this.logger.warn("Supabase profile sync failed (profile saved in Neon)", e);
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } },
    });

    const name = (profile?.name ?? "").trim() || "";
    const email = profile?.email ?? profile?.user?.email ?? userEmail ?? "";
    const phoneVal = (profile?.phone ?? "").trim() || "";

    return {
      id: userId,
      name,
      avatar: profile?.avatarUrl ?? null,
      email: email ?? "",
      phone: phoneVal,
    };
  }
}
