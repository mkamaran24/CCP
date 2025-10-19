import axios from "axios";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";

dotenv.config();

export async function sendRemoveOfferSOAP(msisdn, offeringId, purchaseSeqId) {
  const soapEnvelope = `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bcs="http://www.huawei.com/bme/cbsinterface/bcservices" xmlns:cbs="http://www.huawei.com/bme/cbsinterface/cbscommon" xmlns:bcc="http://www.huawei.com/bme/cbsinterface/bccommon">
    <soapenv:Header/>
    <soapenv:Body>
      <bcs:ChangeSubOfferingRequestMsg>
        <RequestHeader>
          <cbs:Version>1</cbs:Version>
          <cbs:BusinessCode>ChangeSubOffering</cbs:BusinessCode>
          <cbs:MessageSeq>${Date.now()}</cbs:MessageSeq>
          <cbs:OwnershipInfo>
            <cbs:BEID>101</cbs:BEID>
          </cbs:OwnershipInfo>
          <cbs:AccessSecurity>
            <cbs:LoginSystemCode>${
              process.env.CBS_LOGIN_CODE
            }</cbs:LoginSystemCode>
            <cbs:Password>${process.env.CBS_PASSWORD}</cbs:Password>
          </cbs:AccessSecurity>
          <cbs:OperatorInfo>
            <cbs:OperatorID>101</cbs:OperatorID>
          </cbs:OperatorInfo>
        </RequestHeader>
        <ChangeSubOfferingRequest>
          <bcs:SubAccessCode>
            <bcc:PrimaryIdentity>${msisdn}</bcc:PrimaryIdentity>
          </bcs:SubAccessCode>
          <bcs:SupplementaryOffering>
            <bcs:DelOffering>
              <bcs:OfferingKey>
                <bcc:OfferingID>${offeringId}</bcc:OfferingID>
                <bcc:PurchaseSeq>${purchaseSeqId}</bcc:PurchaseSeq>
              </bcs:OfferingKey>
              <bcs:OInstProperty>
                <bcc:PropCode>CN_OFFER_OPERATION_TYPE</bcc:PropCode>
                <bcc:PropType>1</bcc:PropType>
                <bcc:Value>0</bcc:Value>
              </bcs:OInstProperty>
            </bcs:DelOffering>
          </bcs:SupplementaryOffering>
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

  const code = (resultHeader["cbs:ResultCode"] || "").toString().trim();
  const description = (resultHeader["cbs:ResultDesc"] || "").toString().trim();

  return {
    raw: data,
    code: code || "Unknown",
    description: description || "No description",
  };
}
