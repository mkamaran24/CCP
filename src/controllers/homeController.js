import {
  sendViewSubscriberSOAP,
  updateLangSOAP,
} from "../services/homeService.js";

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
  const fullUsername = req.session.username;
  const firstName = fullUsername.split(".")[0];
  req.session.number = req.body.number;
  const result = await sendViewSubscriberSOAP(req.session.number);
  req.session.viewSubInfo = result;

  const hResult = {
    code: result.raw.ResultHeader["cbs:ResultCode"],
    desc: result.raw.ResultHeader["cbs:ResultDesc"],
  };

  console.log(hResult);

  res.render("pages/Home", {
    response: {
      number: req.session.number,
      header: hResult,
      username: firstName,
    },
    extracted: { data: result },
  });
};

export const handleChangeLang = async (req, res) => {
  // req.session.number = req.body.number;
  // res.render("pages/Home", { response: { number: req.session.number } });

  const result = await updateLangSOAP(req.body.number, req.body.lang);
  return {
    code: 0,
    description: "Lang Changed",
  };

  // req.session.viewSubInfo = result;
  // res.render("pages/Home", {
  //   response: { number: req.session.number },
  // });
};
