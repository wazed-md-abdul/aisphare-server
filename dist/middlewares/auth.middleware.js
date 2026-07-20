import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth/auth.js";
// Validates the Better Auth session (spec §6.4). Attaches userId or 401s.
export async function requireAuth(req, res, next) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        req.userId = session.user.id;
        next();
    }
    catch (err) {
        console.error("Error in requireAuth middleware:", err);
        res.status(500).json({
            error: "Internal Server Error",
            details: err instanceof Error ? err.message : String(err),
        });
    }
}
//# sourceMappingURL=auth.middleware.js.map