type paymentTokenID = string;
export declare namespace CCBILL {
    interface customerInfo {
        customerFname: string;
        customerLname: string;
        zipcode: string;
        address1: string;
        city: string;
        country: string;
        ipAddress: string;
        email: string;
        address2?: string;
        state?: string;
        browserHttpUserAgent?: string;
        browserHttpAccept?: string;
        browserHttpAcceptLanguage?: string;
        browserHttpAcceptEncoding?: string;
    }
    interface customerInfoAPI {
        customerFname: string;
        customerLname: string;
        zipcode: string;
        address1: string;
        city: string;
        country: string;
        ipAddress: string;
        email: string;
        address2: string;
        state: string;
        browserHttpUserAgent: string;
        browserHttpAccept: string;
        browserHttpAcceptLanguage: string;
        browserHttpAcceptEncoding: string;
    }
    interface paymentInfo {
        cardNum: string;
        nameOnCard: string;
        expMonth: string;
        expYear: string;
        cvv2: string;
    }
    interface createPaymentTokenOptions {
        timeToLive: 30 | number;
        validNumberOfUse: 3 | number;
    }
    interface createPaymentTokenParams extends createPaymentTokenOptions {
        subscriptionId: number;
        clientAccnum: number;
        clientSubacc: number;
        customerInfo: customerInfoAPI;
        paymentInfo: {
            creditCardPaymentInfo: paymentInfo;
        };
    }
    interface chargePaymentParams {
        initialPrice: number;
        initialPeriod: number;
        currencyCode?: number;
        recurringPrice?: number;
        recurringPeriod?: number;
        rebills?: number;
        lifeTimeSubscription?: boolean;
        createNewPaymentToken?: boolean;
        passThroughInfo?: Array<any>;
    }
    interface chargePaymentAPI {
        clientAccnum: number;
        clientSubacc: number;
        initialPrice: number;
        initialPeriod: number;
        currencyCode?: number;
        recurringPrice?: number;
        recurringPeriod?: number;
        rebills?: number;
        lifeTimeSubscription?: boolean;
        createNewPaymentToken?: boolean;
        passThroughInfo?: Array<any>;
    }
    interface completedPaymentResponse {
        declineCode: null | number;
        declineText: null | string;
        denialId: null | string;
        approved: boolean;
        paymentUniqueId: string;
        sessionId: null | string;
        subscriptionId: number;
        newPaymentTokenId: null | string;
    }
    interface paymentTokenResponse {
        paymentTokenId: string;
        programParticipationId: null | number;
        originalPaymentTokenId: null | string;
        clientAccnum: number;
        clientSubacc: number;
        createdDatetime: string;
        timeToLive: number;
        validNumberOfUse: number;
        paymentInfoId: null | string;
        subscriptionId: string;
        errors: any;
    }
}
export declare namespace PaymentTypes {
    class recurringSubscription implements CCBILL.chargePaymentParams {
        initialPeriod: number;
        initialPrice: number;
        createNewPaymentToken?: boolean | undefined;
        lifeTimeSubscription?: boolean | undefined;
        recurringPrice?: number | undefined;
        rebills?: number | undefined;
        recurringPeriod?: number | undefined;
        currencyCode?: number | undefined;
        passThroughInfo?: any[] | undefined;
        /**
         *
         * @param rebills how many rebills the subscription should last
         * @param passThroughInfo any info
         * @param recurringPeriodInDays
         * @param recurringPriceInUSD
         * @param initalPeriodInDays
         * @param initalPriceInUSD
         */
        constructor(recurringPeriodInDays: number, recurringPriceInUSD: number, initalPeriodInDays?: number, initalPriceInUSD?: number, rebills?: number, passThroughInfo?: Array<any>);
    }
    class oneTimeSubscription implements CCBILL.chargePaymentParams {
        initialPeriod: number;
        initialPrice: number;
        createNewPaymentToken?: boolean | undefined;
        lifeTimeSubscription?: boolean | undefined;
        recurringPrice?: number | undefined;
        rebills?: number | undefined;
        recurringPeriod?: number | undefined;
        currencyCode?: number | undefined;
        passThroughInfo?: any[] | undefined;
        constructor(price: number, passThroughInfo?: Array<any>);
    }
}
declare class ccbillGateway {
    #private;
    /**
     * Unofficial Nodejs api for handling CCBILL via the restful APIs.
     * @see [General Documentation](https://ccbill.com/doc/ccbill-restful-api-resources)
     * @see [Thorough Documentation of APIs](https://github.com/CCBill/restful-api-guide?tab=readme-ov-file)
     *
     * @param username The username can be also refered as: MearchantID, Merchant Application ID
     */
    constructor(frontendBearerToken: string, backendBearerToken: string, clientAccnum: number, clientSubacc: number);
    static create(frontendUsername: string, FrontendPassword: string, backendUsername: string, backendPassword: string, clientAccnum: number, clientSubacc: number): Promise<ccbillGateway>;
    /**
      * This will validate the field options and return a token to charge and complete the payment later.
      *
      @see https://ccbill.com/doc/ccbill-restful-api-resources
      
      * A DOMAIN NAME IS REQUIRED AND MUST BE AUTHORIZED BY CCBILL. YOU CAN NOT MAKE REQUESTS FROM YOUR HOME IP WITHOUT A DOMAIN NAME
  
      @see https://github.com/CCBill/restful-api-guide?tab=readme-ov-file#request-parameters
  
    */
    createPaymentToken(customerData: CCBILL.customerInfo, paymentData: CCBILL.paymentInfo, options?: CCBILL.createPaymentTokenOptions): Promise<CCBILL.paymentTokenResponse>;
    /**
     * After you have generated a bearer token and a payment token ID, you can use these two tokens to charge the consumer’s credit card.
     * YOU NEED TO GET YOUR SERVER OR HOME IP WHITELISTED AND A DATALINK USER SO TO ACCESS THIS ENDPOINT ELSE YOU WILL GET A: 100106 CODE
   
      @see https://github.com/CCBill/restful-api-guide?tab=readme-ov-file#request-parameters
     */
    createAndChargePayment(paymentTokenID: paymentTokenID, details: CCBILL.chargePaymentParams): Promise<CCBILL.completedPaymentResponse>;
    createRecurringSubscription(paymentTokenID: paymentTokenID, recurringSubscriptionObject: PaymentTypes.recurringSubscription): Promise<void>;
    createOneTimeSubscription(paymentTokenID: paymentTokenID, oneTimeSubscription: PaymentTypes.oneTimeSubscription): Promise<void>;
}
export default ccbillGateway;
