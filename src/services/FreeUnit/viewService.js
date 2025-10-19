import axios from "axios";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";

dotenv.config();

export async function sendViewFreeUnitSOAP(msisdn) {
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

  const freeunits =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:QueryCustomerInfoResultMsg"
    ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.["bcs:FreeUnitInfo"]?.[
      "bcs:FreeUnitItem"
    ];

  // if (!freeunits) {
  //   console.warn("No FreeUnitItem found in response.");
  //   return { raw: [], code: 1, description: "No FreeUnits found" };
  // }

  // const freeunits =
  //   jsonObj.Envelope?.Body?.QueryCustomerInfoResultMsg?.QueryCustomerInfoResult
  //     ?.Subscriber?.FreeUnitInfo?.FreeUnitItem;

  // Safely handle empty, null, or non-array cases
  // if (!freeunits || (Array.isArray(freeunits) && freeunits.length === 0)) {
  //   console.warn("No FreeUnitItem found in response.");
  //   // return { raw: [], code: 1, description: "No FreeUnits found" };
  // }

  // ✅ If freeunits doesn't exist or is empty, return []
  if (!freeunits || (Array.isArray(freeunits) && freeunits.length === 0)) {
    return {
      raw: [],
      code: 0,
      description: "List Done",
    };
  }

  // Ensure it’s always an array
  const freeunitArray = Array.isArray(freeunits) ? freeunits : [freeunits];

  // Parse each FreeUnitItem
  const parsedUnits = freeunitArray.flatMap((item) => {
    const FreeUnitType = item["bcs:FreeUnitType"];
    const FreeUnitTypeName = item["bcs:FreeUnitTypeName"];
    const MeasureUnitName = item["bcs:MeasureUnitName"];

    const details = item["bcs:FreeUnitItemDetail"];
    const detailsArray = Array.isArray(details) ? details : [details];

    return detailsArray.map((d) => ({
      FreeUnitType,
      FreeUnitTypeName,
      MeasureUnitName,
      FreeUnitInstanceID: d["bcs:FreeUnitInstanceID"],
      InitialAmount: d["bcs:InitialAmount"],
      CurrentAmount: d["bcs:CurrentAmount"],
      EffectiveTime: d["bcs:EffectiveTime"],
      ExpireTime: d["bcs:ExpireTime"],
    }));
  });

  // --- safe extraction ---
  // const envelope = jsonObj.Envelope;
  // const body = envelope?.Body;
  // const resultMsg = body?.QueryCustomerInfoResultMsg;
  // const result = resultMsg?.QueryCustomerInfoResult;
  // const subscriber = result?.Subscriber;
  // const freeUnitInfo = subscriber?.FreeUnitInfo;
  // const freeunits = freeUnitInfo?.FreeUnitItem;

  // if (!freeunits) {
  //   console.warn("No FreeUnitItem found in response.");
  //   return { raw: [], code: 1, description: "No FreeUnits found" };
  // }

  // // --- robust parsing ---
  // const freeunitArray = Array.isArray(freeunits)
  //   ? freeunits
  //   : [freeunits].filter(Boolean);
  // const parsedUnits = freeunitArray.flatMap((item) => {
  //   if (!item) return [];

  //   const {
  //     FreeUnitType,
  //     FreeUnitTypeName,
  //     MeasureUnitName,
  //     FreeUnitItemDetail,
  //   } = item;
  //   const detailsArray = Array.isArray(FreeUnitItemDetail)
  //     ? FreeUnitItemDetail
  //     : [FreeUnitItemDetail].filter(Boolean);

  //   return detailsArray.map((d) => ({
  //     FreeUnitType,
  //     FreeUnitTypeName,
  //     MeasureUnitName,
  //     FreeUnitInstanceID: d.FreeUnitInstanceID,
  //     InitialAmount: d.InitialAmount,
  //     CurrentAmount: d.CurrentAmount,
  //     EffectiveTime: d.EffectiveTime,
  //     ExpireTime: d.ExpireTime,
  //   }));
  // });

  return {
    raw: parsedUnits,
    code: 0,
    description: "List Done",
  };
}
