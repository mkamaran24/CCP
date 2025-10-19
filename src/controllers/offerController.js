import { sendViewOfferSOAP } from "../services/Offer/viewService.js";
import { sendRemoveOfferSOAP } from "../services/Offer/soapService.js";

export const renderViewOfferPage = async (req, res) => {
  const result = await sendViewOfferSOAP(req.session.number);
  res.render("pages/Offers", { offerings: result });
};

export const handleDeleteOffer = async (req, res) => {
  const { offeringId, purchaseSeqId } = req.body;
  const msisdn = req.session.number;

  if (!offeringId || !msisdn) {
    return res
      .status(400)
      .json({ success: false, message: "Missing offer ID or MSISDN" });
  }

  try {
    const result = await sendRemoveOfferSOAP(msisdn, offeringId, purchaseSeqId);

    if (result.code === "0") {
      return res.json({ success: true });
    } else {
      return res.status(500).json({
        success: false,
        message: result.description || "Deletion failed.",
      });
    }
  } catch (err) {
    console.error("Delete SOAP error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during deletion.",
    });
  }
};
