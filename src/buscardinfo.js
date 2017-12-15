var React = require('react');
var ReactDOM = require('react-dom');
var BuscardRecord = require('./buscardrecord');


var BuscardInfo = React.createClass({
  render: function() {
    return (
      <div>
      <BuscardRecord/>
      </div>
    )
  }
});

ReactDOM.render(
  <BuscardInfo/>,
  document.getElementById("root")
);
