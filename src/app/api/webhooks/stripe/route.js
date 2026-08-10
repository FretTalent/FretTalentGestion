import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase"; // Utilisation directe pour la mise à jour (ou via le client d'admin)

export async function POST(req) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Gérer l'événement Stripe
  try {
    switch (event.type) {
      case "setup_intent.succeeded":
        const setupIntent = event.data.object;
        const customerId = setupIntent.customer;
        
        // Mettre à jour has_payment_method pour l'entreprise correspondante
        if (customerId) {
          await supabase
            .from("companies")
            .update({ has_payment_method: true })
            .eq("stripe_customer_id", customerId);
        }
        break;

      case "invoice.payment_succeeded":
        // Traitement optionnel de la confirmation de paiement mensuelle
        break;

      case "invoice.payment_failed":
        // Alerte de litige de prélèvement
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (dbErr) {
    console.error("Database update error on webhook:", dbErr);
  }

  return NextResponse.json({ received: true });
}
