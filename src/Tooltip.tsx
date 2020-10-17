import React, {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Portal from "./Portal";
import styled from "@emotion/styled";
import { CSSTransition } from "react-transition-group";

const basePadding = 12;
interface Props {
  bottom?: boolean;
  replace?: boolean;
  content: React.ReactNode;
}

const ARROW_SIZE = 5;
const PADDING = 3;
const MAX_WIDTH = 200;
const TRANSITION_DURATION = 150;
const EDGE_BUFFER = 6;

const TooltipContainerOuter = styled.div`
  position: fixed;
  z-index: 100;
  width: 100%;
`;

const TooltipContainerInner = styled.div`
  width: 100%;
  margin-left: -50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  perspective: 100px;
`;

const TooltipContainerInnerTop = styled(TooltipContainerInner)`
  margin-bottom: ${ARROW_SIZE}px;
`;

const TooltipContainerInnerBottom = styled(TooltipContainerInner)`
  margin-top: ${ARROW_SIZE}px;
`;

const TooltipBox = styled.div`
  max-width: ${MAX_WIDTH}px;
  background-color: #555;
  color: #eee;
  font-size: 12px;
  font-weight: 400;
  padding: ${basePadding / 2}px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  text-align: center;

  position: relative;
  transform-origin: 50% 100%;
  transition: transform ${TRANSITION_DURATION}ms,
    opacity ${TRANSITION_DURATION}ms;
  opacity: 0;
  .tooltip-enter &,
  .tooltip-enter-done & {
    transform: translateZ(0);
    opacity: 1;
  }
`;

const TooltipBoxTop = styled(TooltipBox)`
  transform: translateY(-4px);
`;

const TooltipBoxBottom = styled(TooltipBox)`
  transform: translateY(4px);
`;

const TooltipArrow = styled.div`
  position: absolute;
  left: 50%;
  margin-left: -${ARROW_SIZE}px;
  border-style: solid;
  border-color: #555 transparent;
`;

const TooltipArrowTop = styled(TooltipArrow)`
  bottom: -${ARROW_SIZE}px;
  border-width: ${ARROW_SIZE}px ${ARROW_SIZE}px 0;
`;

const TooltipArrowBottom = styled(TooltipArrow)`
  top: -${ARROW_SIZE}px;
  border-width: 0 ${ARROW_SIZE}px ${ARROW_SIZE}px;
`;

const Tooltip: FC<Props> = (props) => {
  const [isMousedOver, setIsMousedOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [center, setCenter] = useState(0);
  const [boxHeight, setBoxHeight] = useState(20);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [delay, setDelay] = useState(0);

  const box = useRef<HTMLDivElement>(null);
  const element = useRef<HTMLSpanElement>(null);

  const calculatePosition = useCallback(() => {
    if (!element.current) return;
    const {
      top,
      left,
      width,
      height,
    } = element.current.getBoundingClientRect();
    setBottom(top + height);
    setTop(top);
    const center = left + width / 2;
    setCenter(center);
    if (!box.current) {
      // Initially assume height of 20
      setBoxHeight(20 + ARROW_SIZE);
    } else {
      const boxRect = box.current.getBoundingClientRect();
      setBoxHeight(boxRect.height + ARROW_SIZE);
      // Check if box goes off edge
      const left = center - boxRect.width / 2;
      const right = center + boxRect.width / 2;
      if (left < EDGE_BUFFER) {
        setHorizontalOffset(EDGE_BUFFER - left);
      } else if (right > window.innerWidth) {
        setHorizontalOffset(window.innerWidth - EDGE_BUFFER - right);
      } else {
        setHorizontalOffset(0);
      }
    }
  }, [
    element,
    box,
    setBottom,
    setTop,
    setCenter,
    setBoxHeight,
    setHorizontalOffset,
  ]);

  useEffect(() => {
    if (!delay) return;
    const timeout1 = setTimeout(() => calculatePosition(), 1);
    const timeout2 = setTimeout(() => {
      setDelay(0);
      if (!isMousedOver && !isFocused) return;
      setIsOpen(true);
      calculatePosition();
    }, delay);
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [delay, isMousedOver, isFocused, setIsOpen, calculatePosition, setDelay]);

  const cancel = useCallback(() => {
    if (isMounted && !isOpen) setIsMounted(false);
  }, [isMounted, isOpen, setIsMounted]);

  const handleMouseOver = useCallback(() => {
    setIsMounted(true);
    setIsMousedOver(true);
    setDelay(300);
  }, [setIsMounted, setIsMousedOver, setDelay]);

  const handleMouseOut = useCallback(() => {
    setIsMousedOver(false);
    cancel();
  }, [setIsMousedOver, cancel]);

  const handleFocus = useCallback(() => {
    setIsMounted(true);
    setIsFocused(true);
    setDelay(1);
  }, [setIsMounted, setIsFocused, setDelay]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    cancel();
  }, [setIsFocused, cancel]);

  const remove = useCallback(() => {
    setIsMounted(false);
    setIsOpen(false);
  }, [setIsMounted, setIsOpen]);

  const shouldShow = isOpen && (isMousedOver || isFocused);
  const containerTop = useMemo(() => {
    if (props.bottom) return bottom + PADDING;
    return top - boxHeight - PADDING;
  }, [props.bottom, top, boxHeight, bottom]);

  if (!props.content) return (props.children || null) as ReactElement;

  let toRender: ReactElement;
  if (props.replace) {
    const child = React.Children.only(props.children);
    if (!React.isValidElement(child)) return null;
    const newChild = React.cloneElement(child, {
      onMouseOver: handleMouseOver,
      onMouseOut: handleMouseOut,
      onFocus: handleFocus,
      onBlur: handleBlur,
      tabIndex: "0",
      ref: element,
      key: "content",
    });
    toRender = newChild;
  } else {
    toRender = (
      <span
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={0}
        ref={element}
        key="content"
      >
        {props.children}
      </span>
    );
  }

  const isTop = !props.bottom;

  const TooltipBox = isTop ? TooltipBoxTop : TooltipBoxBottom;
  const TooltipContainerInner = isTop
    ? TooltipContainerInnerTop
    : TooltipContainerInnerBottom;
  const TooltipArrow = isTop ? TooltipArrowTop : TooltipArrowBottom;

  return (
    <>
      {toRender}
      <Portal key="portal">
        {isMounted ? (
          <CSSTransition
            in={shouldShow}
            classNames="tooltip"
            timeout={TRANSITION_DURATION}
            onExited={() => remove()}
          >
            <TooltipContainerOuter style={{ top: containerTop, left: center }}>
              <TooltipContainerInner>
                <TooltipBox
                  ref={box}
                  style={{
                    left: horizontalOffset,
                  }}
                >
                  <TooltipArrow
                    style={{
                      transform: `translateX(${-horizontalOffset}px)`,
                    }}
                  />
                  {props.content}
                </TooltipBox>
              </TooltipContainerInner>
            </TooltipContainerOuter>
          </CSSTransition>
        ) : null}
      </Portal>
    </>
  );
};

export default Tooltip;
