import denso from "@/app/assets/denso-logo.png";
import Image from "next/image";
import React from "react";

export const Navbar = () => {
  return (
    <div
      style={{
        borderBottom: "5px solid lightgray",
        display: "flex",
        flex: "1",
      }}
    >
      <div>
        <Image
          src={denso}
          alt="denso"
          width={170}
          height={85}
          priority={true}
        ></Image>
      </div>
      <div style={{ paddingLeft: "40%", fontSize: 40, paddingTop: "1rem" }}>
        Admin
      </div>
    </div>
  );
};

export default Navbar;
