import React from "react";
import Context from "@/context/Context";

import PageHead from "../Head";

import Header from "@/components/Header/Header";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import Footer from "@/components/Footers/Footer";
import Copyright from "@/components/Footers/Copyright";

import CurateComp from "@/components/CurateComp/CurateComp";


const CurateComp2 = () => {
  const menuText = [
    "Process ID",
    "Curate",
    "BenchMark"
  ]
  
  return (
    <>
      <PageHead title="Home" />
      <main className="page-wrapper">
        <Context>
          <Header
            headerTransparent="header-transparent"
            headerSticky="header-sticky"
            btnClass="rainbow-gradient-btn"
            menuText={menuText}
          />
          <PopupMobileMenu />
          <div
            className="slider-area slider-style-1 variation-default slider-bg-image bg-banner1 slider-bg-shape"
            data-black-overlay="1"
          >
            <div
              className="container"
            >
              <div
                className="row justify-content-center"
              >
                <CurateComp />
              </div>
            </div>
          </div>
          <Footer />
          <Copyright />
        </Context>
      </main>
    </>
  );
};


export default CurateComp2;