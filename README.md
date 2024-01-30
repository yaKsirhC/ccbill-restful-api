# Unofficial API for the CCBILL RESTful API
## Please Contribute!
### Basic Usage
```ts
const ccbill = await ccbillGateway.create("34618470599e11eabb010050569d23bb", "JQX7mwuiaVRmBn0b9K9wfPska", "315fdb7a599c11eabb010050569d23bb", "awdDEAkcaDZZS1lC6P7muOGup", 951908, 131);

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
