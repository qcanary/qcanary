const Razorpay = require('razorpay');

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
        amount: amountUSD * 100,
        currency: 'USD',
        description,
      },
    });
    console.log(`OK: ${name} -> ${plan.id}`);
    return plan.id;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error('Error:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    throw err;
  }
}

(async () => {
  try {
    const sid = await createPlan('Qcanary Starter', 9,
      '3 projects, 10 queues, 30-day history, Slack/email alerts');
    const pid = await createPlan('Qcanary Pro', 24,
      'Unlimited projects/queues, 90-day history, webhook alerts');
    console.log('\nRAZORPAY_STARTER_PLAN_ID=' + sid);
    console.log('RAZORPAY_PRO_PLAN_ID=' + pid);
  } catch (e) {
    process.exit(1);
  }
})();
