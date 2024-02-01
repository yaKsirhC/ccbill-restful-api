import axios, { Axios, AxiosResponse } from "axios";
const CCBILL_AUTHTOKEN_URL = "https://api.ccbill.com/ccbill-auth/oauth/token?grant_type=client_credentials";
const CCBILL_CREATE_PAYMENT_TOKEN_URL = "https://api.ccbill.com/payment-tokens/merchant-only";
const CCBILL_CHARGE_PAYMENT_URL_TEMPLATE = "https://api.ccbill.com/transactions/payment-tokens";
const USD_ISO_CODE = 840;

type paymentTokenID = string;

export namespace CCBILL {
  export interface customerInfo {
    customerFname: string;
    customerLname: string;
    zipcode: string;
    address1: string;
    city: string;
    country: string;
    ipAddress: string;
    // phoneNumber: string;
    email: string;

    address2?: string;
    state?: string;

    browserHttpUserAgent?: string;
    browserHttpAccept?: string;
    browserHttpAcceptLanguage?: string;
    browserHttpAcceptEncoding?: string;
  }

  export interface customerInfoAPI {
    customerFname: string;
    customerLname: string;
    zipcode: string;
    address1: string;
    city: string;
    country: string;
    ipAddress: string;
    // phoneNumber: string;
    email: string;

    address2: string;
    state: string;

    browserHttpUserAgent: string;
    browserHttpAccept: string;
    browserHttpAcceptLanguage: string;
    browserHttpAcceptEncoding: string;
  }

  export interface paymentInfo {
    cardNum: string;
    nameOnCard: string;
    expMonth: string;
    expYear: string;
    cvv2: string;
  }

  export interface createPaymentTokenOptions {
    timeToLive: 30 | number;
    validNumberOfUse: 3 | number;
  }

  export interface createPaymentTokenParams extends createPaymentTokenOptions {
    subscriptionId: number;
    clientAccnum: number;
    clientSubacc: number;
    customerInfo: customerInfoAPI;
    paymentInfo: { creditCardPaymentInfo: paymentInfo };
  }

  export interface chargePaymentParams {
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

  export interface chargePaymentAPI {
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

  export interface completedPaymentResponse {
    declineCode: null | number;
    declineText: null | string;
    denialId: null | string;
    approved: boolean;
    paymentUniqueId: string;
    sessionId: null | string;
    subscriptionId: number;
    newPaymentTokenId: null | string;
  }

  export interface paymentTokenResponse {
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

export namespace PaymentTypes {
  export interface recurringSubscriptionParams {
    recurringPeriodInDays: number;
    recurringPriceInUSD: number;
    initalPeriodInDays?: number;
    initalPriceInUSD?: number;
    rebills?: number;
    passThroughInfo?: Array<any>;
  }

  export interface oneTimeSubscriptionParams {
    price: number;
    passThroughInfo?: Array<any>;
  }

  export class recurringSubscription implements CCBILL.chargePaymentParams {
    initialPeriod: number;
    initialPrice: number;
    createNewPaymentToken?: boolean | undefined;
    lifeTimeSubscription?: boolean | undefined;
    recurringPrice?: number | undefined;
    rebills?: number | undefined;
    recurringPeriod?: number | undefined;
    currencyCode?: number | undefined;
    passThroughInfo?: any[] | undefined;

    constructor(recurringSubscriptionParams: recurringSubscriptionParams) {
      this.initialPeriod = recurringSubscriptionParams.initalPeriodInDays ?? recurringSubscriptionParams.recurringPeriodInDays;
      this.initialPrice = recurringSubscriptionParams.initalPriceInUSD ?? recurringSubscriptionParams.recurringPriceInUSD;
      this.recurringPeriod = recurringSubscriptionParams.recurringPeriodInDays;
      this.recurringPrice = recurringSubscriptionParams.recurringPriceInUSD;
      this.passThroughInfo = recurringSubscriptionParams.passThroughInfo;
      this.rebills = recurringSubscriptionParams.rebills ?? 99;
      this.lifeTimeSubscription = false;
      this.currencyCode = 840;
      this.createNewPaymentToken = false;
    }
  }

  export class oneTimeSubscription implements CCBILL.chargePaymentParams {
    initialPeriod: number;
    initialPrice: number;
    createNewPaymentToken?: boolean | undefined;
    lifeTimeSubscription?: boolean | undefined;
    recurringPrice?: number | undefined;
    rebills?: number | undefined;
    recurringPeriod?: number | undefined;
    currencyCode?: number | undefined;
    passThroughInfo?: any[] | undefined;

    constructor(oneTimeSubscriptionParams:oneTimeSubscriptionParams) {
      this.initialPeriod = 2; // random number, it doenst matter
      this.initialPrice = oneTimeSubscriptionParams.price;
      this.passThroughInfo = oneTimeSubscriptionParams.passThroughInfo;
      this.recurringPeriod = 0;
      this.recurringPrice = 0;
      this.rebills = 0;
      this.lifeTimeSubscription = true;
      this.currencyCode = 840;
      this.createNewPaymentToken = false;
    }
  }
}

class ccbillGateway {
  #frontendBearerToken: string | undefined;
  #backendBearerToken: string | undefined;
  #clientAccnum: number;
  #clientSubaccnum: number;

  /**
   * Unofficial Nodejs api for handling CCBILL via the restful APIs.
   * @see [General Documentation](https://ccbill.com/doc/ccbill-restful-api-resources)
   * @see [Thorough Documentation of APIs](https://github.com/CCBill/restful-api-guide?tab=readme-ov-file)
   *
   * @param username The username can be also refered as: MearchantID, Merchant Application ID
   */
  constructor(frontendBearerToken: string, backendBearerToken: string, clientAccnum: number, clientSubacc: number) {
    this.#clientAccnum = clientAccnum;
    this.#clientSubaccnum = clientSubacc;
    this.#frontendBearerToken = frontendBearerToken;
    this.#backendBearerToken = backendBearerToken;
  }
  /*
   * Creates the CCBILL instance with the proper authorization.
   */
  static async create(frontendUsername: string, FrontendPassword: string, backendUsername: string, backendPassword: string, clientAccnum: number, clientSubacc: number): Promise<ccbillGateway> {
    // FETCHING FRONTEND BEARER TOKEN

    const frontendBearerTokenRes = await axios
      .post<any>(
        CCBILL_AUTHTOKEN_URL,
        {}, // BODY/DATA
        {
          // HEADERS
          auth: {
            // AUTH
            username: frontendUsername,
            password: FrontendPassword,
          },
        }
      )
      .catch((err) => {
        console.error("[ERROR] error while fetching bearerToken: ", err);
      });

    // FETCHING BACKEND BEARER TOKEN

    const backendBearerTokenRes = await axios
      .post<any>(
        CCBILL_AUTHTOKEN_URL,
        {}, // BODY/DATA
        {
          // HEADERS
          auth: {
            // AUTH
            username: backendUsername,
            password: backendPassword,
          },
        }
      )
      .catch((err) => {
        console.error("[ERROR] error while fetching bearerToken: ", err);
      });
    // TODO! Improve Error handling, types
    return new ccbillGateway((frontendBearerTokenRes as AxiosResponse<any>).data.access_token, (backendBearerTokenRes as AxiosResponse<any>).data.access_token, clientAccnum, clientSubacc);
  }
  /**
    * This will validate the field options and return a token to charge and complete the payment later.
    * 
    @see https://ccbill.com/doc/ccbill-restful-api-resources
    
    * A DOMAIN NAME IS REQUIRED AND MUST BE AUTHORIZED BY CCBILL. YOU CAN NOT MAKE REQUESTS FROM YOUR HOME IP WITHOUT A DOMAIN NAME

    @see https://github.com/CCBill/restful-api-guide?tab=readme-ov-file#request-parameters

  */
  async createPaymentToken(customerData: CCBILL.customerInfo, paymentData: CCBILL.paymentInfo, options?: CCBILL.createPaymentTokenOptions): Promise<CCBILL.paymentTokenResponse> {
    options = options ? options : { timeToLive: 30, validNumberOfUse: 3 };

    const data: CCBILL.createPaymentTokenParams = {
      clientAccnum: this.#clientAccnum,
      clientSubacc: this.#clientSubaccnum,
      customerInfo: {
        customerFname: customerData.customerFname,
        customerLname: customerData.customerLname,
        address1: customerData.address1,
        address2: customerData.address2 ?? "",
        city: customerData.city,
        state: customerData.state ?? "",
        zipcode: customerData.zipcode,
        country: customerData.country,
        email: customerData.email,
        ipAddress: customerData.ipAddress,
        browserHttpAccept: customerData.browserHttpAccept ?? "",
        browserHttpAcceptEncoding: customerData.browserHttpAcceptEncoding ?? "",
        browserHttpAcceptLanguage: customerData.browserHttpAcceptLanguage ?? "",
        browserHttpUserAgent: customerData.browserHttpUserAgent ?? "",
        // phoneNumber: customerData.phoneNumber,
      },

      paymentInfo: { creditCardPaymentInfo: paymentData },
      subscriptionId: 0,
      ...options,
    };

    const result = await axios.post<CCBILL.paymentTokenResponse>(CCBILL_CREATE_PAYMENT_TOKEN_URL, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.mcn.transaction-service.api.v.2+json",
        Authorization: `Bearer ${this.#frontendBearerToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36",
      },
    });
    // console.log(result.data);
    return result.data;
  }

  /**
   * After you have generated a bearer token and a payment token ID, you can use these two tokens to charge the consumer’s credit card.
   * YOU NEED TO GET YOUR SERVER OR HOME IP WHITELISTED AND A DATALINK USER SO TO ACCESS THIS ENDPOINT ELSE YOU WILL GET A: 100106 CODE
 
    @see https://github.com/CCBill/restful-api-guide?tab=readme-ov-file#request-parameters
   */
  async createAndChargePayment(paymentTokenID: paymentTokenID, details: CCBILL.chargePaymentParams): Promise<CCBILL.completedPaymentResponse> {
    if (details.recurringPeriod && details.recurringPeriod < 30) {
      console.warn("[WARNING] recurring period is set below 30, which can cause problems/errors. Default recurring periods are: 30, 60, 90. In case you want a longer or shorter period contact CCBILL support. ");
    }
    const data: CCBILL.chargePaymentAPI = {
      clientAccnum: this.#clientAccnum,
      clientSubacc: this.#clientSubaccnum,
      initialPrice: details.initialPrice,
      initialPeriod: details.initialPeriod,
      recurringPeriod: details.recurringPeriod,
      recurringPrice: details.recurringPrice,
      rebills: details.rebills,
      currencyCode: details.currencyCode ?? USD_ISO_CODE,
      createNewPaymentToken: details.createNewPaymentToken,
      lifeTimeSubscription: details.lifeTimeSubscription,
      passThroughInfo: details.passThroughInfo,
    };

    const response = await axios.post<CCBILL.completedPaymentResponse>(CCBILL_CHARGE_PAYMENT_URL_TEMPLATE + `/${paymentTokenID}`, data, {
      headers: {
        Authorization: `Bearer ${this.#backendBearerToken}`,
        Accept: "application/vnd.mcn.transaction-service.api.v.1+json",
      },
    });
    return response.data;
  }

  async createRecurringSubscription(paymentTokenID: paymentTokenID, recurringSubscriptionObject: PaymentTypes.recurringSubscription) {
    await this.createAndChargePayment(paymentTokenID, recurringSubscriptionObject);
  }

  async createOneTimeSubscription(paymentTokenID: paymentTokenID, oneTimeSubscription: PaymentTypes.oneTimeSubscription) {
    await this.createAndChargePayment(paymentTokenID, oneTimeSubscription);
  }
}

export default ccbillGateway;

// CK - 2024 - CK
