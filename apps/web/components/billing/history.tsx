import { Download } from "lucide-react";
import React, { type FC } from "react";

const BillingHistory: FC = ({}) => {
  const bills = [
    {
      date: "July 4, 2023",
      payment: "****0123",
      description: "Monthly renewal",
      price: "$2.00",
      status: "Overdue",
      button: "Download",
    },
    {
      date: "June 4, 2023",
      payment: "****0123",
      description: "Monthly renewal",
      price: "$2.00",
      status: "Paid",
      button: "Download",
    },
    {
      date: "May 3, 2023",
      payment: "****0123",
      description: "Monthly renewal",
      price: "$2.00",
      status: "Paid",
      button: "Download",
    },
    {
      date: "April 3, 2023",
      payment: "****0123",
      description: "Monthly renewal",
      price: "$2.00",
      status: "Paid",
      button: "Download",
    },
  ];
  return (
    <div>
      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="px-2.5 py-5 text-[16px] font-medium text-[#717D96]">Issue date</th>
            <th className="px-2.5 py-5 text-[16px] font-medium text-[#717D96]">Payment</th>
            <th className="px-2.5 py-5 text-[16px] font-medium text-[#717D96]">Description</th>
            <th className="px-2.5 py-5 text-[16px] font-medium text-[#717D96]">Price</th>
            <th className="px-2.5 py-5 text-[16px] font-medium text-[#717D96]">Stats</th>
          </tr>
        </thead>
        <tbody>
          {bills?.map((bill, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-2.5 py-5 text-[16px] text-[#2D3648]">{bill.date}</td>
              <td className="px-2.5 py-5 text-[16px] text-[#2D3648]">{bill.payment}</td>
              <td className="px-2.5 py-5 text-[16px] text-[#2D3648]">{bill.description}</td>
              <td className="px-2.5 py-5 text-[16px] text-[#2D3648]">{bill.price}</td>
              <td className="px-2.5 py-5 text-[16px] text-[#2D3648]">{bill.status}</td>
              <td className="py-5 text-right">
                <button className="bg-awst hover:bg-awsthv w-[160px] rounded-lg px-2 py-3">
                  <div className="flex items-center pl-[15px] ">
                    <div className="pr-2"><Download color="white" /></div>
                    <div><p className="text-center text-[16px] font-bold text-white ">{bill.button}</p></div>
                  </div>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

BillingHistory.displayName = "Billing History";

export default BillingHistory;
