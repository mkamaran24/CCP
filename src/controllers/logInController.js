// import { connectToLdap } from "../services/ldapService.js";

// export const renderLogInPage = (req, res) => {
//   res.render("pages/login", {
//     response: req.session.isAuthenticated,
//     korekLogoPath: "../img/korekLogo.svg",
//   });
// };

// // TEST LDAP Server
// export const testLdapServer = async (req, res) => {
//   console.log("TESTT");
//   const result = await connectToLdap(req.body.username, req.body.password);
//   res.json({
//     response: { data: result },
//   });
// };

import { connectToLdap } from "../services/ldapService.js";

export const renderLogInPage = (req, res) => {
  res.render("pages/login", {
    response: req.session.isAuthenticated,
    korekLogoPath: "/img/korekLogo.svg", // Changed from ../img to /img
  });
};

// TEST LDAP Server
export const testLdapServer = async (req, res) => {
  console.log("TESTT");
  const result = await connectToLdap(req.body.username, req.body.password);
  res.json({
    response: { data: result },
  });
};
