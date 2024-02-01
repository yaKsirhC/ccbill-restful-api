# Unofficial API for the CCBILL RESTful API

## IMPORTANT NOTICE
- This package is in Beta, IF YOU HAVE ANY ISSUES, PLEASE REPORT THEM IN GITHUB!
- I receive no funding to create this, please contribute!

## Usage
-  [One-time Subscriptions](https://github.com/yaKsirhC/ccbill-restful-api/blob/master/examples/oneTimeSubscription.md)
- [Recurring Subscriptions](https://github.com/yaKsirhC/ccbill-restful-api/blob/master/examples/recurringSubscription.md)
- ## Custom Subscriptions 
```ts
const ccbill = await ccbillGateway
	.create(
		FRONTEND_USERNAME, 
		FRONTEND_PASSWORD, 
		BACKEND_USERNAME, 
		BACKEND_PASSWORD, 
		CLIENT_ACCOUNT_NUMBER, 
		CLIENT_SUBACCOUNT_NUMBER
	);

const paymentTokenId = await ccbill.createPaymentToken(
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

await ccbill.createAndChargePayment(paymentTokenId.paymentTokenId as string, {
  initialPeriod: 3,
  initialPrice: 0,
  recurringPeriod: 30,
  recurringPrice: 9.99,
  rebills: 99,
  createNewPaymentToken: false,
  lifeTimeSubscription: false,
  passThroughInfo: [],
});
```

### TODOs:

- Add support for Production Environment
- Improve Error Handling
