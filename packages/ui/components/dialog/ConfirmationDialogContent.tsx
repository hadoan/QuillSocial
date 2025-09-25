import { AlertCircle, Check } from "../icon";
import { DialogClose, DialogCloseConfirm, DialogContent } from "./Dialog";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { PropsWithChildren, ReactElement } from "react";
import React from "react";

type ConfirmBtnType =
  | { confirmBtn?: never; confirmBtnText?: string }
  | { confirmBtnText?: never; confirmBtn?: ReactElement };

export type ConfirmationDialogContentProps = {
  cancelBtnText?: string;
  isLoading?: boolean;
  loadingText?: string;
  onConfirm?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  title: string;
  variety?: "danger" | "warning" | "success";
} & ConfirmBtnType;

export function ConfirmationDialogContent(
  props: PropsWithChildren<ConfirmationDialogContentProps>
) {
  const { t } = useLocale();
  const {
    title,
    variety,
    confirmBtn = null,
    confirmBtnText = t("confirm"),
    cancelBtnText = t("cancel"),
    loadingText = t("loading"),
    isLoading = false,
    onConfirm,
    children,
  } = props;

  return (
    <DialogContent type="creation">
      <div className="flex">
        {variety && (
          <div className="mt-0.5 ltr:mr-3">
            {variety === "danger" && (
              <div className="bg-error mx-auto rounded-full p-2 text-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            )}
            {variety === "warning" && (
              <div className="bg-attention mx-auto rounded-full p-2 text-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
            )}
            {variety === "success" && (
              <div className="bg-success mx-auto rounded-full p-2 text-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            )}
          </div>
        )}
        <div>
          <DialogPrimitive.Title className="font-quill text-emphasis mt-2 text-xl">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-subtle text-sm">
            {children}
          </DialogPrimitive.Description>
        </div>
      </div>
      <div className="mt-5 flex flex-row-reverse gap-x-2 sm:mt-8">
        {confirmBtn ? (
          confirmBtn
        ) : (
          // <DialogCloseConfirm loading={isLoading} onClick={(e) => onConfirm && onConfirm(e)}>
          //   {isLoading ? loadingText : 'Confirm'}
          // </DialogCloseConfirm>

          <DialogClose
            color="primary"
            className="text-white bg-awst"
            loading={isLoading}
            onClick={(e) => onConfirm && onConfirm(e)}
          >
            {isLoading ? loadingText : "Confirm"}
          </DialogClose>
        )}
        <DialogClose className="text-awst" disabled={isLoading}>
          {cancelBtnText}
        </DialogClose>
      </div>
    </DialogContent>
  );
}
