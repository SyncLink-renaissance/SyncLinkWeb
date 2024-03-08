import { useEffect, useRef, useState } from "react";
import { getUserDataById, getUserIdByUsername } from "../hooks/firebaseInteraction"; // Adjust these imports based on your web project structure
import { ExternalLink, Link, MapPin, Moon, Share, Sun } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import linkedinIcon from "../assets/images/linkedinIcon.png";
import telegramIcon from "../assets/images/telegramIcon.png";
import discordIcon from "../assets/images/discordIcon.png";
import xIcon from "../assets/images/xIcon.png";
import instagramIcon from "../assets/images/instagramIcon.png";
import tiktokIcon from "../assets/images/tiktokIcon.png";
import facebookIcon from "../assets/images/facebookIcon.png";
import snapchatIcon from "../assets/images/snapchatIcon.png";
import peerpayLogo from "../assets/images/peerpayLogo.png";
import githubIcon from "../assets/images/githubIcon.png";
import figmaIcon from "../assets/images/figmaIcon.png";
import calendlyIcon from "../assets/images/calendlyIcon.png";
import calIcon from "../assets/images/calIcon.png";
import dribbbleIcon from "../assets/images/dribbbleIcon.png";
import whatsappIcon from "../assets/images/whatsappIcon.png";
import behanceIcon from "../assets/images/behanceIcon.png";
import redditIcon from "../assets/images/redditIcon.png";
import mediumIcon from "../assets/images/mediumIcon.png";
import artstationIcon from "../assets/images/artstationIcon.png";
import pinterestIcon from "../assets/images/pinterestIcon.png";
import peerlinkIcon from "../assets/onlyIcon.svg";
// import peerlinkIconBlack from "../assets/onlyIconBlack.svg";
import LoadingPage from "./LoadingPage";
import useDarkMode from "../hooks/useDarkMode";
import DocumentMeta from "react-document-meta";
// Define types for your user data based on your Firebase structure
type UserData = {
  pfp: string;
  fName: string;
  sName: string;
  mainSkill: string;
  region: string;
  about: string;
  linkedSocials: any[];
  externalLinks: any[];
  skills: string[];
  email?: string;
  phoneNumber?: string;
};

const Peerlink = ({ mainScroll }: { mainScroll?: any }) => {
  const navigate = useNavigate();
  const socialScrollRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useDarkMode();
  const [fetchedUserData, setFetchedUserData] = useState<UserData | null>(null);
  const { username } = useParams<{ username: string }>();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isStickyHeaderVisible, setIsStickyHeaderVisible] = useState(false);
  const [meta, setMeta] = useState<object>();
  // const [userId, setUserId] = useState("");
  useEffect(() => {
    const fetchUserData = async (userId: string) => {
      const userData = await getUserDataById(userId);
      if (userData) {
        setFetchedUserData(userData);
      } else {
        alert("Error loading user info");
      }
      const tMeta = {
        title: username ? `${username}'s Peerlink` : "Peerlink",
        url: window.location.href,
        description: `Explore ${username}'s Peerlink and connect!`,
        image:
          "https://firebasestorage.googleapis.com/v0/b/peerlink-d88a0.appspot.com/o/og%3Aimages%2Fog_image_0XVNzerwAid0tYa18AKsJ7kH49Z2.jpg?alt=media&token=f5416daa-2643-4bf4-b23f-a890ce85dc2f",
      };
      setMeta(tMeta);
    };

    const loadUser = async () => {
      if (!username) {
        navigate("/"); /// should direct to username unvalible page.
        return;
      }
      const tUserId = await getUserIdByUsername(username);
      console.log("userid", tUserId);
      if (tUserId === undefined) {
        navigate("/"); /// should direct to username unvalible page.
        return;
      }
      fetchUserData(tUserId);
      // setUserId(tUserId);
    };
    console.log("username is:", username);
    loadUser();
  }, []);

  useEffect(() => {
    console.log("mainScroll", mainScroll?.target.scrollTop);
    const threshold = 285;
    setIsStickyHeaderVisible(mainScroll?.target.scrollTop > threshold);
  }, [mainScroll]);
  useEffect(() => {
    console.log("isStickyHeaderVisible", isStickyHeaderVisible);
  }, [isStickyHeaderVisible]);

  const socialIcons: Record<string, any> = {
    linkedin: linkedinIcon,
    telegram: telegramIcon,
    discord: discordIcon,
    x: xIcon,
    instagram: instagramIcon,
    tiktok: tiktokIcon,
    facebook: facebookIcon,
    snapchat: snapchatIcon,
  };

  const socialLinks: Record<string, any> = {
    linkedin: "https://www.linkedin.com/in/",
    telegram: "https://t.me/",
    discord: "https://discordapp.com/users/",
    x: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    snapchat: "",
  };

  const getLinkAddOn = (platform: string, infoAsJson: any) => {
    switch (platform.toLowerCase()) {
      case "discord":
        return infoAsJson.id;

      case "telegram":
        return infoAsJson.username;
      case "linkedin":
        return infoAsJson.username;

      default:
        break;
    }
  };

  const isDragging = useRef(false);
  const startPos = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: any) => {
    if (!socialScrollRef.current) return;

    isDragging.current = true;
    startPos.current = e.pageX - socialScrollRef.current.offsetLeft;
    scrollLeft.current = socialScrollRef.current.scrollLeft;
  };

  const onMouseMove = (e: any) => {
    if (!isDragging.current) return;
    if (!socialScrollRef.current) return;
    e.preventDefault(); // Prevents selecting text while dragging
    const x = e.pageX - socialScrollRef.current.offsetLeft;
    const walk = (x - startPos.current) * 2; // The number 2 will speed up the scroll
    socialScrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  const externalLinkIcons = [
    { name: "External link", icon: "" }, // Assuming no icon for generic external links
    { name: "PeerPay", icon: peerpayLogo },
    { name: "Github", icon: githubIcon },
    { name: "Figma file", icon: figmaIcon },
    { name: "Calendly", icon: calendlyIcon },
    { name: "Cal.com", icon: calIcon },
    { name: "Dribbble", icon: dribbbleIcon },
    { name: "Discord server", icon: discordIcon },
    { name: "Whatsapp chat", icon: whatsappIcon },
    { name: "Telegram group", icon: telegramIcon },
    { name: "Behance", icon: behanceIcon },
    { name: "Reddit", icon: redditIcon },
    { name: "Medium", icon: mediumIcon },
    { name: "ArtStation", icon: artstationIcon },
    { name: "Pinterest", icon: pinterestIcon },
  ];
  if (!fetchedUserData) return <LoadingPage />;
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${username}'s PeerLink`,
          url: window.location.href,
        });
        console.log("Page shared successfully");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      console.log("Web Share API not supported.");
    }
  };

  return (
    <>
      <DocumentMeta {...meta} />
      <div className="bg-backgroundLight dark:bg-backgroundDark flex flex-col min-h-screen p-4 mt-0 ">
        {isStickyHeaderVisible && (
          <div className="fixed top-3 left-0 right-0 z-50 px-4">
            <div className="flex flex-row items-center mx-auto max-w-3xl bg-boxesLight dark:bg-boxes py-2 rounded-full px-3 border border-primary shadow-2xl">
              <img src={fetchedUserData.pfp} alt="Profile" className="w-12 h-12 rounded-full object-cover mr-4" />
              <div className="flex flex-col">
                {/* Adjusted the username to be larger */}
                <p className="text-lg font-bold text-black dark:text-white mb-0">{username}</p>
                <p className="text-sm font-medium text-black dark:text-white mt-0 text-opacity-80">
                  {fetchedUserData.mainSkill}
                </p>
              </div>
              <button
                onClick={() => toggleTheme()}
                className="flex ml-auto items-center justify-center p-2 bg-boxesLight dark:bg-boxes rounded-full">
                {theme === "dark" ? <Sun className="text-white w-6 h-6" /> : <Moon className="text-primary w-6 h-6" />}
              </button>
              <button
                onClick={() => handleShare()}
                className="flex items-center justify-center p-2 bg-boxesLight dark:bg-boxes rounded-full ml-2">
                {theme === "dark" ? (
                  <Share className="text-white w-6 h-6" />
                ) : (
                  <Share className="text-primary w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        )}
        {/* User profile and info */}
        <div className="flex justify-between items-center w-full mb-7 ">
          <button
            onClick={() => toggleTheme()}
            className="flex  w-24 items-start justify-center py-1.5 bg-boxesLight dark:bg-boxes rounded-full mb-5">
            {theme === "dark" ? <Sun className="text-white w-6 h-6" /> : <Moon className="text-primary w-6 h-6" />}
          </button>
          <button
            onClick={() => handleShare()}
            className="flex  w-24 items-start justify-center py-1.5 bg-boxesLight dark:bg-boxes rounded-full mb-5">
            {theme === "dark" ? <Share className="text-white w-6 h-6" /> : <Share className="text-primary w-6 h-6" />}
          </button>
        </div>
        {fetchedUserData && (
          <div className="flex flex-col items-center mb-10">
            {fetchedUserData.pfp ? (
              <div className="relative mb-4">
                <div className="absolute -inset-8 rounded-full bg-primary dark:opacity-30 opacity-50  filter blur-2xl"></div>
                <img
                  src={fetchedUserData.pfp}
                  alt="Profile"
                  className="relative z-10 w-24 h-24 rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="relative flex items-center justify-center w-24 h-24 mb-4">
                <div className="absolute -inset-10 rounded-full bg-primary opacity-30 filter blur-2xl"></div>
                <h1 className="relative z-10 text-4xl text-black dark:text-white">
                  {fetchedUserData.fName.charAt(0).toUpperCase()}
                </h1>
              </div>
            )}
            <h1 className="text-black dark:text-white text-2xl mb-2">
              {fetchedUserData.fName} {fetchedUserData.sName}
            </h1>
            {/* Additional user info (skills, region, etc.) */}
            <div className="flex flex-row items-center">
              <div
                className="relative flex items-center"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}>
                <div className="w-28 h-9 rounded-full px-2.5 bg-boxesLight dark:bg-boxes flex items-center justify-center">
                  <p className="text-sm font-medium text-black dark:text-white text-center truncate">
                    {fetchedUserData?.mainSkill}
                  </p>
                </div>
                {showTooltip && (
                  <div className="absolute z-10 w-auto px-4 py-2 -mt-1 mb-1 text-sm text-black dark:text-white bg-primary rounded-2xl shadow-lg bottom-full left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    {fetchedUserData?.mainSkill}
                  </div>
                )}
              </div>

              <div className="w-28 h-9 rounded-full px-1 bg-boxesLight dark:bg-boxes flex items-center justify-center ml-2">
                <MapPin className="w-3.5 h-3.5 mr-1 " />
                <p className="text-sm font-medium text-black dark:text-white text-center truncate">
                  {fetchedUserData?.region}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Example for handling links and actions */}
        <div className="flex flex-col">
          <div className="text-black dark:text-white text-left  mb-4">
            <h2 className="text-lg font-semibold mb-4">About</h2>
            <p className="text-lg font-normal text-black dark:text-white text-opacity-65 mb-5 leading-5">
              {fetchedUserData?.about}
            </p>
          </div>
          {fetchedUserData && fetchedUserData.linkedSocials.length > 0 && (
            <div className="text-black dark:text-white mb-5">
              <h2 className="text-lg font-semibold mb-4">Social networks</h2>
              <div
                ref={socialScrollRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseUp} // Stops scrolling if the user drags out of the container
                onMouseUp={onMouseUp}
                className="flex overflow-x-auto mb-5 space-x-2 pb-1">
                {fetchedUserData.linkedSocials.map((socialMap, index) => {
                  const platform = Object.keys(socialMap)[0];
                  const infoAsJson = JSON.parse(socialMap[platform]);
                  const iconSource = socialIcons[platform.toLowerCase()];
                  if (!iconSource) {
                    console.warn(`Icon not found for platform: ${platform}`);
                    return null; // Skip rendering if icon not found
                  }
                  const linkAddOn = getLinkAddOn(platform, infoAsJson);
                  return (
                    <a
                      key={index}
                      href={`${socialLinks[platform]}${linkAddOn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-boxesLight dark:bg-boxes px-6 py-2 rounded-full border border-primary space-x-2 whitespace-nowrap overflow-hidden"
                      style={{ minWidth: "min-content" }}>
                      <img
                        src={iconSource}
                        alt={platform}
                        className="w-6 h-6 rounded-full" // Adjust size as needed
                      />
                      <span className="text-sm font-medium text-text ">{infoAsJson.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
          {fetchedUserData && fetchedUserData.externalLinks.length > 0 && (
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-black dark:text-white mb-4">External links</h2>
              <div className="flex flex-col space-y-4 overflow-auto mb-5">
                {fetchedUserData.externalLinks.map((link, index) => (
                  <a
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={index}
                    className="flex items-center justify-between p-3 bg-boxesLight dark:bg-boxes rounded-2xl space-x-2 hover:bg-opacity-90 transition duration-150 ease-in-out w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(link.link);
                    }}>
                    <div className="flex flex-row">
                      {externalLinkIcons.find((iconItem) => link.type === iconItem.name)?.icon ? (
                        <img
                          src={externalLinkIcons.find((iconItem) => link.type === iconItem.name)?.icon}
                          alt={link.type}
                          className="w-9 h-9 mr-4"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center mr-4">
                          {/* Placeholder for when there's no icon. Adjust as necessary */}
                          <Link color="white" />
                        </div>
                      )}
                      <div>
                        <p className="text-md font-semibold text-black dark:text-white">{link.name}</p>
                        <p className="text-sm font-medium text-black dark:text-white text-opacity-65">
                          {link.link.replace(/^https?:\/\//, "")}
                        </p>
                      </div>
                    </div>
                    <span className="ml-auto text-black dark:text-white">
                      {/* Assuming ExternalLink is a component. Adjust as necessary */}
                      <ExternalLink className="w-6 h-6" /> {/* Adjust icon size as needed */}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4 ">Roles </h2>
            <div className="flex flex-wrap  mb-8 gap-2">
              {fetchedUserData?.skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-opacity-15 bg-boxesLight dark:bg-boxes text-black dark:text-white text-center py-2 px-5 rounded-full">
                  <span className="text-sm font-medium">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
          <div className="flex justify-center">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://apps.apple.com/us/app/solflare-solana-wallet/id1580902717"
              className="flex items-center justify-center px-6 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-500 transition-colors">
              <img src={peerlinkIcon} className="w-6 h-6 mr-2" alt="Peerlink Icon" />
              <span>Connect</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Peerlink;
