import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

import MenuData from "../../data/header.json";
import NavProps from "./NavProps";
import menuImg from "../../public/images/menu-img/menu-img-2.png";

const Nav = ({ menuText }) => {
  const router = useRouter();

  const [currentAnchor, setCurrentAnchor] = useState('#');
  const [sectionStates, setSectionStates] = useState({
    Tools: true,
    Pages: true,
  });

  const toggleSection = (subTitle) => {
    console.log(`subTitle set => ${subTitle}`);
    setSectionStates((prevState) => ({
      ...prevState,
      [subTitle]: !prevState[subTitle],
    }));
  };

  useEffect(() => {
    // Check if we are in a client-side environment
    if (typeof window !== 'undefined') {
      // Access the anchor using window.location.hash
      const anchor = window.location.hash;
      console.log('subTitle set  => Anchor:', anchor);
      setCurrentAnchor(anchor);
    }
  }, [router]);


  const isActive = (href) => {
    console.log(`subTitle set  => ${href}:${currentAnchor}:${currentAnchor.startsWith(href)}`)
    return currentAnchor.includes(href);
  };

  return (
    <ul className="mainmenu">
      {menuText && MenuData && MenuData.nav.map((data, index) => {
        const isAnchorLink = data.link.startsWith("#");
        const hasDropdown = data.dropdown || data.megamenu;
        const isOpen = !sectionStates[data.text];

        return (
          <li
            key={index}
            className={`
              ${data.dropdown ? "has-dropdown has-menu-child-item position-relative" : ""}
              ${data.megamenu ? "with-megamenu has-menu-child-item" : ""}
            `}
          >
            {data.link === "#" ? (
              <a
                href="#"
                className={isOpen ? "open" : ""}
                onClick={() => toggleSection(data.text)}
              >
                {menuText[index]}
                {data.isIcon && <i className="fa-regular fa-chevron-down"></i>}
              </a>
            ) : isAnchorLink ? (
              <a className={isActive(data.link) ? "active" : ""} href={data.link} onClick={() => toggleSection(data.text)}>
                {menuText[index]}
                {data.isIcon && <i className="fa-regular fa-chevron-down"></i>}
              </a>
            ) : (
              <Link
                href={data.link}
                onClick={() => toggleSection(data.text)}
                className={isActive(data.link) ? "active" : ""}
              >
                {menuText[index]}
                {data.isIcon && <i className="fa-regular fa-chevron-down"></i>}
              </Link>
            )}

              {data.isMenu &&
              !data.inner &&
              !data.dashboard &&
              !data.upcoming ? (
                <ul
                  className={`submenu ${
                    !sectionStates[data.text] ? "d-block" : ""
                  }`}
                >
                  {data.subItem &&
                    data.subItem.map((innerData, innerIndex) => (
                      <li key={innerIndex}>
                        <Link
                          className={`${
                            isActive(innerData.link) ? "active" : ""
                          } ${innerData.isDisable ? "disabled" : ""}`}
                          href={!innerData.isDisable ? innerData.link : "#"}
                        >
                          <span>{innerData.title}</span>
                          {innerData.badge ? (
                            <div className="rainbow-badge-card badge-sm ml--5">
                              {innerData.badge}
                            </div>
                          ) : (
                            ""
                          )}
                        </Link>
                      </li>
                    ))}
                </ul>
              ) : data.isMenu ? (
                <div
                  className={`rainbow-megamenu ${
                    !sectionStates[data.text] ? "d-block active" : ""
                  }`}
                >
                  <div className="wrapper">
                    <div className="row row--0">
                      <NavProps list={data.inner} />
                      <NavProps list={data.dashboard} />
                      <NavProps list={data.upcoming} />
                      <div className="col-lg-3 single-mega-item">
                        <div className="header-menu-img">
                          <Image
                            src={menuImg}
                            width={326}
                            height={458}
                            alt="Menu Split Image"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
            </li>
          )
        })}
    </ul>
  );
};

export default Nav;
