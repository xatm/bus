var React = require('react');
var ReactDOM = require('react-dom');

var styles = { border: "solid blue 1pt" };

var BuscardRecord = React.createClass({
  displayName: 'BuscardRecord',

  getInitialState: function () {
    return { numbers: [], number: "00008001" };
  },

  //alert(JSON.parse(no)[0]['消费时间']);
  componentDidMount() {
    $.ajax({
      url: "buscard/" + this.state.number,
      type: "get",
      success: function (no) {
        this.setState({
          numbers: JSON.parse(no)
        });
      }.bind(this)
    });
  },

  handleChange: function (event) {
    console.log(event.target);
    this.setState({ number: event.target.value }, () => {
      if (this.state.number.length == 8) $.ajax({
        url: "buscard/" + this.state.number,
        type: "get",
        success: function (no) {
          this.setState({
            numbers: JSON.parse(no)
          });
        }.bind(this)
      });
    });
  },

  render: function () {
    var time = this.state.numbers.map(function (number) {
      return React.createElement(
        'tr',
        null,
        React.createElement(
          'td',
          { style: styles },
          number['卡号']
        ),
        React.createElement(
          'td',
          { style: styles },
          number['消费时间']
        ),
        React.createElement(
          'td',
          { style: styles },
          number['线路']
        ),
        React.createElement(
          'td',
          { style: styles },
          number['车号']
        ),
        React.createElement(
          'td',
          { style: styles },
          number['消费次数']
        ),
        React.createElement(
          'td',
          { style: styles },
          number['剩余次数']
        ),
        React.createElement(
          'td',
          { style: styles },
          number['电子钱包']
        )
      );
    });
    return React.createElement(
      'div',
      null,
      React.createElement('input', { type: 'text', value: this.state.number, onChange: this.handleChange }),
      React.createElement(
        'a',
        null,
        React.createElement(
          'tr',
          null,
          React.createElement(
            'td',
            { style: styles },
            '\u5361\u53F7'
          ),
          React.createElement(
            'td',
            { style: styles },
            '\u6D88\u8D39\u65F6\u95F4'
          ),
          React.createElement(
            'td',
            { style: styles },
            '\u7EBF\u8DEF'
          ),
          React.createElement(
            'td',
            { style: styles },
            '\u8F66\u53F7'
          ),
          React.createElement(
            'td',
            { style: styles },
            '\u6D88\u8D39\u6B21\u6570'
          ),
          React.createElement(
            'td',
            { style: styles },
            '\u5269\u4F59\u6B21\u6570'
          ),
          React.createElement(
            'td',
            { style: styles },
            '\u7535\u5B50\u94B1\u5305'
          )
        ),
        time
      )
    );
  }
});

module.exports = BuscardRecord;