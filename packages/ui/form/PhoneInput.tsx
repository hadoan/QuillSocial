import { classNames } from "@quillsocial/lib";
import { trpc } from "@quillsocial/trpc/react";
import { isSupportedCountry } from "libphonenumber-js";
import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export type PhoneInputProps = {
  value?: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  name?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function BasePhoneInput({
  name,
  className = "",
  onChange,
  ...rest
}: PhoneInputProps) {
  useEffect(() => {
    if (!rest.value) {
      return;
    }
    const formattedValue = rest.value.trim().replace(/^\+?/, "+");
    onChange(formattedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultCountry = useDefaultCountry();
  return (
    <PhoneInput
      {...rest}
      country={rest.value ? undefined : defaultCountry}
      enableSearch
      disableSearchIcon
      inputProps={{
        name: name,
        required: rest.required,
        placeholder: rest.placeholder,
      }}
      onChange={(value) => {
        onChange("+" + value);
      }}
      containerClass={classNames(
        "hover:border-emphasis dark:focus:border-emphasis border-default !bg-default rounded-md border focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-default disabled:cursor-not-allowed",
        className
      )}
      inputClass="text-sm focus:ring-0 !bg-default text-default"
      buttonClass="text-emphasis !bg-default hover:!bg-emphasis"
      searchClass="!text-default !bg-default hover:!bg-emphasis"
      dropdownClass="!text-default !bg-default"
      inputStyle={{ width: "inherit", border: 0 }}
      searchStyle={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "6px 12px",
        gap: "8px",
        width: "296px",
        height: "28px",
        marginLeft: "-4px",
      }}
      dropdownStyle={{ width: "max-content" }}
    />
  );
}

const useDefaultCountry = () => {
  const [defaultCountry, setDefaultCountry] = useState("us");
  trpc.viewer.public.countryCode.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    onSuccess: (data) => {
      isSupportedCountry(data?.countryCode)
        ? setDefaultCountry(data.countryCode.toLowerCase())
        : setDefaultCountry(
            navigator.language.split("-")[1]?.toLowerCase() || "us"
          );
    },
  });

  return defaultCountry;
};

export default BasePhoneInput;
