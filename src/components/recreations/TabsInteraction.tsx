import { LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { MaterialSymbolsNotificationsRounded } from "../icons/IconNotifications";
import { MaterialSymbolsMailRounded } from "../icons/IconMail";
import { FluentCalendar16Filled } from "../icons/IconCalendar";

type Tabs = "inbox" | "planner" | "alerts";

const TabsInteraction = () => {
  const [activeTab, setActiveTab] = useState<Tabs>("inbox");

  return (
    <div className="flex items-center justify-center">
      <LayoutGroup>
        <div className="flex items-center justify-center gap-2.5">
          <motion.div
            initial={false}
            animate={{ width: activeTab === "inbox" ? 110 : 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-12 bg-white rounded-full flex items-center cursor-pointer overflow-hidden relative will-change-transform"
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab("inbox")}
          >
            <div className="absolute left-3 flex items-center justify-center w-6 h-6">
              <MaterialSymbolsMailRounded
                className={`
                  ${activeTab === "inbox" ? "text-blue-600" : "text-black"}
                  size-8
                `}
              />
            </div>
            <motion.span
              initial={false}
              animate={{
                opacity: activeTab === "inbox" ? 1 : 0,
                x: activeTab === "inbox" ? 0 : -20,
              }}
              transition={{ duration: 0.2 }}
              className="ml-10 whitespace-nowrap font-semibold relative"
            >
              <span
                className={
                  activeTab === "inbox" ? "text-blue-600" : "text-black"
                }
              >
                Inbox
              </span>
              {activeTab === "inbox" && (
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                  style={{ mixBlendMode: "overlay" }}
                />
              )}
            </motion.span>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ width: activeTab === "planner" ? 110 : 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-12 bg-white rounded-full flex items-center cursor-pointer overflow-hidden relative will-change-transform"
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab("planner")}
          >
            <div className="absolute left-3 flex items-center justify-center w-6 h-6">
              <FluentCalendar16Filled
                className={`
                  ${
                    activeTab === "planner" ? "text-red-400" : "text-black"
                  } size-8
                  `}
              />
            </div>
            <motion.span
              initial={false}
              animate={{
                opacity: activeTab === "planner" ? 1 : 0,
                x: activeTab === "planner" ? 0 : -20,
              }}
              transition={{ duration: 0.2 }}
              className="ml-10 whitespace-nowrap font-semibold relative"
            >
              <span
                className={
                  activeTab === "planner" ? "text-red-400" : "text-black"
                }
              >
                Planner
              </span>
              {activeTab === "planner" && (
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                  style={{ mixBlendMode: "overlay" }}
                />
              )}
            </motion.span>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ width: activeTab === "alerts" ? 110 : 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-12 bg-white rounded-full flex items-center cursor-pointer overflow-hidden relative will-change-transform"
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab("alerts")}
          >
            <div className="absolute left-3 flex items-center justify-center w-6 h-6">
              <MaterialSymbolsNotificationsRounded
                className={`
                  ${
                    activeTab === "alerts" ? "text-red-600" : "text-black"
                  } size-8
                  `}
              />
            </div>
            <motion.span
              initial={false}
              animate={{
                opacity: activeTab === "alerts" ? 1 : 0,
                x: activeTab === "alerts" ? 0 : -20,
              }}
              transition={{ duration: 0.2 }}
              className="ml-10 whitespace-nowrap font-semibold relative"
            >
              <span
                className={
                  activeTab === "alerts" ? "text-red-600" : "text-black"
                }
              >
                Alerts
              </span>
              {activeTab === "alerts" && (
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                  style={{ mixBlendMode: "overlay" }}
                />
              )}
            </motion.span>
          </motion.div>
        </div>
      </LayoutGroup>
    </div>
  );
};

export default TabsInteraction;
