import axios from "axios";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";

dotenv.config();

export async function sendRemoveFreeUnitSOAP(msisdn, offeringId) {
  const soapEnvelope = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:ars="http://www.huawei.com/bme/cbsinterface/arservices" 
                  xmlns:cbs="http://www.huawei.com/bme/cbsinterface/cbscommon" 
                  xmlns:arc="http://cbs.huawei.com/ar/wsservice/arcommon">
  <soapenv:Header/>
  <soapenv:Body>
    <ars:AdjustmentRequestMsg>
      <RequestHeader>
        <cbs:Version>1</cbs:Version>
        <cbs:BusinessCode>adjustment</cbs:BusinessCode>
        <cbs:MessageSeq>${new Date()
          .toISOString()
          .replace(/\D/g, "")
          .slice(0, 14)}${Math.floor(Math.random() * 1000)}</cbs:MessageSeq>
        <cbs:OwnershipInfo>
          <cbs:BEID>101</cbs:BEID>
        </cbs:OwnershipInfo>
        <cbs:AccessSecurity>
          <cbs:LoginSystemCode>Subscription</cbs:LoginSystemCode>
          <cbs:Password>Sfs58abIHVrbiQBUZoY0PzzK986uovZBGCZpWWu7FMNDVirZOTck297RqpCutw==</cbs:Password>
        </cbs:AccessSecurity>
        <cbs:OperatorInfo>
          <cbs:OperatorID>101</cbs:OperatorID>
        </cbs:OperatorInfo>
      </RequestHeader>
      <AdjustmentRequest>
        <ars:AdjustmentObj>
          <ars:SubAccessCode>
            <arc:PrimaryIdentity>${msisdn}</arc:PrimaryIdentity>
          </ars:SubAccessCode>
        </ars:AdjustmentObj>
        <ars:OpType>3</ars:OpType>
        <ars:FreeUnitAdjustmentInfo>
          <ars:FreeUnitInstanceID>${offeringId}</ars:FreeUnitInstanceID>
          <ars:AdjustmentType>1</ars:AdjustmentType>
          <ars:OffsetUnit>1</ars:OffsetUnit>
          <ars:OffsetValue>-50</ars:OffsetValue>
          <ars:SelectInstanceMode>0</ars:SelectInstanceMode>
          <ars:ValidityExtMethod>0</ars:ValidityExtMethod>
        </ars:FreeUnitAdjustmentInfo>
      </AdjustmentRequest>
    </ars:AdjustmentRequestMsg>
  </soapenv:Body>
</soapenv:Envelope>`;

  const { data } = await axios.post(
    "http://10.30.96.6:8080/services/ArServices",
    soapEnvelope,
    {
      headers: { "Content-Type": "text/xml;charset=UTF-8" },
      httpsAgent: new (
        await import("https")
      ).Agent({ rejectUnauthorized: false }),
    }
  );

  // 🧠 Parse the XML with trimming
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  const json = parser.parse(data);

  const resultHeader =
    json["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:ChangeSubOfferingResultMsg"
    ]?.["ResultHeader"] || {};

  const code = (resultHeader["cbs:ResultCode"] || "").toString().trim();
  const description = (resultHeader["cbs:ResultDesc"] || "").toString().trim();

  return {
    raw: data,
    code: code || "Unknown",
    description: description || "No description",
  };
}
