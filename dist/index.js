"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _ccbillGateway_frontendBearerToken, _ccbillGateway_backendBearerToken, _ccbillGateway_clientAccnum, _ccbillGateway_clientSubaccnum, _ccbillGateway_frontendUsername, _ccbillGateway_FrontendPassword, _ccbillGateway_backendUsername, _ccbillGateway_backendPassword;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentTypes = void 0;
const axios_1 = __importDefault(require("axios"));
const CCBILL_AUTHTOKEN_URL = "https://api.ccbill.com/ccbill-auth/oauth/token?grant_type=client_credentials";
const CCBILL_CREATE_PAYMENT_TOKEN_URL = "https://api.ccbill.com/payment-tokens/merchant-only";
const CCBILL_CHARGE_PAYMENT_URL_TEMPLATE = "https://api.ccbill.com/transactions/payment-tokens";
const USD_ISO_CODE = 840;
var PaymentTypes;
(function (PaymentTypes) {
    class recurringSubscription {
        /**
         *
         * @param rebills how many rebills the subscription should last
         * @param passThroughInfo any info
         * @param recurringPeriodInDays
         * @param recurringPriceInUSD
         * @param initalPeriodInDays
         * @param initalPriceInUSD
         */
        constructor(recurringPeriodInDays, recurringPriceInUSD, initalPeriodInDays, initalPriceInUSD, rebills, passThroughInfo) {
            this.initialPeriod = initalPeriodInDays !== null && initalPeriodInDays !== void 0 ? initalPeriodInDays : recurringPeriodInDays;
            this.initialPrice = initalPriceInUSD !== null && initalPriceInUSD !== void 0 ? initalPriceInUSD : recurringPriceInUSD;
            this.recurringPeriod = recurringPeriodInDays;
            this.recurringPrice = recurringPriceInUSD;
            this.passThroughInfo = passThroughInfo;
            this.rebills = rebills !== null && rebills !== void 0 ? rebills : 99;
            this.lifeTimeSubscription = false;
            this.currencyCode = 840;
            this.createNewPaymentToken = false;
        }
    }
    PaymentTypes.recurringSubscription = recurringSubscription;
    class oneTimeSubscription {
        constructor(price, passThroughInfo) {
            this.initialPeriod = 2; // random number, it doenst matter
            this.initialPrice = price;
            this.passThroughInfo = passThroughInfo;
            this.recurringPeriod = 0;
            this.recurringPrice = 0;
            this.rebills = 0;
            this.lifeTimeSubscription = true;
            this.currencyCode = 840;
            this.createNewPaymentToken = false;
        }
    }
    PaymentTypes.oneTimeSubscription = oneTimeSubscription;
})(PaymentTypes || (exports.PaymentTypes = PaymentTypes = {}));
class ccbillGateway {
    /**
     * Unofficial Nodejs api for handling CCBILL via the restful APIs.
     * @see [General Documentation](https://ccbill.com/doc/ccbill-restful-api-resources)
     * @see [Thorough Documentation of APIs](https://github.com/CCBill/restful-api-guide?tab=readme-ov-file)
     *
     * @param username The username can be also refered as: MearchantID, Merchant Application ID
     *
     * ```js
     * const ccbill = new ccbillGateway(username, password, clientAccountNumber, clientSubaccountNumber);
     *
     * (async () => {
     *  await ccbill.init();
     * })();
     *
     *
     * ```
     */
    constructor(frontendUsername, FrontendPassword, backendUsername, backendPassword, clientAccnum, clientSubacc) {
        _ccbillGateway_frontendBearerToken.set(this, void 0);
        _ccbillGateway_backendBearerToken.set(this, void 0);
        _ccbillGateway_clientAccnum.set(this, void 0);
        _ccbillGateway_clientSubaccnum.set(this, void 0);
        _ccbillGateway_frontendUsername.set(this, void 0);
        _ccbillGateway_FrontendPassword.set(this, void 0);
        _ccbillGateway_backendUsername.set(this, void 0);
        _ccbillGateway_backendPassword.set(this, void 0);
        __classPrivateFieldSet(this, _ccbillGateway_clientAccnum, clientAccnum, "f");
        __classPrivateFieldSet(this, _ccbillGateway_clientSubaccnum, clientSubacc, "f");
        __classPrivateFieldSet(this, _ccbillGateway_frontendUsername, frontendUsername, "f");
        __classPrivateFieldSet(this, _ccbillGateway_FrontendPassword, FrontendPassword, "f");
        __classPrivateFieldSet(this, _ccbillGateway_backendUsername, backendUsername, "f");
        __classPrivateFieldSet(this, _ccbillGateway_backendPassword, backendPassword, "f");
    }
    /*
     * Retrieves your backend and frontend bearer tokens.
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // FETCHING FRONTEND BEARER TOKEN
            yield axios_1.default
                .post(CCBILL_AUTHTOKEN_URL, {}, // BODY/DATA
            {
                // HEADERS
                auth: {
                    // AUTH
                    username: __classPrivateFieldGet(this, _ccbillGateway_frontendUsername, "f"),
                    password: __classPrivateFieldGet(this, _ccbillGateway_FrontendPassword, "f"),
                },
            })
                .then((req) => {
                // console.log("[AUTH TOKEN GIVEN]: ", req.data.access_token);
                __classPrivateFieldSet(this, _ccbillGateway_frontendBearerToken, req.data.access_token, "f");
            })
                .catch((err) => {
                console.error("[ERROR] error while fetching bearerToken: ", err);
            });
            // FETCHING BACKEND BEARER TOKEN
            yield axios_1.default
                .post(CCBILL_AUTHTOKEN_URL, {}, // BODY/DATA
            {
                // HEADERS
                auth: {
                    // AUTH
                    username: __classPrivateFieldGet(this, _ccbillGateway_backendUsername, "f"),
                    password: __classPrivateFieldGet(this, _ccbillGateway_backendPassword, "f"),
                },
            })
                .then((req) => {
                // console.log("[AUTH TOKEN GIVEN]: ", req.data.access_token);
                __classPrivateFieldSet(this, _ccbillGateway_backendBearerToken, req.data.access_token, "f");
            })
                .catch((err) => {
                console.error("[ERROR] error while fetching bearerToken: ", err);
            });
        });
    }
    /**
      * This will validate the field options and return a token to charge and complete the payment later.
      *
      @see https://ccbill.com/doc/ccbill-restful-api-resources
      
      * A DOMAIN NAME IS REQUIRED AND MUST BE AUTHORIZED BY CCBILL. YOU CAN NOT MAKE REQUESTS FROM YOUR HOME IP WITHOUT A DOMAIN NAME
  
      @see https://github.com/CCBill/restful-api-guide?tab=readme-ov-file#request-parameters
  
    */
    createPaymentToken(customerData, paymentData, options) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            options = options ? options : { timeToLive: 30, validNumberOfUse: 3 };
            const data = Object.assign({ clientAccnum: __classPrivateFieldGet(this, _ccbillGateway_clientAccnum, "f"), clientSubacc: __classPrivateFieldGet(this, _ccbillGateway_clientSubaccnum, "f"), customerInfo: {
                    customerFname: customerData.customerFname,
                    customerLname: customerData.customerLname,
                    address1: customerData.address1,
                    address2: (_a = customerData.address2) !== null && _a !== void 0 ? _a : "",
                    city: customerData.city,
                    state: (_b = customerData.state) !== null && _b !== void 0 ? _b : "",
                    zipcode: customerData.zipcode,
                    country: customerData.country,
                    email: customerData.email,
                    ipAddress: customerData.ipAddress,
                    browserHttpAccept: (_c = customerData.browserHttpAccept) !== null && _c !== void 0 ? _c : "",
                    browserHttpAcceptEncoding: (_d = customerData.browserHttpAcceptEncoding) !== null && _d !== void 0 ? _d : "",
                    browserHttpAcceptLanguage: (_e = customerData.browserHttpAcceptLanguage) !== null && _e !== void 0 ? _e : "",
                    browserHttpUserAgent: (_f = customerData.browserHttpUserAgent) !== null && _f !== void 0 ? _f : "",
                    // phoneNumber: customerData.phoneNumber,
                }, paymentInfo: { creditCardPaymentInfo: paymentData }, subscriptionId: 0 }, options);
            const result = yield axios_1.default.post(CCBILL_CREATE_PAYMENT_TOKEN_URL, data, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/vnd.mcn.transaction-service.api.v.2+json",
                    Authorization: `Bearer ${__classPrivateFieldGet(this, _ccbillGateway_frontendBearerToken, "f")}`,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36",
                },
            });
            // console.log(result.data);
            return result.data;
        });
    }
    /**
     * After you have generated a bearer token and a payment token ID, you can use these two tokens to charge the consumer’s credit card.
     * YOU NEED TO GET YOUR SERVER OR HOME IP WHITELISTED AND A DATALINK USER SO TO ACCESS THIS ENDPOINT ELSE YOU WILL GET A: 100106 CODE
   
      @see https://github.com/CCBill/restful-api-guide?tab=readme-ov-file#request-parameters
     */
    createAndChargePayment(paymentTokenID, details) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (details.recurringPeriod && details.recurringPeriod < 30) {
                console.warn("[WARNING] recurring period is set below 30, which can cause problems/errors. Default recurring periods are: 30, 60, 90. In case you want a longer or shorter period contact CCBILL support. ");
            }
            const data = {
                clientAccnum: __classPrivateFieldGet(this, _ccbillGateway_clientAccnum, "f"),
                clientSubacc: __classPrivateFieldGet(this, _ccbillGateway_clientSubaccnum, "f"),
                initialPrice: details.initialPrice,
                initialPeriod: details.initialPeriod,
                recurringPeriod: details.recurringPeriod,
                recurringPrice: details.recurringPrice,
                rebills: details.rebills,
                currencyCode: (_a = details.currencyCode) !== null && _a !== void 0 ? _a : USD_ISO_CODE,
                createNewPaymentToken: details.createNewPaymentToken,
                lifeTimeSubscription: details.lifeTimeSubscription,
                passThroughInfo: details.passThroughInfo,
            };
            const response = yield axios_1.default.post(CCBILL_CHARGE_PAYMENT_URL_TEMPLATE + `/${paymentTokenID}`, data, {
                headers: {
                    Authorization: `Bearer ${__classPrivateFieldGet(this, _ccbillGateway_backendBearerToken, "f")}`,
                    Accept: "application/vnd.mcn.transaction-service.api.v.1+json",
                },
            });
            return response.data;
        });
    }
    createRecurringSubscription(paymentTokenID, recurringSubscriptionObject) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createAndChargePayment(paymentTokenID, recurringSubscriptionObject);
        });
    }
    createOneTimeSubscription(paymentTokenID, oneTimeSubscription) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createAndChargePayment(paymentTokenID, oneTimeSubscription);
        });
    }
}
_ccbillGateway_frontendBearerToken = new WeakMap(), _ccbillGateway_backendBearerToken = new WeakMap(), _ccbillGateway_clientAccnum = new WeakMap(), _ccbillGateway_clientSubaccnum = new WeakMap(), _ccbillGateway_frontendUsername = new WeakMap(), _ccbillGateway_FrontendPassword = new WeakMap(), _ccbillGateway_backendUsername = new WeakMap(), _ccbillGateway_backendPassword = new WeakMap();
exports.default = ccbillGateway;
// CK - 2024 - CK
