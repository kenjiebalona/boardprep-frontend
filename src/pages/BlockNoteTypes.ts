// BlockNoteTypes.ts

import { Block } from "@blocknote/core";

export type Styles = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  textColor: string;
  backgroundColor: string;
};

export type StyledText = {
  type: "text";
  text: string;
  styles: Styles;
};

export type Link = {
  type: "link";
  content: StyledText[];
  href: string;
};

export type InlineContent = Link | StyledText;

export interface TableContent {
  type: "tableContent";
  rows: {
    cells: InlineContent[][];
  }[];
}

export type MyInlineContentSchema = {
  text: "text";
  link: "link";
};

export type MyStyleSchema = {
  bold: { type: "bold"; propSchema: "boolean" };
  italic: { type: "italic"; propSchema: "boolean" };
};


export type ExtendedBlock = Block & {
  block_type: string;
  block_id: number;
  content: string;
  props: Record<string, any>;
};


export type ImageBlock = {
  id: string;
  type: "image";
  props: {
    url: string;
    caption: string;
    previewWidth: number;
  } & DefaultProps;
  content: undefined;
  children: Block[];
};


export interface DefaultProps {
  [key: string]: any;
}
