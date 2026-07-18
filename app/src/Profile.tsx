import React from "react";

export default function Profile({
  user,
  onBack
}: any) {

  return (

    <div className="profile">

      <button
        className="back-btn"
        onClick={onBack}
      >
        ← Back
      </button>


      <div className="profile-avatar">

        {user.name
          ? user.name.charAt(0).toUpperCase()
          : "F"
        }

      </div>


      <h1>
        {user.name}
      </h1>


      <p>
        {user.phone}
      </p>


    </div>

  );

}