"use client";

import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { InboxIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export type NotificationsProps = {
  day?: number;
  show?: boolean;
  title: string;
  desc: string;
  ctaText: string;
  dismisText: string;
  ctaClicked: () => void;
  onDismiss?: () => void;
};

export function Notifications(props: NotificationsProps) {
  const [show, setShow] = useState(props.show ?? true);
  const [title] = useState(props.title);
  const [desc] = useState(props.desc);
  const [ctaText] = useState(props.ctaText);

  // Sync internal show state with props
  useEffect(() => {
    setShow(props.show ?? true);
  }, [props.show]);

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className=" pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="w-96 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <InboxIcon
                      className="h-6 w-6 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {" "}
                      {title}{" "}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{desc}</p>
                    <div className="mt-3 flex space-x-7">
                      <button
                        type="button"
                        onClick={() => props.ctaClicked()}
                        className="rounded-md bg-white text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        {ctaText}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (props.onDismiss) {
                            props.onDismiss();
                          } else {
                            // Fallback to old behavior if no onDismiss callback provided
                            if (props?.day && props?.day >= 14) {
                              sessionStorage.setItem(
                                "notificationBillingDaysExpired",
                                "true"
                              );
                            } else {
                              sessionStorage.setItem(
                                "notificationBillingDays",
                                "true"
                              );
                            }
                          }
                          setShow(false);
                        }}
                        className="rounded-md bg-white text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        {props.dismisText}
                      </button>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        if (props.onDismiss) {
                          props.onDismiss();
                        } else {
                          // Fallback to old behavior if no onDismiss callback provided
                          if (props?.day && props?.day >= 14) {
                            sessionStorage.setItem(
                              "notificationBillingDaysExpired",
                              "true"
                            );
                          } else {
                            sessionStorage.setItem(
                              "notificationBillingDays",
                              "true"
                            );
                          }
                        }
                        setShow(false);
                      }}
                    >
                      <span className="sr-only"> Close </span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}
