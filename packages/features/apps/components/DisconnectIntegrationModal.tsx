import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { trpc } from "@quillsocial/trpc/react";
import { Dialog, showToast, ConfirmationDialogContent } from "@quillsocial/ui";

interface DisconnectIntegrationModalProps {
  credentialId: number | null;
  isOpen: boolean;
  handleModelClose: () => void;
}

export default function DisconnectIntegrationModal({
  credentialId,
  isOpen,
  handleModelClose,
}: DisconnectIntegrationModalProps) {
  const { t } = useLocale();
  const utils = trpc.useContext();

  const mutation = trpc.viewer.deleteCredential.useMutation({
    onSuccess: () => {
      showToast(t("app_removed_successfully"), "success");
      handleModelClose();
      utils.viewer.integrations.invalidate();
    },
    onError: () => {
      showToast(t("error_removing_app"), "error");
      handleModelClose();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleModelClose}>
      <ConfirmationDialogContent
        variety="danger"
        title={t("remove_app")}
        confirmBtnText={t("yes_remove_app")}
        onConfirm={() => {
          if (credentialId) {
            mutation.mutate({ id: credentialId });
          }
        }}>
        <p className="mt-5">{t("are_you_sure_you_want_to_remove_this_app")}</p>
      </ConfirmationDialogContent>
    </Dialog>
  );
}
