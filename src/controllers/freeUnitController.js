import { sendViewFreeUnitSOAP } from "../services/FreeUnit/viewService.js";
import { sendRemoveFreeUnitSOAP } from "../services/FreeUnit/deleteService.js";

export const renderViewFreeUnitPage = async (req, res) => {
  const result = await sendViewFreeUnitSOAP(req.session.number);
  // console.log(result);

  res.render("pages/FreeUnits", { response: result });
};

export const handleDeleteFreeUnit = async (req, res) => {
  const { offeringId } = req.body;
  const msisdn = req.session.number;

  console.log(offeringId);

  if (!offeringId || !msisdn) {
    return res
      .status(400)
      .json({ success: false, message: "Missing FreeUnit ID or MSISDN" });
  }

  try {
    const result = await sendRemoveFreeUnitSOAP(msisdn, offeringId);

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
