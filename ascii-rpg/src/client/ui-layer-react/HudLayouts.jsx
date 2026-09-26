const cornerPositions = Object.freeze({
  "top-left": "corner_top_left",
  "top-right": "corner_top_right",
  "bottom-left": "corner_bottom_left",
  "bottom-right": "corner_bottom_right",
});

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

export function CornerLayout({ position, className, children, ...props }) {
  return (
    <div
      {...props}
      data-ui-space-exclusion="true"
      className={joinClassNames("corner", cornerPositions[position], className)}
    >
      {children}
    </div>
  );
}

export function BoxLayout({ action, actionPosition = "bottom", className, children, ...props }) {
  return (
    <div {...props} className={joinClassNames("box_layout", className)}>
      {children}
      {action ? <div className={joinClassNames("box_layout_action", `box_layout_action_${actionPosition}`)}>{action}</div> : null}
    </div>
  );
}

export function HudBlockLayout({
  title,
  titleId,
  titleClassName,
  bodyClassName,
  className,
  children,
  as: Element = "section",
  ...props
}) {
  return (
    <Element {...props} className={joinClassNames("hud_block", className)}>
      {title ? <div id={titleId} className={joinClassNames("hud_block_title", titleClassName)}>{title}</div> : null}
      <div className={joinClassNames("hud_block_body", bodyClassName)}>{children}</div>
    </Element>
  );
}
