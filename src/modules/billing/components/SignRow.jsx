import React from 'react';

export const SignRow = ({ shopName }) => {
  return (
    <>
      <div className="sign-row">
        <div className="sign-box">
          <div className="sign-for">For {shopName || "Your Business"}</div>
          <div className="sign-line">Authorized Signatory</div>
        </div>
      </div>
      <div className="inv-note">
        This is a computer-generated invoice. No manual signature required if authenticated electronically.
      </div>
    </>
  );
};
