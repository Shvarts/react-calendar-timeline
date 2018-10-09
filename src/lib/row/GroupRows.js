export function groupRows(
  canvasWidth,
  lineCount,
  groupHeights,
  onRowClick,
  onRowDoubleClick,
  clickTolerance,
  groups,
  horizontalLineClassNamesForGroup,
  onRowContextClick) {
    let lines = []
    let lineHeight = 0

    for (let i = 0; i < lineCount; i++) {
      lineHeight = lineHeight + groupHeights[i];

      lines.push(
          {
            isGroupRow: true,
            order: i,
            clickTolerance: clickTolerance,
            onContextMenu: onRowContextClick,
            onClick: onRowClick,
            onDoubleClick: onRowDoubleClick,
            key: "horizontal-line-" + i,
            isEvenRow: i % 2 === 0,
            group: groups[i],
            horizontalLineClassNamesForGroup: horizontalLineClassNamesForGroup,
            width: canvasWidth,
            height: groupHeights[i] - 1,
            top: lineHeight,
            left: 0
          }
      )
    }

    return lines;
}