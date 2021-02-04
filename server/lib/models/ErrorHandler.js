const Feedback = require('../Feedback');
exports.SQLErrorCodeMsg = (errCode, errFields) => {
  let errMsg = '';
  switch (errCode) {
    case 'ER_DUP_ENTRY':
      for (let [k, v] of Object.entries(errFields)) {
        errMsg += `${v} already exists. `;
      }
      break;
  }
  return errMsg;
};

exports.generateErrorFeedback = (error) => {
  let ErrCode;
  let ErrFields;
  let ErrMsg;

  if (error['original']) ErrCode = error['original']['code'];
  if (error['message']) ErrMsg = error['message'];
  if (error['fields']) ErrFields = error['fields'];
  let msg = this.SQLErrorCodeMsg(ErrCode, ErrFields) || ErrMsg;
  return new Feedback(
    null,
    false,
    msg || 'Operation failed, we encountered an error while processing request.'
  );
};

exports.generatePermissionErrorFeedback = () => {
  return new Feedback(
    null,
    false,
    'you are not permitted to perform this request.'
  );
};

exports.generateAuthErrorFeedback = () => {
  let feedback = new Feedback(
    null,
    false,
    'you must login before you perform this request.'
  );
  feedback.isLoggedIn = false;
  return feedback;
};

exports.generateFormErrorFeedack = (formErrors) => {
  return new Feedback(
    formErrors,
    false,
    'this form has error fields. please review the errors and resubmit.'
  );
};
