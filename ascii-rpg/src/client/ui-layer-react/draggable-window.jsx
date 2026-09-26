import { useLayoutEffect, useRef } from "react";
import { WindowBackdrop } from "./tutorial-windows.jsx";

export function DraggableWindow({ id, title, position, onPositionChange, onClose, getWindowPosition, className = "lighting_window", titlebarClassName = "lighting_window_titlebar", bodyClassName = "lighting_window_body", showCloseButton = true, showBackdrop = true, closeOnBackdropClick = true, children }) {
  const windowRef = useRef(null);
  const dragStartRef = useRef(null);
  const clampPosition = (nextPosition) => {
    const rect = windowRef.current?.getBoundingClientRect();
    return getWindowPosition(nextPosition, { width: rect?.width ?? 360, height: rect?.height ?? 320 });
  };
  useLayoutEffect(() => {
    const keepWindowReachable = () => onPositionChange((currentPosition) => clampPosition(currentPosition));
    keepWindowReachable();
    window.addEventListener("resize", keepWindowReachable);
    return () => window.removeEventListener("resize", keepWindowReachable);
  }, []);
  const beginDrag = (event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); dragStartRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, position }; };
  const moveDrag = (event) => { const drag = dragStartRef.current; if (!drag || drag.pointerId !== event.pointerId) return; onPositionChange(clampPosition({ left: drag.position.left + event.clientX - drag.x, top: drag.position.top + event.clientY - drag.y })); };
  const endDrag = (event) => { if (dragStartRef.current?.pointerId === event.pointerId) dragStartRef.current = null; };
  const titleId = `${id}_title`;
  return <><WindowBackdrop visible={showBackdrop} closesOnClick={closeOnBackdropClick} onClose={onClose} /><section ref={windowRef} id={id} className={className} aria-labelledby={titleId} style={position} onClick={(event) => event.stopPropagation()}><div className={titlebarClassName} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onLostPointerCapture={endDrag}><div id={titleId} className="corner_title">{title}</div>{showCloseButton ? <button className="corner_body settings_option lighting_window_close" type="button" aria-label={`Close ${title}`} tabIndex={-1} onPointerDown={(event) => event.stopPropagation()} onClick={onClose}>X</button> : null}</div><div className={bodyClassName}>{children}</div></section></>;
}
