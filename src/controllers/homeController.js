import {
  sendViewSubscriberSOAP,
  updateLangSOAP,
  updateMainBalanceSOAP,
} from "../services/homeService.js";

export const renderViewHomePage = (req, res) => {
  const fullUsername = req.session.username;
  const firstName = fullUsername.split(".")[0];
  const hResult = req.session.header;

  res.render("pages/Home", {
    response: {
      number: req.session.number,
      header: hResult,
      username: firstName,
    },
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

  req.session.header = hResult;

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
  res.json({
    code: 0,
    description: "Lang Updated Successfully",
  });

  // req.session.viewSubInfo = result;
  // res.render("pages/Home", {
  //   response: { number: req.session.number },
  // });
};

// export const handleUpdateMainBalance = async (req, res) => {
//   let adjustment = Number(req.body.adjustment);

//   if (adjustment < 0) {
//     adjustment = Math.abs(adjustment);
//   }
//   const result = await updateMainBalanceSOAP(req.body.number, adjustment);

//   const status = result.code > 0 ? 404 : 200;
//   res.status(status).json({
//     code: result.code,
//     description: result.description,
//   });
// };

export const handleUpdateMainBalance = async (req, res) => {
  try {
    let adjustment = Number(req.body.adjustment);

    // ✅ Handle invalid or missing values
    if (isNaN(adjustment)) {
      return res.status(400).json({
        code: -1,
        description: "Invalid adjustment value",
      });
    }

    // ✅ Convert negative to positive only if needed
    if (adjustment < 0) {
      adjustment = Math.abs(adjustment);
    }

    // ✅ Call SOAP function
    const result = await updateMainBalanceSOAP(req.body.number, adjustment);

    // ✅ Send proper status and response
    const status = result.code > 0 ? 404 : 200;
    res.status(status).json({
      code: result.code,
      description: result.description,
    });
  } catch (error) {
    console.error("Error in handleUpdateMainBalance:", error);
    res.status(500).json({
      code: -1,
      description: "Internal server error",
    });
  }
};
