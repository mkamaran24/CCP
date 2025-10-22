import { sendViewSubscriberSOAP } from "../services/homeService.js";

export const renderViewHomePage = (req, res) => {
  const fullUsername = req.session.username;
  const firstName = fullUsername.split(".")[0];

  res.render("pages/Home", {
    response: { number: req.session.number, username: firstName },
    extracted: { data: req.session.viewSubInfo },
  });
};

export const handleViewProfile = async (req, res) => {
  // req.session.number = req.body.number;
  // res.render("pages/Home", { response: { number: req.session.number } });

  req.session.number = req.body.number;
  const result = await sendViewSubscriberSOAP(req.session.number);
  req.session.viewSubInfo = result;
  res.render("pages/Home", {
    response: { number: req.session.number },
    extracted: { data: result },
  });
};
