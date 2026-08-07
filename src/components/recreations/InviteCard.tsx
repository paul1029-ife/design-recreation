"use client";

import { Check, Copy, X } from "lucide-react";
import { AnimatePresence, cubicBezier, motion } from "motion/react";
import { useState, useId } from "react";
import { HugeiconsGlobe02 } from "../icons/IconGlobe";
import HeroiconsUserPlus from "../icons/IconPlus";
import { HeroiconsPaperAirplane16Solid } from "../icons/IconSend";

const InviteCard = () => {
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState<string | null>(null);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const url = "acme.com/enterprise/note/1234";
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

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleRemoveEmail = () => setValidEmail(null);

  const handleInvite = () => {
    if (validEmail) {
      setInvitedEmails([...invitedEmails, validEmail]);
      setValidEmail(null);
      setIsFocused(false);
    }
  };

  const handleRemoveInvited = (emailToRemove: string) => {
    setInvitedEmails(invitedEmails.filter((e) => e !== emailToRemove));
  };

  const extractName = (email: string) => email.split("@")[0].split(".")[0];

  return (
    <div
      className="flex items-center justify-center p-4"
    >
      <div className="bg-surface shadow-md rounded-lg w-[22rem] border border-border px-3 py-2.5 flex flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <div className="text-content font-semibold text-xl">Share</div>

          <div className="flex flex-col">
            <div className="bg-surface-subtle rounded-lg flex items-center justify-between p-2 pr-3.5">
              <div className="flex items-center gap-2 justify-between">
                <div className="bg-surface p-1.5 shadow-sm rounded-md">
                  <HugeiconsGlobe02 className="w-7 h-7 text-content-muted" />
                </div>
                <div className="flex flex-col">
                  <p className="text-base font-medium text-content leading-4">
                    Anyone
                  </p>
                  <p className="text-content-subtle text-sm truncate">
                    Everyone with link can access
                  </p>
                </div>
              </div>

              <button
                className={`relative inline-flex h-5 w-8 items-center rounded-full transition-colors focus:outline-none ${
                  isPublic ? "bg-surface-active" : "bg-border-strong"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStatus();
                }}
                aria-pressed={isPublic}
                tabIndex={0}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${
                    isPublic ? "translate-x-0.5" : "translate-x-3.5"
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="bg-surface-subtle w-full flex items-center justify-between text-sm rounded-sm p-1">
            <p className="text-content-subtle truncate">{url}</p>
            <motion.button
              onClick={() => handleCopy(url)}
              whileTap={{ scale: 0.85 }}
              className="relative flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.6, rotate: 45 }}
                    transition={{ duration: 0.16 }}
                  >
                    <Check className="w-4 h-4 text-content-muted" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.6, rotate: 15 }}
                    transition={{ duration: 0.17 }}
                  >
                    <Copy className="w-4 h-4 text-content-muted" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
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
                <h2 className="text-base font-medium text-content-muted mb-1">
                  Invite
                </h2>

                <div className="relative">
                  <motion.div
                    className={`flex items-center bg-surface rounded-lg border px-2 py-1 shadow-sm transition-colors ${
                      isFocused && !validEmail
                        ? "border-border-strong border-2"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <HeroiconsUserPlus className="w-5 h-5 text-content-subtle flex-shrink-0" />

                      <AnimatePresence mode="wait">
                        {validEmail ? (
                          <motion.div
                            key={`pill-${validEmail}-${id}`}
                            layoutId={`email-${validEmail}-${id}`}
                            transition={{ duration: 0.17 }}
                            className="flex items-center gap-1 bg-surface shadow border border-border rounded-full px-2 py-0.5"
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
                              className="text-content-muted text-sm font-medium leading-[13px] capitalize"
                            >
                              {extractName(validEmail)}
                            </motion.span>
                            <motion.button
                              layoutId={`remove-${validEmail}-${id}`}
                              onClick={handleRemoveEmail}
                              className="text-content-subtle hover:text-content-muted"
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
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Enter email to share"
                            className="outline-none text-content-muted placeholder-content-subtle flex-1 min-w-0"
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      onClick={handleInvite}
                      className="bg-accent text-accent-content text-sm rounded-md px-2 py-[3px] flex items-center gap-0.5 flex-shrink-0 relative left-1"
                    >
                      <HeroiconsPaperAirplane16Solid className="w-4 h-4" />
                      <span>Invite</span>
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
                        transition: { duration: 0.26 },
                      }}
                      exit={{
                        maxHeight: 0,
                        opacity: 0,
                        transition: { duration: 0.25 },
                      }}
                      className="mt-3 space-y-2"
                    >
                      {invitedEmails.map((invitedEmail) => (
                        <motion.div
                          key={`invited-${invitedEmail}-${id}`}
                          layoutId={`email-${invitedEmail}-${id}`}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-end justify-between shadow-sm border border-border rounded-lg p-2"
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
                                className="text-content text-sm font-medium leading-[13px] capitalize"
                              >
                                {extractName(invitedEmail)}
                              </motion.span>
                              <span className="text-xs text-content-subtle">
                                {invitedEmail}
                              </span>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handleRemoveInvited(invitedEmail)}
                            layoutId={`remove-${invitedEmail}-${id}`}
                            className=" text-danger/70 hover:text-danger cursor-pointer"
                          >
                            <span className="text-sm text-end">Remove</span>
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
