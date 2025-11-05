import { sendViewOfferSOAP } from "../services/Offer/viewService.js";
import { sendRemoveOfferSOAP } from "../services/Offer/soapService.js";
import { sendAddOfferSOAP } from "../services/Offer/addService.js";
import { response } from "express";

export const renderViewOfferPage = async (req, res) => {
  const result = await sendViewOfferSOAP(req.session.number);
  res.render("pages/Offers", { offerings: result, response: true });
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

// New/Updated function to handle the Add Offer POST request
export const handleAddOffer = async (req, res) => {
  const { offeringId } = req.body;
  const msisdn = req.session.number; // Assuming subscriber number is in session

  if (!offeringId || !msisdn) {
    return res.status(400).json({
      success: false,
      message: "Missing Offer ID or Subscriber Number.",
    });
  }

  try {
    // Call the service to add the offer using SOAP
    const result = await sendAddOfferSOAP(msisdn, offeringId);

    // console.log(result);

    if (result.code == 0) {
      return res.json({ success: true });
    } else {
      // Handle specific SOAP/API error from the service
      return res.status(400).json({
        success: false,
        message: result.description || "Failed to add offer.",
      });
    }
  } catch (err) {
    console.error("Add Offer SOAP error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during offer addition.",
    });
  }
};
