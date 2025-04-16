import stripe from "@/app/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { testeId, userEmail } = await request.json();

    const price = process.env.STRIPE_PRODUCT_PRICE_ID;

    if (!price) {
        return new NextResponse(JSON.stringify({ error: "Price not found" }), {status: 500}); 
    }

    const metadata = {
        testeId,
        price
    }

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: price,
                    quantity: 1,
                },
            ],            
            mode: "payment",
            payment_method_types: ["card","boleto"],
            success_url: `${request.headers.get("origin")}/success`,
            cancel_url: `${request.headers.get("origin")}/`,
            ...(userEmail && { customer_email: userEmail }),
            metadata
        });

        if (!session.url) {
            return new NextResponse(JSON.stringify({ error: "Session URL not found" }), {status: 500});
        }

        return new NextResponse(JSON.stringify({ sessionId: session.id }), {status: 200})

    } catch (error) {
        console.error("Error creating Stripe Checkout session:", error);
        return NextResponse.error();
    }
}