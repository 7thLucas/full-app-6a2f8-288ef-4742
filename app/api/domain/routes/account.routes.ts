import { Router, type Request, type Response } from "express";
import { AuthService } from "~/modules/authentication/authentication.service";
import { signJwt, buildAuthCookie } from "~/modules/authentication/authentication.server";
import { requireAuth } from "~/modules/authentication/authentication.middleware";
import { UserModel } from "~/modules/authentication/authentication.model";
import { UserRole } from "~/modules/authentication/authentication.types";
import { AppRole } from "../marketplace.types";

const router = Router();

function resolveAppRole(user: { role?: string; profile?: Record<string, any> }): AppRole {
  if (user.role === UserRole.Admin) return AppRole.Admin;
  return user.profile?.appRole === AppRole.ShopOwner ? AppRole.ShopOwner : AppRole.Customer;
}

/**
 * Register a customer or shop owner. Wraps the auth module's register so we can
 * attach the app-level role + profile fields the marketplace needs.
 */
router.post("/account/register", async (req: Request, res: Response) => {
  try {
    const b = req.body ?? {};
    const requestedRole = b.appRole === AppRole.ShopOwner ? AppRole.ShopOwner : AppRole.Customer;

    const user = await AuthService.register({
      username: String(b.username ?? ""),
      email: String(b.email ?? ""),
      password: String(b.password ?? ""),
    });

    await UserModel.findByIdAndUpdate(user.id, {
      $set: {
        "profile.appRole": requestedRole,
        "profile.fullName": b.fullName ?? user.username,
        "profile.phone": b.phone ?? "",
      },
    });

    const token = signJwt({
      sub: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
      email_verified: user.email_verified,
    });
    res.setHeader("Set-Cookie", buildAuthCookie(token, req.hostname));
    res.status(201).json({ success: true, data: { ...user, appRole: requestedRole } });
  } catch (e: any) {
    res.status(e.statusCode ?? 500).json({ success: false, message: e.message ?? "Registration failed" });
  }
});

/** Current user enriched with resolved app role + profile. */
router.get("/account/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.user!.id)
      .select("username email role profile is_active createdAt")
      .lean();
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({
      success: true,
      data: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        appRole: resolveAppRole(user),
        profile: user.profile ?? {},
        is_active: user.is_active,
        createdAt: user.createdAt,
      },
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Update profile (name, phone, address). */
router.patch("/account/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const b = req.body ?? {};
    const set: Record<string, any> = {};
    ["fullName", "phone", "address", "avatarUrl"].forEach((k) => {
      if (b[k] !== undefined) set[`profile.${k}`] = b[k];
    });
    const user = await UserModel.findByIdAndUpdate(req.user!.id, { $set: set }, { new: true })
      .select("username email role profile is_active")
      .lean();
    res.json({ success: true, data: user });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
