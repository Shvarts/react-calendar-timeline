/* eslint-disable no-console */
import React, { Component } from 'react'
import moment from 'moment'

import Timeline, {
  TimelineMarkers,
  TodayMarker,
  CustomMarker,
  CursorMarker
} from 'react-calendar-timeline'

import generateFakeData from '../generate-fake-data'

var minTime = moment()
  .add(-6, 'months')
  .valueOf()
var maxTime = moment()
  .add(6, 'months')
  .valueOf()

var keys = {
  groupIdKey: "id",
  groupTitleKey: "title",
  groupRightTitleKey: "rightTitle",
  itemIdKey: "id",
  itemTitleKey: "title",
  itemDivTitleKey: "title",
  itemGroupKey: "group",
  itemTimeStartKey: "start",
  itemTimeEndKey: "end"
};

export default class App extends Component {
  constructor(props) {
    super(props)

    const { groups, items } = generateFakeData()
    const defaultTimeStart = moment()
      .startOf('day')
      .toDate()
    const defaultTimeEnd = moment()
      .startOf('day')
      .add(1, 'day')
      .toDate()

    this.state = {
      groups,
      items: items.slice(11),
      unavaliableItems: items.slice(0, 10).map(item => ({
        ...item,
        start: moment(item.start),
        end: moment(item.end)
      })),
      defaultTimeStart,
      defaultTimeEnd
    }
  }

  handleCanvasClick = (groupId, time) => {
    console.log('Canvas clicked', groupId, moment(time).format())
  }

  handleCanvasDoubleClick = (groupId, time) => {
    console.log('Canvas double clicked', groupId, moment(time).format())
  }

  handleCanvasContextMenu = (group, time) => {
    console.log('Canvas context menu', group, moment(time).format())
  }

  handleItemClick = (itemId, _, time) => {
    console.log('Clicked: ' + itemId, moment(time).format())
  }

  handleItemSelect = (itemId, _, time) => {
    console.log('Selected: ' + itemId, moment(time).format())
  }

  handleItemDoubleClick = (itemId, _, time) => {
    console.log('Double Click: ' + itemId, moment(time).format())
  }

  handleItemContextMenu = (itemId, _, time) => {
    console.log('Context Menu: ' + itemId, moment(time).format())
  }

  handleItemMove = (itemId, dragTime, newGroupOrder) => {
    const { items, groups } = this.state

    const group = groups[newGroupOrder]

    this.setState({
      items: items.map(
        item =>
          item.id === itemId
            ? Object.assign({}, item, {
                start: dragTime,
                end: dragTime + (item.end - item.start),
                group: group.id
              })
            : item
      )
    })

    console.log('Moved', itemId, dragTime, newGroupOrder)
  }

  handleItemResize = (itemId, time, edge) => {
    const { items } = this.state

    this.setState({
      items: items.map(
        item =>
          item.id === itemId
            ? Object.assign({}, item, {
                start: edge === 'left' ? time : item.start,
                end: edge === 'left' ? item.end : time
              })
            : item
      )
    })

    console.log('Resized', itemId, time, edge)
  }

  // this limits the timeline to -6 months ... +6 months
  handleTimeChange = (visibleTimeStart, visibleTimeEnd, updateScrollCanvas) => {
    if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
      updateScrollCanvas(minTime, maxTime)
    } else if (visibleTimeStart < minTime) {
      updateScrollCanvas(minTime, minTime + (visibleTimeEnd - visibleTimeStart))
    } else if (visibleTimeEnd > maxTime) {
      updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime)
    } else {
      updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
    }
  }

  moveResizeValidator = (action, item, time) => {
    if (time < new Date().getTime()) {
      var newTime =
        Math.ceil(new Date().getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000)
      return newTime
    }

    return time
  }

  render() {
    const { groups, items, defaultTimeStart, defaultTimeEnd } = this.state

    return (
      <Timeline
        groups={groups}
        items={items}
        keys={keys}
        sidebarWidth={150}
        sidebarContent={<div>Above The Left</div>}
        canMove
        canResize="right"
        canSelect
        itemsSorted
        itemTouchSendsClick={false}
        stackItems
        itemHeightRatio={0.75}
        defaultTimeStart={defaultTimeStart}
        defaultTimeEnd={defaultTimeEnd}
        onCanvasClick={this.handleCanvasClick}
        onCanvasDoubleClick={this.handleCanvasDoubleClick}
        onCanvasContextMenu={this.handleCanvasContextMenu}
        onItemClick={this.handleItemClick}
        onItemSelect={this.handleItemSelect}
        onItemContextMenu={this.handleItemContextMenu}
        onItemMove={this.handleItemMove}
        onItemResize={this.handleItemResize}
        onItemDoubleClick={this.handleItemDoubleClick}
        onTimeChange={this.handleTimeChange}
        moveResizeValidator={this.moveResizeValidator}
      >
        <TimelineMarkers>
          <TodayMarker />
          <CustomMarker
            date={
              moment()
                .startOf('day')
                .valueOf() +
              1000 * 60 * 60 * 2
            }
          />
          <CustomMarker
            date={moment()
              .add(3, 'day')
              .valueOf()}
          >
            {({ styles }) => {
              const newStyles = { ...styles, backgroundColor: 'blue' }
              return <div style={newStyles} />
            }}
          </CustomMarker>
          <CursorMarker />
        </TimelineMarkers>
        <UnavailableLayer unavailableItems={this.state.unavaliableItems} />
      </Timeline>
    )
  }
}


class UnavailableLayer extends React.PureComponent {
  state = {
    items: []
  };

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.visibleTimeStart !== this.props.visibleTimeStart ||
      nextProps.canvasTimeStart !== this.props.canvasTimeStart ||
      nextProps.canvasTimeEnd !== this.props.canvasTimeEnd ||
      nextProps.canvasTimeStart !== this.props.canvasTimeStart ||
      nextProps.canvasWidth !== this.props.canvasWidth ||
      nextProps.unavailableItems !== this.props.unavailableItems ||
      nextProps.groups !== this.props.groups
    ) {
      this.setState({
        items: nextProps.unavailableItems
          .map(unavailableItem => {
            const diff = unavailableItem ? unavailableItem.start.diff(moment(nextProps.visibleTimeStart)) : 0;
            const ratio = nextProps.canvasWidth / (nextProps.canvasTimeEnd - nextProps.canvasTimeStart);
            const pageOffset =
              ((nextProps.visibleTimeStart - nextProps.canvasTimeStart) /
                (nextProps.canvasTimeEnd - nextProps.canvasTimeStart)) *
              nextProps.canvasWidth;
            const currentPageOffset = diff * ratio;
            const itemWidth = unavailableItem.end.diff(unavailableItem.start) * ratio;
            const index = nextProps.groups.findIndex(group => group.id === unavailableItem.group);
            return {
              left: pageOffset + currentPageOffset,
              width: itemWidth,
              groupIndex: index
            };
          })
          .filter(item => item.groupIndex > -1)
      });
    }
  }

  render() {
    const { groupTops, groupHeights } = this.props;
    console.log(this.state.items);
    return (
      <div>
        {this.state.items.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "red",
              position: "absolute",
              top: groupTops[item.groupIndex],
              height: groupHeights[item.groupIndex],
              left: item.left,
              width: item.width,
              zIndex: 20,
              overflow: "hidden"
            }}
          />
        ))}
      </div>
    );
  }
}
