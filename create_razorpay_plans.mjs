import Razorpay from 'razorpay';

const rp = new Razorpay({
  key_id: 'rzp_test_SmbAK3N0roeIQx',
  key_secret: '7hUADWmFTOAAOYOxLGSaKn1J',
});

async function createPlan(name, amountUSD, description) {
  try {
    const plan = await rp.plans.create({
      period: 'monthly',
      interval: 1,
      item: {
        name,
        amount: amountUSD * 100, // cents
        currency: 'USD',
        description,
      },
    });
    console.log(`Created plan: ${name} -> ${plan.id}`);
    return plan.id;
  } catch (err) {
    console.error(`Error creating ${name}:`, err.error || err.message || err);
    throw err;
  }
}

(async () => {
  console.log('Creating plans...');
  const starterId = await createPlan('Qcanary Starter', 9, '3 projects, 10 queues, 30-day history, Slack/email alerts');
  const proId = await createPlan('Qcanary Pro', 24, 'Unlimited projects/queues, 90-day history, webhook alerts');
  console.log('\n=== PLAN IDs ===');
  console.log(`RAZORPAY_STARTER_PLAN_ID=${starterId}`);
  console.log(`RAZORPAY_PRO_PLAN_ID=${proId}`);
  console.log('=== DONE ===');
})();
