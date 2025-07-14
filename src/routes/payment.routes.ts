import { NextFunction, Request, Response, Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { body } from "express-validator";
import { validate } from "../validators/validate";
import { verifyPaymentsPrivilege } from "../middlewares/privilege.middlewares";
import {
  getOnboardingStatus,
  getPaymentStatus,
  startOnboarding,
  completeOnboarding,
  handlePaymentSuccess,
  createCheckoutSession,
  getPaymentDashboardKPIs,
  getRevenueTrend,
  getTopEarningEvents,
  getTransactionVolumeTrend,
  getRevenueBreakdown,
  getRevenueAnalysis,
  getSocietyPaymentTransactions,
} from "../controllers/payment.controller";

const router = Router();

router.use(verifyJWT);

// Onboarding routes
router.get("/onboarding/status/:societyId", getOnboardingStatus);
router.post(
  "/onboarding/start",
  [
    body("societyId").notEmpty().withMessage("Society Id is required"),
    validate,
    verifyPaymentsPrivilege,
  ],
  startOnboarding
);
router.post(
  "/onboarding/complete",
  [
    body("societyId").notEmpty().withMessage("Society Id is required"),
    validate,
    verifyPaymentsPrivilege,
  ],
  completeOnboarding
);

// payment processing routes
router.post(
  "/create-checkout-session",
  [
    body("eventId").notEmpty().withMessage("Event Id is required"),
    body("registrationId")
      .notEmpty()
      .withMessage("Registration Id is required"),
    validate,
  ],
  createCheckoutSession
);
router.post("/handle-payment-success", handlePaymentSuccess);
router.get("/payment-status/:sessionId", getPaymentStatus);

// Dashboard KPIs
router.get(
  "/dashboard-kpis/:societyId",
  [
    (req: Request, res: Response, next: NextFunction) => {
      req.body.societyId = req.params.societyId;
      next();
    },
    verifyPaymentsPrivilege,
  ],
  getPaymentDashboardKPIs
);

// Revenue Analysis Routes
router.get(
  "/:societyId/revenue-trend",
  [
    (req: Request, res: Response, next: NextFunction) => {
      req.body.societyId = req.params.societyId;
      next();
    },
    verifyPaymentsPrivilege,
  ],
  getRevenueTrend
);
router.get(
  "/:societyId/top-earning-events",
  [
    (req: Request, res: Response, next: NextFunction) => {
      req.body.societyId = req.params.societyId;
      next();
    },
    verifyPaymentsPrivilege,
  ],
  getTopEarningEvents
);
router.get(
  "/:societyId/transaction-volume-trend",
  [
    (req: Request, res: Response, next: NextFunction) => {
      req.body.societyId = req.params.societyId;
      next();
    },
    verifyPaymentsPrivilege,
  ],
  getTransactionVolumeTrend
);
router.get(
  "/:societyId/revenue-breakdown",
  [
    (req: Request, res: Response, next: NextFunction) => {
      req.body.societyId = req.params.societyId;
      next();
    },
    verifyPaymentsPrivilege,
  ],
  getRevenueBreakdown
);
router.get(
  "/:societyId/revenue-analysis",
  [
    (req: Request, res: Response, next: NextFunction) => {
      req.body.societyId = req.params.societyId;
      next();
    },
    verifyPaymentsPrivilege,
  ],
  getRevenueAnalysis
);

// Payment Transactions Routes
router.get(
  "/:societyId/transactions",
  [
    (req: Request, res: Response, next: NextFunction) => {
      req.body.societyId = req.params.societyId;
      next();
    },
    verifyPaymentsPrivilege,
  ],
  getSocietyPaymentTransactions
);
export default router;
