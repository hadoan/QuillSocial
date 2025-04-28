import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import { classNames } from "./classNames";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp
} from "@quillsocial/ui/components/icon";
const Accordion = ({
  data,
  height,
  width,
  keyAttr,
  valAttr,
  callback
}: {
  data: any[];
  height: number;
  width: number;
  keyAttr: string;
  valAttr: string;
  callback: (itemTitle: string) => void;
}) => {
  

  const seed = [
    { title: "1", content: "1" },

  ];
  const [current, setCurrent] = useState(null);
  const select = useCallback(
    (i:any) => {
      if (current === i) return setCurrent(null);
      setCurrent(i);
    },
    [current]
  );
  return (
    <div
      className="flex  w-[90%] border shadow border-gray-300  flex-col items-center justify-center  dark:divide-neutral-600 dark:ring-1 dark:ring-neutral-600 text-black bg-white dark:text-white dark:bg-neutral-700/75"
    >
      {seed.map((item, index) => (
        <div className="flex flex-col w-full shadow group" key={index}>
          <div
            className="text-xl flex bg-gray-200  border-gray-400 items-center p-2 justify-between cursor-pointer"
            onClick={() => select(index)}
          >
            <span className="flex text-black"> <img className="h-[20px] mt-1 ml-2 mr-1 w-[20px]" src="/img/GGlogo.svg"></img> trantrungdung@gmail.com</span>
            <span className="mr-2">{current === index ? <ChevronUp /> : <ChevronDown />}</span>
          </div>
          <div
            className={classNames(
              "transition-all duration-500 ease-in-out overflow-auto ",
              current === index ? " border-1 border-gray-700" : ""
            )}
            style={{ maxHeight: current === index ? height : 0 }}
          >
            {data.map((item, index) => (
              <div key={index} className="flex border-t p-2 border-gray-300">
                <input
                  id={`checkbox-${index}`}
                  aria-describedby="comments-description"
                  name="checkbox"
                  type="radio"
                  className="h-4 w-4 mt-1 mr-2 ml-2 rounded text-indigo-600 focus:ring-indigo-600"
                  onChange={() => callback(item.title)}
                />
                {item.title}
              </div>
            ))}


          </div>
        </div>
      ))}
    </div>
  );
};

Accordion.propTypes = {
  height: PropTypes.any,
  width: PropTypes.any,
  keyAttr: PropTypes.any,
  valAttr: PropTypes.any,
};

Accordion.defaultProps = {
  width: 500,
  height: 200,
  keyAttr: "title",
  valAttr: "content",
};

export default Accordion;