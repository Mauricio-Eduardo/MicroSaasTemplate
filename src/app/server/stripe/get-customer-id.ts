import "server-only";

import { db } from "@/app/lib/firebase";
import stripe from "@/app/lib/stripe";

export async function getOrCreateCustomer(userId: string, userEmail: string) {
    try {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new Error("User not found");
        }

        const stripeCustomerId = userDoc.data()?.stripeCustomerId;

        if (stripeCustomerId) {
            return stripeCustomerId;
        }

        // Create a new customer in Stripe if it doesn't exist
        const userName = userDoc.data()?.name;

        const customer = await stripe.customers.create({
            email: userEmail,
            ...(userName && { name: userName }),
            metadata: {
                userId,
            },
        });

        await userRef.update({ stripeCustomerId: customer.id });

        return customer.id;

    } catch (error) {
        console.error("Error getting or creating customer:", error);
        throw new Error("Error getting or creating customer");
    }
}