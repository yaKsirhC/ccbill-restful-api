# Create and Charge a Payment With Most Control

## Requirements
- A Domain Name Authorized ( Whitelisted ) by CCBILL
- An IP Authorized ( Whitelisted ) by CCBILL 
- Datalink User ( Visit CCBILL Live Support for details )

## Links
- [CCBILL Live Support](https://admin.ccbill.com/adminPortalLiveChat.html)
- [CCBILL Thorough Documentation](https://github.com/CCBill/restful-api-guide?tab=readme-ov-file#request-parameters)

## Example
```ts
import dotenv from 'dotenv';
import ccbillGateway from 'ccbill-restful-api';
dotenv.config();

async function run(){
	const ccbill = await ccbillGateway
		.create(
			process.env.FRONTEND_USERNAME, 
			process.env.FRONTEND_PASSWORD, 
			process.env.BACKEND_USERNAME, 
			process.env.BACKEND_PASSWORD, 
			process.env.CLIENT_ACCOUNT_NUMBER, 
			process.env.CLIENT_SUBACCOUNT_NUMBER
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
}

run();
```