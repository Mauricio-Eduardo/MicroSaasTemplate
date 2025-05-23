import { mpClient } from "@/app/lib/mercado-pago";
import { Preference } from "mercadopago";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { testeId, userEmail } = await request.json();

  try {
    const preference = new Preference(mpClient)

    const createdPreference = await preference.create({
        body: {
            external_reference: testeId, // Id do pedido
            metadata: {
                testeId, // Essa variável é convertidfa para snake_case -> teste
                userEmail,
            },
            ...(userEmail && { payer: { email: userEmail }}),
            items: [
                {
                    id: "",
                    description: "",
                    title: "",
                    quantity: 1,
                    unit_price: 1,
                    currency_id: "BRL",
                    category_id: "services",
                }
            ],
            payment_methods: {
                installments: 10, // Número de parcelas
            },
            auto_return: "approved",
            back_urls: {
                success: `${request.headers.get("origin")}/api/mercado-pago/pending`,
                failure: `${request.headers.get("origin")}/api/mercado-pago/pending`,
                pending: `${request.headers.get("origin")}/api/mercado-pago/pending`,
            },
        }
    })

    if (!createdPreference.id) {
      return new Response("Preference ID not found", { status: 500 });
    }

    return new Response(JSON.stringify({ 
        preferenceId: createdPreference.id,
        initPoint: createdPreference.init_point 
    }))


  } catch (error) {
    console.error("Error creating Mercado Pago preference:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}