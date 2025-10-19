// import { sendRemoveOfferSOAP } from "../services/Offer/soapService.js";

export const renderViewHomePage = (req, res) => {
  res.render("pages/Home", { response: { number: req.session.number } });
};

export const handleViewProfile = (req, res) => {
  req.session.number = req.body.number;
  res.render("pages/Home", { response: { number: req.session.number } });
};
