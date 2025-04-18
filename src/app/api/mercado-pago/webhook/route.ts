import { mpClient, validateMercadoPagoWebhook } from "@/app/lib/mercado-pago";
import { handleMercadoPagaoPayment } from "@/app/server/mercado-pago/handle-payment";
import { Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {
        validateMercadoPagoWebhook(request)

        const body = await request.json()
        const { type, data } = body

        switch (type) {
            case "payment":
                const payment = new Payment(mpClient)
                const paymentData = await payment.get({ id: data.id })
                if (paymentData.status === "approved" || paymentData.date_approved !== null) {
                    await handleMercadoPagaoPayment(paymentData)
                }
                break;
            case "subscription_preapproval":
                break;
            default: 
                console.log("Unhandled webhook type:", type)
                break;
        }

        return NextResponse.json({received: true}, { status: 200 })
    } catch (error) {
        console.error("Error handling webhook:", error)
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
    }
}