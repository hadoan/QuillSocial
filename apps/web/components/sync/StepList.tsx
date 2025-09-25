import Accordion from "./accordion";
import EditUnchanged from "./edit";
import { CheckIcon } from "@heroicons/react/20/solid";
import {
  Alert,
  Avatar,
  Button,
  EmailField,
  HeadSeo,
  InputField,
  Select,
  TextAreaField,
} from "@quillsocial/ui";
import {
  Calendar,
  ArrowRight,
  Edit,
  User as UserIcon,
  Receipt,
  CheckCircle,
  MoreHorizontal,
} from "@quillsocial/ui/components/icon";
import { useRouter } from "next/router";
import React from "react";
import { useState, useEffect } from "react";
import { FaGoogle } from "react-icons/fa";

function StepList(props: any) {
  const { steps } = props;
  const data1 = [
    { title: "nguyenminhtuan@example.com", content: "Content 1" },
    { title: "email3@example.com", content: "Content 1" },
  ];
  const router = useRouter();
  const [unchangedValue, setUnchangedValue] = useState("Unchanged");
  const [unchangedValue1, setUnchangedValue1] = useState("Unchanged1");
  const [unchangedValue2, setUnchangedValue2] = useState("Unchanged2");
  const updateUnchangedValue = (newValue: any) => {
    setUnchangedValue(newValue);
  };
  const updateUnchangedValue1 = (newValue: any) => {
    setUnchangedValue1(newValue);
  };
  const updateUnchangedValue2 = (newValue: any) => {
    setUnchangedValue2(newValue);
  };

  const handleCheckboxChangeInParent = (itemTitle: any) => {};

  const [currentStep, setCurrentStep] = useState(1);
  const minStep = 1;
  const maxStep = 3;

  useEffect(() => {}, [currentStep]);

  const goToNextStep = () => {
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };
  const goToPreviousStep = () => {
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ");
  }
  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {steps.map((step: any, stepIdx: any) => (
          <li
            key={step.name}
            className={classNames(
              stepIdx !== steps.length - 1 ? "pb-10" : "",
              "relative"
            )}
          >
            {step.status === "complete" ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className={`absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 ${
                      currentStep === 2 || currentStep === 3
                        ? "bg-indigo-600"
                        : "bg-gray-300"
                    }`}
                    aria-hidden="true"
                  />
                ) : null}
                <a href={step.href} className="group relative flex items-start">
                  <span className="flex h-9 items-center">
                    {currentStep == 2 || currentStep == 3 ? (
                      <>
                        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                          <CheckIcon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                        </span>
                      </>
                    )}
                  </span>
                  <div className="ml-4  w-full flex min-w-0 flex-col">
                    <div className="text-sm font-medium">{step.name}</div>
                    {currentStep == 1 && (
                      <>
                        <div>
                          <Accordion
                            data={data1}
                            width={500}
                            height={250}
                            keyAttr="title"
                            valAttr="content"
                            callback={handleCheckboxChangeInParent}
                          />
                          <div className="mt-2"></div>
                        </div>
                        <div className="flex justify-items-center justify-center mt-5 items-center">
                          <Button
                            color="secondary"
                            className="justify-center rounded-lg shadow"
                            data-testid="google"
                            onClick={async (e) => {
                              e.preventDefault();
                            }}
                          >
                            <img
                              className="h-[20px] ml-2 mr-1 w-[20px]"
                              src="/img/GGlogo.svg"
                            ></img>{" "}
                            Link another account
                          </Button>
                        </div>
                        <div>
                          {" "}
                          <Button
                            onClick={() => router.push("/sync")}
                            color="secondary"
                            className="ml-4  mt-2"
                          >
                            Back
                          </Button>
                          <Button onClick={goToNextStep} className="ml-2">
                            Next
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </a>
              </>
            ) : step.status === "current" ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className={`absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 ${
                      currentStep === 3 ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                    aria-hidden="true"
                  />
                ) : null}
                <a
                  href={step.href}
                  className="group relative flex items-start"
                  aria-current="step"
                >
                  <span className="flex h-9 items-center" aria-hidden="true">
                    {currentStep == 2 && (
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                        <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                      </span>
                    )}
                    {currentStep == 3 && (
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                        <CheckIcon
                          className="h-5 w-5 text-white"
                          aria-hidden="true"
                        />
                      </span>
                    )}
                    {currentStep == 1 && (
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                      </span>
                    )}
                  </span>
                  <div className="ml-4  w-full flex min-w-0 flex-col">
                    <div className="text-sm font-medium">{step.name}</div>
                    {currentStep == 2 && (
                      <>
                        <div>
                          <Accordion
                            data={data1}
                            width={500}
                            height={250}
                            keyAttr="title"
                            valAttr="content"
                            callback={handleCheckboxChangeInParent}
                          />
                          <div className="mt-2"></div>
                        </div>
                        <div className="flex justify-items-center justify-center mt-5 items-center">
                          <Button
                            color="secondary"
                            className="justify-center rounded-lg shadow"
                            data-testid="google"
                            onClick={async (e) => {
                              e.preventDefault();
                            }}
                          >
                            <img
                              className="h-[20px] ml-2 mr-1 w-[20px]"
                              src="/img/GGlogo.svg"
                            ></img>{" "}
                            Link another account
                          </Button>
                        </div>
                        <div>
                          {" "}
                          <Button
                            onClick={goToPreviousStep}
                            color="secondary"
                            className="ml-4  mt-2"
                          >
                            Back
                          </Button>
                          <Button onClick={goToNextStep} className="ml-2">
                            Next
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </a>
              </>
            ) : (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                    aria-hidden="true"
                  />
                ) : null}
                <a href={step.href} className="group relative flex items-start">
                  <span className="flex h-9 items-center" aria-hidden="true">
                    {currentStep == 3 && (
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                        <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                      </span>
                    )}
                    {(currentStep == 1 || currentStep == 2) && (
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                      </span>
                    )}
                  </span>
                  <div className="ml-4  w-full flex min-w-0 flex-col">
                    <div className="text-sm font-medium">{step.name}</div>
                    {currentStep == 3 && (
                      <>
                        <div>
                          <EditUnchanged
                            unchangedValue={unchangedValue}
                            updateUnchangedValue={updateUnchangedValue}
                          />
                          <EditUnchanged
                            unchangedValue={unchangedValue1}
                            updateUnchangedValue={updateUnchangedValue1}
                          />
                          <EditUnchanged
                            unchangedValue={unchangedValue2}
                            updateUnchangedValue={updateUnchangedValue2}
                          />
                        </div>
                        <div className="flex justify-items-center justify-center mt-5 items-center">
                          <Button
                            color="secondary"
                            className="justify-center rounded-lg shadow"
                            data-testid="google"
                            onClick={async (e) => {
                              e.preventDefault();
                            }}
                          >
                            <img
                              className="h-[20px] ml-2 mr-1 w-[20px]"
                              src="/img/GGlogo.svg"
                            ></img>{" "}
                            Link another account
                          </Button>
                        </div>
                        <div>
                          {" "}
                          <Button
                            onClick={goToPreviousStep}
                            color="secondary"
                            className="ml-4  mt-2"
                          >
                            Back
                          </Button>
                          <Button className="ml-2">Finish</Button>
                        </div>
                      </>
                    )}
                  </div>
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default StepList;
