import { FormEvent } from "react";

export interface FileEvent<T = Element> extends FormEvent<T> {
  target: EventTarget & T;
}
