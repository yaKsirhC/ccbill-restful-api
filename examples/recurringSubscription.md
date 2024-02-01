# Create and Charge a Recurring Subscription With High Level APIs

## Requirements
- A Domain Name Authorized ( Whitelisted ) by CCBILL
- An IP Authorized ( Whitelisted ) by CCBILL
- Datalink User ( Visit CCBILL Live Support for details )

## Notes
- Common Periods include: 30D-180D. If You Try Any Other Periods, You Might Encounter Errors.
You Need to Contact Support to be Given Permission to Use Your Period.

## Links

- [CCBILL Live Support](https://admin.ccbill.com/adminPortalLiveChat.html)
- [CCBILL Thorough Documentation](https://github.com/CCBill/restful-api-guide?tab=readme-ov-file#request-parameters)

## Example

```ts
import dotenv from "dotenv";
import ccbillGateway, { PaymentTypes } from "ccbill-restful-api";
dotenv.config();

async function run() {
  const ccbill = await ccbillGateway
	.create(
		process.env.FRONTEND_USERNAME, 
		process.env.FRONTEND_PASSWORD, 
		process.env.BACKEND_USERNAME, 
		process.env.BACKEND_PASSWORD, 
		process.env.CLIENT_ACCOUNT_NUMBER, 
		process.env.CLIENT_SUBACCOUNT_NUMBER
	);
  const paymentTokenResponse = await ccbill.createPaymentToken(
    {
      customerFname: "Vin",
      customerLname: "Stu",
      address1: "3402 E University Dr",
      city: "Phoenix",
      zipcode: "85034",
      country: "US",
      email: "fk@gmail.com",
      ipAddress: "10.70.60.14",
      // state: "AZ",
    },
    {
      cardNum: "3530111333300000",
      nameOnCard: "Vin Stu",
      expMonth: "08",
      expYear: "2026",
      cvv2: "822",
    }
  );

  const recurringSubscription = new PaymentTypes.recurringSubscription({
    recurringPeriodInDays: 30,
    recurringPriceInUSD: 20,
    initalPeriodInDays: 7, // Optional
    initalPriceInUSD: 0, // Optional, 7 days for $0 (aka free trial)
    rebills: 4, // Optional, How many rebills until cancelled (1 initial + 3 recurring = 7D + 3*30D)
    passThroughInfo: [
      {
        customerID: 1234,
        foo: "bar",
      },
    ],
  });

  ccbill.createRecurringSubscription(
	paymentTokenResponse.paymentTokenId, 
	recurringSubscription
  );

}

run();
```
