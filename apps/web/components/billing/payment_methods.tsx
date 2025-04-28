import React from "react";

const PaymentMethods = () => {
  return (
    <div className="ml-5 md:ml-0 lg:ml-0 xl:ml-0">
      <form className=" flex flex-wrap">
        <div className="mt-[32px] flex  flex-wrap gap-[25px]">
          <div className="flex flex-col  ">
            <label
              htmlFor="name"
              className="mb-[5px] w-[95%] font-bold text-[#2D3648] md:w-[389px] lg:w-[389px] xl:w-[389px]">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="rounded border-2 border-gray-300 text-gray-900"
              placeholder="Jonh"
              required
            />
          </div>
          <div className="flex flex-col ">
            <label
              htmlFor="email"
              className="mb-[5px] w-[95%] font-bold text-[#2D3648] md:w-[389px] lg:w-[389px] xl:w-[389px]">
              Email Address
            </label>
            <input
              type="text"
              id="email"
              className="rounded border-2 border-gray-300 text-gray-900"
              placeholder="john.doe@mail.com"
              required
            />
          </div>
        </div>
        <div className="mt-[23px] flex">
          <div className="flex flex-col">
            <label
              htmlFor="creditcard"
              className="mb-[5px] w-[95%] font-bold text-[#2D3648] md:w-[803px] lg:w-[803px] xl:w-[803px]">
              Credit Card Number
            </label>
            <input
              type="text"
              id="creditcard"
              className="rounded border-2 border-gray-300 text-gray-900"
              placeholder="XXXX XXXX XXXX XXXX"
              required
            />
          </div>
        </div>
        <div className="mt-[23px] flex flex-wrap">
          <div className="flex flex-col pr-[25px]">
            <label
              htmlFor="expirydate"
              className="mb-[5px] w-[95%] font-bold text-[#2D3648] md:w-[389px] lg:w-[389px] xl:w-[389px]">
              Expiry Date
            </label>
            <input
              type="date"
              id="expirydate"
              className="rounded border-2 border-gray-300 text-gray-900"
              placeholder="mm/yy"
              required
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="cvv"
              className="mb-[5px] w-[95%] font-bold text-[#2D3648] md:w-[389px] lg:w-[389px] xl:w-[389px]">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              className="rounded border-2 border-gray-300 text-gray-900"
              placeholder="xxx"
              required
            />
          </div>
        </div>
      </form>
      <div className="mt-[23px]">
        <button className="h-[40px] w-[120px] hover:bg-awsthv rounded-md border bg-awst">
          <p className="text-[14px] text-white">Save Changes</p>
        </button>
      </div>
    </div>
  );
};

export default PaymentMethods;
