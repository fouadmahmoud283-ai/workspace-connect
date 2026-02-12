import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// FawryPay endpoints
const FAWRY_STAGING_URL = 'https://atfawry.fawrystaging.com/ECommerceWeb/api/payments/charge';
const FAWRY_PRODUCTION_URL = 'https://www.atfawry.com/ECommerceWeb/api/payments/charge';

// Use staging for development
const FAWRY_API_URL = Deno.env.get('FAWRY_PRODUCTION') === 'true' ? FAWRY_PRODUCTION_URL : FAWRY_STAGING_URL;

interface PaymentRequest {
  planId: string;
  planName: string;
  amount: number;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  paymentType: 'qr' | 'r2p';
}

// Generate SHA-256 signature
async function generateSignature(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate unique merchant reference number
function generateMerchantRefNum(): string {
  return `MRN${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claims.claims.sub as string;
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Handle different endpoints
    if (req.method === 'POST' && path === 'fawrypay') {
      const body = await req.json() as PaymentRequest;
      return await handlePayment(supabase, userId, body);
    }

    if (req.method === 'POST' && path === 'webhook') {
      // Handle FawryPay webhook (for payment confirmation)
      return await handleWebhook(supabase, await req.json());
    }

    if (req.method === 'GET' && path === 'status') {
      const merchantRefNum = url.searchParams.get('merchantRefNum');
      if (!merchantRefNum) {
        return new Response(
          JSON.stringify({ error: 'merchantRefNum is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return await getPaymentStatus(supabase, merchantRefNum);
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('FawryPay error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handlePayment(supabase: any, userId: string, body: PaymentRequest) {
  const merchantCode = Deno.env.get('FAWRY_MERCHANT_CODE');
  const secureKey = Deno.env.get('FAWRY_SECURE_KEY');

  if (!merchantCode || !secureKey) {
    console.error('Missing FawryPay credentials');
    return new Response(
      JSON.stringify({ error: 'Payment configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const merchantRefNum = generateMerchantRefNum();
  const amount = body.amount.toFixed(2);

  // Generate signature based on payment type
  let signatureData: string;
  if (body.paymentType === 'r2p') {
    // R2P signature: merchantCode + merchantRefNum + customerProfileId + paymentMethod + amount + debitMobileWalletNo + secureKey
    signatureData = `${merchantCode}${merchantRefNum}${userId}MWALLET${amount}${body.customerMobile}${secureKey}`;
  } else {
    // QR signature: merchantCode + merchantRefNum + customerProfileId + paymentMethod + amount + secureKey
    signatureData = `${merchantCode}${merchantRefNum}${userId}MWALLET${amount}${secureKey}`;
  }

  const signature = await generateSignature(signatureData);

  // Build FawryPay request
  const fawryRequest: any = {
    merchantCode,
    merchantRefNum,
    customerProfileId: userId,
    paymentMethod: 'MWALLET',
    customerName: body.customerName,
    customerMobile: body.customerMobile,
    customerEmail: body.customerEmail,
    amount: parseFloat(amount),
    currencyCode: 'EGP',
    description: `Membership: ${body.planName}`,
    language: 'en-gb',
    chargeItems: [
      {
        itemId: body.planId,
        description: body.planName,
        price: parseFloat(amount),
        quantity: 1
      }
    ],
    signature
  };

  // Add R2P specific field
  if (body.paymentType === 'r2p') {
    fawryRequest.debitMobileWalletNo = body.customerMobile;
  }

  console.log('Sending FawryPay request:', JSON.stringify({ ...fawryRequest, signature: '[REDACTED]' }));

  // Call FawryPay API
  const response = await fetch(FAWRY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fawryRequest),
  });

  const fawryResponse = await response.json();
  console.log('FawryPay response:', fawryResponse);

  if (fawryResponse.statusCode !== 200) {
    return new Response(
      JSON.stringify({ 
        error: fawryResponse.statusDescription || 'Payment failed',
        code: fawryResponse.statusCode 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create subscription record
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: body.planId,
      status: 'pending',
      fawry_reference: fawryResponse.referenceNumber
    })
    .select()
    .single();

  if (subError) {
    console.error('Error creating subscription:', subError);
  }

  // Create payment record
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      subscription_id: subscription?.id,
      amount: parseFloat(amount),
      status: 'pending',
      fawry_reference: fawryResponse.referenceNumber,
      merchant_ref_num: merchantRefNum
    });

  if (paymentError) {
    console.error('Error creating payment record:', paymentError);
  }

  return new Response(
    JSON.stringify({
      success: true,
      referenceNumber: fawryResponse.referenceNumber,
      merchantRefNum: fawryResponse.merchantRefNumber,
      walletQr: fawryResponse.walletQr, // Base64 QR code for QR payments
      subscriptionId: subscription?.id
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleWebhook(supabase: any, body: any) {
  console.log('FawryPay webhook received:', body);

  const { merchantRefNum, orderStatus, fawryRefNumber } = body;

  if (!merchantRefNum) {
    return new Response(
      JSON.stringify({ error: 'Invalid webhook payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Update payment status
  const paymentStatus = orderStatus === 'PAID' ? 'completed' : 
                        orderStatus === 'EXPIRED' ? 'failed' : 
                        orderStatus === 'REFUNDED' ? 'refunded' : 'pending';

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .update({ 
      status: paymentStatus,
      fawry_reference: fawryRefNumber
    })
    .eq('merchant_ref_num', merchantRefNum)
    .select()
    .single();

  if (paymentError) {
    console.error('Error updating payment:', paymentError);
  }

  // Update subscription if payment completed
  if (payment && orderStatus === 'PAID') {
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString()
      })
      .eq('id', payment.subscription_id);

    // Get subscription details to update user profile
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_id, user_id')
      .eq('id', payment.subscription_id)
      .single();

    if (subscription) {
      const { data: plan } = await supabase
        .from('membership_plans')
        .select('name, credits_per_month')
        .eq('id', subscription.plan_id)
        .single();

      if (plan) {
        // Update user's membership type and credits
        await supabase
          .from('profiles')
          .update({
            membership_type: plan.name.toLowerCase(),
            credits: plan.credits_per_month
          })
          .eq('user_id', subscription.user_id);

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: subscription.user_id,
            title: 'Payment Successful',
            message: `Your ${plan.name} membership is now active!`,
            type: 'payment'
          });
      }
    }
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getPaymentStatus(supabase: any, merchantRefNum: string) {
  const { data: payment, error } = await supabase
    .from('payments')
    .select('*, subscriptions(*)')
    .eq('merchant_ref_num', merchantRefNum)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Payment not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify(payment),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
