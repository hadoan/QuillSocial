import { useRouter } from "next/router";
import React, { useEffect, useState, type FC } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { HttpError } from "@quillsocial/lib/http-error";
import { BillingType } from "@quillsocial/prisma/enums";
import { TRPCClientError, trpc } from "@quillsocial/trpc/react";
import { showToast } from "@quillsocial/ui";
import { Button, Meta } from "@quillsocial/ui";
import { ExternalLink, Users, Banknote, FileText, AlertCircle } from "@quillsocial/ui/components/icon";

import { QueryCell } from "@lib/QueryCell";

const BillingOverview: FC = () => {
  const router = useRouter();
  const checkBilling = trpc.viewer.teams.checkPricingTeam.useQuery();
  const [isLTD, setIsLTD] = useState(false);
  const [ltdUsers, setLtdUsers] = useState(1);
  useEffect(() => {
    if (checkBilling.data) {
      setIsLTD(checkBilling.data?.isLTD ?? false);
      setLtdUsers(checkBilling.data?.maxLTDSubs ?? 0);
    }
  }, [checkBilling.data]);

  const monthlyPrice = 9;
  const lifeTimeDeal = 19;

  const { t } = useLocale();
  const returnTo = router.asPath;
  const currentBillingQuery = trpc.viewer.billings.getCurrentUserBilling.useQuery();

  const billingHref = `${WEBAPP_URL}/api/integrations/stripepayment/portal?returnTo=${WEBAPP_URL}${returnTo}`;
  return (
    <QueryCell
      query={currentBillingQuery}
      success={({ data }) => {
        console.log(data);
        return (
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center justify-center gap-5 md:justify-start">
              {data?.type !== "LTD" && data?.type !== "PER_USER" &&
                <SubscribeButtons data={data} isLTD={isLTD} ltdUsers={ltdUsers} billingHref={billingHref} ></SubscribeButtons>
              }
              {data?.type === "LTD" && (
                <div className="flex h-[100px]  items-center justify-center rounded-lg border bg-white shadow-sm">
                  <div className="flex flex-col p-4">
                    <span className="font-bold">Subscribed to LTD</span>
                    <span className="mt-2 text-sm text-slate-500">
                      Total lifetime deal (LTD) users: {ltdUsers}
                    </span>
                    {/* <div className="text-awst flex  items-left rounded-b-lg mt-4  text-center text-sm font-medium leading-5">
                      <a className="font-bold text-red!" href={billingHref}>View all invoices</a>
                    </div> */}

                  </div>

                </div>
              )}
              {!isLTD && (
                <div className="mt-2 flex w-full flex-wrap gap-4">
                  {data?.type !== "PER_USER" && (
                    <div className="flex h-[120px]   w-2/5 mr-1 flex-col rounded-lg border bg-white shadow-sm">
                      <div className="ml-2 mt-2 flex p-4">
                        <div className="bg-awst flex h-[45px] w-[45px] items-center justify-center rounded-lg text-white">
                          <Banknote className="h-6 w-6" />
                        </div>
                        <div className="ml-3 flex flex-col">
                          <div className="flex text-sm font-medium text-gray-500">
                            Life Time Deal
                            {/* <AlertCircle
                            data-tooltip-id="infoIcon"
                            className="ml-2 mt-1 h-3 w-3 hover:cursor-pointer"
                          /> */}
                            {/* <ReactTooltip
                            content={`You will be charged for all users that have been assigned a license.\nMonthly charges will be prorated based on when a user is assigned a license.
                          \nThis may result in the charges on your invoice varying from month to month.`}
                            id="infoIcon"
                            place="top"
                            style={{ maxWidth: "300px" }}
                          /> */}
                          </div>
                          <div className="text-2xl font-bold">{lifeTimeDeal} USD</div>
                        </div>
                      </div>
                      <div className="-mt-4 flex items-center gap-2 pl-3">
                        <div className="inline-block rounded bg-red-600 px-2 py-1 font-bold text-white">
                          Limited availability
                        </div>
                        {/* <span>
                        <span className="font-bold">45%</span> claimed
                      </span> */}
                      </div>

                      {/* <div className="text-awst mt-auto flex h-[50px] items-center rounded-b-lg bg-gray-50 pl-3 text-center text-sm font-medium leading-5">
                      {data?.type === "PER_USER" ? (
                        <a href={billingHref}>View invoice</a>
                      ) : (
                        <p className="text-[#6B7280]">View invoice</p>
                      )}
                    </div> */}
                    </div>
                  )}
                  <div className="flex h-[120px]   w-2/5  flex-col rounded-lg border bg-white shadow-sm">
                    <div className="ml-2 mt-2 flex p-4">
                      <div className="bg-awst flex h-[45px] w-[45px] items-center justify-center rounded-lg text-white">
                        <Banknote className="h-6 w-6" />
                      </div>
                      <div className="ml-3 flex flex-col">
                        <div className="flex text-sm font-medium text-gray-500">
                          Monthly Billing
                          <AlertCircle
                            data-tooltip-id="infoIcon"
                            className="ml-2 mt-1 h-3 w-3 hover:cursor-pointer"
                          />
                          <ReactTooltip
                            content={`Monthly charges will be prorated based on when a user is assigned a license.
                          \nThis may result in the charges on your invoice varying from month to month.`}
                            id="infoIcon"
                            place="top"
                            style={{ maxWidth: "300px" }}
                          />
                        </div>

                        <div className="text-2xl font-bold">{data?.quantity * monthlyPrice} USD</div>
                      </div>
                    </div>

                    <div className="text-awst mt-auto flex h-[50px] items-center rounded-b-lg bg-gray-50 pl-3 text-center text-sm font-medium leading-5">
                      {data?.type === "PER_USER" ? (
                        <a href={billingHref}>View all invoices</a>
                      ) : (
                        <p className="text-[#6B7280]">View all invoices</p>
                      )}
                    </div>
                  </div>

                  {/* <div className="flex h-[160px]  w-[350px] flex-col rounded-lg border bg-white shadow-sm">
                    <div className="ml-2 mt-2 flex p-4">
                      <div className="bg-awst flex h-[45px] w-[45px] items-center justify-center rounded-lg text-white">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="ml-3 flex flex-col">
                        <div className="flex text-sm font-medium text-gray-500">Payment Plan</div>
                        <div className="text-2xl font-bold">${monthlyPrice} USD per user</div>
                      </div>
                    </div>
                    <div className="text-awst mt-auto flex h-[50px] items-center rounded-b-lg bg-gray-50 pl-3 text-center text-sm font-medium leading-5">
                      <a href="https://QuillAI.social/pricing">View Pricing Plans</a>
                    </div>
                  </div> */}
                </div>
              )}
            </div>
            <div className="mt-5 text-sm text-slate-500">
              For more information, feel free to reach out to us at ha@quillai.social or live chat anytime.
            </div>
          </div>
        );
      }}
    />
  );
};


const SubscribeButtons = ({data, isLTD, ltdUsers, billingHref}:{data: any, isLTD: boolean, ltdUsers: number, billingHref: string}) => {
  const router = useRouter();
  const subscribeMutation = trpc.viewer.billings.subscribe.useMutation({
    onSuccess: async (data: any) => {
      router.push(data.url);
    },
    onError: (err) => {
      console.error(err);
      if (err instanceof HttpError) {
        const message = `${err.statusCode}: ${err.message}`;
        showToast(message, "error");
      } else if (err instanceof TRPCClientError) {
        console.error(err);
        showToast(err.message, "error");
      }
      if (err.data?.code === "UNAUTHORIZED") {
        showToast("UNAUTHORIZED", "error");
      }
    },
  });

  const subscribe = (type: any) => {
    subscribeMutation.mutate({
      billingType: type,
    });
  };
  return (
    <>
      <div className="flex h-[100px] w-2/5 items-center justify-center rounded-lg border bg-white shadow-sm">
        {data?.type !== "PER_USER" && (
          <div>
            <div className="flex flex-col p-4">
              <span className="font-bold">Subscribe to Life Time Deal</span>
              <span className="mt-2 text-sm text-slate-500">
                Ready to subscribe to QuillAI's Life Time Deal? Let’s go!
              </span>
            </div>
          </div>
        )}
        {data?.type === "PER_USER" && (
          <div className="flex flex-col p-4">
            <span className="font-bold">Manage Billing</span>
            <span className="mt-2 text-sm text-slate-500">
              {!isLTD && (
                <>View and edit your billing details, as well as cancel your subscription.</>
              )}
              {isLTD && <>Total lifetime deal (LTD) users: {ltdUsers}</>}
            </span>
          </div>
        )}
        <div className="ml-auto mr-3">

          <Button
            color="primary"
            className="text-white"
            onClick={() => subscribe("ltd")}
            EndIcon={ExternalLink}>
            Subscribe
          </Button>

        </div>
      </div>

      <div className="flex h-[100px] w-2/5 items-center justify-center rounded-lg border bg-white shadow-sm">
        {data?.type !== "PER_USER" && (
          <div>
            <div className="flex flex-col p-4">
              <span className="font-bold">Subscribe to QuillAI</span>
              <span className="mt-2 text-sm text-slate-500">
                Ready to subscribe to QuillAI? Let’s go!
              </span>
            </div>
          </div>
        )}
        {data?.type === "PER_USER" && (
          <div className="flex flex-col p-4">
            <span className="font-bold">Manage Billing</span>
            <span className="mt-2 text-sm text-slate-500">
              {!isLTD && (
                <>View and edit your billing details, as well as cancel your subscription.</>
              )}
              {isLTD && <>Total lifetime deal (LTD) users: {ltdUsers}</>}
            </span>
          </div>
        )}

        <div className="ml-auto mr-3">
          {!isLTD && data?.type === "PER_USER" ? (
            <Button
              color="primary"
              className="text-white"
              href={billingHref}
              target="_blank"
              EndIcon={ExternalLink}>
              Billing Portal
            </Button>
          ) : (

            <Button
              color="primary"
              className="text-white"
              onClick={() => subscribe("perUser")}
              EndIcon={ExternalLink}>
              Subscribe
            </Button>

          )}
        </div>
      </div>
    </>
  )
}

BillingOverview.displayName = "Billing Overview";

export default BillingOverview;
