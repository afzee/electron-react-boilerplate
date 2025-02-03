import React from "react";

export namespace Letter {
  export type Props = {
    isTyped: boolean;
    isCorrect: boolean;
    untypedColor?: `#${string}`;
    typedColor: `#${string}`;
    incorrectColor: `#${string}`;
    children: React.ReactNode;
  };
}

export const Letter: React.FC<Letter.Props> = (props) => {
  const {
    isTyped,
    isCorrect,
    typedColor = "#828282",
    untypedColor = "#FFF",
    incorrectColor = "#FF0000",
    isSpace = false,
    children,
  } = props;
  return (
    <span
      style={{
        color: !isTyped ? untypedColor : isCorrect ? typedColor : incorrectColor,
      }}
    >
      {children}
    </span>
  );
};
