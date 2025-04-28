import FullCalendar from "@fullcalendar/react";
// fullcalendar plugins imports
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Button } from "primereact/button";
import { Calendar as PRCalendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Dialog as DialogLoading, DialogContent } from "@quillsocial/ui";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.css";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import React, { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import { DateSelectArg, EventClickArg, DateInput } from "@fullcalendar/core";
import type { Demo } from "../../lib/types/calendar-types";
import Shell from "@quillsocial/features/shell/Shell";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import PageWrapper from "@components/PageWrapper";
import useMeQuery from "@lib/hooks/useMeQuery";
import dayjs from "@quillsocial/dayjs";
import { HeadSeo } from "@quillsocial/ui";
import { WEBAPP_URL } from "@quillsocial/lib/constants";
import { array } from "zod";
import { PostStatus } from "@quillsocial/prisma/enums";

const CalendarPage = () => {
  const { t } = useLocale();
  const [events, setEvents] = useState<Demo.Event[]>([]);
  const [tags, setTags] = useState<Demo.Event["tag"][]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [view, setView] = useState("");
  const [credentialId, setCredentialId] = useState();
  const [timeZone, setTimeZone] = useState(``);
  const [currentView, setCurrentView] = useState("month");
  const [isLoading, setIsLoading] = useState(false);
  const [changedEvent, setChangedEvent] = useState<Demo.Event>({
    title: "",
    start: "",
    end: "",
    allDay: false,
    location: "",
    borderColor: "",
    textColor: "",
    description: "",
    tag: {
      name: "Pending",
      color: "#FFB6B6",
    },
    logo: "",
    contentImage: "",
    time: "",
    colorStatus: "",
  });

  const [data, setData] = useState<Demo.Event[]>([]);
  const query = useMeQuery();
  const user = query.data;

  const onEventClick = (e: EventClickArg) => {
    const { start, end } = e.event;
    let plainEvent = e.event.toPlainObject({
      collapseExtendedProps: true,
      collapseColor: true,
    });
    setView("display");
    setShowDialog(true);
    setChangedEvent((prevChangeState: any) => ({
      ...prevChangeState,
      ...plainEvent,
      start: start as DateInput,
      end: end ? end : (start as DateInput),
    }));
  };

  useEffect(() => {
    if (
      user?.currentSocialProfile?.credentialId !== null &&
      user?.currentSocialProfile?.credentialId !== undefined
    ) {
      setCredentialId(user?.currentSocialProfile?.credentialId);
      setTimeZone(user?.timeZone);
    }
  }, [user?.currentSocialProfile?.credentialId]);

  const getNameSocial = (inputString: string | undefined) => {
    if (!inputString) return "";
    const words: string[] = inputString.split("-");
    const firstWord: string = words[0] || "";
    const capitalizedFirstWord: string =
      firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
    return capitalizedFirstWord;
  };
  // const colorMap: Record<string, string> = {
  //     'twitterv1-social': "#1DA1F2",
  //     'x-social': "#1DA1F2",
  //     'linkedin-social': "#0077CC",
  //     'facebook-social': "#0A66C2",
  //     'instagram-social': "#F58529",
  // };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case PostStatus.NEW:
        return { name: "Draft", color: "#718096" };
      case PostStatus.POSTED:
        return { name: "Published / Sent", color: "#38a169" };
      case "SCHEDULED":
        return { name: "Pending", color: "#4299e1" };
      case PostStatus.ERROR:
        return { name: "With errors", color: "#e53e3e" };
      default:
        return { name: "From autolist", color: "#" };
    }
  };

  const debouncedApiCall = useMemo(() => {
    return debounce(async () => {
      if (credentialId !== null) {
        const startDate = dayjs().startOf("month").toISOString();
        const endDate = dayjs().endOf("month").toISOString();
        fetchEventsData(currentView, startDate, endDate);
      }
    }, 150);
  }, [credentialId]);

  useEffect(() => {
    if (credentialId !== null) {
      debouncedApiCall();
    }
  }, [debouncedApiCall, credentialId]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setEvents(data);
    }
  }, [data]);

  const handleSave = () => {
    if (!validate()) {
      return;
    } else {
      const _clickedEvent = {
        ...changedEvent,
        backgroundColor: changedEvent.tag?.color ?? "#fff",
        borderColor: changedEvent.tag?.color ?? "#fff",
        // textColor: "#212121",
      };
      setShowDialog(false);
      if (_clickedEvent.id) {
        const _events = events.map((i) =>
          i.id?.toString() === _clickedEvent.id?.toString()
            ? (i = _clickedEvent)
            : i
        );
        setEvents(_events);
      } else {
        setEvents((prevState) => [
          ...prevState,
          {
            ..._clickedEvent,
            id: Math.floor(Math.random() * 10000).toString(),
          },
        ]);
      }
    }
  };

  const validate = () => {
    let { start, end, title } = changedEvent;
    return start && end && title;
  };

  // const onEditClick = () => {
  //     setView("edit");
  // };

  // const onDateSelect = (e: DateSelectArg) => {
  //     setView("new");
  //     setShowDialog(true);
  //     setChangedEvent({
  //         ...e,
  //         title: "",
  //         location: "",
  //         borderColor: "",
  //         textColor: "",
  //         description: "",
  //         tag: {
  //             name: "Company A",
  //             color: "#FFB6B6",
  //         },
  //     });
  // };

  const selectedItemTemplate = () => {
    return (
      <div className="flex align-items-center">
        <div
          className="flex-shrink-0 w-1rem h-1rem mr-2 border-circle"
          style={{ backgroundColor: changedEvent.tag?.color || "#FFB6B6" }}
        ></div>
        <div>{changedEvent.tag?.name || "Pending"}</div>
      </div>
    );
  };

  const itemOptionTemplate = (tag: Demo.Event["tag"]) => {
    return (
      <div className="flex align-items-center">
        <div
          className="flex-shrink-0 w-1rem h-1rem mr-2 border-circle"
          style={{ backgroundColor: tag?.color }}
        ></div>
        <div>{tag?.name}</div>
      </div>
    );
  };
  const footer = (
    <>
      {/* {view === "display" ? (
                // <Button className="bg-awst text-white p-2"
                //     type="button"
                //     label="Edit"
                //     icon="pi pi-pencil"
                //     onClick={onEditClick}
                // />
            ) : null} */}
      {view === "new" || view === "edit" ? (
        <Button
          className="bg-awst text-white p-2"
          type="button"
          label="Save"
          icon="pi pi-check"
          disabled={!changedEvent.start || !changedEvent.end}
          onClick={handleSave}
        />
      ) : null}
    </>
  );

  const getIconSocial = (icon: string): string => {
    switch (icon) {
      case "facebook-social":
        return `${WEBAPP_URL}/logo/facebook
                -social-logo.svg`;
      case "x-social":
      case "twitterv1-social":
        return `${WEBAPP_URL}/logo/twitterv1-social-logo.svg`;
      case "linkedin-social":
        return `${WEBAPP_URL}/logo/linkedin-social-logo.svg`;
      case "youtube-social":
        return `${WEBAPP_URL}/logo/youtube-social-logo.svg`;
      default:
        return "";
    }
  };

  const eventContent = (arg: any) => {
    const { time, description, logo, contentImage, colorStatus } =
      arg.event.extendedProps;
    return (
      <div
        style={{ borderLeft: `2px solid ${colorStatus}`, paddingLeft: "1px" }}
      >
        <div className="flex items-center lg:justify-between justify-start">
          <img className="h-4 w-4" src={getIconSocial(logo)} alt="Logo" />
          <span className="font-bold sm:ml-5 lg:ml-0 sm:text-[12px] text-[7px]">
            {time && time.split(" ")[1]}
          </span>
        </div>
        {description && (
          <div className="flex flex-wrap w-[170px]">
            <span className="whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[7ch] sm:max-w-[10ch] lg:max-w-[50ch]">
              {description}
            </span>
          </div>
        )}
        {/* {contentImage && contentImage.length > 0 && (
                    <div>
                        <img className="h-5 w-5" src={contentImage} alt="Image" />
                    </div>
                )} */}
      </div>
    );
  };

  const getNewView = (viewType: string) => {
    let newView = "month";
    switch (viewType) {
      case "dayGridMonth":
        newView = "month";
        break;
      case "timeGridWeek":
        newView = "week";
        break;
      case "timeGridDay":
        newView = "day";
        break;
      default:
        break;
    }
    return newView;
  };

  const handleDatesSet = (dateInfo: any) => {
    const newView = getNewView(dateInfo.view.type);
    const startDate = dayjs.utc(dateInfo.startStr).toISOString();
    const endDate = dayjs.utc(dateInfo.endStr).toISOString();
    setCurrentView(newView);
    fetchEventsData(newView, startDate, endDate);
  };

  const fetchEventsData = async (
    view: any,
    startDate: string,
    endDate: string
  ) => {
    setIsLoading(true);
    const response = await fetch(
      `/api/calendar/getAllPost?view=${view}&startDate=${startDate}&endDate=${endDate}`,
      {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      setIsLoading(false);
      console.error("Failed to fetch events");
      return;
    }
    const dataResponse = await response.json();
    if (
      typeof dataResponse === "object" &&
      dataResponse !== null &&
      timeZone !== ``
    ) {
      const { data } = dataResponse;
      const postsFromDb = data.map((x: any) => {
        const startDay = x.schedulePostDate
          ? dayjs
              .utc(x.schedulePostDate)
              .tz(timeZone)
              .format("YYYY-MM-DD HH:mm")
          : dayjs.utc(x.postedDate).tz(timeZone).format("YYYY-MM-DD HH:mm");
        const endDay = x.schedulePostDate
          ? dayjs
              .utc(x.schedulePostDate)
              .add(5, "minute")
              .tz(timeZone)
              .format("YYYY-MM-DD HH:mm")
          : dayjs
              .utc(x.postedDate)
              .add(5, "minute")
              .tz(timeZone)
              .format("YYYY-MM-DD HH:mm");
        const statusInfo = getStatusInfo(x.status);
        return {
          id: x.id,
          title: x.credential?.appId,
          start: startDay,
          end: endDay,
          description: x.content,
          location: getNameSocial(x.credential?.appId),
          textColor: "#212121",
          tag: {
            color: statusInfo.color,
            name: statusInfo.name,
          },
          logo: x.credential?.appId,
          contentImage: x?.imagesDataURL,
          time: startDay,
          colorStatus: statusInfo.color,
        };
      });
      setIsLoading(false);
      setData(postsFromDb);
    }
  };

  return (
    <div>
      <HeadSeo title={t("Calendar")} description="Calendar." />
      <Shell
        withoutSeo
        heading={t("Calendar")}
        hideHeadingOnMobile
        subtitle="Manage your Calendar"
        CTA={<div className=" flex"></div>}
      >
        <div className="bg-white mt-[-50px] px-4 rounded-lg pt-5 pb-3 shadow-lg">
          <FullCalendar
            events={events}
            eventClick={onEventClick}
            //select={onDateSelect}
            initialDate={dayjs().format("YYYY-MM-DD")}
            initialView="dayGridMonth"
            height={720}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            eventContent={eventContent}
            editable
            selectable
            selectMirror
            dayMaxEvents
            datesSet={handleDatesSet}
          />
          <div className="mt-2 sm:text-sm text-[8px]">
            <div className="flex items-center gap-2 ">
              <div className="flex items-center">
                <span className="h-4 w-4 rounded-full bg-blue-500 inline-block mr-2"></span>
                <span>Pending</span>
              </div>
              <div className="flex items-center">
                {" "}
                <span className="h-4 w-4 rounded-full bg-gray-300 inline-block mr-2"></span>
                <span>Draft</span>
              </div>
              <div className="flex items-center">
                {" "}
                <span className="h-4 w-4 rounded-full bg-green-500 inline-block mr-2"></span>
                <span>Published / Sent</span>
              </div>
              <div className="flex items-center">
                {" "}
                <span className="h-4 w-4 rounded-full bg-red-400 inline-block mr-2"></span>
                <span>With errors</span>
              </div>
              <div className="flex items-center">
                <span className="h-4 w-4 rounded-full bg-blue-200 inline-block mr-2"></span>
                <span>From autolist</span>
              </div>
            </div>
          </div>
          <div>
            <Dialog
              visible={showDialog}
              style={{ width: "36rem" }}
              modal
              headerClassName="text-900 font-semibold text-xl"
              header={
                <img
                  className="h-10 w-10"
                  src={getIconSocial(changedEvent.title)}
                  alt="Event Logo"
                />
              }
              breakpoints={{ "960px": "75vw", "640px": "90vw" }}
              footer={footer}
              closable
              onHide={() => setShowDialog(false)}
            >
              <>
                {view === "display" ? (
                  <React.Fragment>
                    <span className="text-900 font-semibold block mb-2">
                      Description
                    </span>
                    <span className="block mb-3">
                      {changedEvent.description}
                    </span>
                    {/* {changedEvent?.contentImage && changedEvent?.contentImage.length > 0
                                            &&
                                            <div className="flex justify-center items-center">
                                                <img className="w-[200px]"
                                                    src={changedEvent?.contentImage}
                                                    alt="Event Logo" />
                                            </div>
                                        } */}
                    <div className="grid">
                      <div className="col-6">
                        <div className="text-900 font-semibold mb-2">Start</div>
                        <p className="flex align-items-center items-center mb-2">
                          <i className="pi pi-fw pi-clock text-700 mr-2"></i>
                          <span>
                            {changedEvent.start?.toString().slice(0, 21)}{" "}
                            {`(${timeZone})`}
                          </span>
                        </p>
                      </div>
                      <div className="col-6">
                        <div className="text-900 font-semibold mb-2">End</div>
                        <p className="flex align-items-center items-center mb-2">
                          <i className="pi pi-fw pi-clock text-700 mr-2"></i>
                          <span>
                            {changedEvent.end?.toString().slice(0, 21)}{" "}
                            {`(${timeZone})`}
                          </span>
                        </p>
                      </div>
                      <div className="col-12">
                        <div className="text-900 font-semibold mb-2">
                          Location
                        </div>
                        <p className="flex align-items-center items-center mb-2">
                          <i className="pi pi-fw pi-clock text-700 mr-2"></i>
                          <span>{changedEvent.location}</span>
                        </p>
                      </div>
                      <div className="col-12">
                        <div className="text-900 font-semibold mb-2">
                          Status
                        </div>
                        <p className="flex align-items-center m-0">
                          <span
                            className="inline-flex flex-shrink-0 w-1rem h-1rem mr-2 border-circle"
                            style={{
                              backgroundColor: changedEvent.colorStatus,
                            }}
                          ></span>
                          <span>{changedEvent.tag?.name}</span>
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                ) : (
                  <div className="grid p-fluid formgrid">
                    <div className="col-12 md:col-6 field">
                      <label htmlFor="title" className="text-900 font-semibold">
                        Title
                      </label>
                      <span className="p-input-icon-left">
                        <i className="pi pi-pencil"></i>
                        <InputText
                          className="pl-[35px] rounded-lg border-slate-200"
                          id="title"
                          value={changedEvent.title}
                          onChange={(e) =>
                            setChangedEvent((prevState: any) => ({
                              ...prevState,
                              title: e.target.value,
                            }))
                          }
                          type="text"
                          placeholder="Title"
                        />
                      </span>
                    </div>
                    <div className="col-12 mt-2 md:col-6 field">
                      <label
                        htmlFor="location"
                        className="text-900 font-semibold"
                      >
                        Location
                      </label>
                      <span className="p-input-icon-left">
                        <i className="pi pi-map-marker"></i>
                        <InputText
                          className="pl-[35px] rounded-lg border-slate-200"
                          id="location"
                          value={changedEvent.location}
                          onChange={(e) =>
                            setChangedEvent((prevState: any) => ({
                              ...prevState,
                              location: e.target.value,
                            }))
                          }
                          type="text"
                          placeholder="Location"
                        />
                      </span>
                    </div>
                    <div className="col-12 mt-2 field">
                      <label
                        htmlFor="description"
                        className="text-900 font-semibold"
                      >
                        Event Description
                      </label>
                      <InputTextarea
                        className="rounded-lg border-slate-200"
                        id="description"
                        rows={5}
                        value={changedEvent.description}
                        onChange={(e) =>
                          setChangedEvent((prevState: any) => ({
                            ...prevState,
                            description: e.target.value,
                          }))
                        }
                        style={{ resize: "none" }}
                      ></InputTextarea>
                    </div>

                    <div className="col-12 mt-2 md:col-6 field">
                      <label htmlFor="start" className="text-900 font-semibold">
                        Start Date
                      </label>
                      <PRCalendar
                        id="start"
                        maxDate={changedEvent.end as Date}
                        value={changedEvent.start as Date}
                        onChange={(e) =>
                          setChangedEvent((prevState: any) => ({
                            ...prevState,
                            start: e.value as DateInput | undefined,
                          }))
                        }
                        showTime
                        required
                      />
                    </div>
                    <div className="col-12 mt-2 md:col-6 field">
                      <label htmlFor="end" className="text-900 font-semibold">
                        End Date
                      </label>
                      <PRCalendar
                        id="end"
                        minDate={changedEvent.start as Date}
                        value={changedEvent.end as Date}
                        onChange={(e) =>
                          setChangedEvent((prevState: any) => ({
                            ...prevState,
                            end: e.value as DateInput,
                          }))
                        }
                        showTime
                        required
                      />
                    </div>
                    <div className="col-12 mt-2 field">
                      <label
                        htmlFor="company-color"
                        className="text-900 font-semibold"
                      >
                        Color
                      </label>
                      <Dropdown
                        className="border-1"
                        inputId="company-color"
                        value={changedEvent.tag}
                        options={tags}
                        onChange={(e) =>
                          setChangedEvent((prevState: any) => ({
                            ...prevState,
                            tag: e.value,
                          }))
                        }
                        optionLabel="name"
                        placeholder="Select a Tag"
                        valueTemplate={selectedItemTemplate}
                        itemTemplate={itemOptionTemplate}
                      />
                    </div>
                  </div>
                )}
              </>
            </Dialog>
          </div>
        </div>
        <>
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <DialogLoading open={isLoading}>
                <DialogContent>
                  <div className="text-center">
                    <svg
                      className="bg-awst text-awst mx-auto mb-3 h-8 w-8 animate-spin"
                      viewBox="0 0 24 24"
                    ></svg>
                    <p className="text-default ml-2 text-[16px]">Loading...</p>
                  </div>
                </DialogContent>
              </DialogLoading>
            </div>
          )}
        </>
      </Shell>
    </div>
  );
};

CalendarPage.PageWrapper = PageWrapper;

export default CalendarPage;
