import React from "react";

export namespace promptDisplay {
  export type Props = {
    endTest: boolean;
    visibility: boolean;
    children: React.ReactNode;
  };
}

export const promptDisplay: React.FC<promptDisplay.Props> = (props) => {
  const {} = props;
  return <>promptDisplay</>;
};
