import React, { useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  EmailField,
  HeadSeo,
  Select,
  InputField,
  TextAreaField,
} from "@quillsocial/ui";
import {
  User as UserIcon,
  Pencil,
  Check,
  XCircle,
  MoreHorizontal,
} from "@quillsocial/ui/components/icon";

function EditUnchanged({
  unchangedValue,
  updateUnchangedValue,
}: {
  unchangedValue: any;
  updateUnchangedValue: any;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedValue, setSelectedValue] = useState(unchangedValue);
  const [newValue, setNewValue] = useState("");
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);

    if (selectedValue === "Replace Value") {
      updateUnchangedValue(newValue);
      setNewValue("");
    } else {
      updateUnchangedValue(selectedValue);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setSelectedValue(unchangedValue);
    setNewValue("");
  };

  const handleDropdownChange = (event: any) => {
    setSelectedValue(event.target.value);
  };
  return (
    <div className="flex">
      <div className="mr-2 mt-2">Summary</div>
      {isEditing ? (
        <div className="mr-2 mt-2">
          <select
            className={`border rounded w-[163px] border-gray-100 focus:outline-none focus:border-gray-300`}
            onChange={handleDropdownChange}
            value={selectedValue}
          >
            <option className="" value="Don't Override">
              Don't Override
            </option>
            <option value="Replace Value">Replace Value</option>
          </select>
          {selectedValue === "Replace Value" && (
            <div className="mt-2">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className={`border rounded w-[163px] border-gray-100 focus:outline-none focus:border-gray-300`}
                placeholder="New value"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mr-2 mt-2">{unchangedValue}</div>
      )}
      {isEditing ? (
        <div className="flex">
          <Check className="mt-2 text-awst mr-2" onClick={handleSaveClick} />
          <XCircle className="mt-2 text-awst" onClick={handleCancelClick} />
        </div>
      ) : (
        <Pencil className="mt-2 text-awst" onClick={handleEditClick} />
      )}
    </div>
  );
}

export default EditUnchanged;
