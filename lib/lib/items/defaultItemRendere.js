'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultItemRenderer = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultItemRenderer = exports.defaultItemRenderer = function defaultItemRenderer(_ref) {
  var item = _ref.item,
      timelineContext = _ref.timelineContext,
      itemContext = _ref.itemContext,
      getItemProps = _ref.getItemProps,
      getResizeProps = _ref.getResizeProps;

  var _getResizeProps = getResizeProps(),
      leftResizeProps = _getResizeProps.left,
      rightResizeProps = _getResizeProps.right;

  return _react2.default.createElement(
    'div',
    getItemProps(item.itemProps),
    itemContext.useResizeHandle && itemContext.showInnerContentsRender ? _react2.default.createElement('div', leftResizeProps) : '',
    _react2.default.createElement(
      'div',
      {
        className: 'rct-item-content',
        style: { maxHeight: '' + itemContext.dimensions.height }
      },
      itemContext.title
    ),
    itemContext.useResizeHandle && itemContext.showInnerContentsRender ? _react2.default.createElement('div', rightResizeProps) : ''
  );
};