import { BillingType } from "@quillsocial/prisma/enums";

export const getBillingInfoes = (
    data: any | { type: BillingType | null; teamId: number | null; quantity: number | null }
) => {
    return [
        {
            name: "Free Tier",
            price: "$0/",
            mo: "mo",
            posts: 12,
            accounts: 1,
            monthsSchedule: 1,
            buttonName: data.type === BillingType.FREE_TIER ? "Current" : "Subscribed",
            butonDisable: true,
            type: "freeTier",
            priceNumber: 0,
        },
        {
            name: "Business Tier",
            price: "$2",
            mo: "/mo",
            posts: -1,
            accounts: -1,
            monthsSchedule: 12,
            buttonName: data.type === BillingType.FREE_TIER ? "Upgrade" : "Subscribed",
            butonDisable: data.type === BillingType.FREE_TIER || data.type === BillingType.UNLIMITED ? false : true,
            type: "business",
            priceNumber: 2
        },
        // {
        //     name: "Unlimited",
        //     price: "$59",
        //     mo: "/mo",
        //     posts: -1,
        //     accounts: -1,
        //     monthsSchedule: -1,
        //     buttonName:
        //         data.type !== BillingType.UNLIMITED
        //             ? "Upgrade"
        //             : "Subscribed",
        //     butonDisable: data.type === BillingType.UNLIMITED,
        //     type: "unlimited",
        // },
    ];
};