import axios from "axios";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";

dotenv.config();

export async function sendAddOfferSOAP(msisdn, offeringId) {
  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bcs="http://www.huawei.com/bme/cbsinterface/bcservices" xmlns:cbs="http://www.huawei.com/bme/cbsinterface/cbscommon" xmlns:bcc="http://www.huawei.com/bme/cbsinterface/bccommon">
   <soapenv:Header/>
   <soapenv:Body>
      <bcs:ChangeSubOfferingRequestMsg>
         <RequestHeader>
           <cbs:Version>1</cbs:Version>
          <cbs:MessageSeq>${Date.now()}</cbs:MessageSeq>
            <cbs:AccessSecurity>
              <cbs:LoginSystemCode>Subscription</cbs:LoginSystemCode>
               <cbs:Password>Sfs58abIHVrbiQBUZoY0PzzK986uovZBGCZpWWu7FMNDVirZOTck297RqpCutw==</cbs:Password>
            </cbs:AccessSecurity>
         </RequestHeader>
    <ChangeSubOfferingRequest>
      <bcs:SubAccessCode>
        <bcc:PrimaryIdentity>${msisdn}</bcc:PrimaryIdentity>
      </bcs:SubAccessCode>
      <bcs:SupplementaryOffering>
        <bcs:AddOffering>
          <bcc:OfferingKey>
            <bcc:OfferingID>${offeringId}</bcc:OfferingID>
          </bcc:OfferingKey>
          <bcc:BundledFlag>S</bcc:BundledFlag>
          <bcc:OfferingClass>I</bcc:OfferingClass>
          <bcc:Status>2</bcc:Status>
          <bcc:OInstProperty>
            <bcc:PropCode>CN_OFFER_OPERATION_TYPE</bcc:PropCode>
            <bcc:PropType>1</bcc:PropType>
            <bcc:Value>0</bcc:Value>
          </bcc:OInstProperty>
          <bcs:EffectiveTime>
            <bcc:Mode>I</bcc:Mode>
            <bcc:Time>20240304100224</bcc:Time>
          </bcs:EffectiveTime>
          <bcs:ExpirationTime></bcs:ExpirationTime>
          <bcs:ActivationTime>
            <bcc:Mode>A</bcc:Mode>
          </bcs:ActivationTime>
        </bcs:AddOffering>
      </bcs:SupplementaryOffering>
      <bcs:AdditionalProperty>
        <bcc:Code>CN_E_CHANNEL</bcc:Code>
        <bcc:Value>100</bcc:Value>
      </bcs:AdditionalProperty>
      <bcs:AdditionalProperty>
        <bcc:Code>CN_INT_VALUE_2</bcc:Code>
        <bcc:Value>10</bcc:Value>
      </bcs:AdditionalProperty>
        <bcs:AdditionalProperty>
        <bcc:Code>CN_IMEI</bcc:Code>
        <bcc:Value>202500000000001</bcc:Value>
      </bcs:AdditionalProperty>
        <bcs:AdditionalProperty>
        <bcc:Code>CN_E_LOCATION</bcc:Code>
        <bcc:Value>964750001</bcc:Value>
      </bcs:AdditionalProperty>
    </ChangeSubOfferingRequest>
  </bcs:ChangeSubOfferingRequestMsg>
   </soapenv:Body>
</soapenv:Envelope>`;

  const { data } = await axios.post(process.env.CBS_URL, soapEnvelope, {
    headers: { "Content-Type": "text/xml;charset=UTF-8" },
    httpsAgent: new (
      await import("https")
    ).Agent({ rejectUnauthorized: false }),
  });

  // 🧠 Parse the XML with trimming
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  const json = parser.parse(data);

  const resultHeader =
    json["soapenv:Envelope"]?.["soapenv:Body"]?.[
      "bcs:ChangeSubOfferingResultMsg"
    ]?.["ResultHeader"] || {};

  const code = resultHeader["cbs:ResultCode"];
  const description = (resultHeader["cbs:ResultDesc"] || "").toString().trim();

  return {
    raw: data,
    code: code,
    description: description || "No description",
  };
}
