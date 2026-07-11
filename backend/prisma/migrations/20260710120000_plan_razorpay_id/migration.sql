-- Cache the Razorpay plan id on each plan so we don't recreate it on every checkout.
ALTER TABLE "plans" ADD COLUMN "razorpayPlanId" TEXT;
