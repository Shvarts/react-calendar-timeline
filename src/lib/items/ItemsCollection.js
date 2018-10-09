import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Collection } from 'react-virtualized';
import { _get, arraysEqual, keyBy } from '../utility/generic';
import Item from './Item'
import { getGroupOrders, getVisibleItems } from '../utility/calendar'
import { columns } from '../columns/Columns'
import { groupRows } from '../row/GroupRows'
import GroupRow from '../row/GroupRow'

const canResizeLeft = (item, canResize) => {
    const value =
        _get(item, 'canResize') !== undefined ? _get(item, 'canResize') : canResize
    return value === 'left' || value === 'both'
}
  
const canResizeRight = (item, canResize) => {
    const value =
        _get(item, 'canResize') !== undefined ? _get(item, 'canResize') : canResize
    return value === 'right' || value === 'both' || value === true
}

export default class ItemsCollection extends Component {  
    static propTypes = {
        groups: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
        items: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,

        canvasTimeStart: PropTypes.number.isRequired,
        canvasTimeEnd: PropTypes.number.isRequired,
        canvasWidth: PropTypes.number.isRequired,

        dragSnap: PropTypes.number,
        minResizeWidth: PropTypes.number,
        selectedItem: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

        canChangeGroup: PropTypes.bool.isRequired,
        canMove: PropTypes.bool.isRequired,
        canResize: PropTypes.oneOf([true, false, 'left', 'right', 'both']),
        canSelect: PropTypes.bool,

        keys: PropTypes.object.isRequired,

        moveResizeValidator: PropTypes.func,
        itemSelect: PropTypes.func,
        itemDrag: PropTypes.func,
        itemDrop: PropTypes.func,
        itemResizing: PropTypes.func,
        itemResized: PropTypes.func,

        onItemDoubleClick: PropTypes.func,
        onItemContextMenu: PropTypes.func,

        itemRenderer: PropTypes.func,
        selected: PropTypes.array,

        dimensionItems: PropTypes.array,
        topOffset: PropTypes.number,
        groupTops: PropTypes.array,
        useResizeHandle: PropTypes.bool
    }

    static defaultProps = {
        selected: []
    }

    shouldComponentUpdate(nextProps) {
        return !(
          arraysEqual(nextProps.groups, this.props.groups) &&
          arraysEqual(nextProps.items, this.props.items) &&
          nextProps.keys === this.props.keys &&
          nextProps.canvasTimeStart === this.props.canvasTimeStart &&
          nextProps.canvasTimeEnd === this.props.canvasTimeEnd &&
          nextProps.canvasWidth === this.props.canvasWidth &&
          nextProps.selectedItem === this.props.selectedItem &&
          nextProps.selected === this.props.selected &&
          nextProps.dragSnap === this.props.dragSnap &&
          nextProps.minResizeWidth === this.props.minResizeWidth &&
          nextProps.canChangeGroup === this.props.canChangeGroup &&
          nextProps.canMove === this.props.canMove &&
          nextProps.canResize === this.props.canResize &&
          nextProps.canSelect === this.props.canSelect &&
          nextProps.dimensionItems === this.props.dimensionItems &&
          nextProps.topOffset === this.props.topOffset
        )
    }

    getGroupOrders() {
        const { keys, groups } = this.props
        
        return getGroupOrders(groups, keys)
    }

    isSelected(item, itemIdKey) {
        if (!this.props.selected) {
            return this.props.selectedItem === _get(item, itemIdKey)
        } else {
            let target = _get(item, itemIdKey)
            return this.props.selected.includes(target)
        }
    }

    getVisibleItems(canvasTimeStart, canvasTimeEnd) {
        const { keys, items } = this.props

        return getVisibleItems(items, canvasTimeStart, canvasTimeEnd, keys)
    }
    
    render() {
        const {
            canvasTimeStart,
            canvasTimeEnd,
            dimensionItems,
            height,
            width,
            canvasWidth,
            timeSteps,
            minUnit,
            verticalLineClassNamesForTime,
            lineCount,
            groupHeights,
            onRowClick, 
            onRowDoubleClick, 
            clickTolerance, 
            groups, 
            horizontalLineClassNamesForGroup, 
            onRowContextClick
          } = this.props
          const { itemIdKey, itemGroupKey } = this.props.keys
          const groupOrders = this.getGroupOrders()
          const visibleItems = this.getVisibleItems(
            canvasTimeStart,
            canvasTimeEnd,
            groupOrders
          )
        const columnsList = columns(canvasTimeStart, canvasTimeEnd, canvasWidth, minUnit, timeSteps, height, verticalLineClassNamesForTime);
        const groupRowsList = groupRows(canvasWidth, lineCount, groupHeights, onRowClick, onRowDoubleClick, clickTolerance, groups, horizontalLineClassNamesForGroup, onRowContextClick);

        let visibleItemsNew = columnsList.concat(visibleItems);
        let dimensionItemsNew = columnsList.concat(dimensionItems);
        visibleItemsNew = visibleItemsNew.concat(groupRowsList);
        dimensionItemsNew = dimensionItemsNew.concat(groupRowsList);

        const sortedDimensionItems = keyBy(dimensionItemsNew, 'id')

        const cellRenderer = ({ index, key, style }) => {
            const item = visibleItemsNew[index];
            
            if (item && item.isGroupRow) {
                return (
                    <GroupRow
                        key={key}
                        order={item.order}
                        clickTolerance={item.clickTolerance}
                        onContextMenu={item.onContextMenu}
                        onClick={item.onClick}
                        onDoubleClick={item.onDoubleClick}
                        key={item.key}
                        isEvenRow={item.isEvenRow}
                        group={item.group}
                        horizontalLineClassNamesForGroup={item.horizontalLineClassNamesForGroup}
                        style={style}
                    />);
            } else if (item && item.isColumns) {
                return (<div
                    key={key}
                    className={item.className}
                    style={style}
                />);
            } else {
                return (
                    item && sortedDimensionItems[_get(item, itemIdKey)] &&
                        <Item
                            key={key}
                            style={style}
                            item={item}
                            keys={this.props.keys}
                            order={groupOrders[dimensionItemsNew[index].dimensions.order]}
                            dimensions={
                                sortedDimensionItems[_get(item, itemIdKey)].dimensions
                            }
                            selected={this.isSelected(item, itemIdKey)}
                            canChangeGroup={
                            _get(item, 'canChangeGroup') !== undefined
                                ? _get(item, 'canChangeGroup')
                                : this.props.canChangeGroup
                            }
                            canMove={
                            _get(item, 'canMove') !== undefined
                                ? _get(item, 'canMove')
                                : this.props.canMove
                            }
                            canResizeLeft={canResizeLeft(item, this.props.canResize)}
                            canResizeRight={canResizeRight(item, this.props.canResize)}
                            canSelect={
                                _get(item, 'canSelect') !== undefined
                                    ? _get(item, 'canSelect')
                                    : this.props.canSelect
                                }
                                useResizeHandle={this.props.useResizeHandle}
                                topOffset={this.props.topOffset}
                                groupTops={this.props.groupTops}
                                canvasTimeStart={this.props.canvasTimeStart}
                                canvasTimeEnd={this.props.canvasTimeEnd}
                                canvasWidth={this.props.canvasWidth}
                                dragSnap={this.props.dragSnap}
                                minResizeWidth={this.props.minResizeWidth}
                                onResizing={this.props.itemResizing}
                                onResized={this.props.itemResized}
                                moveResizeValidator={this.props.moveResizeValidator}
                                onDrag={this.props.itemDrag}
                                onDrop={this.props.itemDrop}
                                onItemDoubleClick={this.props.onItemDoubleClick}
                                onContextMenu={this.props.onItemContextMenu}
                                onSelect={this.props.itemSelect}
                                itemRenderer={this.props.itemRenderer}
                            />
                    )
                }
        }
        
        const cellSizeAndPositionGetter = ({ index }) => {
            const datum = dimensionItemsNew[index].dimensions || dimensionItemsNew[index]

            return {
                height: datum.height,
                width: datum.width,
                x: datum.left,
                y: datum.top
            }
        }  

        return (
            <Collection
                cellCount={dimensionItemsNew.length}
                cellRenderer={cellRenderer}
                cellSizeAndPositionGetter={cellSizeAndPositionGetter}
                height={window.innerHeight}
                width={canvasWidth}
                horizontalOverscanSize={10}
                verticalOverscanSize={1}
            />
        )
    }
}
