import axios from "axios";
import { log } from "console";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";

dotenv.config();

export async function updateLangSOAP(msisdn, lang) {
  console.log(`${msisdn} and ${lang}`);

  const soapXml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bcs="http://www.huawei.com/bme/cbsinterface/bcservices" xmlns:cbs="http://www.huawei.com/bme/cbsinterface/cbscommon" xmlns:bcc="http://www.huawei.com/bme/cbsinterface/bccommon">
   <soapenv:Header/>
   <soapenv:Body>
      <bcs:ChangeSubInfoRequestMsg>
         <RequestHeader>
            <cbs:Version>1</cbs:Version>
            <!--Optional:-->
            <cbs:BusinessCode>CreateSubscriber</cbs:BusinessCode>
            <cbs:MessageSeq>${Date.now()}</cbs:MessageSeq>            
            <!--Optional:-->
            <cbs:OwnershipInfo>
               <cbs:BEID>101</cbs:BEID>
            </cbs:OwnershipInfo>
            <cbs:AccessSecurity>
               <cbs:LoginSystemCode>Subscription</cbs:LoginSystemCode>
               <cbs:Password>Sfs58abIHVrbiQBUZoY0PzzK986uovZBGCZpWWu7FMNDVirZOTck297RqpCutw==</cbs:Password>
            </cbs:AccessSecurity>
            <!--Optional:-->
            <cbs:OperatorInfo>
               <cbs:OperatorID>101</cbs:OperatorID>
            </cbs:OperatorInfo>
         </RequestHeader>
         <ChangeSubInfoRequest>
            <bcs:SubAccessCode>
               <!--You have a CHOICE of the next 2 items at this level-->
               <bcc:PrimaryIdentity>${msisdn}</bcc:PrimaryIdentity>
            </bcs:SubAccessCode>
            <!--Optional:-->
            <bcs:SubBasicInfo>
               <!--Optional:-->
               <bcc:WrittenLang>${lang}</bcc:WrittenLang>
               <!--Optional:-->
               <bcc:IVRLang>${lang}</bcc:IVRLang>
            </bcs:SubBasicInfo>
         </ChangeSubInfoRequest>
      </bcs:ChangeSubInfoRequestMsg>
   </soapenv:Body>
</soapenv:Envelope>`;

  const { data } = await axios.post(
    "http://10.30.96.6:8080/services/BcServices",
    soapXml,
    {
      headers: { "Content-Type": "text/xml;charset=UTF-8" },
      httpsAgent: new (
        await import("https")
      ).Agent({ rejectUnauthorized: false }),
    }
  );

  // console.log(data);

  return {
    code: 0,
    description: "Lang Changed",
  };
}

export async function sendViewSubscriberSOAP(msisdn) {
  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bcs="http://www.huawei.com/bme/cbsinterface/bcservices" xmlns:cbs="http://www.huawei.com/bme/cbsinterface/cbscommon" xmlns:bcc="http://www.huawei.com/bme/cbsinterface/bccommon">
  <soapenv:Header/>
  <soapenv:Body>
    <bcs:QueryCustomerInfoRequestMsg>
      <RequestHeader>
        <cbs:Version>1</cbs:Version>
        <!--Optional:-->
        <cbs:BusinessCode>QueryCustomerInfo</cbs:BusinessCode>
        <cbs:MessageSeq>\${=(new java.text.SimpleDateFormat("yyyyMMddHHmmss")).format(new Date())}\${=(int)(Math.random()*1000)}</cbs:MessageSeq>
        <!--Optional:-->
        <cbs:OwnershipInfo>
          <cbs:BEID>101</cbs:BEID>
        </cbs:OwnershipInfo>
        <cbs:AccessSecurity>
          <cbs:LoginSystemCode>Subscription</cbs:LoginSystemCode>
          <cbs:Password>Sfs58abIHVrbiQBUZoY0PzzK986uovZBGCZpWWu7FMNDVirZOTck297RqpCutw==</cbs:Password>
        </cbs:AccessSecurity>
        <!--Optional:-->
        <cbs:OperatorInfo>
          <cbs:OperatorID>101</cbs:OperatorID>
        </cbs:OperatorInfo>
      </RequestHeader>
      <QueryCustomerInfoRequest>
        <bcs:QueryObj>
          <bcs:SubAccessCode>
            <!--You have a CHOICE of the next 2 items at this level-->
            <bcc:PrimaryIdentity>${msisdn}</bcc:PrimaryIdentity>
          </bcs:SubAccessCode>
        </bcs:QueryObj>
        <!--Optional:-->
        <bcs:QueryMode>2</bcs:QueryMode>
      </QueryCustomerInfoRequest>
    </bcs:QueryCustomerInfoRequestMsg>
  </soapenv:Body>
</soapenv:Envelope>`;

  const { data } = await axios.post(process.env.CBS_URL, soapEnvelope, {
    headers: { "Content-Type": "text/xml;charset=UTF-8" },
    httpsAgent: new (
      await import("https")
    ).Agent({ rejectUnauthorized: false }),
  });

  // Configuration for fast-xml-parser
  const options = {
    // Treat attributes as part of the tag data
    ignoreAttributes: false,
    // Ensure nested objects are created correctly for repetitive tags
    arrayMode: false,
    // Preserve array structure even for single-item arrays
    // This is crucial for SupplementaryOffering, as it appears multiple times
    // If you used arrayMode: true, it would enforce arrays everywhere, which might be too noisy.
    // However, fast-xml-parser usually handles repetition correctly with default settings for repeated tags.
    // For SOAP, it's best to strip the prefixes to simplify property access.
    ignoreNameSpace: true,
  };

  const parser = new XMLParser(options);
  const jsonObj = parser.parse(data);

  // console.log(
  //   jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
  //     "bcs:QueryCustomerInfoResultMsg"
  //   ]?.["ResultHeader"]
  // );

  const ResultHeader =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:QueryCustomerInfoResultMsg"
    ]?.["ResultHeader"];

  const WrittenLang =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:QueryCustomerInfoResultMsg"
    ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.[
      "bcs:SubscriberInfo"
    ]?.["bcc:SubBasicInfo"]?.["bcc:WrittenLang"];

  const CN_SUB_LOCATION =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:QueryCustomerInfoResultMsg"
    ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.[
      "bcs:SubscriberInfo"
    ]?.["bcc:SubBasicInfo"]?.["bcc:SubProperty"][22]?.["bcc:Value"];

  const CN_SUB_IMEI =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:QueryCustomerInfoResultMsg"
    ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.[
      "bcs:SubscriberInfo"
    ]?.["bcc:SubBasicInfo"]?.["bcc:SubProperty"][33]?.["bcc:Value"];

  const PrimaryOfferingId =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:QueryCustomerInfoResultMsg"
    ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.[
      "bcs:PrimaryOffering"
    ]?.["bcc:OfferingKey"]?.["bcc:OfferingID"];

  const PrimaryOfferingName =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:QueryCustomerInfoResultMsg"
    ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.[
      "bcs:PrimaryOffering"
    ]?.["bcc:OfferingName"];

  const PaymentMode =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:QueryCustomerInfoResultMsg"
    ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.["bcs:PaymentMode"];

  const LifeCycleStatus =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:QueryCustomerInfoResultMsg"
    ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.[
      "bcs:SubscriberInfo"
    ]?.["bcc:Status"];

  // const MainBalance =
  //   jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
  //     "bcs:QueryCustomerInfoResultMsg"
  //   ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.["bcs:AcctList"]?.[
  //     "bcs:BalanceResult"
  //   ]?.["bcs:TotalAmount"];

  const rawValue =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:QueryCustomerInfoResultMsg"
    ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.["bcs:AcctList"]?.[
      "bcs:BalanceResult"
    ];

  // Ensure rawValue is always an array
  const balanceArray = Array.isArray(rawValue) ? rawValue : [rawValue];

  const mainBalanceObj = balanceArray.find(
    (item) => item["bcs:BalanceType"] === "C_MAIN_ACCOUNT"
  );

  const mainBalance = mainBalanceObj?.["bcs:TotalAmount"];

  // console.log(`CBS Main Balance is: ${mainBalance}`);

  const MainBalance = mainBalance ? mainBalance.toString().slice(0, -3) : null;

  // console.log(`CCP Main Balance is : ${MainBalance}`);

  // 1. Define the Area Code Lookup Map
  // This object will be used to convert the code (key) to the name (value).
  const areaCodeMap = {
    1000: "Erbil",
    1001: "Duhok",
    1002: "Sulaymaniyah",
    1003: "Kirkuk",
    1004: "Ninawa-Mosul",
    1005: "Baghdad",
    1006: "Anbar",
    1007: "Salahaddin",
    1008: "Diyala",
    1009: "Babylon",
    1010: "Karbala",
    1011: "Najaf",
    1012: "Al-Qadisiyyah",
    1013: "Wasit",
    1014: "Basra",
    1015: "Maysan",
    1016: "Muthanna",
    1017: "Dhiqar",
    1018: "Halabja",
    1019: "Erbil_5x5",
    1020: "Baghdad_5x5",
    1021: "Suly_Special",
  };

  // 2. Define the subInfo object
  // NOTE: Assuming all variables (WrittenLang, CN_SUB_LOCATION, etc.) are defined in scope.
  var subInfo = {
    ResultHeader,
    MainBalance,
    WrittenLang,
    // Initially store the code, or skip it for now
    CN_SUB_LOCATION: CN_SUB_LOCATION,
    CN_SUB_IMEI,
    PrimaryOfferingId,
    PrimaryOfferingName,
    // Corrected ternary syntax for PaymentMode
    PaymentMode: PaymentMode == 0 ? "Prepaid" : "Postpaid",
    // Corrected ternary syntax for LifeCycleStatus
    LifeCycleStatus:
      LifeCycleStatus == 0
        ? "CallBarring"
        : LifeCycleStatus == 1
        ? "Install"
        : LifeCycleStatus == 2
        ? "Active"
        : LifeCycleStatus == 3
        ? "Suspend"
        : "Unknown", // A default case is recommended for robustness
  };

  // 3. Update CN_SUB_LOCATION from Code to Name
  const locationCode = subInfo.CN_SUB_LOCATION;

  // Use the map to get the area name. If the code isn't found, keep the code or use a default string.
  subInfo.CN_SUB_LOCATION = areaCodeMap[locationCode] || `${locationCode}`;

  // 4. Output and Return the Final Object
  // console.log(subInfo);

  return {
    raw: subInfo,
    code: 0,
    description: "List Done",
  };
}

export async function updateMainBalanceSOAP(msisdn, amnt) {
  // console.log(`${msisdn} and ${amnt}`);

  const soapXml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ars="http://www.huawei.com/bme/cbsinterface/arservices" xmlns:cbs="http://www.huawei.com/bme/cbsinterface/cbscommon" xmlns:arc="http://cbs.huawei.com/ar/wsservice/arcommon">
   <soapenv:Header/>
   <soapenv:Body>
      <ars:AdjustmentRequestMsg>
         <RequestHeader>
            <cbs:Version>1</cbs:Version>
            <!--Optional:-->
            <cbs:BusinessCode>Adjustment</cbs:BusinessCode>
           <cbs:MessageSeq>${Date.now()}</cbs:MessageSeq>
            <!--Optional:-->
            <cbs:OwnershipInfo>
               <cbs:BEID>101</cbs:BEID>
            </cbs:OwnershipInfo>
            <cbs:AccessSecurity>
<cbs:LoginSystemCode>${process.env.CBS_LOGIN_CODE}</cbs:LoginSystemCode>
<cbs:Password>${process.env.CBS_PASSWORD}</cbs:Password>
</cbs:AccessSecurity>
            <!--Optional:-->
            <cbs:OperatorInfo>
               <cbs:OperatorID>101</cbs:OperatorID>
            </cbs:OperatorInfo>
         </RequestHeader>
         <AdjustmentRequest>
            <ars:AdjustmentObj>
               <!--You have a CHOICE of the next 4 items at this level-->
               <ars:SubAccessCode>
                  <!--You have a CHOICE of the next 2 items at this level-->
                  <arc:PrimaryIdentity>${msisdn}</arc:PrimaryIdentity>
               </ars:SubAccessCode>
            </ars:AdjustmentObj>
            <ars:OpType>1</ars:OpType>
            <!--Zero or more repetitions:-->
            <ars:AdjustmentInfo>
               <!--Optional:-->
               <arc:BalanceType>C_MAIN_ACCOUNT</arc:BalanceType>
               <!--Optional:here 1 for CR,2 for DR,3 for CR billing,4 for DR billing-->
               <arc:AdjustmentType>2</arc:AdjustmentType>
               <!--Optional:-->
               <arc:AdjustmentAmt>${amnt}000</arc:AdjustmentAmt>
               <!--Optional:-->
               <arc:CurrencyID>1068</arc:CurrencyID>
               <!--arc:OffsetUnit>1</arc:OffsetUnit>
               <arc:OffsetValue>30</arc:OffsetValue-->
               <arc:SelectInstanceMode>0</arc:SelectInstanceMode>
            </ars:AdjustmentInfo>
         </AdjustmentRequest>
      </ars:AdjustmentRequestMsg>
   </soapenv:Body>
</soapenv:Envelope>`;

  const { data } = await axios.post(process.env.CBS_URL_AR, soapXml, {
    headers: { "Content-Type": "text/xml;charset=UTF-8" },
    httpsAgent: new (
      await import("https")
    ).Agent({ rejectUnauthorized: false }),
  });

  // Configuration for fast-xml-parser
  const options = {
    // Treat attributes as part of the tag data
    ignoreAttributes: false,
    // Ensure nested objects are created correctly for repetitive tags
    arrayMode: false,
    // Preserve array structure even for single-item arrays
    // This is crucial for SupplementaryOffering, as it appears multiple times
    // If you used arrayMode: true, it would enforce arrays everywhere, which might be too noisy.
    // However, fast-xml-parser usually handles repetition correctly with default settings for repeated tags.
    // For SOAP, it's best to strip the prefixes to simplify property access.
    ignoreNameSpace: true,
  };

  const parser = new XMLParser(options);
  const jsonObj = parser.parse(data);

  // console.log(
  //   jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
  //     "ars:AdjustmentResultMsg"
  //   ]?.["ResultHeader"]
  // );

  const CbsResultCode =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "ars:AdjustmentResultMsg"
    ]?.["ResultHeader"]?.["cbs:ResultCode"];

  const CbsResultDesc =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "ars:AdjustmentResultMsg"
    ]?.["ResultHeader"]?.["cbs:ResultDesc"];

  return {
    code: CbsResultCode,
    description: CbsResultDesc,
  };
}
