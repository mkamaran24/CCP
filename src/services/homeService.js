import axios from "axios";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";

dotenv.config();

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

  const MainBalance =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:QueryCustomerInfoResultMsg"
    ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.["bcs:AcctList"]?.[
      "bcs:BalanceResult"
    ]?.["bcs:TotalAmount"];

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
    LifeCycleStatus: LifeCycleStatus == 2 ? "Active" : "CallBaring",
  };

  // 3. Update CN_SUB_LOCATION from Code to Name
  const locationCode = subInfo.CN_SUB_LOCATION;

  // Use the map to get the area name. If the code isn't found, keep the code or use a default string.
  subInfo.CN_SUB_LOCATION =
    areaCodeMap[locationCode] || `Unknown Code (${locationCode})`;

  // 4. Output and Return the Final Object
  console.log(subInfo);

  return {
    raw: subInfo,
    code: 0,
    description: "List Done",
  };
}
