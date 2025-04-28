import axios from "axios";
import router from "next/router";
import { ChangeEvent } from "react";
import toast from "react-hot-toast";

// import { WEBAPP_URL } from "@quillsocial/lib/constants";
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL 
export const uploadVideoGcp = async (event: ChangeEvent, callback: (result: boolean) => void) => {
    if (event.target instanceof HTMLInputElement && event.target?.files && event.target.files[0]) {
        const body = new FormData();
        const document = event.target.files[0];
        const fileName: string = event.target.files[0].name;

        if (!fileName.endsWith("mp4")) {
            toast.error("Only mp4 file support");
            callback(false);
            return;
        }
        body.append("cloudFiles", document || "");
        try {
            const response = await toast.promise(
                axios.post(WEBAPP_URL + "/api/files/upload", body, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }),
                {
                    loading: "Uploading...",
                    success: `${fileName} was uploaded successfully.`,
                    error: "Failed to upload video",
                }
            );

            if (!response.data) {
                console.error("Upload video file failed", response.data);
                callback(false);
            }

            callback(response.data);
        } catch (err: any) {
            console.error("Failed to upload video", err);
            callback(false);
        }
    }
};
