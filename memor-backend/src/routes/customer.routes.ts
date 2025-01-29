import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";

const router = Router();

// Create or retrieve a customer
router.post("/", CustomerController.createOrRetrieveCustomer);

export const customerRoutes = router;
