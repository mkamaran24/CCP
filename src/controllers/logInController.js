// controllers/logInController.js (No significant change needed here)
export const renderLogInPage = (req, res) => {
  // 'response' will be null by default, used for displaying any backend errors
  res.render("pages/login", { response: req.session.isAuthenticated });
};
