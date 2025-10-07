import { Copy, Globe, Send, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const InviteCard = () => {
  const [isPublic, setIsPublic] = useState(false);
  const toggleStatus = () => {
    setIsPublic(!isPublic);
  };
  return (
    <div className="bg-white shadow-md rounded-md w-[22rem] px-3 py-2.5 flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <div className="text-black font-bold text-xl">Share</div>
        <div className="flex flex-col">
          <div className="bg-gray-50 rounded-md flex items-center justify-between p-2">
            <div className="flex items-center gap-2 justify-between">
              <div className="bg-white p-1.5 shadow-md rounded-md">
                <Globe className="size-7 text-gray-400" />
              </div>
              <div className="flex flex-col">
                <p className="text-base font-medium leading-4">Anyone</p>
                <p className="text-gray-500 text-sm">
                  Everyone with link can access
                </p>
              </div>
            </div>
            <button
              className={`relative inline-flex h-5 w-8 items-center cursor-pointer rounded-full transition-colors focus:outline-none ${
                isPublic ? "bg-gray-400" : "bg-black"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleStatus();
              }}
              aria-pressed={isPublic}
              tabIndex={0}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? "translate-x-0.5" : "translate-x-3.5"
                }`}
              />
            </button>
          </div>
        </div>
        <div className="bg-gray-50/50 w-full flex items-center justify-between text-sm rounded-sm p-1">
          <p className="text-gray-400">acme.com/enterprice/note/1234</p>
          <Copy className="size-4 text-gray-400" />
        </div>
      </div>
      <AnimatePresence>
        {isPublic && (
          <motion.div
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 250 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ duration: 0.22, ease: "linear" }}
            className="flex items-center justify-center p-2 overflow-hidden"
          >
            <div className="w-full max-w-md">
              <h2 className="text-lg font-medium text-gray-500 mb-1">Invite</h2>

              <div className="flex items-center gap-2 bg-white rounded-md border border-gray-300 px-3 py-1 shadow-sm">
                <UserPlus className="w-5 h-5 text-gray-400 flex-shrink-0" />

                <input
                  type="email"
                  placeholder="Enter email to share"
                  className="flex-1 outline-none text-gray-600 placeholder-gray-400 focus:border-black outline-1"
                />

                <button className="bg-black text-white rounded-md px-2 py-0.5 flex items-center gap-1 hover:bg-gray-800 transition-colors flex-shrink-0">
                  <Send className="w-4 h-4" />
                  <span className="">Invite</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InviteCard;
