"use client"

import useMercadoPago from "@/app/hooks/useMercadoPago";
import { useStripe } from "@/app/hooks/useStripe";

export default function Payments() {

    const { 
        createPaymentStripeCheckout, 
        createSubscriptionStripeCheckout, 
        handleCreateStripePortal
    } = useStripe()

    const { createMercadoPagoCheckout } = useMercadoPago()

    return (
        <div className="flex flex-col gap-10 items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-5">Pagamentos</h1>
            
            <div className="flex flex-row gap-4">
                <button 
                    className="border rounded-md px-1 cursor-pointer" 
                    onClick={() => {
                        createPaymentStripeCheckout({
                            testeId: "123",
                        })
                }}>
                    Criar Pagamento Stripe
                </button>

                <button 
                    className="border rounded-md px-1 cursor-pointer" 
                    onClick={() => {
                        createSubscriptionStripeCheckout({
                            testeId: "123",
                        })
                }}>
                    Criar Assinatura Stripe
                </button>
                
                <button className="border rounded-md px-1 cursor-pointer" onClick={handleCreateStripePortal}>
                    Criar Portal de Pagamentos
                </button>
            </div>

            <button 
                className="border rounded-md px-1 cursor-pointer" 
                onClick={() => {
                    createMercadoPagoCheckout({
                        testeId: "123",
                        userEmail: "teste@email.com"

                    })
            }}>
                Criar Pagamento MercadoPago
            </button>
        </div>
    );
}