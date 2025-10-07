import { Copy, Globe, Send, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const InviteCard = () => {
  const [isPublic, setIsPublic] = useState(false);
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState<string | null>(null);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const toggleStatus = () => setIsPublic(!isPublic);

  const handleInviteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (validateEmail(email)) {
        setValidEmail(email);
        setEmail("");
      }
    }
  };

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleRemoveEmail = () => setValidEmail(null);

  const handleInvite = () => {
    if (validEmail) {
      setInvitedEmails([...invitedEmails, validEmail]);
      setValidEmail(null);
    }
  };

  const handleRemoveInvited = (emailToRemove: string) => {
    setInvitedEmails(invitedEmails.filter((e) => e !== emailToRemove));
  };

  const extractName = (email: string) => {
    return email.split("@")[0].split(".")[0];
  };

  return (
    <div className="bg-white shadow-md rounded-lg w-[22rem] border-[1px] border-gray-100 px-3 py-2.5 flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <div className="text-black font-bold text-xl">Share</div>

        <div className="flex flex-col">
          <div className="bg-gray-100 rounded-lg flex items-center justify-between p-2">
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

      <AnimatePresence mode="wait">
        {isPublic && (
          <motion.div
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 350 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ duration: 0.23, ease: "linear" }}
            className="flex flex-col overflow-hidden"
          >
            <div className="w-full">
              <h2 className="text-lg font-medium text-gray-500 mb-1">Invite</h2>

              {/* Input Area */}
              <div className="relative">
                <motion.div className="flex justify-between items-center bg-white rounded-md border border-gray-300 px-2 pr-1 py-1 shadow-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <UserPlus className="w-5 h-5 text-gray-400 flex-shrink-0" />

                    <AnimatePresence mode="wait">
                      {validEmail ? (
                        <motion.div
                          key="valid-email"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{
                            opacity: 0,
                            scale: 0.95,
                            transition: { duration: 0.15 },
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 25,
                          }}
                          className="flex items-center gap-1 bg-white drop-shadow-lg shadow-gray-100 rounded-full px-2 py-0.5"
                        >
                          <motion.img
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.05 }}
                            src={`https://ui-avatars.com/api/?name=${extractName(
                              validEmail
                            )}&background=random&size=24`}
                            alt="avatar"
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-gray-700 text-sm font-medium capitalize">
                            {extractName(validEmail)}
                          </span>
                          <button
                            onClick={handleRemoveEmail}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ) : (
                        <input
                          type="email"
                          value={email}
                          onChange={handleInviteInput}
                          onKeyDown={handleKeyDown}
                          placeholder="Enter email to share"
                          className="flex-1 outline-none text-gray-600 placeholder-gray-400 focus:border-black"
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    onClick={handleInvite}
                    className="bg-black text-white rounded-md px-2 py-0.5 flex items-center gap-1 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>Invite</span>
                  </motion.button>
                </motion.div>
              </div>

              <AnimatePresence>
                {invitedEmails.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, maxHeight: 0 }}
                    animate={{ opacity: 1, maxHeight: 400 }}
                    exit={{ opacity: 0, maxHeight: 0 }}
                    transition={{ duration: 0.25, ease: "linear" }}
                    className="mt-3 space-y-2"
                  >
                    {invitedEmails.map((invitedEmail) => (
                      <motion.div
                        initial={{ opacity: 0, maxHeight: 0 }}
                        animate={{ opacity: 1, maxHeight: 400 }}
                        exit={{ opacity: 0, maxHeight: 0 }}
                        transition={{ duration: 0.26, ease: "linear" }}
                        className="flex items-end justify-between shadow-md border-[1px] border-gray-200 rounded-lg p-2"
                      >
                        <div className="flex items-center gap-2">
                          <motion.img
                            src={`https://ui-avatars.com/api/?name=${extractName(
                              invitedEmail
                            )}&background=random&size=32`}
                            alt="avatar"
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium capitalize leading-[13px] text-gray-900">
                              {extractName(invitedEmail)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {invitedEmail}
                            </span>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => handleRemoveInvited(invitedEmail)}
                          className="text-red-800/60 transition-colors"
                        >
                          <span className="text-sm">Remove</span>
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InviteCard;
