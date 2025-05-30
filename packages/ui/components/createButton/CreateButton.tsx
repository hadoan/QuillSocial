import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@quillsocial/ui";
import { Plus } from "@quillsocial/ui/components/icon";
import { useRouter } from "next/router";

export interface Option {
  teamId: number | null | undefined; // if undefined, then it's a profile
  label: string | null;
  image?: string | null;
  slug: string | null;
}

export type CreateBtnProps = {
  options: Option[];
  createDialog?: () => JSX.Element;
  createFunction?: (teamId?: number) => void;
  subtitle?: string;
  buttonText?: string;
  isLoading?: boolean;
  disableMobileButton?: boolean;
  "data-testid"?: string;
  className: string;
};

export function CreateButton(props: CreateBtnProps) {
  const { t } = useLocale();
  const router = useRouter();
  const {
    createDialog,
    options,
    isLoading,
    createFunction,
    buttonText,
    disableMobileButton,
    subtitle,
    ...restProps
  } = props;
  const CreateDialog = createDialog ? createDialog() : null;

  // const hasTeams = !!options.find((option) => option.teamId);
  const hasTeams = false;

  // inject selection data into url for correct router history
  const openModal = (option: Option) => {
    const query = {
      ...router.query,
      dialog: "new",
      eventPage: option.slug,
      teamId: option.teamId,
    };
    if (!option.teamId) {
      delete query.teamId;
    }
    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <>
      {!hasTeams ? (
        <Button
          onClick={() =>
            !!CreateDialog
              ? openModal(options[0])
              : createFunction
              ? createFunction(options[0].teamId || undefined)
              : null
          }
          StartIcon={Plus}
          loading={isLoading}
          {...restProps}
          className="bg-awst h-[40px]"
        >
          {buttonText ? buttonText : t("new")}
        </Button>
      ) : (
        <Dropdown>
          <DropdownMenuTrigger asChild>
            <Button StartIcon={Plus} loading={isLoading} {...restProps}>
              {buttonText ? buttonText : t("new")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={14} align="end">
            <DropdownMenuLabel>
              <div className="w-48 text-left text-xs">{subtitle}</div>
            </DropdownMenuLabel>
            {options.map((option, idx) => (
              <DropdownMenuItem key={option.label}>
                <DropdownItem
                  type="button"
                  data-testid={`option${option.teamId ? "-team" : ""}-${idx}`}
                  StartIcon={(props) => (
                    <Avatar
                      alt={option.label || ""}
                      imageSrc={
                        option.image ||
                        `${WEBAPP_URL}/${option.label}/avatar.png`
                      } // if no image, use default avatar
                      size="sm"
                      {...props}
                    />
                  )}
                  onClick={() =>
                    !!CreateDialog
                      ? openModal(option)
                      : createFunction
                      ? createFunction(option.teamId || undefined)
                      : null
                  }
                >
                  {" "}
                  {/*improve this code */}
                  <span>{option.label}</span>
                </DropdownItem>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </Dropdown>
      )}
      {router.query.dialog === "new" && CreateDialog}
    </>
  );
}
