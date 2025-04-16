import stripe from "@/app/lib/stripe";
import { handleStripeCancelSubscription } from "@/app/server/stripe/handle-cancel-subscription";
import { handleStripePayment } from "@/app/server/stripe/handle-payment";
import { handleStripeSubscription } from "@/app/server/stripe/handle-subscription";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const headersList = await headers();
        const signature = headersList.get("stripe-Signature");

        if (!signature || !secret) {
            return new NextResponse("No signature or secret", { status: 400 });
        }

        const event = stripe.webhooks.constructEvent(body, signature, secret);

        switch (event.type) {
            case "checkout.session.completed": // Pagamento realizado se status = paid (Pode ser pagamento único quanto assinatura)
                const metadata = event.data.object.metadata;

                if (metadata?.price === process.env.STRIPE_PRODUCT_PRICE_ID) {
                    await handleStripePayment(event)
                }

                if (metadata?.price === process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
                    await handleStripeSubscription(event)
                }
                break;

            case "checkout.session.expired":
                console.log("Session expired");    
                break;

            case "checkout.session.async_payment_succeeded": // Boleto pago
                console.log("Payment succeeded");
                break;  

            case "checkout.session.async_payment_failed": // Boleto falhou
                console.log("Payment failed");
                break;
            
            case "customer.subscription.created":  // Criou a assinatura
                console.log("Subscription created");
                break;

            case "customer.subscription.updated": // Atualizou a assinatura
                console.log("Subscription updated");
                break;

            case "customer.subscription.deleted": // Cancelou a assinatura
                await handleStripeCancelSubscription(event)
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
                break;
        }

        return new NextResponse("Webhook received", { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return new NextResponse("Webhook Error", { status: 500 });
    }
}