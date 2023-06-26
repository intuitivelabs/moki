import { CSSProperties, MutableRefObject, SetStateAction, useEffect, useRef } from "react";
import { IconX } from "@tabler/icons-react";

function useDraggable(
  windowRef: React.RefObject<HTMLElement>,
  dragRef: React.RefObject<HTMLElement>,
  { offsetX = 0, offsetY = 0, deps }: {
    offsetX?: number;
    offsetY?: number;
    deps: React.DependencyList;
  },
) {
  const offset = useRef({ x: 0, y: 0 });

  const handleDown = (e: MouseEvent) => {
    const element = windowRef.current;
    if (!element) return;
    e = e || window.event;
    e.preventDefault();

    const rect = windowRef.current.getBoundingClientRect();
    offset.current.x = e.clientX - rect.x + offsetX;
    offset.current.y = e.clientY - rect.y + offsetY;
    document.onmouseup = handleUp;
    document.onmousemove = handleMove;
  };

  const handleMove = (e: MouseEvent) => {
    const element = windowRef.current;
    if (!element) return;
    e = e || window.event;
    e.preventDefault();

    const x = e.pageX - offset.current.x;
    const y = e.pageY - offset.current.y;
    element.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleUp = () => {
    document.onmouseup = null;
    document.onmousemove = null;
  };

  useEffect(() => {
    const element = dragRef.current;
    if (!element) return;
    element.onmousedown = handleDown;
  }, [dragRef, offsetX, offsetY, ...deps]);
}

interface Props {
  isOpen: boolean;
  setIsOpen: (value: SetStateAction<boolean>) => void;
  floatingStyles: React.CSSProperties;
  pushFront: () => void;
  headerStyle: CSSProperties;
  headerContent: JSX.Element;
  bodyContent: JSX.Element;
  refs: {
    floating: MutableRefObject<HTMLElement | null>;
    setFloating: (node: HTMLElement | null) => void;
  };
}

function DiagramTooltip(
  {
    isOpen,
    setIsOpen,
    floatingStyles,
    refs,
    pushFront,
    headerStyle,
    headerContent,
    bodyContent,
  }: Props,
) {
  const dragRef = useRef<HTMLDivElement>(null);
  useDraggable(refs.floating, dragRef, {
    deps: [isOpen],
  });

  return (
    <>
      {isOpen && (
        <div
          className="tooltipDiagram"
          ref={refs.setFloating}
          style={floatingStyles}
          onMouseDown={pushFront}
        >
          <div
            ref={dragRef}
            style={{
              cursor: "move",
              display: "flex",
              alignItems: "center",
              ...headerStyle,
            }}
          >
            <button
              className="border-0 px-2"
              style={{ background: "none", paddingBottom: "0.3rem" }}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              <IconX size={19} />
            </button>
            {headerContent}
          </div>
          {bodyContent}
        </div>
      )}
    </>
  );
}

export { DiagramTooltip };
