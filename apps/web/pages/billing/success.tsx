import { CheckIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";

import useGetBrandingColours from "@quillsocial/lib/getBrandColours";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { HeadSeo, useAppDefaultTheme } from "@quillsocial/ui";
import { ChevronLeft } from "@quillsocial/ui/components/icon";

import PageWrapper from "@components/PageWrapper";

export default function Success() {
  const { t } = useLocale();
  const router = useRouter();
  const title = "Thank You for Subscribing to QuillAI!";

  return (
    <div className="h-screen" data-testid="success-page">
      <HeadSeo title={title} description={title} />
      {/* <BookingPageTagManager eventType={eventType} /> */}
      <main className="mx-auto">
        <div className="overflow-y-auto">
          <div
            className={classNames(
              "text-center",
              "flex items-end justify-center px-4 pb-20 pt-4  sm:block sm:p-0"
            )}
          >
            <div
              className={classNames(
                "my-4 transition-opacity sm:my-0",
                " inset-0"
              )}
              aria-hidden="true"
            >
              <div
                className={classNames(
                  "main inline-block transform overflow-hidden rounded-lg border sm:my-8 sm:max-w-xl",
                  " bg-default dark:bg-muted border-booker border-booker-width",
                  "px-8 pb-4 pt-5 text-left align-bottom transition-all sm:w-full sm:py-8 sm:align-middle"
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon
                      className="h-6 w-6 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="mb-8 mt-6 text-center last:mb-0">
                  <h3
                    className="text-emphasis text-2xl font-semibold leading-6"
                    id="modal-headline"
                  >
                    Thank You for Subscribing to QuillAI!
                  </h3>
                  <div className="mt-3">
                    <p className="text-default">
                      We are thrilled to have you join the QuillAI community! 🍜
                    </p>
                  </div>

                  <div className="border-subtle text-default mt-8  grid grid-cols-3 border-t pt-8 text-center">
                    <div className="col-span-3 font-medium">
                      If you have any questions or suggestions, don't hesitate
                      to reach out at{" "}
                      <a href="mailto:team@workramen.com">hi@quillsocial.com</a>.
                      Your feedback is invaluable to us. Welcome aboard! 🎉
                    </div>
                    {/* <div className="col-span-3 mb-6 mt-2 last:mb-0"></div> */}
                  </div>

                  <div className="border-subtle text-default mt-8  border-t pt-8 text-center">
                    <div className=" mb-2 mt-9">
                      <Link
                        href="/"
                        className="mt-4 text-sm font-semibold text-neutral-950 transition hover:text-neutral-700"
                      >
                        Back to QuillAI
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

Success.isBookingPage = true;
Success.PageWrapper = PageWrapper;
