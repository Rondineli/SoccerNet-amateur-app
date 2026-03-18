import Router from "next/router";

import { useEffect, useState } from "react";
import Loading from "./loading";


import "bootstrap/scss/bootstrap.scss";

// ========= Plugins CSS START =========
import "../public/css/plugins/feature.css";
import "../public/css/plugins/fontawesome-all.min.css";
import "../public/css/plugins/animation.css";
import "sal.js/dist/sal.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-tooltip/dist/react-tooltip.css";
// ========= Plugins CSS END =========

import "../public/scss/style.scss";

function App(props) {
  const { Component, pageProps } = props;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");

    const handleStart = (url) => url !== Router.asPath && setLoading(true);
    const handleComplete = () => setLoading(false);

    Router.events.on("routeChangeStart", handleStart);
    Router.events.on("routeChangeComplete", handleComplete);
    Router.events.on("routeChangeError", handleComplete);

    return () => {
      Router.events.off("routeChangeStart", handleStart);
      Router.events.off("routeChangeComplete", handleComplete);
      Router.events.off("routeChangeError", handleComplete);
    };
  }, []);

  if (!Component) {
    console.error("Missing <Component /> in _app.js", props);
    return null; // or <Loading /> or custom fallback
  }

  return <>{loading ? <Loading /> : <Component {...pageProps} />}</>;
}

export default App;
