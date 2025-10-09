import { Copy, X } from "lucide-react";
import { AnimatePresence, cubicBezier, motion } from "motion/react";
import { useState, useId } from "react";
import { HugeiconsGlobe02 } from "./icons/IconGlobe";
import HeroiconsUserPlus from "./icons/IconPlus";
import { HeroiconsPaperAirplane16Solid } from "./icons/IconSend";

const InviteCard = () => {
  const [isPublic, setIsPublic] = useState(false);
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState<string | null>(null);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const id = useId();

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg w-[22rem] border-[1px] border-gray-200 px-3 py-2.5 flex flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <div className="text-black font-bold text-xl">Share</div>

          <div className="flex flex-col">
            <div className="bg-gray-100 rounded-lg flex items-center justify-between p-2 pr-3.5">
              <div className="flex items-center gap-2 justify-between">
                <div className="bg-white p-1.5 shadow-md rounded-md">
                  <HugeiconsGlobe02 className="w-7 h-7 text-gray-500" />
                </div>
                <div className="flex flex-col">
                  <p className="text-base font-medium leading-4">Anyone</p>
                  <p className="text-gray-500 text-sm">
                    Everyone with link can access
                  </p>
                </div>
              </div>

              <button
                className={`relative inline-flex h-5 w-8 items-center rounded-full transition-colors focus:outline-none ${
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
            <Copy className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isPublic && (
            <motion.div
              initial={{ maxHeight: 0 }}
              animate={{
                maxHeight: 350,
                transition: {
                  duration: 0.26,
                  ease: cubicBezier(0.55, 0.085, 0.68, 0.53),
                },
              }}
              exit={{
                maxHeight: 0,
                transition: {
                  duration: 0.27,
                  ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
                },
              }}
              className="flex flex-col overflow-hidden"
            >
              <div className="w-full">
                <h2 className="text-base font-medium text-gray-500 mb-1">
                  Invite
                </h2>

                {/* Input Area */}
                <div className="relative">
                  <motion.div className="flex justify-between items-center bg-white rounded-md border border-gray-300 px-2 pr-1 py-1 shadow-sm">
                    <div className="flex items-center gap-2 flex-1">
                      <HeroiconsUserPlus className="w-5 h-5 text-gray-400 flex-shrink-0" />

                      <AnimatePresence mode="wait">
                        {validEmail ? (
                          <motion.div
                            key={`pill-${validEmail}-${id}`}
                            layoutId={`email-${validEmail}-${id}`}
                            // initial={{ opacity: 0, scale: 0.8 }}
                            // animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-1 bg-white shadow-lg border-[1px] border-gray-100 shadow-gray-100 rounded-full px-2 py-0.5"
                          >
                            <motion.div layoutId={`avatar-${validEmail}-${id}`}>
                              <img
                                src="https://i.pravatar.cc/150?img=12"
                                alt="avatar"
                                className="w-5 h-5 rounded-full"
                              />
                            </motion.div>
                            <motion.span
                              layoutId={`name-${validEmail}-${id}`}
                              layout="position"
                              transition={{ duration: 0.08 }}
                              className="text-gray-700 text-sm font-medium leading-[13px] capitalize"
                            >
                              {extractName(validEmail)}
                            </motion.span>
                            <motion.button
                              layoutId={`remove-${validEmail}-${id}`}
                              onClick={handleRemoveEmail}
                              className="text-gray-400 hover:text-gray-600"
                              layout="position"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.input
                            key="input"
                            type="email"
                            value={email}
                            onChange={handleInviteInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter email to share"
                            className="flex-1 outline-none text-gray-600 placeholder-gray-500 focus:border-black"
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      onClick={handleInvite}
                      className="bg-black text-white rounded-md px-2 py-[3px] flex items-center gap-0.5 flex-shrink-0"
                    >
                      <HeroiconsPaperAirplane16Solid className="w-4 h-4" />
                      <span className="">Invite</span>
                    </motion.button>
                  </motion.div>
                </div>

                <AnimatePresence mode="wait">
                  {invitedEmails.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, maxHeight: 0 }}
                      animate={{
                        maxHeight: 400,
                        opacity: 1,
                        transition: {
                          duration: 0.26,
                          ease: cubicBezier(0.55, 0.085, 0.68, 0.53),
                        },
                      }}
                      exit={{
                        maxHeight: 0,
                        opacity: 0,
                        transition: {
                          duration: 0.27,
                          ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
                        },
                      }}
                      className="mt-3 space-y-2"
                    >
                      {invitedEmails.map((invitedEmail) => (
                        <motion.div
                          key={`invited-${invitedEmail}-${id}`}
                          layoutId={`email-${invitedEmail}-${id}`}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-end justify-between shadow-md border-[1px] border-gray-200 rounded-lg p-2"
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              layoutId={`avatar-${invitedEmail}-${id}`}
                            >
                              <img
                                src="https://i.pravatar.cc/150?img=12"
                                alt="avatar"
                                className="w-8 h-8 rounded-full"
                              />
                            </motion.div>
                            <div className="flex flex-col">
                              <motion.span
                                layoutId={`name-${invitedEmail}-${id}`}
                                layout="position"
                                className="text-gray-700 text-sm font-medium leading-[13px] capitalize"
                              >
                                {extractName(invitedEmail)}
                              </motion.span>
                              <span className="text-xs text-gray-500">
                                {invitedEmail}
                              </span>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handleRemoveInvited(invitedEmail)}
                            layoutId={`remove-${invitedEmail}-${id}`}
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
    </div>
  );
};

export default InviteCard;
