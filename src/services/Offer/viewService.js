import axios from "axios";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";

dotenv.config();

export async function sendViewOfferSOAP(msisdn) {
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
  //   ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.[
  //     "bcs:SupplementaryOffering"
  //   ]
  // );

  const offerings =
    jsonObj["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:QueryCustomerInfoResultMsg"
    ]?.["QueryCustomerInfoResult"]?.["bcs:Subscriber"]?.[
      "bcs:SupplementaryOffering"
    ];

  // console.log("this after Travers ");

  const extractedData = Array.isArray(offerings)
    ? offerings.map((offering) => ({
        OfferingID: offering["bcc:OfferingKey"]?.["bcc:OfferingID"],
        PurchaseSeq: offering["bcc:OfferingKey"]?.["bcc:PurchaseSeq"],
        OfferingName: offering["bcc:OfferingName"],
      }))
    : offerings
    ? [
        {
          OfferingID: offerings["bcc:OfferingKey"]?.["bcc:OfferingID"],
          PurchaseSeq: offerings["bcc:OfferingKey"]?.["bcc:PurchaseSeq"],
          OfferingName: offerings["bcc:OfferingName"],
        },
      ]
    : [];

  // console.log("Extracted Offerings:", extractedData);

  return {
    raw: extractedData,
    code: 0,
    description: "List Done",
  };
}
